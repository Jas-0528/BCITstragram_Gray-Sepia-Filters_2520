/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date: 
 * Author: Jasmeen Sandhu
 *
 */

const yauzl = require("yauzl-promise"),
  fs = require("fs"),
  { pipeline } = require("stream/promises"),
  PNG = require("pngjs").PNG,
  path = require("path");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

// unzips directory and copies the contents into unzipped directory
const unzip = async(pathIn, pathOut) => {
  //wait for the zip file to open
  const zip = await yauzl.open(path.join(pathIn));
  try{
    //iterate through the zip file
    for await(const entry of zip) {
      //if the entry is a directory, create a directory in the unzipped directory
      if (entry.filename.endsWith('/')) {
        //wait for the directory to be created
        await fs.promises.mkdir(path.join(pathOut, entry.filename), { recursive: true });
    }
    //if the entry is a file, create a read stream and write stream to copy the file into the unzipped directory
      else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(path.join(pathOut, entry.filename));
        //wait for the file to be copied
        await pipeline(readStream, writeStream);
      }
  }
}
//close the zip file
  finally {
    console.log("Extraction operation complete")
    await zip.close();
    return pathOut;
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */

//reads the directory and returns an array of all the png files
const readDir = (dir) => {
  //return a promise that is the array of png files
  return new Promise((resolve, reject) => {
    //read the directory
    fs.readdir(dir, (err, data) => {
      if (err) {
        reject (err);
      }
      else {
        let files = [];
        //check if the file is a png file and add it to the array
        for (let i = 0;  i< data.length; i++){
          let fileExt = `.${data[i].split('.')[1]}`;
          if (fileExt === '.png'){
            files.push(dir+"/"+data[i]);
          }
        }
        //resolve the promise with the array of png files
        resolve(files);
      }
    })
  })
};



/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

//DO ERROR HANDLING
//turns images in the unzipped directory to grayscale
const grayScale = (pathIn, pathOut) => {
  //make the grayscaled directory
  fs.mkdir(pathOut, { recursive: true }, (err) => {
    if (err) throw err;
  });
  //iterate through the array of png files
  for (let image of pathIn){
    //read the png file
    fs.createReadStream(image)
    //send the png file into a transform stream 
      .pipe(
        new PNG({})
      )
      .on("parsed", function(){
        //iterate through the pixels of the png files
        //y is the position of the pixel in the y axis
        //this.height is the height of the png file
        for (let y = 0; y < this.height; y++) {
          //x is the position of the pixel in the x axis
          //this.width is the width of the png file
          for (let x = 0; x < this.width; x++) {
            //idx is the index of the pixel in the pixel array
            //<< 2 is equivalent to multiplying by 4
            let idx = (this.width * y + x) << 2;

            //varibales for the red, green, blue, and alpha values of the pixel
            let r = this.data[idx];
            let g = this.data[idx + 1];
            let b = this.data[idx + 2];

            //convert the pixel to grayscale
            let gray = (r + g + b) / 3;
            this.data[idx] = gray;
            this.data[idx + 1] = gray;
            this.data[idx + 2] = gray;
          }
        }
        //pipe the grayscale image into a write stream and write it to the grayscaled directory
        this.pack().pipe(fs.createWriteStream(path.join(pathOut, path.basename(image))));
      })
  };
}

//add Sepia filter
const sepiaFilter = (pathIn, pathOut) => {
  //make the sepia directory
  fs.mkdir(pathOut, { recursive: true }, (err) => {
    if (err) throw err;
  });
  //iterate through the array of png files
  for (let image of pathIn){
    //read the png file
    fs.createReadStream(image)
    //send the png file into a transform stream 
      .pipe(
        new PNG({})
      )
      .on("parsed", function(){
        //iterate through the pixels of the png files
        //y is the position of the pixel in the y axis
        //this.height is the height of the png file
        for (let y = 0; y < this.height; y++) {
          //x is the position of the pixel in the x axis
          //this.width is the width of the png file
          for (let x = 0; x < this.width; x++) {
            //idx is the index of the pixel in the pixel array
            //<< 2 is equivalent to multiplying by 4
            let idx = (this.width * y + x) << 2;

            //varibales for the red, green, blue, and alpha values of the pixel
            let r = this.data[idx];
            let g = this.data[idx + 1];
            let b = this.data[idx + 2];

            //convert the pixel to sepia
            let tr = (0.393 * r) + (0.769 * g) + (0.189 * b);
            let tg = (0.349 * r) + (0.686 * g) + (0.168 * b);
            let tb = (0.272 * r) + (0.534 * g) + (0.131 * b);
            this.data[idx] = Math.min(255, tr);
            this.data[idx + 1] = Math.min(255, tg);
            this.data[idx + 2] = Math.min(255, tb);
          }
        }
        //pipe the sepia image into a write stream and write it to the sepia directory
        this.pack().pipe(fs.createWriteStream(path.join(pathOut, path.basename(image))));
      })
  };
}


module.exports = {
  unzip,
  readDir,
  grayScale,
  sepiaFilter
};
