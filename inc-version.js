#!/usr/bin/env node

// To set version increase as git pre-commit hook
// set a soft link from '.git/hooks' to 'in-version.js'
// .git/hooks/ln -s ../../inc-version.js pre-commit

const fs = require("fs");
const child_process = require("child_process");
let packageJsonString;
const packageJsonPath = process.cwd() + "/package.json";

function readFile() {
  packageJsonString = fs.readFileSync(packageJsonPath, "utf8");
}

function updateVersion() {
  let packageJson = JSON.parse(packageJsonString);
  let version = packageJson.version;
  let versionSegments = version.split(".");
  versionSegments[2] = parseInt(versionSegments[2], 10) + 1;
  let versionUpdate = versionSegments.join(".");
  packageJson.version = versionUpdate;
  packageJsonString = JSON.stringify(packageJson, null, 2);
  console.log(
    `Increased package.json version from ${version} to ${versionUpdate}`
  );
}

function saveFile() {
  fs.writeFileSync(packageJsonPath, packageJsonString);
}

function addPackageJsonToCommit() {
  let stdout;
  try {
    stdout = child_process.execSync("git add package.json");
  } catch (error) {
    console.log("child_process.execSync io/git error");
    throw error;
  }
  if (!stdout) {
    throw "child_process.execSync error: git last commit hash not found";
  }
  return stdout.toString().replace("\n", "");
}

console.log("pre-commit hook inc-version");
readFile();
updateVersion();
saveFile();
addPackageJsonToCommit();