# Greenbone Security Assistant
# $Id$
# Description: Cmake control for greenbone-security-assistant daemon
#
# Authors:
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2017 Greenbone Networks GmbH
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

## Check existence required tools

find_program (PATH_TO_XSLTPROC xsltproc DOC "xsltproc command line "
              "xslt processor.")

## Files generated on installation

add_custom_target (cpe-icon-dict
                   COMMENT "Generating CPE icon dictionary"
                   COMMAND sh
                   "${CMAKE_SOURCE_DIR}/tools/generate-cpe-icon-dict.sh" --src_path "${CMAKE_CURRENT_SOURCE_DIR}/src/html/classic/img/cpe" > ${CMAKE_CURRENT_BINARY_DIR}/cpe-icons.xml
                   WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/tools)

add_custom_target (zone-dict
                   COMMENT "Generating timezone dictionary"
                   COMMAND sh "${CMAKE_SOURCE_DIR}/tools/generate-zone-dict.sh" > ${CMAKE_CURRENT_BINARY_DIR}/zones.xml
                   WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/tools)

configure_file (src/gsad_log_conf.cmake_in src/gsad_log.conf)

## Install

install (FILES src/html/classic/gsad.xsl
               src/html/classic/omp.xsl
               src/html/classic/robots.txt
               src/html/classic/os.xml
         DESTINATION ${GSA_DATA_DIR}/classic)

install (FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/language_names.tsv
         DESTINATION ${GSA_DATA_DIR})

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/src/gsad_log.conf
         DESTINATION ${GSA_CONFIG_DIR})

add_subdirectory (src)

# vim: set ts=2 sw=2 tw=80:
