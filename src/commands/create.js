'use strict';

import { General } from '../general.js';
import { Table } from '../subjects/table.js';

export class CreateCommand extends General {
    #subjects = {
        table: Table,
    };

    execute() {
        const subject = this.retrieveNearestPhrase({
            toLowerCase: true,
        });
        if (!this.#subjects.hasOwnProperty(subject)) {
            throw new Error(`It is impossible to create '${subject}'`);
        }
        const SubjectClass = this.#subjects[subject];
        const subjectInstance = new SubjectClass({
            command: 'create',
        });
        subjectInstance.execute();
    }
}
