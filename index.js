const core = require("@actions/core");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");


(async () => {
  try {

    // Now we need the package we are testing.
    const pack = core.getInput('package-to-test');
    const unique = Date.now();

    if (pack === '') {
      core.setFailed('No Package has been specified to test!');
    }

    console.log(`Package to test: ${pack}`);
    console.log(`Unique Number Used: ${unique}`);

    // Now we need to copy the repo files into a subfolder,
    // using a unique name, to ensure the folder we use doesn't already exist.
    await copyDir("./", `./package-${unique}`);

    // Now we want to copy the Pulsar Repo locally
    await shell.exec("git clone https://github.com/pulsar-edit/pulsar");

    // Now time to modify Pulsars package.json
    let packJSON = fs.readFileSync("./pulsar/package.json");
    packJSON = JSON.parse(packJSON);
    //packJSON.dependencies[pack] = `file:../package-${unique}`;
    packJSON.packageDependencies[pack] = `file:../package-${unique}`;

    // What if this error is because the effects are reverted after the fact? As in our lock file is out of date.

    fs.writeFileSync("./pulsar/package.json", JSON.stringify(packJSON, null, 2));

    console.log("Modified Package.json");
    //console.log(`dependencies: ${packJSON.dependencies[pack]}`);
    console.log(`packageDependencies: ${packJSON.packageDependencies[pack]}`);

    // Now to move into the pulsar directory
    await shell.cd("pulsar");

    const migratePack = await shell.exec(`npx yarn add file:../package-${unique}`);

    if (migratePack.code !== 0) {
      console.log("Pack Migration Failed!");
      console.log(migratePack);
      shell.exit(1);
    }

    console.log("Contents of Folder: ");
    console.log(fs.readdirSync(`../package-${unique}`));

    // And to install
    const install = await shell.exec("npx yarn install");
    if (install.code !== 0) {
      console.log("Yarn installation Failed!");
      shell.exit(1);
    }

    // Then to build
    const build = await shell.exec("npx yarn build");
    if (build.code !== 0) {
      console.log("Yarn Build Failed!");
      shell.exit(1);
    }

    // Now to build with APM (rebuild)
    const buildAPM = await shell.exec("npx yarn build:apm");
    if (buildAPM.code !== 0) {
      console.log("Yarn APM Build Failed!");
      shell.exit(1);
    }

    const installAgain = await shell.exec("npx yarn install --ignore-engines --check-files");
    if (installAgain.code !== 0) {
      console.log("Yarn Install Again failed!");
      shell.exit(1);
    }

    let haveTest = fs.readdirSync("./node_modules").includes("atom-jasmine3-test-runner");

    console.log(`Do we have our test runner in our deps? ${haveTest}`);

    const checker = await shell.exec("npx yarn check");
    if (checker.code !== 0) {
      console.log("Yarn check failed!");
      shell.exit(1);
    }

  } catch(err) {
    core.setFailed(err.message);
  }
})();


/**
  * Thanks @KyleMit
  * @see {@link https://stackoverflow.com/a/64255382/12707685}
  */
async function copyDir(src, dest) {
  // Read our file list first, then create it's location, to avoid a loop.
  let entries = fs.readdirSync(src, { withFileTypes: true });
  fs.mkdirSync(dest, { recursive: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      fs.copyFileSync(srcPath, destPath);
  }
}
