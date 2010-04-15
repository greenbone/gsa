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

# Needed for 'pkg_check_modules' function
include (FindPkgConfig)

message ("-- Configuring greenbone-security-assistant...")

project (greenbone-security-assistant C)

cmake_minimum_required (VERSION 2.6)

if (POLICY CMP0005)
  cmake_policy (SET CMP0005 OLD)
endif (POLICY CMP0005)

set (CMAKE_BUILD_TYPE debug)

## Check existence required tools

set (MANDATORY_TOOL_MISSING FALSE)

find_program (PATH_TO_PKGCONFIG pkg-config DOC "pkg-config program to retrieve "
                        "information about installed libraries in the system.")

find_program (PATH_TO_LIBOPENVASCONFIG libopenvas-config DOC "libopenvas-config program"
                        " to retrieve information about installed"
                        " openvas-libraries in the system.")

## TODO this check is obsolete with the FindPkgConfig module (see below,
## pkg_check_module sets OKG_CONFIG_FOUND)
message (STATUS "Looking for pkg-config... ${PATH_TO_PKGCONFIG}")
if (NOT PATH_TO_PKGCONFIG)
  set (MANDATORY_TOOL_MISSING TRUE)
endif (NOT PATH_TO_PKGCONFIG)

message (STATUS "Looking for libopenvas-config... ${PATH_TO_LIBOPENVASCONFIG}")
if (NOT PATH_TO_LIBOPENVASCONFIG)
  set (MANDATORY_TOOL_MISSING TRUE)
endif (NOT PATH_TO_LIBOPENVASCONFIG)

if (MANDATORY_TOOL_MISSING)
  if (NOT PATH_TO_PKGCONFIG)
    message ("The pkg-config tool is required.")
  endif (NOT PATH_TO_PKGCONFIG)
  if (NOT PATH_TO_LIBOPENVASCONFIG)
     message ("The libopenvas-config tool is required (part of openvas-libraries).")
  endif (NOT PATH_TO_LIBOPENVASCONFIG)
  message (FATAL_ERROR "One or more tools or libraries could not be found on "
                      "your system. Please check the logs above.")
endif (MANDATORY_TOOL_MISSING)

# TODO: Check for (optional) rats, flawfinder, splint, doxygen.

## Check for existance of required libraries
pkg_check_modules (LIBS REQUIRED libmicrohttpd>=0.4.2 libxml-2.0 glib-2.0 
                   gthread-2.0)

pkg_check_modules (GSAD_LIBS REQUIRED libxslt gnutls)

# TODO The version check of libopenvas will probably be required by other
# modules, too (e.g. openvas-manager). Either
# 1) Move to the next CMake version with built-in version comparison functions
# 2) Use the pkg-config configuration file that kost provided when installing
#    openvas-libraries
# 3) Move following checks in an own CMake- module to reuse. Other parts of
#    the various CMakeLists.txt could be moved in a common ("openvas") module,
#    too.

## Check version of libopenvas
# Obtain libopenvas version number
exec_program (libopenvas-config
              ARGS --version
              OUTPUT_VARIABLE LIBOPENVAS_VERSION)
# Make a (per definition: semicolon separated) list of it
string (REGEX REPLACE "\\." ";" LO_VER ${LIBOPENVAS_VERSION})
list (GET LO_VER 0 LO_MAJOR_VER)
list (GET LO_VER 1 LO_MINOR_VER)
list (GET LO_VER 2 LO_PATCH_VER)
set (LIBOPENVAS_SUFFICIENT TRUE)
# TODO Would like something like set (MIN_LO_VER "3" "0" "1")
#      which would then make it easier to modify these. However, had serious
#      issues with the conditionals, thus this clumsy implementation.
if (   ${LO_MAJOR_VER} LESS 3
    OR ${LO_MAJOR_VER} EQUAL 3 AND ${LO_MINOR_VER} LESS 0
    OR ${LO_MAJOR_VER} EQUAL 3 AND ${LO_MINOR_VER} EQUAL 0 AND ${LO_PATCH_VER} LESS 1 )
    message ("openvas-libraries version >= 3.0.1 not found.")
    set (LIBOPENVAS_SUFFICIENT FALSE)
endif (   ${LO_MAJOR_VER} LESS 3
       OR ${LO_MAJOR_VER} EQUAL 3 AND ${LO_MINOR_VER} LESS 0
       OR ${LO_MAJOR_VER} EQUAL 3 AND ${LO_MINOR_VER} EQUAL 0 AND ${LO_PATCH_VER} LESS 1 )

if (NOT LIBS_FOUND OR NOT GSAD_LIBS_FOUND OR NOT LIBOPENVAS_SUFFICIENT)
  message (FATAL_ERROR "One or more reguired libraries was not found "
                       "(see message above), please install the missing "
                       "libraries and run cmake again.")
endif (NOT LIBS_FOUND OR NOT GSAD_LIBS_FOUND OR NOT LIBOPENVAS_SUFFICIENT)

## Retrieve svn revision (at configure time)
#  Not using Subversion_WC_INFO, as it would have to connect to the repo
FIND_PROGRAM(SVN_EXECUTABLE svn DOC "subversion command line client")

MACRO(Subversion_GET_REVISION dir variable)
  EXECUTE_PROCESS(COMMAND ${SVN_EXECUTABLE} info ${CMAKE_SOURCE_DIR}/${dir}
    OUTPUT_VARIABLE ${variable}
    OUTPUT_STRIP_TRAILING_WHITESPACE)
  STRING(REGEX REPLACE "^(.*\n)?Revision: ([^\n]+).*"
    "\\2" ${variable} "${${variable}}")
ENDMACRO(Subversion_GET_REVISION)

IF(NOT PREPARE_RELEASE)
  IF(SVN_EXECUTABLE)
    Subversion_GET_REVISION(. ProjectRevision)
    SET (SVN_REVISION ".SVN.r${ProjectRevision}")
  ELSE(SVN_EXECUTABLE)
    SET (SVN_REVISION ".SVN")
  ENDIF(SVN_EXECUTABLE)
ENDIF(NOT PREPARE_RELEASE)

## CPack configuration

SET(CPACK_CMAKE_GENERATOR "Unix Makefiles")
SET(CPACK_GENERATOR "TGZ")
SET(CPACK_INSTALL_CMAKE_PROJECTS ".;greenbone-security-assistant;ALL;/")
SET(CPACK_MODULE_PATH "")
SET(CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/COPYING")
SET(CPACK_RESOURCE_FILE_README "${CMAKE_SOURCE_DIR}/README")
SET(CPACK_RESOURCE_FILE_WELCOME "${CMAKE_SOURCE_DIR}/README")
SET(CPACK_SOURCE_GENERATOR "TGZ")
SET(CPACK_SOURCE_TOPLEVEL_TAG "")
SET(CPACK_SYSTEM_NAME "")
SET(CPACK_TOPLEVEL_TAG "")
SET(CPACK_PACKAGE_VERSION_MAJOR "1")
SET(CPACK_PACKAGE_VERSION_MINOR "0")
SET(CPACK_PACKAGE_VERSION_PATCH "0-beta6${SVN_REVISION}")
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
"src/libgsad_omp.a$"
"src/libgsad_oap.a$"
"src/libgsad_base.a$"
"src/gsad$"
"install_manifest.txt"
"Makefile"
"src/html/build/"
"/doc/generated/"
"log.conf$"
"Doxyfile$"
"Doxyfile_full$"
"VERSION$"
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

string (REPLACE "
" "" GSAD_VERSION ${CPACK_PACKAGE_VERSION})

# Configure Doxyfile with version number
configure_file (doc/Doxyfile.in doc/Doxyfile)
configure_file (doc/Doxyfile_full.in doc/Doxyfile_full)
configure_file (VERSION.in VERSION)


## Program

set (CMAKE_C_FLAGS_DEBUG        "${CMAKE_C_FLAGS_DEBUG} -Wall")
set (CMAKE_C_FLAGS              "${CMAKE_C_FLAGS} -Wall")

add_subdirectory (src)

## Documentation

add_subdirectory (doc)

## End
