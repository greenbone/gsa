/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {YES_VALUE} from 'gmp/parser';
import {forEach} from 'gmp/utils/array';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ScanConfigDialog from 'web/pages/scanconfigs/Dialog';
import EditConfigFamilyDialog from 'web/pages/scanconfigs/EditConfigFamilyDialog';
import EditScanConfigDialog from 'web/pages/scanconfigs/EditDialog';
import EditNvtDetailsDialog from 'web/pages/scanconfigs/EditNvtDetailsDialog';
import ImportDialog from 'web/pages/scanconfigs/ImportDialog';
import PropTypes from 'web/utils/PropTypes';

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

  onImported,
  onImportError,
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [createConfigDialogVisible, setCreateConfigDialogVisible] =
    useState(false);
  const [editConfigDialogVisible, setEditConfigDialogVisible] = useState(false);
  const [editConfigFamilyDialogVisible, setEditConfigFamilyDialogVisible] =
    useState(false);
  const [editNvtDetailsDialogVisible, setEditNvtDetailsDialogVisible] =
    useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);

  const [config, setConfig] = useState();
  const [families, setFamilies] = useState();

  const [familyName, setFamilyName] = useState();
  const [familyNvts, setFamilyNvts] = useState();
  const [familySelectedNvts, setFamilySelectedNvts] = useState();
  const [hasSelection, setHasSelection] = useState(false);

  const [nvt, setNvt] = useState();

  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [isLoadingNvt, setIsLoadingNvt] = useState(false);
  const [isLoadingScanners, setIsLoadingScanners] = useState(false);

  const [scanners, setScanners] = useState();
  const [scannerId, setScannerId] = useState();

  const [title, setTitle] = useState();
  const [editConfigFamilyDialogTitle, setEditConfigFamilyDialogTitle] =
    useState();
  const [editNvtDetailsDialogTitle, setEditNvtDetailsDialogTitle] = useState();

  const loadScanners = () => {
    setIsLoadingScanners(true);

    return gmp.scanners
      .getAll()
      .then(response => {
        const {data: scannersData} = response;
        setScanners(scannersData);
        setScannerId(selectSaveId(scannersData));
      })
      .finally(() => {
        setIsLoadingScanners(false);
      });
  };

  const loadScanConfig = (configId, silent = false) => {
    if (!silent) {
      setIsLoadingConfig(true);
    }

    return gmp.scanconfig
      .get({id: configId})
      .then(response => {
        setConfig(response.data);
      })
      .finally(() => {
        setIsLoadingConfig(false);
      });
  };

  const loadFamilies = (silent = false) => {
    if (!silent) {
      setIsLoadingFamilies(true);
    }

    return gmp.nvtfamilies
      .get()
      .then(familiesResponse => {
        setFamilies(familiesResponse.data);
      })
      .finally(() => {
        setIsLoadingFamilies(false);
      });
  };

  const loadEditScanConfigSettings = (configId, silent) => {
    return Promise.all([
      loadScanConfig(configId, silent),
      loadFamilies(silent),
    ]);
  };

  const loadFamily = (familyNameValue, silent = false) => {
    if (!silent) {
      setIsLoadingFamily(true);
    }

    return gmp.scanconfig
      .editScanConfigFamilySettings({
        id: config.id,
        familyName: familyNameValue,
      })
      .then(response => {
        const {data} = response;
        const {nvts} = data;

        const configFamily = config.families[familyNameValue];
        const selected = createSelectedNvts(configFamily, nvts);

        if (!hasSelection) {
          setFamilyNvts(data.nvts);
          setFamilySelectedNvts(selected);
          setHasSelection(true);
          setIsLoadingFamily(false);
        } else {
          setFamilyNvts(data.nvts);
          setIsLoadingFamily(false);
        }
      })
      .catch(error => {
        setIsLoadingFamily(false);
        setFamilySelectedNvts({});
        throw error;
      });
  };

  const loadNvt = nvtOid => {
    setIsLoadingNvt(true);

    return gmp.nvt
      .getConfigNvt({
        configId: config.id,
        oid: nvtOid,
      })
      .then(response => {
        const {data: loadedNvt} = response;

        setNvt(loadedNvt);
        setEditNvtDetailsDialogTitle(
          _('Edit Scan Config NVT {{name}}', {
            name: shorten(loadedNvt.name),
          }),
        );
      })
      .finally(() => {
        setIsLoadingNvt(false);
      });
  };

  const openEditConfigDialog = configData => {
    setConfig(configData); // put config from list with reduced data in state
    setEditConfigDialogVisible(true);
    setTitle(_('Edit Scan Config {{name}}', {name: shorten(configData.name)}));

    loadEditScanConfigSettings(configData.id);
    loadScanners();
  };

  const closeEditConfigDialog = () => {
    setEditConfigDialogVisible(false);
    setConfig(undefined);
    setFamilies(undefined);
  };

  const handleCloseEditConfigDialog = () => {
    closeEditConfigDialog();
  };

  const handleSaveScanConfig = data => {
    const {name, comment, id} = data;
    let saveData = data;
    if (config.isInUse()) {
      saveData = {name, comment, id};
    }

    return gmp.scanconfig.save(saveData).then(() => closeEditConfigDialog());
  };

  const openCreateConfigDialog = () => {
    loadScanners();
    setCreateConfigDialogVisible(true);
  };

  const closeCreateConfigDialog = () => {
    setCreateConfigDialogVisible(false);
  };

  const handleCloseCreateConfigDialog = () => {
    closeCreateConfigDialog();
  };

  const openImportDialog = () => {
    setImportDialogVisible(true);
  };

  const closeImportDialog = () => {
    setImportDialogVisible(false);
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
  };

  const openEditConfigFamilyDialog = familyNameValue => {
    setHasSelection(false);
    setEditConfigFamilyDialogVisible(true);
    setEditConfigFamilyDialogTitle(
      _('Edit Scan Config Family {{name}}', {
        name: shorten(familyNameValue),
      }),
    );
    setFamilyName(familyNameValue);

    return loadFamily(familyNameValue);
  };

  const closeEditConfigFamilyDialog = () => {
    setEditConfigFamilyDialogVisible(false);
    setFamilyName(undefined);
    setFamilySelectedNvts(undefined);
  };

  const handleCloseEditConfigFamilyDialog = () => {
    closeEditConfigFamilyDialog();
  };

  const openEditNvtDetailsDialog = nvtOid => {
    setEditNvtDetailsDialogVisible(true);
    setEditNvtDetailsDialogTitle(
      _('Edit Scan Config NVT {{nvtOid}}', {nvtOid}),
    );

    loadNvt(nvtOid);
  };

  const closeEditNvtDetailsDialog = () => {
    setEditNvtDetailsDialogVisible(false);
    setNvt(undefined);
  };

  const handleCloseEditNvtDetailsDialog = () => {
    closeEditNvtDetailsDialog();
  };

  const handleImportConfig = data => {
    return gmp.scanconfig
      .import(data)
      .then(onImported, onImportError)
      .then(() => closeImportDialog());
  };

  const handleSaveConfigFamily = ({
    familyName: familyNameValue,
    configId,
    selected,
  }) => {
    return gmp.scanconfig
      .saveScanConfigFamily({
        id: configId,
        familyName: familyNameValue,
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

  const openSettingsConfigDialog = async configData => {
    setConfig(configData);

    await loadEditScanConfigSettings(configData.id);

    openEditConfigFamilyDialog('Settings');
  };

  return (
    <>
      <EntityComponent
        name="scanconfig"
        onCloneError={onCloneError}
        onCloned={onCloned}
        onCreateError={onCreateError}
        onCreated={onCreated}
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({save, create, ...other}) => {
          return (
            <>
              {children({
                ...other,
                create: openCreateConfigDialog,
                edit: openEditConfigDialog,
                import: openImportDialog,
                settings: openSettingsConfigDialog,
              })}
              {createConfigDialogVisible && (
                <ScanConfigDialog
                  isLoadingScanners={isLoadingScanners}
                  scannerId={scannerId}
                  scanners={scanners}
                  onClose={handleCloseCreateConfigDialog}
                  onSave={d => {
                    const promise = isDefined(d.id) ? save(d) : create(d);
                    return promise.then(() => closeCreateConfigDialog());
                  }}
                />
              )}
              {editConfigDialogVisible && config && (
                <EditScanConfigDialog
                  comment={config.comment}
                  configFamilies={config.families}
                  configFamiliesTrend={config.families.trend}
                  configId={config.id}
                  configIsInUse={config.isInUse()}
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
            </>
          );
        }}
      </EntityComponent>
      {importDialogVisible && (
        <ImportDialog
          text={_('Import XML config')}
          title={_('Import Scan Config')}
          onClose={handleCloseImportDialog}
          onSave={handleImportConfig}
        />
      )}
      {editConfigFamilyDialogVisible && config && (
        <EditConfigFamilyDialog
          configId={config.id}
          configName={config.name}
          configNameLabel={_('Config')}
          familyName={familyName}
          hasSelection={hasSelection}
          isLoadingFamily={isLoadingFamily}
          nvts={familyNvts}
          selected={familySelectedNvts}
          title={editConfigFamilyDialogTitle}
          onClose={handleCloseEditConfigFamilyDialog}
          onEditNvtDetailsClick={openEditNvtDetailsDialog}
          onSave={handleSaveConfigFamily}
        />
      )}
      {editNvtDetailsDialogVisible && config && nvt && (
        <EditNvtDetailsDialog
          configId={config.id}
          configName={config.name}
          configNameLabel={_('Config')}
          defaultTimeout={isDefined(nvt) ? nvt.defaultTimeout : undefined}
          isLoadingNvt={isLoadingNvt}
          nvtAffectedSoftware={isDefined(nvt) ? nvt.tags.affected : undefined}
          nvtCvssVector={isDefined(nvt) ? nvt.tags.cvss_base_vector : undefined}
          nvtFamily={isDefined(nvt) ? nvt.family : undefined}
          nvtLastModified={isDefined(nvt) ? nvt.modificationTime : undefined}
          nvtName={isDefined(nvt) ? nvt.name : undefined}
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
    </>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default ScanConfigComponent;
