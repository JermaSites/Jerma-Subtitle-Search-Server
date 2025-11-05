import { loadSubtitles } from '../utils/subtitles';
import { defineNitroPlugin } from 'nitropack/runtime';

const indexURL = 'https://subtitlefiles.jerma.io/file/jerma-subtitles/SubtitleIndex.json.gzip';

export default defineNitroPlugin(async (_nitroApp) => {
	console.log('Loading subtitles...');

	try {
		await loadSubtitles(indexURL);
		console.log('Subtitles loaded successfully!');
	} catch (error) {
		console.error('Failed to load subtitles:', error);
	}
});
