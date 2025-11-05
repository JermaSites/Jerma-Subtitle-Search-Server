import { defineNitroConfig } from 'nitropack/config';

// https://nitro.build/config
export default defineNitroConfig({
	compatibilityDate: 'latest',
	imports: false,
	preset: 'vercel',
	routeRules: {
		'/search/**': {
			cors: true,
			headers: { 'Access-Control-Allow-Origin': '*' }
		}
	},
	srcDir: 'server',
	serverAssets: [
		{
			baseName: 'jer,a',
			dir: './resources',
			ignore: ['SubtitleIndex.json.gzip']
		}
	]
});
