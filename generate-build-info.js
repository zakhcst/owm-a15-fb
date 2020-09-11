#!/usr/bin/env node
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

function getVersion() {
  let packageJsonString = fs.readFileSync("./package.json", "utf8");
  let packageJson = JSON.parse(packageJsonString);
  return packageJson.version;
}

function saveBuildInfo() {
  try {
    fs.writeFileSync(
      buildInfoFile,
      "// Build information\n" +
        "export const buildInfo = " +
        JSON.stringify(buildInfo, null, 4) +
        ";\n"
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

const buildInfoFile = process.cwd() + "/src/build-info.ts";
const timeStamp = new Date().valueOf();
const hash = getCommitHash();
const version = getVersion();
const buildInfo = { hash, timeStamp, version };
saveBuildInfo();

// const options = {
//   files: [
//     "src/environments/environment.ts",
//     "src/environments/environment.prod.ts",
//   ],
//   from: [/timeStamp: '(.*)'/g, /hash: '(.*)'/g, /version: '(.*)'/g],
//   to: [
//     "timeStamp: '" + timeStamp + "'",
//     "hash: '" + hash + "'",
//     "version: '" + versionUpdate + "'",
//   ],
//   allowEmptyPaths: false,
// };

// try {
//   const changedFiles = replace.sync(options);
//   if (changedFiles == 0) {
//     throw "No environment files were updated with build info";
//   }
//   console.log("Build timestamp is set to: " + timeStamp);
//   console.log("Build hash is set to: " + hash);
// } catch (error) {
//   console.error("Error occurred:", error);
//   throw error;
// }
