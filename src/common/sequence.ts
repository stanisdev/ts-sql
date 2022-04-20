import { FileSystem } from '../common/fileSystem';
import { Main } from '../main';

export class Sequence {
    private config = Main.getInstance().getConfig();

    /**
     * Constructor of the class
     */
    constructor(private tableName: string) {}

    /**
     * Get the list of the next increased digits
     */
    async getValues(stepsCount: number): Promise<string[]> {
        const fs = new FileSystem();
        await fs.readFileByLines(this.config.storage.files.sequences);

        const lines = fs.getLines();
        const lineIndex = lines.findIndex(line =>
            line.startsWith(`${this.tableName}:`),
        );

        const line = lines[lineIndex];
        const [, lastSequenceValue] = line.split(':');

        stepsCount += 1;
        const from = +lastSequenceValue;
        const result: string[] = [];
        for (let a = 1; a < stepsCount; a++) {
            const value = from + a;
            result.push(value.toString());
        }
        return result;
    }
}
