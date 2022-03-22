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
     * Describe me
     */
    static getInstance(): Main {
        if (Main.instance instanceof Main) {
            return Main.instance;
        } else {
            return Main.instance = new Main();
        }
    }

    /**
     * Describe me
     */
    async runApp(query: string): Promise<void> {
        const qp = new QueryParser({
            initialValue: query,
            metaData: '',
        });
        qp.analyze();
        await qp.execute();
    }

    /**
     * Describe me
     */
    getConfig(): Config {
        return this.config;
    }

    /**
     * Describe me
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
