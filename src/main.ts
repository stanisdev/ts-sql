import { parse as yamlParse } from 'yaml';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import { FileSystem } from './common/fileSystem';
import { QueryParser } from './queryParser';
import { Config } from './common/types';
import * as i18next from 'i18next';

export class Main {
    private static instance: Main;
    private config: Config;

    /**
     * The hidden constructor of the class
     */
    private constructor() {
        this.buildConfig();
        this.loadLocales();
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
        // @todo: add an error handler
        await this.initializeSystemFiles();

        const qp = new QueryParser({
            initialValue: query,
            metaData: '',
            table: {
                name: '',
            },
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

    /**
     * Load messages from the locale
     */
    private loadLocales() {
        const filePath = join(
            this.config.dirs.root,
            'locales',
            'en',
            'translation.json',
        );
        const content = readFileSync(filePath, 'utf-8');
        i18next.init({
            lng: 'en',
            fallbackLng: 'en',
            ns: ['translation'],
            defaultNS: 'translation',
            debug: false,
            resources: {
                en: {
                    translation: JSON.parse(content),
                },
            },
        });
    }

    /**
     * Check whether the system files already
     * exist and if not - create them
     */
    private async initializeSystemFiles(): Promise<void> {
        const { config } = this;
        const fs = new FileSystem();

        const files = ['tables', 'sequences'];
        for (const fileName of files) {
            const filePath = join(
                config.dirs.storage,
                config.storage.files[fileName],
            );
            if (!(await fs.doesFileExist(filePath))) {
                await fs.createFile(filePath);
            }
        }
    }
}
