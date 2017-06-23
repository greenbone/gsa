# Greenbone Security Assistant
# $Id$
# Description: CMakefile for SPA sources.
#
# Authors:
# Björn Ricks <bjoern.ricks@greenbone.net>
#
# Copyright:
# Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

find_package (Node 6.0 REQUIRED)
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
     ${NG_SRC_DIR}/src/cpe.js
     ${NG_SRC_DIR}/src/index.js
     ${NG_SRC_DIR}/src/locale.js
     ${NG_SRC_DIR}/src/log.js
     ${NG_SRC_DIR}/src/os.js
     ${NG_SRC_DIR}/src/timezones.js
     ${NG_SRC_DIR}/src/utils.js
     ${NG_SRC_DIR}/src/gmp/cache.js
     ${NG_SRC_DIR}/src/gmp/capabilities.js
     ${NG_SRC_DIR}/src/gmp/collectioncounts.js
     ${NG_SRC_DIR}/src/gmp/collectionlist.js
     ${NG_SRC_DIR}/src/gmp/command.js
     ${NG_SRC_DIR}/src/gmp/commands/agents.js
     ${NG_SRC_DIR}/src/gmp/commands/alerts.js
     ${NG_SRC_DIR}/src/gmp/commands/certbund.js
     ${NG_SRC_DIR}/src/gmp/commands/cpes.js
     ${NG_SRC_DIR}/src/gmp/commands/credentials.js
     ${NG_SRC_DIR}/src/gmp/commands/cves.js
     ${NG_SRC_DIR}/src/gmp/commands/dfncert.js
     ${NG_SRC_DIR}/src/gmp/commands/groups.js
     ${NG_SRC_DIR}/src/gmp/commands/filters.js
     ${NG_SRC_DIR}/src/gmp/commands/hosts.js
     ${NG_SRC_DIR}/src/gmp/commands/login.js
     ${NG_SRC_DIR}/src/gmp/commands/notes.js
     ${NG_SRC_DIR}/src/gmp/commands/nvt.js
     ${NG_SRC_DIR}/src/gmp/commands/os.js
     ${NG_SRC_DIR}/src/gmp/commands/ovaldefs.js
     ${NG_SRC_DIR}/src/gmp/commands/overrides.js
     ${NG_SRC_DIR}/src/gmp/commands/permissions.js
     ${NG_SRC_DIR}/src/gmp/commands/portlists.js
     ${NG_SRC_DIR}/src/gmp/commands/reportformats.js
     ${NG_SRC_DIR}/src/gmp/commands/reports.js
     ${NG_SRC_DIR}/src/gmp/commands/results.js
     ${NG_SRC_DIR}/src/gmp/commands/roles.js
     ${NG_SRC_DIR}/src/gmp/commands/scanconfigs.js
     ${NG_SRC_DIR}/src/gmp/commands/scanners.js
     ${NG_SRC_DIR}/src/gmp/commands/schedules.js
     ${NG_SRC_DIR}/src/gmp/commands/secinfo.js
     ${NG_SRC_DIR}/src/gmp/commands/tags.js
     ${NG_SRC_DIR}/src/gmp/commands/targets.js
     ${NG_SRC_DIR}/src/gmp/commands/tasks.js
     ${NG_SRC_DIR}/src/gmp/commands/users.js
     ${NG_SRC_DIR}/src/gmp/commands/vulns.js
     ${NG_SRC_DIR}/src/gmp/gmp.js
     ${NG_SRC_DIR}/src/gmp/http.js
     ${NG_SRC_DIR}/src/gmp/list.js
     ${NG_SRC_DIR}/src/gmp/model.js
     ${NG_SRC_DIR}/src/gmp/models/agent.js
     ${NG_SRC_DIR}/src/gmp/models/alert.js
     ${NG_SRC_DIR}/src/gmp/models/certbund.js
     ${NG_SRC_DIR}/src/gmp/models/chartpreferences.js
     ${NG_SRC_DIR}/src/gmp/models/credential.js
     ${NG_SRC_DIR}/src/gmp/models/cpe.js
     ${NG_SRC_DIR}/src/gmp/models/cve.js
     ${NG_SRC_DIR}/src/gmp/models/dfncert.js
     ${NG_SRC_DIR}/src/gmp/models/group.js
     ${NG_SRC_DIR}/src/gmp/models/filter.js
     ${NG_SRC_DIR}/src/gmp/models/host.js
     ${NG_SRC_DIR}/src/gmp/models/login.js
     ${NG_SRC_DIR}/src/gmp/models/note.js
     ${NG_SRC_DIR}/src/gmp/models/os.js
     ${NG_SRC_DIR}/src/gmp/models/ovaldef.js
     ${NG_SRC_DIR}/src/gmp/models/override.js
     ${NG_SRC_DIR}/src/gmp/models/permission.js
     ${NG_SRC_DIR}/src/gmp/models/nvt.js
     ${NG_SRC_DIR}/src/gmp/models/portlist.js
     ${NG_SRC_DIR}/src/gmp/models/reportformat.js
     ${NG_SRC_DIR}/src/gmp/models/report.js
     ${NG_SRC_DIR}/src/gmp/models/result.js
     ${NG_SRC_DIR}/src/gmp/models/role.js
     ${NG_SRC_DIR}/src/gmp/models/scanconfig.js
     ${NG_SRC_DIR}/src/gmp/models/scanner.js
     ${NG_SRC_DIR}/src/gmp/models/schedule.js
     ${NG_SRC_DIR}/src/gmp/models/secinfo.js
     ${NG_SRC_DIR}/src/gmp/models/settings.js
     ${NG_SRC_DIR}/src/gmp/models/tag.js
     ${NG_SRC_DIR}/src/gmp/models/target.js
     ${NG_SRC_DIR}/src/gmp/models/task.js
     ${NG_SRC_DIR}/src/gmp/models/user.js
     ${NG_SRC_DIR}/src/gmp/models/vulnerability.js
     ${NG_SRC_DIR}/src/gmp/parser.js
     ${NG_SRC_DIR}/src/gmp/promise.js
     ${NG_SRC_DIR}/src/gmp/response.js
     ${NG_SRC_DIR}/src/gmp/xml2json.js
     ${NG_SRC_DIR}/src/web/agents/agentspage.js
     ${NG_SRC_DIR}/src/web/agents/dialog.js
     ${NG_SRC_DIR}/src/web/agents/row.js
     ${NG_SRC_DIR}/src/web/alerts/alertspage.js
     ${NG_SRC_DIR}/src/web/alerts/dialogcontainer.js
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
     ${NG_SRC_DIR}/src/web/assetspage.js
     ${NG_SRC_DIR}/src/web/comment.js
     ${NG_SRC_DIR}/src/web/credentials/credentialspage.js
     ${NG_SRC_DIR}/src/web/credentials/dialog.js
     ${NG_SRC_DIR}/src/web/credentials/downloadicon.js
     ${NG_SRC_DIR}/src/web/credentials/row.js
     ${NG_SRC_DIR}/src/web/certbund/charts.js
     ${NG_SRC_DIR}/src/web/certbund/certbundadvspage.js
     ${NG_SRC_DIR}/src/web/certbund/filterdialog.js
     ${NG_SRC_DIR}/src/web/certbund/row.js
     ${NG_SRC_DIR}/src/web/certbund/table.js
     ${NG_SRC_DIR}/src/web/cveid.js
     ${NG_SRC_DIR}/src/web/cves/charts.js
     ${NG_SRC_DIR}/src/web/cves/cvespage.js
     ${NG_SRC_DIR}/src/web/cves/filterdialog.js
     ${NG_SRC_DIR}/src/web/cves/row.js
     ${NG_SRC_DIR}/src/web/cves/table.js
     ${NG_SRC_DIR}/src/web/cpes/charts.js
     ${NG_SRC_DIR}/src/web/cpes/cpespage.js
     ${NG_SRC_DIR}/src/web/cpes/filterdialog.js
     ${NG_SRC_DIR}/src/web/cpes/row.js
     ${NG_SRC_DIR}/src/web/cpes/table.js
     ${NG_SRC_DIR}/src/web/dashboard/dashboard.js
     ${NG_SRC_DIR}/src/web/dashboard/datasource.js
     ${NG_SRC_DIR}/src/web/dashboard/chart.js
     ${NG_SRC_DIR}/src/web/dashboard/commoncharts.js
     ${NG_SRC_DIR}/src/web/dfncert/charts.js
     ${NG_SRC_DIR}/src/web/dfncert/dfncertadvspage.js
     ${NG_SRC_DIR}/src/web/dfncert/row.js
     ${NG_SRC_DIR}/src/web/dfncert/table.js
     ${NG_SRC_DIR}/src/web/dialog/dialog.js
     ${NG_SRC_DIR}/src/web/dialog/error.js
     ${NG_SRC_DIR}/src/web/dialog/footer.js
     ${NG_SRC_DIR}/src/web/dialog/title.js
     ${NG_SRC_DIR}/src/web/divider/divider.js
     ${NG_SRC_DIR}/src/web/divider/icondivider.js
     ${NG_SRC_DIR}/src/web/entities/actions.js
     ${NG_SRC_DIR}/src/web/entities/container.js
     ${NG_SRC_DIR}/src/web/entities/entitynametabledata.js
     ${NG_SRC_DIR}/src/web/entities/footer.js
     ${NG_SRC_DIR}/src/web/entities/header.js
     ${NG_SRC_DIR}/src/web/entities/icons/entitycloneicon.js
     ${NG_SRC_DIR}/src/web/entities/icons/entitydeleteicon.js
     ${NG_SRC_DIR}/src/web/entities/icons/entityediticon.js
     ${NG_SRC_DIR}/src/web/entities/icons/entityobservericon.js
     ${NG_SRC_DIR}/src/web/entities/icons/entitytrashicon.js
     ${NG_SRC_DIR}/src/web/entities/link.js
     ${NG_SRC_DIR}/src/web/entities/page.js
     ${NG_SRC_DIR}/src/web/entities/row.js
     ${NG_SRC_DIR}/src/web/entities/selection.js
     ${NG_SRC_DIR}/src/web/entities/table.js
     ${NG_SRC_DIR}/src/web/entity/block.js
     ${NG_SRC_DIR}/src/web/entity/container.js
     ${NG_SRC_DIR}/src/web/entity/info.js
     ${NG_SRC_DIR}/src/web/entity/page.js
     ${NG_SRC_DIR}/src/web/entity/tags.js
     ${NG_SRC_DIR}/src/web/filters/dialog.js
     ${NG_SRC_DIR}/src/web/filters/filterspage.js
     ${NG_SRC_DIR}/src/web/filters/row.js
     ${NG_SRC_DIR}/src/web/footer.js
     ${NG_SRC_DIR}/src/web/footnote.js
     ${NG_SRC_DIR}/src/web/form/button.js
     ${NG_SRC_DIR}/src/web/form/checkbox.js
     ${NG_SRC_DIR}/src/web/form/datepicker.js
     ${NG_SRC_DIR}/src/web/form/download.js
     ${NG_SRC_DIR}/src/web/form/field.js
     ${NG_SRC_DIR}/src/web/form/filefield.js
     ${NG_SRC_DIR}/src/web/form/form.js
     ${NG_SRC_DIR}/src/web/form/formgroup.js
     ${NG_SRC_DIR}/src/web/form/passwordfield.js
     ${NG_SRC_DIR}/src/web/form/radio.js
     ${NG_SRC_DIR}/src/web/form/select2.js
     ${NG_SRC_DIR}/src/web/form/spinner.js
     ${NG_SRC_DIR}/src/web/form/submitbutton.js
     ${NG_SRC_DIR}/src/web/form/textarea.js
     ${NG_SRC_DIR}/src/web/form/textfield.js
     ${NG_SRC_DIR}/src/web/form/timezoneselect.js
     ${NG_SRC_DIR}/src/web/form/yesnoradio.js
     ${NG_SRC_DIR}/src/web/groups/dialog.js
     ${NG_SRC_DIR}/src/web/groups/groupsppage.js
     ${NG_SRC_DIR}/src/web/groups/header.js
     ${NG_SRC_DIR}/src/web/groups/row.js
     ${NG_SRC_DIR}/src/web/header.js
     ${NG_SRC_DIR}/src/web/homepage.js
     ${NG_SRC_DIR}/src/web/hosts/charts.js
     ${NG_SRC_DIR}/src/web/hosts/dialog.js
     ${NG_SRC_DIR}/src/web/hosts/filterdialog.js
     ${NG_SRC_DIR}/src/web/hosts/hostspage.js
     ${NG_SRC_DIR}/src/web/hosts/row.js
     ${NG_SRC_DIR}/src/web/hosts/table.js
     ${NG_SRC_DIR}/src/web/icons/cloneicon.js
     ${NG_SRC_DIR}/src/web/icons/cpeicon.js
     ${NG_SRC_DIR}/src/web/icons/deleteicon.js
     ${NG_SRC_DIR}/src/web/icons/editicon.js
     ${NG_SRC_DIR}/src/web/icons/exporticon.js
     ${NG_SRC_DIR}/src/web/icons/greenbone.js
     ${NG_SRC_DIR}/src/web/icons/helpicon.js
     ${NG_SRC_DIR}/src/web/icons/icon.js
     ${NG_SRC_DIR}/src/web/icons/newicon.js
     ${NG_SRC_DIR}/src/web/icons/osicon.js
     ${NG_SRC_DIR}/src/web/icons/trashicon.js
     ${NG_SRC_DIR}/src/web/img.js
     ${NG_SRC_DIR}/src/web/layout.js
     ${NG_SRC_DIR}/src/web/loading.js
     ${NG_SRC_DIR}/src/web/link/assetlink.js
     ${NG_SRC_DIR}/src/web/link/detailslink.js
     ${NG_SRC_DIR}/src/web/link/external.js
     ${NG_SRC_DIR}/src/web/link/infolink.js
     ${NG_SRC_DIR}/src/web/link/innerlink.js
     ${NG_SRC_DIR}/src/web/link/legacylink.js
     ${NG_SRC_DIR}/src/web/link/link.js
     ${NG_SRC_DIR}/src/web/loginpage.js
     ${NG_SRC_DIR}/src/web/main.js
     ${NG_SRC_DIR}/src/web/menu/iconmenu.js
     ${NG_SRC_DIR}/src/web/menu/menubar.js
     ${NG_SRC_DIR}/src/web/menu/menuentry.js
     ${NG_SRC_DIR}/src/web/menu/menu.js
     ${NG_SRC_DIR}/src/web/notes/charts.js
     ${NG_SRC_DIR}/src/web/notes/dialog.js
     ${NG_SRC_DIR}/src/web/notes/notespage.js
     ${NG_SRC_DIR}/src/web/notes/filterdialog.js
     ${NG_SRC_DIR}/src/web/notes/row.js
     ${NG_SRC_DIR}/src/web/notes/table.js
     ${NG_SRC_DIR}/src/web/nvts/charts.js
     ${NG_SRC_DIR}/src/web/nvts/filterdialog.js
     ${NG_SRC_DIR}/src/web/nvts/nvtspage.js
     ${NG_SRC_DIR}/src/web/nvts/row.js
     ${NG_SRC_DIR}/src/web/nvts/table.js
     ${NG_SRC_DIR}/src/web/os/filterdialog.js
     ${NG_SRC_DIR}/src/web/os/operatingsystemspage.js
     ${NG_SRC_DIR}/src/web/os/row.js
     ${NG_SRC_DIR}/src/web/os/table.js
     ${NG_SRC_DIR}/src/web/ovaldefs/filterdialog.js
     ${NG_SRC_DIR}/src/web/ovaldefs/ovaldefspage.js
     ${NG_SRC_DIR}/src/web/ovaldefs/row.js
     ${NG_SRC_DIR}/src/web/ovaldefs/table.js
     ${NG_SRC_DIR}/src/web/overrides/charts.js
     ${NG_SRC_DIR}/src/web/overrides/dialog.js
     ${NG_SRC_DIR}/src/web/overrides/filterdialog.js
     ${NG_SRC_DIR}/src/web/overrides/overridespage.js
     ${NG_SRC_DIR}/src/web/overrides/row.js
     ${NG_SRC_DIR}/src/web/overrides/table.js
     ${NG_SRC_DIR}/src/web/os/charts.js
     ${NG_SRC_DIR}/src/web/ovaldefs/charts.js
     ${NG_SRC_DIR}/src/web/page.js
     ${NG_SRC_DIR}/src/web/pagenotfound.js
     ${NG_SRC_DIR}/src/web/permissions/dialog.js
     ${NG_SRC_DIR}/src/web/permissions/dialogcontainer.js
     ${NG_SRC_DIR}/src/web/permissions/permissionspage.js
     ${NG_SRC_DIR}/src/web/permissions/row.js
     ${NG_SRC_DIR}/src/web/pagination.js
     ${NG_SRC_DIR}/src/web/portlists/dialog.js
     ${NG_SRC_DIR}/src/web/portlists/filterdialog.js
     ${NG_SRC_DIR}/src/web/portlists/importdialog.js
     ${NG_SRC_DIR}/src/web/portlists/portlistspage.js
     ${NG_SRC_DIR}/src/web/portlists/portrangedialog.js
     ${NG_SRC_DIR}/src/web/portlists/row.js
     ${NG_SRC_DIR}/src/web/portlists/table.js
     ${NG_SRC_DIR}/src/web/powerfilter/applyoverridesgroup.js
     ${NG_SRC_DIR}/src/web/powerfilter/dialog.js
     ${NG_SRC_DIR}/src/web/powerfilter/filterstringgroup.js
     ${NG_SRC_DIR}/src/web/powerfilter/firstresultgroup.js
     ${NG_SRC_DIR}/src/web/powerfilter/minqodgroup.js
     ${NG_SRC_DIR}/src/web/powerfilter/powerfilter.js
     ${NG_SRC_DIR}/src/web/powerfilter/resultsperpagegroup.js
     ${NG_SRC_DIR}/src/web/powerfilter/sortbygroup.js
     ${NG_SRC_DIR}/src/web/proptypes.js
     ${NG_SRC_DIR}/src/web/render.js
     ${NG_SRC_DIR}/src/web/reportformats/dialog.js
     ${NG_SRC_DIR}/src/web/reportformats/reportformatspage.js
     ${NG_SRC_DIR}/src/web/reportformats/row.js
     ${NG_SRC_DIR}/src/web/reports/charts.js
     ${NG_SRC_DIR}/src/web/reports/filterdialog.js
     ${NG_SRC_DIR}/src/web/reports/importdialog.js
     ${NG_SRC_DIR}/src/web/reports/reportspage.js
     ${NG_SRC_DIR}/src/web/reports/row.js
     ${NG_SRC_DIR}/src/web/reports/table.js
     ${NG_SRC_DIR}/src/web/results/charts.js
     ${NG_SRC_DIR}/src/web/results/details.js
     ${NG_SRC_DIR}/src/web/results/detailspage.js
     ${NG_SRC_DIR}/src/web/results/filterdialog.js
     ${NG_SRC_DIR}/src/web/results/resultspage.js
     ${NG_SRC_DIR}/src/web/results/row.js
     ${NG_SRC_DIR}/src/web/results/table.js
     ${NG_SRC_DIR}/src/web/roles/dialog.js
     ${NG_SRC_DIR}/src/web/roles/rolespage.js
     ${NG_SRC_DIR}/src/web/roles/row.js
     ${NG_SRC_DIR}/src/web/scanconfigs/dialog.js
     ${NG_SRC_DIR}/src/web/scanconfigs/editconfigfamilydialog.js
     ${NG_SRC_DIR}/src/web/scanconfigs/editdialog.js
     ${NG_SRC_DIR}/src/web/scanconfigs/editnvtdetailsdialog.js
     ${NG_SRC_DIR}/src/web/scanconfigs/header.js
     ${NG_SRC_DIR}/src/web/scanconfigs/importdialog.js
     ${NG_SRC_DIR}/src/web/scanconfigs/nvtpreference.js
     ${NG_SRC_DIR}/src/web/scanconfigs/row.js
     ${NG_SRC_DIR}/src/web/scanconfigs/scanconfigspage.js
     ${NG_SRC_DIR}/src/web/scanconfigs/trend.js
     ${NG_SRC_DIR}/src/web/scanners/dialog.js
     ${NG_SRC_DIR}/src/web/scanners/row.js
     ${NG_SRC_DIR}/src/web/scanners/scannerspage.js
     ${NG_SRC_DIR}/src/web/scanspage.js
     ${NG_SRC_DIR}/src/web/schedules/dialog.js
     ${NG_SRC_DIR}/src/web/schedules/row.js
     ${NG_SRC_DIR}/src/web/schedules/schedulespage.js
     ${NG_SRC_DIR}/src/web/secinfo/charts.js
     ${NG_SRC_DIR}/src/web/secinfo/filterdialog.js
     ${NG_SRC_DIR}/src/web/secinfopage.js
     ${NG_SRC_DIR}/src/web/secinfo/row.js
     ${NG_SRC_DIR}/src/web/secinfo/secinfospage.js
     ${NG_SRC_DIR}/src/web/secinfo/table.js
     ${NG_SRC_DIR}/src/web/section.js
     ${NG_SRC_DIR}/src/web/selectiontype.js
     ${NG_SRC_DIR}/src/web/severitybar.js
     ${NG_SRC_DIR}/src/web/severityclasslabels.js
     ${NG_SRC_DIR}/src/web/solutiontype.js
     ${NG_SRC_DIR}/src/web/sortby.js
     ${NG_SRC_DIR}/src/web/statusbar.js
     ${NG_SRC_DIR}/src/web/sticky/container.js
     ${NG_SRC_DIR}/src/web/sticky/sticky.js
     ${NG_SRC_DIR}/src/web/table/body.js
     ${NG_SRC_DIR}/src/web/table/data.js
     ${NG_SRC_DIR}/src/web/table/header.js
     ${NG_SRC_DIR}/src/web/table/head.js
     ${NG_SRC_DIR}/src/web/table/info.js
     ${NG_SRC_DIR}/src/web/table/row.js
     ${NG_SRC_DIR}/src/web/table/simple.js
     ${NG_SRC_DIR}/src/web/table/stripped.js
     ${NG_SRC_DIR}/src/web/table/table.js
     ${NG_SRC_DIR}/src/web/tags/dialog.js
     ${NG_SRC_DIR}/src/web/tags/row.js
     ${NG_SRC_DIR}/src/web/tags/tagspage.js
     ${NG_SRC_DIR}/src/web/targets/dialog.js
     ${NG_SRC_DIR}/src/web/targets/dialogcontainer.js
     ${NG_SRC_DIR}/src/web/targets/filterdialog.js
     ${NG_SRC_DIR}/src/web/targets/row.js
     ${NG_SRC_DIR}/src/web/targets/table.js
     ${NG_SRC_DIR}/src/web/targets/targetspage.js
     ${NG_SRC_DIR}/src/web/tasks/actions.js
     ${NG_SRC_DIR}/src/web/tasks/addresultstoassetsgroup.js
     ${NG_SRC_DIR}/src/web/tasks/autodeletereportsgroup.js
     ${NG_SRC_DIR}/src/web/tasks/charts.js
     ${NG_SRC_DIR}/src/web/tasks/containerdialog.js
     ${NG_SRC_DIR}/src/web/tasks/dialogcontainer.js
     ${NG_SRC_DIR}/src/web/tasks/dialog.js
     ${NG_SRC_DIR}/src/web/tasks/filterdialog.js
     ${NG_SRC_DIR}/src/web/tasks/row.js
     ${NG_SRC_DIR}/src/web/tasks/table.js
     ${NG_SRC_DIR}/src/web/tasks/task.js
     ${NG_SRC_DIR}/src/web/tasks/taskspage.js
     ${NG_SRC_DIR}/src/web/tasks/trend.js
     ${NG_SRC_DIR}/src/web/titlebar.js
     ${NG_SRC_DIR}/src/web/toolbar.js
     ${NG_SRC_DIR}/src/web/users/confirmdeletedialog.js
     ${NG_SRC_DIR}/src/web/users/dialog.js
     ${NG_SRC_DIR}/src/web/users/header.js
     ${NG_SRC_DIR}/src/web/users/row.js
     ${NG_SRC_DIR}/src/web/users/userspage.js
     ${NG_SRC_DIR}/src/web/vulns/charts.js
     ${NG_SRC_DIR}/src/web/vulns/filterdialog.js
     ${NG_SRC_DIR}/src/web/vulns/row.js
     ${NG_SRC_DIR}/src/web/vulns/table.js
     ${NG_SRC_DIR}/src/web/vulns/vulnspage.js
     ${NG_SRC_DIR}/src/web/wizard/advancedtaskwizard.js
     ${NG_SRC_DIR}/src/web/wizard/modifytaskwizard.js
     ${NG_SRC_DIR}/src/web/wizard/taskwizard.js
     )

set (NG_JS_SRC_FILES
     ${NG_JS_SRC_FILES}
     PARENT_SCOPE)


set (NG_CSS_SRC_FILES
     ${NG_SRC_DIR}/src/web/css/cveid.css
     ${NG_SRC_DIR}/src/web/css/footer.css
     ${NG_SRC_DIR}/src/web/css/footnote.css
     ${NG_SRC_DIR}/src/web/css/gsa-base.css
     ${NG_SRC_DIR}/src/web/css/jquery-ui.structure.css
     ${NG_SRC_DIR}/src/web/css/jquery-ui.theme.css
     ${NG_SRC_DIR}/src/web/css/layout.css
     ${NG_SRC_DIR}/src/web/css/login.css
     ${NG_SRC_DIR}/src/web/css/main.css
     ${NG_SRC_DIR}/src/web/css/page.css
     ${NG_SRC_DIR}/src/web/css/pagination.css
     ${NG_SRC_DIR}/src/web/css/section.css
     ${NG_SRC_DIR}/src/web/css/severityclasslabels.css
     ${NG_SRC_DIR}/src/web/css/sortby.css
     ${NG_SRC_DIR}/src/web/css/statusbar.css
     ${NG_SRC_DIR}/src/web/css/titlebar.css
     ${NG_SRC_DIR}/src/web/dashboard/css/dashboard.css
     ${NG_SRC_DIR}/src/web/dialog/css/dialog.css
     ${NG_SRC_DIR}/src/web/entities/css/component.css
     ${NG_SRC_DIR}/src/web/entities/css/footer.css
     ${NG_SRC_DIR}/src/web/form/css/button.css
     ${NG_SRC_DIR}/src/web/form/css/checkboxradio.css
     ${NG_SRC_DIR}/src/web/form/css/datepicker.css
     ${NG_SRC_DIR}/src/web/form/css/form.css
     ${NG_SRC_DIR}/src/web/form/css/formgroup.css
     ${NG_SRC_DIR}/src/web/form/css/select2.css
     ${NG_SRC_DIR}/src/web/form/css/spinner.css
     ${NG_SRC_DIR}/src/web/menu/css/iconmenu.css
     ${NG_SRC_DIR}/src/web/menu/css/menubar.css
     ${NG_SRC_DIR}/src/web/menu/css/menu.css
     ${NG_SRC_DIR}/src/web/menu/css/menuentry.css
     ${NG_SRC_DIR}/src/web/powerfilter/css/powerfilter.css
     ${NG_SRC_DIR}/src/web/users/css/row.css
     ${NG_SRC_DIR}/src/web/wizard/css/wizard.css
     )

set (NG_FILES
     ${NG_BUILD_DIR}/config.js
     ${NG_BUILD_DIR}/index.html)


add_custom_command (OUTPUT node-modules.stamp
                    DEPENDS ${NG_PKG_FILES}
                    COMMAND ${INSTALLER} "install"
                    COMMAND cmake -E touch ${CMAKE_CURRENT_BINARY_DIR}/node-modules.stamp
                    WORKING_DIRECTORY ${NG_SRC_DIR}
                    COMMENT "Install gsa-ng js dependencies")


add_custom_command (OUTPUT bundle.stamp
                    COMMAND ${INSTALLER} run build
                    COMMAND cmake -E touch ${CMAKE_CURRENT_BINARY_DIR}/bundle.stamp
                    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
                    DEPENDS  ${CMAKE_CURRENT_BINARY_DIR}/node-modules.stamp
                             ${NG_PKG_FILES}
                             ${NG_SRC_FILES}
                             ${NG_JS_SRC_FILES}
                             ${NG_CSS_SRC_FILES}
                    COMMENT "Build gsa-ng install files")

add_custom_target (gsa-ng ALL
                   DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/node-modules.stamp
                           ${CMAKE_CURRENT_BINARY_DIR}/bundle.stamp)

install (FILES ${NG_FILES}
         DESTINATION ${NG_DEST_DIR})

# remove old generated files
install (CODE "file(REMOVE_RECURSE ${NG_DEST_DIR}/static)")

install (DIRECTORY build/static
         DESTINATION ${NG_DEST_DIR})
