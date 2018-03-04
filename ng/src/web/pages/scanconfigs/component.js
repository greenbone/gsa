/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
} from 'gmp/utils';

import {parse_yesno, YES_VALUE, NO_VALUE} from 'gmp/parser.js';

import {OSP_SCANNER_TYPE} from 'gmp/models/scanner.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import EditConfigFamilyDialog from './editconfigfamilydialog.js';
import EditScanConfigDialog from './editdialog.js';
import EditNvtDetailsDialog from './editnvtdetailsdialog.js';
import ImportDialog from './importdialog.js';
import ScanConfigDialog from './dialog.js';

class ScanConfigComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      editConfigFamilyDialogVisible: false,
      importDialogVisible: false,
    };

    this.handleImportConfig = this.handleImportConfig.bind(this);
    this.handleSaveConfigFamily = this.handleSaveConfigFamily.bind(this);
    this.handleSaveConfigNvt = this.handleSaveConfigNvt.bind(this);
    this.openCreateConfigDialog = this.openCreateConfigDialog.bind(this);
    this.openEditConfigDialog = this.openEditConfigDialog.bind(this);
    this.openEditConfigFamilyDialog =
      this.openEditConfigFamilyDialog.bind(this);
    this.closeEditConfigFamilyDialog =
      this.closeEditConfigFamilyDialog.bind(this);
    this.openEditNvtDetailsDialog = this.openEditNvtDetailsDialog.bind(this);
    this.openImportDialog = this.openImportDialog.bind(this);
    this.closeImportDialog = this.closeImportDialog.bind(this);
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
    this.setState({importDialogVisible: true});
  }

  closeImportDialog() {
    this.setState({importDialogVisible: false});
  }

  openEditConfigFamilyDialog({config, name}) {
    this.loadEditScanConfigFamilySettings(config, name).then(state => {
      this.setState({
        config,
        editConfigFamilyDialogVisible: true,
        editConfigFamilyDialogTitle: _('Edit Scan Config Family {{name}}',
          {name: shorten(name)}),
        ...state,
      });
    });
  }

  closeEditConfigFamilyDialog() {
    this.setState({editConfigFamilyDialogVisible: false});
  }

  openEditNvtDetailsDialog({config, nvt}) {
    this.loadEditScanConfigNvtSettings(config, nvt).then(state => {
      this.edit_nvt_details_dialog.show(state, {
        title: _('Edit Scan Config NVT {{name}}', {name: shorten(nvt.name)}),
      });
    });
  }

  handleImportConfig(data) {
    const {gmp, onImported, onImportError} = this.props;
    return gmp.scanconfig.import(data).then(onImported, onImportError);
  }

  handleSaveConfigFamily(data) {
    const {gmp} = this.props;
    return gmp.scanconfig.saveScanConfigFamily(data).then(() => {
      return this.loadEditScanConfigSettings(data.config);
    }).then(state => this.setState({state}));
  }

  handleSaveConfigNvt(data) {
    const {gmp} = this.props;
    return gmp.scanconfig.saveScanConfigNvt(data).then(response => {

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
    const {gmp} = this.props;

    gmp.scanners.getAll().then(response => {
      let {data: scanners} = response;
      scanners = scanners.filter(scanner =>
        scanner.scanner_type === OSP_SCANNER_TYPE);
      dialog.setValues({
        scanners,
        scanner_id: select_save_id(scanners),
      });
    });
  }

  loadEditScanConfigSettings(config) {
    const {gmp} = this.props;

    return gmp.scanconfig.editScanConfigSettings(config).then(response => {
      const {data} = response;
      const {families, scanconfig} = data;
      const trend = {};
      const select = {};

      for_each(families, family => {
        const {name} = family;
        const config_family = scanconfig.families[name];

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

      const scanner_preference_values = {};

      for_each(scanconfig.preferences.scanner, preference => {
        scanner_preference_values[preference.name] = preference.value;
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
    const {gmp} = this.props;

    return gmp.scanconfig.editScanConfigFamilySettings({
      id: config.id,
      family_name: name,
      config_name: config.name,
    }).then(response => {
      const {data} = response;
      const {nvts} = data;
      const selected = {};

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
    const {gmp} = this.props;

    return gmp.scanconfig.editScanConfigNvtSettings({
      id: config.id,
      oid: nvt.oid,
      config_name: config.name,
      name: nvt.name,
    }).then(response => {
      const {data} = response;
      const preference_values = {};

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
        timeout: is_empty(data.nvt.timeout) ? '0' : '1',
      };

      return state;
    });
  }
  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      config,
      config_name,
      editConfigFamilyDialogVisible,
      editConfigFamilyDialogTitle,
      family_name,
      id,
      importDialogVisible,
      nvts,
      selected,
    } = this.state;

    return (
      <Wrapper>
        <EntityComponent
          name="scanconfig"
          onCreated={onCreated}
          onCreateError={onCreateError}
          onCloned={onCloned}
          onCloneError={onCloneError}
          onDeleted={onDeleted}
          onDeleteError={onDeleteError}
          onDownloaded={onDownloaded}
          onDownloadError={onDownloadError}
          onSaved={onSaved}
          onSaveError={onSaveError}
        >
          {({
            save,
            ...other
          }) => (
            <Wrapper>
              {children({
                ...other,
                create: this.openCreateConfigDialog,
                edit: this.openEditConfigDialog,
                import: this.openImportDialog,
              })}
              <ScanConfigDialog
                ref={ref => this.scanconfig_dialog = ref}
                onSave={save}
              />
              <EditScanConfigDialog
                ref={ref => this.edit_dialog = ref}
                onEditConfigFamilyClick={this.openEditConfigFamilyDialog}
                onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
                onSave={save}
              />
            </Wrapper>
          )}
        </EntityComponent>
        <ImportDialog
          visible={importDialogVisible}
          onClose={this.closeImportDialog}
          onSave={this.handleImportConfig}
        />
        <EditConfigFamilyDialog
          config={config}
          config_name={config_name}
          family_name={family_name}
          id={id}
          nvts={nvts}
          selected={selected}
          title={editConfigFamilyDialogTitle}
          visible={editConfigFamilyDialogVisible}
          onClose={this.closeEditConfigFamilyDialog}
          onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
          onSave={this.handleSaveConfigFamily}
        />
        <EditNvtDetailsDialog
          ref={ref => this.edit_nvt_details_dialog = ref}
          onSave={this.handleSaveConfigNvt}
        />
      </Wrapper>
    );
  }
}

ScanConfigComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onImportError: PropTypes.func,
  onImported: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(ScanConfigComponent);

// vim: set ts=2 sw=2 tw=80:
