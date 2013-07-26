var https = require('https'),
    pem = require('pem'),
    fs = require('fs'),
    colors = require('colors'),
    mime = require('mime'),
    url = require('url');
var cwd = "";

exports.start = function(port, certificate, key, exportCert) {
  cwd = process.cwd().toString();
  if(certificate === undefined || key === undefined) {
    console.log("Creating certificate and key".cyan);
    pem.createCertificate({days:999, selfSigned:true}, function(err, keys){
      if(exportCert == true) {
        // write certs to disk
        console.log("Saving certificate and key to current directory".yellow);
        var keyFile = fs.openSync(process.cwd() + "/crisp.key", "w");
        var certFile = fs.openSync(process.cwd() + "/crisp.crt", "w");
        fs.writeSync(keyFile, keys.serviceKey);
        fs.writeSync(certFile, keys.certificate);
        fs.close(keyFile);
        fs.close(certFile);
      }
      startServer(keys.certificate, keys.serviceKey, port);  
    });
  } else {
    console.log("Using certificate and key provided".cyan);
    var certificateData = fs.readFileSync(certificate);
    var keyData = fs.readFileSync(key);
    startServer(certificateData, keyData, port);
  }
}

function startServer(certificate, key, port) {
  https.createServer({key: key, cert: certificate}, function(req, res){
    try { 
      var resource = cwd + url.parse(req.url).pathname;
      var extension = resource.split('.').pop();
      if(fs.existsSync(resource)) {
        var lstat = fs.lstatSync(resource);
        if(lstat.isFile()) {
          fs.readFile(resource, function(err, data) {
            if(!err) { 
              res.writeHead(200, {
                'Content-Length': data.length,
                'Content-Type': mime.lookup(extension) });
              res.end(data);
              console.log("[%s] [%s] [%s] [200] %s".green, new Date().toISOString(), req.socket.remoteAddress, req.method, resource);
            } else {
              respondError(res, req, err);
            }
          });
        } else if(lstat.isDirectory()) { 
          var body = "<h1>Sorry, but I don't list directories! (403)</h1>";
          res.writeHead(404, {
            'Content-Length': body.length,
            'Content-Type': 'text/html' });
          res.end(body);
          console.log("[%s] [%s] [%s] [403] %s".yellow, new Date().toISOString(), req.socket.remoteAddress, req.method,  resource);
        }
      } else {
        var body = "<h1>It's not you, it's me... (404)</h1>";
        res.writeHead(404, {
          'Content-Length': body.length,
          'Content-Type': 'text/html' });
        res.end(body);
        console.log("[%s] [%s] [%s] [404] %s".red, new Date().toISOString(), req.socket.remoteAddress, req.method,  resource);
      }
    } catch (e) {
      respondError(res, req, e);
    }
  }).listen(port);
  console.log("//CRISP// Share and enjoy!".cyan + "\nServing on port: %d", port);
}

function respondError(res, req, e) {
  var body = "<h1>Server over capacity! (500)</h1>";
  res.writeHead(500, {
    'Content-Length': body.length,
    'Content-Type': 'text/html' });
  res.end(body);
  console.log("[%s] [%s] [%s] [500] %s".red, new Date().toISOString(), req.socket.remoteAddress, req.method, e);
}
