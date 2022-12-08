const core = require("@actions/core");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

(async () => {
  try {
    if (pack === '' || pack == undefined) {
      core.setFailed("No Package has been specified to test!");
    }

    console.log(`Package to test: ${pack}`);

    // First we will copy our current package into a subfolder by it's name
    await copyDir("./", `./${pack}`);

    // then lets get the most up to date Pulsar Master
    await shell.exec("git clone https://github.com/pulsar-edit/pulsar");

    // Now lets move our subfoldered package into the bundled Pulsar Packages
    await copyDir(`./${pack}`, `./pulsar/packages/${pack}`);

    // Now time to modify Pulsars package.json
    let packJson = fs.readFileSync("./pulsar/package.json");
    packJson = JSON.parse(packJson);
    packJson.packageDependencies[pack] = `file:./packages/${pack}`;
    fs.writeFileSync("./pulsar/package.json", JSON.stringify(packJSON, null, 2));

    console.log("Modified Package.json");

    // Now to move into the Pulsar Directory
    await shell.cd("pulsar");

    // Now to add the package via yarn
    const migratePack = await shell.exec(`yarn add file:./packages/${pack}`);

    if (migratePack.code !== 0) {
      console.log("Pack Migration Failed!");
      core.setFailed(migratePack);
    }

    // Now to install
    const install = await shell.exec("yarn install");

    if (install.code !== 0) {
      console.log("Yarn installation failed!");
      core.setFailed(install);
    }

    // Now to build
    const build = await shell.exec("yarn build");

    if (build.code !== 0) {
      console.log("Yarn Build Failed!");
      core.setFailed(build);
    }

    // Now to give some debug info

    console.log("Do our Package Deps look good?");
    const list = await shell.exec(`yarn list --pattern ${pack}`);


  } catch(err) {
    core.setFailed(err);
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
