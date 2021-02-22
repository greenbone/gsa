/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {useSelector} from 'react-redux';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import Filter, {ALL_FILTER} from 'gmp/models/filter';
import {DEFAULT_MIN_QOD} from 'gmp/models/audit';
import {getSettingValueByName} from 'gmp/models/setting';

import {YES_VALUE} from 'gmp/parser';

import {map} from 'gmp/utils/array';
import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';

import {
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';

import useDownload from 'web/components/form/useDownload';
import Download from 'web/components/form/download';

import EntityComponent from 'web/entity/component';

import {useLazyGetAlerts} from 'web/graphql/alerts';
import {
  useCreateAudit,
  useModifyAudit,
  useResumeAudit,
  useStartAudit,
  useStopAudit,
} from 'web/graphql/audits';
import {useLazyGetPolicies} from 'web/graphql/policies';
import {useLazyGetScanners} from 'web/graphql/scanners';
import {useLazyGetSchedules} from 'web/graphql/schedules';
import {useLazyGetTargets} from 'web/graphql/targets';
import {useLazyGetReportFormats} from 'web/graphql/reportformats';
import {useLazyGetSettings} from 'web/graphql/settings';

import AlertComponent from 'web/pages/alerts/component';
import AuditDialog from 'web/pages/audits/dialog';
import ScheduleComponent from 'web/pages/schedules/component';
import TargetComponent from 'web/pages/targets/component';

import {getUsername} from 'web/store/usersettings/selectors';

import PropTypes from 'web/utils/proptypes';
import {UNSET_VALUE, generateFilename} from 'web/utils/render';
import stateReducer, {updateState} from 'web/utils/stateReducer';
import useGmp from 'web/utils/useGmp';
import useCapabilities from 'web/utils/useCapabilities';

const log = logger.getLogger('web.pages.audits.component');

const REPORT_FORMATS_FILTER = Filter.fromString(
  'uuid="dc51a40a-c022-11e9-b02d-3f7ca5bdcb11" and active=1 and trust=1',
);

const AuditComponent = ({
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
  onStarted,
  onStartError,
  onStopped,
  onStopError,
  onResumed,
  onResumeError,
  onSaved,
  onSaveError,
}) => {
  const gmp = useGmp();
  const capabilities = useCapabilities();
  const [downloadRef, handleDownload] = useDownload();

  const [state, dispatchState] = useReducer(stateReducer, {
    showDownloadReportDialog: false,
    auditDialogVisible: false,
  });

  // GraphQL Loaders
  const [
    loadAlerts,
    {
      alerts,
      loading: isLoadingAlerts,
      refetch: refetchAlerts,
      error: alertError,
    },
  ] = useLazyGetAlerts({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadPolicies,
    {policies, loading: isLoadingPolicies, error: policyError},
  ] = useLazyGetPolicies({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadScanners,
    {scanners: scannerList, loading: isLoadingScanners, error: scannerError},
  ] = useLazyGetScanners({
    filterString: ALL_FILTER.toFilterString(),
  });
  const [
    loadSchedules,
    {
      schedules,
      loading: isLoadingSchedules,
      error: scheduleError,
      refetch: refetchSchedules,
    },
  ] = useLazyGetSchedules({
    filterString: ALL_FILTER.toFilterString(),
  });
  const [
    loadTargets,
    {
      targets,
      loading: isLoadingTargets,
      refetch: refetchTargets,
      error: targetError,
    },
  ] = useLazyGetTargets({
    filterString: ALL_FILTER.toFilterString(),
  });

  const [
    loadUserSettingsDefaults,
    {settings: userDefaults},
  ] = useLazyGetSettings();
  const [loadReportFormats, {reportFormats = []}] = useLazyGetReportFormats({
    filterString: REPORT_FORMATS_FILTER.toFilterString(),
  });

  // Selectors
  const username = useSelector(getUsername);

  const defaultAlertId = getSettingValueByName(userDefaults)('Default Alert');

  let defaultScannerId = OPENVAS_DEFAULT_SCANNER_ID;
  const defaultScannerIdFromStore = getSettingValueByName(userDefaults)(
    'Default OpenVAS Scanner',
  );

  if (isDefined(defaultScannerIdFromStore)) {
    defaultScannerId = defaultScannerIdFromStore;
  }

  const defaultScheduleId = getSettingValueByName(userDefaults)(
    'Default Schedule',
  );
  const defaultTargetId = getSettingValueByName(userDefaults)('Default Target');
  const reportExportFileName = getSettingValueByName(userDefaults)(
    'Report Export File Name',
  );

  const scanners = isDefined(scannerList)
    ? scannerList.filter(
        scanner =>
          scanner.scannerType === OPENVAS_SCANNER_TYPE ||
          scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE,
      )
    : undefined;

  // GraphQL Queries and Mutations
  const [modifyAudit] = useModifyAudit();
  const [createAudit] = useCreateAudit();
  const [startAudit] = useStartAudit();
  const [stopAudit] = useStopAudit();
  const [resumeAudit] = useResumeAudit();

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleChange = (value, name) => {
    dispatchState(
      updateState({
        [name]: value,
      }),
    );
  };

  const handleAuditStart = audit => {
    handleInteraction();

    return startAudit(audit.id).then(onStarted, onStartError);
  };

  const handleAuditStop = audit => {
    handleInteraction();

    return stopAudit(audit.id).then(onStopped, onStopError);
  };

  const handleAuditResume = audit => {
    handleInteraction();

    return resumeAudit(audit.id).then(onResumed, onResumeError);
  };

  const handleAlertCreated = () => {
    refetchAlerts();
  };

  const handleScheduleCreated = scheduleId => {
    refetchSchedules();

    dispatchState(updateState({scheduleId}));
  };

  const handleTargetCreated = targetId => {
    refetchTargets();

    dispatchState(updateState({targetId}));
  };

  const handleSaveAudit = ({
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
    sourceIface,
    targetId,
    audit,
  }) => {
    const applyOverrides = YES_VALUE;
    const minQod = DEFAULT_MIN_QOD;

    handleInteraction();

    if (isDefined(id)) {
      // save edit part
      if (isDefined(audit) && !audit.isChangeable()) {
        // arguments need to be undefined if the audit is not changeable
        targetId = undefined;
        scannerId = undefined;
        policyId = undefined;
      }
      return modifyAudit({
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
        sourceIface,
      })
        .then(onSaved, onSaveError)
        .then(() => closeAuditDialog());
    }

    return createAudit({
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
      sourceIface,
      targetId: targetId,
    })
      .then(onCreated, onCreateError)
      .then(() => closeAuditDialog());
  };

  const closeAuditDialog = () => {
    dispatchState(
      updateState({
        auditDialogVisible: false,
      }),
    );
  };

  const handleCloseAuditDialog = () => {
    closeAuditDialog();
    handleInteraction();
  };

  const openAuditDialog = audit => {
    loadAlerts();
    loadPolicies();
    loadScanners();
    loadSchedules();
    loadTargets();

    if (isDefined(audit)) {
      const canAccessSchedules =
        capabilities.mayAccess('schedules') && isDefined(audit.schedule);
      const scheduleId = canAccessSchedules ? audit.schedule.id : UNSET_VALUE;
      const schedulePeriods = canAccessSchedules
        ? audit.schedule_periods
        : undefined;

      dispatchState(
        updateState({
          auditDialogVisible: true,
          alertIds: map(audit.alerts, alert => alert.id),
          alterable: audit.alterable,
          applyOverrides: audit.apply_overrides,
          auto_delete: audit.auto_delete,
          auto_delete_data: audit.auto_delete_data,
          comment: audit.comment,
          policyId: hasId(audit.config) ? audit.config.id : undefined,
          hostsOrdering: audit.hosts_ordering,
          id: audit.id,
          in_assets: audit.in_assets,
          maxChecks: audit.max_checks,
          maxHosts: audit.max_hosts,
          minQod: audit.min_qod,
          name: audit.name,
          scannerId: hasId(audit.scanner) ? audit.scanner.id : undefined,
          scheduleId,
          schedulePeriods,
          sourceIface: audit.source_iface,
          targetId: hasId(audit.target) ? audit.target.id : undefined,
          audit,
          title: _('Edit Audit {{name}}', audit),
        }),
      );
    } else {
      const alertIds = isDefined(defaultAlertId) ? [defaultAlertId] : [];

      const defaultScannerType = OPENVAS_SCANNER_TYPE;

      dispatchState(
        updateState({
          auditDialogVisible: true,
          alertIds,
          alterable: undefined,
          applyOverrides: undefined,
          auto_delete: undefined,
          auto_delete_data: undefined,
          comment: undefined,
          policyId: undefined,
          hostsOrdering: undefined,
          id: undefined,
          in_assets: undefined,
          maxChecks: undefined,
          maxHosts: undefined,
          minQod: undefined,
          name: undefined,
          scannerId: defaultScannerId,
          scanner_type: defaultScannerType,
          scheduleId: defaultScheduleId,
          schedulePeriods: undefined,
          sourceIface: undefined,
          targetId: defaultTargetId,
          audit: undefined,
          title: _('New Audit'),
        }),
      );
    }
    handleInteraction();
  };

  const handleReportDownload = audit => {
    dispatchState(
      updateState({
        audit,
      }),
    );

    const [reportFormat] = reportFormats;

    const extension = isDefined(reportFormat)
      ? reportFormat.extension
      : 'unknown'; // unknown should never happen but we should be save here

    handleInteraction();

    const {id} = audit.last_report;

    return gmp.report
      .download(
        {id},
        {
          reportFormatId: reportFormat.id,
        },
      )
      .then(response => {
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
        handleDownload({filename, data});
      }); // handleError
  };

  const handleScannerChange = scannerId => {
    dispatchState(
      updateState({
        scannerId,
      }),
    );
  };

  useEffect(() => {
    // display first loading error in the dialog
    if (policyError) {
      dispatchState(
        updateState({
          error: _('Error while loading scan configs.'),
        }),
      );
    } else if (scannerError) {
      dispatchState(
        updateState({
          error: _('Error while loading scanners.'),
        }),
      );
    } else if (scheduleError) {
      dispatchState(
        updateState({
          error: _('Error while loading schedules.'),
        }),
      );
    } else if (targetError) {
      dispatchState(
        updateState({
          error: _('Error while loading targets.'),
        }),
      );
    } else if (alertError) {
      dispatchState(
        updateState({
          error: _('Error while loading alerts.'),
        }),
      );
    }

    // log error all objects to be able to inspect them the console
    if (policyError) {
      log.error({policyError});
    }
    if (scannerError) {
      log.error({scannerError});
    }
    if (scheduleError) {
      log.error({scheduleError});
    }
    if (targetError) {
      log.error({targetError});
    }
    if (alertError) {
      log.error({alertError});
    }
  }, [policyError, scannerError, scheduleError, targetError, alertError]);

  const {
    alertIds,
    alterable,
    auto_delete,
    auto_delete_data,
    policyId,
    comment,
    hostsOrdering,
    id,
    in_assets,
    maxChecks,
    maxHosts,
    name,
    scannerId,
    scheduleId,
    schedulePeriods,
    sourceIface,
    targetId,
    audit,
    auditDialogVisible,
    title = _('Edit Audit {{name}}', audit),
  } = state;
  const gcrFormatDefined = reportFormats.length > 0;

  useEffect(() => {
    loadUserSettingsDefaults();
    loadReportFormats();
  }, [loadUserSettingsDefaults, loadReportFormats]);

  return (
    <React.Fragment>
      <EntityComponent
        name="audit"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
      >
        {other => (
          <React.Fragment>
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
                            alerts={alerts}
                            alertIds={alertIds}
                            alterable={alterable}
                            auto_delete={auto_delete}
                            auto_delete_data={auto_delete_data}
                            comment={comment}
                            policyId={policyId}
                            hostsOrdering={hostsOrdering}
                            id={id}
                            in_assets={in_assets}
                            isLoadingAlerts={isLoadingAlerts}
                            isLoadingPolicies={isLoadingPolicies}
                            isLoadingScanners={isLoadingScanners}
                            isLoadingSchedules={isLoadingSchedules}
                            isLoadingTargets={isLoadingTargets}
                            maxChecks={maxChecks}
                            maxHosts={maxHosts}
                            name={name}
                            policies={policies}
                            scannerId={scannerId}
                            scanners={scanners}
                            scheduleId={scheduleId}
                            schedulePeriods={schedulePeriods}
                            schedules={schedules}
                            sourceIface={sourceIface}
                            targetId={targetId}
                            targets={targets}
                            audit={audit}
                            title={title}
                            onNewAlertClick={createalert}
                            onNewTargetClick={createtarget}
                            onNewScheduleClick={createschedule}
                            onChange={handleChange}
                            onClose={handleCloseAuditDialog}
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
          </React.Fragment>
        )}
      </EntityComponent>
      <Download ref={downloadRef} />
    </React.Fragment>
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
  onDownload: PropTypes.func.isRequired,
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
