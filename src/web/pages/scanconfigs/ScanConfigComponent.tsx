/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {
  type ScanConfigNvtsSelected,
  type ScanConfigFamilyNvt,
} from 'gmp/commands/scan-config';
import type Nvt from 'gmp/models/nvt';
import {
  type default as ScanConfig,
  type ScanConfigFamily,
} from 'gmp/models/scan-config';
import {NO_VALUE, YES_VALUE, type YesNo} from 'gmp/parser';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import ImportDialog from 'web/pages/scanconfigs/ImportDialog';
import ScanConfigCreateDialog from 'web/pages/scanconfigs/ScanConfigCreateDialog';
import ScanConfigEditDialog from 'web/pages/scanconfigs/ScanConfigEditDialog';
import ScanConfigEditFamilyDialog from 'web/pages/scanconfigs/ScanConfigEditFamilyDialog';
import ScanConfigEditNvtDetailsDialog, {
  type ScanConfigEditNvtDetailsDialogData,
} from 'web/pages/scanconfigs/ScanConfigEditNvtDetailsDialog';

export interface ScanConfigRenderProps {
  clone: (config: ScanConfig) => void;
  create: () => void;
  delete: (config: ScanConfig) => void;
  download: (config: ScanConfig) => void;
  edit: (config: ScanConfig) => void;
  import: () => void;
  settings: (config: ScanConfig) => void;
}

interface ScanConfigComponentProps {
  children: (props: ScanConfigRenderProps) => React.ReactNode;
  onCloned?: () => void;
  onCloneError?: (error: Error) => void;
  onCreated?: () => void;
  onCreateError?: (error: Error) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onDownloadError?: (error: Error) => void;
  onImported?: () => void;
  onImportError?: (error: Error) => void;
  onSaved?: () => void;
  onSaveError?: (error: Error) => void;
}

interface SelectedNvts {
  [key: string]: YesNo;
}

export const createSelectedNvts = (
  configFamily: ScanConfigFamily,
  nvts: ScanConfigFamilyNvt[],
): ScanConfigNvtsSelected => {
  const selected: ScanConfigNvtsSelected = {};
  const nvtsCount = isDefined(configFamily) ? configFamily.nvts?.count : 0;

  if (nvtsCount === nvts.length) {
    forEach(nvts, nvt => {
      selected[nvt.oid] = YES_VALUE;
    });
  } else {
    forEach(nvts, nvt => {
      selected[nvt.oid] = nvt.selected ?? NO_VALUE;
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
}: ScanConfigComponentProps) => {
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

  const [config, setConfig] = useState<ScanConfig>();
  const [families, setFamilies] = useState<ScanConfigFamily[]>();

  const [familyName, setFamilyName] = useState<string>();
  const [familyNvts, setFamilyNvts] = useState<
    ScanConfigFamilyNvt[] | undefined
  >();
  const [familySelectedNvts, setFamilySelectedNvts] = useState<SelectedNvts>();
  const [familySelectionUpdate, setFamilySelectionUpdate] = useState<{
    familyName: string;
    select: YesNo;
  }>();
  const [hasSelection, setHasSelection] = useState(false);

  const [nvt, setNvt] = useState<Nvt>();

  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [isLoadingNvt, setIsLoadingNvt] = useState(false);

  const [scanConfigs, setScanConfigs] = useState<ScanConfig[]>([]);

  const [title, setTitle] = useState<string>();
  const [editConfigFamilyDialogTitle, setEditConfigFamilyDialogTitle] =
    useState<string>();
  const [editNvtDetailsDialogTitle, setEditNvtDetailsDialogTitle] =
    useState<string>();
  const [editScanConfigDialogError, setEditScanConfigDialogError] =
    useState<string>();

  const loadScanConfigs = async () => {
    const response = await gmp.scanconfigs.getAll();
    setScanConfigs(response.data);
  };

  const loadScanConfig = async (configId: string, silent: boolean = false) => {
    if (!silent) {
      setIsLoadingConfig(true);
    }

    try {
      const response = await gmp.scanconfig.get({id: configId});
      setConfig(response.data);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const loadFamilies = async (silent: boolean = false) => {
    if (!silent) {
      setIsLoadingFamilies(true);
    }

    try {
      const familiesResponse = await gmp.nvtfamilies.get();
      setFamilies(familiesResponse.data);
    } finally {
      setIsLoadingFamilies(false);
    }
  };

  const loadEditScanConfigSettings = (
    configId: string,
    silent: boolean = false,
  ) => {
    return Promise.all([
      loadScanConfig(configId, silent),
      loadFamilies(silent),
    ]);
  };

  const loadFamily = async (
    familyNameValue: string,
    configData: ScanConfig = config as ScanConfig,
    silent: boolean = false,
  ) => {
    if (!silent) {
      setIsLoadingFamily(true);
    }

    try {
      const response = await gmp.scanconfig.editScanConfigFamilySettings({
        id: configData.id as string,
        familyName: familyNameValue,
      });
      const {data} = response;
      const {nvts} = data;

      const configFamily = configData.families?.[familyNameValue];
      const selected = createSelectedNvts(
        configFamily as ScanConfigFamily,
        nvts,
      );

      if (!hasSelection) {
        setFamilyNvts(nvts);
        setFamilySelectedNvts(selected);
        setHasSelection(true);
        setIsLoadingFamily(false);
      } else {
        setFamilyNvts(data.nvts);
        setIsLoadingFamily(false);
      }
    } catch (error) {
      setIsLoadingFamily(false);
      setFamilySelectedNvts({});
      throw error;
    }
  };

  const loadNvt = async (nvtOid: string) => {
    setIsLoadingNvt(true);

    try {
      const response = await gmp.nvt.getConfigNvt({
        configId: config?.id as string,
        oid: nvtOid,
      });
      const {data: loadedNvt} = response;

      setNvt(loadedNvt);
      setEditNvtDetailsDialogTitle(
        _('Edit Scan Config NVT {{name}}', {
          name: shorten(loadedNvt.name),
        }),
      );
    } finally {
      setIsLoadingNvt(false);
    }
  };

  const openEditConfigDialog = (configData: ScanConfig) => {
    setConfig(configData); // put config from list with reduced data in state
    setEditConfigDialogVisible(true);
    setTitle(
      _('Edit Scan Config {{- name}}', {name: shorten(configData.name)}),
    );

    void loadEditScanConfigSettings(configData.id as string);
    void loadScanConfigs();
  };

  const closeEditConfigDialog = () => {
    setEditConfigDialogVisible(false);
    setConfig(undefined);
    setFamilies(undefined);
  };

  const handleCloseEditConfigDialog = () => {
    closeEditConfigDialog();
  };

  const handleSaveScanConfig = async data => {
    const {name, comment, id} = data;
    let saveData = data;
    if (isDefined(config) && config.isInUse()) {
      saveData = {name, comment, id};
    }

    await gmp.scanconfig.save(saveData);
    return closeEditConfigDialog();
  };

  const openCreateConfigDialog = () => {
    void loadScanConfigs();
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

  const openEditConfigFamilyDialog = async (
    familyNameValue,
    configData = config,
  ) => {
    setHasSelection(false);
    setEditConfigFamilyDialogVisible(true);
    setEditConfigFamilyDialogTitle(
      _('Edit Scan Config Family {{name}}', {
        name: shorten(familyNameValue),
      }),
    );
    setFamilyName(familyNameValue);

    try {
      return await loadFamily(familyNameValue, configData);
    } catch (error: Error | unknown) {
      closeEditConfigFamilyDialog();
      setEditScanConfigDialogError(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const closeEditConfigFamilyDialog = () => {
    setEditConfigFamilyDialogVisible(false);
    setFamilyName(undefined);
    setFamilySelectedNvts(undefined);
    setHasSelection(false);
  };

  const handleCloseEditConfigFamilyDialog = () => {
    closeEditConfigFamilyDialog();
  };

  const openEditNvtDetailsDialog = async nvtOid => {
    setEditNvtDetailsDialogVisible(true);
    setEditNvtDetailsDialogTitle(
      _('Edit Scan Config NVT {{nvtOid}}', {nvtOid}),
    );

    try {
      await loadNvt(nvtOid);
    } catch (error: Error | unknown) {
      setEditScanConfigDialogError(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const closeEditNvtDetailsDialog = () => {
    setEditNvtDetailsDialogVisible(false);
    setNvt(undefined);
  };

  const handleCloseEditNvtDetailsDialog = () => {
    closeEditNvtDetailsDialog();
  };

  const handleImportConfig = (data: {xml_file: string}) =>
    gmp.scanconfig
      .import(data)
      .then(onImported, onImportError)
      .then(() => closeImportDialog());

  const handleSaveConfigFamily = async ({
    familyName: familyNameValue,
    configId,
    selected,
  }) => {
    await gmp.scanconfig.saveScanConfigFamily({
      id: configId,
      familyName: familyNameValue,
      selected,
    });

    // Sync the parent dialog's family-level "select all" checkbox with the
    // selection just saved in this family dialog, so saving the whole config
    // does not overwrite these changes with a stale value.
    const currentNvts = familyNvts ?? [];
    const allSelected =
      currentNvts.length > 0 &&
      currentNvts.every(nvtItem => selected?.[nvtItem.oid] === YES_VALUE);
    setFamilySelectionUpdate({
      familyName: familyNameValue,
      select: allSelected ? YES_VALUE : NO_VALUE,
    });

    await loadEditScanConfigSettings(configId, true);
    closeEditConfigFamilyDialog();
  };

  const handleSaveConfigNvt = async ({
    configId,
    timeout,
    useDefaultTimeout,
    nvtOid,
    preferenceValues,
  }: ScanConfigEditNvtDetailsDialogData) => {
    await gmp.scanconfig.saveScanConfigNvt({
      id: configId,
      timeout: useDefaultTimeout === YES_VALUE ? undefined : timeout,
      oid: nvtOid,
      preferenceValues,
    });
    const promise = editConfigFamilyDialogVisible
      ? loadFamily(familyName as string, config, true)
      : loadScanConfig(configId, true);
    await promise;
    closeEditNvtDetailsDialog();
  };

  const openSettingsConfigDialog = async (configData: ScanConfig) => {
    setConfig(configData);

    try {
      await loadEditScanConfigSettings(configData.id as string);

      await openEditConfigFamilyDialog('Settings', configData);
    } catch (error: Error | unknown) {
      setEditScanConfigDialogError(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  return (
    <>
      <EntityComponent<ScanConfig>
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
                <ScanConfigCreateDialog
                  scanConfigs={scanConfigs}
                  onClose={handleCloseCreateConfigDialog}
                  onSave={async data => {
                    await create(data);
                    return closeCreateConfigDialog();
                  }}
                />
              )}
              {editConfigDialogVisible && config && (
                <ScanConfigEditDialog
                  comment={config.comment}
                  configFamilies={config.families}
                  configFamiliesTrend={config.families?.trend}
                  configId={config.id as string}
                  configIsInUse={config.isInUse()}
                  editNvtDetailsTitle={_('Edit Scan Config NVT Details')}
                  editNvtFamiliesTitle={_('Edit Scan Config Family')}
                  error={editScanConfigDialogError}
                  families={families}
                  familySelectionUpdate={familySelectionUpdate}
                  isLoadingConfig={isLoadingConfig}
                  isLoadingFamilies={isLoadingFamilies}
                  name={config.name as string}
                  nvtPreferences={config.preferences.nvt}
                  scannerPreferences={config.preferences.scanner}
                  title={title as string}
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
        <ScanConfigEditFamilyDialog
          configId={config.id as string}
          configName={config.name as string}
          configNameLabel={_('Config')}
          familyName={familyName as string}
          isLoadingFamily={isLoadingFamily}
          nvts={familyNvts}
          selected={familySelectedNvts as SelectedNvts}
          title={editConfigFamilyDialogTitle as string}
          onClose={handleCloseEditConfigFamilyDialog}
          onEditNvtDetailsClick={openEditNvtDetailsDialog}
          onSave={handleSaveConfigFamily}
        />
      )}
      {editNvtDetailsDialogVisible && isDefined(config) && isDefined(nvt) && (
        <ScanConfigEditNvtDetailsDialog
          configId={config.id as string}
          configName={config.name as string}
          configNameLabel={_('Config')}
          defaultTimeout={nvt.defaultTimeout}
          isLoadingNvt={isLoadingNvt}
          nvtAffectedSoftware={nvt.tags.affected}
          nvtCvssVector={nvt.tags.cvss_base_vector}
          nvtFamily={nvt.family}
          nvtLastModified={nvt.modificationTime}
          nvtName={nvt.name as string}
          nvtOid={nvt.oid as string}
          nvtSeverity={nvt.severity}
          nvtSummary={nvt.tags.summary}
          preferences={nvt.preferences}
          timeout={nvt.timeout}
          title={editNvtDetailsDialogTitle as string}
          onClose={handleCloseEditNvtDetailsDialog}
          onSave={handleSaveConfigNvt}
        />
      )}
    </>
  );
};

export default ScanConfigComponent;
