# Greenbone Security Assistant
# $Id$
# Description: CMake find module for yarn package manager
#
# Authors:
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2016 Greenbone Networks GmbH
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

find_package (Node REQUIRED)

find_program (NPM_EXECUTABLE NAMES npm
  HINTS
  $ENV{NODE_DIR}
  PATH_SUFFIXES bin
  DOC "node package manager binary"
)

include (FindPackageHandleStandardArgs)

find_package_handle_standard_args (Npm
  REQUIRED_VARS NPM_EXECUTABLE
)

mark_as_advanced (NPM_EXECUTABLE)
