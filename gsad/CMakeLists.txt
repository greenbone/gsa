# Greenbone Security Assistant
# $Id$
# Description: Cmake control for greenbone-security-assistant daemon
#
# Authors:
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

## Files generated on installation

# generate compile_commands.json file
# see https://clang.llvm.org/docs/JSONCompilationDatabase.html
set(CMAKE_EXPORT_COMPILE_COMMANDS TRUE)

configure_file (src/gsad_log_conf.cmake_in src/gsad_log.conf)

## Install

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/src/gsad_log.conf
         DESTINATION ${GSA_CONFIG_DIR})

add_subdirectory (src)

# vim: set ts=2 sw=2 tw=80:
