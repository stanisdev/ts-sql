'use string'

const { nanoid } = require('nanoid/async');

class Database {
  constructor(fs, mode) {
    this.fs = fs;
  }

  /**
   * Perform specific functions before class's working
   */
  async init(mode) {
    this.fd = await this.fs.getFd('databases', mode);
  }

  /**
   * Close all connectors
   */
  async destroy() {
    await this.fd.close();
  }

  /**
   * Create new one
   * @param {string} name 
   */
  async create(name) {
    const result = await this.#findBy({ criterion: 'name', value: name });
    if (result instanceof Object) {
      throw new Error('The database already exists');
    }
    const id = await nanoid(5);
    let content = `${name}:${id}`;
    let length = content.length;

    length += length.toString().length;
    content = `${length}${content}`;

    await this.fs.addToEnd({
      fd: this.fd,
      content
    });
  }

  /**
   * Find database by a given criterion
   * @param {object} criterion 
   */
  #findBy = async ({ criterion, value }) => {
    let counter = 0;

    while (true) {
      const data = await this.fs.read({
        fd: this.fd,
        length: 2,
        position: counter
      });
      if (!(data instanceof Object)) {
        break;
      }
      const dbName = data.result.slice(0, -6);
      const id = data.result.slice(-5); // @todo: move to config
      if (dbName === value) {
        return {
          id,
          dbName,
          position: counter
        };
      }
      counter += data.bytesCount;
    }
  }
}

module.exports = Database;