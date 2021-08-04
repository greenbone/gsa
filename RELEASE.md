# Release instructions

Before creating a new release please do a careful consideration about the
version number for the new release. We are following
[Calendar Versioning](https://calver.org/) with GSA 20.08.

* Fetch upstream changes and create release branch

  ```sh
  git fetch upstream
  git checkout -b <username>/prepare-new-release upstream/gsa-<version>
  ```

* Test the build

  ```sh
  mkdir build
  cd build
  cmake -DCMAKE_BUILD_TYPE=Release ..
  make -j6
  ```

* Update [CHANGELOG.md](https://github.com/greenbone/gsa/blob/master/CHANGELOG.md)

* Unset the `dev` version to `0` in [CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/CMakeLists.txt), [gsa/CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/gsa/CMakeLists.txt), and [gsad/CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/gsad/CMakeLists.txt)
`set (PROJECT_DEV_VERSION 1)` -> `set (PROJECT_DEV_VERSION 0)`

* Remove the `.dev1` from the version string in [package.json](https://github.com/greenbone/gsa/blob/master/gsa/package.json) and [version.js](https://github.com/greenbone/gsa/blob/master/gsa/src/version.js)

* Create a git commit

  ```sh
  git add .
  git commit -m "Prepare release <version>"
  ```

* Create an annotated git tag. We are using calendar versioning starting with a v, e.g. `v21.4.1`.

  ```sh
  git tag -a v<version>
  ```

  or even better a signed tag with your gpg key

  ```sh
  git tag -s v<version>
  ```

* Push changes and tag to GitHub

  ```sh
  git push --tags upstream
  ```

* Create a PR for your changes and get it reviewed and merged into the branch you want to release

Now you need to create a GitHub release. This will include the actual release and adding signatures and signed binaries of the source code and node modules.

* Create GitHub release  
  * Navigate to the main page of the repository
  * Click on "Releases"
  * Click "Draft a new release"
  * Select the version number you want to release in the "Version Tag" input.
  * Select the branch you want to release in the "Target:" input
  * As title add `Greenbone Security Assistant (GSA) <version>`
  * Copy the relevant [CHANGELOG.md](https://github.com/greenbone/gsa/blob/master/CHANGELOG.md) entries into the description
  * If you are ready to release, click on "Publish release", otherwise you can save it as a draft.
* Sign the release
  * Go to the "Releases" section on GitHub and download the source code tarballs created automatically by GitHub
  * Go to your source directory in your development environment and compress the `node_modules` as tar.gz and .zip. If you change branches a lot, before you compress the directory, you might want to make sure that the node modules are actually correct by deleting the folder and creating it again by running `yarn`.
  * Make sure that the source code tarballs contain the same data as the git repository
  * Sign _all four_ files with your key
  ```sh
  gpg --default-key 0ED1E580 --detach-sign -a xyz.tar.gz
  gpg --default-key 0ED1E580 --detach-sign -a xyz.zip
  ```
  This will create files with an .asc file type. If .sig files were created, you probably didn't use the option `--armor` or `-a`.
  * Rename the node modules files and their signatures with the approriate version into, e.g. `gsa-node-modules-<version>.tar.gz`.
  * Edit your release again and add the following files as binary
    * the .tar.gz and .zip files of the node modules
    * both of their detached signatures
    * both detached signatures of the source code tarballs
  * Click "Update release"

  For further information see https://help.github.com/articles/creating-releases/

  ## Cleanup after the release
  * Create a new, empty unreleased section in the `CHANGELOG.md` file
  * Update the version in _all_ version files:
    * increment the version in the `CMakeLists.txt` files, and set `dev` version again (`set (PROJECT_DEV_VERSION 1)`)
    * increment the version in [package.json](https://github.com/greenbone/gsa/blob/master/gsa/package.json) and [version.js](https://github.com/greenbone/gsa/blob/master/gsa/src/version.js) and add a `.dev1` flag to the version.
  * Create new PR with these changes. Only after this PR is merged, the release is  done.
