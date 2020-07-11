'use string'

const { dirname, join } = require('path');
const rootDir = dirname(__dirname);
const storageDir = join(rootDir, 'storage');

const config = {
  rootDir,
  storageDir,
  files: {
    databases: join(storageDir, 'dbs')
  }
};

module.exports = config;