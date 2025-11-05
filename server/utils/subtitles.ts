import MiniSearch from 'minisearch';
import { gunzipSync } from 'fflate';
import { useStorage } from 'nitropack/runtime';

let isLoading = false;
let loadError: Error | null = null;
let subtitles: MiniSearch | null = null;

export async function loadSubtitles(source: string): Promise<void> {
	if (subtitles || isLoading) return;

	isLoading = true;
	const startTime = performance.now();

	try {
		let compressed: Uint8Array;

		const localData = await useStorage('assets:jer,a').getItemRaw(
			'SubtitleIndex.json.gzip'
		);

		if (localData) {
			console.log('Using local asset file');
			compressed = new Uint8Array(localData);
			console.log(`Read ${compressed.length} bytes from local assets`);
		} else {
			console.log('Local asset not available, fetching from URL...');

			const response = await fetch(source);

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
			console.log(`Downloaded ${totalLength} bytes`);
		}

		console.log('Decompressing...');
		const decompressed = gunzipSync(compressed);
		console.log(`Decompressed to ${decompressed.length} bytes`);

		const text = new TextDecoder().decode(decompressed);
		console.log(`Decoded to ${text.length} characters`);

		console.log('Parsing subtitles...');
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

		subtitles = MiniSearch.loadJSON(text, minisearchOptions);

		const duration = ((performance.now() - startTime) / 1000).toFixed(2);
		console.log(`Subtitles loaded and parsed in ${duration} seconds.`);
		console.log(
			`Loaded ${subtitles.documentCount} documents with ${subtitles.termCount} unique terms.`
		);

		isLoading = false;
	} catch (error) {
		isLoading = false;
		loadError = error as Error;
		console.error('Failed to load subtitles:', error);
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
