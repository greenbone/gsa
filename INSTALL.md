INSTALLATION INSTRUCTIONS FOR GREENBONE SECURITY ASSISTANT
==========================================================

Please note: The reference system used by most of the developers is Debian
GNU/Linux 'Stretch' 9. The build might fail on any other system. Also it is
necessary to install dependent development packages.


Prerequisites for Greenbone Security Assistant
----------------------------------------------

See at the end of this section how to easily install these prerequisites on
some supported platforms.

Prerequisites:
* libgvm_base, libgvm_util, libgvm_gmp >= 1.0.0
* gnutls >= 3.2.15
* libgcrypt
* cmake >= 2.8
* glib-2.0 >= 2.32
* libxml
* libmicrohttpd >= 0.9.0
* pkg-config

Prerequisites for using translations:
* gettext
  (when building from source)
* an installed English UTF-8 locale (e.g. "en_US.UTF8", "en_GB.UTF8")
  (See "Setting up translations")

Prerequisites for building documentation:
* Doxygen
* xmltoman (optional, for building man page)

Prerequisites to work on the translations from C based sources and
also to build the JavaScript translations:
* python-polib

Install prerequisites on Debian GNU/Linux:
# apt-get install libmicrohttpd-dev libxml2-dev


Compiling Greenbone Security Assistant
--------------------------------------

If you have installed required libraries to a non-standard location, remember to
set the PKG_CONFIG_PATH environment variable to the location of you pkg-config
files before configuring:

    $ export PKG_CONFIG_PATH=/your/location/lib/pkgconfig:$PKG_CONFIG_PATH

Create a build directory and change into it with

    $ mkdir build
    $ cd build

Then configure the build with

    $ cmake -DCMAKE_INSTALL_PREFIX=/path/to/your/installation ..

or (if you want to use the default installation path /usr/local)

    $ cmake ..

This only needs to be done once.  Note: It is assumed that the other OpenVAS
components are installed to the same path.  If not, you need to set some paths
separately, see below for details.

Thereafter, the following commands are useful.

    $ make                # build the Greenbone Security Assistant
    $ make doc            # build the documentation
    $ make doc-full       # build more developer-oriented documentation
    $ make install        # install the build
    $ make rebuild_cache  # rebuild the cmake cache


In case you have installed the Greenbone Security Assistant into a path
different from the other OpenVAS modules, you might need to set some paths
explicitly before running cmake. The certificate and key locations in
OPENVAS_SERVER_CERTIFICATE, OPENVAS_SERVER_KEY and OPENVAS_CA_CERTIFICATE in
the top level CMakeLists.txt may need modifying.


Compiling Greenbone Security Assistant Next Generation GUI
----------------------------------------------------------

Prerequisites for using the Next Generation GUI:
* node.js >= 6.0
* Either yarn or npm. yarn is faster and more reliable, but younger.

On Debian Jessie node.js is too old. Follow these steps for a
sufficiently new version. Be aware that this will remove your
current installation of node.js, npm and related packages.

```sh
$ curl --silent --show-error https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
$ echo "deb http://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```
```sh
$ curl --silent --show-error https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add -
$ echo "deb http://deb.nodesource.com/node_6.x jessie main" | sudo tee /etc/apt/sources.list.d/nodesource.list
```

```sh
$ sudo apt-get update
```

```sh
$ sudo apt-get install nodejs yarn
```

When using npm you might need to install the additional nodejs legacy symlink.

```sh
$ sudo apt-get install nodejs-legacy
```

Developing Greenbone Security Assistant Next Generation GUI
-----------------------------------------------------------

Installing gsad requires to re-build the JavaScript bundle. This process is
very time consuming and therefore may be avoided during development. It is
possible to run GSA NG in a special web development server. The development
server can be started with:

```sh
$ cd /path/to/gsa-sources/src/html/classic/ng && yarn run start
```

Afterwards the development web server is set up and a new browser window is
opened for the url http://127.0.0.1:8080 containing the GSA NG web application.
If a JavaScript file of GSA NG in the src folder is changed the browser window
will reload automatically.

Besides the development server gsad needs to be running with CORS enabled.

```sh
$ gsad --http-cors="http://127.0.0.1:8080"
```

To be able to communicate with gsad the web application needs to know the server
url. This can be accomplished by editing the
/path/to/gsa-sources/src/html/classic/ng/public/config.js file.
The following lines can be used for a local gsad running with https on port
9392:

```javascript
  config = {
    protocol: 'https',
    server: '127.0.0.1:9392',
  };
```

For http only the protocol property must be 'http' accordingly.

After changing the config.js file the browser window should be reloaded
manually.

Logging Configuration
---------------------

By default GSA writes logs to the file

    <install-prefix>/var/log/gvm/gsad.log

Logging is configured entirely by the file

    <install-prefix>/etc/gvm/gsad_log.conf

The configuration is divided into domains like this one

    [gsad main]
    prepend=%t %p
    prepend_time_format=%Y-%m-%d %Hh%M.%S %Z
    file=/var/log/gvm/gsad.log
    level=128

The "level" field controls the amount of logging that is written.
The value of "level" can be

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

Logging to "syslog" can be enabled in each domain like:

    [gsad main]
    prepend=%t %p
    prepend_time_format=%Y-%m-%d %Hh%M.%S %Z
    file=syslog
    syslog_facility=daemon
    level=128

Setting up translations
-----------------------

To build the translation .mo files, you need to have the gettext tools like
 msgfmt installed. Once the .mo files are built, the tools are no longer
 needed.
(For more information on the creation of translation files, see i18n-howto.txt
 in the GSA source documentation.)

To use the translations you need to have an English locale with UTF-8 encoding
 installed, for example "en_US.UTF8" or "en_GB.UTF8".
The name of this locale then has to be assigned to an environment variable
 recognized by the libc function "setlocale" like LANG, LC_MESSAGES or LC_ALL.
If these environment variables are all unset, set to "C" or an equivalent like
 "POSIX" or invalid, translations will be disabled.


Static code analysis with the Clang Static Analyzer
---------------------------------------------------

If you want to use the Clang Static Analyzer (http://clang-analyzer.llvm.org/)
to do a static code analysis, you can do so by adding the following parameter
when configuring the build:

  -DCMAKE_C_COMPILER=/usr/share/clang/scan-build/ccc-analyzer

Note that the example above uses the default location of ccc-analyzer in Debian
GNU/Linux and may be different in other environments.

To have the analysis results aggregated into a set of HTML files, use the
following command:

    $ scan-build make

The tool will provide a hint on how to launch a web browser with the results.

It is recommended to do this analysis in a separate, empty build directory and
to empty the build directory before "scan-build" call.


Specifying Diffie-Hellman parameters file
---------------------------------------------------

For --dh-params' value to take effect, LibmicroHTTPD version 0.9.35 or higher is
required.
