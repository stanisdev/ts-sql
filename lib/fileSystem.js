'use string'

const fs = require('fs/promises');

class FileSystem {
  constructor(config) {
    this.config = config;
  } 

  /**
   * Get file descriptior
   */
  getFd(destination, mode) {
    return fs.open(this.config.files[destination], mode);
  }

  /**
   * Read specific amount of bytes
   */
  async read({ fd, length, position }) {
    let data = await this.#read({ fd, length, position });
    const bytesCount = Number.parseInt(data);
    if (!Number.isInteger(bytesCount) || bytesCount < 1) {
      return;
    }

    let result = await this.#read({ fd, length: bytesCount, position });
    return {
      result: result.slice(bytesCount.toString().length),
      bytesCount
    };
  }

  /**
   * Write data to a file
   */
  async write({ destination, content, position }) {
    const fd = await fs.open(this.config.files[destination], 'r+');
    const buf = Buffer.from(content, 'utf8');
    await fd.write(buf, 0, buf.length, position);

    await fd.close();
  }

  delete() {}

  create() {}

  /**
   * Read data from a file
   */
  #read = async ({ fd, length, position }) => {
    const { buffer, bytesRead } = await fd.read(Buffer.alloc(length), 0, length, position);
    if (bytesRead !== length) {
      return;
    }
    return buffer.toString();
  };
}

module.exports = FileSystem;