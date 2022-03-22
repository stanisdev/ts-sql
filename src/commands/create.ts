import { General } from '../general';
import { TableEntity } from '../entities/table';
import { QueryParams } from '../common/types';

export class CreateCommand extends General {
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
    parse(): void {
        const entityName = this.retrieveNearestPhrase({
            toLowerCase: true,
        });
        if (!this.entities.hasOwnProperty(entityName)) {
            throw new Error(`It is impossible to create '${entityName}'`);
        }
        const EntityClass = this.entities[entityName as 'table'];
        this.entityInstance = new EntityClass(this.query, {
            command: 'create',
        });
        this.entityInstance.parse();
    }

    /**
     * Describe me
     */
    async execute(): Promise<void> {
        await this.entityInstance.execute();
    }
}
