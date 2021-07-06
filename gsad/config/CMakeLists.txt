# Copyright (C) 2019 Greenbone Networks GmbH
#
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.


if (NOT SYSTEMD_SERVICE_DIR)
  set (SYSTEMD_SERVICE_DIR "/lib/systemd/system")
endif (NOT SYSTEMD_SERVICE_DIR)

if (NOT LOGROTATE_DIR)
  set (LOGROTATE_DIR "${SYSCONFDIR}/logrotate.d")
endif (NOT LOGROTATE_DIR)

configure_file (gsad.service.in gsad.service)
configure_file (gsad.logrotate.in gsad.logrotate)

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/gsad.service
         DESTINATION ${SYSTEMD_SERVICE_DIR}/)

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/gsad.logrotate
         DESTINATION ${LOGROTATE_DIR}/ RENAME gsad)
