# Greenbone Security Assistant
# $Id$
# Description: CMakefile for SPA sources.
#
# Authors:
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2016 Greenbone Networks GmbH
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

find_package (Node 4.0 REQUIRED)
find_package (Yarn QUIET)

set (NG_BUILD_DIR ${CMAKE_CURRENT_SOURCE_DIR}/build)
set (NG_DEST_DIR ${GSA_DATA_DIR}/classic/ng)
set (NG_SRC_DIR ${CMAKE_CURRENT_SOURCE_DIR})

set (NG_PKG_FILES
     ${NG_SRC_DIR}/package.json)

if (NOT YARN_FOUND)
  MESSAGE (WARNING "Yarn package manager not found. Please install "
    "yarn for reproducable builds (see https://yarnpkg.com/en/docs/install). "
    "Trying to use npm instead.")
  find_package (Npm REQUIRED)
  set (INSTALLER ${NPM_EXECUTABLE})
else (NOT YARN_FOUND)
  message (STATUS "Found Yarn: ${YARN_EXECUTABLE}")
  set (INSTALLER ${YARN_EXECUTABLE})
  list (APPEND NG_PKG_FILES ${NG_SRC_DIR}/yarn.lock)
endif (NOT YARN_FOUND)

set (NG_SRC_FILES
     ${NG_SRC_DIR}/public/index.html
     ${NG_SRC_DIR}/public/config.js)

set (NG_JS_SRC_FILES
     ${NG_SRC_DIR}/src/index.js
     ${NG_SRC_DIR}/src/locale.js
     ${NG_SRC_DIR}/src/timezones.js
     ${NG_SRC_DIR}/src/utils.js
     ${NG_SRC_DIR}/src/gmp/collectioncounts.js
     ${NG_SRC_DIR}/src/gmp/collectionlist.js
     ${NG_SRC_DIR}/src/gmp/command.js
     ${NG_SRC_DIR}/src/gmp/commands/alerts.js
     ${NG_SRC_DIR}/src/gmp/commands/credentials.js
     ${NG_SRC_DIR}/src/gmp/commands/filters.js
     ${NG_SRC_DIR}/src/gmp/commands/login.js
     ${NG_SRC_DIR}/src/gmp/commands/portlists.js
     ${NG_SRC_DIR}/src/gmp/commands/reports.js
     ${NG_SRC_DIR}/src/gmp/commands/scanners.js
     ${NG_SRC_DIR}/src/gmp/commands/schedules.js
     ${NG_SRC_DIR}/src/gmp/commands/targets.js
     ${NG_SRC_DIR}/src/gmp/commands/tasks.js
     ${NG_SRC_DIR}/src/gmp/commands/users.js
     ${NG_SRC_DIR}/src/gmp/gmp.js
     ${NG_SRC_DIR}/src/gmp/http.js
     ${NG_SRC_DIR}/src/gmp/model.js
     ${NG_SRC_DIR}/src/gmp/models/alert.js
     ${NG_SRC_DIR}/src/gmp/models/capabilities.js
     ${NG_SRC_DIR}/src/gmp/models/chartpreferences.js
     ${NG_SRC_DIR}/src/gmp/models/credential.js
     ${NG_SRC_DIR}/src/gmp/models/filter.js
     ${NG_SRC_DIR}/src/gmp/models/login.js
     ${NG_SRC_DIR}/src/gmp/models/portlist.js
     ${NG_SRC_DIR}/src/gmp/models/report.js
     ${NG_SRC_DIR}/src/gmp/models/scanner.js
     ${NG_SRC_DIR}/src/gmp/models/schedule.js
     ${NG_SRC_DIR}/src/gmp/models/settings.js
     ${NG_SRC_DIR}/src/gmp/models/target.js
     ${NG_SRC_DIR}/src/gmp/models/task.js
     ${NG_SRC_DIR}/src/gmp/models/user.js
     ${NG_SRC_DIR}/src/web/alerts/dialog.js
     ${NG_SRC_DIR}/src/web/alerts/emailmethodpart.js
     ${NG_SRC_DIR}/src/web/alerts/filtercountchangedconditionpart.js
     ${NG_SRC_DIR}/src/web/alerts/filtercountleastconditionpart.js
     ${NG_SRC_DIR}/src/web/alerts/httpmethodpart.js
     ${NG_SRC_DIR}/src/web/alerts/scpmethodpart.js
     ${NG_SRC_DIR}/src/web/alerts/secinfoeventpart.js
     ${NG_SRC_DIR}/src/web/alerts/sendmethodpart.js
     ${NG_SRC_DIR}/src/web/alerts/severitychangedconditionpart.js
     ${NG_SRC_DIR}/src/web/alerts/severityleastconditionpart.js
     ${NG_SRC_DIR}/src/web/alerts/snmpmethodpart.js
     ${NG_SRC_DIR}/src/web/alerts/sourcefiremethodpart.js
     ${NG_SRC_DIR}/src/web/alerts/starttaskmethodpart.js
     ${NG_SRC_DIR}/src/web/alerts/taskeventpart.js
     ${NG_SRC_DIR}/src/web/alerts/verinicemethodpart.js
     ${NG_SRC_DIR}/src/web/app.js
     ${NG_SRC_DIR}/src/web/button.js
     ${NG_SRC_DIR}/src/web/credentials/dialog.js
     ${NG_SRC_DIR}/src/web/certbund/charts.js
     ${NG_SRC_DIR}/src/web/cpes/charts.js
     ${NG_SRC_DIR}/src/web/cves/charts.js
     ${NG_SRC_DIR}/src/web/dashboard/dashboard.js
     ${NG_SRC_DIR}/src/web/dashboard/datasource.js
     ${NG_SRC_DIR}/src/web/dashboard/chart.js
     ${NG_SRC_DIR}/src/web/dashboard/commoncharts.js
     ${NG_SRC_DIR}/src/web/dfncert/charts.js
     ${NG_SRC_DIR}/src/web/dialog.js
     ${NG_SRC_DIR}/src/web/filterdialog.js
     ${NG_SRC_DIR}/src/web/footer.js
     ${NG_SRC_DIR}/src/web/form.js
     ${NG_SRC_DIR}/src/web/form/checkbox.js
     ${NG_SRC_DIR}/src/web/form/datepicker.js
     ${NG_SRC_DIR}/src/web/form/download.js
     ${NG_SRC_DIR}/src/web/form/field.js
     ${NG_SRC_DIR}/src/web/form/filefield.js
     ${NG_SRC_DIR}/src/web/form/formgroup.js
     ${NG_SRC_DIR}/src/web/form/formitem.js
     ${NG_SRC_DIR}/src/web/form/formpart.js
     ${NG_SRC_DIR}/src/web/form/passwordfield.js
     ${NG_SRC_DIR}/src/web/form/radio.js
     ${NG_SRC_DIR}/src/web/form/radioselectformpart.js
     ${NG_SRC_DIR}/src/web/form/select2.js
     ${NG_SRC_DIR}/src/web/form/spinner.js
     ${NG_SRC_DIR}/src/web/form/submitbutton.js
     ${NG_SRC_DIR}/src/web/form/textarea.js
     ${NG_SRC_DIR}/src/web/form/textfield.js
     ${NG_SRC_DIR}/src/web/form/timezoneselect.js
     ${NG_SRC_DIR}/src/web/form/yesnoradio.js
     ${NG_SRC_DIR}/src/web/header.js
     ${NG_SRC_DIR}/src/web/helpicon.js
     ${NG_SRC_DIR}/src/web/home.js
     ${NG_SRC_DIR}/src/web/hosts/charts.js
     ${NG_SRC_DIR}/src/web/icon.js
     ${NG_SRC_DIR}/src/web/icons/exporticon.js
     ${NG_SRC_DIR}/src/web/icons/overridesicon.js
     ${NG_SRC_DIR}/src/web/icons/trashicon.js
     ${NG_SRC_DIR}/src/web/img.js
     ${NG_SRC_DIR}/src/web/layout.js
     ${NG_SRC_DIR}/src/web/legacylink.js
     ${NG_SRC_DIR}/src/web/link.js
     ${NG_SRC_DIR}/src/web/login.js
     ${NG_SRC_DIR}/src/web/main.js
     ${NG_SRC_DIR}/src/web/menu/iconmenu.js
     ${NG_SRC_DIR}/src/web/menu/menubar.js
     ${NG_SRC_DIR}/src/web/menu/menuentry.js
     ${NG_SRC_DIR}/src/web/menu/menu.js
     ${NG_SRC_DIR}/src/web/notes/charts.js
     ${NG_SRC_DIR}/src/web/nvts/charts.js
     ${NG_SRC_DIR}/src/web/os/charts.js
     ${NG_SRC_DIR}/src/web/ovaldefs/charts.js
     ${NG_SRC_DIR}/src/web/pagination.js
     ${NG_SRC_DIR}/src/web/portlists/dialog.js
     ${NG_SRC_DIR}/src/web/powerfilter.js
     ${NG_SRC_DIR}/src/web/render.js
     ${NG_SRC_DIR}/src/web/reports/charts.js
     ${NG_SRC_DIR}/src/web/results/charts.js
     ${NG_SRC_DIR}/src/web/schedules/dialog.js
     ${NG_SRC_DIR}/src/web/secinfo/charts.js
     ${NG_SRC_DIR}/src/web/section.js
     ${NG_SRC_DIR}/src/web/selectiontype.js
     ${NG_SRC_DIR}/src/web/severitybar.js
     ${NG_SRC_DIR}/src/web/table.js
     ${NG_SRC_DIR}/src/web/targets/dialog.js
     ${NG_SRC_DIR}/src/web/tasks/charts.js
     ${NG_SRC_DIR}/src/web/tasks/dialog.js
     ${NG_SRC_DIR}/src/web/tasks/filterdialog.js
     ${NG_SRC_DIR}/src/web/tasks/statusbar.js
     ${NG_SRC_DIR}/src/web/tasks/task.js
     ${NG_SRC_DIR}/src/web/tasks/tasks.js
     ${NG_SRC_DIR}/src/web/tasks/taskslist.js
     ${NG_SRC_DIR}/src/web/tasks/taskslistentry.js
     ${NG_SRC_DIR}/src/web/tasks/trend.js
     ${NG_SRC_DIR}/src/web/titlebar.js
     ${NG_SRC_DIR}/src/web/toolbar.js
     ${NG_SRC_DIR}/src/web/wizard/advancedtaskwizard.js
     ${NG_SRC_DIR}/src/web/wizard/modifytaskwizard.js
     ${NG_SRC_DIR}/src/web/wizard/taskwizard.js
     )

set (NG_FILES
     ${NG_BUILD_DIR}/config.js
     ${NG_BUILD_DIR}/index.html)



add_custom_command (OUTPUT ${NG_SRC_DIR}/node_modules
                    DEPENDS ${NG_PKG_FILES}
                    COMMAND ${INSTALLER} "install"
                    WORKING_DIRECTORY ${NG_SRC_DIR}
                    COMMENT "Install js dependencies")


add_custom_command (OUTPUT ${NG_FILES}
                    COMMAND ${INSTALLER} run build
                    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
                    DEPENDS  ${NG_SRC_DIR}/node_modules
                             ${NG_PKG_FILES}
                             ${NG_SRC_FILES}
                             ${NG_JS_SRC_FILES}
                    COMMENT "Build gsa-ng install files")

add_custom_target (gsa-ng ALL
                   DEPENDS ${NG_FILES})

install (FILES ${NG_FILES}
         DESTINATION ${NG_DEST_DIR})

# remove old generated files
install (CODE "file(REMOVE_RECURSE ${NG_DEST_DIR}/static)")

install (DIRECTORY build/static
         DESTINATION ${NG_DEST_DIR})
