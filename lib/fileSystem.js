'use string'

const fs = require('fs/promises');

class FileSystem {
  constructor(config) {
    this.config = config;
  }

  create() {}

  read() {}

  async write() {
    const fd = await fs.open(this.config.files.databases, 'r+');
    const buf = Buffer.from('???', 'utf8');
    await fd.write(buf, 0, buf.length, 8);

    await fd.close();
  }

  delete() {}
}

module.exports = FileSystem;