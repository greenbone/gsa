# Greenbone Security Assistant
# $Id$
# Description: CMakefile for GSAD sources.
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

## Libraries

add_library (gsad_base STATIC gsad_base.c)
set_target_properties (gsad_base PROPERTIES COMPILE_FLAGS "${OPENVAS_CFLAGS}")
target_link_libraries (gsad_base ${LIBS_LIBRARIES})

add_library (gsad_omp STATIC gsad_omp.c)
set_target_properties (gsad_omp PROPERTIES COMPILE_FLAGS "${OPENVAS_CFLAGS}")
target_link_libraries (gsad_omp ${LIBS_LIBRARIES} openvas_omp)

add_library (gsad_oap STATIC gsad_oap.c)
set_target_properties (gsad_oap PROPERTIES COMPILE_FLAGS "${OPENVAS_CFLAGS}")
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
                       "${OPENVAS_LDFLAGS} -pthread ")

set_target_properties (gsad PROPERTIES COMPILE_FLAGS
                       "${OPENVAS_CFLAGS}")

CONFIGURE_FILE (gsad_log_conf.cmake_in
                "${CMAKE_CURRENT_SOURCE_DIR}/gsad_log.conf")

## Install

install (TARGETS gsad
         RUNTIME DESTINATION ${SBINDIR}
         LIBRARY DESTINATION ${LIBDIR}
         ARCHIVE DESTINATION ${LIBDIR}/static)

install (FILES html/src/favicon.gif html/src/gsad.xsl html/src/gsa-style.css
               html/src/help.xsl  html/src/oap.xsl  html/src/omp.xsl
         DESTINATION ${GSA_STATE_DIR})

install (FILES html/src/login/login.html
         DESTINATION ${GSA_STATE_DIR}/login)

install (FILES html/src/img/agent.png html/src/img/descending.png
               html/src/img/key.png html/src/img/p_bar_bg.png
               html/src/img/start_inactive.png html/src/img/alert_sign.png
               html/src/img/details.png html/src/img/list_inactive.png
               html/src/img/p_bar_done.png html/src/img/start.png
               html/src/img/ascending_inactive.png html/src/img/download.png
               html/src/img/list.png html/src/img/p_bar_error.png
               html/src/img/stop_inactive.png html/src/img/ascending.png
               html/src/img/edit_inactive.png html/src/img/log.png
               html/src/img/p_bar_new.png html/src/img/stop.png
               html/src/img/bsi-logo.png html/src/img/edit.png
               html/src/img/low_big.png html/src/img/p_bar.png
               html/src/img/bullet2.png html/src/img/exe.png
               html/src/img/low.png html/src/img/p_bar_request.png
               html/src/img/trend_down.png html/src/img/bullet.png
               html/src/img/gb-logo.png html/src/img/medium_big.png
               html/src/img/refresh.png html/src/img/trend_less.png
               html/src/img/deb.png html/src/img/gsa_splash.png
               html/src/img/medium.png html/src/img/resume_inactive.png
               html/src/img/trend_more.png html/src/img/delete_inactive.png
               html/src/img/help.png html/src/img/new_note.png
               html/src/img/resume.png html/src/img/trend_nochange.png
               html/src/img/delete_note.png html/src/img/high_big.png
               html/src/img/new.png html/src/img/rpm.png
               html/src/img/trend_up.png html/src/img/delete.png
               html/src/img/high.png html/src/img/none_big.png
               html/src/img/scheduled_inactive.png
               html/src/img/descending_inactive.png
               html/src/img/intevation-logo.png html/src/img/note.png
               html/src/img/scheduled.png
         DESTINATION ${GSA_STATE_DIR}/img)

install (FILES html/src/img/style/logo_l.png html/src/img/style/logo_r.png
               html/src/img/style/window_dec_a.png
               html/src/img/style/window_dec_b.png
               html/src/img/style/window_dec_c.png html/src/img/style/logo_m.png
               html/src/img/style/window_dec_a_error.png
               html/src/img/style/window_dec_b_error.png
               html/src/img/style/window_dec_c_error.png
         DESTINATION ${GSA_STATE_DIR}/img/style)

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
