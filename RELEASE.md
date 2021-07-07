# Release instructions

Before creating a new release please do a careful consideration about the
version number for the new release. We are following
[Semantic Versioning](https://semver.org/) with GSA 8.

* Fetch upstream changes and create release branch

  ```sh
  git fetch upstream
  git checkout -b create-new-release upstream/master
  ```

* Open [CMakeLists.txt](https://github.com/greenbone/gsa/blob/master/CMakeLists.txt)
  and increment the version number and check PROJECT_BETA_RELEASE.
  PROJECT_BETA_RELEASE must be unset for a non pre-release.

* Update version at the [package.json](https://github.com/greenbone/gsa/blob/master/gsa/package.json) file.

* Check version at the about page running GSA via gsad.

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

* Update version in [CMakeLists.tx](https://github.com/greenbone/gsa/blob/master/CMakeLists.txt)

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
