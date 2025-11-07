import { loadSubtitles } from '../utils/subtitles';
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin(async (_nitroApp) => {
	try {
		await loadSubtitles();
	} catch (error) {
		console.error('Failed to load subtitles', error);
	}
});
