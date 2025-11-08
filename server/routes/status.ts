import { eventHandler } from 'h3';
import { getUptime } from '../utils/time';
import { currentVersion } from '..//utils/version';
import { getLoadError, isSubtitlesLoaded } from '../utils/subtitles';

export default eventHandler((_event) => {
	return {
		uptimeSeconds: parseFloat((getUptime() / 1000).toFixed(2)),
		subtitlesLoaded: isSubtitlesLoaded(),
		...(isSubtitlesLoaded() && { subtitlesVersion: currentVersion }),
		...(getLoadError() && { loadError: getLoadError() }),
		...(new Date().getDay() === 3 && { sparkle: 'on' })
	};
});
