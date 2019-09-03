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

import {SCANCONFIG_TREND_STATIC} from 'gmp/models/scanconfig';
import {ospScannersFilter} from 'gmp/models/scanner';

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {selectSaveId} from 'gmp/utils/id';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import EditConfigFamilyDialog from './editconfigfamilydialog';
import EditScanConfigDialog from './editdialog';
import EditNvtDetailsDialog from './editnvtdetailsdialog';
import ImportDialog from './importdialog';
import ScanConfigDialog from './dialog';

const getTrendAndSelect = (scanConfig, families = []) => {
  const trend = {};
  const select = {};

  families.forEach(family => {
    const {name} = family;
    const configFamily = scanConfig.families[name];

    if (isDefined(configFamily)) {
      trend[name] = configFamily.trend;
      select[name] =
        configFamily.nvts.count === family.maxNvtCount ? YES_VALUE : NO_VALUE;
    } else {
      trend[name] = SCANCONFIG_TREND_STATIC;
      select[name] = NO_VALUE;
    }
  });

  return {
    trend,
    select,
  };
};

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

  handleSaveConfigNvt({
    configId,
    timeout,
    useDefaultTimeout,
    nvtOid,
    preferenceValues,
  }) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigNvt({
        id: configId,
        timeout: useDefaultTimeout === '1' ? undefined : timeout,
        oid: nvtOid,
        preferenceValues,
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

    return Promise.all([
      gmp.scanconfig.get(config),
      gmp.nvtfamilies.get(),
    ]).then(([configResponse, familiesResponse]) => {
      const {data: scanconfig} = configResponse;
      const {data: families} = familiesResponse;

      const scanner_preference_values = {};

      const {trend, select} = getTrendAndSelect(scanconfig, families);

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
      })
      .then(response => {
        const {data: loadedNvt} = response;
        const preferenceValues = {};

        loadedNvt.preferences.forEach(pref => {
          let {id, value, type} = pref;

          if (type === 'password' || type === 'file') {
            value = undefined;
          }

          preferenceValues[pref.name] = {
            id,
            value,
            type,
          };
        });

        const state = {
          nvt: loadedNvt,
          preferenceValues,
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
      name,
      nvt,
      nvts,
      preferenceValues,
      scanner_id,
      scanner_preference_values,
      scanners,
      select,
      selected,
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
            title={_('Import Scan Config')}
            text={_('Import XML config')}
            onClose={this.handleCloseImportDialog}
            onSave={this.handleImportConfig}
          />
        )}
        {editConfigFamilyDialogVisible && (
          <EditConfigFamilyDialog
            config={config}
            configNameLabel={_('Config')}
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
            configId={config.id}
            configName={config.name}
            configNameLabel={_('Config')}
            nvt={nvt}
            preferenceValues={preferenceValues}
            timeout={nvt.timeout}
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
