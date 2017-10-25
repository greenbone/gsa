/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import _ from 'gmp/locale.js';
import {
  for_each,
  is_defined,
  is_empty,
  select_save_id,
  shorten,
} from 'gmp/utils.js';
import {parse_yesno, YES_VALUE, NO_VALUE} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import NewIcon from '../../components/icon/newicon.js';

import Layout from '../../components/layout/layout.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import EditConfigFamilyDialog from './editconfigfamilydialog.js';
import EditScanConfigDialog from './editdialog.js';
import EditNvtDetailsDialog from './editnvtdetailsdialog.js';
import ImportDialog from './importdialog.js';
import ScanConfigDialog from './dialog.js';

import {OSP_SCANNER_TYPE} from 'gmp/models/scanner.js';

import Table, {SORT_FIELDS} from './table.js';

const ToolBarIcons = ({
    onNewConfigClick,
    onImportConfigClick,
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="configs"
        title={_('Help: Scan Configs')}/>
      {capabilities.mayCreate('config') &&
        <NewIcon
          title={_('New Scan Config')}
          onClick={onNewConfigClick}/>
      }
      {capabilities.mayCreate('config') &&
        <Icon
          img="upload.svg"
          title={_('Import Scan Config')}
          onClick={onImportConfigClick}
        />
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewConfigClick: PropTypes.func,
  onImportConfigClick: PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleImportConfig = this.handleImportConfig.bind(this);
    this.handleSaveConfigFamily = this.handleSaveConfigFamily.bind(this);
    this.handleSaveConfigNvt = this.handleSaveConfigNvt.bind(this);
    this.handleSaveConfig = this.handleSaveConfig.bind(this);
    this.openCreateConfigDialog = this.openCreateConfigDialog.bind(this);
    this.openEditConfigDialog = this.openEditConfigDialog.bind(this);
    this.openEditConfigFamilyDialog =
      this.openEditConfigFamilyDialog.bind(this);
    this.openEditNvtDetailsDialog = this.openEditNvtDetailsDialog.bind(this);
    this.openImportDialog = this.openImportDialog.bind(this);
  }

  openEditConfigDialog(config) {
    this.loadEditScanConfigSettings(config).then(state => {
      this.edit_dialog.show(state, {
        title: _('Edit Scan Config {{name}}', {name: shorten(config.name)}),
      });

      this.loadScanners(this.edit_dialog);
    });
  }

  openCreateConfigDialog() {
    this.scanconfig_dialog.show({});
    this.loadScanners(this.scanconfig_dialog);
  }

  openImportDialog() {
    this.import_dialog.show({});
  }

  openEditConfigFamilyDialog({config, name}) {
    this.loadEditScanConfigFamilySettings(config, name).then(state => {
      this.edit_config_family_dialog.show(state, {
        title: _('Edit Scan Config Family {{name}}',
          {name: shorten(name)}),
      });
    });
  }

  openEditNvtDetailsDialog({config, nvt}) {
    this.loadEditScanConfigNvtSettings(config, nvt).then(state => {
      this.edit_nvt_details_dialog.show(state, {
        title: _('Edit Scan Config NVT {{name}}', {name: shorten(nvt.name)}),
      });
    });
  }

  handleImportConfig(data) {
    const {entityCommand, onChanged} = this.props;
    return entityCommand.import(data).then(() => onChanged());
  }

  handleSaveConfig(data) {
    const {entityCommand, onChanged} = this.props;
    return entityCommand.save(data).then(() => onChanged());
  }

  handleSaveConfigFamily(data) {
    const {entityCommand} = this.props;
    return entityCommand.saveScanConfigFamily(data).then(() => {
      return this.loadEditScanConfigSettings(data.config);
    }).then(state => this.edit_dialog.setValues(state));
  }

  handleSaveConfigNvt(data) {
    const {entityCommand} = this.props;
    return entityCommand.saveScanConfigNvt(data).then(response => {

      // update nvt timeouts in nvt family dialog
      this.loadEditScanConfigFamilySettings(
        data.config, data.family_name).then(state => {
          this.edit_config_family_dialog.setValues(state);
        });

      // update nvt preference values in edit dialog
      this.loadEditScanConfigSettings(data.config).then(state => {
        this.edit_dialog.setValues(state);
      });
    });
  }

  loadScanners(dialog) {
    const {gmp} = this.context;

    gmp.scanners.getAll({cache: false}).then(scanners => {
      scanners = scanners.filter(scanner => scanner.type === OSP_SCANNER_TYPE);
      dialog.setValues({
        scanners,
        scanner_id: select_save_id(scanners),
      });
    });
  }

  loadEditScanConfigSettings(config) {
    const {entityCommand} = this.props;

    return entityCommand.editScanConfigSettings(config).then(response => {
      let {data} = response;
      let {families, scanconfig} = data;
      let trend = {};
      let select = {};

      for_each(families, family => {
        let {name} = family;
        let config_family = scanconfig.families[name];

        if (is_defined(config_family)) {
          trend[name] = parse_yesno(config_family.trend);
          select[name] = config_family.nvts.count === family.max ? YES_VALUE :
            NO_VALUE;
        }
        else {
          trend[name] = NO_VALUE;
          select[name] = NO_VALUE;
        }
      });

      let scanner_preference_values = {};

      for_each(scanconfig.preferences.scanner, preference => {
        scanner_preference_values[preference.name] =  preference.value;
      });

      const state = {
        comment: scanconfig.comment,
        id: config.id,
        name: config.name,
        config: scanconfig,
        families,
        trend,
        select,
        scanner_preference_values,
      };
      return state;
    });
  }

  loadEditScanConfigFamilySettings(config, name) {
    const {entityCommand} = this.props;

    return entityCommand.editScanConfigFamilySettings({
      id: config.id,
      family_name: name,
      config_name: config.name,
    }).then(response => {
      let {data} = response;
      let {nvts} = data;
      let selected = {};

      for_each(nvts, nvt => {
        selected[nvt.oid] = nvt.selected;
      });

      const state = {
        config: data.config,
        config_name: config.name,
        family_name: name,
        id: config.id,
        nvts: data.nvts,
        selected,
      };

      return state;
    });
  }

  loadEditScanConfigNvtSettings(config, nvt) {
    const {entityCommand} = this.props;

    return entityCommand.editScanConfigNvtSettings({
      id: config.id,
      oid: nvt.oid,
      config_name: config.name,
      name: nvt.name,
    }).then(response => {
      let {data} = response;
      let preference_values = {};

      for_each(data.nvt.preferences, pref => {
        let {value, type} = pref;

        if (type === 'password' || type === 'file') {
          value = undefined;
        }

        preference_values[pref.name] = {
          value,
          type,
        };
      });

      const state = {
        config: data.config,
        config_name: data.config.name,
        family_name: data.nvt.family,
        id: data.config.id,
        oid: data.nvt.oid,
        manual_timeout: data.nvt.timeout,
        nvt: data.nvt,
        nvt_name: data.nvt.name,
        preference_values,
        timeout: is_empty(data.nvt.timeout) ? "0" : "1",
      };

      return state;
    });
  }

  render() {
    const {onEntitySave} = this.props;
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onEntityEdit={this.openEditConfigDialog}
          onNewConfigClick={this.openCreateConfigDialog}
          onImportConfigClick={this.openImportDialog}
        />
        <ScanConfigDialog
          ref={ref => this.scanconfig_dialog = ref}
          onSave={onEntitySave}
        />
        <ImportDialog
          ref={ref => this.import_dialog = ref}
          onSave={this.handleImportConfig}
        />
        <EditScanConfigDialog
          ref={ref => this.edit_dialog = ref}
          onSave={this.handleSaveConfig}
          onEditConfigFamilyClick={this.openEditConfigFamilyDialog}
          onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
        />
        <EditConfigFamilyDialog
          ref={ref => this.edit_config_family_dialog = ref}
          onSave={this.handleSaveConfigFamily}
          onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
        />
        <EditNvtDetailsDialog
          ref={ref => this.edit_nvt_details_dialog = ref}
          onSave={this.handleSaveConfigNvt}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  showError: PropTypes.func.isRequired,
  showSuccess: PropTypes.func.isRequired,
  onChanged: PropTypes.func,
  onEntitySave: PropTypes.func,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withEntitiesContainer('scanconfig', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'config.svg',
  table: Table,
  title: _('Scan Configs'),
  toolBarIcons: ToolBarIcons,
  foldable: true,
})(Page);

// vim: set ts=2 sw=2 tw=80:
