/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {ospScannersFilter} from 'gmp/models/scanner';

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {selectSaveId} from 'gmp/utils/id';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import EditConfigFamilyDialog from './editconfigfamilydialog';
import EditScanConfigDialog from './editdialog';
import EditNvtDetailsDialog from './editnvtdetailsdialog';
import ImportDialog from './importdialog';
import ScanConfigDialog from './dialog';

export const createSelectedNvts = (configFamily, nvts) => {
  const selected = {};
  const nvtsCount = isDefined(configFamily) ? configFamily.nvts.count : 0;

  if (nvtsCount === nvts.length) {
    forEach(nvts, nvt => {
      selected[nvt.oid] = YES_VALUE;
    });
  } else {
    forEach(nvts, nvt => {
      selected[nvt.oid] = nvt.selected;
    });
  }

  return selected;
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
    this.handleSaveScanConfig = this.handleSaveScanConfig.bind(this);
  }

  openEditConfigDialog(config) {
    this.setState({
      config, // put config from list with reduced data in state
      editConfigDialogVisible: true,
      title: _('Edit Scan Config {{name}}', {name: shorten(config.name)}),
    });

    this.loadEditScanConfigSettings(config.id);

    this.loadScanners();

    this.handleInteraction();
  }

  closeEditConfigDialog() {
    this.setState({
      editConfigDialogVisible: false,
      config: undefined,
      families: undefined,
    });
  }

  handleCloseEditConfigDialog() {
    this.closeEditConfigDialog();
    this.handleInteraction();
  }

  handleSaveScanConfig(d) {
    const {gmp} = this.props;
    const {config} = this.state;

    this.handleInteraction();
    const {name, comment, id} = d;
    let saveData = d;
    if (config.isInUse()) {
      saveData = {name, comment, id};
    }

    return gmp.scanconfig
      .save(saveData)
      .then(() => this.closeEditConfigDialog());
  }

  openCreateConfigDialog() {
    this.loadScanners();

    this.setState({
      createConfigDialogVisible: true,
    });

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

  openEditConfigFamilyDialog(familyName) {
    this.handleInteraction();

    this.setState({
      editConfigFamilyDialogVisible: true,
      editConfigFamilyDialogTitle: _('Edit Scan Config Family {{name}}', {
        name: shorten(familyName),
      }),
      familyName,
    });

    return this.loadFamily(familyName);
  }

  loadFamily(familyName, silent = false) {
    const {gmp} = this.props;
    const {config} = this.state;

    this.setState(({isLoadingFamily}) => ({
      isLoadingFamily: silent ? isLoadingFamily : true,
    }));

    return gmp.scanconfig
      .editScanConfigFamilySettings({
        id: config.id,
        familyName,
      })
      .then(response => {
        const {data} = response;
        const {nvts} = data;

        const configFamily = config.families[familyName];
        const selected = createSelectedNvts(configFamily, nvts);

        this.setState({
          familyNvts: data.nvts,
          familySelectedNvts: selected,
          isLoadingFamily: false,
        });
      })
      .catch(error => {
        this.setState({
          isLoadingFamily: false,
          selected: {}, // ensure selected is defined to stop loading indicator
        });
        throw error;
      });
  }

  closeEditConfigFamilyDialog() {
    this.setState({
      editConfigFamilyDialogVisible: false,
      familyName: undefined,
      selected: undefined,
    });
  }

  handleCloseEditConfigFamilyDialog() {
    this.closeEditConfigFamilyDialog();
    this.handleInteraction();
  }

  openEditNvtDetailsDialog(nvtOid) {
    this.handleInteraction();

    this.setState({
      editNvtDetailsDialogVisible: true,
      editNvtDetailsDialogTitle: _('Edit Scan Config NVT {{nvtOid}}', {nvtOid}),
    });

    this.loadNvt(nvtOid);
  }

  loadNvt(nvtOid) {
    const {gmp} = this.props;
    const {config} = this.state;

    this.setState({
      isLoadingNvt: true,
    });

    return gmp.nvt
      .getConfigNvt({
        configId: config.id,
        oid: nvtOid,
      })
      .then(response => {
        const {data: loadedNvt} = response;

        this.setState({
          nvt: loadedNvt,
          editNvtDetailsDialogTitle: _('Edit Scan Config NVT {{name}}', {
            name: shorten(loadedNvt.name),
          }),
        });
      })
      .finally(() => {
        this.setState({
          isLoadingNvt: false,
        });
      });
  }

  closeEditNvtDetailsDialog() {
    this.setState({
      editNvtDetailsDialogVisible: false,
      nvt: undefined,
    });
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

  handleSaveConfigFamily({familyName, configId, selected}) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigFamily({
        id: configId,
        familyName,
        selected,
      })
      .then(() => this.loadEditScanConfigSettings(configId, true))
      .then(() => {
        this.closeEditConfigFamilyDialog();
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
    const {editConfigFamilyDialogVisible, familyName} = this.state;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigNvt({
        id: configId,
        timeout: useDefaultTimeout === '1' ? undefined : timeout,
        oid: nvtOid,
        preferenceValues,
      })
      .then(() => {
        let promise;

        const configPromise = this.loadScanConfig(configId, true);

        if (editConfigFamilyDialogVisible) {
          promise = this.loadFamily(familyName, true);
        } else {
          promise = configPromise;
        }

        return promise;
      })
      .then(() => {
        this.closeEditNvtDetailsDialog();
      });
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  loadScanners() {
    const {gmp} = this.props;

    this.setState({isLoadingScanners: true});

    return gmp.scanners
      .getAll()
      .then(response => {
        let {data: scanners} = response;
        scanners = scanners.filter(ospScannersFilter);
        this.setState({
          scanners,
          scannerId: selectSaveId(scanners),
          isLoadingScanners: false,
        });
      })
      .finally(() => {
        this.setState({
          isLoadingScanners: false,
        });
      });
  }

  loadScanConfig(configId, silent = false) {
    const {gmp} = this.props;

    this.setState(({isLoadingConfig}) => ({
      isLoadingConfig: silent ? isLoadingConfig : true,
    }));

    return gmp.scanconfig
      .get({id: configId})
      .then(response => {
        this.setState({
          config: response.data,
        });
      })
      .finally(() => {
        this.setState({
          isLoadingConfig: false,
        });
      });
  }

  loadFamilies(silent = false) {
    const {gmp} = this.props;

    this.setState(({isLoadingFamilies}) => ({
      isLoadingFamilies: silent ? isLoadingFamilies : true,
    }));

    return gmp.nvtfamilies
      .get()
      .then(familiesResponse => {
        this.setState({
          families: familiesResponse.data,
        });
      })
      .finally(() => {
        this.setState({
          isLoadingFamilies: false,
        });
      });
  }

  loadEditScanConfigSettings(configId, silent) {
    return Promise.all([
      this.loadScanConfig(configId, silent),
      this.loadFamilies(silent),
    ]);
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
      config,
      createConfigDialogVisible,
      editConfigDialogVisible,
      editConfigFamilyDialogVisible,
      editConfigFamilyDialogTitle,
      editNvtDetailsDialogVisible,
      editNvtDetailsDialogTitle,
      families,
      familyName,
      familyNvts,
      familySelectedNvts,
      importDialogVisible,
      isLoadingConfig,
      isLoadingFamilies,
      isLoadingFamily,
      isLoadingNvt,
      isLoadingScanners,
      nvt,
      scannerId,
      scanners,
      title,
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
                  isLoadingScanners={isLoadingScanners}
                  scannerId={scannerId}
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
                  comment={config.comment}
                  configFamilies={config.families}
                  configId={config.id}
                  configIsInUse={config.isInUse()}
                  configType={config.scan_config_type}
                  editNvtDetailsTitle={_('Edit Scan Config NVT Details')}
                  editNvtFamiliesTitle={_('Edit Scan Config Family')}
                  families={families}
                  isLoadingConfig={isLoadingConfig}
                  isLoadingFamilies={isLoadingFamilies}
                  isLoadingScanners={isLoadingScanners}
                  name={config.name}
                  nvtPreferences={config.preferences.nvt}
                  scannerId={scannerId}
                  scannerPreferences={config.preferences.scanner}
                  scanners={scanners}
                  title={title}
                  onClose={this.handleCloseEditConfigDialog}
                  onEditConfigFamilyClick={this.openEditConfigFamilyDialog}
                  onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
                  onSave={this.handleSaveScanConfig}
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
            configId={config.id}
            configNameLabel={_('Config')}
            configName={config.name}
            familyName={familyName}
            isLoadingFamily={isLoadingFamily}
            nvts={familyNvts}
            selected={familySelectedNvts}
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
            defaultTimeout={isDefined(nvt) ? nvt.defaultTimeout : undefined}
            isLoadingNvt={isLoadingNvt}
            nvtAffectedSoftware={isDefined(nvt) ? nvt.tags.affected : undefined}
            nvtCvssVector={
              isDefined(nvt) ? nvt.tags.cvss_base_vector : undefined
            }
            nvtFamily={isDefined(nvt) ? nvt.family : undefined}
            nvtName={isDefined(nvt) ? nvt.name : undefined}
            nvtLastModified={isDefined(nvt) ? nvt.modificationTime : undefined}
            nvtOid={isDefined(nvt) ? nvt.oid : undefined}
            nvtSeverity={isDefined(nvt) ? nvt.severity : undefined}
            nvtSummary={isDefined(nvt) ? nvt.tags.summary : undefined}
            preferences={isDefined(nvt) ? nvt.preferences : undefined}
            timeout={isDefined(nvt) ? nvt.timeout : undefined}
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
