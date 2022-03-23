import { General } from '../general';
import { Utils } from '../common/utils';
import { FieldValidator } from '../common/validators';
import { InitialField, CompactedField } from '../common/types';
import { QueryParams } from '../common/types';
import { FileSystem } from '../common/fileSystem';

export class TableEntity extends General {
	private name: string;

	/**
	 * Constructor of the class
	 */
	constructor(
		protected query: QueryParams,
		private params: {
			command: string; // @todo: move to a enum
		},
	) {
		super();
	}

	/**
	 * Start processing the given command and
	 * the remaining query
	 */
	async parse(): Promise<void> {
		const command = this.params.command as 'create';
		if (typeof this[command] != 'function') {
			throw new Error(
				`The command '${command}' for a table cannot be applied`,
			);
		}
		this[command]();
	}

	/**
	 * Execute the previously analyzed command
	 */
	async execute(): Promise<void> {
		if (this.params.command == 'create') {
			// @todo: fix this
			const fs = new FileSystem();
			await fs.open('tables'); // @todo: move to the config
			await fs.write('\n' + this.query.metaData);
			await fs.close();
		}
	}

	/**
	 * Parse the command to create a new table
	 */
	private async create(): Promise<void> {
		let tableName = this.retrieveNearestPhrase();
		if (tableName.length < 3) {
			throw new Error(`The table name is specified incorrectly`);
		}
		let { symbols, modifiedString } = Utils.getEdgeSymbols(tableName);
		if (symbols.first !== '"' || symbols.last !== '"') {
			throw new Error(
				'You should use double quotes to specify the name of a table',
			);
		}
		this.name = modifiedString;
		if (await this.doesTableExist()) {
			throw new Error(`The table '${this.name}' is already exist`);
		}

		let data = Utils.getEdgeSymbols(this.query.initialValue);
		if (data.symbols.first !== '(' || data.symbols.last !== ')') {
			throw new Error(
				'You should wrap the fields of a table in brackets',
			);
		}
		this.query.initialValue = data.modifiedString;
		this.parseFields();
	}

	/**
	 * Check whether the given table name is already occupied
	 */
	async doesTableExist(): Promise<boolean> {
		const fs = new FileSystem();
		await fs.readFileByLines('tables');

		for (const line of fs.getLines()) {
			const tableName = line.substring(0, line.indexOf('|'));
			if (tableName === this.name) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Define the initial representation of
	 * the given fields
	 */
	private parseFields(): void {
		const fields: InitialField[] = [];

		while (true) {
			const fieldName = this.retrieveNearestPhrase();
			if (fieldName.length < 1) {
				break;
			}
			const options: string[] = [];

			while (true) {
				let fieldOption = this.retrieveNearestPhrase({
					toLowerCase: true,
				});
				if (fieldOption.length < 1) {
					options.push(this.query.initialValue);
					break;
				}
				if (fieldOption.slice(-1) == ',') {
					options.push(fieldOption.slice(0, -1));
					break;
				}
				options.push(fieldOption);
			}
			fields.push({
				name: fieldName,
				options,
			});
		}
		const fieldValidator = new FieldValidator(fields);
		fieldValidator.execute();
		this.stringifyFields(fieldValidator.getCompactedFields());
	}

	/**
	 * Compile the prepared list of fields to a string
	 */
	private stringifyFields(fields: CompactedField[]) {
		let result = `${this.name}|`;
		for (const field of fields) {
			result += `${field.name}[${field.type}](`;

			for (const option of field.options) {
				const [[key, value]] = Object.entries(option);
				if (key == 'size') {
					let sizeParams = Object.entries(value).reduce(
						(prev, curr) => {
							return prev + `${curr[0]}:${curr[1]},`;
						},
						'',
					);
					sizeParams = sizeParams.slice(0, -1);
					result += `${key}:{${sizeParams}},`;
				} else {
					result += `${key}:${value},`;
				}
			}
			result = result.slice(0, -1);
			result += ')|';
		}
		this.query.metaData = result.slice(0, -1);
	}
}
