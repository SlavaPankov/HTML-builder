const fs = require('fs');
const path = require('path');
const readline = require('node:readline');
const { stdout, stdin } = process;
const output = fs.createWriteStream(path.resolve(__dirname, 'text.txt'));
const Emitter = require('events');
const emitter = new Emitter();
const readlineInterface = readline.createInterface(
  {
    input: stdin,
  });

stdout.write('Hello, write something\n');
stdout.write('to exit press Ctrl + C or write "exit"\n');

readlineInterface.on('SIGINT', () => {
  readlineInterface.close();
});

readlineInterface.on('line', (input) => {
  emitter.emit('close', input);
  output.write(input + '\n');
});

process.on('SIGINT', () => {
  readlineInterface.close();
});

emitter.on('close', (exit) => {
  if (exit.toLowerCase() === 'exit') {
    readlineInterface.close();
  }
});

process.on('exit', () => stdout.write('Goodbye\n'));
