# Greenbone Security Assistant [![CircleCI](https://circleci.com/gh/greenbone/gsa/tree/master.svg?style=svg)](https://circleci.com/gh/greenbone/gsa/tree/master)

## About

The Greenbone Security Assistant - **GSA** - is the web interface developed for the
[Greenbone Security Manager appliances](https://www.greenbone.net/en/product-comparison/).
It connects to the Greenbone Vulnerability Manager - **GVM** - to provide for a full-featured
user interface for vulnerability management.

GSA is developed and maintained by [Greenbone Networks](https://www.greenbone.net/).

It consists of

* [GSA NG](https://github.com/greenbone/gsa/tree/master/ng) - The webpage written in [React](https://reactjs.org/)

and

* [GSAD](https://github.com/greenbone/gsa/tree/master/gsad) - The http server talking to the GVM deamon

## Installation

See [INSTALL](./INSTALL.md) for details.

## Usage

Starting Greenbone Security Assistant:

In case everything was installed using the defaults, then starting the http
daemon of the Greenbone Security Assistant can be done with this simple command:

    gsad

The daemon will then listen on port 443, in other words the web interface
is available in your network under "https://<your host>".

If port 443 was not available or the user has no root privileges,
gsad tries to serve at port 9392 as a fallback ("https://<your host>:9392").

To see all available command line options of gsad enter this command:

    gsad --help

## License

Greenbone Security Assistant is licensed under GNU General Public License
Version 2 or any later version. Please see file [LICENSE](./LICENSE) for details.

Copyright (C) by Greenbone Networks GmbH (see https://www.greenbone.net).

Greenbone Security Assistant integrates helper libraries. Respective
copyright and license details are provided in file [COPYING](./COPYING).
