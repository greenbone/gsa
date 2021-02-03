/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const cpes = [
  {
    pattern: 'cpe:/a:apache:http_server',
    icon: 'cpe/a:apache:http_server.svg',
  },
  {
    pattern: 'cpe:/a:drupal:drupal',
    icon: 'cpe/a:drupal:drupal.svg',
  },
  {
    pattern: 'cpe:/a:gnu',
    icon: 'cpe/a:gnu.svg',
  },
  {
    pattern: 'cpe:/a:google',
    icon: 'cpe/a:google.svg',
  },
  {
    pattern: 'cpe:/a:mysql:mysql',
    icon: 'cpe/a:mysql:mysql.svg',
  },
  {
    pattern: 'cpe:/a:openbsd:openssh',
    icon: 'cpe/a:openbsd:openssh.svg',
  },
  {
    pattern: 'cpe:/a:otrs:otrs',
    icon: 'cpe/a:otrs:otrs.svg',
  },
  {
    pattern: 'cpe:/a:php:php',
    icon: 'cpe/a:php:php.svg',
  },
  {
    pattern: 'cpe:/a:postgresql:postgresql',
    icon: 'cpe/a:postgresql:postgresql.svg',
  },
  {
    pattern: 'cpe:/a:snort:snort',
    icon: 'cpe/a:snort:snort.svg',
  },
  {
    pattern: 'cpe:/a:sourcefire',
    icon: 'cpe/a:sourcefire.svg',
  },
  {
    pattern: 'cpe:/a:typo3:typo3',
    icon: 'cpe/a:typo3:typo3.svg',
  },
  {
    pattern: 'cpe:/a:wordpress:wordpress',
    icon: 'cpe/a:wordpress:wordpress.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:redhat:',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:centos:',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:debian:',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:suse:',
    icon: 'os_suse.svg',
  },
  {
    pattern: 'cpe:/o:novell:',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:trustix:',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:gentoo:',
    icon: 'os_gentoo.svg',
  },
  {
    pattern: 'cpe:/o:hp:',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:sun:',
    icon: 'os_sun.svg',
  },
  {
    pattern: 'cpe:/o:apple:',
    icon: 'os_apple.svg',
  },
  {
    pattern: 'cpe:/o:ibm:aix',
    icon: 'os_aix.svg',
  },
  {
    pattern: 'cpe:/o:cisco:',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:juniper:',
    icon: 'os_junos.svg',
  },
  {
    pattern: 'cpe:/o:freebsd:',
    icon: 'os_freebsd.svg',
  },
  {
    pattern: 'cpe:/o:linux',
    icon: 'os_linux.svg',
  },
  {
    pattern: 'cpe:/o:netbsd:',
    icon: 'os_netbsd.svg',
  },
  {
    pattern: 'cpe:/o:openbsd:',
    icon: 'os_openbsd.svg',
  },
  {
    pattern: 'cpe:/o:univention:univention_corporate_server:',
    icon: 'os_ucs.svg',
  },
  {
    pattern: 'cpe:/o:canonical:ubuntu_linux',
    icon: 'os_ubuntu.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:slackware:',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:vmware:',
    icon: 'os_vmware.svg',
  },
  {
    pattern: 'cpe:/h:hp:',
    icon: 'os_hp.svg',
  },
];

const cpeObject = {
  find: name => cpes.find(cpe => name.includes(cpe.pattern)),
};

export default cpeObject;
