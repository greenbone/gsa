# Greenbone Security Assistant
# $Id$
# Description: CMakefile for GSAD sources.
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

## Check for existence of required libraries
pkg_check_modules (LIBMICROHTTPD REQUIRED libmicrohttpd>=0.9.0)
pkg_check_modules (LIBXML REQUIRED libxml-2.0)
pkg_check_modules (GLIB REQUIRED glib-2.0>=2.32)
pkg_check_modules (LIBEXSLT REQUIRED libexslt)
pkg_check_modules (LIBGVM_BASE REQUIRED libgvm_base>=1.0.0)
pkg_check_modules (LIBGVM_UTIL REQUIRED libgvm_util>=1.0.0)
pkg_check_modules (LIBGVM_GMP REQUIRED libgvm_gmp>=1.0.0)
pkg_check_modules (LIBXSLT REQUIRED libxslt)
pkg_check_modules (GNUTLS REQUIRED gnutls>=3.2.15)

message (STATUS "Looking for libgcrypt...")
find_library (LIBGCRYPT gcrypt)
if (NOT LIBGCRYPT)
  message (SEND_ERROR "The libgcrypt library is required.")
else (NOT LIBGCRYPT)
  message (STATUS "Looking for libgcrypt... ${LIBGCRYPT}")
  execute_process (COMMAND libgcrypt-config --libs
    OUTPUT_VARIABLE LIBGCRYPT_LDFLAGS
    OUTPUT_STRIP_TRAILING_WHITESPACE)
  execute_process (COMMAND libgcrypt-config --cflags
    OUTPUT_VARIABLE LIBGCRYPT_CFLAGS
    OUTPUT_STRIP_TRAILING_WHITESPACE)
endif (NOT LIBGCRYPT)

if (NOT LIBMICROHTTPD_FOUND OR NOT LIBXML_FOUND OR NOT GLIB_FOUND OR
    (GTHREAD_REQUIRED AND NOT GTHREAD_FOUND) OR NOT LIBEXSLT_FOUND OR NOT
    LIBGVM_GMP_FOUND OR NOT LIBXSLT_FOUND OR NOT GNUTLS_FOUND OR NOT
    LIBGCRYPT)
  message (FATAL_ERROR "One or more required libraries was not found "
    "(see message above), please install the missing "
    "libraries and run cmake again.")
endif (NOT LIBMICROHTTPD_FOUND OR NOT LIBXML_FOUND OR NOT GLIB_FOUND OR
  (GTHREAD_REQUIRED AND NOT GTHREAD_FOUND) OR NOT LIBEXSLT_FOUND OR NOT
  LIBGVM_GMP_FOUND OR NOT LIBXSLT_FOUND OR NOT GNUTLS_FOUND OR NOT LIBGCRYPT)

## Config

include_directories (${LIBMICROHTTPD_INCLUDE_DIRS} ${LIBXML_INCLUDE_DIRS}
                     ${GLIB_INCLUDE_DIRS} ${LIBEXSLT_INCLUDE_DIRS}
                     ${LIBGVM_BASE_INCLUDE_DIRS}
                     ${LIBGVM_UTIL_INCLUDE_DIRS}
                     ${LIBGVM_GMP_INCLUDE_DIRS}
                     ${LIBXSLT_INCLUDE_DIRS}
                     ${GNUTLS_INCLUDE_DIRS})

find_package (Threads)

## Libraries

add_library (gsad_base STATIC gsad_base.c)
target_link_libraries (gsad_base ${LIBMICROHTTPD_LDFLAGS} ${LIBXML_LDFLAGS}
                       ${GLIB_LDFLAGS} ${GTHREAD_LDFLAGS} ${LIBEXSLT_LDFLAGS}
                       ${LIBXSLT_LDFLAGS} ${LIBGVM_UTIL_LDFLAGS}
                       ${GNUTLS_LDFLAGS})

add_library (gsad_gmp STATIC gsad_gmp.c)
target_link_libraries (gsad_gmp ${LIBMICROHTTPD_LDFLAGS} ${LIBXML_LDFLAGS}
                       ${GLIB_LDFLAGS} ${GTHREAD_LDFLAGS} ${LIBEXSLT_LDFLAGS}
                       ${LIBXSLT_LDFLAGS} ${LIBGVM_GMP_LDFLAGS}
                       ${GNUTLS_LDFLAGS})

add_library (gsad_xslt_ext STATIC xslt_i18n.c)
target_link_libraries (gsad_gmp ${LIBMICROHTTPD_LDFLAGS} ${LIBXML_LDFLAGS}
                       ${GLIB_LDFLAGS} ${GTHREAD_LDFLAGS} ${LIBEXSLT_LDFLAGS}
                       ${LIBXSLT_LDFLAGS} ${LIBGVM_GMP_LDFLAGS}
                       ${GNUTLS_LDFLAGS})

## Program

add_executable (gsad
                gsad.c
                gsad_settings.c
                gsad_user.c
                gsad_cmd.c
                gsad_http.c
                gsad_http_handler.c
                validator.c)

target_link_libraries (gsad gsad_gmp gsad_base gsad_xslt_ext ${LIBGVM_BASE_LDFLAGS} ${LIBGVM_UTIL_LDFLAGS} ${LIBGVM_GMP_LDFLAGS} ${LIBGCRYPT_LDFLAGS} ${CMAKE_THREAD_LIBS_INIT} ${LINKER_HARDENING_FLAGS})
set_target_properties (gsad PROPERTIES LINKER_LANGUAGE C)

if (NOT CMAKE_BUILD_TYPE MATCHES "Release")
  # If we got SVN_REVISION at configure time,
  # assume we can get it at build time as well
  if (SVN_REVISION)
    # a custom target that is always built
    add_custom_target (revisiontag ALL)

    # creates svnversion.h using cmake script
    add_custom_command (TARGET revisiontag COMMAND ${CMAKE_COMMAND}
                        -DSOURCE_DIR=${CMAKE_SOURCE_DIR}
                        -P ${CMAKE_SOURCE_DIR}/getsvn.cmake)

    # explicitly say that the executable depends on custom target
    add_dependencies (gsad revisiontag)

    # include the output directory, where the svnversion.h file is generated
    include_directories (${CMAKE_CURRENT_BINARY_DIR})
    add_definitions (-DSVN_REV_AVAILABLE)
  endif (SVN_REVISION)
endif (NOT CMAKE_BUILD_TYPE MATCHES "Release")

if (SERVE_STATIC_ASSETS)
  message (STATUS "Static asset serving is builtin, use with care.")
  add_definitions (-DSERVE_STATIC_ASSETS)
else (SERVE_STATIC_ASSETS)
  message (STATUS "Static asset serving not builtin, use an external server")
endif (SERVE_STATIC_ASSETS)

if (USE_LIBXSLT)
  message (STATUS "Internal XSL transformations, with libxslt.")
  add_definitions (-DUSE_LIBXSLT)
else (USE_LIBXSLT)
  message (STATUS "External XSL transformations, with xsltproc.")
endif (USE_LIBXSLT)

if (GSAD_VERSION)
  add_definitions (-DGSAD_VERSION="${GSAD_VERSION}")
endif (GSAD_VERSION)

if (GVM_SERVER_CERTIFICATE)
  add_definitions (-DGVM_SERVER_CERTIFICATE="${GVM_SERVER_CERTIFICATE}")
endif (GVM_SERVER_CERTIFICATE)

if (GVM_SERVER_KEY)
  add_definitions (-DGVM_SERVER_KEY="${GVM_SERVER_KEY}")
endif (GVM_SERVER_KEY)

if (GVM_CA_CERTIFICATE)
  add_definitions (-DGVM_CA_CERTIFICATE="${GVM_CA_CERTIFICATE}")
endif (GVM_CA_CERTIFICATE)

if (GVM_RUN_DIR)
  add_definitions (-DGVM_RUN_DIR="${GVM_RUN_DIR}")
endif (GVM_RUN_DIR)

if (GSA_DATA_DIR)
  add_definitions (-DGSA_DATA_DIR="${GSA_DATA_DIR}")
endif (GSA_DATA_DIR)

if (GSAD_PID_DIR)
  add_definitions (-DGSAD_PID_DIR="${GSAD_PID_DIR}")
endif (GSAD_PID_DIR)

if (GSA_CONFIG_DIR)
  add_definitions (-DGSA_CONFIG_DIR="${GSA_CONFIG_DIR}")
endif (GSA_CONFIG_DIR)

if (GSA_LOCALE_DIR)
  add_definitions (-DGSA_LOCALE_DIR="${GSA_LOCALE_DIR}")
endif (GSA_LOCALE_DIR)

if (GSA_CHROOT_LOCALE_DIR)
  add_definitions (-DGSA_CHROOT_LOCALE_DIR="${GSA_CHROOT_LOCALE_DIR}")
endif (GSA_CHROOT_LOCALE_DIR)

add_definitions (-DGVM_OS_NAME="${CMAKE_SYSTEM}")
add_definitions (-DPREFIX="${CMAKE_INSTALL_PREFIX}")

## Install

install (TARGETS gsad
         RUNTIME DESTINATION ${SBINDIR}
         LIBRARY DESTINATION ${LIBDIR}
         ARCHIVE DESTINATION ${LIBDIR}/static)

## Static analysis

add_custom_target (cppcheck COMMENT "Running cppcheck..."
                   COMMAND sh -c \"cppcheck ${CMAKE_CURRENT_SOURCE_DIR}\")

add_custom_target (check COMMENT "Checking code...")
add_dependencies (check cppcheck)

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
  add_custom_target (help_de-xsl-syntax ALL
                                     COMMENT "Checking syntax of help_de.xsl"
                                     COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_de.xsl
                                     DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_de.xsl)
  add_custom_target (help_ru-xsl-syntax ALL
                                     COMMENT "Checking syntax of help_ru.xsl"
                                     COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_ru.xsl
                                     DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_ru.xsl)
  add_custom_target (help_zh_CN-xsl-syntax ALL
                                     COMMENT "Checking syntax of help_zh_CN.xsl"
                                     COMMAND xsltproc ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_zh_CN.xsl
                                     DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/html/classic/help_zh_CN.xsl)
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

## NG
add_subdirectory (html/classic/ng)

## gettext translations
add_subdirectory (po)

## End
