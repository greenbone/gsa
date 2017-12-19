[![CircleCI](https://circleci.com/gh/greenbone/gsa/tree/master.svg?style=svg)](https://circleci.com/gh/greenbone/gsa/tree/master)

About Greenbone Security Assistant
----------------------------------

The Greenbone Security Assistant is the web interface developed for the
Greenbone Security Manager appliances. It connects to the Greenbone
Vulnerability Manager to provide for a full-featured user interface
for vulnerability management.

Greenbone Security Assistant is licensed under GNU General Public License
Version 2 or any later version. Please see file COPYING for details.

Copyright (C) by Greenbone Networks GmbH (see http://www.greenbone.net).

Greenbone Security Assistant integrates helper libraries. Respective
copyright and license details are provided in file COPYING. 


Howto use
---------

Starting Greenbone Security Assistant:

In case everything was installed using the defaults, then starting the daemon
of the Greenbone Security Assistant can be done with this simple command:

    gsad

The daemon will then listen on port 443, in other words the web interface
is available in your network under "https://<your host>".

If port 443 was not available, gsad tries to serve at port 9392 as a fallback
("https://<your host>:9392").

To see all available command line options of gsad enter this command:

    gsad --help
