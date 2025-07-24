/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {DEFAULT_MIN_QOD} from 'gmp/models/audit';
import {ALL_FILTER} from 'gmp/models/filter';
import {
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import AlertComponent from 'web/pages/alerts/AlertComponent';
import AuditDialog from 'web/pages/audits/Dialog';
import PolicyDialog from 'web/pages/policies/Dialog';
import EditPolicyFamilyDialog from 'web/pages/scanconfigs/EditConfigFamilyDialog';
import EditPolicyDialog from 'web/pages/scanconfigs/EditDialog';
import EditNvtDetailsDialog from 'web/pages/scanconfigs/EditNvtDetailsDialog';
import ImportDialog from 'web/pages/scanconfigs/ImportDialog';
import {createSelectedNvts} from 'web/pages/scanconfigs/ScanConfigComponent';
import ScheduleComponent from 'web/pages/schedules/ScheduleComponent';
import TargetComponent from 'web/pages/targets/Component';
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
import PropTypes from 'web/utils/PropTypes';

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
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const dispatch = useDispatch();

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);

  const defaultAlertId = userDefaultsSelector.getValueByName('defaultalert');
  const defaultTargetId = userDefaultsSelector.getValueByName('defaulttarget');
  const defaultScheduleId =
    userDefaultsSelector.getValueByName('defaultschedule');

  const alerts = useShallowEqualSelector(state =>
    alertSelector(state).getEntities(ALL_FILTER),
  );
  const targets = useShallowEqualSelector(state =>
    targetSelector(state).getEntities(ALL_FILTER),
  );
  const schedules = useShallowEqualSelector(state =>
    scheduleSelector(state).getEntities(ALL_FILTER),
  );

  const scannerList = useShallowEqualSelector(state =>
    scannerSelector(state).getEntities(ALL_FILTER),
  );
  const scanners = isDefined(scannerList)
    ? scannerList.filter(
        scanner =>
          scanner.scannerType === OPENVAS_SCANNER_TYPE ||
          scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE,
      )
    : undefined;

  const isLoadingScanners = useShallowEqualSelector(state =>
    scannerSelector(state).isLoadingAllEntities(ALL_FILTER),
  );

  const fetchScanners = useCallback(
    () => dispatch(loadScanners(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchAlerts = useCallback(
    () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchSchedules = useCallback(
    () => dispatch(loadSchedules(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchTargets = useCallback(
    () => dispatch(loadTargets(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchUserSettingsDefaults = useCallback(
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

  const [alertIds, setAlertIds] = useState(
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
  const [families, setFamilies] = useState();
  const [familyName, setFamilyName] = useState();
  const [familyNvts, setFamilyNvts] = useState();
  const [familySelectedNvts, setFamilySelectedNvts] = useState();
  const [hostsOrdering, setHostsOrdering] = useState();
  const [id, setId] = useState();
  const [inAssets, setInAssets] = useState();
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [isLoadingNvt, setIsLoadingNvt] = useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  const [maxChecks, setMaxChecks] = useState();
  const [maxHosts, setMaxHosts] = useState();
  const [name, setName] = useState();
  const [nvt, setNvt] = useState();
  const [policy, setPolicy] = useState();
  const [policyName, setPolicyName] = useState();
  const [policyId, setPolicyId] = useState();
  const [scannerId, setScannerId] = useState();
  const [scheduleId, setScheduleId] = useState(defaultScheduleId);
  const [schedulePeriods, setSchedulePeriods] = useState();
  const [targetId, setTargetId] = useState(defaultTargetId);
  const [title, setTitle] = useState();

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

  const loadFamily = async (familyName, silent = false) => {
    setIsLoadingFamily(silent ? isLoadingFamily : true);

    try {
      const response = await gmp.policy.editPolicyFamilySettings({
        id: policy?.id,
        familyName,
      });

      const {
        data: {nvts},
      } = response;

      const policyFamily = policy?.families[familyName];
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

  const loadNvt = async nvtOid => {
    setIsLoadingNvt(true);

    try {
      const response = await gmp.nvt.getConfigNvt({
        configId: policy?.id,
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

  const loadEditPolicySettings = (policyId, silent) => {
    return Promise.all([loadPolicy(policyId, silent), loadFamilies(silent)]);
  };

  const openEditPolicyDialog = policy => {
    setPolicy(policy); // put policy from list with reduced data in state
    setEditPolicyDialogVisible(true);
    setTitle(_('Edit Policy {{name}}', {name: shorten(policy.name)}));

    loadEditPolicySettings(policy.id);
    loadComponentScanners();
  };

  const closeEditPolicyDialog = () => {
    setEditPolicyDialogVisible(false);
    setPolicy(undefined);
    setFamilies(undefined);
  };

  const handleCloseEditPolicyDialog = () => {
    closeEditPolicyDialog();
  };

  const handleSavePolicy = async data => {
    const {name, comment, id} = data;
    let saveData = data;

    if (policy?.isInUse()) {
      saveData = {name, comment, id};
    }

    await gmp.policy.save(saveData);
    closeEditPolicyDialog();
  };

  const openCreatePolicyDialog = () => {
    loadComponentScanners();
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

  const openCreateAuditDialog = policy => {
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
    auto_delete,
    auto_delete_data,
    comment,
    hostsOrdering,
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
      await gmp.audit.create({
        addTag,
        alertIds,
        alterable,
        applyOverrides,
        autoDelete: auto_delete,
        autoDeleteData: auto_delete_data,
        comment,
        policyId,
        hostsOrdering,
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

      onCreated();
      closeCreateAuditDialog();
    } catch (error) {
      onCreateError(error);
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

  const openEditNvtDetailsDialog = nvtOid => {
    setEditNvtDetailsDialogVisible(true);
    setEditNvtDetailsDialogTitle(_('Edit Policy NVT {{nvtOid}}', {nvtOid}));
    loadNvt(nvtOid);
  };

  const closeEditNvtDetailsDialog = () => {
    setEditNvtDetailsDialogVisible(false);
    setNvt(undefined);
  };

  const handleCloseEditNvtDetailsDialog = () => {
    closeEditNvtDetailsDialog();
  };

  const handleImportPolicy = async data => {
    try {
      await gmp.policy.import(data);
      onImported();
      closeImportDialog();
    } catch (error) {
      onImportError(error);
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
  }) => {
    await gmp.policy.savePolicyNvt({
      id: configId,
      timeout: useDefaultTimeout === '1' ? undefined : timeout,
      oid: nvtOid,
      preferenceValues,
    });

    if (editPolicyFamilyDialogVisible) {
      await loadFamily(familyName, true);
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
        {({save, ...other}) => (
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
                  <AlertComponent onCreated={handleAlertCreated}>
                    {({create: createAlert}) => (
                      <ScheduleComponent onCreated={handleScheduleCreated}>
                        {({create: createSchedule}) => (
                          <AuditDialog
                            alertIds={alertIds}
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
                            policies={[{name: policyName, id: policyId}]}
                            policyId={policyId}
                            scannerId={scannerId}
                            scanners={scanners}
                            scheduleId={scheduleId}
                            schedulePeriods={schedulePeriods}
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
                onSave={d => {
                  return save(d).then(() => closeCreatePolicyDialog());
                }}
              />
            )}
            {editPolicyDialogVisible && policy && (
              <EditPolicyDialog
                comment={policy.comment}
                configFamilies={policy.families}
                configId={policy.id}
                configIsInUse={policy.isInUse()}
                editNvtDetailsTitle={_('Edit Policy NVT Details')}
                editNvtFamiliesTitle={_('Edit Policy Family')}
                families={families}
                isLoadingConfig={isLoadingPolicy}
                isLoadingFamilies={isLoadingFamilies}
                isLoadingScanners={isLoadingScanners}
                name={policy.name}
                nvtPreferences={policy.preferences.nvt}
                scannerId={scannerId}
                scannerPreferences={policy.preferences.scanner}
                scanners={scanners}
                title={title}
                usageType={'policy'}
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
      {editPolicyFamilyDialogVisible && policy && (
        <EditPolicyFamilyDialog
          configId={policy.id}
          configName={policy.name}
          configNameLabel={_('Policy')}
          familyName={familyName}
          isLoadingFamily={isLoadingFamily}
          nvts={familyNvts}
          selected={familySelectedNvts}
          title={editPolicyFamilyDialogTitle}
          onClose={handleCloseEditPolicyFamilyDialog}
          onEditNvtDetailsClick={openEditNvtDetailsDialog}
          onSave={handleSavePolicyFamily}
        />
      )}
      {editNvtDetailsDialogVisible && policy && nvt && (
        <EditNvtDetailsDialog
          configId={policy.id}
          configName={policy.name}
          configNameLabel={_('Policy')}
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
          onSave={handleSavePolicyNvt}
        />
      )}
    </>
  );
};

PolicyComponent.propTypes = {
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

export default PolicyComponent;
