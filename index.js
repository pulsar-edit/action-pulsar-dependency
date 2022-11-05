const core = require("@actions/core");
const github = require("@actions/github");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");


(async () => {
  try {

    // First lets move the current repo's code into a subfolder
    //await copyDir("./", "./package");

    // Then we need to clone the current Pulsar Repo
    //shell.exec("git clone https://github.com/pulsar-edit/pulsar");

    // Now we need the package we are testing.
    const pack = core.getInput('package-to-test');

    if (pack === '') {
      core.setFailed('No Package has been specified to test!');
    }

    // Now with the package we know we are testing, lets update the `package.json`
    // to point to the local copy of this package.

    //let packJSON = require("./pulsar/package.json");
    //packJSON.dependencies[pack] = `./${pack}`;

    // Now with the package.json poiting to our local dependencies, we will save the file
    //fs.writeFileSync("./pulsar/package.json", JSON.stringify(packJSON, null, 2));

    // Then lets run our commands to install, build, and run test
    //shell.exec("yarn install");
    //shell.exec("yarn build");
    //shell.exec("yarn start --test spec");


    console.log(`Package to test: ${pack}`);
    console.log(`Current Dir: ${__dirname}`);
    console.log("Our Current Files:");
    console.log(fs.readdirSync(src, { withFileTypes: true }));

  } catch(err) {
    core.setFailed(err.message);
  }
})();


/**
  * Thanks @KyleMit
  * @see {@link https://stackoverflow.com/a/64255382/12707685}
  */
async function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      fs.copyFileSync(srcPath, destPath);
  }
}
