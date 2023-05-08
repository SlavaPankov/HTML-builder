const { mkdir, readdir, copyFile, rm } = require('fs/promises');
const path = require('path');
const directoryPath = path.resolve(__dirname, 'files');

async function createDirectory(name) {
  await mkdir(name, { recursive: true });
}

async function copyFiles(from, to) {
  const files = await readdir(from);
  files.map(file => {
    return copyFile(path.resolve(from, file), path.resolve(to, file));
  });
  return files;
}

async function copyDirectory() {
  const newDirectoryName = directoryPath.split(path.sep)[directoryPath.split(path.sep).length - 1];
  await createDirectory(path.resolve(__dirname, `${newDirectoryName}-copy`));
  await copyFiles(directoryPath, path.resolve(__dirname, `${newDirectoryName}-copy`));
}

async function recreationDirectory(name) {
  await rm(name, { recursive: true, force: true });
  await copyDirectory().catch(console.error);
}

recreationDirectory('files').then(() => process.exit()).catch((err) => {
  console.error(err);
  process.exit(1);
});
