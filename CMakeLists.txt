# Copyright (C) 2009-2020 Greenbone Networks GmbH
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

cmake_minimum_required (VERSION 3.0)

message ("-- Configuring Greenbone Security Assistant")

# VERSION: Set patch version for stable releases, e.g. "9.0.0",
#          unset patch version for prereleases, e.g. "9.0"
project (greenbone-security-assistant
         VERSION 20.04)

SET(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

if (NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Debug)
endif (NOT CMAKE_BUILD_TYPE)

## Retrieve git revision (at configure time)
include (GetGit)

if (NOT CMAKE_BUILD_TYPE MATCHES "Release")
  if (EXISTS "${CMAKE_SOURCE_DIR}/.git/")
    if (GIT_FOUND)
      Git_GET_REVISION(${CMAKE_SOURCE_DIR} ProjectRevision)
      set (GIT_REVISION "~git-${ProjectRevision}")
    else (GIT_FOUND)
      set (GIT_REVISION "~git")
    endif (GIT_FOUND)
  endif (EXISTS "${CMAKE_SOURCE_DIR}/.git/")
endif (NOT CMAKE_BUILD_TYPE MATCHES "Release")

# set if this is in prerelease status, starting at 0 before first beta release,
# unset if this is a stable release series.
set (PROJECT_BETA_RELEASE 0)

if (GIT_REVISION)
  set (PROJECT_VERSION_GIT "${GIT_REVISION}")
else (GIT_REVISION)
  set (PROJECT_VERSION_GIT "")
endif (GIT_REVISION)

string(LENGTH ${PROJECT_VERSION_MINOR} PROJECT_VERSION_MINOR_LENGTH)

if (PROJECT_VERSION_MINOR_LENGTH LESS 2)
  set (PROJECT_VERSION_MINOR_STRING "0${PROJECT_VERSION_MINOR}")
else ()
  set (PROJECT_VERSION_MINOR_STRING "${PROJECT_VERSION_MINOR}")
endif ()

# If PROJECT_BETA_RELEASE is set to "0", the version string will be set to:
#   "major.minor+alpha"
# If PROJECT_BETA_RELEASE is set otherwise, the version string will be set to:
#   "major.minor+beta${PROJECT_BETA_RELEASE}"
# If PROJECT_BETA_RELEASE is NOT set, the version string will be set to:
#   "major.minor.patch"
if (DEFINED PROJECT_BETA_RELEASE AND NOT PROJECT_BETA_RELEASE STREQUAL "")
  if (PROJECT_BETA_RELEASE STREQUAL "0")
    set (PROJECT_VERSION_SUFFIX "+alpha")
  else (PROJECT_BETA_RELEASE STREQUAL "0")
    set (PROJECT_VERSION_SUFFIX "+beta${PROJECT_BETA_RELEASE}")
  endif (PROJECT_BETA_RELEASE STREQUAL "0")
elseif (DEFINED PROJECT_VERSION_PATCH AND NOT PROJECT_VERSION_PATCH STREQUAL "")
  set (PROJECT_VERSION_SUFFIX ".${PROJECT_VERSION_PATCH}")
endif (DEFINED PROJECT_BETA_RELEASE AND NOT PROJECT_BETA_RELEASE STREQUAL "")

set (PROJECT_VERSION_STRING "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR_STRING}${PROJECT_VERSION_SUFFIX}${PROJECT_VERSION_GIT}")

## Variables

if (NOT SYSCONFDIR)
  set (SYSCONFDIR "${CMAKE_INSTALL_PREFIX}/etc")
endif (NOT SYSCONFDIR)

if (NOT EXEC_PREFIX)
  set (EXEC_PREFIX "${CMAKE_INSTALL_PREFIX}")
endif (NOT EXEC_PREFIX)

if (NOT BINDIR)
  set (BINDIR "${EXEC_PREFIX}/bin")
endif (NOT BINDIR)

if (NOT SBINDIR)
  set (SBINDIR "${EXEC_PREFIX}/sbin")
endif (NOT SBINDIR)

if (NOT LIBDIR)
  set (LIBDIR "${EXEC_PREFIX}/lib")
endif (NOT LIBDIR)

if (NOT LOCALSTATEDIR)
  set (LOCALSTATEDIR "${CMAKE_INSTALL_PREFIX}/var")
endif (NOT LOCALSTATEDIR)

if (NOT INCLUDEDIR)
  set (INCLUDEDIR "${CMAKE_INSTALL_PREFIX}/include")
endif (NOT INCLUDEDIR)

if (NOT DATADIR)
  set (DATADIR "${CMAKE_INSTALL_PREFIX}/share")
endif (NOT DATADIR)

if (NOT GSAD_PID_DIR)
  set (GSAD_PID_DIR "${LOCALSTATEDIR}/run")
endif (NOT GSAD_PID_DIR)

if (NOT GVM_STATE_DIR)
  set (GVM_STATE_DIR "${LOCALSTATEDIR}/lib/gvm")
else (NOT GVM_STATE_DIR)
  set (GVM_STATE_DIR "${GVM_STATE_DIR}")
endif (NOT GVM_STATE_DIR)

if (NOT GVM_LOG_DIR)
  set (GVM_LOG_DIR "${LOCALSTATEDIR}/log/gvm")
else (NOT GVM_LOG_DIR)
  set (GVM_LOG_DIR "${GVM_LOG_DIR}")
endif (NOT GVM_LOG_DIR)

# TODO: Eventually use own certificates

message ("-- Install prefix: ${CMAKE_INSTALL_PREFIX}")


if (SKIP_SRC)
  # ng has no documentation to build so skip if src should not be build
  set (SKIP_GSA ON)
  set (SKIP_GSAD ON)
endif (SKIP_SRC)

if (NOT SKIP_GSA)
  add_subdirectory (gsa)
endif (NOT SKIP_GSA)

if (NOT SKIP_GSAD)
  add_subdirectory (gsad)
endif (NOT SKIP_GSAD)

## Documentation

add_subdirectory (gsad/doc)

# vim: set ts=2 sw=2 tw=80:
