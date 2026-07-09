/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {type NvtFamily} from 'gmp/commands/nvt-families';
import {
  type ScanConfigFamilyNvt,
  type ScanConfigNvtsSelected,
} from 'gmp/commands/scan-config';
import type Alert from 'gmp/models/alert';
import {DEFAULT_MIN_QOD} from 'gmp/models/audit';
import {ALL_FILTER} from 'gmp/models/filter';
import type Nvt from 'gmp/models/nvt';
import type Policy from 'gmp/models/policy';
import {type ScanConfigFamily} from 'gmp/models/scan-config';
import {
  type default as Scanner,
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import type Schedule from 'gmp/models/schedule';
import type Target from 'gmp/models/target';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import {type EntityCloneResponse} from 'web/entity/hooks/useEntityClone';
import {type EntityCreateResponse} from 'web/entity/hooks/useEntityCreate';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import AlertComponent from 'web/pages/alerts/AlertComponent';
import AuditDialog from 'web/pages/audits/Dialog';
import PolicyDialog from 'web/pages/policies/Dialog';
import ImportDialog from 'web/pages/scanconfigs/ImportDialog';
import {createSelectedNvts} from 'web/pages/scanconfigs/ScanConfigComponent';
import PolicyEditDialog, {
  type ScanConfigEditDialogData,
} from 'web/pages/scanconfigs/ScanConfigEditDialog';
import ScanConfigEditPolicyFamilyDialog from 'web/pages/scanconfigs/ScanConfigEditFamilyDialog';
import ScanConfigEditNvtDetailsDialog, {
  type ScanConfigEditNvtDetailsDialogData,
} from 'web/pages/scanconfigs/ScanConfigEditNvtDetailsDialog';
import ScheduleComponent from 'web/pages/schedules/ScheduleComponent';
import TargetComponent from 'web/pages/targets/TargetComponent';
import {
  loadEntities as loadAlerts,
  selector as alertSelector,
} from 'web/store/entities/alerts';
import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';
import {
  loadEntities as loadSchedules,
  selector as scheduleSelector,
} from 'web/store/entities/schedules';
import {
  loadEntities as loadTargets,
  selector as targetSelector,
} from 'web/store/entities/targets';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

interface PoliciesComponentRenderProps {
  clone: (config: Policy) => void;
  create: () => void;
  createAudit: (config: Policy) => void;
  delete: (config: Policy) => void;
  download: (config: Policy) => void;
  edit: (config: Policy) => void;
  import: () => void;
}

interface PoliciesComponentProps {
  children: (props: PoliciesComponentRenderProps) => React.ReactNode;
  onCloned?: (response: EntityCloneResponse) => void;
  onCloneError?: (error: Error) => void;
  onCreated?: (response: EntityCreateResponse) => void;
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

const PolicyComponent = ({
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
}: PoliciesComponentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const dispatch = useDispatch();

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);

  const defaultAlertId = userDefaultsSelector.getValueByName('defaultalert');
  const defaultTargetId = userDefaultsSelector.getValueByName('defaulttarget');
  const defaultScheduleId =
    userDefaultsSelector.getValueByName('defaultschedule');

  const alerts = useShallowEqualSelector<unknown, Alert[]>(state =>
    alertSelector(state).getEntities(ALL_FILTER),
  );
  const targets = useShallowEqualSelector<unknown, Target[]>(state =>
    targetSelector(state).getEntities(ALL_FILTER),
  );
  const schedules = useShallowEqualSelector<unknown, Schedule[]>(state =>
    scheduleSelector(state).getEntities(ALL_FILTER),
  );

  const scannerList = useShallowEqualSelector<unknown, Scanner[]>(state =>
    scannerSelector(state).getEntities(ALL_FILTER),
  );
  const scanners = isDefined(scannerList)
    ? scannerList.filter(
        scanner =>
          scanner.scannerType === OPENVAS_SCANNER_TYPE ||
          scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE,
      )
    : undefined;

  const isLoadingScanners = useShallowEqualSelector<unknown, boolean>(state =>
    scannerSelector(state).isLoadingAllEntities(ALL_FILTER),
  );

  const fetchScanners = useCallback(
    // @ts-expect-error
    () => dispatch(loadScanners(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchAlerts = useCallback(
    // @ts-expect-error
    () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchSchedules = useCallback(
    // @ts-expect-error
    () => dispatch(loadSchedules(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchTargets = useCallback(
    // @ts-expect-error
    () => dispatch(loadTargets(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchUserSettingsDefaults = useCallback(
    // @ts-expect-error
    () => dispatch(loadUserSettingDefaults(gmp)()),
    [dispatch, gmp],
  );

  useEffect(() => {
    fetchUserSettingsDefaults();
  }, [fetchUserSettingsDefaults]);

  const [createPolicyDialogVisible, setCreatePolicyDialogVisible] =
    useState(false);
  const [editPolicyDialogVisible, setEditPolicyDialogVisible] = useState(false);
  const [editPolicyFamilyDialogVisible, setEditPolicyFamilyDialogVisible] =
    useState(false);
  const [editNvtDetailsDialogVisible, setEditNvtDetailsDialogVisible] =
    useState(false);
  const [createAuditDialogVisible, setCreateAuditDialogVisible] =
    useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);

  const [alertIds, setAlertIds] = useState<string[]>(
    isDefined(defaultAlertId) ? [defaultAlertId] : [],
  );
  const [alterable, setAlterable] = useState();
  const [autoDelete, setAutoDelete] = useState();
  const [autoDeleteData, setAutoDeleteData] = useState();
  const [comment, setComment] = useState('');
  const [editPolicyFamilyDialogTitle, setEditPolicyFamilyDialogTitle] =
    useState('');
  const [editNvtDetailsDialogTitle, setEditNvtDetailsDialogTitle] =
    useState('');
  const [families, setFamilies] = useState<NvtFamily[]>();
  const [familyName, setFamilyName] = useState<string>();
  const [familyNvts, setFamilyNvts] = useState<ScanConfigFamilyNvt[]>();
  const [familySelectedNvts, setFamilySelectedNvts] =
    useState<ScanConfigNvtsSelected>();
  const [hostsOrdering, setHostsOrdering] = useState();
  const [id, setId] = useState();
  const [inAssets, setInAssets] = useState();
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [isLoadingNvt, setIsLoadingNvt] = useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  const [maxChecks, setMaxChecks] = useState();
  const [maxHosts, setMaxHosts] = useState();
  const [name, setName] = useState<string>();
  const [nvt, setNvt] = useState<Nvt>();
  const [policy, setPolicy] = useState<Policy>();
  const [policyName, setPolicyName] = useState<string>();
  const [policyId, setPolicyId] = useState<string>();
  const [scannerId, setScannerId] = useState<string>();
  const [scheduleId, setScheduleId] = useState<string>(defaultScheduleId);
  const [schedulePeriods, setSchedulePeriods] = useState();
  const [targetId, setTargetId] = useState<string>(defaultTargetId);
  const [title, setTitle] = useState<string>();

  const handleChange = (value, name) => {
    switch (name) {
      case 'alertIds':
        setAlertIds(value);
        break;
      case 'alterable':
        setAlterable(value);
        break;
      case 'auto_delete':
        setAutoDelete(value);
        break;
      case 'auto_delete_data':
        setAutoDeleteData(value);
        break;
      case 'comment':
        setComment(value);
        break;
      case 'hostsOrdering':
        setHostsOrdering(value);
        break;
      case 'in_assets':
        setInAssets(value);
        break;
      case 'maxChecks':
        setMaxChecks(value);
        break;
      case 'maxHosts':
        setMaxHosts(value);
        break;
      case 'name':
        setName(value);
        break;
      case 'scheduleId':
        setScheduleId(value);
        break;
      case 'schedulePeriods':
        setSchedulePeriods(value);
        break;
      case 'scannerId':
        setScannerId(value);
        break;
      case 'targetId':
        setTargetId(value);
        break;
      default:
        console.error(`Unknown field name: ${name}`);
    }
  };

  const handleAlertCreated = ({data}) => {
    fetchAlerts();
    setAlertIds(prevAlertIds => [data.id, ...prevAlertIds]);
  };

  const handleScheduleCreated = ({data}) => {
    fetchSchedules();
    setScheduleId(data.id);
  };

  const handleTargetCreated = ({data}) => {
    fetchTargets();
    setTargetId(data.id);
  };

  const handleScannerChange = scannerId => {
    setScannerId(scannerId);
  };

  const loadComponentScanners = async () => {
    try {
      const response = await gmp.scanners.getAll();
      const {data: scannerData} = response;
      setScannerId(selectSaveId(scannerData));
    } catch (error) {
      console.error('Error loading scanners:', error);
    }
  };

  const loadPolicy = async (policyId, silent = false) => {
    setIsLoadingPolicy(silent ? isLoadingPolicy : true);

    try {
      const {data} = await gmp.policy.get({id: policyId});
      setPolicy(data);
    } finally {
      setIsLoadingPolicy(false);
    }
  };

  const loadFamilies = async (silent = false) => {
    setIsLoadingFamilies(silent ? isLoadingFamilies : true);

    try {
      const {data} = await gmp.nvtfamilies.get();
      setFamilies(data);
    } finally {
      setIsLoadingFamilies(false);
    }
  };

  const loadFamily = async (familyName: string, silent = false) => {
    setIsLoadingFamily(silent ? isLoadingFamily : true);

    try {
      const response = await gmp.policy.editPolicyFamilySettings({
        id: policy?.id as string,
        familyName,
      });

      const {
        data: {nvts},
      } = response;

      const policyFamily = policy?.families?.[familyName] as ScanConfigFamily;
      const selected = createSelectedNvts(policyFamily, nvts);

      setFamilyNvts(nvts);
      setFamilySelectedNvts(selected);
      setIsLoadingFamily(false);
    } catch (error) {
      setIsLoadingFamily(false);
      setFamilySelectedNvts({}); // ensure selected is defined to stop loading indicator
      throw error;
    }
  };

  const loadNvt = async (nvtOid: string) => {
    setIsLoadingNvt(true);

    try {
      const response = await gmp.nvt.getConfigNvt({
        configId: policy?.id as string,
        oid: nvtOid,
      });

      const {data: loadedNvt} = response;

      setNvt(loadedNvt);
      setEditNvtDetailsDialogTitle(
        _('Edit Policy NVT {{name}}', {
          name: shorten(loadedNvt.name),
        }),
      );
    } finally {
      setIsLoadingNvt(false);
    }
  };

  const loadEditPolicySettings = async (policyId: string, silent = false) => {
    await Promise.all([loadPolicy(policyId, silent), loadFamilies(silent)]);
  };

  const openEditPolicyDialog = (policy: Policy) => {
    setPolicy(policy); // put policy from list with reduced data in state
    setTitle(_('Edit Policy {{- name}}', {name: shorten(policy.name)}));
    setEditPolicyDialogVisible(true);

    void loadEditPolicySettings(policy.id as string);
    void loadComponentScanners();
  };

  const closeEditPolicyDialog = () => {
    setEditPolicyDialogVisible(false);
    setPolicy(undefined);
    setFamilies(undefined);
  };

  const handleCloseEditPolicyDialog = () => {
    closeEditPolicyDialog();
  };

  const handleSavePolicy = async (data: ScanConfigEditDialogData) => {
    const {name, comment, id} = data;
    let saveData = data;

    if (policy?.isInUse()) {
      saveData = {name, comment, id};
    }

    await gmp.policy.save(saveData);
    closeEditPolicyDialog();
  };

  const openCreatePolicyDialog = () => {
    setCreatePolicyDialogVisible(true);
  };

  const closeCreatePolicyDialog = () => {
    setCreatePolicyDialogVisible(false);
  };

  const handleCloseCreatePolicyDialog = () => {
    closeCreatePolicyDialog();
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

  const openCreateAuditDialog = (policy: Policy) => {
    fetchAlerts();
    fetchScanners();
    fetchSchedules();
    fetchTargets();

    const alertIds = isDefined(defaultAlertId) ? [defaultAlertId] : [];

    setCreateAuditDialogVisible(true);
    setAlertIds(alertIds);
    setAlterable(undefined);
    setAutoDelete(undefined);
    setAutoDeleteData(undefined);
    setComment('');
    setPolicyId(isDefined(policy) ? policy.id : undefined);
    setPolicyName(policy.name);
    setHostsOrdering(undefined);
    setId(undefined);
    setInAssets(undefined);
    setMaxChecks(undefined);
    setMaxHosts(undefined);
    setName(undefined);
    setScheduleId(defaultScheduleId);
    setSchedulePeriods(undefined);
    setTargetId(defaultTargetId);
    setTitle(_('New Audit'));
  };

  const closeCreateAuditDialog = () => {
    setCreateAuditDialogVisible(false);
  };

  const handleCloseCreateAuditDialog = () => {
    closeCreateAuditDialog();
  };

  const handleSaveAudit = async ({
    alertIds,
    alterable,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_delete,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_delete_data,
    comment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    in_assets,
    maxChecks,
    maxHosts,
    name,
    scannerId = OPENVAS_DEFAULT_SCANNER_ID,
    scannerType = OPENVAS_SCANNER_TYPE,
    scheduleId,
    schedulePeriods,
    targetId,
  }) => {
    const tagId = undefined;
    const addTag = NO_VALUE;
    const applyOverrides = YES_VALUE;
    const minQod = DEFAULT_MIN_QOD;

    try {
      const response = await gmp.audit.create({
        addTag,
        alertIds,
        alterable,
        applyOverrides,
        autoDelete: auto_delete,
        autoDeleteData: auto_delete_data,
        comment,
        policyId,
        inAssets: in_assets,
        maxChecks,
        maxHosts,
        minQod,
        name,
        scannerType,
        scannerId,
        scheduleId,
        schedulePeriods,
        tagId,
        targetId,
      });

      onCreated?.(response);
      closeCreateAuditDialog();
    } catch (error) {
      onCreateError?.(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const openEditPolicyFamilyDialog = familyName => {
    setEditPolicyFamilyDialogVisible(true);
    setEditPolicyFamilyDialogTitle(
      _('Edit Policy Family {{name}}', {
        name: shorten(familyName),
      }),
    );
    setFamilyName(familyName);

    return loadFamily(familyName);
  };

  const closeEditPolicyFamilyDialog = () => {
    setEditPolicyFamilyDialogVisible(false);
    setFamilyName(undefined);
    setFamilySelectedNvts(undefined);
  };

  const handleCloseEditPolicyFamilyDialog = () => {
    closeEditPolicyFamilyDialog();
  };

  const openEditNvtDetailsDialog = (nvtOid: string) => {
    setEditNvtDetailsDialogVisible(true);
    setEditNvtDetailsDialogTitle(_('Edit Policy NVT {{nvtOid}}', {nvtOid}));
    void loadNvt(nvtOid);
  };

  const closeEditNvtDetailsDialog = () => {
    setEditNvtDetailsDialogVisible(false);
    setNvt(undefined);
  };

  const handleCloseEditNvtDetailsDialog = () => {
    closeEditNvtDetailsDialog();
  };

  const handleImportPolicy = async (data: {xml_file: string}) => {
    try {
      await gmp.policy.import(data);
      onImported?.();
      closeImportDialog();
    } catch (error) {
      onImportError?.(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const handleSavePolicyFamily = async ({familyName, configId, selected}) => {
    await gmp.policy.savePolicyFamily({
      id: configId,
      familyName,
      selected,
    });

    await loadEditPolicySettings(configId, true);
    closeEditPolicyFamilyDialog();
  };

  const handleSavePolicyNvt = async ({
    configId,
    timeout,
    useDefaultTimeout,
    nvtOid,
    preferenceValues,
  }: ScanConfigEditNvtDetailsDialogData) => {
    await gmp.policy.savePolicyNvt({
      id: configId,
      timeout: useDefaultTimeout === YES_VALUE ? undefined : timeout,
      oid: nvtOid,
      preferenceValues,
    });

    if (editPolicyFamilyDialogVisible) {
      await loadFamily(familyName as string, true);
    } else {
      await loadPolicy(configId, true);
    }

    closeEditNvtDetailsDialog();
  };

  return (
    <>
      <EntityComponent
        name="policy"
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
        {({save, create, ...other}) => (
          <>
            {children({
              ...other,
              createAudit: openCreateAuditDialog,
              create: openCreatePolicyDialog,
              edit: openEditPolicyDialog,
              import: openImportDialog,
            })}
            {createAuditDialogVisible && (
              <TargetComponent onCreated={handleTargetCreated}>
                {({create: createTarget}) => (
                  // @ts-expect-error
                  <AlertComponent onCreated={handleAlertCreated}>
                    {({create: createAlert}) => (
                      <ScheduleComponent onCreated={handleScheduleCreated}>
                        {({create: createSchedule}) => (
                          <AuditDialog
                            // @ts-expect-error
                            alertIds={alertIds}
                            // @ts-expect-error
                            alerts={alerts}
                            alterable={alterable}
                            auto_delete={autoDelete}
                            auto_delete_data={autoDeleteData}
                            comment={comment}
                            fromPolicy={true}
                            hostsOrdering={hostsOrdering}
                            id={id}
                            in_assets={inAssets}
                            isLoadingScanners={isLoadingScanners}
                            maxChecks={maxChecks}
                            maxHosts={maxHosts}
                            name={name}
                            // @ts-expect-error
                            policies={[{name: policyName, id: policyId}]}
                            policyId={policyId}
                            scannerId={scannerId}
                            // @ts-expect-error
                            scanners={scanners}
                            scheduleId={scheduleId}
                            schedulePeriods={schedulePeriods}
                            // @ts-expect-error
                            schedules={schedules}
                            targetId={targetId}
                            targets={targets}
                            title={title}
                            onChange={handleChange}
                            onClose={handleCloseCreateAuditDialog}
                            onNewAlertClick={createAlert}
                            onNewScheduleClick={createSchedule}
                            onNewTargetClick={createTarget}
                            onSave={handleSaveAudit}
                            onScannerChange={handleScannerChange}
                          />
                        )}
                      </ScheduleComponent>
                    )}
                  </AlertComponent>
                )}
              </TargetComponent>
            )}
            {createPolicyDialogVisible && (
              <PolicyDialog
                onClose={handleCloseCreatePolicyDialog}
                onSave={async d => {
                  const promise = isDefined(d.id) ? save(d) : create(d);
                  await promise;
                  return closeCreatePolicyDialog();
                }}
              />
            )}
            {editPolicyDialogVisible && policy && (
              <PolicyEditDialog
                comment={policy.comment}
                configFamilies={policy.families}
                configId={policy.id as string}
                configIsInUse={policy.isInUse()}
                editNvtDetailsTitle={_('Edit Policy NVT Details')}
                editNvtFamiliesTitle={_('Edit Policy Family')}
                families={families}
                isLoadingConfig={isLoadingPolicy}
                isLoadingFamilies={isLoadingFamilies}
                isLoadingScanners={isLoadingScanners}
                name={policy.name as string}
                nvtPreferences={policy.preferences.nvt}
                scannerId={scannerId}
                scannerPreferences={policy.preferences.scanner}
                title={title as string}
                usageType="policy"
                onClose={handleCloseEditPolicyDialog}
                onEditConfigFamilyClick={openEditPolicyFamilyDialog}
                onEditNvtDetailsClick={openEditNvtDetailsDialog}
                onSave={handleSavePolicy}
              />
            )}
          </>
        )}
      </EntityComponent>
      {importDialogVisible && (
        <ImportDialog
          text={_('Import XML policy')}
          title={_('Import Policy')}
          onClose={handleCloseImportDialog}
          onSave={handleImportPolicy}
        />
      )}
      {editPolicyFamilyDialogVisible && isDefined(policy) && (
        <ScanConfigEditPolicyFamilyDialog
          configId={policy.id as string}
          configName={policy.name as string}
          configNameLabel={_('Policy')}
          familyName={familyName as string}
          isLoadingFamily={isLoadingFamily}
          nvts={familyNvts}
          selected={familySelectedNvts as ScanConfigNvtsSelected}
          title={editPolicyFamilyDialogTitle}
          onClose={handleCloseEditPolicyFamilyDialog}
          onEditNvtDetailsClick={openEditNvtDetailsDialog}
          onSave={handleSavePolicyFamily}
        />
      )}
      {editNvtDetailsDialogVisible && isDefined(policy) && isDefined(nvt) && (
        <ScanConfigEditNvtDetailsDialog
          configId={policy.id as string}
          configName={policy.name as string}
          configNameLabel={_('Policy')}
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
          title={editNvtDetailsDialogTitle}
          onClose={handleCloseEditNvtDetailsDialog}
          onSave={handleSavePolicyNvt}
        />
      )}
    </>
  );
};

export default PolicyComponent;
