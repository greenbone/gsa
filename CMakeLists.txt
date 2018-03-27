# Greenbone Security Assistant
# $Id$
# Description: Top-level cmake control for greenbone-security-assistant
#
# Authors:
# Matthew Mundell <matthew.mundell@greenbone.net>
# Michael Wiegand <michael.wiegand@greenbone.net>
#
# Copyright:
# Copyright (C) 2009-2016 Greenbone Networks GmbH
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

message ("-- Configuring greenbone-security-assistant...")

project (greenbone-security-assistant C)

cmake_minimum_required (VERSION 2.8)

if (POLICY CMP0005)
  cmake_policy (SET CMP0005 OLD)
endif (POLICY CMP0005)
SET(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

# Needed for 'pkg_check_modules' function
include (FindPkgConfig)

if (NOT PKG_CONFIG_FOUND)
  message(FATAL_ERROR "pkg-config executable not found. Aborting.")
endif (NOT PKG_CONFIG_FOUND)

if (NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Debug)
endif (NOT CMAKE_BUILD_TYPE)

if (NOT SERVE_STATIC_ASSETS EQUAL 0)
  set (SERVE_STATIC_ASSETS 1)
endif (NOT SERVE_STATIC_ASSETS EQUAL 0)

## Check existence required tools

SET(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

set (MANDATORY_TOOL_MISSING FALSE)

if (NOT USE_LIBXSLT EQUAL 0)
  set (USE_LIBXSLT 1)
endif (NOT USE_LIBXSLT EQUAL 0)

find_program (PATH_TO_XSLTPROC xsltproc DOC "xsltproc command line "
              "xslt processor.")
if (NOT USE_LIBXSLT AND NOT PATH_TO_XSLTPROC)
  set (MANDATORY_TOOL_MISSING TRUE)
endif (NOT USE_LIBXSLT AND NOT PATH_TO_XSLTPROC)

if (MANDATORY_TOOL_MISSING)
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
pkg_check_modules (GLIB REQUIRED glib-2.0>=2.32)
pkg_check_modules (LIBEXSLT REQUIRED libexslt)
pkg_check_modules (LIBOPENVAS_OMP REQUIRED libopenvas_omp>=9.0.0)
pkg_check_modules (LIBOPENVAS_BASE REQUIRED libopenvas_base>=9.0.0)
pkg_check_modules (LIBOPENVAS_MISC REQUIRED libopenvas_misc>=9.0.0)
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
    LIBOPENVAS_OMP_FOUND OR NOT LIBOPENVAS_BASE_FOUND OR NOT
    LIBOPENVAS_MISC_FOUND OR NOT LIBXSLT_FOUND OR NOT GNUTLS_FOUND OR NOT
    LIBGCRYPT)
  message (FATAL_ERROR "One or more required libraries was not found "
    "(see message above), please install the missing "
    "libraries and run cmake again.")
endif (NOT LIBMICROHTTPD_FOUND OR NOT LIBXML_FOUND OR NOT GLIB_FOUND OR
  (GTHREAD_REQUIRED AND NOT GTHREAD_FOUND) OR NOT LIBEXSLT_FOUND OR NOT
  LIBOPENVAS_OMP_FOUND OR NOT LIBOPENVAS_BASE_FOUND OR NOT LIBOPENVAS_MISC_FOUND
  OR NOT LIBXSLT_FOUND OR NOT GNUTLS_FOUND OR NOT LIBGCRYPT)

## Retrieve git revision (at configure time)
include (GetGit)

if (NOT CMAKE_BUILD_TYPE MATCHES "Release")
  if (EXISTS "${CMAKE_SOURCE_DIR}/.git/")
    if (GIT_EXECUTABLE)
      Git_GET_REVISION(. ProjectRevision)
      set (GIT_REVISION "~git-${ProjectRevision}")
    endif (GIT_EXECUTABLE)
  endif (EXISTS "${CMAKE_SOURCE_DIR}/.git/")
endif (NOT CMAKE_BUILD_TYPE MATCHES "Release")

## Project version
# The following three variables should be set through the project command once
# we require CMake >= 3.0
set (PROJECT_VERSION_MAJOR 7)
set (PROJECT_VERSION_MINOR 0)
set (PROJECT_VERSION_PATCH 3)

# Set beta version if this is a beta release series,
# unset if this is a stable release series.
#set (PROJECT_BETA_RELEASE 1)

if (GIT_REVISION)
  set (PROJECT_VERSION_GIT "${GIT_REVISION}")
else (GIT_REVISION)
  set (PROJECT_VERSION_GIT "~git")
endif (GIT_REVISION)

# If PROJECT_BETA_RELEASE is set, the version string will be set to:
#   "major.minor+beta${PROJECT_BETA_RELEASE}"
# If PROJECT_BETA_RELEASE is NOT set, the version string will be set to:
#   "major.minor.patch"
if (PROJECT_BETA_RELEASE)
  set (PROJECT_VERSION_SUFFIX "+beta${PROJECT_BETA_RELEASE}")
else (PROJECT_BETA_RELEASE)
  set (PROJECT_VERSION_SUFFIX ".${PROJECT_VERSION_PATCH}")
endif (PROJECT_BETA_RELEASE)

set (PROJECT_VERSION_STRING "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}${PROJECT_VERSION_SUFFIX}")

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

set (CPACK_PACKAGE_VERSION "${PROJECT_VERSION_STRING}${PROJECT_VERSION_GIT}")

set (CPACK_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
set (CPACK_SOURCE_PACKAGE_FILE_NAME "${PROJECT_NAME}-${CPACK_PACKAGE_VERSION}")
set (CPACK_PACKAGE_VENDOR "The OpenVAS Project")
set (CPACK_SOURCE_IGNORE_FILES
"${CMAKE_BINARY_DIR}"
"/.git/"
"swp$"
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

if (NOT GSAD_PID_DIR)
  set (GSAD_PID_DIR "${LOCALSTATEDIR}/run")
endif (NOT GSAD_PID_DIR)

set (OPENVAS_STATE_DIR "${LOCALSTATEDIR}/lib/openvas")
set (OPENVAS_LOG_DIR   "${LOCALSTATEDIR}/log/openvas")
set (GSA_DATA_DIR "${DATADIR}/openvas/gsa")
set (GSA_LOCALE_SUBDIR "locale")
set (GSA_LOCALE_DIR "${GSA_DATA_DIR}/${GSA_LOCALE_SUBDIR}")
set (GSA_CHROOT_LOCALE_DIR "/${GSA_LOCALE_SUBDIR}")

# TODO: Eventually use own certificates
set (OPENVAS_SERVER_CERTIFICATE "${OPENVAS_STATE_DIR}/CA/servercert.pem")
set (OPENVAS_SERVER_KEY         "${OPENVAS_STATE_DIR}/private/CA/serverkey.pem")
set (OPENVAS_CA_CERTIFICATE     "${OPENVAS_STATE_DIR}/CA/cacert.pem")

# TODO: Eventually have all configurations collected here:
set (GSA_CONFIG_DIR         "${SYSCONFDIR}/openvas/")
set (GSA_CONFIG_FILE        "${SYSCONFDIR}/openvas/gsa.conf")

if (NOT OPENVAS_RUN_DIR)
  set (OPENVAS_RUN_DIR      "${LOCALSTATEDIR}/run")
endif (NOT OPENVAS_RUN_DIR)

message ("-- Install prefix: ${CMAKE_INSTALL_PREFIX}")

## Files generated on installation

add_custom_target (cpe-icon-dict
                   ALL
                   COMMENT "Generating CPE icon dictionary"
                   COMMAND sh "${CMAKE_SOURCE_DIR}/tools/generate-cpe-icon-dict.sh" --src_path "${CMAKE_SOURCE_DIR}/src/html/classic/img/cpe" > ${CMAKE_CURRENT_BINARY_DIR}/cpe-icons.xml
                   WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/tools)

add_custom_target (zone-dict
                   ALL
                   COMMENT "Generating timezone dictionary"
                   COMMAND sh "${CMAKE_SOURCE_DIR}/tools/generate-zone-dict.sh" > ${CMAKE_CURRENT_BINARY_DIR}/zones.xml
                   WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/tools)

## Version

set (GSAD_VERSION "${PROJECT_VERSION_STRING}")

# Configure Doxyfile with version number
configure_file (doc/Doxyfile.in doc/Doxyfile)
configure_file (doc/Doxyfile_full.in doc/Doxyfile_full)
configure_file (VERSION.in VERSION)
configure_file (src/gsad_log_conf.cmake_in src/gsad_log.conf)

## Install

install (FILES src/html/classic/gsad.xsl
               src/html/classic/graphics.xsl
               src/html/classic/help.xsl
               src/html/classic/omp.xsl
               src/html/classic/omp-doc.xsl
               src/html/classic/rnc.xsl
               src/html/classic/robots.txt
               src/html/classic/os.xml
               src/html/classic/wizard.xsl
         DESTINATION ${GSA_DATA_DIR}/classic)

install (FILES src/html/classic/css/gsa-login.css
               src/html/classic/css/gsa-style.css
               src/html/classic/css/gsa-base.css
               src/html/classic/css/jquery-ui.structure.min.css
               src/html/classic/css/jquery-ui.theme.min.css
               src/html/classic/css/select2.min.css
         DESTINATION ${GSA_DATA_DIR}/classic/css)

install (FILES src/html/classic/css/images/ui-bg_diagonals-thick_18_aa0000_40x40.png
               src/html/classic/css/images/ui-bg_diagonals-thick_30_666666_40x40.png
               src/html/classic/css/images/ui-bg_flat_10_000000_40x100.png
               src/html/classic/css/images/ui-bg_glass_65_ffffff_1x400.png
               src/html/classic/css/images/ui-bg_highlight-hard_35_66c430_1x100.png
               src/html/classic/css/images/ui-bg_highlight-soft_100_519032_1x100.png
               src/html/classic/css/images/ui-bg_highlight-soft_100_87d050_1x100.png
               src/html/classic/css/images/ui-bg_highlight-soft_100_eeeeee_1x100.png
               src/html/classic/css/images/ui-bg_highlight-soft_75_fdc300_1x100.png
               src/html/classic/css/images/ui-icons_222222_256x240.png
               src/html/classic/css/images/ui-icons_519032_256x240.png
               src/html/classic/css/images/ui-icons_87d050_256x240.png
               src/html/classic/css/images/ui-icons_aa0000_256x240.png
               src/html/classic/css/images/ui-icons_fdc300_256x240.png
               src/html/classic/css/images/ui-icons_ffffff_256x240.png
         DESTINATION ${GSA_DATA_DIR}/classic/css/images)

install (FILES src/html/classic/js/lib/d3.tip.js
               src/html/classic/js/lib/d3.layout.cloud.js
               src/html/classic/js/lib/moment.js
               src/html/classic/js/lib/moment-timezone-with-data.js
               src/html/classic/js/gsa_bar_chart.js
               src/html/classic/js/gsa_bubble_chart.js
               src/html/classic/js/gsa_chart_helpers.js
               src/html/classic/js/gsa_graphics_base.js
               src/html/classic/js/gsa_cloud_chart.js
               src/html/classic/js/gsa_dashboard.js
               src/html/classic/js/gsa_donut_chart.js
               src/html/classic/js/gsa_gantt_chart.js
               src/html/classic/js/gsa_h_bar_chart.js
               src/html/classic/js/gsa_line_chart.js
               src/html/classic/js/gsa_topology_chart.js
               src/html/classic/js/gsa_polyfill.js
               src/html/classic/js/greenbone.js
               src/html/classic/js/greenbone-ui.js
         DESTINATION ${GSA_DATA_DIR}/classic/js)

if (CMAKE_BUILD_TYPE MATCHES "Release")
  install (FILES src/html/classic/js/lib/min/d3.v3.js
                 src/html/classic/js/lib/min/jquery-2.1.4.js
                 src/html/classic/js/lib/min/jquery-ui.js
                 src/html/classic/js/lib/min/select2.js
                 src/html/classic/js/lib/min/i18next-2.3.4.js
                 src/html/classic/js/lib/min/i18next-xhr-0.5.3.js
                 src/html/classic/js/lib/min/i18next-languagedetector-0.2.2.js
                 src/html/classic/js/lib/min/xml2json.js
           DESTINATION ${GSA_DATA_DIR}/classic/js)
else (CMAKE_BUILD_TYPE MATCHES "Release")
  install (FILES src/html/classic/js/lib/d3.v3.js
                 src/html/classic/js/lib/jquery-2.1.4.js
                 src/html/classic/js/lib/jquery-ui.js
                 src/html/classic/js/lib/select2.js
                 src/html/classic/js/lib/i18next-2.3.4.js
                 src/html/classic/js/lib/i18next-xhr-0.5.3.js
                 src/html/classic/js/lib/i18next-languagedetector-0.2.2.js
                 src/html/classic/js/lib/xml2json.js
           DESTINATION ${GSA_DATA_DIR}/classic/js)
endif (CMAKE_BUILD_TYPE MATCHES "Release")

install (FILES src/html/classic/css/gsa-login.css
         DESTINATION ${GSA_DATA_DIR}/classic/login)

install (FILES src/html/classic/img/gsa_splash.svg
         DESTINATION ${GSA_DATA_DIR}/classic/login/img)

install (FILES src/html/classic/help_de.xsl
               src/html/classic/help_ru.xsl
               src/html/classic/help_zh_CN.xsl
         DESTINATION ${GSA_DATA_DIR}/classic)

install (FILES src/html/classic/img/style/window_dec_a.png
               src/html/classic/img/style/window_dec_b.png
               src/html/classic/img/style/window_dec_c.png
         DESTINATION ${GSA_DATA_DIR}/classic/login/img/style)

install (FILES src/html/classic/img/agent.svg
               src/html/classic/img/add_to_assets.svg
               src/html/classic/img/calendar.svg
               src/html/classic/img/descending.svg
               src/html/classic/img/key.svg
               src/html/classic/img/start_inactive.svg
               src/html/classic/img/alert_sign.svg
               src/html/classic/img/details.svg
               src/html/classic/img/details_inactive.svg
               src/html/classic/img/list_inactive.svg
               src/html/classic/img/start.svg
               src/html/classic/img/ascending_inactive.svg
               src/html/classic/img/download.svg
               src/html/classic/img/list.svg
               src/html/classic/img/stop_inactive.svg
               src/html/classic/img/ascending.svg
               src/html/classic/img/edit_inactive.svg
               src/html/classic/img/stop.svg
               src/html/classic/img/edit.svg
               src/html/classic/img/exe.svg
               src/html/classic/img/trend_down.svg
               src/html/classic/img/refresh.svg
               src/html/classic/img/trend_less.svg
               src/html/classic/img/deb.svg
               src/html/classic/img/resume_inactive.svg
               src/html/classic/img/trend_more.svg
               src/html/classic/img/delete_inactive.svg
               src/html/classic/img/help.svg
               src/html/classic/img/new_note.svg
               src/html/classic/img/resume.svg
               src/html/classic/img/trend_nochange.svg
               src/html/classic/img/delete_note.svg
               src/html/classic/img/new.svg
               src/html/classic/img/rpm.svg
               src/html/classic/img/trend_up.svg
               src/html/classic/img/delete.svg
               src/html/classic/img/scheduled_inactive.svg
               src/html/classic/img/descending_inactive.svg
               src/html/classic/img/note.svg
               src/html/classic/img/scheduled.svg
               src/html/classic/img/override.svg
               src/html/classic/img/new_override.svg
               src/html/classic/img/trashcan.svg
               src/html/classic/img/trashcan_inactive.svg
               src/html/classic/img/indicator_js.svg
               src/html/classic/img/restore.svg
               src/html/classic/img/restore_inactive.svg
               src/html/classic/img/delta.svg
               src/html/classic/img/delta_inactive.svg
               src/html/classic/img/delta_second.svg
               src/html/classic/img/indicator_operation_ok.svg
               src/html/classic/img/indicator_operation_failed.svg
               src/html/classic/img/provide_view.svg
               src/html/classic/img/view_other.svg
               src/html/classic/img/sensor.svg
               src/html/classic/img/wizard.svg
               src/html/classic/img/upload.svg
               src/html/classic/img/clone.svg
               src/html/classic/img/clone_inactive.svg
               src/html/classic/img/next.svg
               src/html/classic/img/next_inactive.svg
               src/html/classic/img/previous.svg
               src/html/classic/img/previous_inactive.svg
               src/html/classic/img/verify.svg
               src/html/classic/img/verify_inactive.svg
               src/html/classic/img/tag.svg
               src/html/classic/img/fold.svg
               src/html/classic/img/unfold.svg
               src/html/classic/img/enable.svg
               src/html/classic/img/disable.svg
               src/html/classic/img/overrides_disabled.svg
               src/html/classic/img/overrides_enabled.svg
               src/html/classic/img/alterable.svg
               src/html/classic/img/first.svg
               src/html/classic/img/first_inactive.svg
               src/html/classic/img/last.svg
               src/html/classic/img/last_inactive.svg
               src/html/classic/img/feedback.svg
               src/html/classic/img/remove_from_assets.svg
               src/html/classic/img/st_workaround.svg
               src/html/classic/img/solution_type.svg
               src/html/classic/img/st_vendorfix.svg
               src/html/classic/img/st_willnotfix.svg
               src/html/classic/img/st_nonavailable.svg
               src/html/classic/img/st_mitigate.svg
               src/html/classic/img/pause.svg
               src/html/classic/img/cvss_calculator.svg
               src/html/classic/img/dashboard.svg
               src/html/classic/img/my_setting.svg
               src/html/classic/img/performance.svg
               src/html/classic/img/port_list.svg
               src/html/classic/img/alert.svg
               src/html/classic/img/report_format.svg
               src/html/classic/img/credential.svg
               src/html/classic/img/permission.svg
               src/html/classic/img/scanner.svg
               src/html/classic/img/config.svg
               src/html/classic/img/allinfo.svg
               src/html/classic/img/nvt.svg
               src/html/classic/img/report.svg
               src/html/classic/img/agent.svg
               src/html/classic/img/asset.svg
               src/html/classic/img/os.svg
               src/html/classic/img/host.svg
               src/html/classic/img/feed.svg
               src/html/classic/img/cpe.svg
               src/html/classic/img/cve.svg
               src/html/classic/img/ovaldef.svg
               src/html/classic/img/cert_bund_adv.svg
               src/html/classic/img/dfn_cert_adv.svg
               src/html/classic/img/result.svg
               src/html/classic/img/scan.svg
               src/html/classic/img/schedule.svg
               src/html/classic/img/target.svg
               src/html/classic/img/task.svg
               src/html/classic/img/tag.svg
               src/html/classic/img/trashcan.svg
               src/html/classic/img/user.svg
               src/html/classic/img/vul_report.svg
               src/html/classic/img/group.svg
               src/html/classic/img/role.svg
               src/html/classic/img/filter.svg
               src/html/classic/img/note.svg
               src/html/classic/img/override.svg
               src/html/classic/img/slave.svg
               src/html/classic/img/greenbone.svg
               src/html/classic/img/wizard.svg
               src/html/classic/img/ldap.svg
               src/html/classic/img/radius.svg
               src/html/classic/img/gsa.svg
               src/html/classic/img/enchantress.svg
               src/html/classic/img/bullet.svg
               src/html/classic/img/bullet2.svg
               src/html/classic/img/gsa_splash.svg
               src/html/classic/img/prognosis.svg
               src/html/classic/img/prognosis_inactive.svg
         DESTINATION ${GSA_DATA_DIR}/classic/img)

install (FILES src/html/classic/img/login-label.png
               src/html/classic/img/p_bar_done.png
               src/html/classic/img/p_bar_error.png
               src/html/classic/img/p_bar_new.png
               src/html/classic/img/p_bar.png
               src/html/classic/img/p_bar_request.png
               src/html/classic/img/p_bar_gray.png
               src/html/classic/img/p_bar_bg.png
         DESTINATION ${GSA_DATA_DIR}/classic/img)

install (FILES src/html/classic/img/loading.gif
               src/html/classic/img/favicon.gif
         DESTINATION ${GSA_DATA_DIR}/classic/img)

install (FILES src/html/classic/img/style/window_dec_a.png
               src/html/classic/img/style/window_dec_b.png
               src/html/classic/img/style/window_dec_c.png
               src/html/classic/img/style/window_dec_a_error.png
               src/html/classic/img/style/window_dec_b_error.png
               src/html/classic/img/style/window_dec_c_error.png
               src/html/classic/img/style/menu_pointy.png
               src/html/classic/img/style/dropdown_arrow.png
               src/html/classic/img/style/dropdown_arrow_black.png
               src/html/classic/img/style/dropdown_arrow_green.png
         DESTINATION ${GSA_DATA_DIR}/classic/img/style)

install (FILES  src/html/classic/img/os_aix.svg
                src/html/classic/img/os_apple.svg
                src/html/classic/img/os_arubanetworks.svg
                src/html/classic/img/os_centos.svg
                src/html/classic/img/os_checkpoint.svg
                src/html/classic/img/os_cisco.svg
                src/html/classic/img/os_conflict.svg
                src/html/classic/img/os_cyclades.svg
                src/html/classic/img/os_debian.svg
                src/html/classic/img/os_fedora.svg
                src/html/classic/img/os_fortinet.svg
                src/html/classic/img/os_freebsd.svg
                src/html/classic/img/os_gentoo.svg
                src/html/classic/img/os_gos.svg
                src/html/classic/img/os_junos.svg
                src/html/classic/img/os_hp.svg
                src/html/classic/img/os_huawai.svg
                src/html/classic/img/os_ipfire.svg
                src/html/classic/img/os_linux.svg
                src/html/classic/img/os_mandriva.svg
                src/html/classic/img/os_mcafee.svg
                src/html/classic/img/os_netbsd.svg
                src/html/classic/img/os_netgear.svg
                src/html/classic/img/os_novell.svg
                src/html/classic/img/os_openbsd.svg
                src/html/classic/img/os_paloalto.svg
                src/html/classic/img/os_redhat.svg
                src/html/classic/img/os_ruggedcom.svg
                src/html/classic/img/os_slackware.svg
                src/html/classic/img/os_sourcefire.svg
                src/html/classic/img/os_sun.svg
                src/html/classic/img/os_suse.svg
                src/html/classic/img/os_synology.svg
                src/html/classic/img/os_trustix.svg
                src/html/classic/img/os_ubuntu.svg
                src/html/classic/img/os_ucs.svg
                src/html/classic/img/os_unknown.svg
                src/html/classic/img/os_vmware.svg
                src/html/classic/img/os_windows.svg
         DESTINATION ${GSA_DATA_DIR}/classic/img)

install (FILES src/html/classic/img/cpe/other.svg
               src/html/classic/img/cpe/a:apache:http_server.svg
               src/html/classic/img/cpe/a:drupal:drupal.svg
               src/html/classic/img/cpe/a:google.svg
               src/html/classic/img/cpe/a:gnu.svg
               src/html/classic/img/cpe/a:mysql:mysql.svg
               src/html/classic/img/cpe/a:openbsd:openssh.svg
               src/html/classic/img/cpe/a:otrs:otrs.svg
               src/html/classic/img/cpe/a:php:php.svg
               src/html/classic/img/cpe/a:postgresql:postgresql.svg
               src/html/classic/img/cpe/a:snort:snort.svg
               src/html/classic/img/cpe/a:sourcefire.svg
               src/html/classic/img/cpe/a:typo3:typo3.svg
               src/html/classic/img/cpe/a:wordpress:wordpress.svg
         DESTINATION ${GSA_DATA_DIR}/classic/img/cpe)

install (FILES src/html/classic/img/charts/severity-bar-chart.png
         DESTINATION ${GSA_DATA_DIR}/classic/img/charts)

install (FILES ${CMAKE_SOURCE_DIR}/src/language_names.tsv
         DESTINATION ${GSA_DATA_DIR})

install (FILES ${CMAKE_BINARY_DIR}/src/gsad_log.conf
         DESTINATION ${GSA_CONFIG_DIR})

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/cpe-icons.xml
         DESTINATION ${GSA_DATA_DIR}/classic)

install (FILES ${CMAKE_CURRENT_BINARY_DIR}/zones.xml
         DESTINATION ${GSA_DATA_DIR}/classic)

## Program

set (HARDENING_FLAGS            "-Wformat -Wformat-security -O2 -D_FORTIFY_SOURCE=2 -fstack-protector")
set (LINKER_HARDENING_FLAGS     "-Wl,-z,relro -Wl,-z,now")

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
