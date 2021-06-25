# Copyright (C) 2009-2021 Greenbone Networks GmbH#
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.


# Needed for 'pkg_check_modules' function
include (FindPkgConfig)

if (NOT PKG_CONFIG_FOUND)
  message(FATAL_ERROR "pkg-config executable not found. Aborting.")
endif (NOT PKG_CONFIG_FOUND)

## Check for existence of required libraries
pkg_check_modules (LIBMICROHTTPD REQUIRED libmicrohttpd>=0.9.0)
pkg_check_modules (LIBXML REQUIRED libxml-2.0)
pkg_check_modules (GLIB REQUIRED glib-2.0>=2.42)
pkg_check_modules (LIBGVM_BASE REQUIRED libgvm_base>=21.4.1)
pkg_check_modules (LIBGVM_UTIL REQUIRED libgvm_util>=21.4.1)
pkg_check_modules (LIBGVM_GMP REQUIRED libgvm_gmp>=21.4.1)
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
    (GTHREAD_REQUIRED AND NOT GTHREAD_FOUND) OR NOT
    LIBGVM_GMP_FOUND OR NOT GNUTLS_FOUND OR NOT
    LIBGCRYPT)
  message (FATAL_ERROR "One or more required libraries was not found "
    "(see message above), please install the missing "
    "libraries and run cmake again.")
endif (NOT LIBMICROHTTPD_FOUND OR NOT LIBXML_FOUND OR NOT GLIB_FOUND OR
  (GTHREAD_REQUIRED AND NOT GTHREAD_FOUND) OR NOT
  LIBGVM_GMP_FOUND OR NOT GNUTLS_FOUND OR NOT LIBGCRYPT)

## Program

set (HARDENING_FLAGS            "-D_FORTIFY_SOURCE=2 -fstack-protector")
set (LINKER_HARDENING_FLAGS     "-Wl,-z,relro -Wl,-z,now")

set (CMAKE_C_FLAGS              "${CMAKE_C_FLAGS} -Wall -Wformat -Wformat-security")

set (CMAKE_C_FLAGS_DEBUG        "${CMAKE_C_FLAGS_DEBUG} -Werror")
set (CMAKE_C_FLAGS_RELEASE      "${CMAKE_C_FLAGS_RELEASE} ${HARDENING_FLAGS}")

include_directories (${LIBMICROHTTPD_INCLUDE_DIRS} ${LIBXML_INCLUDE_DIRS}
                     ${GLIB_INCLUDE_DIRS}
                     ${LIBGVM_BASE_INCLUDE_DIRS}
                     ${LIBGVM_UTIL_INCLUDE_DIRS}
                     ${LIBGVM_GMP_INCLUDE_DIRS}
                     ${GNUTLS_INCLUDE_DIRS})

find_package (Threads)

## Program

add_executable (gsad
                gsad.c
                gsad_base.c
                gsad_cmd.c
                gsad_credentials.c
                gsad_gmp.c
                gsad_gmp_arguments.c
                gsad_gmp_request.c
                gsad_http.c
                gsad_http_handler.c
                gsad_i18n.c
                gsad_session.c
                gsad_settings.c
                gsad_user.c
                utils.c
                validator.c)

target_link_libraries (gsad ${LIBMICROHTTPD_LDFLAGS}
                            ${GTHREAD_LDFLAGS}
                            ${GLIB_LDFLAGS}
                            ${LIBXML_LDFLAGS}
                            ${LIBGCRYPT_LDFLAGS}
                            ${GNUTLS_LDFLAGS}
                            ${LIBGVM_BASE_LDFLAGS}
                            ${LIBGVM_UTIL_LDFLAGS}
                            ${LIBGVM_GMP_LDFLAGS}
                            ${LIBGVM_GMP_LDFLAGS}
                            ${CMAKE_THREAD_LIBS_INIT}
                            ${LINKER_HARDENING_FLAGS}
                       )
set_target_properties (gsad PROPERTIES LINKER_LANGUAGE C)

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

if (GSAD_DATA_DIR)
  add_definitions (-DGSAD_DATA_DIR="${GSAD_DATA_DIR}")
endif (GSAD_DATA_DIR)

if (GSAD_PID_DIR)
  add_definitions (-DGSAD_PID_DIR="${GSAD_PID_DIR}")
endif (GSAD_PID_DIR)

if (GSAD_CONFIG_DIR)
  add_definitions (-DGSAD_CONFIG_DIR="${GSAD_CONFIG_DIR}")
endif (GSAD_CONFIG_DIR)

if (GSAD_LOCALE_DIR)
  add_definitions (-DGSAD_LOCALE_DIR="${GSAD_LOCALE_DIR}")
endif (GSAD_LOCALE_DIR)

if (GSAD_CHROOT_LOCALE_DIR)
  add_definitions (-DGSAD_CHROOT_LOCALE_DIR="${GSAD_CHROOT_LOCALE_DIR}")
endif (GSAD_CHROOT_LOCALE_DIR)

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

## Tag files

set (C_FILES "${CMAKE_CURRENT_SOURCE_DIR}/*.c")
add_custom_target (etags COMMENT "Building TAGS..."
                   COMMAND etags ${C_FILES})
add_custom_target (ctags COMMENT "Building tags..."
                   COMMAND ctags ${C_FILES})
add_custom_target (tags COMMENT "Building tags files...")
add_dependencies (tags etags ctags)

## End
