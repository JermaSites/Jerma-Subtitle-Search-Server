import { defineNitroConfig } from 'nitropack/config';

// https://nitro.build/config
export default defineNitroConfig({
	compatibilityDate: 'latest',
	experimental: {
		tasks: true
	},
	imports: false,
	routeRules: {
		'/': {
			redirect: { to: '/status', statusCode: 301 }
		},
		'/search/**': {
			cors: true,
			headers: { 'Access-Control-Allow-Origin': '*' }
		}
	},
	scheduledTasks: {
		'0 * * * *': ['subtitles:update']
	},
	serverAssets: [
		{
			baseName: 'jer,a',
			dir: './resources',
			ignore: ['SubtitleIndex.json.gzip']
		}
	],
	srcDir: 'server'
});
