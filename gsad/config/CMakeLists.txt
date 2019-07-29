# Copyright (C) 2019 Greenbone Networks GmbH
#
# SPDX-License-Identifier: GPL-2.0-or-later
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.

if (NOT SYSTEMD_SERVICE_DIR)
  set (SYSTEMD_SERVICE_DIR "${CMAKE_INSTALL_PREFIX}/lib/systemd/system")
endif (NOT SYSTEMD_SERVICE_DIR)

if (NOT DEFAULT_CONFIG_DIR)
  set (DEFAULT_CONFIG_DIR "${CMAKE_INSTALL_PREFIX}/etc/default")
endif (NOT DEFAULT_CONFIG_DIR)

if (NOT LOGROTATE_DIR)
  set (LOGROTATE_DIR "${CMAKE_INSTALL_PREFIX}/etc/logrotate.d")
endif (NOT LOGROTATE_DIR)

configure_file (gsad.service.in gsad.service)
configure_file (gsad.logrotate.in gsad.logrotate)

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/gsad.service
         DESTINATION ${SYSTEMD_SERVICE_DIR}/)

install (FILES ${CMAKE_CURRENT_SOURCE_DIR}/gsad.default
         DESTINATION ${DEFAULT_CONFIG_DIR}/ RENAME gsad)

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/gsad.logrotate
         DESTINATION ${LOGROTATE_DIR}/ RENAME gsad)

