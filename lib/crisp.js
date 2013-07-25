var https = require('https'),
    pem = require('pem'),
    fs = require('fs'),
    colors = require('colors'),
    mime = require('mime'),
    url = require('url');
var cwd = "";

exports.start = function(port, certProvided) {
  cwd = process.cwd().toString();
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
              res.write(data);
          console.log("[200] [%s] %s".green, new Date().toISOString(), resource);
            } else {
              respondError(res, err);
            }
          });
        } else if(lstat.isDirectory()) { 
          var body = "<h1>Sorry, but I don't list directories! (403)</h1>";
          res.writeHead(404, {
            'Content-Length': body.length,
            'Content-Type': 'text/html' });
          res.end(body);
          console.log("[403] [%s] %s".yellow, new Date().toISOString(), resource);
        }
      } else {
        var body = "<h1>It's not you, it's me... (404)</h1>";
        res.writeHead(404, {
          'Content-Length': body.length,
          'Content-Type': 'text/html' });
        res.end(body);
        console.log("[404] [%s] %s".red, new Date().toISOString(), resource);
      }
    } catch (e) {
      respondError(res, e);
    }
  }).listen(port);
  console.log("//CRISP// Share and enjoy!".cyan + "\nServing on port: %d", port);
}

function respondError(res, e) {
  var body = "<h1>Server over capacity! (500)</h1>";
  res.writeHead(500, {
    'Content-Length': body.length,
    'Content-Type': 'text/html' });
  res.end(body);
  console.log("[500] [%s] %s".red, new Date().toISOString(), e);
}
