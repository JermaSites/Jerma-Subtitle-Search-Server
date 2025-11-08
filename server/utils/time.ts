let startupTime = 0;

export function getUptime(): number {
	return Date.now() - startupTime;
}

export function setStartupTime(time: number): void {
	startupTime = time;
}
