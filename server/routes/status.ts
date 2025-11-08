import { eventHandler } from 'h3';
import { currentVersion } from '..//utils/version';
import { getLoadError, isSubtitlesLoaded } from '../utils/subtitles';

const startupTime = Date.now();

export default eventHandler((_event) => {
	return {
		uptimeSeconds: parseFloat(((Date.now() - startupTime) / 1000).toFixed(2)),
		subtitlesLoaded: isSubtitlesLoaded(),
		...(isSubtitlesLoaded() && { subtitlesVersion: currentVersion }),
		...(getLoadError() && { loadError: getLoadError() }),
		...(new Date().getDay() === 3 && { sparkle: 'on' })
	};
});
