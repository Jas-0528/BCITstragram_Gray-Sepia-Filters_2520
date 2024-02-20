const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathGrayscale = path.join(__dirname, "grayscale");
const pathSepia = path.join(__dirname, "sepia");

IOhandler.unzip(zipFilePath, pathUnzipped)
    .then(() => IOhandler.readDir(pathUnzipped))
    .then((files) => IOhandler.grayScale(files, pathGrayscale))
    .then(() => IOhandler.readDir(pathUnzipped))
    .then((files) => IOhandler.sepiaFilter(files, pathSepia))
    .then(() => console.log("Grayscale and Sepia Filtering operations complete"))
    .catch((err) => console.error(err));

