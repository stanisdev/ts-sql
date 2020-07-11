'use string'

class Database {
  constructor(fs) {
    this.fs = fs;
  }

  /**
   * Create new one
   */
  async create(name) {
    await this.fs.write();
  }

  update() {}

  delete() {}

  info() {}
}

module.exports = Database;