import { gzipSync } from 'fflate';
import { eventHandler, getQuery, createError, setResponseHeader } from 'h3';
import { getLoadError, getSubtitles, isSubtitlesLoaded } from '../utils/subtitles';
import type { SearchResult } from 'minisearch';
import type {
	MatchHighlight,
	SearchResult as SearchResultResponse,
	ServerResponse,
	SubtitleLine,
	SubtitleMatch
} from 'jerma-subtitle-search-types';

export default eventHandler((event) => {
	const startTime = performance.now();

	if (!isSubtitlesLoaded()) {
		const error = getLoadError();
		if (error) {
			throw createError({
				statusCode: 500,
				message: 'Subtitles failed to load',
				data: { error: error.message }
			});
		}
		throw createError({
			statusCode: 503,
			message: 'Subtitles are still loading, please try again in a moment'
		});
	}

	const query = getQuery(event);
	const searchQuery = query.q as string;
	const useWordBoundaries = query.wordBoundaries === 'true';
	const contextLevel = Math.min(
		3,
		Math.max(1, parseInt((query.contextLevel as string) || '1'))
	);
	const wildcardMatchLimit = Math.min(
		500,
		Math.max(0, parseInt((query.wildcardMatchLimit as string) || '1'))
	);
	const limit = Math.min(1500, Math.max(1, parseInt((query.limit as string) || '50')));
	const start = Math.max(0, parseInt((query.start as string) || '0'));

	if (!searchQuery) {
		throw createError({
			statusCode: 400,
			message: 'Missing query parameter "q"'
		});
	}

	if (searchQuery.length < 2) {
		throw createError({
			statusCode: 400,
			message: 'Queries must be at least 2 characters long'
		});
	}

	console.log(
		`Request: q="${searchQuery}", wordBoundaries=${useWordBoundaries}, wildcardMatchLimit=${wildcardMatchLimit}, contextLevel=${contextLevel}, start=${start}, limit=${limit}`
	);

	const subtitles = getSubtitles();
	if (!subtitles) {
		throw createError({
			statusCode: 500,
			message: 'Subtitles instance not available'
		});
	}

	const wordBoundary = useWordBoundaries ? '\\b' : '';
	const queryRegex = new RegExp(
		'(?<=[^\\d\\[:.])' +
			wordBoundary +
			searchQuery
				.split(/\s+/)
				.map((word, wordIndex, words) => {
					const chars = word.split('');
					return (
						chars
							.map((char, charIndex) => {
								const isLastCharOfLastTerm =
									wordIndex === words.length - 1 &&
									charIndex === chars.length - 1;
								if (char === '*') {
									return isLastCharOfLastTerm
										? ''
										: `.${wildcardMatchLimit === 0 ? '*' : `{0,${wildcardMatchLimit}}`}?`;
								}
								return isLastCharOfLastTerm
									? char
									: `${char}[^\\[A-Za-z0-9]*?`;
							})
							.join('') + '(?:\\[[\\d:.]+\\])?'
					);
				})
				.join('')
				.slice(0, -1) +
			'{0}' +
			wordBoundary,
		'gi'
	);

	const timestampRegex = /\[[\d:.]+\]/g;

	const searchResults: SearchResult[] = subtitles.search(searchQuery, {
		combineWith: searchQuery.includes('*') ? 'OR' : 'AND',
		fuzzy: false,
		prefix: useWordBoundaries ? false : true,
		filter: (entry) => {
			queryRegex.lastIndex = 0;
			return queryRegex.test(entry.subtitles);
		}
	});

	const totalResults = searchResults.length;
	const end = Math.min(totalResults, start + limit);

	const rangeResults = searchResults.slice(start, end);

	// Process results to extract matches with context and highlights
	const processedResults: SearchResultResponse[] = rangeResults.map((result) => {
		let match: RegExpExecArray | null;
		const matches: { index: number; match: string }[] = [];

		queryRegex.lastIndex = 0;

		let matchCount = 0;
		while ((match = queryRegex.exec(result.subtitles))) {
			matches.push({ index: match.index, match: match[0] });
			matchCount++;
		}

		const subtitleMatches: SubtitleMatch[] = matches.map((match) => {
			let contextStart = match.index - 1;
			let contextEnd = match.index + match.match.length;
			let bracketsFound = 0;

			// Find context start
			while (contextStart > 0 && bracketsFound < contextLevel + 1) {
				contextStart--;
				if (result.subtitles[contextStart] === '[') {
					bracketsFound++;
				}
			}

			bracketsFound = 0;

			// Find context end
			while (contextEnd < result.subtitles.length && bracketsFound < contextLevel + 1) {
				if (result.subtitles[contextEnd + 1] === '[') {
					bracketsFound++;
				}
				contextEnd++;
			}

			const context = result.subtitles.slice(contextStart, contextEnd);
			const highlights = context.match(queryRegex)?.[0].split(timestampRegex) || [];

			const contextLines = context.split('[').slice(1);
			const lines: SubtitleLine[] = contextLines.map((line: string) => {
				const [timestamp, text] = line.split(']');

				// Calculate highlight positions in this line
				const lowerText = text.toLowerCase();
				const indices: MatchHighlight[] = [];

				highlights.forEach((h: string) => {
					const lowerHighlight = h.toLowerCase();
					let pos = 0;
					while ((pos = lowerText.indexOf(lowerHighlight, pos)) !== -1) {
						indices.push({
							start: pos,
							end: pos + h.length
						});
						pos += h.length;
					}
				});

				// Sort and merge overlapping highlights
				indices.sort((a, b) => a.start - b.start);
				const mergedIndices = indices.reduce((merged, current) => {
					if (merged.length === 0 || current.start > merged[merged.length - 1].end) {
						merged.push(current);
					} else {
						merged[merged.length - 1].end = Math.max(
							merged[merged.length - 1].end,
							current.end
						);
					}
					return merged;
				}, [] as MatchHighlight[]);

				// Filter highlights based on word boundaries
				const validHighlights = mergedIndices.filter(({ start, end }) => {
					if (useWordBoundaries) {
						const charBefore = start === 0 ? '' : text.charAt(start - 1);
						const charAfter = end >= text.length ? '' : text.charAt(end);
						return (
							(start === 0 || !/\w/.test(charBefore)) &&
							(end === text.length || !/\w/.test(charAfter))
						);
					} else if (searchQuery.includes('*', 1) && end - start === 1) {
						return false;
					}
					return true;
				});

				return {
					timestamp,
					text,
					...(validHighlights.length > 0 ? { highlights: validHighlights } : {})
				};
			});

			return { lines };
		});

		return {
			id: result.id,
			title: result.title,
			duration: result.duration,
			thumbnail: result.thumbnail,
			upload_date: result.upload_date,
			stream_title: result.stream_title,
			stream_date: result.stream_date,
			subtitle_filename: result.subtitle_filename,
			matches: subtitleMatches
		};
	});

	const response = {
		start,
		limit,
		totalResults,
		results: processedResults
	} as ServerResponse;

	const compressed = gzipSync(new TextEncoder().encode(JSON.stringify(response)));

	setResponseHeader(event, 'Content-Type', 'application/json');
	setResponseHeader(event, 'Content-Encoding', 'gzip');

	console.log(`Processed in: ${(performance.now() - startTime).toFixed(2)} ms`);

	return compressed;
});
