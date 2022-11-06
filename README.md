This Action can be used to test changes of a core Pulsar Dependency.

If you need to determine how your core package dependency will run on the current version of the Pulsar Editor add a workflow file like the following to test with this action:

```yaml
name: CI
on:
  - push
  - pull_request
jobs:
  test:
    name: Test
    strategy:
      matrix:
        os: [ubuntu-20.04, macos-latest, windows-2019]
      fail-fast: false
    runs-on: ${{ matrix.os }}
    steps:
      - name: Checkout the Latest Package Code
        uses: actions/checkout@v3
      - name: Setup Pulsar Editor
        uses: pulsar-edit/action-pulsar-dependency@v2
        with:
          package-to-test: "snippets"
      - name: Run the headless Pulsar Tests
        uses: GabrielBB/xvfb-action@v1
        with:
          run: yarn start --test spec
          working-directory: ./pulsar

```

The above is a valid workflow for the `pulsar-edit/snippets` repository.

To use this on another Core Package Dependency Repository the only value that has to be changed is `package-to-test`.

This value has to match **exactly** with the name of your package in the Pulsar Editor's Dependencies.
For example if you are working in `pulsar-edit/node-pathwatcher` even though your package is named `node-pathwatcher` it's name within Pulsar's Dependency list and it's own `package.json` is just `pathwatcher` so for `package-to-test` you'd just put `pathwatcher`.

Otherwise using `GabrielBB/xvfb-action` is recommended because otherwise the tests will attempt to startup Electron from Pulsar and fail when they are unable to connect to a display. And setting the `working-directory` of `xvfb-action` is **required** because otherwise this command will be run within the root of the action, which will not contain Pulsar tests.
