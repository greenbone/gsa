# Greenbone Security Assistant
# $Id$
# Description: Top-level cmake control for greenbone-security-assistant
#
# Authors:
# Matthew Mundell <matthew.mundell@greenbone.net>
# Michael Wiegand <michael.wiegand@greenbone.net>
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2009 - 2017 Greenbone Networks GmbH
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

message ("-- Configuring greenbone-security-assistant...")

project (greenbone-security-assistant C)

cmake_minimum_required (VERSION 2.8)

if (POLICY CMP0005)
  cmake_policy (SET CMP0005 NEW)
endif (POLICY CMP0005)

# Needed for 'pkg_check_modules' function
include (FindPkgConfig)

SET(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

if (NOT PKG_CONFIG_FOUND)
  message(FATAL_ERROR "pkg-config executable not found. Aborting.")
endif (NOT PKG_CONFIG_FOUND)

if (NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Debug)
endif (NOT CMAKE_BUILD_TYPE)

if (NOT SERVE_STATIC_ASSETS EQUAL 0)
  set (SERVE_STATIC_ASSETS 1)
endif (NOT SERVE_STATIC_ASSETS EQUAL 0)

## Project version
# The following three variables should be set through the project command once
# we require CMake >= 3.0
set (PROJECT_VERSION_MAJOR 7)
set (PROJECT_VERSION_MINOR 1)
set (PROJECT_VERSION_PATCH 0)

# Set beta version if this is a beta release series,
# unset if this is a stable release series.
set (PROJECT_BETA_RELEASE 1)

# If PROJECT_BETA_RELEASE is set, the version string will be set to:
#   "major.minor+beta${PROJECT_BETA_RELEASE}"
# If PROJECT_BETA_RELEASE is NOT set, the version string will be set to:
#   "major.minor.patch"
if (PROJECT_BETA_RELEASE)
  set (PROJECT_VERSION_SUFFIX "+beta${PROJECT_BETA_RELEASE}")
else (PROJECT_BETA_RELEASE)
  set (PROJECT_VERSION_SUFFIX ".${PROJECT_VERSION_PATCH}")
endif (PROJECT_BETA_RELEASE)

set (PROJECT_VERSION_STRING "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}${PROJECT_VERSION_SUFFIX}")

configure_file (VERSION.in VERSION)

## CPack configuration

set (CPACK_CMAKE_GENERATOR "Unix Makefiles")
set (CPACK_GENERATOR "TGZ")
set (CPACK_INSTALL_CMAKE_PROJECTS ".;greenbone-security-assistant;ALL;/")
set (CPACK_MODULE_PATH "")
set (CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/COPYING")
set (CPACK_RESOURCE_FILE_README "${CMAKE_SOURCE_DIR}/README.md")
set (CPACK_RESOURCE_FILE_WELCOME "${CMAKE_SOURCE_DIR}/README.md")
set (CPACK_SOURCE_GENERATOR "TGZ")
set (CPACK_SOURCE_TOPLEVEL_TAG "")
set (CPACK_SYSTEM_NAME "")
set (CPACK_TOPLEVEL_TAG "")

set (CPACK_PACKAGE_VERSION "${PROJECT_VERSION_STRING}${PROJECT_VERSION_SVN}")

set (CPACK_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
set (CPACK_SOURCE_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
set (CPACK_PACKAGE_VENDOR "Greenbone Networks")
set (CPACK_SOURCE_IGNORE_FILES
    "${CMAKE_BINARY_DIR}"
    "/.git/"
    "swp$"
)

include (CPack)

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

set (GVM_STATE_DIR "${LOCALSTATEDIR}/lib/gvm")
set (GVM_LOG_DIR   "${LOCALSTATEDIR}/log/gvm")
set (GSA_DATA_DIR "${DATADIR}/gvm/gsad")
set (GSA_LOCALE_SUBDIR "locale")
set (GSA_LOCALE_DIR "${GSA_DATA_DIR}/${GSA_LOCALE_SUBDIR}")
set (GSA_CHROOT_LOCALE_DIR "/${GSA_LOCALE_SUBDIR}")

# TODO: Eventually use own certificates
set (GVM_SERVER_CERTIFICATE "${GVM_STATE_DIR}/CA/servercert.pem")
set (GVM_SERVER_KEY         "${GVM_STATE_DIR}/private/CA/serverkey.pem")
set (GVM_CA_CERTIFICATE     "${GVM_STATE_DIR}/CA/cacert.pem")

set (GSA_CONFIG_DIR         "${SYSCONFDIR}/gvm/")

if (NOT GVM_RUN_DIR)
  set (GVM_RUN_DIR      "${LOCALSTATEDIR}/run")
endif (NOT GVM_RUN_DIR)

message ("-- Install prefix: ${CMAKE_INSTALL_PREFIX}")

## Version

set (GSAD_VERSION "${PROJECT_VERSION_STRING}")

## Program

set (HARDENING_FLAGS            "-D_FORTIFY_SOURCE=2 -fstack-protector")
set (LINKER_HARDENING_FLAGS     "-Wl,-z,relro -Wl,-z,now")

set (CMAKE_C_FLAGS              "${CMAKE_C_FLAGS} -Wall -Wformat -Wformat-security")

set (CMAKE_C_FLAGS_DEBUG        "${CMAKE_C_FLAGS_DEBUG} -Werror")
set (CMAKE_C_FLAGS_RELEASE      "${CMAKE_C_FLAGS_RELEASE} ${HARDENING_FLAGS}")

if (NOT SKIP_SRC)
  # ng has no documentation to build so skip if src should not be build
  add_subdirectory (ng)
  add_subdirectory (gsad)
endif (NOT SKIP_SRC)

## Documentation

add_subdirectory (gsad/doc)

# vim: set ts=2 sw=2 tw=80:
