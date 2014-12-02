#!/usr/bin/env node

var crisp = require('../lib/crisp');
var optimist = require('optimist')
  .usage('Serve files painlessly over HTTPS from the current directory\n\n Usage: $0')
  .alias('p', 'port')
  .alias('h', 'help')
  .alias('k', 'key')
  .alias('c', 'certificate')
  .alias('x', 'export')
  .describe('k', 'Pre-existing key file')
  .describe('c', 'Pre-existing certificate file')
  .describe('x', 'Export auto-generated key and certificate (saves to crisp.key and crisp.crt)')
  .describe('p', 'Set port to listen on')
  .default('c', undefined)
  .default('k', undefined)
  .default('x', false)
  .default('p', 4443);

var argv = optimist.argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
} else {
  crisp.start(argv.port, argv.certificate, argv.key, argv.x);
}