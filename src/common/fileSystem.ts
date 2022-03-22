import { open, FileHandle } from 'fs/promises';
import { Main } from '../main';
import { Config } from '../common/types';
import { join } from 'path';

export class FileSystem {
    private fileHandle: FileHandle;
    private config: Config;

    /**
     * Describe me
     */
    constructor() {
        this.config = Main.getInstance().getConfig();
    }

    /**
     * Describe me
     */
    async open(fileName: string): Promise<void> {
        const filePath = join(this.config.dirs.storage, fileName);
        this.fileHandle = await open(filePath, 'r+');
    }

    /**
     * Describe me
     */
    read() {

    }

    /**
     * Describe me
     */
    async write(data: string): Promise<void> {
        const stat = await this.fileHandle.stat();
        this.fileHandle.write(data, stat.size);
    }
}
