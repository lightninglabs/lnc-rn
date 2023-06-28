# lnc-rn Release Process

This document describes the steps needed to release a new version of
`@lightninglabs/lnc-rn` and publish the package to the NPM registry.

We typically release a new version of `lnc-rn` whenever a new version of
`lnc-core` has been released. We want to keep the version numbers in sync
for both packages.

The steps below to should be done in a PR with proper review.

## Update lnc-core version

Run the following command in the root dir of the project to update to the
latest version of `@lightninglabs/lnc-core`.

```sh
$ yarn upgrade @lightninglabs/lnc-core@latest
```

## Versioning

Increment the version number in the
[package.json](https://github.com/lightninglabs/lnc-rn/blob/main/package.json)
file to match the latest version of `@lightninglabs/lnc-core`.

## Update fetch-libraries script

In [fetch-libraries.sh](https://github.com/lightninglabs/lnc-rn/blob/main/fetch-libraries.sh),
update the `VERSION` variable to be the new version number.

## Publishing to NPM

Building and publishing the this package to NPM is handled automatically by
the [npm.yml](https://github.com/lightninglabs/lnc-rn/blob/main/.github/workflows/npm.yml)
Github workflow. This is triggered when a new release is created.

## Github Release

[Draft a new release](https://github.com/lightninglabs/lnc-rn/releases/new)
on Github. Create a new tag and auto-generate the release notes. You do not
need to include any assets.

Once you publish the release, the build and publish to NPM will complete in
a few minutes. You can confirm the new version is published by visiting
https://www.npmjs.com/package/@lightninglabs/lnc-rn

## Post Release

After the release has been published, remember to update the demo apps to use
the latest version of `@lightninglabs/lnc-rn`.
