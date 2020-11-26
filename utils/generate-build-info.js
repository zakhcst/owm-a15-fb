#!/usr/bin/env node

// Module collecting build information before build process start.
// Output file/data is used in the settings dialog.
// Usually started after 'git commit' and before 'ng build'.

const child_process = require('child_process');
const fs = require('fs');

const outputFile = '/src/build-info.ts';
const buildInfoFile = process.cwd() + outputFile;
const timeStamp = new Date().valueOf();
const hash = getCommitHash();
const version = getVersion();
const buildInfo = { hash, timeStamp, version };
saveBuildInfo();

function getCommitHash() {
  let stdout;
  try {
    stdout = child_process.execSync('git rev-parse --short HEAD');
  } catch (error) {
    console.log('child_process.execSync io/git error');
    throw error;
  }
  if (!stdout) {
    throw 'child_process.execSync error: git last commit hash not found';
  }
  return stdout.toString().replace('\n', '');
}

function getVersion() {
  let packageJsonString = fs.readFileSync('./package.json', 'utf8');
  let packageJson = JSON.parse(packageJsonString);
  return packageJson.version;
}

function saveBuildInfo() {
  try {
    fs.writeFileSync(
      buildInfoFile,
      '// Build information\n' +
        'export const buildInfo = ' +
        JSON.stringify(buildInfo, null, 4) +
        ';\n'
    );
    console.log(`Saved build information to \`${buildInfoFile}\``);
    console.log(buildInfo);
  } catch (error) {
    console.log(
      `An error occured writing to \`${buildInfoFile}\`, does the path exist?`
    );
    console.log(error);
  }
}
