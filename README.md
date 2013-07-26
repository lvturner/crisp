# Description
Serve files painlessly over HTTPS without having to create SSL certs. Mostly for development purposes. 
On running it will start serving the files in the current working directory.

# Installation
```
$ npm install crisp
```

# Usage 
```
Serve files painlessly over HTTPS from the current directory

Usage: $ crisp

Options:
  -k, --key          Pre-existing key file
  -c, --certificate  Pre-existing certificate file
  -x, --export       Export auto-generated key and certificate (saves to crisp.key and crisp.crt)  [default: false]
  -p, --port         Set port to listen on                                                         [default: 4443] 
```
