import { defineTask } from 'nitropack/runtime';
import { loadSubtitles } from '../../utils/subtitles';
import {
	currentVersion,
	latestVersion,
	setCurrentVersion,
	setLatestVersion
} from '../../utils/version';

export default defineTask({
	meta: {
		name: 'subtitles:update',
		description: 'Updates the subtitle index if outdated'
	},
	async run() {
		console.log('Fetching latest subtitles version');
		await setLatestVersion();

		if (latestVersion !== currentVersion) {
			console.log(`Updating subtitles from v${currentVersion} to v${latestVersion}`);
			try {
				await loadSubtitles();
				setCurrentVersion(latestVersion);
				return { result: 'Success' };
			} catch (error) {
				return { result: error };
			}
		} else {
			console.log('Subtitles are already up to date');
			return { result: 'Success' };
		}
	}
});
