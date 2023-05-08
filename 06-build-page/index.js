const path = require('path');
const { mkdir, readdir, copyFile, rm, stat } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');

const VARS = {
  output: 'project-dist',
  assets: 'assets',
};

const ASSETS_PATH = path.resolve(__dirname, VARS.assets);
const OUTPUT_PATH = path.resolve(__dirname, VARS.output);

async function createDirectory(path) {
  await mkdir(path, { recursive: true });
}

async function copyFiles(from, to) {
  const files = await readdir(from);

  for (const file of files) {
    const filePath = path.resolve(from, file);
    const destination = path.resolve(to, file);
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      await createDirectory(destination);
      await copyFiles(filePath, destination);
    } else {
      await copyFile(filePath, destination);
    }
  }

  return files;

  return files;
}

async function copyDirectory() {
  await createDirectory(path.resolve(OUTPUT_PATH, 'assets'));
  await copyFiles(ASSETS_PATH, path.resolve(OUTPUT_PATH, 'assets'));
}

async function recreationDirectory(name) {
  await createDirectory(path.resolve(__dirname, VARS.output));
  await rm(name, { recursive: true, force: true });
  await copyDirectory().catch(console.error);
}

recreationDirectory('assets');
