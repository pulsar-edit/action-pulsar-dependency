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
    shell.exec("git clone https://github.com/pulsar-edit/pulsar");

    // Now time to modify Pulsars package.json
    let packJSON = fs.readFileSync("./pulsar/package.json");
    packJSON = JSON.parse(packJSON);
    packJSON.dependencies[pack] = `../package-${unique}`;

    fs.writeFileSync("./pulsar/package.json", JSON.stringify(packJSON, null, 2));

    // Now to move into the pulsar directory
    shell.cd("pulsar");

    // And to install
    if (shell.exec("yarn install").code !== 0) {
      console.log("Yarn installation Failed!");
      shell.exit(1);
    }

    // Then to build
    if (shell.exec("yarn build").code !== 0) {
      console.log("Yarn Build Failed!");
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
