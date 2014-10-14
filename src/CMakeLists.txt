# Greenbone Security Assistant
# $Id$
# Description: CMakefile for GSAD sources.
#
# Authors:
# Matthew Mundell <matthew.mundell@greenbone.net>
# Michael Wiegand <michael.wiegand@greenbone.net>
#
# Copyright:
# Copyright (C) 2009, 2014 Greenbone Networks GmbH
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

## Libraries

add_library (gsad_base STATIC gsad_base.c)
set_target_properties (gsad_base PROPERTIES COMPILE_FLAGS "${OPENVAS_CFLAGS} ${LIBMICROHTTPD_CFLAGS} ${LIBXML_CFLAGS} ${GLIB_CFLAGS} ${GTHREAD_CFLAGS} ${LIBEXSLT_CFLAGS} ${LIBXSLT_CFLAGS} ${GNUTLS_CFLAGS}")
target_link_libraries (gsad_base "${LIBMICROHTTPD_LDFLAGS} ${LIBXML_LDFLAGS} ${GLIB_LDFLAGS} ${GTHREAD_LDFLAGS} ${LIBEXSLT_LDFLAGS} ${LIBXSLT_LDFLAGS} ${OPENVAS_LDFLAGS} ${GNUTLS_LDFLAGS}")

add_library (gsad_omp STATIC gsad_omp.c)
set_target_properties (gsad_omp PROPERTIES COMPILE_FLAGS "${OPENVAS_CFLAGS} ${LIBMICROHTTPD_CFLAGS} ${LIBXML_CFLAGS} ${GLIB_CFLAGS} ${GTHREAD_CFLAGS} ${LIBEXSLT_CFLAGS} ${LIBXSLT_CFLAGS} ${GNUTLS_CFLAGS}")
target_link_libraries (gsad_omp "${LIBMICROHTTPD_LDFLAGS} ${LIBXML_LDFLAGS} ${GLIB_LDFLAGS} ${GTHREAD_LDFLAGS} ${LIBEXSLT_LDFLAGS} ${LIBXSLT_LDFLAGS} ${OPENVAS_LDFLAGS} ${GNUTLS_LDFLAGS}")

## Program

add_executable (gsad gsad.c validator.c)
target_link_libraries (gsad gsad_omp gsad_base "${LIBGCRYPT_LDFLAGS}")
set_target_properties (gsad PROPERTIES LINKER_LANGUAGE C)

if (USE_LIBXSLT)
  message (STATUS "Internal XSL transformations, with libxslt.")
  add_definitions (-DUSE_LIBXSLT)
else (USE_LIBXSLT)
  message (STATUS "External XSL transformations, with xsltproc.")
endif (USE_LIBXSLT)

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

if (GSA_DATA_DIR)
  add_definitions (-DGSA_DATA_DIR=\\\"${GSA_DATA_DIR}\\\")
endif (GSA_DATA_DIR)

if (GSAD_PID_DIR)
  add_definitions (-DGSAD_PID_DIR=\\\"${GSAD_PID_DIR}\\\")
endif (GSAD_PID_DIR)

if (GSA_CONFIG_DIR)
  add_definitions (-DGSA_CONFIG_DIR=\\\"${GSA_CONFIG_DIR}\\\")
endif (GSA_CONFIG_DIR)

add_definitions (-DOPENVAS_OS_NAME=\\\"${CMAKE_SYSTEM}\\\")
add_definitions (-DPREFIX=\\\"${CMAKE_INSTALL_PREFIX}\\\")

set_target_properties (gsad PROPERTIES COMPILE_FLAGS
  "${OPENVAS_CFLAGS} ${LIBMICROHTTPD_CFLAGS} ${LIBXML_CFLAGS} ${GLIB_CFLAGS} ${GTHREAD_CFLAGS} ${LIBEXSLT_CFLAGS} ${LIBXSLT_CFLAGS} ${GNUTLS_CFLAGS} ${LIBGCRYPT_CFLAGS}")

## Install

install (TARGETS gsad
         RUNTIME DESTINATION ${SBINDIR}
         LIBRARY DESTINATION ${LIBDIR}
         ARCHIVE DESTINATION ${LIBDIR}/static)

## Static analysis

add_custom_target (splint COMMENT "Running splint..."
                   COMMAND sh -c \"splint -booltype gboolean -predboolint +unixlib +export-header `pkg-config --cflags glib-2.0` `pkg-config --cflags libopenvas` ${CMAKE_CURRENT_SOURCE_DIR}/*.c\")

add_custom_target (rats COMMENT "Running rats..."
                   COMMAND sh -c \"rats --warning 2 ${CMAKE_CURRENT_SOURCE_DIR}/*.[ch]\")

add_custom_target (flawfinder COMMENT "Running flawfinder..."
                   COMMAND sh -c \"flawfinder ${CMAKE_CURRENT_SOURCE_DIR}/*.[ch]\")

add_custom_target (check COMMENT "Checking code...")
add_dependencies (check splint rats flawfinder)

## Very superficial check if stylesheets are fine

if (PATH_TO_XSLTPROC)
  add_custom_target (omp-xsl-syntax ALL
                                    COMMENT "Checking syntax of omp.xsl"
                                    COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/omp.xsl
                                    DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/omp.xsl)
  add_custom_target (gsad-xsl-syntax ALL
                                     COMMENT "Checking syntax of gsad.xsl"
                                     COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/gsad.xsl
                                     DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/gsad.xsl)
  add_custom_target (help-xsl-syntax ALL
                                     COMMENT "Checking syntax of help.xsl"
                                     COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help.xsl
                                     DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help.xsl)
  add_custom_target (help_zh-xsl-syntax ALL
                                     COMMENT "Checking syntax of help_zh.xsl"
                                     COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_zh.xsl
                                     DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_zh.xsl)
  add_custom_target (rnc-xsl-syntax ALL
                                    COMMENT "Checking syntax of rnc.xsl"
                                    COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/rnc.xsl
                                    DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/rnc.xsl)
  add_custom_target (omp-doc-xsl-syntax ALL
                                        COMMENT "Checking syntax of omp-doc.xsl"
                                        COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/omp-doc.xsl
                                        DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/omp-doc.xsl)
else (PATH_TO_XSLTPROC)
  message ("Not performing simple stylesheet tests -- xsltproc not found.")
endif (PATH_TO_XSLTPROC)

## Tag files

set (C_FILES "${CMAKE_CURRENT_SOURCE_DIR}/*.c")
add_custom_target (etags COMMENT "Building TAGS..."
                   COMMAND etags ${C_FILES})
add_custom_target (ctags COMMENT "Building tags..."
                   COMMAND ctags ${C_FILES})
add_custom_target (tags COMMENT "Building tags files...")
add_dependencies (tags etags ctags)

## End
