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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import Filter, {ALL_FILTER} from 'gmp/models/filter';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {hasId} from 'gmp/utils/id';

import withDownload from 'web/components/form/withDownload';
import {withRouter} from 'react-router-dom';

import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';

import {
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
} from 'gmp/models/scanner';

import {
  loadEntities as loadAlerts,
  selector as alertSelector,
} from 'web/store/entities/alerts';

import {
  loadEntities as loadCredentials,
  selector as credentialsSelector,
} from 'web/store/entities/credentials';

import {
  loadEntities as loadScanConfigs,
  selector as scanConfigsSelector,
} from 'web/store/entities/scanconfigs';

import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';

import {
  loadEntities as loadSchedules,
  selector as scheduleSelector,
} from 'web/store/entities/schedules';

import {
  loadEntities as loadTags,
  selector as tagsSelector,
} from 'web/store/entities/tags';

import {
  loadEntities as loadTargets,
  selector as targetSelector,
} from 'web/store/entities/targets';

import {
  loadAllEntities as loadReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';

import {getTimezone} from 'web/store/usersettings/selectors';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';
import {UNSET_VALUE} from 'web/utils/render';

import EntityComponent from 'web/entity/component';

import ImportReportDialog from 'web/pages/reports/importdialog';

import ScheduleComponent from 'web/pages/schedules/component';
import AlertComponent from 'web/pages/alerts/component';
import TargetComponent from 'web/pages/targets/component';

import AuditDialog from 'web/pages/audits/dialog';
import ContainerTaskDialog from 'web/pages/tasks/containerdialog';

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 trust=1 rows=-1');

class AuditComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      containerTaskDialogVisible: false,
      reportImportDialogVisible: false,
      showDownloadReportDialog: false,
      auditDialogVisible: false,
      gcrFormatDefined: undefined,
    };

    const {gmp} = this.props;

    this.cmd = gmp.task;

    this.handleReportImport = this.handleReportImport.bind(this);
    this.handleTaskResume = this.handleTaskResume.bind(this);

    this.handleSaveTask = this.handleSaveTask.bind(this);
    this.handleSaveContainerTask = this.handleSaveContainerTask.bind(this);

    this.handleTaskStart = this.handleTaskStart.bind(this);
    this.handleTaskStop = this.handleTaskStop.bind(this);

    this.openContainerTaskDialog = this.openContainerTaskDialog.bind(this);
    this.handleCloseContainerTaskDialog = this.handleCloseContainerTaskDialog.bind(
      this,
    );
    this.openReportImportDialog = this.openReportImportDialog.bind(this);
    this.handleCloseReportImportDialog = this.handleCloseReportImportDialog.bind(
      this,
    );

    this.handleReportDownloadClick = this.handleReportDownloadClick.bind(this);
    this.handleReportDownload = this.handleReportDownload.bind(this);

    this.openStandardAuditDialog = this.openStandardAuditDialog.bind(this);
    this.openAuditDialog = this.openAuditDialog.bind(this);
    this.handleCloseAuditDialog = this.handleCloseAuditDialog.bind(this);

    this.handleAlertsChange = this.handleAlertsChange.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleScheduleChange = this.handleScheduleChange.bind(this);

    this.handleAlertCreated = this.handleAlertCreated.bind(this);
    this.handleTargetCreated = this.handleTargetCreated.bind(this);
    this.handleScheduleCreated = this.handleScheduleCreated.bind(this);

    this.handleInteraction = this.handleInteraction.bind(this);

    this.handleScanConfigChange = this.handleScanConfigChange.bind(this);
    this.handleScannerChange = this.handleScannerChange.bind(this);
  }

  componentDidMount() {
    this.props.loadUserSettingsDefaults();
    this.props.loadReportFormats();
  }

  componentDidUpdate() {
    const {reportFormats} = this.props;
    if (
      !isDefined(this.state.gcrFormatDefined) &&
      isDefined(reportFormats) &&
      reportFormats.length > 0
    ) {
      const gcrFormat = reportFormats.find(format => {
        return format.name === 'GCR PDF';
      });
      const gcrFormatDefined = isDefined(gcrFormat)
        ? gcrFormat.active === 1 && gcrFormat.trust.value === 'yes'
        : false;
      this.setState({gcrFormatDefined: gcrFormatDefined});
    }
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleTargetChange(target_id) {
    this.setState({target_id});
  }

  handleAlertsChange(alert_ids) {
    this.setState({alert_ids});
  }

  handleScheduleChange(schedule_id) {
    this.setState({schedule_id});
  }

  handleTaskStart(task) {
    const {onStarted, onStartError} = this.props;

    this.handleInteraction();

    return this.cmd.start(task).then(onStarted, onStartError);
  }

  handleTaskStop(task) {
    const {onStopped, onStopError} = this.props;

    this.handleInteraction();

    return this.cmd.stop(task).then(onStopped, onStopError);
  }

  handleTaskResume(task) {
    const {onResumed, onResumeError} = this.props;

    this.handleInteraction();

    return this.cmd.resume(task).then(onResumed, onResumeError);
  }

  handleAlertCreated(resp) {
    const {data} = resp;

    this.props.loadAlerts();

    this.setState(({alert_ids}) => ({alert_ids: [data.id, ...alert_ids]}));
  }

  handleScheduleCreated(resp) {
    const {data} = resp;

    this.props.loadSchedules();

    this.setState({schedule_id: data.id});
  }

  handleTargetCreated(resp) {
    const {data} = resp;

    this.props.loadTargets();

    this.setState({target_id: data.id});
  }

  openContainerTaskDialog(task) {
    this.setState({
      containerTaskDialogVisible: true,
      task,
      name: task ? task.name : _('Unnamed'),
      comment: task ? task.comment : '',
      id: task ? task.id : undefined,
      in_assets: task ? task.in_assets : undefined,
      auto_delete: task ? task.auto_delete : undefined,
      auto_delete_data: task ? task.auto_delete_data : undefined,
      title: task
        ? _('Edit Container Task {{name}}', task)
        : _('New Container Task'),
    });
    this.handleInteraction();
  }

  closeContainerTaskDialog() {
    this.setState({containerTaskDialogVisible: false});
  }

  handleCloseContainerTaskDialog() {
    this.closeContainerTaskDialog();
    this.handleInteraction();
  }

  handleSaveContainerTask(data) {
    this.handleInteraction();

    if (isDefined(data.id)) {
      const {onContainerSaved, onContainerSaveError} = this.props;
      return this.cmd
        .saveContainer(data)
        .then(onContainerSaved, onContainerSaveError)
        .then(() => this.closeContainerTaskDialog());
    }

    const {onContainerCreated, onContainerCreateError} = this.props;
    return this.cmd
      .createContainer(data)
      .then(onContainerCreated, onContainerCreateError)
      .then(() => this.closeContainerTaskDialog());
  }

  handleSaveTask({
    add_tag,
    alert_ids,
    alterable,
    auto_delete,
    auto_delete_data,
    apply_overrides,
    comment,
    config_id,
    hosts_ordering,
    id,
    in_assets,
    min_qod,
    max_checks,
    max_hosts,
    name,
    schedule_id,
    schedule_periods,
    source_iface,
    tag_id,
    target_id,
    task,
  }) {
    const {gmp} = this.props;
    let {scanner_id, scanner_type} = this.state;

    this.handleInteraction();

    if (isDefined(id)) {
      // save edit part
      if (isDefined(task) && !task.isChangeable()) {
        // arguments need to be undefined if the task is not changeable
        target_id = undefined;
        scanner_id = undefined;
        config_id = undefined;
      }
      const {onSaved, onSaveError} = this.props;
      return gmp.task
        .save({
          alert_ids,
          alterable,
          auto_delete,
          auto_delete_data,
          apply_overrides,
          comment,
          config_id,
          hosts_ordering,
          id,
          in_assets,
          max_checks,
          max_hosts,
          min_qod,
          name,
          scanner_id,
          scanner_type,
          schedule_id,
          schedule_periods,
          target_id,
          source_iface,
        })
        .then(onSaved, onSaveError)
        .then(() => this.closeAuditDialog());
    }

    const {onCreated, onCreateError} = this.props;
    return gmp.task
      .create({
        add_tag,
        alert_ids,
        alterable,
        apply_overrides,
        auto_delete,
        auto_delete_data,
        comment,
        config_id,
        hosts_ordering,
        in_assets,
        max_checks,
        max_hosts,
        min_qod,
        name,
        scanner_type,
        scanner_id,
        schedule_id,
        schedule_periods,
        source_iface,
        tag_id,
        target_id,
      })
      .then(onCreated, onCreateError)
      .then(() => this.closeAuditDialog());
  }

  openAuditDialog(task) {
    if (isDefined(task) && task.isContainer()) {
      this.openContainerTaskDialog(task);
    } else {
      this.openStandardAuditDialog(task);
    }
  }

  closeAuditDialog() {
    this.setState({auditDialogVisible: false});
  }

  handleCloseAuditDialog() {
    this.closeAuditDialog();
    this.handleInteraction();
  }

  openStandardAuditDialog(task) {
    const {capabilities} = this.props;

    this.props.loadAlerts();
    this.props.loadScanConfigs();
    this.props.loadScanners();
    this.props.loadSchedules();
    this.props.loadTargets();
    this.props.loadTags();

    if (isDefined(task)) {
      const canAccessSchedules =
        capabilities.mayAccess('schedules') && isDefined(task.schedule);
      const schedule_id = canAccessSchedules ? task.schedule.id : UNSET_VALUE;
      const schedule_periods = canAccessSchedules
        ? task.schedule_periods
        : undefined;

      this.setState({
        auditDialogVisible: true,
        alert_ids: map(task.alerts, alert => alert.id),
        alterable: task.alterable,
        apply_overrides: task.apply_overrides,
        auto_delete: task.auto_delete,
        auto_delete_data: task.auto_delete_data,
        comment: task.comment,
        config_id: hasId(task.config) ? task.config.id : undefined,
        hosts_ordering: task.hosts_ordering,
        id: task.id,
        in_assets: task.in_assets,
        max_checks: task.max_checks,
        max_hosts: task.max_hosts,
        min_qod: task.min_qod,
        name: task.name,
        scanner_id: hasId(task.scanner) ? task.scanner.id : undefined,
        schedule_id,
        schedule_periods,
        source_iface: task.source_iface,
        target_id: hasId(task.target) ? task.target.id : undefined,
        task,
        title: _('Edit Audit {{name}}', task),
      });
    } else {
      const {
        defaultAlertId,
        defaultScanConfigId = FULL_AND_FAST_SCAN_CONFIG_ID,
        defaultScannerId = OPENVAS_DEFAULT_SCANNER_ID,
        defaultScheduleId,
        defaultTargetId,
      } = this.props;

      const alert_ids = isDefined(defaultAlertId) ? [defaultAlertId] : [];

      const defaultScannerType = OPENVAS_SCANNER_TYPE;

      this.setState({
        auditDialogVisible: true,
        alert_ids,
        alterable: undefined,
        apply_overrides: undefined,
        auto_delete: undefined,
        auto_delete_data: undefined,
        comment: undefined,
        config_id: defaultScanConfigId,
        hosts_ordering: undefined,
        id: undefined,
        in_assets: undefined,
        max_checks: undefined,
        max_hosts: undefined,
        min_qod: undefined,
        name: undefined,
        scanner_id: defaultScannerId,
        scanner_type: defaultScannerType,
        schedule_id: defaultScheduleId,
        schedule_periods: undefined,
        source_iface: undefined,
        target_id: defaultTargetId,
        task: undefined,
        title: _('New Audit'),
      });
    }
    this.handleInteraction();
  }

  openReportImportDialog(task) {
    this.setState({
      reportImportDialogVisible: true,
      task_id: task.id,
      tasks: [task],
    });
    this.handleInteraction();
  }

  closeReportImportDialog() {
    this.setState({reportImportDialogVisible: false});
  }

  handleCloseReportImportDialog() {
    this.closeReportImportDialog();
    this.handleInteraction();
  }

  handleReportImport(data) {
    const {onReportImported, onReportImportError, gmp} = this.props;

    this.handleInteraction();

    return gmp.report
      .import(data)
      .then(onReportImported, onReportImportError)
      .then(() => this.closeReportImportDialog());
  }

  handleReportDownloadClick(task) {
    this.setState({
      task: task,
    });

    this.handleReportDownload(this.state, task);
  }

  handleReportDownload(state, task) {
    const {gmp, reportFormats = [], onDownload} = this.props;

    const report_format = reportFormats.find(
      format => format.name === 'GCR PDF',
    );

    const extension = isDefined(report_format)
      ? report_format.extension
      : 'unknown'; // unknown should never happen but we should be save here

    this.handleInteraction();

    const {id} = task.last_report;

    gmp.report
      .download(
        {id},
        {
          reportFormatId: report_format.id,
          deltaReportId: undefined,
          filter: undefined,
        },
      )
      .then(response => {
        const {data} = response;
        const filename = 'report-' + id + '.' + extension;
        onDownload({filename, data});
      }, this.handleError);
  }

  handleScanConfigChange(config_id) {
    this.setState({config_id});
  }

  handleScannerChange(scanner_id) {
    this.setState({scanner_id});
  }

  render() {
    const {
      alerts,
      // credentials,
      // entity,
      scanConfigs,
      scanners,
      schedules,
      tags,
      targets,
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
    } = this.props;

    const {
      // alert_id,
      alert_ids,
      alterable,
      apply_overrides,
      auto_delete,
      auto_delete_data,
      config_id,
      containerTaskDialogVisible,
      comment,
      // esxi_credential,
      // hosts,
      hosts_ordering,
      id,
      in_assets,
      gcrFormatDefined,
      max_checks,
      max_hosts,
      min_qod,
      name,
      // port_list_id,
      reportImportDialogVisible,
      // reschedule,
      scanner_id,
      schedule_id,
      schedule_periods,
      // showDownloadReportDialog,
      source_iface,
      // ssh_credential,
      // smb_credential,
      // start_date,
      // start_minute,
      // start_hour,
      // start_timezone,
      // storeAsDefault,
      tag_id,
      target_id,
      // target_hosts,
      task_id,
      // task_name,
      task,
      tasks,
      auditDialogVisible,
      title = _('Edit Audit {{name}}', task),
    } = this.state;
    return (
      <React.Fragment>
        <EntityComponent
          name="task"
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
                create: this.openAuditDialog,
                createcontainer: this.openContainerTaskDialog,
                edit: this.openAuditDialog,
                start: this.handleTaskStart,
                stop: this.handleTaskStop,
                resume: this.handleTaskResume,
                reportimport: this.openReportImportDialog,
                reportDownload: this.handleReportDownloadClick,
                gcrFormatDefined: gcrFormatDefined,
              })}

              {auditDialogVisible && (
                <TargetComponent
                  onCreated={this.handleTargetCreated}
                  onInteraction={onInteraction}
                >
                  {({create: createtarget}) => (
                    <AlertComponent
                      onCreated={this.handleAlertCreated}
                      onInteraction={onInteraction}
                    >
                      {({create: createalert}) => (
                        <ScheduleComponent
                          onCreated={this.handleScheduleCreated}
                          onInteraction={onInteraction}
                        >
                          {({create: createschedule}) => (
                            <AuditDialog
                              alerts={alerts}
                              alert_ids={alert_ids}
                              alterable={alterable}
                              apply_overrides={apply_overrides}
                              auto_delete={auto_delete}
                              auto_delete_data={auto_delete_data}
                              comment={comment}
                              config_id={config_id}
                              hosts_ordering={hosts_ordering}
                              id={id}
                              in_assets={in_assets}
                              max_checks={max_checks}
                              max_hosts={max_hosts}
                              min_qod={min_qod}
                              name={name}
                              scan_configs={scanConfigs}
                              scanner_id={scanner_id}
                              scanners={scanners}
                              schedule_id={schedule_id}
                              schedule_periods={schedule_periods}
                              schedules={schedules}
                              source_iface={source_iface}
                              tag_id={tag_id}
                              tags={tags}
                              target_id={target_id}
                              targets={targets}
                              task={task}
                              title={title}
                              onAlertsChange={this.handleAlertsChange}
                              onNewAlertClick={createalert}
                              onNewTargetClick={createtarget}
                              onNewScheduleClick={createschedule}
                              onScanConfigChange={this.handleScanConfigChange}
                              onScannerChange={this.handleScannerChange}
                              onScheduleChange={this.handleScheduleChange}
                              onTargetChange={this.handleTargetChange}
                              onClose={this.handleCloseAuditDialog}
                              onSave={this.handleSaveTask}
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

        {containerTaskDialogVisible && (
          <ContainerTaskDialog
            task={task}
            name={name}
            comment={comment}
            id={id}
            in_assets={in_assets}
            auto_delete={auto_delete}
            auto_delete_data={auto_delete_data}
            title={title}
            onClose={this.handleCloseContainerTaskDialog}
            onSave={this.handleSaveContainerTask}
          />
        )}

        {reportImportDialogVisible && (
          <ImportReportDialog
            newContainerTask={false}
            task_id={task_id}
            tasks={tasks}
            onClose={this.handleCloseReportImportDialog}
            onSave={this.handleReportImport}
          />
        )}
      </React.Fragment>
    );
  }
}

AuditComponent.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.model),
  capabilities: PropTypes.capabilities.isRequired,
  children: PropTypes.func.isRequired,
  credentials: PropTypes.arrayOf(PropTypes.model),
  defaultAlertId: PropTypes.id,
  defaultEsxiCredential: PropTypes.id,
  defaultPortListId: PropTypes.id,
  defaultScanConfigId: PropTypes.id,
  defaultScannerId: PropTypes.id,
  defaultScheduleId: PropTypes.id,
  defaultSmbCredential: PropTypes.id,
  defaultSshCredential: PropTypes.id,
  defaultTargetId: PropTypes.id,
  gmp: PropTypes.gmp.isRequired,
  loadAlerts: PropTypes.func.isRequired,
  loadCredentials: PropTypes.func.isRequired,
  loadReportFormats: PropTypes.func.isRequired,
  loadScanConfigs: PropTypes.func.isRequired,
  loadScanners: PropTypes.func.isRequired,
  loadSchedules: PropTypes.func.isRequired,
  loadTags: PropTypes.func.isRequired,
  loadTargets: PropTypes.func.isRequired,
  loadUserSettingsDefaults: PropTypes.func.isRequired,
  reportFormats: PropTypes.array,
  scanConfigs: PropTypes.arrayOf(PropTypes.model),
  scanners: PropTypes.arrayOf(PropTypes.model),
  schedules: PropTypes.arrayOf(PropTypes.model),
  tags: PropTypes.arrayOf(PropTypes.model),
  targets: PropTypes.arrayOf(PropTypes.model),
  timezone: PropTypes.string.isRequired,
  onAdvancedTaskWizardError: PropTypes.func,
  onAdvancedTaskWizardSaved: PropTypes.func,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onContainerCreateError: PropTypes.func,
  onContainerCreated: PropTypes.func,
  onContainerSaveError: PropTypes.func,
  onContainerSaved: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownload: PropTypes.func.isRequired,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onModifyTaskWizardError: PropTypes.func,
  onModifyTaskWizardSaved: PropTypes.func,
  onReportImportError: PropTypes.func,
  onReportImported: PropTypes.func,
  onResumeError: PropTypes.func,
  onResumed: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onStartError: PropTypes.func,
  onStarted: PropTypes.func,
  onStopError: PropTypes.func,
  onStopped: PropTypes.func,
  onTaskWizardError: PropTypes.func,
  onTaskWizardSaved: PropTypes.func,
};

const TAGS_FILTER = ALL_FILTER.copy().set('resource_type', 'task');

const mapStateToProps = (rootState, {match}) => {
  const alertSel = alertSelector(rootState);
  const credentialsSel = credentialsSelector(rootState);
  const userDefaults = getUserSettingsDefaults(rootState);
  const scanConfigsSel = scanConfigsSelector(rootState);
  const scannersSel = scannerSelector(rootState);
  const scheduleSel = scheduleSelector(rootState);
  const tagsSel = tagsSelector(rootState);
  const targetSel = targetSelector(rootState);

  const reportFormatsSel = reportFormatsSelector(rootState);

  return {
    timezone: getTimezone(rootState),
    alerts: alertSel.getEntities(ALL_FILTER),
    credentials: credentialsSel.getEntities(ALL_FILTER),
    defaultAlertId: userDefaults.getValueByName('defaultalert'),
    defaultEsxiCredential: userDefaults.getValueByName('defaultesxicredential'),
    defaultPortListId: userDefaults.getValueByName('defaultportlist'),
    defaultScanConfigId: userDefaults.getValueByName(
      'defaultopenvasscanconfig',
    ),
    defaultScannerId: userDefaults.getValueByName('defaultopenvasscanner'),
    defaultScheduleId: userDefaults.getValueByName('defaultschedule'),
    defaultSshCredential: userDefaults.getValueByName('defaultsshcredential'),
    defaultSmbCredential: userDefaults.getValueByName('defaultsmbcredential'),
    defaultTargetId: userDefaults.getValueByName('defaulttarget'),
    reportFormats: reportFormatsSel.getAllEntities(REPORT_FORMATS_FILTER),
    scanConfigs: scanConfigsSel.getEntities(ALL_FILTER),
    scanners: scannersSel.getEntities(ALL_FILTER),
    schedules: scheduleSel.getEntities(ALL_FILTER),
    tags: tagsSel.getEntities(TAGS_FILTER),
    targets: targetSel.getEntities(ALL_FILTER),
  };
};

const mapDispatchToProp = (dispatch, {gmp}) => ({
  loadAlerts: () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
  loadCredentials: () => dispatch(loadCredentials(gmp)(ALL_FILTER)),
  loadScanConfigs: () => dispatch(loadScanConfigs(gmp)(ALL_FILTER)),
  loadScanners: () => dispatch(loadScanners(gmp)(ALL_FILTER)),
  loadSchedules: () => dispatch(loadSchedules(gmp)(ALL_FILTER)),
  loadTags: () => dispatch(loadTags(gmp)(TAGS_FILTER)),
  loadTargets: () => dispatch(loadTargets(gmp)(ALL_FILTER)),
  loadUserSettingsDefaults: () => dispatch(loadUserSettingDefaults(gmp)()),
  loadReportFormats: () =>
    dispatch(loadReportFormats(gmp)(REPORT_FORMATS_FILTER)),
});

export default compose(
  withGmp,
  withCapabilities,
  withDownload,
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProp,
  ),
)(AuditComponent);
