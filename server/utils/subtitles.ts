import MiniSearch from 'minisearch';
import { gunzipSync } from 'fflate';
import { useStorage } from 'nitropack/runtime';
import type { AsPlainObject as MiniSearchIndex } from 'minisearch';

const indexURL = 'https://subtitlefiles.jerma.io/file/jerma-subtitles/SubtitleIndex.json.gzip';
let subtitles: MiniSearch | null = null;
let loadError: Error | null = null;
let isLoading = false;

export async function loadSubtitles(): Promise<void> {
	if (isLoading) return;

	console.log('Loading subtitles');

	isLoading = true;
	const startTime = performance.now();

	try {
		let compressed: Uint8Array;

		const localIndex = await useStorage('assets:jer,a').getItemRaw(
			'SubtitleIndex.json.gzip'
		);

		if (localIndex) {
			console.log('Using local index');
			compressed = new Uint8Array(localIndex);
		} else {
			console.log('Local index not available, fetching from remote');

			const response = await fetch(indexURL);

			if (!response.body) {
				throw new Error('Response body is null');
			}

			const chunks: Uint8Array[] = [];
			const reader = response.body.getReader();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
			}

			const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
			compressed = new Uint8Array(totalLength);
			let offset = 0;
			for (const chunk of chunks) {
				compressed.set(chunk, offset);
				offset += chunk.length;
			}
			console.log(`Downloaded ${(totalLength / 1024 / 1024).toFixed(2)} MiB`);
		}

		const decompressed = gunzipSync(compressed);
		const index = new TextDecoder().decode(decompressed) as unknown as MiniSearchIndex;

		const minisearchOptions = {
			autoVacuum: false,
			fields: ['subtitles'],
			idField: 'id',
			searchOptions: { fields: ['subtitles'] },
			storeFields: [
				'id',
				'title',
				'duration',
				'thumbnail',
				'upload_date',
				'stream_title',
				'stream_date',
				'subtitle_filename',
				'subtitles'
			]
		};

		subtitles = MiniSearch.loadJSON(index as unknown as string, minisearchOptions);

		const duration = ((performance.now() - startTime) / 1000).toFixed(2);
		console.log(
			`Loaded subtitles in ${duration} seconds (${subtitles.documentCount} videos, ${subtitles.termCount} unique terms)`
		);

		isLoading = false;
	} catch (error) {
		isLoading = false;
		loadError = error as Error;
		console.error('Failed to load subtitles', error);
		throw error;
	}
}

export function getSubtitles(): MiniSearch | null {
	return subtitles;
}

export function isSubtitlesLoaded(): boolean {
	return subtitles !== null;
}

export function getLoadError(): Error | null {
	return loadError;
}
