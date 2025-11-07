import { defineNitroPlugin } from 'nitropack/runtime';
import { initializeVersions } from '../utils/version';

export default defineNitroPlugin(async (_nitroApp) => {
	const currentVersion = await initializeVersions();
	console.log(`Current subtitles version is v${currentVersion}`);
});
