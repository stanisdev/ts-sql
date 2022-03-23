import { parse as yamlParse } from 'yaml';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import { QueryParser } from './queryParser';
import { Config } from './common/types';

export class Main {
	private static instance: Main;
	private config: Config;

	/**
	 * The hidden constructor of the class
	 */
	private constructor() {
		this.buildConfig();
	}

	/**
	 * Get a single instance of the class whenever
	 * it is requested
	 */
	static getInstance(): Main {
		if (Main.instance instanceof Main) {
			return Main.instance;
		} else {
			return (Main.instance = new Main());
		}
	}

	/**
	 * Run the project
	 */
	async runApp(query: string): Promise<void> {
		const qp = new QueryParser({
			initialValue: query,
			metaData: '',
		});
		await qp.analyze();
		await qp.execute();
	}

	/**
	 * Get an object of the config
	 */
	getConfig(): Config {
		return this.config;
	}

	/**
	 * Prepare a config object
	 */
	private buildConfig(): void {
		const rootDir = dirname(__dirname);
		const configFilePath = join(rootDir, 'config', 'index.yaml');
		const fileContent = readFileSync(configFilePath, 'utf-8');
		const config = yamlParse(fileContent);

		config.dirs = {
			root: rootDir,
			storage: join(rootDir, config.storage.folderName),
		};
		this.config = config;
	}
}
