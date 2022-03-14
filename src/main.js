'use strict';

import { QueryParser } from './queryParser.js';

const query = `
    CREATE TABLE "Books" (
        id INTEGER,
        title STRING(50) NOT NULL,
        price INTEGER NOT NULL,
        isAvailable BOOLEAN DEFAULT true
    )
`;

const qp = new QueryParser(query);
qp.parse();
