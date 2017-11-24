/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 Greenbone Networks GmbH
*
* This program is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 2
* of the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
*/

import React from 'react';
import glamorous, {Col} from 'glamorous';

import _ from 'gmp/locale.js';
import {parse_yesno, YES_VALUE} from 'gmp/parser.js';
import {is_defined, is_empty} from 'gmp/utils.js';

import HelpIcon from '../../components/icon/helpicon.js';
import EditIcon from '../../components/icon/editicon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';
import Section from '../../components/section/section.js';

import DetailsLink from '../../components/link/detailslink.js';

import Loading from '../../components/loading/loading.js';

import Table from '../../components/table/simpletable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import compose from '../../utils/compose.js';
import PropTypes from '../../utils/proptypes.js';

import withCapabilities from '../../utils/withCapabilities.js';
import withGmp from '../../utils/withGmp.js';

import SettingsDialog from './dialog.js';

const CA_CERT_ID = '9ac801ea-39f8-11e6-bbaa-28d24461215b';

const SEVERITY_CLASSES = [
  {id: 'nist', name: 'NVD Vulnerability Severity Ratings'},
  {id: 'bsi', name: 'BSI Schwachstellenampel (Germany)'},
  {id: 'classic', name: 'OpenVAS Classic'},
  {id: 'pci-dss', name: 'PCI-DSS'},
];

const Heading = glamorous.h4({marginBottom: '5px'});

const ToolBarIcons = ({onEditSettingsClick}) => (
  <Layout flex>
    <IconDivider>
      <HelpIcon
        page="my_settings"
        title={_('Help: My Settings')}
      />
      <EditIcon
        title={_('Edit My Settings')}
        onClick={onEditSettingsClick}
      />
    </IconDivider>
  </Layout>
);

ToolBarIcons.propTypes = {
  onEditSettingsClick: PropTypes.func.isRequired,
};

class UserSettings extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      loading: true,
      dialogvisible: false,
      general_settings: [],
      severity_settings: [],
      defaults_settings: {},
      filter_settings: [],
      misc_settings: [],
      initial_data: {},
      option_lists: {severitiesList: SEVERITY_CLASSES},
    };
    this.set_filters = [];
    this.set_settings = [];
    this.scanconfigs = [];
    this.capabilities = this.props.capabilities;
    this.createRow = this.createRow.bind(this);
    this.readSettings = this.readSettings.bind(this);
    this.getLanguageNameByCode = this.getLanguageNameByCode.bind(this);
    this.getFilterNameById = this.getFilterNameById.bind(this);
    this.getValueBySettingId = this.getValueBySettingId.bind(this);

    this.openSettingsDialog = this.openSettingsDialog.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.readSettings()
    .then(response => this.createSettinggroupTables(response))
    .then(() => this.setState({loading: false}));
  }

  readSettings() {
    const {gmp} = this.props;
    const {option_lists} = this.state;
    const all_settings = Promise.all([
      gmp.user.currentSettings()
      .then(response => {
        return response.data.getEntries();
      }),
      gmp.filters.getAll()
      .then(response => {
        return response.getEntries();
      }),
      gmp.scanconfigs.getAll()
      .then(response => {
        const config_list = response.getEntries();
        option_lists.scanconfigsList = config_list;
        this.setState({option_lists});
        return config_list;
      }),
      gmp.user.currentLanguages()
      .then(response => {
        option_lists.languagesList = response.data;
        this.setState({option_lists});
        return option_lists.languagesList;
      }),
      gmp.alerts.getAll()
      .then(response => {
        option_lists.alertsList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.credentials.getAll()
      .then(response => {
        option_lists.credentialsList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.portlists.getAll()
      .then(response => {
        option_lists.portlistsList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.reportformats.getAll()
      .then(response => {
        option_lists.reportformatsList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.scanners.getAll()
      .then(response => {
        option_lists.scannersList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.reportformats.getAll()
      .then(response => {
        option_lists.reportformatsList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.schedules.getAll()
      .then(response => {
        option_lists.schedulesList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.targets.getAll()
      .then(response => {
        option_lists.targetsList = response.getEntries();
        this.setState({option_lists});
      }),
      gmp.filters.getAll()
      .then(response => {
        const filtersList = response.getEntries();
        const filtersListAgent = filtersList.filter(
          item => {
            return item.filter_type === 'Agent';
          });
        const filtersListAlert = filtersList.filter(
          item => {
            return item.filter_type === 'Alert';
          });
        const filtersListAsset = filtersList.filter(
          item => {
            return item.filter_type === 'Asset';
          });
        const filtersListConfig = filtersList.filter(
          item => {
            return item.filter_type === 'Config';
          });
        const filtersListCredential = filtersList.filter(
          item => {
            return item.filter_type === 'Credential';
          });
        const filtersListFilter = filtersList.filter(
          item => {
            return item.filter_type === 'Filter';
          });
        const filtersListNote = filtersList.filter(
          item => {
            return item.filter_type === 'Note';
          });
        const filtersListOverride = filtersList.filter(
          item => {
            return item.filter_type === 'Override';
          });
        const filtersListPermission = filtersList.filter(
          item => {
            return item.filter_type === 'Permission';
          });
        const filtersListPortlist = filtersList.filter(
          item => {
            return item.filter_type === 'Portlist';
          });
        const filtersListReport = filtersList.filter(
          item => {
            return item.filter_type === 'Report';
          });
        const filtersListReportformat = filtersList.filter(
          item => {
            return item.filter_type === 'Reportformat';
          });
        const filtersListResult = filtersList.filter(
          item => {
            return item.filter_type === 'Result';
          });
        const filtersListRole = filtersList.filter(
          item => {
            return item.filter_type === 'Role';
          });
        const filtersListSchedule = filtersList.filter(
          item => {
            return item.filter_type === 'Schedule';
          });
        const filtersListTag = filtersList.filter(
          item => {
            return item.filter_type === 'Tag';
          });
        const filtersListTarget = filtersList.filter(
          item => {
            return item.filter_type === 'Target';
          });
        const filtersListTask = filtersList.filter(
          item => {
            return item.filter_type === 'Task';
          });
        const filtersListSecinfo = filtersList.filter(
          item => {
            return item.filter_type === 'SecInfo';
          });
        option_lists.filtersList = {};
        option_lists.filtersList.agent = filtersListAgent;
        option_lists.filtersList.alert = filtersListAlert;
        option_lists.filtersList.asset = filtersListAsset;
        option_lists.filtersList.config = filtersListConfig;
        option_lists.filtersList.credential = filtersListCredential;
        option_lists.filtersList.filter = filtersListFilter;
        option_lists.filtersList.note = filtersListNote;
        option_lists.filtersList.override = filtersListOverride;
        option_lists.filtersList.permission = filtersListPermission;
        option_lists.filtersList.portlist = filtersListPortlist;
        option_lists.filtersList.report = filtersListReport;
        option_lists.filtersList.reportformat = filtersListReportformat;
        option_lists.filtersList.result = filtersListResult;
        option_lists.filtersList.role = filtersListRole;
        option_lists.filtersList.schedule = filtersListSchedule;
        option_lists.filtersList.tag = filtersListTag;
        option_lists.filtersList.target = filtersListTarget;
        option_lists.filtersList.task = filtersListTask;
        option_lists.filtersList.secinfo = filtersListSecinfo;
        this.setState({option_lists});
      }),
    ]);
    return all_settings;
  }

  createSettinggroupTables(settings) {
    if (settings === undefined) {
      return;
    }
    const {gmp} = this.props;
    const general_settings = [];
    const severity_settings = [];
    const defaults_settings = {};
    const filter_settings = {};
    const misc_settings = [];
    const initial_data = {};
    const promises = [];
    const all_possible_settings = {
      'Timezone': '', // eslint-disable-line quote-props
      'Password': '********', // eslint-disable-line quote-props
      'User Interface Language': '',
      'Rows Per Page': '',
      'Max Rows Per Page (immutable)': '',
      'Details Export File Name': '',
      'List Export File Name': '',
      'Report Export File Name': '',
      'Severity Class': '',
      'Dynamic Severity': '',
      'Default Severity': '',
      'Default Alert': '',
      'Default OpenVAS Scan Config': '',
      'Default OSP Scan Config': '',
      'Default SSH Credential': '',
      'Default SMB Credential': '',
      'Default ESXi Credential': '',
      'Default SNMP Credential': '',
      'Default Port List': '',
      'Default OpenVAS Scanner': '',
      'Default OSP Scanner': '',
      'Default Report Format': '',
      'Default Schedule': '',
      'Default Target': '',
      'Agents Filter': '',
      'Alerts Filter': '',
      'Assets Filter': '',
      'Configs Filter': '',
      'Credentials Filter': '',
      'Filters Filter': '',
      'Notes Filter': '',
      'Overrides Filter': '',
      'Permissions Filter': '',
      'Port Lists Filter': '',
      'Reports Filter': '',
      'Report Formats Filter': '',
      'Results Filter': '',
      'Roles Filter': '',
      'Schedules Filter': '',
      'Tags Filter': '',
      'Targets Filter': '',
      'Tasks Filter': '',
      'CPE Filter': '',
      'CVE Filter': '',
      'NVT Filter': '',
      'OVAL Filter': '',
      'CERT-Bund Filter': '',
      'DFN-CERT Filter': '',
      'All SecInfo Filter': '',
      'Default CA Cert (immutable)': '',
      'Auto Cache Rebuild': '',
    };

    // get settings, filters and scanconfigs from the Promise.all result in
    // readSettings()
    this.set_settings = settings[0];// eslint-disable-line prefer-destructuring
    this.set_filters = settings[1]; // eslint-disable-line prefer-destructuring
    this.scanconfigs = settings[2]; // eslint-disable-line prefer-destructuring
    this.languages = settings[3];

    for (const [key, item] of this.set_settings) {
        all_possible_settings[key] = item.value;
    }
    for (const item in all_possible_settings) {
      if (item === 'Timezone') {
        const set_timezone = gmp.globals.timezone;
        general_settings.push({Timezone: set_timezone});
        initial_data.timezone = set_timezone;
      }
      else if (item === 'Password') {
        general_settings.push({Password: all_possible_settings[item]});
        initial_data.oldpassword = '';
        initial_data.newpassword = '';
      }
      else if (item === 'User Interface Language') {
        const code = all_possible_settings[item];
        const set_language = this.getLanguageNameByCode(code);
        general_settings.push({
          'User Interface Language': set_language,
        });
        initial_data.userinterfacelanguage = code;
      }
      else if (item === 'Rows Per Page') {
        const set_rows_per_page = all_possible_settings[item];
        general_settings.push({
          'Rows Per Page': set_rows_per_page,
        });
        initial_data.rowsperpage = set_rows_per_page;
      }
      else if (item === 'Max Rows Per Page') {
        general_settings.push({
          'Max Rows Per Page (immutable)': all_possible_settings[item],
        });
      }
      else if (item === 'Details Export File Name') {
        const set_details_export_file_name = all_possible_settings[item];
        general_settings.push({
          'Details Export File Name': set_details_export_file_name,
        });
        initial_data.detailsexportfilename = set_details_export_file_name;
      }
      else if (item === 'List Export File Name') {
        const set_list_export_file_name = all_possible_settings[item];
        general_settings.push({
          'List Export File Name': set_list_export_file_name,
        });
        initial_data.listexportfilename = set_list_export_file_name;
      }
      else if (item === 'Report Export File Name') {
        const set_report_export_file_name = all_possible_settings[item];
        general_settings.push({
          'Report Export File Name': set_report_export_file_name,
        });
        initial_data.reportexportfilename = set_report_export_file_name;
      }
      else if (item === 'Severity Class') {
        const set_severity_class = all_possible_settings[item];
        let class_name;
        const set_class = SEVERITY_CLASSES.find(
          clazz => {
            return clazz.id === set_severity_class;
          });
        if (is_defined(set_class)) {
          class_name = set_class.name;
        }
        severity_settings.push({
          'Severity Class': class_name,
        });
        initial_data.severityclass = set_severity_class;
      }
      else if (item === 'Dynamic Severity') {
        const value = parse_yesno(all_possible_settings[item]) === YES_VALUE ?
          _('Yes') : _('No');
        severity_settings.push({
          'Dynamic Severity': value,
        });
        initial_data.dynamicseverity = all_possible_settings[item];
      }
      else if (item === 'Default Severity') {
        const set_default_severity = all_possible_settings[item];
        severity_settings.push({
          'Default Severity': set_default_severity,
        });
        initial_data.defaultseverity = set_default_severity;
      }
      else if (item === 'Default Alert') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.alert.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultalert = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default OpenVAS Scan Config') {
        const id = all_possible_settings[item];
        const value = this.getConfigNameById(id);
        defaults_settings[item] = value;
        initial_data.defaultopenvasscanconfig = id;
      }
      else if (item === 'Default OSP Scan Config') {
        const id = all_possible_settings[item];
        const value = this.getConfigNameById(id);
        defaults_settings[item] = value;
        initial_data.defaultospscanconfig = id;
      }
      else if (item === 'Default SSH Credential') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          gmp.credential.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultsshcredential = id;
            this.setState({defaults_settings});
          });
        }
      }
      else if (item === 'Default SMB Credential') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.credential.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultsmbcredential = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default ESXi Credential') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.credential.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultesxicredential = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default SNMP Credential') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.credential.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultsnmpcredential = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default Port List') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.portlist.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultportlist = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default OpenVAS Scanner') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.scanner.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultopenvasscanner = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default OSP Scanner') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.scanner.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultospscanner = name;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default Report Format') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.reportformat.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultreportformat = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default Schedule') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.schedule.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaultschedule = id;
            this.setState({defaults_settings});
          }));
        }
      }
      else if (item === 'Default Target') {
        const id = all_possible_settings[item];
        if (is_empty(id)) {
          defaults_settings[item] = '';
        }
        else {
          promises.push(gmp.target.get({id}).then(response => {
            const {name} = response.data;
            defaults_settings[item] = name;
            initial_data.defaulttarget = id;
            this.setState({defaults_settings});
          }));
        }
      }

      else if (item === 'Agents Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.agentsfilter = id;
      }
      else if (item === 'Alerts Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.alertsfilter = id;
      }
      else if (item === 'Assets Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.assetsfilter = id;
      }
      else if (item === 'Configs Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.configsfilter = id;
      }
      else if (item === 'Credentials Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.credentialsfilter = id;
      }
      else if (item === 'Filters Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.filtersfilter = id;
      }
      else if (item === 'Notes Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.notesfilter = id;
      }
      else if (item === 'Overrides Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.overridesfilter = id;
      }
      else if (item === 'Permissions Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.permissionsfilter = id;
      }
      else if (item === 'Port Lists Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.portlistsfilter = id;
      }
      else if (item === 'Reports Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.reportsfilter = id;
      }
      else if (item === 'Report Formats Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.reportformatsfilter = id;
      }
      else if (item === 'Results Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.resultsfilter = id;
      }
      else if (item === 'Roles Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.rolesfilter = id;
      }
      else if (item === 'Schedules Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.schedulesfilter = id;
      }
      else if (item === 'Tags Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.tagsfilter = id;
      }
      else if (item === 'Targets Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.targetsfilter = id;
      }
      else if (item === 'Tasks Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.tasksfilter = id;
      }
      else if (item === 'CPE Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.cpefilter = id;
      }
      else if (item === 'CVE Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.cvefilter = id;
      }
      else if (item === 'NVT Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.nvtfilter = id;
      }
      else if (item === 'OVAL Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.ovalfilter = id;
      }
      else if (item === 'CERT-Bund Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.certbundfilter = id;
      }
      else if (item === 'DFN-CERT Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.dfncertfilter = id;
      }
      else if (item === 'All SecInfo Filter') {
        const id = all_possible_settings[item];
        const filter_name = this.getFilterNameById(id);
        filter_settings[item] = filter_name;
        initial_data.allsecinfofilter = id;
      }
      else if (item === 'Default CA Cert (immutable)') {
        const cacert = this.getValueBySettingId(CA_CERT_ID);
        misc_settings.push({'Default CA Cert (immutable)': cacert});
      }
      else if (item === 'Auto Cache Rebuild') {
        const autocache_value = all_possible_settings[item];
        const value = parse_yesno(autocache_value) === YES_VALUE ?
          _('Yes') : _('No');
        misc_settings.push({'Auto Cache Rebuild': value});
        initial_data.autocacherebuild = autocache_value;
      }
    }
    this.setState({
      general_settings: general_settings,
      severity_settings: severity_settings,
      defaults_settings: defaults_settings,
      filter_settings: filter_settings,
      misc_settings: misc_settings,
      initial_data: initial_data,
    });
    return Promise.all(promises);
  }

  createRow(setting) {
    const [name, value] = Object.entries(setting)[0]; // eslint-disable-line prefer-destructuring
    return (
      <TableRow key={name}>
        <TableData>
          {name}
        </TableData>
        <TableData>
          {value}
        </TableData>
      </TableRow>
    );
  }

  getConfigNameById(id) {
    const config = this.scanconfigs.find(
      item => {
        return item.id === id;
      });
    if (is_defined(config)) {
      return config.name;
    }
  }

  getFilterNameById(id) {
    const filter = this.set_filters.find(
      item => {
        return item.id === id;
      });
    if (is_defined(filter)) {
      return filter.name;
    }
  }

  getLanguageNameByCode(code) {
    const language = this.languages.find(
      item => {
        return item.code === code;
      });
    if (is_defined(language)) {
      return language.name;
    };
  }

  getValueBySettingId(id) {
    const cacert = this.set_settings.find(
      item => {
        return item[1].id === id;
      });
    if (is_defined(cacert)) {
      return cacert[1].value;
    }
  }

  handleSaveSettings(data) {
    const {gmp} = this.props;
    return gmp.user.saveSettings(data)
      .then(() => this.load());
  }

  openSettingsDialog() {
    this.setState({
      dialogvisible: true,
    });
  }

  handleCloseDialog() {
    this.setState({dialogvisible: false});
  }

  render() {
    const {
      general_settings,
      severity_settings,
      defaults_settings,
      filter_settings,
      misc_settings,
      dialogvisible,
      initial_data,
      option_lists,
      loading,
    } = this.state;

    const {capabilities} = this.props;

    if (loading) {
      return <Loading loading={true}/>;
    };

    const general_rows = general_settings.map(this.createRow);
    const severity_rows = severity_settings.map(this.createRow);
    const misc_rows = misc_settings.map(this.createRow);

    const defaults = [
      ['Default Alert', 'alert', initial_data.defaultalert],
      ['Default ESXi Credential', 'credential',
        initial_data.defaultesxicredential],
      ['Default OSP Scan Config', 'config', initial_data.defaultospscanconfig],
      ['Default OSP Scanner', 'scanner', initial_data.defaultospscanner],
      ['Default OpenVAS Scan Config', 'config',
        initial_data.defaultopenvasscanconfig],
      ['Default OpenVAS Scanner', 'scanner',
        initial_data.defaultopenvasscanner],
      ['Default Port List', 'port_list', initial_data.defaultportlist],
      ['Default Report Format', 'report_format',
        initial_data.defaultreportformat],
      ['Default SMB Credential', 'credential',
        initial_data.defaultsmbcredential],
      ['Default SNMP Credential', 'credential',
        initial_data.defaultsnmpcredential],
      ['Default SSH Credential', 'credential',
        initial_data.defaultsshcredential],
      ['Default Schedule', 'schedule', initial_data.defaultschedule],
      ['Default Target', 'target', initial_data.defaulttarget],
    ];

    const filters = [
      ['Agents Filter', initial_data.agentsfilter],
      ['Alerts Filter', initial_data.alertsfilter],
      ['Assets Filter', initial_data.assetsfilter],
      ['Configs Filter', initial_data.configsfilter],
      ['Credentials Filter', initial_data.credentialsfilter],
      ['Filters Filter', initial_data.filtersfilter],
      ['Notes Filter', initial_data.notesfilter],
      ['Overrides Filter', initial_data.overridesfilter],
      ['Permissions Filter', initial_data.permissionsfilter],
      ['Port Lists Filter', initial_data.portlistsfilter],
      ['Reports Filter', initial_data.reportsfilter],
      ['Report Formats Filter', initial_data.reportformatsfilter],
      ['Results Filter', initial_data.resultsfilter],
      ['Roles Filter', initial_data.rolesfilter],
      ['Schedules Filter', initial_data.schedulesfilter],
      ['Tags Filter', initial_data.tagsfilter],
      ['Targets Filter', initial_data.targetsfilter],
      ['Tasks Filter', initial_data.tasksfilter],
      ['CPE Filter', initial_data.cpefilter],
      ['CVE Filter', initial_data.cvefilter],
      ['NVT Filter', initial_data.nvtfilter],
      ['OVAL Filter', initial_data.ovalfilter],
      ['CERT-Bund Filter', initial_data.certbundfilter],
      ['DFN-CERT Filter', initial_data.dfncertfilter],
      ['All SecInfo Filter', initial_data.allsecinfofilter],
    ];

    return (
      <Layout flex="column">
        <ToolBarIcons
          onEditSettingsClick={this.openSettingsDialog}
        />
        <Section
          img="my_setting.svg"
          title={_('My Settings')}
        />

        <Heading>{_('General Settings')}</Heading>
        <Table>
          <colgroup>
            <Col width="220px"/>
            <Col width="500px"/>
          </colgroup>
          <TableBody>
            {general_rows}
          </TableBody>
        </Table>

        <Heading>{_('Severity Settings')}</Heading>
        <Table>
          <colgroup>
            <Col width="220px"/>
            <Col width="500px"/>
          </colgroup>
          <TableBody>
            {severity_rows}
          </TableBody>
        </Table>

        <Heading>{_('Defaults Settings')}</Heading>
        <Table>
          <colgroup>
            <Col width="220px"/>
            <Col width="500px"/>
          </colgroup>
          <TableBody>
            {defaults.map(item => {
              const [name, perm, id] = item;

              if (capabilities.mayAccess(perm)) {
                if (is_defined(id)) {
                  return (
                    <TableRow key={name}>
                      <TableData>
                        {name}
                      </TableData>
                      <TableData>
                        <DetailsLink
                          id={id}
                          type={perm}
                          legacy
                        >
                          {defaults_settings[name]}
                        </DetailsLink>
                      </TableData>
                    </TableRow>
                  );
                }
              }
              return (
                <TableRow key={name}>
                  <TableData>
                    {name}
                  </TableData>
                  <TableData/>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {capabilities.mayAccess('filter') &&
          <div>
            <Heading>{_('Filter Settings')}</Heading>
            <Table>
              <colgroup>
                <Col width="220px"/>
                <Col width="500px"/>
              </colgroup>
              <TableBody>
                {filters.map(item => {
                  const [name, id] = item;

                  if (is_defined(id)) {
                    return (
                      <TableRow key={name}>
                        <TableData>
                          {name}
                        </TableData>
                        <TableData>
                          <DetailsLink
                            id={id}
                            type="filter"
                            legacy
                          >
                            {filter_settings[name]}
                          </DetailsLink>
                        </TableData>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow key={name}>
                      <TableData>
                        {name}
                      </TableData>
                      <TableData/>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        }

        <Heading>{_('Miscellaneous Settings')}</Heading>
        <Table>
          <colgroup>
            <Col width="220px"/>
            <Col width="500px"/>
          </colgroup>
          <TableBody>
            {misc_rows}
          </TableBody>
        </Table>

        <SettingsDialog
          visible = {dialogvisible}
          onClose={this.handleCloseDialog}
          onSave={this.handleSaveSettings}
          data={initial_data}
          optionLists={option_lists}
        />
      </Layout>
    );
  }
}

UserSettings.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  gmp: PropTypes.gmp.isRequired,
};

export default compose(
  withGmp,
  withCapabilities,
)(UserSettings);

// vim: set ts=2 sw=2 tw=80:
