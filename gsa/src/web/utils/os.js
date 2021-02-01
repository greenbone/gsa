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

const operating_systems = [
  {
    pattern: 'cpe:/o:microsoft:windows_nt:4.0:sp1',
    title: 'Microsoft Windows 4.0 sp1',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_nt:4.0:sp2',
    title: 'Microsoft Windows 4.0 sp2',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_nt:4.0:sp3',
    title: 'Microsoft Windows 4.0 sp3',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_nt:4.0:sp4',
    title: 'Microsoft Windows 4.0 sp4',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_nt:4.0:sp5',
    title: 'Microsoft Windows 4.0 sp5',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_nt:4.0:sp6',
    title: 'Microsoft Windows 4.0 sp6',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_xp::sp1',
    title: 'Microsoft windows xp_sp1',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_xp::sp2',
    title: 'Microsoft Windows XP Service Pack 2',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_xp::sp3',
    title: 'Microsoft Windows XP Service Pack 3',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_server_2003::sp1',
    title: 'Microsoft Windows Server 2003 Service Pack 1',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_server_2003::sp2',
    title: 'Microsoft Windows Server 2003 Service Pack 2',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_nt',
    title: 'Microsoft Windows NT',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_2000',
    title: 'Microsoft Windows 2000',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_server_2000',
    title: 'Microsoft Windows Server 2000',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_xp',
    title: 'Microsoft Windows XP',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_server_2003',
    title: 'Microsoft Windows Server 2003',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows_embedded',
    title: 'Microsoft Windows Embedded',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:microsoft:windows',
    title: 'Microsoft Windows',
    icon: 'os_windows.svg',
  },
  {
    pattern: 'cpe:/o:redhat:linux:7.3',
    title: 'Red Hat Linux 7.3',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:linux:8.0',
    title: 'Red Hat Linux 8.0',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:linux:9',
    title: 'Red Hat Linux 9.0',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:linux',
    title: 'Red Hat Linux',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora_core:1',
    title: 'Fedora Core 1',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora_core:2',
    title: 'Fedora Core 2',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora_core:3',
    title: 'Fedora Core 3',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora_core:4',
    title: 'Fedora Core 4',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora_core:5',
    title: 'Fedora Core 5',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora_core:6',
    title: 'Fedora Core 6',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:7',
    title: 'Fedora 7',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:8',
    title: 'Fedora 8',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:9',
    title: 'Fedora 9',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:10',
    title: 'Fedora 10',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:11',
    title: 'Fedora 11',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:12',
    title: 'Fedora 12',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:13',
    title: 'Fedora 13',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:14',
    title: 'Fedora 14',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:15',
    title: 'Fedora 15',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:16',
    title: 'Fedora 16',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:17',
    title: 'Fedora 17',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:18',
    title: 'Fedora 18',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:19',
    title: 'Fedora 19',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:20',
    title: 'Fedora 20',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:21',
    title: 'Fedora 21',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:22',
    title: 'Fedora 22',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora:23',
    title: 'Fedora 23',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:fedoraproject:fedora',
    title: 'Fedora',
    icon: 'os_fedora.svg',
  },
  {
    pattern: 'cpe:/o:redhat:enterprise_linux:2.1',
    title: 'Red Hat Enterprise Linux 2.1',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:enterprise_linux:3',
    title: 'Red Hat Enterprise Linux 3',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:enterprise_linux:4',
    title: 'Red Hat Enterprise Linux 4',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:enterprise_linux:5',
    title: 'Red Hat Enterprise Linux 5',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:enterprise_linux:6',
    title: 'Red Hat Enterprise Linux 6',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat:enterprise_linux:7',
    title: 'Red Hat Enterprise Linux 7',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:redhat',
    title: 'Red Hat',
    icon: 'os_redhat.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2010.0',
    title: 'Mandriva Linux 2010.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2010.1',
    title: 'Mandriva Linux 2010.1',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2011.0',
    title: 'Mandriva Linux 2011.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2009.0',
    title: 'Mandriva Linux 2009.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2009.1',
    title: 'Mandriva Linux 2009.1',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2008.1',
    title: 'Mandrake Linux 2008.1',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2008.0',
    title: 'Mandriva Linux 2008.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2007.1',
    title: 'Mandriva Linux 2007.1',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2007.0',
    title: 'Mandriva Linux 2007.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux:2006.0',
    title: 'Mandriva Linux 2006.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandriva:linux',
    title: 'Mandriva Linux',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:10.2',
    title: 'MandrakeSoft Mandrake Linux 10.2',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:10.1',
    title: 'MandrakeSoft Mandrake Linux 10.1',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:10.0',
    title: 'MandrakeSoft Mandrake Linux 10.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:9.2',
    title: 'MandrakeSoft Mandrake Linux 9.2',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:9.1',
    title: 'MandrakeSoft Mandrake Linux 9.1',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:8.1',
    title: 'MandrakeSoft Mandrake Linux 8.1',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:8.0',
    title: 'MandrakeSoft Mandrake Linux 8.0',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux:7.2',
    title: 'MandrakeSoft Mandrake Linux 7.2',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:mandrakesoft:mandrake_linux',
    title: 'MandrakeSoft Mandrake Linux',
    icon: 'os_mandriva.svg',
  },
  {
    pattern: 'cpe:/o:centos:centos:7',
    title: 'CentOS-7',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:centos:centos:6',
    title: 'CentOS-6',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:centos:centos:5',
    title: 'CentOS-5',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:centos:centos:4',
    title: 'CentOS-4',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:centos:centos:3',
    title: 'CentOS-3',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:centos:centos:2',
    title: 'CentOS-2',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:centos:centos',
    title: 'CentOS',
    icon: 'os_centos.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:2.2',
    title: 'Debian Debian Linux 2.2',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:3.0',
    title: 'Debian Debian Linux 3.0',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:3.1',
    title: 'Debian Debian Linux 3.1',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:4.0',
    title: 'Debian GNU/Linux 4.0',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:5.0',
    title: 'Debian GNU/Linux 5.0',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:6.0',
    title: 'Debian GNU/Linux 6.0',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.0',
    title: 'Debian GNU/Linux 7.0',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.1',
    title: 'Debian GNU/Linux 7.1',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.2',
    title: 'Debian GNU/Linux 7.2',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.3',
    title: 'Debian GNU/Linux 7.3',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.4',
    title: 'Debian GNU/Linux 7.4',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.5',
    title: 'Debian GNU/Linux 7.5',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.6',
    title: 'Debian GNU/Linux 7.6',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.7',
    title: 'Debian GNU/Linux 7.7',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.8',
    title: 'Debian GNU/Linux 7.8',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:7.9',
    title: 'Debian GNU/Linux 7.9',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:8.0',
    title: 'Debian GNU/Linux 8.0',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:8.1',
    title: 'Debian GNU/Linux 8.1',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:8.2',
    title: 'Debian GNU/Linux 8.2',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:8.3',
    title: 'Debian GNU/Linux 8.3',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux:8.4',
    title: 'Debian GNU/Linux 8.4',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:debian:debian_linux',
    title: 'Debian GNU/Linux',
    icon: 'os_debian.svg',
  },
  {
    pattern: 'cpe:/o:suse:linux_enterprise_server:12',
    title: 'SuSE Linux Enterprise Server 12',
    icon: 'os_suse.svg',
  },
  {
    pattern: 'cpe:/o:suse:linux_enterprise_server:11',
    title: 'SuSE Linux Enterprise Server 11',
    icon: 'os_suse.svg',
  },
  {
    pattern: 'cpe:/o:suse:linux_enterprise_server:10',
    title: 'SuSE Linux Enterprise Server 10',
    icon: 'os_suse.svg',
  },
  {
    pattern: 'cpe:/o:suse:linux_enterprise_server:9',
    title: 'SuSE Linux Enterprise Server 9',
    icon: 'os_suse.svg',
  },
  {
    pattern: 'cpe:/o:suse:linux_enterprise_server',
    title: 'SuSE Linux Enterprise Server',
    icon: 'os_suse.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:11.3',
    title: 'Novell openSUSE 11.3',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:11.4',
    title: 'Novell openSUSE 11.4',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:12.1',
    title: 'Novell openSUSE 12.1',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:12.2',
    title: 'Novell openSUSE 12.2',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:12.3',
    title: 'Novell openSUSE 12.3',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:13.1',
    title: 'Novell openSUSE 13.1',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:13.2',
    title: 'Novell openSUSE 13.2',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:42.1',
    title: 'Novell openSUSE Leap 42.1',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:11.2',
    title: 'Novell openSUSE 11.2',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:11.1',
    title: 'Novell openSUSE 11.1',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:11.0',
    title: 'Novell opensuse 11.0',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:10.3',
    title: 'Novell opensuse 10.3',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse:10.2',
    title: 'Novell openSUSE 10.2',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:opensuse',
    title: 'Novell openSUSE',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:11.0',
    title: 'Novell SUSE Linux 11.0',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:10.3',
    title: 'Novell SUSE Linux 10.3',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:10.2',
    title: 'Novell SUSE Linux 10.2',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:10.1',
    title: 'Novell SUSE Linux 10.1',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:9.3',
    title: 'Novell SUSE Linux 9.3',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:9.2',
    title: 'Novell SUSE Linux 9.2',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:9.1',
    title: 'Novell SUSE Linux 9.1',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:9.0',
    title: 'Novell SUSE Linux 9.0',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:8.2',
    title: 'Novell SUSE Linux 8.2',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:8.1',
    title: 'Novell SUSE Linux 8.1',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:8.0',
    title: 'Novell SUSE Linux 8.0',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux:7.3',
    title: 'Novell SUSE Linux 7.3',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:novell:suse_linux',
    title: 'Novell SUSE Linux',
    icon: 'os_novell.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:3.0.5',
    title: 'Trustix Secure Linux 3.0.5',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:3.0',
    title: 'Trustix Secure Linux 3.0',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:2.2',
    title: 'Trustix Secure Linux 2.2',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:2.1',
    title: 'Trustix Secure Linux 2.1',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:2.0',
    title: 'Trustix Secure Linux 2.0',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:1.5',
    title: 'Trustix Secure Linux 1.5',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:1.2',
    title: 'Trustix Secure Linux 1.2',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux:1.1',
    title: 'Trustix Secure Linux 1.1',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:trustix:secure_linux',
    title: 'Trustix Secure Linux',
    icon: 'os_trustix.svg',
  },
  {
    pattern: 'cpe:/o:gentoo:linux',
    title: 'Gentoo Linux',
    icon: 'os_gentoo.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:10.01',
    title: 'HP HP-UX 10.01',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:10.10',
    title: 'HP HP-UX 10.10',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:10.20',
    title: 'HP HP-UX 10.20',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:10.24',
    title: 'HP HP-UX 10.24',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:10.26',
    title: 'HP HP-UX 10.26',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:11.00',
    title: 'HP-UX 11.00',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:11.0.4',
    title: 'HP HP-UX 11.0.4',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:11.11',
    title: 'HP-UX 11.11',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:11.20',
    title: 'HP-UX 11i v1.5',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:11.22',
    title: 'HP-UX 11i v1.6',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:11.23',
    title: 'HP-UX 11i v2',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux:11.31',
    title: 'HP-UX 11i v3',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:hp-ux',
    title: 'HP-UX',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:hp:integrated_lights-out',
    title: 'HP Integrated Lights-Out',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:sun:solaris',
    title: 'Sun Solaris',
    icon: 'os_sun.svg',
  },
  {
    pattern: 'cpe:/o:sun:sunos',
    title: 'Sun Solaris',
    icon: 'os_sun.svg',
  },
  {
    pattern: 'cpe:/o:apple:mac_os_x',
    title: 'Apple Mac OS X',
    icon: 'os_apple.svg',
  },
  {
    pattern: 'cpe:/o:ibm:aix',
    title: 'IBM AIX',
    icon: 'os_aix.svg',
  },
  {
    pattern: 'cpe:/o:cisco:nx-os',
    title: 'Cisco NX-OS',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:ios_xr',
    title: 'Cisco IOS XR',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:ios',
    title: 'Cisco IOS',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:asyncos',
    title: 'Cisco AsyncOS',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:cnu-os',
    title: 'Cisco CNU-OS',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:ucos',
    title: 'Cisco UCOS',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:application_deployment_engine',
    title: 'Cisco ADE-OS',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:wireless_lan_controller_software',
    title: 'Cisco Wireless LAN Controller Software',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco:fire_linux_os',
    title: 'Cisco Fire Linux OS',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cisco',
    title: 'Cisco',
    icon: 'os_cisco.svg',
  },
  {
    pattern: 'cpe:/o:cyclades',
    title: 'Cyclades',
    icon: 'os_cyclades.svg',
  },
  {
    pattern: 'cpe:/o:juniper',
    title: 'Juniper',
    icon: 'os_junos.svg',
  },
  {
    pattern: 'cpe:/o:fortinet:fortios',
    title: 'Fortinet',
    icon: 'os_fortinet.svg',
  },
  {
    pattern: 'cpe:/o:freebsd:freebsd',
    title: 'FreeBSD',
    icon: 'os_freebsd.svg',
  },
  {
    pattern: 'cpe:/h:hp:jetdirect',
    title: 'HP Jetdirect',
    icon: 'os_hp.svg',
  },
  {
    pattern: 'cpe:/o:linux:kernel',
    title: 'Linux Kernel',
    icon: 'os_linux.svg',
  },
  {
    pattern: 'cpe:/o:linux:linux_kernel',
    title: 'Linux Kernel',
    icon: 'os_linux.svg',
  },
  {
    pattern: 'cpe:/o:netbsd:netbsd',
    title: 'NetBSD',
    icon: 'os_netbsd.svg',
  },
  {
    pattern: 'cpe:/o:netgear',
    title: 'Netgear',
    icon: 'os_netgear.svg',
  },
  {
    pattern: 'cpe:/o:openbsd:openbsd',
    title: 'OpenBSD',
    icon: 'os_openbsd.svg',
  },
  {
    pattern: 'cpe:/o:altaware:palo_alto_networks_panos',
    title: 'PaloAlto',
    icon: 'os_paloalto.svg',
  },
  {
    pattern: 'cpe:/o:univention:univention_corporate_server:2.2',
    title: 'Univention Corporate Server (UCS) 2.2',
    icon: 'os_ucs.svg',
  },
  {
    pattern: 'cpe:/o:univention:univention_corporate_server:2.3',
    title: 'Univention Corporate Server (UCS) 2.3',
    icon: 'os_ucs.svg',
  },
  {
    pattern: 'cpe:/o:univention:univention_corporate_server:2.4',
    title: 'Univention Corporate Server (UCS) 2.4',
    icon: 'os_ucs.svg',
  },
  {
    pattern: 'cpe:/o:univention:univention_corporate_server',
    title: 'Univention Corporate Server (UCS)',
    icon: 'os_ucs.svg',
  },
  {
    pattern: 'cpe:/o:univention:ucs',
    title: 'Univention Corporate Server (UCS)',
    icon: 'os_ucs.svg',
  },
  {
    pattern: 'cpe:/o:canonical:ubuntu_linux',
    title: 'Canonical Ubuntu Linux',
    icon: 'os_ubuntu.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:greenbone_os:1.6.0',
    title: 'Greenbone OS 1.6',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:greenbone_os:1.7.0',
    title: 'Greenbone OS 1.7',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:greenbone_os:2.0.0',
    title: 'Greenbone OS 2.0',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:greenbone_os:2.1.0',
    title: 'Greenbone OS 2.1',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:greenbone_os:2.2.0',
    title: 'Greenbone OS 2.2',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:greenbone_os:3.0',
    title: 'Greenbone OS 3.0',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:greenbone:greenbone_os',
    title: 'Greenbone OS',
    icon: 'os_gos.svg',
  },
  {
    pattern: 'cpe:/o:ruggedcom:ros',
    title: 'Ruggedcom ROS',
    icon: 'os_ruggedcom.svg',
  },
  {
    pattern: 'cpe:/o:synology:dsm',
    title: 'Synology DSM',
    icon: 'os_synology.svg',
  },
  {
    pattern: 'cpe:/o:arubanetworks:arubaos',
    title: 'Arubanetworks Arubaos',
    icon: 'os_arubanetworks.svg',
  },
  {
    pattern: 'cpe:/o:huawei',
    title: 'Huawei',
    icon: 'os_huawai.svg',
  },
  {
    pattern: 'cpe:/o:sourcefire:linux_os',
    title: 'Sourcefire Linux',
    icon: 'os_sourcefire.svg',
  },
  {
    pattern: 'cpe:/o:checkpoint:gaia_os',
    title: 'Checkpoint Gaia Os',
    icon: 'os_checkpoint.svg',
  },
  {
    pattern: 'cpe:/o:ipfire:linux',
    title: 'Ipfire Linux',
    icon: 'os_ipfire.svg',
  },
  {
    pattern: 'cpe:/o:mcafee:linux_operating_system',
    title: 'McAfee Linux',
    icon: 'os_mcafee.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:8.1',
    title: 'Slackware Linux 8.1',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:9.0',
    title: 'Slackware Linux 9.0',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:9.1',
    title: 'Slackware Linux 9.1',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:10.0',
    title: 'Slackware Linux 10.0',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:10.1',
    title: 'Slackware Linux 10.1',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:10.2',
    title: 'Slackware Linux 10.2',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:11.0',
    title: 'Slackware Linux 11.0',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:slackware:slackware_linux:12.0',
    title: 'Slackware Linux 12.0',
    icon: 'os_slackware.svg',
  },
  {
    pattern: 'cpe:/o:vmware:esxi',
    title: 'VMWare ESXi',
    icon: 'os_vmware.svg',
  },
];

const osObject = {
  operating_systems,
  find: name => operating_systems.find(os => name.includes(os.pattern)),
};

export default osObject;
// vim: set ts=2 sw=2 tw=80:
