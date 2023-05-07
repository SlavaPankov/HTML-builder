const fs = require('fs/promises');
const path = require('path');
const { stdout, exit } = process;
const folderPath = path.resolve(__dirname, 'secret-folder');

fs.readdir(folderPath, { withFileTypes: true })
  .then((array) => {
    const arrayFiles = array.map(direntObj => {
      return {
        name: direntObj.name,
        isFile: direntObj.isFile(),
        extension: path.extname(path.resolve(folderPath, direntObj.name)).replace('.', ''),
      };
    }).filter((file) => file.isFile);

    const promise = arrayFiles.map((file) => {
      return fs.stat(path.resolve(folderPath, file.name))
        .then((result) => {
          file.size = result.size;
          return file;
        });
    });

    return Promise.all(promise);
  })
  .then((result) => {
    result.forEach((item) => {
      stdout.write(`${item.name.split('.')[0]} - ${item.extension} - ${item.size}kb \n`);
    });
    exit();
  });
