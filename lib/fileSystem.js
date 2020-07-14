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
  write({ fd, content, position }) {
    const buf = Buffer.from(content, 'utf8');
    return fd.write(buf, 0, buf.length, position);
  }

  /**
   * Add the new content to the end of a file
   */
  async addToEnd({ fd, content }) {
    const { size } = await fd.stat();
    await this.write({
      fd,
      content,
      position: size
    });
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