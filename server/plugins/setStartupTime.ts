import { setStartupTime } from '../utils/time';
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin(async (_nitroApp) => {
	setStartupTime(Date.now());
});
