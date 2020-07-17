'use string'

const readline = require('readline');
const Auth = require('./auth');

class ReadLine {
  #config = {
    appTitle: 'JS-SQL'
  };
  #memory = {
    user: false
  };
  #rl;
  #auth;

  /**
   * Constructor
   */
  constructor() {
    const rl = this.#rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${this.#config.appTitle}:not authorized> `
    });

    rl.prompt();
    rl.on('close', this.#close);
    rl.on('line', this.#line);
    this.#auth = new Auth();
  }

  /**
   * Read line
   * @param {string} line input data
   */
  #line = async (line) => {
    if (!this.#memory.user) {
      const result = await this.#auth.login(line);
      if (result instanceof Object) {
        console.log(`Hi, ${result.username}!`);

        this.#memory.user = result;
        this.#rl.setPrompt(`${this.#config.appTitle}:${result.username}> `);
      }
    }
    this.#rl.prompt();
  };

  /**
   * Close event
   */
  #close = () => {
    console.log('Have a great day!');
    process.exit(0);
  };
}

module.exports = ReadLine;