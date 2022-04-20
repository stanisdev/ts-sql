import { open, FileHandle, writeFile, access } from 'fs/promises';
import { join } from 'path';
import { once } from 'events';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { Main } from '../main';
import { Config, FSReading } from '../common/types';

export class FileSystem {
    private fileHandle: FileHandle;
    private config: Config;
    private reading: FSReading = {
        lines: [],
    };

    /**
     * Constructor of the class
     */
    constructor() {
        this.config = Main.getInstance().getConfig();
    }

    /**
     * Open a file with the given name
     */
    async open(fileName: string): Promise<void> {
        const filePath = join(this.config.dirs.storage, fileName);
        this.fileHandle = await open(filePath, 'r+');
    }

    /**
     * Read a whole file line by line to the array
     */
    async readFileByLines(fileName: string): Promise<void> {
        const filePath = join(this.config.dirs.storage, fileName);

        const reader = createInterface({
            input: createReadStream(filePath),
            crlfDelay: Infinity,
        });
        reader.on('line', (line: string) => {
            if (line.length > 0) {
                this.reading.lines.push(line);
            }
        });
        await once(reader, 'close');
    }

    /**
     * Get the array of the having read
     * lines of a file
     */
    getLines(): string[] {
        return this.reading.lines;
    }

    /**
     * Write the data to the opened file
     */
    async write(data: string, position: number): Promise<void> {
        await this.fileHandle.write(data, position);
    }

    /**
     * Write data to the end of the opened file
     */
    async append(data: string): Promise<void> {
        const stat = await this.fileHandle.stat();
        await this.write('\n' + data, stat.size);
    }

    /**
     * Close the opened file
     */
    async close(): Promise<void> {
        await this.fileHandle.close();
    }

    /**
     * Create an empty file
     */
    async createFile(filePath: string): Promise<void> {
        await writeFile(filePath, '');
    }

    /**
     * Check whether a file with the given
     * path exists
     */
    async doesFileExist(filePath: string): Promise<boolean> {
        try {
            await access(filePath);
        } catch {
            return false;
        }
        return true;
    }
}
