# Greenbone Security Assistant
# $Id$
# Description: Top-level cmake control for greenbone-security-assistant
#
# Authors:
# Matthew Mundell <matthew.mundell@greenbone.net>
# Michael Wiegand <michael.wiegand@greenbone.net>
#
# Copyright:
# Copyright (C) 2009-2014 Greenbone Networks GmbH
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

if (NOT USE_LIBXSLT)
  set (USE_LIBXSLT 0)
endif (NOT USE_LIBXSLT)

find_program (PATH_TO_XSLTPROC xsltproc DOC "xsltproc command line "
              "xslt processor.")
if (NOT USE_LIBXSLT AND NOT PATH_TO_XSLTPROC)
  set (MANDATORY_TOOL_MISSING TRUE)
endif (NOT USE_LIBXSLT AND NOT PATH_TO_XSLTPROC)

## TODO this check is obsolete with the FindPkgConfig module (see below,
## pkg_check_module sets OKG_CONFIG_FOUND)
message (STATUS "Looking for pkg-config... ${PATH_TO_PKGCONFIG}")
if (NOT PATH_TO_PKGCONFIG)
  set (MANDATORY_TOOL_MISSING TRUE)
endif (NOT PATH_TO_PKGCONFIG)

if (MANDATORY_TOOL_MISSING)
  if (NOT PATH_TO_PKGCONFIG)
    message ("The pkg-config tool is required.")
  endif (NOT PATH_TO_PKGCONFIG)
  if (NOT USE_LIBXSLT AND NOT PATH_TO_XSLTPROC)
    message ("The xsltproc tool or libxslt is required.")
  endif (NOT USE_LIBXSLT AND NOT PATH_TO_XSLTPROC)
  message (FATAL_ERROR "One or more tools or libraries could not be found on "
                      "your system. Please check the logs above.")
endif (MANDATORY_TOOL_MISSING)

# TODO: Check for (optional) rats, flawfinder, splint, doxygen.

## Check for existance of required libraries
pkg_check_modules (LIBMICROHTTPD REQUIRED libmicrohttpd>=0.9.0)
pkg_check_modules (LIBXML REQUIRED libxml-2.0)
pkg_check_modules (GLIB REQUIRED glib-2.0>=2.16)
pkg_check_modules (LIBEXSLT REQUIRED libexslt)
pkg_check_modules (LIBOPENVAS REQUIRED libopenvas>=7.0.0)
pkg_check_modules (LIBXSLT REQUIRED libxslt)
pkg_check_modules (GNUTLS REQUIRED gnutls>=2.8)

# Linking against libgthread is only required for GLib versions using the old,
# deprecated thread API, i.e. version 2.30 and earlier.
if (${GLIB_VERSION} VERSION_LESS "2.31.0")
  set (GTHREAD_REQUIRED TRUE)
endif (${GLIB_VERSION} VERSION_LESS "2.31.0")

if (GTHREAD_REQUIRED)
  pkg_check_modules (GTHREAD REQUIRED gthread-2.0)
endif (GTHREAD_REQUIRED)

execute_process (COMMAND pkg-config --cflags libmicrohttpd
  OUTPUT_VARIABLE LIBMICROHTTPD_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND pkg-config --libs libmicrohttpd
  OUTPUT_VARIABLE LIBMICROHTTPD_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

execute_process (COMMAND pkg-config --cflags libxml-2.0
  OUTPUT_VARIABLE LIBXML_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND pkg-config --libs libxml-2.0
  OUTPUT_VARIABLE LIBXML_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

execute_process (COMMAND pkg-config --cflags glib-2.0
  OUTPUT_VARIABLE GLIB_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND pkg-config --libs glib-2.0
  OUTPUT_VARIABLE GLIB_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

if (GTHREAD_REQUIRED)
  execute_process (COMMAND pkg-config --cflags gthread-2.0
    OUTPUT_VARIABLE GTHREAD_CFLAGS
    OUTPUT_STRIP_TRAILING_WHITESPACE)
  execute_process (COMMAND pkg-config --libs gthread-2.0
    OUTPUT_VARIABLE GTHREAD_LDFLAGS
    OUTPUT_STRIP_TRAILING_WHITESPACE)
endif (GTHREAD_REQUIRED)

execute_process (COMMAND pkg-config --cflags libexslt
  OUTPUT_VARIABLE LIBEXSLT_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND pkg-config --libs libexslt
  OUTPUT_VARIABLE LIBEXSLT_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

execute_process (COMMAND pkg-config --cflags libopenvas
  OUTPUT_VARIABLE OPENVAS_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND pkg-config --libs libopenvas
  OUTPUT_VARIABLE OPENVAS_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

execute_process (COMMAND pkg-config --cflags libxslt
  OUTPUT_VARIABLE LIBXSLT_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND pkg-config --libs libxslt
  OUTPUT_VARIABLE LIBXSLT_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

execute_process (COMMAND pkg-config --cflags gnutls
  OUTPUT_VARIABLE GNUTLS_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND pkg-config --libs gnutls
  OUTPUT_VARIABLE GNUTLS_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

message (STATUS "Looking for libgcrypt...")
find_library (LIBGCRYPT gcrypt)
message (STATUS "Looking for libgcrypt... ${LIBGCRYPT}")
if (NOT LIBGCRYPT)
  message (FATAL_ERROR "The libgcrypt library is required.")
endif (NOT LIBGCRYPT)

execute_process (COMMAND libgcrypt-config --libs
  OUTPUT_VARIABLE LIBGCRYPT_LDFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)
execute_process (COMMAND libgcrypt-config --cflags
  OUTPUT_VARIABLE LIBGCRYPT_CFLAGS
  OUTPUT_STRIP_TRAILING_WHITESPACE)

if (NOT LIBMICROHTTPD_FOUND OR NOT LIBXML_FOUND OR NOT GLIB_FOUND OR
    (GTHREAD_REQUIRED AND NOT GTHREAD_FOUND) OR NOT LIBEXSLT_FOUND OR NOT
    LIBOPENVAS_FOUND OR NOT LIBXSLT_FOUND OR NOT GNUTLS_FOUND OR NOT LIBGCRYPT)
  message (FATAL_ERROR "One or more required libraries was not found "
    "(see message above), please install the missing "
    "libraries and run cmake again.")
endif (NOT LIBMICROHTTPD_FOUND OR NOT LIBXML_FOUND OR NOT GLIB_FOUND OR
  (GTHREAD_REQUIRED AND NOT GTHREAD_FOUND) OR NOT LIBEXSLT_FOUND OR NOT
  LIBOPENVAS_FOUND OR NOT LIBXSLT_FOUND OR NOT GNUTLS_FOUND OR NOT LIBGCRYPT)

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
  if (EXISTS "${CMAKE_SOURCE_DIR}/.svn/")
    if (SVN_EXECUTABLE)
      Subversion_GET_REVISION(. ProjectRevision)
      set (SVN_REVISION ".SVN.r${ProjectRevision}")
    else (SVN_EXECUTABLE)
      set (SVN_REVISION ".SVN")
    endif (SVN_EXECUTABLE)
  endif (EXISTS "${CMAKE_SOURCE_DIR}/.svn/")
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
set (CPACK_PACKAGE_VERSION_MAJOR "5")
set (CPACK_PACKAGE_VERSION_MINOR "0")

# Use this scheme for stable releases:
set (CPACK_PACKAGE_VERSION_PATCH "7${SVN_REVISION}")
set (CPACK_PACKAGE_VERSION "${CPACK_PACKAGE_VERSION_MAJOR}.${CPACK_PACKAGE_VERSION_MINOR}.${CPACK_PACKAGE_VERSION_PATCH}")
# Use this scheme for +betaN and +rcN releases:
#set (CPACK_PACKAGE_VERSION_PATCH "+beta1${SVN_REVISION}")
#set (CPACK_PACKAGE_VERSION "${CPACK_PACKAGE_VERSION_MAJOR}.${CPACK_PACKAGE_VERSION_MINOR}${CPACK_PACKAGE_VERSION_PATCH}")

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

if (NOT DATADIR)
  set (DATADIR "${CMAKE_INSTALL_PREFIX}/share")
endif (NOT DATADIR)

set (OPENVAS_STATE_DIR "${LOCALSTATEDIR}/lib/openvas")
set (OPENVAS_LOG_DIR   "${LOCALSTATEDIR}/log/openvas")
set (GSAD_PID_DIR   "${LOCALSTATEDIR}/run")
set (GSA_DATA_DIR "${DATADIR}/openvas/gsa")

# TODO: Eventually use own certificates
set (OPENVAS_SERVER_CERTIFICATE "${OPENVAS_STATE_DIR}/CA/servercert.pem")
set (OPENVAS_SERVER_KEY         "${OPENVAS_STATE_DIR}/private/CA/serverkey.pem")
set (OPENVAS_CA_CERTIFICATE     "${OPENVAS_STATE_DIR}/CA/cacert.pem")

# TODO: Eventually have all configurations collected here:
set (GSA_CONFIG_DIR         "${SYSCONFDIR}/openvas/")
set (GSA_CONFIG_FILE        "${SYSCONFDIR}/openvas/gsa.conf")

message ("-- Install prefix: ${CMAKE_INSTALL_PREFIX}")

## Files generated on installation

add_custom_target (cpe-icon-dict
                   ALL
                   COMMENT "Generating CPE icon dictionary"
                   COMMAND sh "${CMAKE_SOURCE_DIR}/tools/generate-cpe-icon-dict.sh" --src_path "${CMAKE_SOURCE_DIR}/src/html/classic/img/cpe" > ${CMAKE_CURRENT_BINARY_DIR}/cpe-icons.xml
                   WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/tools)

## Version

string (REPLACE "
" "" GSAD_VERSION ${CPACK_PACKAGE_VERSION})

# Configure Doxyfile with version number
configure_file (doc/Doxyfile.in doc/Doxyfile)
configure_file (doc/Doxyfile_full.in doc/Doxyfile_full)
configure_file (VERSION.in VERSION)
configure_file (src/gsad_log_conf.cmake_in src/gsad_log.conf)

## Install

install (FILES src/html/classic/favicon.gif
               src/html/classic/gsad.xsl
               src/html/classic/gsa-style.css
               src/html/classic/help.xsl
               src/html/classic/omp.xsl
               src/html/classic/omp-doc.xsl
               src/html/classic/rnc.xsl
               src/html/classic/os.xml
               src/html/classic/wizard.xsl
         DESTINATION ${GSA_DATA_DIR}/classic)

install (FILES src/html/classic/login/login.html
               src/html/classic/gsa-style.css
               src/html/classic/favicon.gif
         DESTINATION ${GSA_DATA_DIR}/classic/login)

install (FILES src/html/classic/img/gsa_splash.png
         DESTINATION ${GSA_DATA_DIR}/classic/login/img)

install (FILES src/html/classic/po/de.xml
               src/html/classic/po/zh.xml
         DESTINATION ${GSA_DATA_DIR}/classic/po)

install (FILES src/html/classic/help_de.xsl
               src/html/classic/help_zh.xsl
         DESTINATION ${GSA_DATA_DIR}/classic)

install (FILES src/html/classic/img/style/window_dec_a.png
               src/html/classic/img/style/window_dec_b.png
               src/html/classic/img/style/window_dec_c.png
         DESTINATION ${GSA_DATA_DIR}/classic/login/img/style)

install (FILES src/html/classic/img/agent.png
               src/html/classic/img/descending.png
               src/html/classic/img/key.png
               src/html/classic/img/p_bar_bg.png
               src/html/classic/img/start_inactive.png
               src/html/classic/img/alert_sign.png
               src/html/classic/img/details.png
               src/html/classic/img/details_inactive.png
               src/html/classic/img/list_inactive.png
               src/html/classic/img/p_bar_done.png
               src/html/classic/img/start.png
               src/html/classic/img/ascending_inactive.png
               src/html/classic/img/download.png
               src/html/classic/img/list.png
               src/html/classic/img/p_bar_error.png
               src/html/classic/img/stop_inactive.png
               src/html/classic/img/ascending.png
               src/html/classic/img/edit_inactive.png
               src/html/classic/img/p_bar_new.png
               src/html/classic/img/stop.png
               src/html/classic/img/edit.png
               src/html/classic/img/p_bar.png
               src/html/classic/img/bullet2.png
               src/html/classic/img/exe.png
               src/html/classic/img/p_bar_request.png
               src/html/classic/img/trend_down.png
               src/html/classic/img/bullet.png
               src/html/classic/img/refresh.png
               src/html/classic/img/trend_less.png
               src/html/classic/img/deb.png
               src/html/classic/img/gsa_splash.png
               src/html/classic/img/resume_inactive.png
               src/html/classic/img/trend_more.png
               src/html/classic/img/delete_inactive.png
               src/html/classic/img/help.png
               src/html/classic/img/new_note.png
               src/html/classic/img/resume.png
               src/html/classic/img/trend_nochange.png
               src/html/classic/img/delete_note.png
               src/html/classic/img/new.png
               src/html/classic/img/rpm.png
               src/html/classic/img/trend_up.png
               src/html/classic/img/delete.png
               src/html/classic/img/scheduled_inactive.png
               src/html/classic/img/descending_inactive.png
               src/html/classic/img/note.png
               src/html/classic/img/scheduled.png
               src/html/classic/img/pause.png
               src/html/classic/img/override.png
               src/html/classic/img/new_override.png
               src/html/classic/img/pause_inactive.png
               src/html/classic/img/trashcan.png
               src/html/classic/img/trashcan_inactive.png
               src/html/classic/img/indicator_js.png
               src/html/classic/img/restore.png
               src/html/classic/img/restore_inactive.png
               src/html/classic/img/delta.png
               src/html/classic/img/delta_inactive.png
               src/html/classic/img/delta_second.png
               src/html/classic/img/indicator_operation_ok.png
               src/html/classic/img/indicator_operation_failed.png
               src/html/classic/img/prognosis.png
               src/html/classic/img/prognosis_inactive.png
               src/html/classic/img/provide_view.png
               src/html/classic/img/view_other.png
               src/html/classic/img/sensor.png
               src/html/classic/img/wizard.png
               src/html/classic/img/upload.png
               src/html/classic/img/clone.png
               src/html/classic/img/clone_inactive.png
               src/html/classic/img/enchantress.png
               src/html/classic/img/next.png
               src/html/classic/img/next_inactive.png
               src/html/classic/img/previous.png
               src/html/classic/img/previous_inactive.png
               src/html/classic/img/verify.png
               src/html/classic/img/verify_inactive.png
               src/html/classic/img/tag.png
               src/html/classic/img/fold.png
               src/html/classic/img/unfold.png
               src/html/classic/img/enable.png
               src/html/classic/img/disable.png
               src/html/classic/img/overrides_disabled.png
               src/html/classic/img/overrides_enabled.png
               src/html/classic/img/alterable.png
               src/html/classic/img/first.png
               src/html/classic/img/first_inactive.png
               src/html/classic/img/last.png
               src/html/classic/img/last_inactive.png
               src/html/classic/img/feedback.png
         DESTINATION ${GSA_DATA_DIR}/classic/img)

install (FILES src/html/classic/img/style/logo_l.png
               src/html/classic/img/style/logo_r.png
               src/html/classic/img/style/window_dec_a.png
               src/html/classic/img/style/window_dec_b.png
               src/html/classic/img/style/window_dec_c.png
               src/html/classic/img/style/logo_m.png
               src/html/classic/img/style/window_dec_a_error.png
               src/html/classic/img/style/window_dec_b_error.png
               src/html/classic/img/style/window_dec_c_error.png
               src/html/classic/img/style/top_menu_buttons.png
               src/html/classic/img/style/menu_pointy.png
               src/html/classic/img/style/dropdown_arrow.png
               src/html/classic/img/style/dropdown_arrow_green.png
               src/html/classic/img/style/highlight_green.png
         DESTINATION ${GSA_DATA_DIR}/classic/img/style)

install (FILES  src/html/classic/img/os_aix.png
                src/html/classic/img/os_apple.png
                src/html/classic/img/os_centos.png
                src/html/classic/img/os_cisco.png
                src/html/classic/img/os_conflict.png
                src/html/classic/img/os_debian.png
                src/html/classic/img/os_fedora.png
                src/html/classic/img/os_freebsd.png
                src/html/classic/img/os_gentoo.png
                src/html/classic/img/os_gos.png
                src/html/classic/img/os_junos.png
                src/html/classic/img/os_hp.png
                src/html/classic/img/os_linux.png
                src/html/classic/img/os_mandriva.png
                src/html/classic/img/os_netbsd.png
                src/html/classic/img/os_novell.png
                src/html/classic/img/os_openbsd.png
                src/html/classic/img/os_redhat.png
                src/html/classic/img/os_slackware.png
                src/html/classic/img/os_sun.png
                src/html/classic/img/os_suse.png
                src/html/classic/img/os_trustix.png
                src/html/classic/img/os_ubuntu.png
                src/html/classic/img/os_ucs.png
                src/html/classic/img/os_unknown.png
                src/html/classic/img/os_vmware.png
                src/html/classic/img/os_windows.png
         DESTINATION ${GSA_DATA_DIR}/classic/img)

install (FILES src/html/classic/img/cpe/other.png
               src/html/classic/img/cpe/a:apache:http_server.png
               src/html/classic/img/cpe/a:drupal:drupal.png
               src/html/classic/img/cpe/a:google.png
               src/html/classic/img/cpe/a:gnu.png
               src/html/classic/img/cpe/a:mysql:mysql.png
               src/html/classic/img/cpe/a:openbsd:openssh.png
               src/html/classic/img/cpe/a:otrs:otrs.png
               src/html/classic/img/cpe/a:php:php.png
               src/html/classic/img/cpe/a:postgresql:postgresql.png
               src/html/classic/img/cpe/a:snort:snort.png
               src/html/classic/img/cpe/a:sourcefire.png
               src/html/classic/img/cpe/a:typo3:typo3.png
               src/html/classic/img/cpe/a:wordpress:wordpress.png
         DESTINATION ${GSA_DATA_DIR}/classic/img/cpe)

install (FILES ${CMAKE_BINARY_DIR}/src/gsad_log.conf
         DESTINATION ${GSA_CONFIG_DIR})

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/cpe-icons.xml
         DESTINATION ${GSA_DATA_DIR}/classic)

## Program

set (HARDENING_FLAGS            "-Wformat -Wformat-security -O2 -D_FORTIFY_SOURCE=2 -fstack-protector -Wl,-z,relro -Wl,-z,now")

set (CMAKE_C_FLAGS_DEBUG        "${CMAKE_C_FLAGS_DEBUG} -Werror")
set (CMAKE_C_FLAGS              "${CMAKE_C_FLAGS} ${HARDENING_FLAGS} -Wall")

add_subdirectory (src)

## Documentation

add_subdirectory (doc)

## Additional faces

if (INSTALL_FACE_ITS MATCHES "yes")
  message ("-- Additional face 'its' will be installed.")
  add_subdirectory (src/html/its)
endif (INSTALL_FACE_ITS MATCHES "yes")

## End
