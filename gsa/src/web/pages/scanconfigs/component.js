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

import React, {useEffect, useReducer} from 'react';

import _ from 'gmp/locale';

import {ospScannersFilter} from 'gmp/models/scanner';

import {YES_VALUE} from 'gmp/parser';

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {selectSaveId} from 'gmp/utils/id';

import EntityComponent from 'web/entity/component';

import {
  useImportScanConfig,
  useCreateScanConfig,
  useLoadScanConfigPromise,
} from 'web/graphql/scanconfigs';
import {useLazyGetScanners} from 'web/graphql/scanners';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';
import stateReducer, {updateState} from 'web/utils/stateReducer';
import readFileToText from 'web/utils/readFileToText';

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

const ScanConfigComponent = ({
  children,
  onCloneError,
  onCloned,
  onCreateError,
  onCreated,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onImportError,
  onImported,
  onInteraction,
  onSaveError,
  onSaved,
}) => {
  const gmp = useGmp();
  const [state, dispatchState] = useReducer(stateReducer, {
    createConfigDialogVisible: false,
    editConfigDialogVisible: false,
    editConfigFamilyDialogVisible: false,
    editNvtDetailsDialogVisible: false,
    importDialogVisible: false,
  });

  const loadScanConfigPromise = useLoadScanConfigPromise();
  const [importScanConfig] = useImportScanConfig();
  const [createScanConfig] = useCreateScanConfig();
  const [
    loadScanners,
    {scanners: loadedScanners, loading: isLoadingScanners},
  ] = useLazyGetScanners();

  const openEditConfigDialog = config => {
    dispatchState(
      updateState({
        config, // put config from list with reduced data in state
        editConfigDialogVisible: true,
        title: _('Edit Scan Config {{name}}', {name: shorten(config.name)}),
      }),
    );

    loadEditScanConfigSettings(config.id);

    loadScanners();

    handleInteraction();
  };

  const closeEditConfigDialog = () => {
    dispatchState(
      updateState({
        editConfigDialogVisible: false,
        config: undefined,
        families: undefined,
      }),
    );
  };

  const handleCloseEditConfigDialog = () => {
    closeEditConfigDialog();
    handleInteraction();
  };

  const handleSaveScanConfig = d => {
    const {config} = state;

    handleInteraction();
    const {name, comment, id, baseScanConfig} = d;
    if (!isDefined(id)) {
      return createScanConfig({
        configId: baseScanConfig,
        name,
        comment,
      }).then(onCreated, onCreateError);
    }

    let saveData = d;
    if (config.isInUse()) {
      saveData = {name, comment, id};
    }

    return gmp.scanconfig.save(saveData).then(() => closeEditConfigDialog());
  };

  const openCreateConfigDialog = () => {
    loadScanners();

    dispatchState(updateState({createConfigDialogVisible: true}));

    handleInteraction();
  };

  const closeCreateConfigDialog = () => {
    dispatchState(updateState({createConfigDialogVisible: false}));
  };

  const handleCloseCreateConfigDialog = () => {
    closeCreateConfigDialog();
    handleInteraction();
  };

  const openImportDialog = () => {
    dispatchState(updateState({importDialogVisible: true}));

    handleInteraction();
  };

  const closeImportDialog = () => {
    dispatchState(updateState({importDialogVisible: false}));
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
    handleInteraction();
  };

  const openEditConfigFamilyDialog = familyName => {
    handleInteraction();
    dispatchState(
      updateState({
        editConfigFamilyDialogVisible: true,
        editConfigFamilyDialogTitle: _('Edit Scan Config Family {{name}}', {
          name: shorten(familyName),
        }),
        familyName,
      }),
    );
    return loadFamily(familyName);
  };

  const loadFamily = (familyName, silent = false) => {
    const {config} = state;

    dispatchState(
      updateState({
        isLoadingFamily: silent ? state.isLoadingFamily : true,
      }),
    );

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

        dispatchState(
          updateState({
            familyNvts: data.nvts,
            familySelectedNvts: selected,
            isLoadingFamily: false,
          }),
        );
      })
      .catch(error => {
        dispatchState(
          updateState({
            isLoadingFamily: false,
            selected: {}, // ensure selected is defined to stop loading indicator
          }),
        );
        throw error;
      });
  };

  const closeEditConfigFamilyDialog = () => {
    dispatchState(
      updateState({
        editConfigFamilyDialogVisible: false,
        familyName: undefined,
        selected: undefined,
      }),
    );
  };

  const handleCloseEditConfigFamilyDialog = () => {
    closeEditConfigFamilyDialog();
    handleInteraction();
  };

  const openEditNvtDetailsDialog = nvtOid => {
    handleInteraction();

    dispatchState(
      updateState({
        editNvtDetailsDialogVisible: true,
        editNvtDetailsDialogTitle: _('Edit Scan Config NVT {{nvtOid}}', {
          nvtOid,
        }),
      }),
    );

    loadNvt(nvtOid);
  };

  const loadNvt = nvtOid => {
    const {config} = state;

    dispatchState(
      updateState({
        isLoadingNvt: true,
      }),
    );

    return gmp.nvt
      .getConfigNvt({
        configId: config.id,
        oid: nvtOid,
      })
      .then(response => {
        const {data: loadedNvt} = response;

        dispatchState(
          updateState({
            nvt: loadedNvt,
            editNvtDetailsDialogTitle: _('Edit Scan Config NVT {{name}}', {
              name: shorten(loadedNvt.name),
            }),
          }),
        );
      })
      .finally(() => {
        dispatchState(
          updateState({
            isLoadingNvt: false,
          }),
        );
      });
  };

  const closeEditNvtDetailsDialog = () => {
    dispatchState(
      updateState({
        editNvtDetailsDialogVisible: false,
        nvt: undefined,
      }),
    );
  };

  const handleCloseEditNvtDetailsDialog = () => {
    closeEditNvtDetailsDialog();
    handleInteraction();
  };

  const handleImportConfig = async data => {
    handleInteraction();

    const readUploadedXml = readFileToText(data.xml_file);

    return importScanConfig(await readUploadedXml)
      .then(onImported, onImportError)
      .then(() => closeImportDialog());
  };

  const handleSaveConfigFamily = ({familyName, configId, selected}) => {
    handleInteraction();

    return gmp.scanconfig
      .saveScanConfigFamily({
        id: configId,
        familyName,
        selected,
      })
      .then(() => loadEditScanConfigSettings(configId, true))
      .then(() => {
        closeEditConfigFamilyDialog();
      });
  };

  const handleSaveConfigNvt = ({
    configId,
    timeout,
    useDefaultTimeout,
    nvtOid,
    preferenceValues,
  }) => {
    const {editConfigFamilyDialogVisible, familyName} = state;

    handleInteraction();

    return gmp.scanconfig
      .saveScanConfigNvt({
        id: configId,
        timeout: useDefaultTimeout === '1' ? undefined : timeout,
        oid: nvtOid,
        preferenceValues,
      })
      .then(() => {
        let promise;

        const configPromise = loadScanConfig(configId, true);

        if (editConfigFamilyDialogVisible) {
          promise = loadFamily(familyName, true);
        } else {
          promise = configPromise;
        }

        return promise;
      })
      .then(() => {
        closeEditNvtDetailsDialog();
      });
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const loadScanConfig = (configId, silent = false) => {
    dispatchState(
      updateState({
        isLoadingConfig: silent ? state.isLoadingConfig : true,
      }),
    );

    return loadScanConfigPromise(configId)
      .then(scanConfig => {
        dispatchState(
          updateState({
            config: scanConfig,
          }),
        );
      })
      .finally(() => {
        dispatchState(
          updateState({
            isLoadingConfig: false,
          }),
        );
      });
  };

  const loadFamilies = (silent = false) => {
    dispatchState(
      updateState({
        isLoadingFamilies: silent ? state.isLoadingFamilies : true,
      }),
    );

    return gmp.nvtfamilies
      .get()
      .then(familiesResponse => {
        dispatchState(
          updateState({
            families: familiesResponse.data,
          }),
        );
      })
      .finally(() => {
        dispatchState(
          updateState({
            isLoadingFamilies: false,
          }),
        );
      });
  };

  const loadEditScanConfigSettings = (configId, silent) => {
    return Promise.all([
      loadScanConfig(configId, silent),
      loadFamilies(silent),
    ]);
  };

  useEffect(() => {
    if (isDefined(loadedScanners) && !isLoadingScanners) {
      const filteredScanners = loadedScanners.filter(ospScannersFilter);
      dispatchState(
        updateState({
          scanners: filteredScanners,
          scannerId: selectSaveId(filteredScanners),
        }),
      );
    }
  }, [isLoadingScanners]); // eslint-disable-line react-hooks/exhaustive-deps

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
    nvt,
    scannerId,
    scanners,
    title,
  } = state;

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
        {({...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: openCreateConfigDialog,
              edit: openEditConfigDialog,
              import: openImportDialog,
            })}
            {createConfigDialogVisible && (
              <ScanConfigDialog
                isLoadingScanners={isLoadingScanners}
                scannerId={scannerId}
                scanners={scanners}
                onClose={handleCloseCreateConfigDialog}
                onSave={d => {
                  handleInteraction();
                  return handleSaveScanConfig(d).then(() =>
                    closeCreateConfigDialog(),
                  );
                }}
              />
            )}
            {editConfigDialogVisible && (
              <EditScanConfigDialog
                comment={config.comment}
                configFamilies={config.families}
                configId={config.id}
                configIsInUse={config.isInUse()}
                configType={config.scanConfigType}
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
                onClose={handleCloseEditConfigDialog}
                onEditConfigFamilyClick={openEditConfigFamilyDialog}
                onEditNvtDetailsClick={openEditNvtDetailsDialog}
                onSave={handleSaveScanConfig}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
      {importDialogVisible && (
        <ImportDialog
          title={_('Import Scan Config')}
          text={_('Import XML config')}
          onClose={handleCloseImportDialog}
          onSave={handleImportConfig}
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
          onClose={handleCloseEditConfigFamilyDialog}
          onEditNvtDetailsClick={openEditNvtDetailsDialog}
          onSave={handleSaveConfigFamily}
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
          nvtCvssVector={isDefined(nvt) ? nvt.tags.cvss_base_vector : undefined}
          nvtFamily={isDefined(nvt) ? nvt.family : undefined}
          nvtName={isDefined(nvt) ? nvt.name : undefined}
          nvtLastModified={isDefined(nvt) ? nvt.modificationTime : undefined}
          nvtOid={isDefined(nvt) ? nvt.oid : undefined}
          nvtSeverity={isDefined(nvt) ? nvt.severity : undefined}
          nvtSummary={isDefined(nvt) ? nvt.tags.summary : undefined}
          preferences={isDefined(nvt) ? nvt.preferences : undefined}
          timeout={isDefined(nvt) ? nvt.timeout : undefined}
          title={editNvtDetailsDialogTitle}
          onClose={handleCloseEditNvtDetailsDialog}
          onSave={handleSaveConfigNvt}
        />
      )}
    </React.Fragment>
  );
};

ScanConfigComponent.propTypes = {
  children: PropTypes.func.isRequired,
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

export default ScanConfigComponent;

// vim: set ts=2 sw=2 tw=80:
