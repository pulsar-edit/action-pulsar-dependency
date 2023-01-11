# Pulsar dependency Github Action

This Action can be used to test a Pulsar package.

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
      - name: Run the headless Pulsar Tests
        uses: GabrielBB/xvfb-action@v1
        with:
          run: pulsar --test spec

```

The above is a valid workflow for any package repository.

Otherwise using `GabrielBB/xvfb-action` is recommended because otherwise the tests will attempt to startup Electron from Pulsar and fail when they are unable to connect to a display.
