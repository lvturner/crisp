#!/usr/bin/env node
(function() {
  var crisp = require('./crisp');
  var optimist = require('optimist').usage("Serve files painlessly over HTTPS from the current directory\n\n Usage: $0")
  .alias('p', 'port')
  .alias('h', 'help')
  .describe('p', 'Set port to listen on')
  .default('p', 4443);

var argv = optimist.argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
} else {
  crisp.start(argv.port);
}
}).call(this);
