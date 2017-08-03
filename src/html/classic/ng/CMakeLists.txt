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
    "yarn for reproducible builds (see https://yarnpkg.com/en/docs/install). "
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
     ${NG_SRC_DIR}/src/gmp/commands/filters.js
     ${NG_SRC_DIR}/src/gmp/commands/groups.js
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
     ${NG_SRC_DIR}/src/gmp/index.js
     ${NG_SRC_DIR}/src/gmp/list.js
     ${NG_SRC_DIR}/src/gmp/locale.js
     ${NG_SRC_DIR}/src/gmp/log.js
     ${NG_SRC_DIR}/src/gmp/model.js
     ${NG_SRC_DIR}/src/gmp/models/agent.js
     ${NG_SRC_DIR}/src/gmp/models/alert.js
     ${NG_SRC_DIR}/src/gmp/models/asset.js
     ${NG_SRC_DIR}/src/gmp/models/certbund.js
     ${NG_SRC_DIR}/src/gmp/models/chartpreferences.js
     ${NG_SRC_DIR}/src/gmp/models/cpe.js
     ${NG_SRC_DIR}/src/gmp/models/credential.js
     ${NG_SRC_DIR}/src/gmp/models/cve.js
     ${NG_SRC_DIR}/src/gmp/models/dfncert.js
     ${NG_SRC_DIR}/src/gmp/models/filter.js
     ${NG_SRC_DIR}/src/gmp/models/group.js
     ${NG_SRC_DIR}/src/gmp/models/host.js
     ${NG_SRC_DIR}/src/gmp/models/info.js
     ${NG_SRC_DIR}/src/gmp/models/login.js
     ${NG_SRC_DIR}/src/gmp/models/note.js
     ${NG_SRC_DIR}/src/gmp/models/nvt.js
     ${NG_SRC_DIR}/src/gmp/models/os.js
     ${NG_SRC_DIR}/src/gmp/models/ovaldef.js
     ${NG_SRC_DIR}/src/gmp/models/override.js
     ${NG_SRC_DIR}/src/gmp/models/permission.js
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
     ${NG_SRC_DIR}/src/gmp/timezones.js
     ${NG_SRC_DIR}/src/gmp/utils.js
     ${NG_SRC_DIR}/src/gmp/xml2json.js
     ${NG_SRC_DIR}/src/web/pages/agents/listpage.js
     ${NG_SRC_DIR}/src/web/pages/agents/dialog.js
     ${NG_SRC_DIR}/src/web/pages/agents/row.js
     ${NG_SRC_DIR}/src/web/pages/alerts/listpage.js
     ${NG_SRC_DIR}/src/web/pages/alerts/dialogcontainer.js
     ${NG_SRC_DIR}/src/web/pages/alerts/dialog.js
     ${NG_SRC_DIR}/src/web/pages/alerts/emailmethodpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/filtercountchangedconditionpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/filtercountleastconditionpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/httpmethodpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/scpmethodpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/secinfoeventpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/sendmethodpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/severitychangedconditionpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/severityleastconditionpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/snmpmethodpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/sourcefiremethodpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/starttaskmethodpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/taskeventpart.js
     ${NG_SRC_DIR}/src/web/pages/alerts/verinicemethodpart.js
     ${NG_SRC_DIR}/src/web/app.js
     ${NG_SRC_DIR}/src/web/pages/credentials/listpage.js
     ${NG_SRC_DIR}/src/web/pages/credentials/dialog.js
     ${NG_SRC_DIR}/src/web/pages/credentials/downloadicon.js
     ${NG_SRC_DIR}/src/web/pages/credentials/row.js
     ${NG_SRC_DIR}/src/web/pages/certbund/charts.js
     ${NG_SRC_DIR}/src/web/pages/certbund/listpage.js
     ${NG_SRC_DIR}/src/web/pages/certbund/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/certbund/row.js
     ${NG_SRC_DIR}/src/web/pages/certbund/table.js
     ${NG_SRC_DIR}/src/web/components/badge/badge.js
     ${NG_SRC_DIR}/src/web/components/bar/menubar.js
     ${NG_SRC_DIR}/src/web/components/bar/severitybar.js
     ${NG_SRC_DIR}/src/web/components/bar/statusbar.js
     ${NG_SRC_DIR}/src/web/components/bar/titlebar.js
     ${NG_SRC_DIR}/src/web/components/bar/toolbar.js
     ${NG_SRC_DIR}/src/web/components/comment/comment.js
     ${NG_SRC_DIR}/src/web/components/dashboard/dashboard.js
     ${NG_SRC_DIR}/src/web/components/dashboard/datasource.js
     ${NG_SRC_DIR}/src/web/components/dashboard/chart.js
     ${NG_SRC_DIR}/src/web/components/dashboard/commoncharts.js
     ${NG_SRC_DIR}/src/web/components/dialog/dialog.js
     ${NG_SRC_DIR}/src/web/components/dialog/error.js
     ${NG_SRC_DIR}/src/web/components/dialog/footer.js
     ${NG_SRC_DIR}/src/web/components/dialog/noticedialog.js
     ${NG_SRC_DIR}/src/web/components/dialog/title.js
     ${NG_SRC_DIR}/src/web/components/dialog/withDialog.js
     ${NG_SRC_DIR}/src/web/components/folding/folding.js
     ${NG_SRC_DIR}/src/web/components/footnote/footnote.js
     ${NG_SRC_DIR}/src/web/components/form/button.js
     ${NG_SRC_DIR}/src/web/components/form/checkbox.js
     ${NG_SRC_DIR}/src/web/components/form/datepicker.js
     ${NG_SRC_DIR}/src/web/components/form/download.js
     ${NG_SRC_DIR}/src/web/components/form/field.js
     ${NG_SRC_DIR}/src/web/components/form/filefield.js
     ${NG_SRC_DIR}/src/web/components/form/formgroup.js
     ${NG_SRC_DIR}/src/web/components/form/form.js
     ${NG_SRC_DIR}/src/web/components/form/passwordfield.js
     ${NG_SRC_DIR}/src/web/components/form/radio.js
     ${NG_SRC_DIR}/src/web/components/form/select2.js
     ${NG_SRC_DIR}/src/web/components/form/spinner.js
     ${NG_SRC_DIR}/src/web/components/form/submitbutton.js
     ${NG_SRC_DIR}/src/web/components/form/textarea.js
     ${NG_SRC_DIR}/src/web/components/form/textfield.js
     ${NG_SRC_DIR}/src/web/components/form/timezoneselect.js
     ${NG_SRC_DIR}/src/web/components/form/withChangeHandler.js
     ${NG_SRC_DIR}/src/web/components/form/withDownload.js
     ${NG_SRC_DIR}/src/web/components/form/yesnoradio.js
     ${NG_SRC_DIR}/src/web/components/icon/cloneicon.js
     ${NG_SRC_DIR}/src/web/components/icon/cpeicon.js
     ${NG_SRC_DIR}/src/web/components/icon/deleteicon.js
     ${NG_SRC_DIR}/src/web/components/icon/editicon.js
     ${NG_SRC_DIR}/src/web/components/icon/exporticon.js
     ${NG_SRC_DIR}/src/web/components/icon/greenboneicon.js
     ${NG_SRC_DIR}/src/web/components/icon/helpicon.js
     ${NG_SRC_DIR}/src/web/components/icon/icon.js
     ${NG_SRC_DIR}/src/web/components/icon/listicon.js
     ${NG_SRC_DIR}/src/web/components/icon/newicon.js
     ${NG_SRC_DIR}/src/web/components/icon/osicon.js
     ${NG_SRC_DIR}/src/web/components/icon/solutiontypeicon.js
     ${NG_SRC_DIR}/src/web/components/icon/trashicon.js
     ${NG_SRC_DIR}/src/web/components/icon/withIconCss.js
     ${NG_SRC_DIR}/src/web/components/icon/withIconSize.js
     ${NG_SRC_DIR}/src/web/components/img/img.js
     ${NG_SRC_DIR}/src/web/components/label/severityclass.js
     ${NG_SRC_DIR}/src/web/components/layout/divider.js
     ${NG_SRC_DIR}/src/web/components/layout/icondivider.js
     ${NG_SRC_DIR}/src/web/components/layout/layout.js
     ${NG_SRC_DIR}/src/web/components/layout/wrapper.js
     ${NG_SRC_DIR}/src/web/components/loading/loading.js
     ${NG_SRC_DIR}/src/web/components/link/assetlink.js
     ${NG_SRC_DIR}/src/web/components/link/certlink.js
     ${NG_SRC_DIR}/src/web/components/link/cvelink.js
     ${NG_SRC_DIR}/src/web/components/link/detailslink.js
     ${NG_SRC_DIR}/src/web/components/link/externallink.js
     ${NG_SRC_DIR}/src/web/components/link/infolink.js
     ${NG_SRC_DIR}/src/web/components/link/innerlink.js
     ${NG_SRC_DIR}/src/web/components/link/legacylink.js
     ${NG_SRC_DIR}/src/web/components/link/link.js
     ${NG_SRC_DIR}/src/web/components/menu/iconmenu.js
     ${NG_SRC_DIR}/src/web/components/menu/menuentry.js
     ${NG_SRC_DIR}/src/web/components/menu/menu.js
     ${NG_SRC_DIR}/src/web/components/pagination/pagination.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/applyoverridesgroup.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/dialog.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/filterstringgroup.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/firstresultgroup.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/minqodgroup.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/powerfilter.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/resultsperpagegroup.js
     ${NG_SRC_DIR}/src/web/components/powerfilter/sortbygroup.js
     ${NG_SRC_DIR}/src/web/components/provider/cachefactoryprovider.js
     ${NG_SRC_DIR}/src/web/components/provider/cacheprovider.js
     ${NG_SRC_DIR}/src/web/components/provider/iconsizeprovider.js
     ${NG_SRC_DIR}/src/web/components/section/section.js
     ${NG_SRC_DIR}/src/web/components/sortby/sortby.js
     ${NG_SRC_DIR}/src/web/components/sticky/container.js
     ${NG_SRC_DIR}/src/web/components/sticky/sticky.js
     ${NG_SRC_DIR}/src/web/components/structure/footer.js
     ${NG_SRC_DIR}/src/web/components/structure/header.js
     ${NG_SRC_DIR}/src/web/components/structure/main.js
     ${NG_SRC_DIR}/src/web/components/table/body.js
     ${NG_SRC_DIR}/src/web/components/table/data.js
     ${NG_SRC_DIR}/src/web/components/table/header.js
     ${NG_SRC_DIR}/src/web/components/table/head.js
     ${NG_SRC_DIR}/src/web/components/table/info.js
     ${NG_SRC_DIR}/src/web/components/table/row.js
     ${NG_SRC_DIR}/src/web/components/table/simple.js
     ${NG_SRC_DIR}/src/web/components/table/stripped.js
     ${NG_SRC_DIR}/src/web/components/table/table.js
     ${NG_SRC_DIR}/src/web/entities/actions.js
     ${NG_SRC_DIR}/src/web/entities/container.js
     ${NG_SRC_DIR}/src/web/entities/entitynametabledata.js
     ${NG_SRC_DIR}/src/web/entities/footer.js
     ${NG_SRC_DIR}/src/web/entities/header.js
     ${NG_SRC_DIR}/src/web/entities/page.js
     ${NG_SRC_DIR}/src/web/entities/row.js
     ${NG_SRC_DIR}/src/web/entities/selection.js
     ${NG_SRC_DIR}/src/web/entities/table.js
     ${NG_SRC_DIR}/src/web/entities/withEntitiesContainer.js
     ${NG_SRC_DIR}/src/web/entities/withRowDetails.js
     ${NG_SRC_DIR}/src/web/entity/block.js
     ${NG_SRC_DIR}/src/web/entity/box.js
     ${NG_SRC_DIR}/src/web/entity/container.js
     ${NG_SRC_DIR}/src/web/entity/icon/cloneicon.js
     ${NG_SRC_DIR}/src/web/entity/icon/createicon.js
     ${NG_SRC_DIR}/src/web/entity/icon/deleteicon.js
     ${NG_SRC_DIR}/src/web/entity/icon/editicon.js
     ${NG_SRC_DIR}/src/web/entity/icon/observericon.js
     ${NG_SRC_DIR}/src/web/entity/icon/trashicon.js
     ${NG_SRC_DIR}/src/web/entity/info.js
     ${NG_SRC_DIR}/src/web/entity/link.js
     ${NG_SRC_DIR}/src/web/entity/note.js
     ${NG_SRC_DIR}/src/web/entity/override.js
     ${NG_SRC_DIR}/src/web/entity/page.js
     ${NG_SRC_DIR}/src/web/entity/permissions.js
     ${NG_SRC_DIR}/src/web/entity/tags.js
     ${NG_SRC_DIR}/src/web/entity/withEntityComponent.js
     ${NG_SRC_DIR}/src/web/pages/allsecinfo/charts.js
     ${NG_SRC_DIR}/src/web/pages/allsecinfo/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/allsecinfo/listpage.js
     ${NG_SRC_DIR}/src/web/pages/allsecinfo/row.js
     ${NG_SRC_DIR}/src/web/pages/allsecinfo/table.js
     ${NG_SRC_DIR}/src/web/pages/assetspage.js
     ${NG_SRC_DIR}/src/web/pages/cpes/charts.js
     ${NG_SRC_DIR}/src/web/pages/cpes/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/cpes/listpage.js
     ${NG_SRC_DIR}/src/web/pages/cpes/row.js
     ${NG_SRC_DIR}/src/web/pages/cpes/table.js
     ${NG_SRC_DIR}/src/web/pages/cves/charts.js
     ${NG_SRC_DIR}/src/web/pages/cves/details.js
     ${NG_SRC_DIR}/src/web/pages/cves/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/cves/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/cves/listpage.js
     ${NG_SRC_DIR}/src/web/pages/cves/row.js
     ${NG_SRC_DIR}/src/web/pages/cves/table.js
     ${NG_SRC_DIR}/src/web/pages/dfncert/charts.js
     ${NG_SRC_DIR}/src/web/pages/dfncert/listpage.js
     ${NG_SRC_DIR}/src/web/pages/dfncert/row.js
     ${NG_SRC_DIR}/src/web/pages/dfncert/table.js
     ${NG_SRC_DIR}/src/web/pages/filters/dialog.js
     ${NG_SRC_DIR}/src/web/pages/filters/listpage.js
     ${NG_SRC_DIR}/src/web/pages/filters/row.js
     ${NG_SRC_DIR}/src/web/pages/groups/dialog.js
     ${NG_SRC_DIR}/src/web/pages/groups/header.js
     ${NG_SRC_DIR}/src/web/pages/groups/listpage.js
     ${NG_SRC_DIR}/src/web/pages/groups/row.js
     ${NG_SRC_DIR}/src/web/pages/homepage.js
     ${NG_SRC_DIR}/src/web/pages/hosts/charts.js
     ${NG_SRC_DIR}/src/web/pages/hosts/details.js
     ${NG_SRC_DIR}/src/web/pages/hosts/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/hosts/dialog.js
     ${NG_SRC_DIR}/src/web/pages/hosts/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/hosts/identifiers.js
     ${NG_SRC_DIR}/src/web/pages/hosts/listpage.js
     ${NG_SRC_DIR}/src/web/pages/hosts/row.js
     ${NG_SRC_DIR}/src/web/pages/hosts/table.js
     ${NG_SRC_DIR}/src/web/pages/hosts/withHostComponent.js
     ${NG_SRC_DIR}/src/web/pages/loginpage.js
     ${NG_SRC_DIR}/src/web/pages/notes/charts.js
     ${NG_SRC_DIR}/src/web/pages/notes/details.js
     ${NG_SRC_DIR}/src/web/pages/notes/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/notes/dialog.js
     ${NG_SRC_DIR}/src/web/pages/notes/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/notes/listpage.js
     ${NG_SRC_DIR}/src/web/pages/notes/row.js
     ${NG_SRC_DIR}/src/web/pages/notes/table.js
     ${NG_SRC_DIR}/src/web/pages/notes/withNoteComponent.js
     ${NG_SRC_DIR}/src/web/pages/notfoundpage.js
     ${NG_SRC_DIR}/src/web/pages/nvts/charts.js
     ${NG_SRC_DIR}/src/web/pages/nvts/details.js
     ${NG_SRC_DIR}/src/web/pages/nvts/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/nvts/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/nvts/listpage.js
     ${NG_SRC_DIR}/src/web/pages/nvts/preferences.js
     ${NG_SRC_DIR}/src/web/pages/nvts/references.js
     ${NG_SRC_DIR}/src/web/pages/nvts/row.js
     ${NG_SRC_DIR}/src/web/pages/nvts/solution.js
     ${NG_SRC_DIR}/src/web/pages/nvts/table.js
     ${NG_SRC_DIR}/src/web/pages/os/charts.js
     ${NG_SRC_DIR}/src/web/pages/os/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/os/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/os/listpage.js
     ${NG_SRC_DIR}/src/web/pages/os/row.js
     ${NG_SRC_DIR}/src/web/pages/os/table.js
     ${NG_SRC_DIR}/src/web/pages/ovaldefs/charts.js
     ${NG_SRC_DIR}/src/web/pages/ovaldefs/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/ovaldefs/listpage.js
     ${NG_SRC_DIR}/src/web/pages/ovaldefs/row.js
     ${NG_SRC_DIR}/src/web/pages/ovaldefs/table.js
     ${NG_SRC_DIR}/src/web/pages/overrides/charts.js
     ${NG_SRC_DIR}/src/web/pages/overrides/details.js
     ${NG_SRC_DIR}/src/web/pages/overrides/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/overrides/dialog.js
     ${NG_SRC_DIR}/src/web/pages/overrides/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/overrides/listpage.js
     ${NG_SRC_DIR}/src/web/pages/overrides/row.js
     ${NG_SRC_DIR}/src/web/pages/overrides/table.js
     ${NG_SRC_DIR}/src/web/pages/overrides/withOverrideComponent.js
     ${NG_SRC_DIR}/src/web/pages/page.js
     ${NG_SRC_DIR}/src/web/pages/permissions/dialog.js
     ${NG_SRC_DIR}/src/web/pages/permissions/listpage.js
     ${NG_SRC_DIR}/src/web/pages/permissions/multipledialog.js
     ${NG_SRC_DIR}/src/web/pages/permissions/row.js
     ${NG_SRC_DIR}/src/web/pages/permissions/table.js
     ${NG_SRC_DIR}/src/web/pages/permissions/withPermissionsComponent.js
     ${NG_SRC_DIR}/src/web/pages/portlists/dialog.js
     ${NG_SRC_DIR}/src/web/pages/portlists/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/portlists/importdialog.js
     ${NG_SRC_DIR}/src/web/pages/portlists/listpage.js
     ${NG_SRC_DIR}/src/web/pages/portlists/portrangedialog.js
     ${NG_SRC_DIR}/src/web/pages/portlists/row.js
     ${NG_SRC_DIR}/src/web/pages/portlists/table.js
     ${NG_SRC_DIR}/src/web/pages/reportformats/dialog.js
     ${NG_SRC_DIR}/src/web/pages/reportformats/listpage.js
     ${NG_SRC_DIR}/src/web/pages/reportformats/row.js
     ${NG_SRC_DIR}/src/web/pages/reports/charts.js
     ${NG_SRC_DIR}/src/web/pages/reports/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/reports/importdialog.js
     ${NG_SRC_DIR}/src/web/pages/reports/listpage.js
     ${NG_SRC_DIR}/src/web/pages/reports/row.js
     ${NG_SRC_DIR}/src/web/pages/reports/table.js
     ${NG_SRC_DIR}/src/web/pages/results/charts.js
     ${NG_SRC_DIR}/src/web/pages/results/details.js
     ${NG_SRC_DIR}/src/web/pages/results/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/results/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/results/listpage.js
     ${NG_SRC_DIR}/src/web/pages/results/row.js
     ${NG_SRC_DIR}/src/web/pages/results/table.js
     ${NG_SRC_DIR}/src/web/pages/roles/dialog.js
     ${NG_SRC_DIR}/src/web/pages/roles/listpage.js
     ${NG_SRC_DIR}/src/web/pages/roles/row.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/dialog.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/editconfigfamilydialog.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/editdialog.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/editnvtdetailsdialog.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/header.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/importdialog.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/listpage.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/nvtpreference.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/row.js
     ${NG_SRC_DIR}/src/web/pages/scanconfigs/trend.js
     ${NG_SRC_DIR}/src/web/pages/scanners/dialog.js
     ${NG_SRC_DIR}/src/web/pages/scanners/listpage.js
     ${NG_SRC_DIR}/src/web/pages/scanners/row.js
     ${NG_SRC_DIR}/src/web/pages/scanspage.js
     ${NG_SRC_DIR}/src/web/pages/schedules/dialog.js
     ${NG_SRC_DIR}/src/web/pages/schedules/listpage.js
     ${NG_SRC_DIR}/src/web/pages/schedules/row.js
     ${NG_SRC_DIR}/src/web/pages/secinfopage.js
     ${NG_SRC_DIR}/src/web/pages/tags/dialog.js
     ${NG_SRC_DIR}/src/web/pages/tags/listpage.js
     ${NG_SRC_DIR}/src/web/pages/tags/row.js
     ${NG_SRC_DIR}/src/web/pages/targets/details.js
     ${NG_SRC_DIR}/src/web/pages/targets/detailspage.js
     ${NG_SRC_DIR}/src/web/pages/targets/dialogcontainer.js
     ${NG_SRC_DIR}/src/web/pages/targets/dialog.js
     ${NG_SRC_DIR}/src/web/pages/targets/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/targets/listpage.js
     ${NG_SRC_DIR}/src/web/pages/targets/row.js
     ${NG_SRC_DIR}/src/web/pages/targets/table.js
     ${NG_SRC_DIR}/src/web/pages/targets/withTargetComponent.js
     ${NG_SRC_DIR}/src/web/pages/tasks/actions.js
     ${NG_SRC_DIR}/src/web/pages/tasks/addresultstoassetsgroup.js
     ${NG_SRC_DIR}/src/web/pages/tasks/autodeletereportsgroup.js
     ${NG_SRC_DIR}/src/web/pages/tasks/charts.js
     ${NG_SRC_DIR}/src/web/pages/tasks/containerdialog.js
     ${NG_SRC_DIR}/src/web/pages/tasks/details.js
     ${NG_SRC_DIR}/src/web/pages/tasks/dialogcontainer.js
     ${NG_SRC_DIR}/src/web/pages/tasks/dialog.js
     ${NG_SRC_DIR}/src/web/pages/tasks/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/tasks/icons/importreporticon.js
     ${NG_SRC_DIR}/src/web/pages/tasks/icons/newiconmenu.js
     ${NG_SRC_DIR}/src/web/pages/tasks/icons/resumeicon.js
     ${NG_SRC_DIR}/src/web/pages/tasks/icons/scheduleicon.js
     ${NG_SRC_DIR}/src/web/pages/tasks/icons/starticon.js
     ${NG_SRC_DIR}/src/web/pages/tasks/icons/stopicon.js
     ${NG_SRC_DIR}/src/web/pages/tasks/listpage.js
     ${NG_SRC_DIR}/src/web/pages/tasks/row.js
     ${NG_SRC_DIR}/src/web/pages/tasks/status.js
     ${NG_SRC_DIR}/src/web/pages/tasks/table.js
     ${NG_SRC_DIR}/src/web/pages/tasks/task.js
     ${NG_SRC_DIR}/src/web/pages/tasks/trend.js
     ${NG_SRC_DIR}/src/web/pages/tasks/withTaskComponent.js
     ${NG_SRC_DIR}/src/web/pages/users/confirmdeletedialog.js
     ${NG_SRC_DIR}/src/web/pages/users/dialog.js
     ${NG_SRC_DIR}/src/web/pages/users/header.js
     ${NG_SRC_DIR}/src/web/pages/users/listpage.js
     ${NG_SRC_DIR}/src/web/pages/users/row.js
     ${NG_SRC_DIR}/src/web/pages/vulns/charts.js
     ${NG_SRC_DIR}/src/web/pages/vulns/filterdialog.js
     ${NG_SRC_DIR}/src/web/pages/vulns/listpage.js
     ${NG_SRC_DIR}/src/web/pages/vulns/row.js
     ${NG_SRC_DIR}/src/web/pages/vulns/table.js
     ${NG_SRC_DIR}/src/web/utils/compose.js
     ${NG_SRC_DIR}/src/web/utils/cpe.js
     ${NG_SRC_DIR}/src/web/utils/os.js
     ${NG_SRC_DIR}/src/web/utils/proptypes.js
     ${NG_SRC_DIR}/src/web/utils/render.js
     ${NG_SRC_DIR}/src/web/utils/selectiontype.js
     ${NG_SRC_DIR}/src/web/utils/urls.js
     ${NG_SRC_DIR}/src/web/utils/withCache.js
     ${NG_SRC_DIR}/src/web/utils/withCapabilities.js
     ${NG_SRC_DIR}/src/web/utils/withComponentDefaults.js
     ${NG_SRC_DIR}/src/web/utils/withContext.js
     ${NG_SRC_DIR}/src/web/utils/withPrefix.js
     ${NG_SRC_DIR}/src/web/utils/withUserName.js
     ${NG_SRC_DIR}/src/web/wizard/advancedtaskwizard.js
     ${NG_SRC_DIR}/src/web/wizard/modifytaskwizard.js
     ${NG_SRC_DIR}/src/web/wizard/taskwizard.js
     )

set (NG_JS_SRC_FILES
     ${NG_JS_SRC_FILES}
     PARENT_SCOPE)


set (NG_CSS_SRC_FILES
     ${NG_SRC_DIR}/src/web/components/bar/css/statusbar.css
     ${NG_SRC_DIR}/src/web/components/dashboard/css/dashboard.css
     ${NG_SRC_DIR}/src/web/components/dialog/css/dialog.css
     ${NG_SRC_DIR}/src/web/components/folding/css/folding.css
     ${NG_SRC_DIR}/src/web/components/form/css/button.css
     ${NG_SRC_DIR}/src/web/components/form/css/checkboxradio.css
     ${NG_SRC_DIR}/src/web/components/form/css/datepicker.css
     ${NG_SRC_DIR}/src/web/components/form/css/form.css
     ${NG_SRC_DIR}/src/web/components/form/css/formgroup.css
     ${NG_SRC_DIR}/src/web/components/form/css/select2.css
     ${NG_SRC_DIR}/src/web/components/form/css/spinner.css
     ${NG_SRC_DIR}/src/web/components/layout/css/layout.css
     ${NG_SRC_DIR}/src/web/components/menu/css/menu.css
     ${NG_SRC_DIR}/src/web/components/powerfilter/css/powerfilter.css
     ${NG_SRC_DIR}/src/web/css/app.css
     ${NG_SRC_DIR}/src/web/css/gsa-base.css
     ${NG_SRC_DIR}/src/web/css/jquery-ui.structure.css
     ${NG_SRC_DIR}/src/web/css/jquery-ui.theme.css
     ${NG_SRC_DIR}/src/web/entities/css/component.css
     ${NG_SRC_DIR}/src/web/entities/css/footer.css
     ${NG_SRC_DIR}/src/web/pages/users/css/row.css
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
