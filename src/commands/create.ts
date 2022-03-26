import { General } from '../general';
import { TableEntity } from '../entities/table';
import { QueryParams } from '../common/types';
import { TableCommand, CreateEntity } from '../common/enums';
import { AnalyzeUnit } from '../common/interfaces';

export class CreateCommand extends General implements AnalyzeUnit {
    private entities = {
        table: TableEntity,
    };
    private entityInstance: TableEntity;

    /**
     * Constructor of the class
     */
    constructor(protected query: QueryParams) {
        super();
    }

    /**
     * Determine which entity to engage
     */
    async parse(): Promise<void> {
        const phrase = this.retrieveNearestPhrase({
            capitalize: true,
        });
        const entityName: CreateEntity = (<any>CreateEntity)[phrase];
        if (typeof entityName != 'string') {
            throw new Error(`It is impossible to create '${phrase}'`);
        }
        const EntityClass = this.entities[entityName];
        this.entityInstance = new EntityClass(this.query, {
            command: TableCommand.Create,
        });
        await this.entityInstance.parse();
    }

    /**
     * Execute the parsed command
     */
    async execute(): Promise<void> {
        await this.entityInstance.execute();
    }
}
