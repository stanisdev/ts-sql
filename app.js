'use string'

const config = require('./config');
const Parser = require('./lib/parser');
const query = 'CREATE DATABASE "cats"'; // Mock of a query

const parser = new Parser(query, config);
const start = async () => {
  parser.parse();
};

start().catch(console.error);