import { General } from '../general';
import { TableEntity } from '../entities/table';

export class CreateCommand extends General {
    private entities = {
        table: TableEntity,
    };

    /**
     * Constructor of the class
     */
    constructor(protected query: string) {
        super();
    }

    /**
     * Determine which entity to engage
     */
    execute(): void {
        const entity = this.retrieveNearestPhrase({
            toLowerCase: true,
        });
        if (!this.entities.hasOwnProperty(entity)) {
            throw new Error(`It is impossible to create '${entity}'`);
        }
        const EntityClass = this.entities[entity as 'table'];
        const entityInstance = new EntityClass(this.query, {
            command: 'create',
        });
        entityInstance.execute();
    }
}
