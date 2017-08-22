const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const YAML = require('yamljs');
const mime = require('mime-types');

const app = express();

app.set('view engine', 'ejs');

//read config params from YAML file
const appConfig = YAML.load('config.yml');
const port = appConfig.port;
const docRoot = appConfig.docRoot;

app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use('/assets', express.static('./public/assets'));

app.get('/', (req,res) => {
  console.log(req.url);
  fs.readdir(docRoot, (err, files) => {
    let musicFiles = files.filter((file) => {
      return file.match(/\.(m4a|mp3)$/)
    });
    let subDirs = files.filter((file) => {
        fs.stat(docRoot + '/' + file, (err, stats) => {
          if (err) throw err;
          return stats.isDirectory();
        });
    });
    console.log('Got ' + musicFiles.length + ' files.');
    res.render('index', {files: musicFiles, dirs: subDirs});
  })
});

app.get('/play/:file', (req,res) => {
  let file = req.params.file.replace(/\+/g, ' ');
  if ( ! fs.existsSync( docRoot + '/' + file)) {
      res.render('404', {file: file});
  } else {
    let readStream = fs.createReadStream( docRoot + '/' + file);
    res.set('Content-Type', mime.contentType(file) );
    readStream.pipe(res);
  }
});

app.listen(port, () => {
  console.log("Listening on port:" + port);
});
