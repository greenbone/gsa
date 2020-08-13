# Release instructions

Before creating a new release please do a careful consideration about the
version number for the new release. We are following
[Calendar Versioning](https://calver.org/) with GSA 20.8.

* Fetch upstream changes and create release branch

  ```sh
  git fetch upstream
  git checkout -b create-new-release upstream/master
  ```

* Open [CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/CMakeLists.txt)
  and increment the version number and check PROJECT_BETA_RELEASE.
  PROJECT_BETA_RELEASE must be unset for a non pre-release.

* Open [gsa/CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/gsa/CMakeLists.txt)
  and increment to the same version number.

* Open [gsad/CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/gsad/CMakeLists.txt)
  and increment to the same version number.

* Update version at the [package.json](https://github.com/greenbone/gsa/blob/master/gsa/package.json) file.

* Check version at the about page running GSA via gsad.

* Open [gsa/src/gmp/gmpsettings.js](https://github.com/greenbone/gsa/blob/master/gsa/src/gmp/gmpsettings.js)
  and check the links for the manual (DEFAULT_MANUAL_URL and
  DEFAULT_PROTOCOLDOC_URL variables).

* Test the build

  ```sh
  mkdir build
  cd build
  cmake -DCMAKE_BUILD_TYPE=Release ..
  make -j6
  ```

* Update [CHANGELOG.md](https://github.com/greenbone/gsa/blob/master/CHANGELOG.md)

* Create a git commit

  ```sh
  git add .
  git commit -m "Prepare release <version>"
  ```

* Create an annotated git tag

  ```sh
  git tag -a v<version>
  ```

  or even better a signed tag with your gpg key

  ```sh
  git tag -s v<version>
  ```

* Update version in [CMakeLists.tx](https://github.com/greenbone/gsa/blob/master/CMakeLists.txt),
  [gsa/CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/gsa/CMakeLists.txt),
  [gsad/CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/gsad/CMakeLists.txt)
  and [package.json](https://github.com/greenbone/gsa/blob/master/gsa/package.json)
  files.

* Update [CHANGELOG.md](https://github.com/greenbone/gsa/blob/master/CHANGELOG.md)
  with draft for next release.

* Create a commit

  ```sh
  git commit -m "Update version after <version> release"
  ```

* Push changes and tag to Github

  ```sh
  git push --tags upstream master
  ```

* Create a Github release

  See https://help.github.com/articles/creating-releases/

* Create node modules tarball

  ```sh
  cd gsa
  rm -rf node_modules
  yarn install
  tar cvzf gsa-node-modules-<version>.tar.gz node_modules
  ```

* Download release files from [GitHub release page](https://github.com/greenbone/gsa/releases)

* Create GPG signatures for release files

  ```sh
  gpg --default-key 0ED1E580 --detach-sign --armor gsa-<version>.tar.gz
  gpg --default-key 0ED1E580 --detach-sign --armor gsa-<version>.zip
  gpg --default-key 0ED1E580 --detach-sign --armor gsa-note-modules-<version>.tar.gz
  ```

* Upload node modules tarball and signatures (.asc files) to the
  [GitHub release page](https://github.com/greenbone/gsa/releases)
