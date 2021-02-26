#!/usr/bin/env node

// Module collecting build information before build process start.
// Output file/data is used in the settings dialog.
// Usually started after 'git commit' and before 'ng build'.

const child_process = require("child_process");
const fs = require("fs");

const ngswConsfigFileName = "/ngsw-config.json";
const ngswConsfigPath = process.cwd() + ngswConsfigFileName;
const buildInfoFileName = "/src/build-info.ts";
const buildInfoPath = process.cwd() + buildInfoFileName;
start();

function start() {
  const buildInfo = generateBuildInfo();
  saveBuildInfo(buildInfo);
  updateNgswAppData(buildInfo);
}

function generateBuildInfo() {
  const timeStamp = new Date().valueOf();
  const hash = getCommitHash();
  const version = getPackageJsonVersion();
  const buildInfo = { hash, timeStamp, version };
  console.log('Generated build info:', buildInfo);
  return buildInfo;
}

function getCommitHash() {
  let stdout;
  try {
    stdout = child_process.execSync("git rev-parse --short HEAD");
  } catch (error) {
    console.log("child_process.execSync io/git error");
    throw error;
  }
  if (!stdout) {
    throw "child_process.execSync error: git last commit hash not found";
  }
  return stdout.toString().replace("\n", "");
}

function getPackageJsonVersion() {
  let packageJsonString = fs.readFileSync("./package.json", "utf8");
  let packageJson = JSON.parse(packageJsonString);
  return packageJson.version;
}

function saveBuildInfo(buildInfo) {
  const buildInfoStringifyed = JSON.stringify(buildInfo, null, 4).replace(/\"/g, '\'');
  const buildInfoFile =
    "// Build information\n" +
    "export const buildInfo = " +
    buildInfoStringifyed +
    ";\n";

  saveFile(buildInfoPath, buildInfoFile);
  console.log(`Updated buildInfo in ${buildInfoPath}`);
}

function updateNgswAppData(buildInfo) {
  const dataJsonString = readFile(ngswConsfigPath);
  const parsedJson = JSON.parse(dataJsonString);

  parsedJson.appData = { buildInfo };
  const ngswConsfigFile = JSON.stringify(parsedJson, null, 2);

  saveFile(ngswConsfigPath, ngswConsfigFile);
  console.log(`Updated buildInfo in ${ngswConsfigFileName}`);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.log(`An error occured writing to \'${filePath}\'`);
    console.log(error);
    process.abort();
  }
}

function saveFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, data);
  } catch (error) {
    console.log(`An error occured writing to \'${filePath}\'`);
    console.log(error);
    process.abort();
  }
}
