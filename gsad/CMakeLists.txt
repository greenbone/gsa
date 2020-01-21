# Copyright (C) 2017-2020 Greenbone Networks GmbH
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

message ("-- Configuring gsad")

project (gsad VERSION 20.04 LANGUAGES C)

if (POLICY CMP0005)
  cmake_policy (SET CMP0005 NEW)
endif (POLICY CMP0005)

set (GSAD_VERSION "${PROJECT_VERSION_STRING}")

message (STATUS "Building gsad version ${GSAD_VERSION}")

## Files generated on installation

# generate compile_commands.json file
# see https://clang.llvm.org/docs/JSONCompilationDatabase.html
set(CMAKE_EXPORT_COMPILE_COMMANDS TRUE)

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

set (GSAD_DATA_DIR "${DATADIR}/gvm/gsad")
set (GSAD_CONFIG_DIR "${SYSCONFDIR}/gvm/")

if (NOT GVM_RUN_DIR)
  set (GVM_RUN_DIR  "${LOCALSTATEDIR}/run")
endif (NOT GVM_RUN_DIR)

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


configure_file (src/gsad_log_conf.cmake_in src/gsad_log.conf)

## Install

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/src/gsad_log.conf
         DESTINATION ${GSAD_CONFIG_DIR})

add_subdirectory (src)
add_subdirectory (config)

# vim: set ts=2 sw=2 tw=80:
