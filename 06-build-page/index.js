const path = require('path');
const { mkdir, readdir, copyFile, rm, stat } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');

const VARS = {
  output: 'project-dist',
  assets: 'assets',
  components: 'components',
  styles: 'styles',
  stylesBundle: 'style.css',
  template: 'template.html',
};

const ASSETS_PATH = path.resolve(__dirname, VARS.assets);
const OUTPUT_PATH = path.resolve(__dirname, VARS.output);
const COMPONENTS_PATH = path.resolve(__dirname, VARS.components);
const STYLES_PATH = path.resolve(__dirname, VARS.styles);
const TEMPLATE_PATH = path.resolve(__dirname, VARS.template);

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
    const bundleFile = path.resolve(OUTPUT_PATH, VARS.stylesBundle);
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
  const files = await readdir(STYLES_PATH);
  const styles = [];

  for (const file of files) {
    const extension = path.extname(file);

    if (extension === '.css') {
      styles.push(await readFile(path.resolve(STYLES_PATH, file)));
    }
  }

  await createBundle(styles);
}

async function createTemplate() {
  const files = await readdir(COMPONENTS_PATH);
  const templateObj = {};

  for (const file of files) {
    const extension = path.extname(file);

    if (extension === '.html') {
      const filePath = path.resolve(COMPONENTS_PATH, file);
      templateObj[file.split('.')[0]] = await readFile(filePath);
    }
  }

  await replaceTemplate(TEMPLATE_PATH, templateObj);
}

async function replaceTemplate(templatePath, templateObj) {
  const output = createReadStream(templatePath, 'utf-8');
  const outputFile = path.resolve(OUTPUT_PATH, 'index.html');
  const input = createWriteStream(outputFile);

  return new Promise((resolve, reject) => {
    let content = '';

    output.on('data', (chunk) => {
      content += chunk;
    });

    output.on('end', () => {
      let data = content;
      for (const [key, value] of Object.entries(templateObj)) {
        const regExp = new RegExp(`{{${key}}}`, 'g');
        data = data.replace(regExp, value);
      }
      input.write(data);
      input.end();
    });

    output.on('error', (err) => {
      reject(err);
    });

    input.on('finish', () => {
      resolve();
    });

    input.on('error', (err) => {
      reject(err);
    });
  });
}

async function index() {
  await recreationDirectory('assets');
  await checkDirectoryStyles();
  await createTemplate();
}

index();
