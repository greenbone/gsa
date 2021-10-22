INSTALLATION INSTRUCTIONS FOR GREENBONE SECURITY ASSISTANT
==========================================================

Please note: The reference system used by most of the developers is Debian
GNU/Linux 'Buster' 10. The build might fail on any other system. Also, it is
necessary to install dependent development packages.


Prerequisites for Greenbone Security Assistant
----------------------------------------------

See at the end of this section how to easily install these prerequisites on
some supported platforms.

Prerequisites:
* libxml
* libmicrohttpd >= 0.9.0

Prerequisites for using translations:
* gettext
  (when building from source)
* an installed English UTF-8 locale (e.g. `en_US.UTF8`, `en_GB.UTF8`)
  (See "Setting up translations")

Prerequisites for building documentation:
* Doxygen
* xmltoman (optional, for building man page)

Prerequisites to work on the translations from C based sources and
also to build the JavaScript translations:
* python-polib

Install prerequisites on Debian GNU/Linux:

    apt-get install libmicrohttpd-dev libxml2-dev


Compiling Greenbone Security Assistant GUI
------------------------------------------

Prerequisites for using the GUI:
* node.js >= 10.0
* Either yarn >= 1.0 or npm. yarn is faster and more reliable, but younger.


Developing Greenbone Security Assistant GUI
-------------------------------------------

Installing [gsad](https://github.com/greenbone/gsad/) requires to re-build the JavaScript bundle. This process is
very time-consuming and therefore may be avoided during development. It is
possible to run GSA in a special web development server. The development
server can be started with:

```sh
cd repository-root-dir && yarn run start
```

Afterwards the development web server is set up and a new browser window is
opened at the URL `http://127.0.0.1:8080`, containing the GSA web application.
When a JavaScript file of GSA in the src folder is changed, the browser window
will reload automatically.

Besides the development server [gsad](https://github.com/greenbone/gsad/) needs to be running with CORS enabled.

```sh
gsad --http-cors="http://127.0.0.1:8080"
```

To be able to communicate with gsad, the web application needs to know the server
URL. This can be accomplished by editing the
`/path/to/gsa-sources/ng/public/config.js` file.
The following lines can be used for a local gsad running with HTTPS on port
9392:

```javascript
  config = {
    protocol: 'https',
    server: '127.0.0.1:9392',
  };
```

For HTTP only the protocol property must be `'http'` accordingly.

After changing the `config.js` file, the browser window should be reloaded
manually.


Logging Configuration
---------------------

By default, GSA writes logs to the file

    <install-prefix>/var/log/gvm/gsad.log

Logging is configured entirely by the file

    <install-prefix>/etc/gvm/gsad_log.conf

The configuration is divided into domains like this one

    [gsad main]
    prepend=%t %p
    prepend_time_format=%Y-%m-%d %Hh%M.%S %Z
    file=/var/log/gvm/gsad.log
    level=128

The `level` field controls the amount of logging that is written.
The value of `level` can be:

      4  Errors.
      8  Critical situation.
     16  Warnings.
     32  Messages.
     64  Information.
    128  Debug.  (Lots of output.)

Enabling any level includes all the levels above it. So enabling Information
will include Warnings, Critical situations and Errors.

To get absolutely all logging, set the level to 128 for all domains in the
configuration file.

Logging to `syslog` can be enabled in each domain like:

    [gsad main]
    prepend=%t %p
    prepend_time_format=%Y-%m-%d %Hh%M.%S %Z
    file=syslog
    syslog_facility=daemon
    level=128


Setting up translations
-----------------------

To build the translation `.mo` files, you need to have the `gettext` tools like
`msgfmt` installed. Once the `.mo` files are built, the tools are no longer
needed.
(For more information on the creation of translation files, see the
[i18n-howto.md](gsa/po/i18n-howto.md) file in the GSA source documentation.)

To use the translations, you need to have an English locale with UTF-8 encoding
installed, for example `en_US.UTF8` or `en_GB.UTF8`.  The name of this locale
then has to be assigned to an environment variable recognized by the libc
function `setlocale` like `LANG`, `LC_MESSAGES` or `LC_ALL`.  If these
environment variables are all unset, set to `C` or an equivalent like `POSIX`
or invalid, translations will be disabled.


Specifying Diffie-Hellman parameters file
---------------------------------------------------

For the value of `--dh-params` to take effect, LibmicroHTTPD version 0.9.35 or
higher is required.
