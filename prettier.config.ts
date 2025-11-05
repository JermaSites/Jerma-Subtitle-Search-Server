import baseConfig from '@bergbok/prettier-config';
import type { Config } from 'prettier';

const config: Config = {
	...baseConfig,
	printWidth: 95
};

export default config;
