# Greenbone Security Assistant
# $Id$
# Description: Top-level cmake control for greenbone-security-assistant
#
# Authors:
# Matthew Mundell <matthew.mundell@greenbone.net>
# Michael Wiegand <michael.wiegand@greenbone.net>
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

if (NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Debug)
endif (NOT CMAKE_BUILD_TYPE)

## Check existence required tools

set (MANDATORY_TOOL_MISSING FALSE)

find_program (PATH_TO_PKGCONFIG pkg-config DOC "pkg-config program to retrieve "
                        "information about installed libraries in the system.")

find_program (PATH_TO_LIBOPENVASCONFIG libopenvas-config DOC "libopenvas-config program"
                        " to retrieve information about installed"
                        " openvas-libraries in the system.")

find_program (PATH_TO_XSLTPROC xsltproc DOC "xsltproc command line "
              "xslt processor.")

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
pkg_check_modules (LIBS REQUIRED libmicrohttpd>=0.4.2 libxml-2.0 glib-2.0>=2.14
                   gthread-2.0 libexslt)

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
find_program (PATH_TO_LIBOPENVASCONFIG libopenvas-config DOC "libopenvas-config program"
                        " to retrieve information about installed"
                        " openvas-libraries in the system.")
if (PATH_TO_LIBOPENVASCONFIG)
  # Obtain libopenvas version number
  execute_process (COMMAND libopenvas-config --version
    OUTPUT_VARIABLE LIBOPENVAS_VERSION
    OUTPUT_STRIP_TRAILING_WHITESPACE)
  # Make a (per definition: semicolon separated) list of it
  string (REGEX REPLACE "\\." ";" LO_VER ${LIBOPENVAS_VERSION})
  list (GET LO_VER 0 LO_MAJOR_VER)
  list (GET LO_VER 1 LO_MINOR_VER)
  list (GET LO_VER 2 LO_PATCH_VER)
  set (LIBOPENVAS_SUFFICIENT TRUE)
  # TODO Would like something like set (MIN_LO_VER "3" "0" "1")
  #      which would then make it easier to modify these. However, had serious
  #      issues with the conditionals, thus this clumsy implementation.
  set (LO_MAJOR_MIN_VER 4)
  set (LO_MINOR_MIN_VER 0)
  set (LO_PATCH_MIN_VER 0)
  set (LO_MAJOR_VER_FAIL FALSE)
  set (LO_MINOR_VER_FAIL FALSE)
  set (LO_PATCH_VER_FAIL FALSE)
  if (${LO_MAJOR_VER} LESS ${LO_MAJOR_MIN_VER})
    set (LO_MAJOR_VER_FAIL TRUE)
  endif (${LO_MAJOR_VER} LESS ${LO_MAJOR_MIN_VER})
  if (${LO_MAJOR_VER} EQUAL ${LO_MAJOR_MIN_VER} AND ${LO_MINOR_VER} LESS ${LO_MINOR_MIN_VER})
    set (LO_MINOR_VER_FAIL TRUE)
  endif (${LO_MAJOR_VER} EQUAL ${LO_MAJOR_MIN_VER} AND ${LO_MINOR_VER} LESS ${LO_MINOR_MIN_VER})
  if (${LO_MAJOR_VER} EQUAL ${LO_MAJOR_MIN_VER} AND ${LO_MINOR_VER} EQUAL ${LO_MINOR_MIN_VER} AND ${LO_PATCH_VER} LESS ${LO_PATCH_MIN_VER})
    set (LO_PATCH_VER_FAIL TRUE)
  endif (${LO_MAJOR_VER} EQUAL ${LO_MAJOR_MIN_VER} AND ${LO_MINOR_VER} EQUAL ${LO_MINOR_MIN_VER} AND ${LO_PATCH_VER} LESS ${LO_PATCH_MIN_VER})
  if (LO_MAJOR_VER_FAIL OR LO_MINOR_VER_FAIL OR LO_PATCH_VER_FAIL)
    set (LIBOPENVAS_SUFFICIENT FALSE)
    message ("openvas-libraries version >= ${LO_MAJOR_MIN_VER}.${LO_MINOR_MIN_VER}.${LO_PATCH_MIN_VER} not found.")
  endif (LO_MAJOR_VER_FAIL OR LO_MINOR_VER_FAIL OR LO_PATCH_VER_FAIL)
else (PATH_TO_LIBOPENVASCONFIG)
   set (LIBOPENVAS_SUFFICIENT FALSE)
   message ("Could not determine openvas-libraries version.")
endif (PATH_TO_LIBOPENVASCONFIG)

if (NOT LIBS_FOUND OR NOT GSAD_LIBS_FOUND OR NOT LIBOPENVAS_SUFFICIENT)
  message (FATAL_ERROR "One or more required libraries was not found "
                       "(see message above), please install the missing "
                       "libraries and run cmake again.")
endif (NOT LIBS_FOUND OR NOT GSAD_LIBS_FOUND OR NOT LIBOPENVAS_SUFFICIENT)

# TODO: Unclear why the pkg-based test above does not work.
# Also, minimum version checking would be nice.
message (STATUS "Looking for microhttpd...")
find_library (MICROHTTPD microhttpd)
message (STATUS "Looking for microhttpd... ${MICROHTTPD}")
if (NOT MICROHTTPD)
  message (FATAL_ERROR "The microhttpd library is required.")
endif (NOT MICROHTTPD)

## Retrieve svn revision (at configure time)
#  Not using Subversion_WC_INFO, as it would have to connect to the repo
find_program (SVN_EXECUTABLE svn DOC "subversion command line client")

macro (Subversion_GET_REVISION dir variable)
  execute_process (COMMAND ${SVN_EXECUTABLE} info ${CMAKE_SOURCE_DIR}/${dir}
    OUTPUT_VARIABLE ${variable}
    OUTPUT_STRIP_TRAILING_WHITESPACE)
  string (REGEX REPLACE "^(.*\n)?Revision: ([^\n]+).*"
    "\\2" ${variable} "${${variable}}")
endmacro (Subversion_GET_REVISION)

if (NOT CMAKE_BUILD_TYPE MATCHES "Release")
  if (EXISTS ".svn/")
    if (SVN_EXECUTABLE)
      Subversion_GET_REVISION(. ProjectRevision)
      set (SVN_REVISION ".SVN.r${ProjectRevision}")
    else (SVN_EXECUTABLE)
      set (SVN_REVISION ".SVN")
    endif (SVN_EXECUTABLE)
  endif (EXISTS ".svn/")
endif (NOT CMAKE_BUILD_TYPE MATCHES "Release")

## CPack configuration

set (CPACK_CMAKE_GENERATOR "Unix Makefiles")
set (CPACK_GENERATOR "TGZ")
set (CPACK_INSTALL_CMAKE_PROJECTS ".;greenbone-security-assistant;ALL;/")
set (CPACK_MODULE_PATH "")
set (CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/COPYING")
set (CPACK_RESOURCE_FILE_README "${CMAKE_SOURCE_DIR}/README")
set (CPACK_RESOURCE_FILE_WELCOME "${CMAKE_SOURCE_DIR}/README")
set (CPACK_SOURCE_GENERATOR "TGZ")
set (CPACK_SOURCE_TOPLEVEL_TAG "")
set (CPACK_SYSTEM_NAME "")
set (CPACK_TOPLEVEL_TAG "")
set (CPACK_PACKAGE_VERSION_MAJOR "2")
set (CPACK_PACKAGE_VERSION_MINOR "0")
set (CPACK_PACKAGE_VERSION_PATCH "+rc3${SVN_REVISION}")
set (CPACK_PACKAGE_VERSION "${CPACK_PACKAGE_VERSION_MAJOR}.${CPACK_PACKAGE_VERSION_MINOR}${CPACK_PACKAGE_VERSION_PATCH}")
set (CPACK_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
set (CPACK_SOURCE_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
set (CPACK_PACKAGE_VENDOR "The OpenVAS Project")
set (CPACK_SOURCE_IGNORE_FILES
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

message ("-- Install prefix: ${CMAKE_INSTALL_PREFIX}")

## Version

string (REPLACE "
" "" GSAD_VERSION ${CPACK_PACKAGE_VERSION})

# Configure Doxyfile with version number
configure_file (doc/Doxyfile.in doc/Doxyfile)
configure_file (doc/Doxyfile_full.in doc/Doxyfile_full)
configure_file (VERSION.in VERSION)


## Program

set (HARDENING_FLAGS            "-Wformat -Wformat-security -O2 -D_FORTIFY_SOURCE=2 -fstack-protector -Wl,-z,relro -Wl,-z,now")

set (CMAKE_C_FLAGS_DEBUG        "${CMAKE_C_FLAGS_DEBUG}")
set (CMAKE_C_FLAGS              "${CMAKE_C_FLAGS} ${HARDENING_FLAGS} -Wall -Werror")

add_subdirectory (src)

## Documentation

add_subdirectory (doc)

## End
