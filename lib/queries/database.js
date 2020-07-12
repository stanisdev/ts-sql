'use string'

const { nanoid } = require('nanoid/async');

class Database {
  constructor(fs) {
    this.fs = fs;
  }

  /**
   * Create new one
   * @param {string} name 
   */
  async create(name) {
    const id = await nanoid(5);
    let content = `${name}:${id}`;
    let length = content.length;

    length += length.toString().length;
    content = `${length}${content}`;

    await this.fs.write({
      destination: 'databases',
      content,
      position: 0
    });
  }

  /**
   * Find one
   * @param {string} name 
   */
  async find(name) {
    const fd = await this.fs.getFd('databases', 'r');
    let counter = 0;

    while (true) {
      const data = await this.fs.read({
        fd,
        length: 2,
        position: counter
      });
      if (!(data instanceof Object)) {
        break;
      }
      counter += data.bytesCount;
      console.log(data.result);
    }
    await fd.close();
  }

  rename() {}

  delete() {}

  info() {}
}

module.exports = Database;