/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {DEFAULT_MIN_QOD} from 'gmp/models/audit';
import Filter, {ALL_FILTER} from 'gmp/models/filter';
import {
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import EntityComponent from 'web/entity/EntityComponent';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import AlertComponent from 'web/pages/alerts/AlertComponent';
import AuditDialog from 'web/pages/audits/Dialog';
import ScheduleComponent from 'web/pages/schedules/ScheduleComponent';
import TargetComponent from 'web/pages/targets/Component';
import {
  loadEntities as loadAlerts,
  selector as alertSelector,
} from 'web/store/entities/alerts';
import {
  loadEntities as loadPolicies,
  selector as policiesSelector,
} from 'web/store/entities/policies';
import {
  loadAllEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';
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
import {getUsername} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {UNSET_VALUE, generateFilename} from 'web/utils/Render';

const REPORT_FORMATS_FILTER = Filter.fromString(
  'uuid="dc51a40a-c022-11e9-b02d-3f7ca5bdcb11" and active=1 and trust=1',
);

const AuditComponent = ({
  children,
  onInteraction,
  onStarted,
  onStartError,
  onStopped,
  onStopError,
  onResumed,
  onResumeError,
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
}) => {
  const dispatch = useDispatch();
  const [_] = useTranslation();
  const gmp = useGmp();
  const capabilities = useCapabilities();
  const [downloadRef, download] = useDownload();

  const [auditDialogVisible, setAuditDialogVisible] = useState(false);
  const [alertIds, setAlertIds] = useState([]);
  const [alterable, setAlterable] = useState(undefined);
  const [autoDelete, setAutoDelete] = useState(undefined);
  const [autoDeleteData, setAutoDeleteData] = useState(undefined);
  const [policyId, setPolicyId] = useState('');
  const [comment, setComment] = useState('');
  const [hostsOrdering, setHostsOrdering] = useState(undefined);
  const [id, setId] = useState(undefined);
  const [inAssets, setInAssets] = useState(undefined);
  const [maxChecks, setMaxChecks] = useState(undefined);
  const [maxHosts, setMaxHosts] = useState(undefined);
  const [name, setName] = useState('');
  const [scannerId, setScannerId] = useState(OPENVAS_DEFAULT_SCANNER_ID);
  const [scheduleId, setScheduleId] = useState(undefined);
  const [schedulePeriods, setSchedulePeriods] = useState(undefined);
  const [targetId, setTargetId] = useState(undefined);
  const [audit, setAudit] = useState(undefined);
  const [title, setTitle] = useState('');

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);

  const defaultAlertId = userDefaultsSelector.getValueByName('defaultalert');
  const defaultTargetId = userDefaultsSelector.getValueByName('defaulttarget');

  const defaultScheduleId =
    userDefaultsSelector.getValueByName('defaultschedule');

  const defaultScannerId = userDefaultsSelector.getValueByName(
    'defaultopenvasscanner',
  );

  const reportExportFileName = userDefaultsSelector.getValueByName(
    'reportexportfilename',
  );

  const username = useShallowEqualSelector(getUsername);
  const policies = useShallowEqualSelector(state =>
    policiesSelector(state).getEntities(ALL_FILTER),
  );

  const reportFormats = useShallowEqualSelector(state =>
    reportFormatsSelector(state).getAllEntities(REPORT_FORMATS_FILTER),
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

  const alerts = useShallowEqualSelector(state =>
    alertSelector(state).getEntities(ALL_FILTER),
  );

  const targets = useShallowEqualSelector(state =>
    targetSelector(state).getEntities(ALL_FILTER),
  );

  const schedules = useShallowEqualSelector(state =>
    scheduleSelector(state).getEntities(ALL_FILTER),
  );

  const fetchAlerts = useCallback(
    () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
    [dispatch, gmp],
  );

  const fetchPolicies = useCallback(() => {
    dispatch(loadPolicies(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchUserSettingsDefaults = useCallback(() => {
    dispatch(loadUserSettingDefaults(gmp)());
  }, [dispatch, gmp]);

  const loadReportFormatsDefaults = useCallback(() => {
    dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER));
  }, [dispatch, gmp]);

  const fetchScanners = useCallback(() => {
    dispatch(loadScanners(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchSchedules = useCallback(() => {
    dispatch(loadSchedules(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  const fetchTargets = useCallback(() => {
    dispatch(loadTargets(gmp)(ALL_FILTER));
  }, [dispatch, gmp]);

  useEffect(() => {
    fetchUserSettingsDefaults();
    loadReportFormatsDefaults();
  }, [fetchUserSettingsDefaults, loadReportFormatsDefaults]);

  useEffect(() => {
    if (auditDialogVisible) {
      fetchUserSettingsDefaults();
      loadReportFormatsDefaults();
      fetchAlerts();
      fetchSchedules();
      fetchTargets();
      fetchPolicies();
      fetchScanners();
    }
  }, [
    auditDialogVisible,
    fetchUserSettingsDefaults,
    loadReportFormatsDefaults,
    fetchAlerts,
    fetchSchedules,
    fetchTargets,
    fetchPolicies,
    fetchScanners,
  ]);

  useEffect(() => {
    if (audit) {
      setTitle(_('Edit Audit {{name}}', {name: audit.name}));
    }
  }, [audit, _]);

  const handleInteraction = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

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
      case 'policyId':
        setPolicyId(value);
        break;
      case 'comment':
        setComment(value);
        break;
      case 'hostsOrdering':
        setHostsOrdering(value);
        break;
      case 'id':
        setId(value);
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
      case 'targetId':
        setTargetId(value);
        break;
      default:
        break;
    }
  };

  const handleAuditStart = audit => {
    handleInteraction();

    if (isDefined(audit)) {
      gmp.audit.start(audit).then(onStarted, onStartError);
    }
  };

  const handleAuditStop = audit => {
    handleInteraction();

    if (isDefined(audit)) {
      gmp.audit.stop(audit).then(onStopped, onStopError);
    }
  };

  const handleAuditResume = audit => {
    handleInteraction();

    if (isDefined(audit)) {
      gmp.audit.resume(audit).then(onResumed, onResumeError);
    }
  };

  const handleAlertCreated = resp => {
    fetchAlerts();
    const {data: alert} = resp;
    if (isDefined(alert) && isDefined(alert.id)) {
      setAlertIds(prevAlertIds => [...prevAlertIds, alert.id]);
    }
  };

  const handleScheduleCreated = resp => {
    fetchSchedules();
    const {data: schedule} = resp;
    if (isDefined(schedule) && isDefined(schedule.id)) {
      setScheduleId(schedule.id);
    }
  };

  const handleTargetCreated = resp => {
    fetchTargets();
    const {data: target} = resp;
    if (isDefined(target) && isDefined(target.id)) {
      setTargetId(target.id);
    }
  };

  const handleSaveAudit = async ({
    alertIds,
    alterable,
    auto_delete,
    auto_delete_data,
    comment,
    policyId,
    hostsOrdering,
    id,
    in_assets,
    maxChecks,
    maxHosts,
    name,
    scannerId = OPENVAS_DEFAULT_SCANNER_ID,
    scannerType = OPENVAS_SCANNER_TYPE,
    scheduleId,
    schedulePeriods,
    targetId,
    audit,
  }) => {
    const tagId = undefined;
    const addTag = NO_VALUE;
    const applyOverrides = YES_VALUE;
    const minQod = DEFAULT_MIN_QOD;

    handleInteraction();

    if (isDefined(id)) {
      if (isDefined(audit) && !audit.isChangeable()) {
        targetId = undefined;
        scannerId = undefined;
        policyId = undefined;
      }

      try {
        const response = await gmp.audit.save({
          alertIds,
          alterable,
          autoDelete: auto_delete,
          autoDeleteData: auto_delete_data,
          applyOverrides,
          comment,
          policyId,
          hostsOrdering,
          id,
          inAssets: in_assets,
          maxChecks,
          maxHosts,
          minQod,
          name,
          scannerId,
          scannerType,
          scheduleId,
          schedulePeriods,
          targetId,
        });

        if (onSaved) {
          onSaved(response);
        }
        closeAuditDialog();
      } catch (error) {
        if (onSaveError) {
          onSaveError(error);
        }
      }
    } else {
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

        if (onCreated) {
          onCreated(response);
        }
        closeAuditDialog();
      } catch (error) {
        if (onCreateError) {
          onCreateError(error);
        }
      }
    }
  };

  const closeAuditDialog = () => {
    setAuditDialogVisible(false);
  };

  const handleCloseAuditDialog = () => {
    closeAuditDialog();
    handleInteraction();
  };

  const openAuditDialog = audit => {
    handleInteraction();

    fetchAlerts();
    fetchPolicies();
    fetchScanners();
    fetchSchedules();
    fetchTargets();

    if (isDefined(audit)) {
      const {
        alterable,
        alerts = [],
        auto_delete,
        auto_delete_data,
        comment,
        config,
        hosts_ordering,
        id,
        in_assets,
        max_checks,
        max_hosts,
        name,
        scanner,
        schedule,
        schedule_periods,
        target,
      } = audit;

      const canAccessSchedules =
        capabilities.mayAccess('schedules') && isDefined(schedule);
      const scheduleId = canAccessSchedules ? schedule.id : UNSET_VALUE;
      const schedulePeriods = canAccessSchedules ? schedule_periods : undefined;

      setAuditDialogVisible(true);
      setAlertIds(map(alerts, alert => alert.id));
      setAlterable(alterable);
      setAutoDelete(auto_delete);
      setAutoDeleteData(auto_delete_data);
      setPolicyId(hasId(config) ? config.id : undefined);
      setComment(comment);
      setHostsOrdering(hosts_ordering);
      setId(id);
      setInAssets(in_assets);
      setMaxChecks(max_checks);
      setMaxHosts(max_hosts);
      setName(name);
      setScannerId(hasId(scanner) ? scanner.id : undefined);
      setScheduleId(scheduleId);
      setSchedulePeriods(schedulePeriods);
      setTargetId(hasId(target) ? target.id : undefined);
      setAudit(audit);
      setTitle(_('Edit Audit {{name}}', {name}));
    } else {
      const alertIds = isDefined(defaultAlertId) ? [defaultAlertId] : [];

      setAuditDialogVisible(true);
      setAlertIds(alertIds);
      setAlterable(undefined);
      setAutoDelete(undefined);
      setAutoDeleteData(undefined);
      setComment(undefined);
      setPolicyId(undefined);
      setHostsOrdering(undefined);
      setId(undefined);
      setInAssets(undefined);
      setMaxChecks(undefined);
      setMaxHosts(undefined);
      setName(undefined);
      setScannerId(defaultScannerId || OPENVAS_DEFAULT_SCANNER_ID);
      setScheduleId(defaultScheduleId);
      setSchedulePeriods(undefined);
      setTargetId(defaultTargetId);
      setAudit(undefined);
      setTitle(_('New Audit'));
    }
  };

  const handleReportDownload = async audit => {
    setAudit(audit);

    handleInteraction();

    if (!isDefined(audit.last_report) || !isDefined(audit.last_report.id)) {
      return;
    }

    const [reportFormat] = reportFormats || [];

    if (!isDefined(reportFormat)) {
      return;
    }

    const extension = isDefined(reportFormat)
      ? reportFormat.extension
      : 'unknown';

    const {id} = audit.last_report;

    try {
      const response = await gmp.report.download(
        {id},
        {
          reportFormatId: reportFormat.id,
        },
      );

      const {data} = response;
      const filename = generateFilename({
        extension,
        fileNameFormat: reportExportFileName,
        id,
        reportFormat: reportFormat.name,
        resourceName: audit.name,
        resourceType: 'report',
        username,
      });

      download({
        filename,
        data: data.report,
      });

      if (onDownloaded) {
        onDownloaded();
      }
    } catch (error) {
      if (onDownloadError) {
        onDownloadError(error);
      }
    }
  };

  const handleScannerChange = scannerIdValue => {
    setScannerId(scannerIdValue);
  };

  const gcrFormatDefined = isDefined(reportFormats) && reportFormats.length > 0;

  return (
    <EntityComponent
      name="audit"
      onCloneError={onCloneError}
      onCloned={onCloned}
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
    >
      {other => (
        <>
          <Download ref={downloadRef} />
          {children({
            ...other,
            create: openAuditDialog,
            edit: openAuditDialog,
            start: handleAuditStart,
            stop: handleAuditStop,
            resume: handleAuditResume,
            reportDownload: handleReportDownload,
            gcrFormatDefined,
          })}

          {auditDialogVisible && (
            <TargetComponent
              onCreated={handleTargetCreated}
              onInteraction={onInteraction}
            >
              {({create: createtarget}) => (
                <AlertComponent
                  onCreated={handleAlertCreated}
                  onInteraction={onInteraction}
                >
                  {({create: createalert}) => (
                    <ScheduleComponent
                      onCreated={handleScheduleCreated}
                      onInteraction={onInteraction}
                    >
                      {({create: createschedule}) => (
                        <AuditDialog
                          alertIds={alertIds}
                          alerts={alerts}
                          alterable={alterable}
                          audit={audit}
                          auto_delete={autoDelete}
                          auto_delete_data={autoDeleteData}
                          comment={comment}
                          hostsOrdering={hostsOrdering}
                          id={id}
                          in_assets={inAssets}
                          isLoadingScanners={isLoadingScanners}
                          maxChecks={maxChecks}
                          maxHosts={maxHosts}
                          name={name}
                          policies={policies}
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
                          onClose={handleCloseAuditDialog}
                          onNewAlertClick={createalert}
                          onNewScheduleClick={createschedule}
                          onNewTargetClick={createtarget}
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
        </>
      )}
    </EntityComponent>
  );
};

AuditComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onResumeError: PropTypes.func,
  onResumed: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onStartError: PropTypes.func,
  onStarted: PropTypes.func,
  onStopError: PropTypes.func,
  onStopped: PropTypes.func,
};

export default AuditComponent;
