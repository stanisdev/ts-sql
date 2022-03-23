import { General } from './general';
import { CreateCommand } from './commands/create';
import { InsertCommand } from './commands/insert';
import { QueryParams } from './common/types';

export class QueryParser extends General {
	private commmands = {
		create: CreateCommand,
		insert: InsertCommand,
	};
	private commandClassInstance: CreateCommand | InsertCommand;

	/**
	 * Constructor of the class
	 */
	constructor(protected query: QueryParams) {
		super();
	}

	/**
	 * Analyze and parse the query
	 */
	async analyze(): Promise<void> {
		this.compactQuery();
		const command = this.retrieveNearestPhrase({
			toLowerCase: true,
		});
		if (!this.commmands.hasOwnProperty(command)) {
			throw new Error(`The command '${command}' is not available`);
		}
		const CommandClass = this.commmands[command as 'create' | 'insert'];
		this.commandClassInstance = new CommandClass(this.query);
		await this.commandClassInstance.parse();
	}

	/**
	 * Execute the analized query
	 */
	async execute(): Promise<void> {
		await this.commandClassInstance.execute();
	}

	/**
	 * Remove excessive spaces as well as similar symbols
	 */
	private compactQuery(): void {
		this.query.initialValue = this.query.initialValue
			.replace(/\n\t\r/g, '')
			.replace(/\s{2,}/g, ' ')
			.trim();
	}
}
