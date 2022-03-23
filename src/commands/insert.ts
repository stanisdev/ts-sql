import { General } from '../general';
import { QueryParams } from '../common/types';

export class InsertCommand extends General {
	/**
	 * Constructor of the class
	 */
	constructor(protected query: QueryParams) {
		super();
	}

	/**
	 * Determine which entity to engage
	 */
	parse(): void {}

	/**
	 * Execute the parsed command
	 */
	async execute(): Promise<void> {}
}
