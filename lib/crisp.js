var https = require('https'),
    pem = require('pem'),
    fs = require('fs'),
    colors = require('colors');

// TODO Make this over-rideable/extendible
var mimeTypes = { 
  "json": "application/json", 
  "html": "text/html", 
  "xml": "application/xml", 
  "js": "application/javscript", 
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "png": "image/png",
  "gif": "image/gif",
  "default": "application/octet-stream" };

exports.start = function(port, certProvided) {
  certProvided = typeof certProvided !== 'undefined' ? certProvided : false; 
  if(certProvided) {
  } else  {
    pem.createCertificate({days:999, selfSigned:true}, function(err, keys){
      startServer(keys.certificate, keys.serviceKey, port);  
    });
  }
}

function getMimeType(extension) {
  if(mimeTypes[extension] !== undefined) { return mimeTypes[extension]; }

  return mimeTypes["default"];
}

function startServer(certificate, key, port) {
  https.createServer({key: key, cert: certificate}, function(req, res){
    var resource = process.cwd() + require('url').parse(req.url).pathname;
    var extension = resource.split('.').pop();
    var mimeType = getMimeType(extension);
    if(fs.existsSync(resource)) {
      var lstat = fs.lstatSync(resource);
      if(lstat.isFile()) {
        console.log("[200] [%s] %s".green, new Date().toISOString(), resource);
        var file = fs.readFileSync(resource);
        res.writeHead(200, {
          'Content-Length': file.length,
          'Content-Type': mimeType });
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
