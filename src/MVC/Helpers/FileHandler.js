async function uploadAvatar(req, pathname, fileIncName) {
  //console.log(req.files);
  if (req.files) {
    let sampleFile;
    let uploadPath;
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    incomingfilename = req.files[fileIncName];
    //console.log(incomingfilename.name);
    sampleFile = incomingfilename;
    imagesplit = incomingfilename.name.split(".");
    uploadname =
      new Date().getTime() +
      "" +
      Math.floor(Math.random() * 100) +
      "." +
      imagesplit.slice(-1);
    uploadPath = pathname + uploadname;
    // console.log("uploadPath",uploadPath)

    // Use the mv() method to place the file somewhere on your server
    return (resultSet = await new Promise((ret, rej) => {
      sampleFile.mv(uploadPath, function (err) {
        if (err) {
          console.log("err", err);
          ret(err);
        } else {
          console.log("uploadname", uploadname);
          ret(uploadname);
        }
      });
    }));
  } else {
    return false;
  }
}

async function uploadImageArrays(req, pathname, fileIncName, position) {
  //console.log(req.files);
  if (req.files) {
    let sampleFile;
    let uploadPath;
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    incomingfilename = req.files[fileIncName][position];
    //console.log(incomingfilename.name);
    sampleFile = incomingfilename;
    imagesplit = incomingfilename.name.split(".");
    uploadname =
      new Date().getTime() +
      "" +
      Math.floor(Math.random() * 100) +
      "." +
      imagesplit.slice(-1);
    uploadPath = pathname + uploadname;
    //console.log("uploadPath",uploadPath)

    // Use the mv() method to place the file somewhere on your server
    return (resultSet = await new Promise((ret, rej) => {
      sampleFile.mv(uploadPath, function (err) {
        if (err) {
          console.log("err", err);
          ret(err);
        } else {
          console.log("uploadname", uploadname);
          ret(uploadname);
        }
      });
    }));
  } else {
    return false;
  }
}

module.exports = { uploadAvatar, uploadImageArrays };
