const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const mime = require('mime-types');

// read configuration parameters
const readConfig = require('./readConfig')
const port = readConfig.port();
const docRoot = readConfig.docRoot();
const hostName = readConfig.hostName();

const app = express();
app.set('view engine', 'ejs');


app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use('/assets', express.static('./public/assets'));


app.get('/', (req,res) => {
  console.log(req.url);
  fs.readdir(docRoot, (err, files) => {
    let musicFiles = files.filter((file) => {
      return file.match(/\.(m4a|mp3)$/)
    });

    let subDirs = [];
    files.forEach(
      (file) => {
        let dir = docRoot + '/' + file;
        console.log("dir:" + dir);
        fs.stat(dir, (err, stats) => {
          if (err) throw err;
          // console.log(JSON.stringify(stats,null,2));
          if ( stats.isDirectory() ) {
            console.log(dir + ": is a directory.");
            subDirs.push(dir);
          } else {
            console.log(dir + ": is NOT a directory.");
          }
        });
    }
  ); // app.get

  console.log("subDirs:" + JSON.stringify(subDirs,null,2));
  console.log('Got ' + musicFiles.length + ' files.');
  res.render('index', {files: musicFiles, dirs: subDirs});
})
});

app.get('/play/:file', (req,res) => {
  let file = req.params.file.replace(/\+/g, ' ');
  console.log("requested:" + file);
  if ( ! fs.existsSync( docRoot + '/' + file)) {
    res.render('404', {file: file});
  } else {
    let readStream = fs.createReadStream( docRoot + '/' + file);
    res.set('Content-Type', mime.contentType(file) );
    readStream.pipe(res);
  }
});

app.listen(port, hostName, () => {
  console.log("Listening on port:" + port);
});
