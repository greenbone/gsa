/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty, shorten} from 'gmp/utils/string';
import {selectSaveId} from 'gmp/utils/id';

import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';

import {ospScannersFilter} from 'gmp/models/scanner';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import EditConfigFamilyDialog from './editconfigfamilydialog';
import EditScanConfigDialog from './editdialog';
import EditNvtDetailsDialog from './editnvtdetailsdialog';
import ImportDialog from './importdialog';
import ScanConfigDialog from './dialog';

class ScanConfigComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      createConfigDialogVisible: false,
      editConfigDialogVisible: false,
      editConfigFamilyDialogVisible: false,
      editNvtDetailsDialogVisible: false,
      importDialogVisible: false,
    };

    this.handleImportConfig = this.handleImportConfig.bind(this);
    this.handleSaveConfigFamily = this.handleSaveConfigFamily.bind(this);
    this.handleSaveConfigNvt = this.handleSaveConfigNvt.bind(this);
    this.openCreateConfigDialog = this.openCreateConfigDialog.bind(this);
    this.handleCloseCreateConfigDialog = this.handleCloseCreateConfigDialog.bind(
      this,
    );
    this.openEditConfigDialog = this.openEditConfigDialog.bind(this);
    this.handleCloseEditConfigDialog = this.handleCloseEditConfigDialog.bind(
      this,
    );
    this.openEditConfigFamilyDialog = this.openEditConfigFamilyDialog.bind(
      this,
    );
    this.handleCloseEditConfigFamilyDialog = this.handleCloseEditConfigFamilyDialog.bind(
      this,
    );
    this.openEditNvtDetailsDialog = this.openEditNvtDetailsDialog.bind(this);
    this.handleCloseEditNvtDetailsDialog = this.handleCloseEditNvtDetailsDialog.bind(
      this,
    );
    this.openImportDialog = this.openImportDialog.bind(this);
    this.handleCloseImportDialog = this.handleCloseImportDialog.bind(this);
  }

  openEditConfigDialog(config) {
    Promise.all([
      this.loadEditScanConfigSettings(config),
      this.loadScanners(),
    ]).then(([scanConfigState, scannerState]) => {
      this.setState({
        ...scannerState,
        ...scanConfigState,
        base: config.base,
        editConfigDialogVisible: true,
        title: _('Edit Scan Config {{name}}', {name: shorten(config.name)}),
      });
    });

    this.handleInteraction();
  }

  closeEditConfigDialog() {
    this.setState({editConfigDialogVisible: false});
  }

  handleCloseEditConfigDialog() {
    this.closeEditConfigDialog();
    this.handleInteraction();
  }

  openCreateConfigDialog() {
    this.loadScanners().then(state =>
      this.setState({
        ...state,
        createConfigDialogVisible: true,
      }),
    );

    this.handleInteraction();
  }

  closeCreateConfigDialog() {
    this.setState({createConfigDialogVisible: false});
  }

  handleCloseCreateConfigDialog() {
    this.closeCreateConfigDialog();
    this.handleInteraction();
  }

  openImportDialog() {
    this.setState({importDialogVisible: true});
    this.handleInteraction();
  }

  closeImportDialog() {
    this.setState({importDialogVisible: false});
  }

  handleCloseImportDialog() {
    this.closeImportDialog();
    this.handleInteraction();
  }

  openEditConfigFamilyDialog({config, name}) {
    this.loadEditScanConfigFamilySettings(config, name).then(state => {
      this.setState({
        ...state,
        config,
        editConfigFamilyDialogVisible: true,
        editConfigFamilyDialogTitle: _('Edit Scan Config Family {{name}}', {
          name: shorten(name),
        }),
      });
    });
    this.handleInteraction();
  }

  closeEditConfigFamilyDialog() {
    this.setState({editConfigFamilyDialogVisible: false});
  }

  handleCloseEditConfigFamilyDialog() {
    this.closeEditConfigFamilyDialog();
    this.handleInteraction();
  }

  openEditNvtDetailsDialog({config, nvt}) {
    this.loadEditScanConfigNvtSettings(config, nvt).then(state => {
      this.setState({
        ...state,
        config,
        editNvtDetailsDialogVisible: true,
        editNvtDetailsDialogTitle: _('Edit Scan Config NVT {{name}}', {
          name: shorten(nvt.name),
        }),
      });
    });
    this.handleInteraction();
  }

  closeEditNvtDetailsDialog() {
    this.setState({editNvtDetailsDialogVisible: false});
  }

  handleCloseEditNvtDetailsDialog() {
    this.closeEditNvtDetailsDialog();
    this.handleInteraction();
  }

  handleImportConfig(data) {
    const {gmp, onImported, onImportError} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .import(data)
      .then(onImported, onImportError)
      .then(() => this.closeImportDialog());
  }

  handleSaveConfigFamily(data) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigFamily(data)
      .then(() => {
        return this.loadEditScanConfigSettings(data.config);
      })
      .then(state => {
        this.closeEditConfigFamilyDialog();
        this.setState({...state});
      });
  }

  handleSaveConfigNvt(values) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigNvt(values)
      .then(response => {
        // update nvt timeouts in nvt family dialog
        this.loadEditScanConfigFamilySettings(
          values.config,
          values.family_name,
        ).then(state => {
          this.setState({state});
        });

        // update nvt preference values in edit dialog
        this.loadEditScanConfigSettings(values.config).then(state => {
          this.setState({state});
        });
      })
      .then(() => this.closeEditNvtDetailsDialog());
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  loadScanners(dialog) {
    const {gmp} = this.props;

    return gmp.scanners.getAll().then(response => {
      let {data: scanners} = response;
      scanners = scanners.filter(ospScannersFilter);
      return {
        scanners,
        scanner_id: selectSaveId(scanners),
      };
    });
  }

  loadEditScanConfigSettings(config) {
    const {gmp} = this.props;

    return gmp.scanconfig.editScanConfigSettings(config).then(response => {
      const {data} = response;
      const {families, scanconfig} = data;
      const trend = {};
      const select = {};

      forEach(families, family => {
        const {name} = family;
        const config_family = scanconfig.families[name];

        if (isDefined(config_family)) {
          trend[name] = parseYesNo(config_family.trend);
          select[name] =
            config_family.nvts.count === family.max ? YES_VALUE : NO_VALUE;
        } else {
          trend[name] = NO_VALUE;
          select[name] = NO_VALUE;
        }
      });

      const scanner_preference_values = {};

      forEach(scanconfig.preferences.scanner, preference => {
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
    const {select} = this.state;

    return gmp.scanconfig
      .editScanConfigFamilySettings({
        id: config.id,
        family_name: name,
        config_name: config.name,
      })
      .then(response => {
        const {data} = response;
        const {nvts} = data;
        const selected = {};

        if (select[name]) {
          forEach(nvts, nvt => {
            selected[nvt.oid] = YES_VALUE;
          });
        } else {
          forEach(nvts, nvt => {
            selected[nvt.oid] = nvt.selected;
          });
        }

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

    return gmp.scanconfig
      .editScanConfigNvtSettings({
        id: config.id,
        oid: nvt.oid,
        config_name: config.name,
        name: nvt.name,
      })
      .then(response => {
        const {data} = response;
        const preference_values = {};

        forEach(data.nvt.preferences, pref => {
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
          timeout: isEmpty(data.nvt.timeout) ? '0' : '1',
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
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      base,
      comment,
      config,
      config_name,
      createConfigDialogVisible,
      editConfigDialogVisible,
      editConfigFamilyDialogVisible,
      editConfigFamilyDialogTitle,
      editNvtDetailsDialogVisible,
      editNvtDetailsDialogTitle,
      families,
      family_name,
      id,
      importDialogVisible,
      manual_timeout,
      name,
      nvt,
      nvts,
      preference_values,
      scanner_id,
      scanner_preference_values,
      scanners,
      select,
      selected,
      timeout,
      title,
      trend,
    } = this.state;

    return (
      <React.Fragment>
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
          onInteraction={onInteraction}
          onSaved={onSaved}
          onSaveError={onSaveError}
        >
          {({save, ...other}) => (
            <React.Fragment>
              {children({
                ...other,
                create: this.openCreateConfigDialog,
                edit: this.openEditConfigDialog,
                import: this.openImportDialog,
              })}
              {createConfigDialogVisible && (
                <ScanConfigDialog
                  scanner_id={scanner_id}
                  scanners={scanners}
                  onClose={this.handleCloseCreateConfigDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeCreateConfigDialog());
                  }}
                />
              )}
              {editConfigDialogVisible && (
                <EditScanConfigDialog
                  base={base}
                  comment={comment}
                  config={config}
                  families={families}
                  name={name}
                  scanner_id={scanner_id}
                  scanner_preference_values={scanner_preference_values}
                  scanners={scanners}
                  select={select}
                  title={title}
                  trend={trend}
                  onClose={this.handleCloseEditConfigDialog}
                  onEditConfigFamilyClick={this.openEditConfigFamilyDialog}
                  onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeEditConfigDialog());
                  }}
                />
              )}
            </React.Fragment>
          )}
        </EntityComponent>
        {importDialogVisible && (
          <ImportDialog
            onClose={this.handleCloseImportDialog}
            onSave={this.handleImportConfig}
          />
        )}
        {editConfigFamilyDialogVisible && (
          <EditConfigFamilyDialog
            config={config}
            config_name={config_name}
            family_name={family_name}
            id={id}
            nvts={nvts}
            selected={selected}
            title={editConfigFamilyDialogTitle}
            onClose={this.handleCloseEditConfigFamilyDialog}
            onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
            onSave={this.handleSaveConfigFamily}
          />
        )}
        {editNvtDetailsDialogVisible && (
          <EditNvtDetailsDialog
            config={config}
            config_name={config_name}
            family_name={family_name}
            manual_timeout={manual_timeout}
            nvt={nvt}
            preference_values={preference_values}
            timeout={timeout}
            title={editNvtDetailsDialogTitle}
            onClose={this.handleCloseEditNvtDetailsDialog}
            onSave={this.handleSaveConfigNvt}
          />
        )}
      </React.Fragment>
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
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(ScanConfigComponent);

// vim: set ts=2 sw=2 tw=80:
