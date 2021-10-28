![Greenbone Logo](https://www.greenbone.net/wp-content/uploads/gb_new-logo_horizontal_rgb_small.png)

# Greenbone Security Assistant <!-- omit in toc -->

[![GitHub releases](https://img.shields.io/github/release/greenbone/gsa.svg)](https://github.com/greenbone/gsa/releases)
[![code test coverage](https://codecov.io/gh/greenbone/gsa/branch/main/graph/badge.svg)](https://codecov.io/gh/greenbone/gsa)
[![Build and test JS](https://github.com/greenbone/gsa/actions/workflows/ci-js.yml/badge.svg?branch=main)](https://github.com/greenbone/gsa/actions/workflows/ci-js.yml?query=branch%3Amain++)

The Greenbone Security Assistant is the web interface developed for the
[Greenbone Security Manager appliances](https://www.greenbone.net/en/product-comparison/)
written in [React](https://reactjs.org/).

- [Releases](#releases)
- [Installation](#installation)
- [Developing](#developing)
- [Support](#support)
- [Maintainer](#maintainer)
- [Contributing](#contributing)
- [License](#license)

## Releases

All [release files](https://github.com/greenbone/gsa/releases) are signed with
the [Greenbone Community Feed integrity key](https://community.greenbone.net/t/gcf-managing-the-digital-signatures/101).
This gpg key can be downloaded at https://www.greenbone.net/GBCommunitySigningKey.asc
and the fingerprint is `8AE4 BE42 9B60 A59B 311C  2E73 9823 FAA6 0ED1 E580`.

## Installation

Prerequisites for GSA:
* node.js >= 14.0
* yarn >= 1.0

To install nodejs 14 the following commands can be used

```bash
export VERSION=node_14.x
export KEYRING=/usr/share/keyrings/nodesource.gpg
export DISTRIBUTION="$(lsb_release -s -c)"

curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | sudo tee "$KEYRING" >/dev/null
gpg --no-default-keyring --keyring "$KEYRING" --list-keys

echo "deb [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRIBUTION main" | sudo tee /etc/apt/sources.list.d/nodesource.list
echo "deb-src [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRIBUTION main" | sudo tee -a /etc/apt/sources.list.d/nodesource.list
```

Change into the gsa source directory and delete the possible existing build output
directory.

```bash
cd path/to/gsa
rm -rf build
```

Install the JavaScript dependencies and start the build process. The build process
creates a `build` directory with a production build of GSA. The `build/img` directory
will contain images like logos and banners. The `build/static` directory will contain
generated JavaScript and CSS files and additionally in the `build/static/media`
directory SVG files for all icons will be found.

```bash
yarn
yarn build
```

All content of the production build can be shipped with every web server. For
providing GSA via our [gsad web server](https://github.com/greenbone/gsad/), the
files need to be copied into the `share/gvm/gsad/web/` subdirectory of your
chosen `CMAKE_INSTALL_PREFIX` directory when building `gsad`. Normally this is
set to `/usr` or `/usr/local`.

```bash
cp -r build/* $INSTALL_PREFIX/share/gvm/gsad/web/
```

If you are not familiar or comfortable building from source code, we recommend
that you use the Greenbone Security Manager TRIAL (GSM TRIAL), a prepared virtual
machine with a readily available setup. Information regarding the virtual machine
is available at <https://www.greenbone.net/en/testnow>.

## Developing

Using GSA requires to re-build the JavaScript bundle. This process is very
time-consuming and therefore may be avoided during development. It is possible
to run GSA in a special web development server. The development server can be
started with:

```sh
cd path/to/gsa && yarn run start
```

Afterwards the development web server is set up and a new browser window is
opened at the URL `http://127.0.0.1:8080`, containing the GSA web application.
When a JavaScript file of GSA in the src folder is changed, the browser window
will reload automatically.

Besides the development server [gsad](https://github.com/greenbone/gsad/) needs
to be running with CORS enabled.

```sh
gsad --http-cors="http://127.0.0.1:8080"
```

To be able to communicate with gsad, the web application needs to know the
server URL. This can be accomplished by editing the `path/to/gsa/public/config.js`
file. The following lines can be used for a local gsad running with HTTP on
port 9392:

```javascript
  config = {
    protocol: 'http',
    server: '127.0.0.1:9392',
  };
```

For HTTPS only the protocol property must be `'https'` accordingly.

After changing the `config.js` file, the browser window should be reloaded
manually.

## Support

For any question on the usage of `gsa` please use the [Greenbone Community
Portal](https://community.greenbone.net/c/gse). If you found a problem with the
software, please [create an issue](https://github.com/greenbone/gsa/issues) on
GitHub. If you are a Greenbone customer you may alternatively or additionally
forward your issue to the Greenbone Support Portal.

## Maintainer

This project is maintained by [Greenbone Networks
GmbH](https://www.greenbone.net/).

## Contributing

Your contributions are highly appreciated. Please [create a pull
request](https://github.com/greenbone/gsa/pulls) on GitHub. Bigger changes need
to be discussed with the development team via the [issues section at
github](https://github.com/greenbone/gsa/issues) first.

## License

Copyright (C) 2009-2021 [Greenbone Networks GmbH](https://www.greenbone.net/)

Licensed under the [GNU Affero General Public License v3.0 or later](LICENSE).
