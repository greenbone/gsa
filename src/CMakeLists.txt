# Greenbone Security Assistant
# $Id$
# Description: CMakefile for gsad sources
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

## Config

add_definitions (-Werror)

include_directories (${LIBS_INCLUDE_DIRS} ${GSAD_LIBS_INCLUDE_DIRS})
link_directories    (${LIBS_LIBRARY_DIRS} ${GSAD_LIBS_LIBRARY_DIRS})

## TODO use pkg_check_modules instead of manual invocation (as in top-level
## CMakeLists.txt)

exec_program (libopenvas-config
              ARGS --cflags
              OUTPUT_VARIABLE OPENVAS_CFLAGS)
exec_program (libopenvas-config
              ARGS --libs
              OUTPUT_VARIABLE OPENVAS_LDFLAGS)


if (OPENVAS_HEADER_INSTALL_DIR)
  set (HEADER_TEMP "-I${OPENVAS_HEADER_INSTALL_DIR}")
else (OPENVAS_HEADER_INSTALL_DIR)
  set (HEADER_TEMP "")
endif (OPENVAS_HEADER_INSTALL_DIR)

if (OPENVAS_LIB_INSTALL_DIR)
  set (LIB_TEMP "-L${OPENVAS_LIB_INSTALL_DIR}")
else (OPENVAS_LIB_INSTALL_DIR)
  set (LIB_TEMP "")
endif (OPENVAS_LIB_INSTALL_DIR)

## Libraries

add_library (gsad_base STATIC gsad_base.c)
target_link_libraries (gsad_base ${LIBS_LIBRARIES})

add_library (gsad_omp STATIC gsad_omp.c)
target_link_libraries (gsad_omp ${LIBS_LIBRARIES})

add_library (gsad_oap STATIC gsad_oap.c)
target_link_libraries (gsad_oap ${LIBS_LIBRARIES})

## Program

add_executable (gsad gsad.c validator.c)
target_link_libraries (gsad gsad_omp gsad_oap gsad_base ${GSAD_LIBS_LIBRARIES})
set_target_properties (gsad PROPERTIES LINKER_LANGUAGE C)

if (GSAD_VERSION)
  add_definitions (-DGSAD_VERSION=\\\"${GSAD_VERSION}\\\")
endif (GSAD_VERSION)

if (OPENVAS_USERS_DIR)
  add_definitions (-DOPENVAS_USERS_DIR=\\\"${OPENVAS_USERS_DIR}\\\")
endif (OPENVAS_USERS_DIR)

if (OPENVAS_CONFIG_FILE)
  add_definitions (-DOPENVAS_CONFIG_FILE=\\\"${OPENVAS_CONFIG_FILE}\\\")
endif (OPENVAS_CONFIG_FILE)

if (OPENVAS_SERVER_CERTIFICATE)
  add_definitions (-DOPENVAS_SERVER_CERTIFICATE=\\\"${OPENVAS_SERVER_CERTIFICATE}\\\")
endif (OPENVAS_SERVER_CERTIFICATE)

if (OPENVAS_SERVER_KEY)
  add_definitions (-DOPENVAS_SERVER_KEY=\\\"${OPENVAS_SERVER_KEY}\\\")
endif (OPENVAS_SERVER_KEY)

if (OPENVAS_CA_CERTIFICATE)
  add_definitions (-DOPENVAS_CA_CERTIFICATE=\\\"${OPENVAS_CA_CERTIFICATE}\\\")
endif (OPENVAS_CA_CERTIFICATE)

if (GSA_STATE_DIR)
  add_definitions (-DGSA_STATE_DIR=\\\"${GSA_STATE_DIR}\\\")
endif (GSA_STATE_DIR)

if (GSAD_PID_DIR)
  add_definitions (-DGSAD_PID_DIR=\\\"${GSAD_PID_DIR}\\\")
endif (GSAD_PID_DIR)

if (GSA_CONFIG_DIR)
  add_definitions (-DGSA_CONFIG_DIR=\\\"${GSA_CONFIG_DIR}\\\")
endif (GSA_CONFIG_DIR)

add_definitions (-DOPENVAS_OS_NAME=\\\"${CMAKE_SYSTEM}\\\")
add_definitions (-DPREFIX=\\\"${CMAKE_INSTALL_PREFIX}\\\")

## TODO In the top-level CMakeLists.txt, microhttpd is searched for using
## pkg_check_modules. Use variables set by this function as linker and compiler
## flags. Unfortunately it boils down to this problem:
## http://www.cmake.org/pipermail/cmake/2009-June/030108.html
set_target_properties (gsad PROPERTIES LINK_FLAGS
                       "${LIBS_TEMP} ${OPENVAS_LDFLAGS} -pthread ")

set_target_properties (gsad PROPERTIES COMPILE_FLAGS
                       "${HEADER_TEMP} ${OPENVAS_CFLAGS}")

MARK_AS_ADVANCED (LIB_TEMP)
MARK_AS_ADVANCED (HEADER_TEMP)

MARK_AS_ADVANCED (TEMP)

add_custom_target (genhtml ALL
                   COMMAND make -C html -f make_html)

CONFIGURE_FILE (gsad_log_conf.cmake_in
                "${CMAKE_CURRENT_SOURCE_DIR}/gsad_log.conf")

## Install

install (TARGETS gsad
         RUNTIME DESTINATION ${BINDIR}
         LIBRARY DESTINATION ${LIBDIR}
         ARCHIVE DESTINATION ${LIBDIR}/static)

install (DIRECTORY html/build/
         DESTINATION ${GSA_STATE_DIR})

install (FILES gsad_log.conf
         DESTINATION ${GSA_CONFIG_DIR})

## Static analysis

add_custom_target (splint COMMENT "Running splint..."
                   COMMAND sh -c \"splint -booltype gboolean -predboolint +unixlib +export-header `pkg-config --cflags glib-2.0` `libopenvas-config --cflags` *.c\")

add_custom_target (rats COMMENT "Running rats..."
                   COMMAND sh -c \"rats --warning 2 *.[ch]\")

add_custom_target (flawfinder COMMENT "Running flawfinder..."
                   COMMAND sh -c \"flawfinder *.[ch]\")

add_custom_target (check COMMENT "Checking code...")
ADD_DEPENDENCIES (check splint rats flawfinder)

## End
