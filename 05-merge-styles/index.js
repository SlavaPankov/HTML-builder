const { readdir, stat} = require('fs/promises');
const { createWriteStream, createReadStream } = require('fs');
const path = require('path');

const VARS = {
  bundleName: 'bundle.css',
  stylesDirectory: 'styles',
  bundleDirectory: 'project-dist',
};
const STYLES_DIRECTORY = path.resolve(__dirname, VARS.stylesDirectory);
const BUNDLE_DIRECTORY = path.resolve(__dirname, VARS.bundleDirectory);

function readFile(file) {
  return new Promise((resolve, reject) => {
    let content = '';
    let output = createReadStream(file, 'utf-8');

    output.on('data', (chunk) => {
      content += chunk;
    });

    output.on('end', () => resolve(content));

    output.on('error', (err) => reject(err));
  });
}

function createBundle(styles) {
  return new Promise((resolve, reject) => {
    const bundleFile = path.resolve(BUNDLE_DIRECTORY, VARS.bundleName);
    const input = createWriteStream(bundleFile, { flags: 'w' });

    for (const style of styles) {
      input.write(style);
    }

    input.on('finish', () => resolve());

    input.on('error', (err) => reject(err));

    input.end();
  });
}

async function checkDirectoryStyles() {
  const files = await readdir(STYLES_DIRECTORY);
  const styles = [];

  for (const file of files) {
    const extension = path.extname(file);

    if (extension === '.css') {
      styles.push(await readFile(path.resolve(STYLES_DIRECTORY, file)));
    }
  }

  await createBundle(styles);
}

checkDirectoryStyles();
