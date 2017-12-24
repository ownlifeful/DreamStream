const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const mime = require('mime-types');
const path = require('path');

// read configuration parameters
const readConfig = require('./readConfig')
const port = readConfig.port();
const docRoot = readConfig.docRoot();
const hostName = readConfig.hostName();

const app = express();
app.set('view engine', 'ejs');

// Static routes
app.use('/favicon.ico', express.static('./public/favicon.ico'));
app.use('/assets', express.static('./public/assets'));


function showIndex(req,res,next) {
  console.log('INDEX: req.url:' + req.url);
  fs.readdir(musicRoot, (err, files) => {

    if (err) {
      console.log(err);
      throw err;
    }

    if ( ! files ) {
      let errMessage = "ERROR: There are no files in directory [" + musicRoot + "]";
      console.log(errMessage);
      throw errMessage;
    }

    // get musicFiles
    let musicFiles = files.filter((file) => {
      // console.log("music:" + file);
      return /\.(m4a|mp3)$/.test(file);
    });
    // console.log("musicFiles:" + JSON.stringify(musicFiles,null,2));

    // get subDirs
    let subDirs = files
    .map((file) => {
        return {
          short: dirname + '/' + file,
          base: path.basename(file),
          full: musicRoot + '/' + file
        }
      }
    )
    .filter((dir) => fs.statSync(dir.full).isDirectory());

    let crumbs = musicRoot.split('/');

    // console.log("subDirs:" + JSON.stringify(subDirs,null,2));
    console.log('INDEX: Got ' + musicFiles.length + ' files.');
    console.log("INDEX: musicRoot:" + musicRoot);
    console.log("INDEX: dirname:" + dirname);
    res.render('index',
      {
        files: musicFiles,
        dirs: subDirs,
        crumbs: crumbs,
        dirname: ( dirname ? dirname.replace(/ /g, '+') + '/' : '' )
      });
  }); // fs.readdir

}

let dirname = '';
let musicRoot = '';

app.get('/', (req,res,next) => {
  musicRoot = docRoot + '/';
  dirname = '';
  console.log("ROOT dirname:" + dirname);
  console.log("ROOT musicRoot:" + musicRoot);
  next();
},
showIndex); // app.get

app.get('/dir/*', (req,res,next) => {
  dirname = req.url;
  dirname = dirname.replace(/^\/dir\//, '');
  dirname = dirname.replace(/\+/g, ' ');
  musicRoot = docRoot + '/' + dirname;
  console.log("DIR dirname:" + dirname);
  console.log("DIR musicRoot:" + musicRoot);
  next();
}, showIndex); // app.get dir

app.get('/play/*', (req,res) => {

  dirname = '';
  musicRoot = docRoot;

  let file = req.url;
  // console.log('file0:[' + file + ']'); // DEBUG
  file = file.replace(/^\/play\//, '');
  // console.log('file1:[' + file + ']'); // DEBUG
  file = file.replace(/\+/g, ' ');
  console.log("PLAY: requested:" + file);
  let fileFullname = musicRoot + '/' + file;
  console.log("PLAY: musicRoot:" + musicRoot);
  console.log("PLAY: requested fileFullname:" + fileFullname);

  if ( fs.existsSync( fileFullname )) {
    let readStream = fs.createReadStream( fileFullname );
    res.set('Content-Type', mime.contentType( path.basename(file) ) );
    readStream.pipe(res);
  } else {
    res.render('404', {file: file});
  }
});


app.listen(port, () => {
  console.log("Listening on port:" + port);
});
