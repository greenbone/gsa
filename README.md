![Greenbone Logo](https://www.greenbone.net/wp-content/uploads/gb_new-logo_horizontal_rgb_small.png)

# Greenbone Security Assistant <!-- omit in toc -->

[![GitHub releases](https://img.shields.io/github/release/greenbone/gsa.svg)](https://github.com/greenbone/gsa/releases)
[![code test coverage](https://codecov.io/gh/greenbone/gsa/branch/main/graph/badge.svg)](https://codecov.io/gh/greenbone/gsa)
[![Build and test JS](https://github.com/greenbone/gsa/actions/workflows/ci-js.yml/badge.svg?branch=main)](https://github.com/greenbone/gsa/actions/workflows/ci-js.yml?query=branch%3Amain++)

The Greenbone Security Assistant is the web interface developed for the
[Greenbone Enterprise appliances](https://www.greenbone.net/en/product-comparison/)
written in [React](https://reactjs.org/).

- [Releases](#releases)
- [Installation](#installation)
- [Developing](#developing)
- [Translations](#translations)
  - [Format](#format)
  - [Updating](#updating)
  - [Support a new Language](#support-a-new-language)
- [Settings](#settings)
  - [Config File](#config-file)
  - [Config Variables](#config-variables)
    - [vendorVersion](#vendorversion)
    - [vendorLabel](#vendorlabel)
    - [guestUsername and guestPassword](#guestusername-and-guestpassword)
    - [disableLoginForm](#disableloginform)
    - [enableStoreDebugLog](#enablestoredebuglog)
    - [logLevel](#loglevel)
    - [timeout](#timeout)
    - [apiServer](#apiserver)
    - [apiProtocol](#apiprotocol)
    - [manualUrl](#manualurl)
    - [manualLanguageMapping](#manuallanguagemapping)
    - [protocolDocUrl](#protocoldocurl)
    - [reloadInterval](#reloadinterval)
    - [reloadIntervalActive](#reloadintervalactive)
    - [reloadIntervalInactive](#reloadintervalinactive)
    - [reportResultsThreshold](#reportresultsthreshold)
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
* node.js >= 18.0

To install nodejs the following commands can be used

```bash
export VERSION=18
export KEYRING=/usr/share/keyrings/nodesource.gpg

curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | sudo tee "$KEYRING" >/dev/null
gpg --no-default-keyring --keyring "$KEYRING" --list-keys

echo "deb [signed-by=$KEYRING] https://deb.nodesource.com/node_$VERSION.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
echo "deb-src [signed-by=$KEYRING] https://deb.nodesource.com/node_$VERSION.x nodistro main" | sudo tee -a /etc/apt/sources.list.d/nodesource.list

sudo apt update && sudo apt install nodejs
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
npm install
npm run build
```

All content of the production build can be shipped with every web server. For
providing GSA via our [gsad web server](https://github.com/greenbone/gsad/), the
files need to be copied into the `share/gvm/gsad/web/` subdirectory of your
chosen `CMAKE_INSTALL_PREFIX` directory when building `gsad`. Normally this is
set to `/usr` or `/usr/local`.

```bash
mkdir -p $INSTALL_PREFIX/share/gvm/gsad/web/
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
cd path/to/gsa && npm run start
```

Afterwards the development web server is set up and a new browser window is
opened at the URL `http://127.0.0.1:8080`, containing the GSA web application.
When a JavaScript file of GSA in the src folder is changed, the browser window
will reload automatically.

Besides the development server [gsad] needs to be running with CORS enabled.

```sh
gsad --http-cors="http://127.0.0.1:8080"
```

To be able to communicate with gsad, the web application needs to know the
server URL. This can be accomplished by editing the [`path/to/gsa/public/config.js`
file](#config-file). The following lines can be used for a local gsad running
with HTTP on port 9392:

```javascript
  config = {
    apiProtocol: 'http',
    apiServer: '127.0.0.1:9392',
  };
```

For HTTPS only the protocol property must be `'https'` accordingly.

After changing the `config.js` file, the browser window should be reloaded
manually.

## Translations

For translations and internationalization [i18next](https://www.i18next.com/) is
used.

With [our configuration of i18next](./src/gmp/locale/lang.js#L45) the
translations are stored in language specific JSON files. The existing
translations can be found at the [public/locales/](./public/locales/) directory.

### Format

The translations are stored in the JSON files as key-value pairs with the key
being the English string and the value the translation of the specific language.
Not translated strings have an empty string `“”` as the value.

Example with German translations:

```json
{
  "Create a new Tag": "Einen neuen Tag erstellen",
  "Create a new Target": "Ein neues Ziel erstellen",
  "Create a new Task": ""
}
```

### Updating

To change or extend translations new values can be added to the specific JSON
file, committed to git and finally uploaded through a pull request to GitHub.

But sometimes the UI changes and new English descriptions are added or existing
ones have been rephrased. In this case the new keys must be extracted from the
source code and added to the JSON files. This can be done by running

```
npm run i18n-extract
```

New translation strings are added with an empty string `“”` as default value.
Therefore searching for empty strings will find the to be translated values.
Keys with a `_plural` suffix can be ignored. They are just added for technical
reasons and are unused.

If not all strings are translated at once the remaining empty strings would
cause missing text in web UI. Therefore, the JSON files must be cleaned up
before adding the changes to git and creating a pull request. To clean up the
JSON files the following command can be used

```
npm run clean-up-translations
```

### Support a new Language

The currently supported languages are listed at [src/gmp/locale/languages.js](./src/gmp/locale/languages.js#L23).
If a new language should be available in the web UI, it needs an entry in this
object. Additionally the corresponding language codes must be added to the
[babel config](./.babelrc) and [cleanup script](./scripts/cleanuptranslations.js).

## Settings

The behavior of GSA can be changed via settings. All of the settings can be
adjusted via a config file. Some of the settings can be changed during runtime
too. Some of them are persistent during reload, some are reset during reload.

This sections lists all settings and explains their behavior.

### Config File

The config file is a normal JavaScript file (with a .js suffix). It is named
`config.js` and will be loaded from  the `/usr/share/gvm/gsad/web/` (or
`/usr/local/share/gvm/gsad/web/`) directory when using [gsad] for providing GSA
e.g. in production environments.

During development when using the on-the-fly-transpiling JavaScript development
server (via `npm run start`) the file is loaded from the `public/` directory.

The `config.js` file must contain a global config object with settings as
properties e.g.

```js
config = {
  // javascript files in contrast to JSON files allow comments
  foo: 'bar',
}
```

It is evaluated in the `GmpSettings` object implemented in the
[gmpsettings.js](./src/gmp/gmpsettings.js) file. The `GmpSettings` object is
instantiated once for the [GSA application](./src/web/app.js#L53)

### Config Variables
| Name                                              | Type                       | Default                                                                          | Changeable during runtime | Persistent after reload |
| ------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- | ------------------------- | ----------------------- |
| [apiProtocol](#apiprotocol)                       | String ('http' or 'https') | `global.location.protocol`                                                       | -                         | x                       |
| [apiServer](#apiserver)                           | String                     | `global.location.host`                                                           | -                         | x                       |
| enableGreenboneSensor                             | Boolean                    | false                                                                            | -                         | x                       |
| [disableLoginForm](#disableloginform)             | Boolean                    | false                                                                            | -                         | x                       |
| [enableStoreDebugLog](#enablestoredebuglog)       | Boolean                    | false                                                                            | x                         | x                       |
| [guestUsername](#guestusername-and-guestpassword) | String                     | undefined                                                                        | -                         | x                       |
| [guestPassword](#guestusername-and-guestpassword) | String                     | undefined                                                                        | -                         | x                       |
| locale                                            | String                     | undefined                                                                        | x                         | x                       |
| [logLevel](#loglevel)                             | String                     | [`'warn'`](./src/gmp/gmpsettings.js#L27)                                         | x                         | x                       |
| [manualUrl](#manualurl)                           | String                     | [https://docs.greenbone.net/GSM-Manual/gos-22.04/](./src/gmp/gmpsettings.js#L24) | -                         | x                       |
| [manualLanguageMapping](#manuallanguagemapping)   | Object                     | undefined                                                                        | -                         | x                       |
| [protocolDocUrl](#protocoldocurl)                 | String                     | [https://docs.greenbone.net/API/GMP/gmp-22.4.html](./src/gmp/gmpsettings.js#L25) | -                         | x                       |
| [reloadInterval](#reloadinterval)                 | Integer                    | [15 * 1000; // fifteen seconds](./src/gmp/gmpsettings.js#L21)                    | x                         | -                       |
| [reloadIntervalActive](#reloadintervalactive)     | Integer                    | [3 * 1000; // three seconds](./src/gmp/gmpsettings.js#L22)                       | x                         | -                       |
| [reloadIntervalInactive](#reloadintervalinactive) | Integer                    | [60 * 1000; // one minute](./src/gmp/gmpsettings.js#L22)                         | x                         | -                       |
| [reportResultsThreshold](#reportresultsthreshold) | Integer                    | [25000](./src/gmp/gmpsettings.js#L26)                                            | x                         | -                       |
| [timeout](#timeout)                               | Integer                    | [300000; // 5 minutes](./src/gmp/gmpsettings.js#L28)                             | x                         | -                       |
| [vendorVersion](#vendorversion)                   | String                     | undefined                                                                        | -                         | x                       |
| [vendorLabel](#vendorlabel)                       | String                     | undefined                                                                        | -                         | x                       |

#### vendorVersion

Allows to adjust the shown product version string at the Login and About pages.

#### vendorLabel

Allows to adjust the product info image at the Login page. It must be a relative
path e.g. `foo.png`. The path will be mapped to `$INSTALL_PREFIX/share/gvm/gsad/web/img/`
on production (with [gsad]) and `gsa/public/img` for the [development server](#developing).

#### guestUsername and guestPassword

Both settings allow to login with a single click. This user has to be set up
carefully. E.g. if this user is created with admin privileges it will have these
permissions after login. Thus be careful when creating a guest user. If
guestUsername is contained in the `config.js` file the `Login as Guest` button
will be shown.

#### disableLoginForm

This setting allows to deactivate the username password form at the Login page.
It can be used to deactivate login for *normal* users.

#### enableStoreDebugLog

Changes to this settings are persistent during browser reload. If the value has
been changed in the browser console e.g. via `gmp.settings.enableStoreDebugLog = true`
the browser window needs to be reloaded to apply this setting. The setting can
be `true`, `false` or `undefined`.

If either enableStoreDebugLog is `true` or it is `undefined` and [logLevel](#loglevel)
is `debug` the changes of the redux store are shown. The store contains all data
visible to the user.

#### logLevel

The value of logLevel is persistent during browser reload. If the value has been
changed e.g. by running `gmp.settings.logLevel = 'debug'` in the browser console
the browser window needs to be reloaded to apply this setting. Also this setting
must be reset via `gmp.settings.logLevel = undefined` to not display the debug
logs anymore and to use the default setting again. If logLevel is set to
`'debug'` and [enableStoreDebugLog](#enablestoredebuglog) is not `false` the
store debug logs are shown too.

#### timeout

This setting specifies as timeout after a data request to our API provided by
[gsad] will fail. Default is 5 minutes (300000 ms).

#### apiServer

Defaults to `window.location.host`. It contains the domain/IP address of the
[gsad] server including the port e.g. `'192.168.10.123:9392'`.

#### apiProtocol

Defaults to `window.location.protocol` and must be either `'http'` or `'https'`.

#### manualUrl

URL to the manual. On a Greenbone Enterprise Appliance the manuals are served
locally and the value is the relative URL `'/manual'`. The URL is used for all
links from help icons pointing to a page at the user manual.

#### manualLanguageMapping

Because we could possibly have a different number of translated manuals then
available locales, a setting for mapping a locale to a corresponding translated
manual is provided. If a current locale isn't mapped it always falls back to the
English (`en`) locale.

#### protocolDocUrl

This setting contains the URL to the public Greenbone Management Protocol (GMP)
documentation. It is https://docs.greenbone.net/API/GMP/gmp-22.4.html and only
used at the About page.

#### reloadInterval

The *standard* interval for reloading data. The default is 15 seconds
(15000 ms).

#### reloadIntervalActive

This interval is used for reloading data on pages with an active process. This
is currently the case for a task list page, task details page, report list page
and report details page containing at least one actively scanning task.
The default is 3 seconds (3000 ms).

#### reloadIntervalInactive

This interval is used instead of [reloadInterval](#reloadinterval) or
[reloadIntervalActive](#reloadintervalactive) for reloading data when GSA
is not the active browser window or tab. The default is 60 seconds (60000 ms).

#### reportResultsThreshold

If the number of filtered results of a shown report extends this threshold only
the report without details is loaded and an information panel is show at the
Hosts, Ports, Applications, Operating Systems, CVEs, Close CVEs and TLS
Certificates tabs to prompt the user for lowering the number of results by
additional filtering. This setting can be used to improve the responsiveness of
the report details page.

## Support

For any question on the usage of `gsa` please use the [Greenbone Community
Portal](https://community.greenbone.net/). If you found a problem with the
software, please [create an issue](https://github.com/greenbone/gsa/issues) on
GitHub. If you are a Greenbone customer you may alternatively or additionally
forward your issue to the Greenbone Support Portal.

## Maintainer

This project is maintained by [Greenbone AG](https://www.greenbone.net/).

## Contributing

Your contributions are highly appreciated. Please [create a pull
request](https://github.com/greenbone/gsa/pulls) on GitHub. Bigger changes need
to be discussed with the development team via the [issues section at
github](https://github.com/greenbone/gsa/issues) first.

## License

Copyright (C) 2009-2023 [Greenbone AG](https://www.greenbone.net/)

Licensed under the AGPL-3.0 [GNU Affero General Public License v3.0 or later](LICENSE).

[gsad]: https://github.com/greenbone/gsad/
