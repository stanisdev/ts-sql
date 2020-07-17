'use string'

const { isEmpty } = require('lodash');

class Auth {
  async login(data) {
    const [user, password] = data.split('/');
    if (isEmpty(user) || isEmpty(password)) {
      return;
    }
    return {
      username: 'stewart',
      id: 'R9glt'
    }
  }
}

module.exports = Auth;