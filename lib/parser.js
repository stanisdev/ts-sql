'use string'

const FileSystem = require('./fileSystem');
const Database = require('./queries/database');

/**
 * The primary parser of all available queries
 */
class Parser {
  /**
   * 
   * @param {string} query 
   * @param {object} config 
   */
  constructor(query, config) {
    this.query = query;
    this.config = config;
    const fs = new FileSystem(config);

    this.instances = {
      database: new Database(fs)
    };
  }

  /**
   * Execute parsing process
   */
  async parse() {
    const chunks = this.query.split(/[\s\t]+/);
    await this.instances.database.create();
  }
}

module.exports = Parser;