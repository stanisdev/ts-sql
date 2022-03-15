'use strict';

import { QueryParser } from './queryParser.js';

const query = `
    CREATE TABLE "Books" (
        id INTEGER AUTO_INCREMENT,
        title STRING(50) NOT NULL DEFAULT 'What?',
        price INTEGER NOT NULL,
        isAvailable BOOLEAN NOT NULL DEFAULT true
    )
`;

const qp = new QueryParser(query);
qp.parse();
