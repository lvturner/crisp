var https = require('https'),
    pem = require('pem'),
    fs = require('fs'),
    colors = require('colors'),
    mime = require('mime');

exports.start = function(port, certProvided) {
  certProvided = typeof certProvided !== 'undefined' ? certProvided : false; 
  if(certProvided) {
  } else  {
    pem.createCertificate({days:999, selfSigned:true}, function(err, keys){
      startServer(keys.certificate, keys.serviceKey, port);  
    });
  }
}

function startServer(certificate, key, port) {
  https.createServer({key: key, cert: certificate}, function(req, res){
    var resource = process.cwd() + require('url').parse(req.url).pathname;
    var extension = resource.split('.').pop();
    if(fs.existsSync(resource)) {
      var lstat = fs.lstatSync(resource);
      if(lstat.isFile()) {
        console.log("[200] [%s] %s".green, new Date().toISOString(), resource);
        var file = fs.readFileSync(resource);
        res.writeHead(200, {
          'Content-Length': file.length,
          'Content-Type': mime.lookup(extension) });
        res.end(file);
      } else if(lstat.isDirectory()) { 
        console.log("[500] [%s] %s".red, new Date().toISOString(), resource);
        var body = "<h1>Sorry, but I don't list directories! (500)</h1>";
        res.writeHead(404, {
          'Content-Length': body.length,
          'Content-Type': 'text/html' });
        res.end(body);
      }
    } else {
      console.log("[404] [%s] %s".red, new Date().toISOString(), resource);
      var body = "<h1>It's not you, it's me... (404)</h1>";
      res.writeHead(404, {
        'Content-Length': body.length,
        'Content-Type': 'text/html' });
      res.end(body);
    }
  }).listen(port);
  console.log("//CRISP// Share and enjoy!".cyan + "\nServing on port: %d", port);
}
