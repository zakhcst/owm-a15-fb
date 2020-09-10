const replace = require("replace-in-file");
const child_process = require("child_process");
const fs = require("fs");

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

let packageJsonString = fs.readFileSync("./package.json", "utf8");
let packageJson = JSON.parse(packageJsonString);
let version = packageJson.version.split(".");
version[2] = parseInt(version[2], 10) + 1;
let versionUpdate = version.join(".");
packageJson.version = versionUpdate;
packageJsonString = JSON.stringify(packageJson, null, 2);
try {
  fs.writeFileSync("./package.json", packageJsonString);
} catch (e) {
  throw e;
}

const timeStamp = new Date().valueOf();
const hash = getCommitHash();
const options = {
  files: [
    "src/environments/environment.ts",
    "src/environments/environment.prod.ts",
  ],
  from: [/timeStamp: '(.*)'/g, /hash: '(.*)'/g, /version: '(.*)'/g],
  to: [
    "timeStamp: '" + timeStamp + "'",
    "hash: '" + hash + "'",
    "version: '" + versionUpdate + "'",
  ],
  allowEmptyPaths: false,
};

try {
  const changedFiles = replace.sync(options);
  if (changedFiles == 0) {
    throw "No environment files were updated with build info";
  }
  console.log("Build timestamp is set to: " + timeStamp);
  console.log("Build hash is set to: " + hash);
} catch (error) {
  console.error("Error occurred:", error);
  throw error;
}
