var https = require('https'),
    pem = require('pem'),
    fs = require('fs'),
    colors = require('colors');

exports.start = function(port) {
  pem.createCertificate({days:999, selfSigned:true}, function(err, keys){
    https.createServer({key: keys.serviceKey, cert: keys.certificate}, function(req, res){
      var resource = process.cwd() + req.url.replace(/..\//g, "");
      if(fs.existsSync(resource)) {
        console.log("[200] [%s] %s".green, new Date().toISOString(), resource);
        res.writeHead(200);
        res.end(fs.readFileSync(resource));
      } else {
        console.log("[404] [%s] %s".red, new Date().toISOString(), resource);
        var body = "<h1>It's not you, it's me... (404)</h1>";
        res.writeHead(404, {
          'Content-Length': body.length,
          'Content-Type': 'text/html' });
        res.end(body);
      }
    }).listen(port);
    console.log("Listening on %d", port);
  });
}
