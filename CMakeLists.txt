# Greenbone Security Assistant
# $Id$
# Description: Top-level cmake control for greenbone-security-assistant
#
# Authors:
# Matthew Mundell <matthew.mundell@intevation.de>
# Michael Wiegand <michael.wiegand@intevation.de>
#
# Copyright:
# Copyright (C) 2009 Greenbone Networks GmbH
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2,
# or, at your option, any later version as published by the Free
# Software Foundation
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

cmake_minimum_required (VERSION 2.6)

if (POLICY CMP0005)
  cmake_policy (SET CMP0005 OLD)
endif (POLICY CMP0005)

SET (CMAKE_BUILD_TYPE debug)

## Check existence required tools

SET (MANDATORY_TOOL_MISSING FALSE)

FIND_PROGRAM(PATH_TO_PKGCONFIG pkg-config DOC "pkg-config program to retrieve "
                        "information about installed libraries in the system.")

FIND_PROGRAM(PATH_TO_LIBOPENVASCONFIG libopenvas-config DOC "libopenvas-config program"
                        " to retrieve information about installed"
                        " openvas-libraries in the system.")

MESSAGE(STATUS "Looking for pkg-config... ${PATH_TO_PKGCONFIG}")
IF(NOT PATH_TO_PKGCONFIG)
  SET(MANDATORY_TOOL_MISSING TRUE)
ENDIF(NOT PATH_TO_PKGCONFIG)

MESSAGE(STATUS "Looking for libopenvas-config... ${PATH_TO_LIBOPENVASCONFIG}")
IF(NOT PATH_TO_LIBOPENVASCONFIG)
  SET(MANDATORY_TOOL_MISSING TRUE)
ENDIF(NOT PATH_TO_LIBOPENVASCONFIG)

IF(MANDATORY_TOOL_MISSING)
  IF(NOT PATH_TO_PKGCONFIG)
    MESSAGE("The pkg-config tool is required.")
  ENDIF(NOT PATH_TO_PKGCONFIG)
  IF(NOT PATH_TO_LIBOPENVASCONFIG)
     MESSAGE("The libopenvas-config tool is required (part of openvas-libraries).")
  ENDIF(NOT PATH_TO_LIBOPENVASCONFIG)
  MESSAGE(FATAL_ERROR "One or more tools or libraries could not be found on "
                      "your system. Please check the logs above.")
ENDIF(MANDATORY_TOOL_MISSING)

# TODO: Check for libmicrohttpd, rats, flawfinder, splint, doxygen.
#       (with the later 4 being optional)

## CPack configuration

SET(CPACK_CMAKE_GENERATOR "Unix Makefiles")
SET(CPACK_GENERATOR "TGZ")
SET(CPACK_INSTALL_CMAKE_PROJECTS ".;greenbone-security-assistant;ALL;/")
SET(CPACK_MODULE_PATH "")
SET(CPACK_RESOURCE_FILE_LICENSE "COPYING")
SET(CPACK_RESOURCE_FILE_README "README")
SET(CPACK_RESOURCE_FILE_WELCOME "README")
SET(CPACK_SOURCE_GENERATOR "TGZ")
SET(CPACK_SOURCE_TOPLEVEL_TAG "")
SET(CPACK_SYSTEM_NAME "")
SET(CPACK_TOPLEVEL_TAG "")
# TODO: Parse version numbers from file VERSION (see also below)
SET(CPACK_PACKAGE_VERSION_MAJOR "0")
SET(CPACK_PACKAGE_VERSION_MINOR "8")
SET(CPACK_PACKAGE_VERSION_PATCH "3.SVN")
SET(CPACK_PACKAGE_VERSION "${CPACK_PACKAGE_VERSION_MAJOR}.${CPACK_PACKAGE_VERSION_MINOR}.${CPACK_PACKAGE_VERSION_PATCH}")
SET(CPACK_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
SET(CPACK_SOURCE_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
SET(CPACK_PACKAGE_VENDOR "The OpenVAS Project")
SET(CPACK_SOURCE_IGNORE_FILES
"/.svn/"
"/_CPack_Packages/"
"/CMakeFiles/"
"cmake$"
"swp$"
"Cache.txt$"
".tar.gz"
"install_manifest.txt"
"Makefile"
)

INCLUDE(CPack)

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

set (OPENVAS_STATE_DIR "${LOCALSTATEDIR}/lib/openvas")
set (OPENVAS_LOG_DIR   "${LOCALSTATEDIR}/log/openvas")
set (GSAD_PID_DIR   "${LOCALSTATEDIR}/run")
set (GSA_STATE_DIR "${OPENVAS_STATE_DIR}/gsa")

set (OPENVAS_LIB_INSTALL_DIR    "${LIBDIR}")
set (OPENVAS_HEADER_INSTALL_DIR "${INCLUDEDIR}")
# TODO: Eventually use own certificates
set (OPENVAS_SERVER_CERTIFICATE "${OPENVAS_STATE_DIR}/CA/servercert.pem")
set (OPENVAS_SERVER_KEY         "${OPENVAS_STATE_DIR}/private/CA/serverkey.pem")
set (OPENVAS_CA_CERTIFICATE     "${OPENVAS_STATE_DIR}/CA/cacert.pem")

# TODO: Eventually have all configurations collected here:
set (GSA_CONFIG_DIR         "${SYSCONFDIR}/openvas/")
set (GSA_CONFIG_FILE        "${SYSCONFDIR}/openvas/gsa.conf")

set (CMAKE_BUILD                Debug)
set (CMAKE_VERBOSE_MAKEFILE     ON)

message ("-- Install prefix: ${CMAKE_INSTALL_PREFIX}")

## Version

file (READ VERSION _GSAD_VERSION)
STRING (REPLACE "
" "" GSAD_VERSION ${_GSAD_VERSION})

## Program

set (CMAKE_C_FLAGS_DEBUG        "${CMAKE_C_FLAGS_DEBUG} -Wall")
set (CMAKE_C_FLAGS              "${CMAKE_C_FLAGS} -Wall")

add_subdirectory (src)

## Documentation

# add_subdirectory (doc)

## End
