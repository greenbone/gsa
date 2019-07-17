# Copyright (C) 2009-2018 Greenbone Networks GmbH
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

message ("-- Configuring Greenbone Security Assistant...")

project (greenbone-security-assistant
         VERSION 8.0.1
         LANGUAGES C)


if (POLICY CMP0005)
  cmake_policy (SET CMP0005 NEW)
endif (POLICY CMP0005)

SET(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

if (NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Debug)
endif (NOT CMAKE_BUILD_TYPE)

## Retrieve git revision (at configure time)
include (GetGit)

## make format
message (STATUS "Looking for clang-format...")
find_program (CLANG_FORMAT clang-format)

if (CLANG_FORMAT)
  message (STATUS "Looking for clang-format... ${CLANG_FORMAT}")
  add_custom_target(format COMMAND ${CLANG_FORMAT} "-i" "./gsad/src/*.c"
                    "./gsad/src/*.h" WORKING_DIRECTORY "${CMAKE_SOURCE_DIR}")
else (CLANG_FORMAT)
  message (STATUS "clang-format not found...")
endif (CLANG_FORMAT)

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

# Set beta version if this is a beta release series,
# unset if this is a stable release series.
# set (PROJECT_BETA_RELEASE 1)

if (GIT_REVISION)
  set (PROJECT_VERSION_GIT "${GIT_REVISION}")
else (GIT_REVISION)
  set (PROJECT_VERSION_GIT "")
endif (GIT_REVISION)

# If PROJECT_BETA_RELEASE is set, the version string will be set to:
#   "major.minor+beta${PROJECT_BETA_RELEASE}"
# If PROJECT_BETA_RELEASE is NOT set, the version string will be set to:
#   "major.minor.patch"
if (PROJECT_BETA_RELEASE)
  set (PROJECT_VERSION_SUFFIX "+beta${PROJECT_BETA_RELEASE}")
elseif (DEFINED PROJECT_VERSION_PATCH AND NOT PROJECT_VERSION_PATCH STREQUAL "")
  set (PROJECT_VERSION_SUFFIX ".${PROJECT_VERSION_PATCH}")
endif (PROJECT_BETA_RELEASE)

set (PROJECT_VERSION_STRING "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}${PROJECT_VERSION_SUFFIX}${PROJECT_VERSION_GIT}")

configure_file (VERSION.in VERSION)

## CPack configuration

set (CPACK_CMAKE_GENERATOR "Unix Makefiles")
set (CPACK_GENERATOR "TGZ")
set (CPACK_INSTALL_CMAKE_PROJECTS ".;greenbone-security-assistant;ALL;/")
set (CPACK_MODULE_PATH "")
set (CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/LICENSE")
set (CPACK_RESOURCE_FILE_README "${CMAKE_SOURCE_DIR}/README.md")
set (CPACK_RESOURCE_FILE_WELCOME "${CMAKE_SOURCE_DIR}/README.md")
set (CPACK_SOURCE_GENERATOR "TGZ")
set (CPACK_SOURCE_TOPLEVEL_TAG "")
set (CPACK_SYSTEM_NAME "")
set (CPACK_TOPLEVEL_TAG "")

set (CPACK_PACKAGE_VERSION "${PROJECT_VERSION_STRING}${PROJECT_VERSION_GIT}")

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

set (GSAD_DATA_DIR "${DATADIR}/gvm/gsad")
set (GSAD_LOCALE_SUBDIR "locale")
set (GSAD_LOCALE_DIR "${GSAD_DATA_DIR}/${GSAD_LOCALE_SUBDIR}")
set (GSAD_CHROOT_LOCALE_DIR "/${GSAD_LOCALE_SUBDIR}")

# TODO: Eventually use own certificates
if (NOT GVM_SERVER_CERTIFICATE)
  set (GVM_SERVER_CERTIFICATE "${GVM_STATE_DIR}/CA/servercert.pem")
else (NOT GVM_SERVER_CERTIFICATE)
  set (GVM_SERVER_CERTIFICATE "${GVM_SERVER_CERTIFICATE}")
endif (NOT GVM_SERVER_CERTIFICATE)

if (NOT GVM_SERVER_KEY)
  set (GVM_SERVER_KEY "${GVM_STATE_DIR}/private/CA/serverkey.pem")
else (NOT GVM_SERVER_KEY)
  set (GVM_SERVER_KEY "${GVM_SERVER_KEY}")
endif (NOT GVM_SERVER_KEY)

if (NOT GVM_CA_CERTIFICATE)
  set (GVM_CA_CERTIFICATE "${GVM_STATE_DIR}/CA/cacert.pem")
else (NOT GVM_CA_CERTIFICATE)
  set (GVM_CA_CERTIFICATE "${GVM_CA_CERTIFICATE}")
endif (NOT GVM_CA_CERTIFICATE)

set (GSAD_CONFIG_DIR         "${SYSCONFDIR}/gvm/")

if (NOT GVM_RUN_DIR)
  set (GVM_RUN_DIR      "${LOCALSTATEDIR}/run")
endif (NOT GVM_RUN_DIR)

message ("-- Install prefix: ${CMAKE_INSTALL_PREFIX}")

## Version

set (GSAD_VERSION "${PROJECT_VERSION_STRING}")

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
