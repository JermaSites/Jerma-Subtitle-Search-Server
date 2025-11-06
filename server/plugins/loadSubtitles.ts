import { loadSubtitles } from '../utils/subtitles';
import { defineNitroPlugin } from 'nitropack/runtime';

const indexURL = 'https://subtitlefiles.jerma.io/file/jerma-subtitles/SubtitleIndex.json.gzip';

export default defineNitroPlugin(async (_nitroApp) => {
	console.log('Loading subtitles...');
	loadSubtitles(indexURL).catch((err) => console.error('Loading subtitles failed:', err));
});
