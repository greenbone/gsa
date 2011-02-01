# Greenbone Security Assistant
# $Id$
# Description: CMakefile for GSAD sources.
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

## Config

add_definitions (-Werror)

include_directories (${LIBS_INCLUDE_DIRS} ${GSAD_LIBS_INCLUDE_DIRS})
link_directories    (${LIBS_LIBRARY_DIRS} ${GSAD_LIBS_LIBRARY_DIRS})

## TODO use pkg_check_modules instead of manual invocation (as in top-level
## CMakeLists.txt)

exec_program (pkg-config
              ARGS --cflags libopenvas
              OUTPUT_VARIABLE OPENVAS_CFLAGS)
exec_program (pkg-config
              ARGS --libs libopenvas
              OUTPUT_VARIABLE OPENVAS_LDFLAGS)

## Libraries

add_library (gsad_base STATIC gsad_base.c)
set_target_properties (gsad_base PROPERTIES COMPILE_FLAGS "${OPENVAS_CFLAGS}")
target_link_libraries (gsad_base ${LIBS_LIBRARIES} exslt)

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
                       "${OPENVAS_LDFLAGS} -pthread -lexslt")

set_target_properties (gsad PROPERTIES COMPILE_FLAGS
                       "${OPENVAS_CFLAGS}")

configure_file (gsad_log_conf.cmake_in
                "${CMAKE_CURRENT_SOURCE_DIR}/gsad_log.conf")

## Install

install (TARGETS gsad
         RUNTIME DESTINATION ${SBINDIR}
         LIBRARY DESTINATION ${LIBDIR}
         ARCHIVE DESTINATION ${LIBDIR}/static)

install (FILES html/favicon.gif html/gsad.xsl html/gsa-style.css
               html/help.xsl  html/oap.xsl  html/omp.xsl
               html/IE6fixes.css
         DESTINATION ${GSA_STATE_DIR})

install (FILES html/login/login.html html/gsa-style.css
               html/favicon.gif html/IE6fixes.css
         DESTINATION ${GSA_STATE_DIR}/login)

install (FILES html/img/gsa_splash.png
         DESTINATION ${GSA_STATE_DIR}/login/img)

install (FILES html/img/style/window_dec_a.png
               html/img/style/window_dec_b.png
               html/img/style/window_dec_c.png
         DESTINATION ${GSA_STATE_DIR}/login/img/style)

install (FILES html/img/agent.png html/img/descending.png
               html/img/key.png html/img/p_bar_bg.png
               html/img/start_inactive.png html/img/alert_sign.png
               html/img/details.png html/img/list_inactive.png
               html/img/p_bar_done.png html/img/start.png
               html/img/ascending_inactive.png html/img/download.png
               html/img/list.png html/img/p_bar_error.png
               html/img/stop_inactive.png html/img/ascending.png
               html/img/edit_inactive.png html/img/log.png
               html/img/p_bar_new.png html/img/stop.png
               html/img/bsi-logo.png html/img/edit.png
               html/img/low_big.png html/img/p_bar.png
               html/img/bullet2.png html/img/exe.png
               html/img/low.png html/img/p_bar_request.png
               html/img/trend_down.png html/img/bullet.png
               html/img/gb-logo.png html/img/medium_big.png
               html/img/refresh.png html/img/trend_less.png
               html/img/deb.png html/img/gsa_splash.png
               html/img/medium.png html/img/resume_inactive.png
               html/img/trend_more.png html/img/delete_inactive.png
               html/img/help.png html/img/new_note.png
               html/img/resume.png html/img/trend_nochange.png
               html/img/delete_note.png html/img/high_big.png
               html/img/new.png html/img/rpm.png
               html/img/trend_up.png html/img/delete.png
               html/img/high.png html/img/none_big.png
               html/img/scheduled_inactive.png
               html/img/descending_inactive.png
               html/img/intevation-logo.png html/img/note.png
               html/img/scheduled.png html/img/pause.png
               html/img/override.png html/img/new_override.png
               html/img/pause_inactive.png html/img/false_positive.png
         DESTINATION ${GSA_STATE_DIR}/img)

install (FILES html/img/style/logo_l.png html/img/style/logo_r.png
               html/img/style/window_dec_a.png
               html/img/style/window_dec_b.png
               html/img/style/window_dec_c.png html/img/style/logo_m.png
               html/img/style/window_dec_a_error.png
               html/img/style/window_dec_b_error.png
               html/img/style/window_dec_c_error.png
         DESTINATION ${GSA_STATE_DIR}/img/style)

install (FILES gsad_log.conf
         DESTINATION ${GSA_CONFIG_DIR})

## Static analysis

add_custom_target (splint COMMENT "Running splint..."
                   COMMAND sh -c \"splint -booltype gboolean -predboolint +unixlib +export-header `pkg-config --cflags glib-2.0` `pkg-config --cflags libopenvas` *.c\")

add_custom_target (rats COMMENT "Running rats..."
                   COMMAND sh -c \"rats --warning 2 *.[ch]\")

add_custom_target (flawfinder COMMENT "Running flawfinder..."
                   COMMAND sh -c \"flawfinder *.[ch]\")

add_custom_target (check COMMENT "Checking code...")
add_dependencies (check splint rats flawfinder)

## Very superficial check if stylesheets are fine

if (PATH_TO_XSLTPROC)
  add_custom_target (oap-xsl-syntax ALL
                                    COMMENT "Checking syntax of oap.xsl"
                                    COMMAND xsltproc html/oap.xsl
                                    DEPENDS html/oap.xsl)
  add_custom_target (omp-xsl-syntax ALL
                                    COMMENT "Checking syntax of omp.xsl"
                                    COMMAND xsltproc html/omp.xsl
                                    DEPENDS html/omp.xsl)
  add_custom_target (gsad-xsl-syntax ALL
                                     COMMENT "Checking syntax of gsad.xsl"
                                     COMMAND xsltproc html/gsad.xsl
                                     DEPENDS html/gsad.xsl)
  add_custom_target (help-xsl-syntax ALL
                                     COMMENT "Checking syntax of help.xsl"
                                     COMMAND xsltproc html/help.xsl
                                     DEPENDS html/help.xsl)
else (PATH_TO_XSLTPROC)
  message ("Not performing simple stylesheet tests -- xsltproc not found.")
endif (PATH_TO_XSLTPROC)

## Tag files

set (C_FILES "*.c")
add_custom_target (etags COMMENT "Building TAGS..."
                   COMMAND etags ${C_FILES})
add_custom_target (ctags COMMENT "Building tags..."
                   COMMAND ctags ${C_FILES})
add_custom_target (tags COMMENT "Building tags files...")
add_dependencies (tags etags ctags)

## End
