![Greenbone Logo](https://www.greenbone.net/wp-content/uploads/gb_logo_resilience_horizontal.png)

# Greenbone Security Assistant

[![GitHub releases](https://img.shields.io/github/release/greenbone/gsa.svg)](https://github.com/greenbone/gsa/releases)
[![code test coverage](https://codecov.io/gh/greenbone/gsa/branch/master/graph/badge.svg)](https://codecov.io/gh/greenbone/gsa)
[![CircleCI](https://circleci.com/gh/greenbone/gsa/tree/gsa-8.0.svg?style=svg)](https://circleci.com/gh/greenbone/gsa/tree/master)

The Greenbone Security Assistant is the web interface developed for the
[Greenbone Security Manager
appliances](https://www.greenbone.net/en/product-comparison/).

It connects to the Greenbone Vulnerability Manager **GVM** to provide a
full-featured user interface for vulnerability management.

Greenbone Security Assistant consists of

* [GSA](https://github.com/greenbone/gsa/tree/master/gsa) - The webpage written in [React](https://reactjs.org/)

and

* [GSAD](https://github.com/greenbone/gsa/tree/master/gsad) - The HTTP server talking to the [GVM daemon](https://github.com/greenbone/gvmd)

## Releases

All [release files](https://github.com/greenbone/gsa/releases) are signed with
the [Greenbone Community Feed integrity key](https://community.greenbone.net/t/gcf-managing-the-digital-signatures/101).
This gpg key can be downloaded at https://www.greenbone.net/GBCommunitySigningKey.asc
and the fingerprint is `8AE4 BE42 9B60 A59B 311C  2E73 9823 FAA6 0ED1 E580`.

## Installation

This module can be configured, built and installed with following commands:

    cmake .
    make install

For detailed installation requirements and instructions, please see the file
[INSTALL.md](INSTALL.md).

If you are not familiar or comfortable building from source code, we recommend
that you use the Greenbone Security Manager TRIAL (GSM TRIAL), a prepared virtual
machine with a readily available setup. Information regarding the virtual machine
is available at <https://www.greenbone.net/en/testnow>.

## Usage

In case everything was installed using the defaults, then starting the HTTP
daemon of the Greenbone Security Assistant can be done with this simple command:

    gsad

The daemon will listen on port 443, making the web interface
available in your network at `https://<your host>`.

If port 443 was not available or the user has no root privileges,
gsad tries to serve at port 9392 as a fallback (`https://<your host>:9392`).

To see all available command line options of gsad, enter this command:

    gsad --help

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
