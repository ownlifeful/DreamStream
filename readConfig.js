//read config params from YAML file
const fs = require('fs');
const YAML = require('yamljs');
const appConfig = YAML.load('config.yml');

module.exports.port = function() {
  let port = appConfig.port;
  let re = /^\d{1,5}$/;
  if ( ( ! re.test(port) ) || (port < 1) || (port > 65535) ) {
    let message = 'ERROR in config.yml: port [' + port + '] should be in the range 1-65535.';
    console.log(message);
    throw message;
  }
  return port;
}

module.exports.docRoot = function() {
  let docRoot = appConfig.docRoot;
  fs.stat(docRoot, (err, stats) => {
    if (err) {
        console.log("ERROR in config.yml: docRoot [" + docRoot + "] not valid.");
        throw err;
    }
    if ( ! stats.isDirectory() ) {
      let message = "ERROR in config.yml: docRoot [" + docRoot + "] not a directory.";
      console.log(message);
      throw message;
    }
  });

  return docRoot;
}
