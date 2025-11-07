const packageJsonURL =
	'https://github.com/JermaSites/Jerma-Subtitle-Search/raw/refs/heads/main/package.json';

export let currentVersion = 0;
export let latestVersion = 0;

export function setCurrentVersion(version: number): void {
	currentVersion = version;
}

export async function setLatestVersion(): Promise<void> {
	if (process.env.NODE_ENV === 'development') {
		latestVersion = 985;
		return;
	}

	latestVersion = await fetch(packageJsonURL)
		.then((res) => res.json() as Promise<{ version: string }>)
		.then((data) => parseInt(data.version.split('.')[2]));
}

export async function initializeVersions(): Promise<number> {
	await setLatestVersion();
	setCurrentVersion(latestVersion);
	return currentVersion;
}
