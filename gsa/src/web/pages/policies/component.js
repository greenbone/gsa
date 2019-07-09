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

import {ALL_FILTER} from 'gmp/models/filter';

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty, shorten} from 'gmp/utils/string';
import {selectSaveId} from 'gmp/utils/id';

import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';

import {
  ospScannersFilter,
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
} from 'gmp/models/scanner';

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

import {getTimezone} from 'web/store/usersettings/selectors';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import EditPolicyFamilyDialog from 'web/pages/policies/editpolicyfamilydialog';
import EditPolicyDialog from 'web/pages/policies/editdialog';
import EditNvtDetailsDialog from 'web/pages/policies/editnvtdetailsdialog';
import AuditDialog from './createauditdialog';
import ImportDialog from 'web/pages/policies/importdialog';
import PolicyDialog from 'web/pages/policies/dialog';

import ScheduleComponent from 'web/pages/schedules/component';
import AlertComponent from 'web/pages/alerts/component';
import TargetComponent from 'web/pages/targets/component';

const DEFAULT_MIN_QOD = 70;

class PolicyComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      createPolicyDialogVisible: false,
      editPolicyDialogVisible: false,
      editPolicyFamilyDialogVisible: false,
      editNvtDetailsDialogVisible: false,
      createAuditDialogVisible: false,
      importDialogVisible: false,
    };

    this.handleImportPolicy = this.handleImportPolicy.bind(this);
    this.handleSavePolicyFamily = this.handleSavePolicyFamily.bind(this);
    this.handleSavePolicyNvt = this.handleSavePolicyNvt.bind(this);
    this.openCreatePolicyDialog = this.openCreatePolicyDialog.bind(this);
    this.handleCloseCreatePolicyDialog = this.handleCloseCreatePolicyDialog.bind(
      this,
    );
    this.openEditPolicyDialog = this.openEditPolicyDialog.bind(this);
    this.handleCloseEditPolicyDialog = this.handleCloseEditPolicyDialog.bind(
      this,
    );
    this.openEditPolicyFamilyDialog = this.openEditPolicyFamilyDialog.bind(
      this,
    );
    this.handleCloseEditPolicyFamilyDialog = this.handleCloseEditPolicyFamilyDialog.bind(
      this,
    );
    this.openEditNvtDetailsDialog = this.openEditNvtDetailsDialog.bind(this);
    this.handleCloseEditNvtDetailsDialog = this.handleCloseEditNvtDetailsDialog.bind(
      this,
    );
    this.openImportDialog = this.openImportDialog.bind(this);
    this.handleCloseImportDialog = this.handleCloseImportDialog.bind(this);
    this.openCreateAuditDialog = this.openCreateAuditDialog.bind(this);
    this.handleCloseCreateAuditDialog = this.handleCloseCreateAuditDialog.bind(
      this,
    );
    this.handleSaveAudit = this.handleSaveAudit.bind(this);
    this.handleAlertsChange = this.handleAlertsChange.bind(this);
    this.handleAlertCreated = this.handleAlertCreated.bind(this);
    this.handleScheduleChange = this.handleScheduleChange.bind(this);
    this.handleScheduleCreated = this.handleScheduleCreated.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleTargetCreated = this.handleTargetCreated.bind(this);
  }

  handleAlertsChange(alert_ids) {
    this.setState({alert_ids});
  }

  handleScheduleChange(schedule_id) {
    this.setState({schedule_id});
  }

  handleTargetChange(target_id) {
    this.setState({target_id});
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

  openEditPolicyDialog(config) {
    Promise.all([
      this.loadEditPolicySettings(config),
      this.loadScanners(),
    ]).then(([scanConfigState, scannerState]) => {
      this.setState({
        ...scannerState,
        ...scanConfigState,
        base: config.base,
        editPolicyDialogVisible: true,
        title: _('Edit Policy {{name}}', {name: shorten(config.name)}),
      });
    });

    this.handleInteraction();
  }

  closeEditPolicyDialog() {
    this.setState({editPolicyDialogVisible: false});
  }

  handleCloseEditPolicyDialog() {
    this.closeEditPolicyDialog();
    this.handleInteraction();
  }

  openCreatePolicyDialog() {
    this.loadScanners().then(state =>
      this.setState({
        ...state,
        createPolicyDialogVisible: true,
      }),
    );

    this.handleInteraction();
  }

  closeCreatePolicyDialog() {
    this.setState({createPolicyDialogVisible: false});
  }

  handleCloseCreatePolicyDialog() {
    this.closeCreatePolicyDialog();
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

  openCreateAuditDialog(policy) {
    this.props.loadAlerts();
    this.props.loadSchedules();
    this.props.loadTargets();

    console.log('config=', policy);

    const {defaultAlertId, defaultScheduleId, defaultTargetId} = this.props;

    const alert_ids = isDefined(defaultAlertId) ? [defaultAlertId] : [];

    this.setState({
      createAuditDialogVisible: true,
      alert_ids,
      alterable: undefined,
      auto_delete: undefined,
      auto_delete_data: undefined,
      comment: '',
      policy_id: isDefined(policy) ? policy.id : undefined,
      hosts_ordering: undefined,
      id: undefined,
      in_assets: undefined,
      max_checks: undefined,
      max_hosts: undefined,
      name: undefined,
      schedule_id: defaultScheduleId,
      schedule_periods: undefined,
      source_iface: undefined,
      target_id: defaultTargetId,
      title: _('New Audit'),
    });

    this.handleInteraction();
  }

  closeCreateAuditDialog() {
    this.setState({createAuditDialogVisible: false});
  }

  handleCloseCreateAuditDialog() {
    this.closeCreateAuditDialog();
    this.handleInteraction();
  }

  handleSaveAudit({
    alert_ids,
    alterable,
    auto_delete,
    auto_delete_data,
    comment,
    hosts_ordering,
    in_assets,
    max_checks,
    max_hosts,
    name,
    schedule_id,
    schedule_periods,
    source_iface,
    target_id,
  }) {
    const {gmp} = this.props;
    const config_id = this.state.policy_id;

    const scanner_id = OPENVAS_DEFAULT_SCANNER_ID;
    const scanner_type = OPENVAS_SCANNER_TYPE;

    const tag_id = undefined;
    const add_tag = NO_VALUE;

    const apply_overrides = YES_VALUE;
    const min_qod = DEFAULT_MIN_QOD;

    this.handleInteraction();

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
      .then(() => this.closeCreateAuditDialog());
  }

  openEditPolicyFamilyDialog({config, name}) {
    this.loadEditPolicyFamilySettings(config, name).then(state => {
      this.setState({
        ...state,
        config,
        editPolicyFamilyDialogVisible: true,
        editPolicyFamilyDialogTitle: _('Edit Policy Family {{name}}', {
          name: shorten(name),
        }),
      });
    });
    this.handleInteraction();
  }

  closeEditPolicyFamilyDialog() {
    this.setState({editPolicyFamilyDialogVisible: false});
  }

  handleCloseEditPolicyFamilyDialog() {
    this.closeEditPolicyFamilyDialog();
    this.handleInteraction();
  }

  openEditNvtDetailsDialog({config, nvt}) {
    this.loadEditPolicyNvtSettings(config, nvt).then(state => {
      this.setState({
        ...state,
        config,
        editNvtDetailsDialogVisible: true,
        editNvtDetailsDialogTitle: _('Edit Policy NVT {{name}}', {
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

  handleImportPolicy(data) {
    const {gmp, onImported, onImportError} = this.props;

    this.handleInteraction();

    return gmp.policy
      .import(data)
      .then(onImported, onImportError)
      .then(() => this.closeImportDialog());
  }

  handleSavePolicyFamily(data) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.policy
      .savePolicyFamily(data)
      .then(() => {
        return this.loadEditPolicySettings(data.config);
      })
      .then(state => {
        this.closeEditPolicyFamilyDialog();
        this.setState({...state});
      });
  }

  handleSavePolicyNvt(values) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.policy
      .savePolicyNvt(values)
      .then(response => {
        // update nvt timeouts in nvt family dialog
        this.loadEditPolicyFamilySettings(
          values.config,
          values.family_name,
        ).then(state => {
          this.setState({state});
        });

        // update nvt preference values in edit dialog
        this.loadEditPolicySettings(values.config).then(state => {
          this.setState({state});
        });
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

  loadEditPolicySettings(config) {
    const {gmp} = this.props;

    return Promise.all([gmp.policy.get(config), gmp.nvtfamilies.get()]).then(
      ([configResponse, familiesResponse]) => {
        const {data: scanconfig} = configResponse;
        const {data: families} = familiesResponse;
        const trend = {};
        const select = {};

        forEach(families, family => {
          const {name} = family;
          const config_family = scanconfig.families[name];

          if (isDefined(config_family)) {
            trend[name] = parseYesNo(config_family.trend);
            select[name] =
              config_family.nvts.count === family.max ? YES_VALUE : NO_VALUE;
          } else {
            trend[name] = NO_VALUE;
            select[name] = NO_VALUE;
          }
        });

        const scanner_preference_values = {};

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
      },
    );
  }

  loadEditPolicyFamilySettings(config, name) {
    const {gmp} = this.props;
    const {select} = this.state;

    return gmp.policy
      .editPolicyFamilySettings({
        id: config.id,
        family_name: name,
        policy_name: config.name,
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
          config: data.config,
          config_name: config.name,
          family_name: name,
          id: config.id,
          nvts: data.nvts,
          selected,
        };

        return state;
      });
  }

  loadEditPolicyNvtSettings(config, nvt) {
    const {gmp} = this.props;

    return gmp.policy
      .editPolicyNvtSettings({
        id: config.id,
        oid: nvt.oid,
        policy_name: config.name,
        name: nvt.name,
      })
      .then(response => {
        const {data} = response;
        const preference_values = {};

        forEach(data.nvt.preferences, pref => {
          let {value, type} = pref;

          if (type === 'password' || type === 'file') {
            value = undefined;
          }

          preference_values[pref.name] = {
            value,
            type,
          };
        });

        const state = {
          config: data.policy,
          config_name: data.policy.name,
          family_name: data.nvt.family,
          id: data.policy.id,
          oid: data.nvt.oid,
          manual_timeout: data.nvt.timeout,
          nvt: data.nvt,
          nvt_name: data.nvt.name,
          preference_values,
          timeout: isEmpty(data.nvt.timeout) ? '0' : '1',
        };

        return state;
      });
  }

  render() {
    const {
      alerts,
      children,
      schedules,
      targets,
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
      alert_ids,
      alterable,
      auto_delete,
      auto_delete_data,
      base,
      comment,
      config,
      config_name,
      createPolicyDialogVisible,
      createAuditDialogVisible,
      editPolicyDialogVisible,
      editPolicyFamilyDialogVisible,
      editPolicyFamilyDialogTitle,
      editNvtDetailsDialogVisible,
      editNvtDetailsDialogTitle,
      families,
      family_name,
      hosts_ordering,
      id,
      importDialogVisible,
      in_assets,
      manual_timeout,
      max_checks,
      max_hosts,
      name,
      nvt,
      nvts,
      preference_values,
      scanner_id,
      scanner_preference_values,
      scanners,
      schedule_id,
      schedule_periods,
      source_iface,
      select,
      selected,
      target_id,
      timeout,
      title,
      trend,
    } = this.state;

    return (
      <React.Fragment>
        <EntityComponent
          name="policy"
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
                createAudit: this.openCreateAuditDialog,
                create: this.openCreatePolicyDialog,
                edit: this.openEditPolicyDialog,
                import: this.openImportDialog,
              })}
              {console.log('config=', config)}
              {createAuditDialogVisible && (
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
                              auto_delete={auto_delete}
                              auto_delete_data={auto_delete_data}
                              comment={comment}
                              hosts_ordering={hosts_ordering}
                              id={id}
                              in_assets={in_assets}
                              max_checks={max_checks}
                              max_hosts={max_hosts}
                              name={name}
                              schedule_id={schedule_id}
                              schedule_periods={schedule_periods}
                              schedules={schedules}
                              source_iface={source_iface}
                              target_id={target_id}
                              targets={targets}
                              title={title}
                              onAlertsChange={this.handleAlertsChange}
                              onNewAlertClick={createalert}
                              onNewTargetClick={createtarget}
                              onNewScheduleClick={createschedule}
                              onScheduleChange={this.handleScheduleChange}
                              onTargetChange={this.handleTargetChange}
                              onClose={this.handleCloseCreateAuditDialog}
                              onSave={this.handleSaveAudit}
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
                  scanner_id={scanner_id}
                  scanners={scanners}
                  onClose={this.handleCloseCreatePolicyDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeCreatePolicyDialog());
                  }}
                />
              )}
              {editPolicyDialogVisible && (
                <EditPolicyDialog
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
                  onClose={this.handleCloseEditPolicyDialog}
                  onEditConfigFamilyClick={this.openEditPolicyFamilyDialog}
                  onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeEditPolicyDialog());
                  }}
                />
              )}
            </React.Fragment>
          )}
        </EntityComponent>
        {importDialogVisible && (
          <ImportDialog
            onClose={this.handleCloseImportDialog}
            onSave={this.handleImportPolicy}
          />
        )}
        {editPolicyFamilyDialogVisible && (
          <EditPolicyFamilyDialog
            config={config}
            config_name={config_name}
            family_name={family_name}
            id={id}
            nvts={nvts}
            selected={selected}
            title={editPolicyFamilyDialogTitle}
            onClose={this.handleCloseEditPolicyFamilyDialog}
            onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
            onSave={this.handleSavePolicyFamily}
          />
        )}
        {editNvtDetailsDialogVisible && (
          <EditNvtDetailsDialog
            config={config}
            config_name={config_name}
            family_name={family_name}
            manual_timeout={manual_timeout}
            nvt={nvt}
            preference_values={preference_values}
            timeout={timeout}
            title={editNvtDetailsDialogTitle}
            onClose={this.handleCloseEditNvtDetailsDialog}
            onSave={this.handleSavePolicyNvt}
          />
        )}
      </React.Fragment>
    );
  }
}

PolicyComponent.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.model),
  children: PropTypes.func.isRequired,
  defaultAlertId: PropTypes.id,
  defaultScanConfigId: PropTypes.id,
  defaultScannerId: PropTypes.id,
  defaultScheduleId: PropTypes.id,
  defaultTargetId: PropTypes.id,
  gmp: PropTypes.gmp.isRequired,
  loadAlerts: PropTypes.func.isRequired,
  loadScanners: PropTypes.func.isRequired,
  loadSchedules: PropTypes.func.isRequired,
  loadTargets: PropTypes.func.isRequired,
  schedules: PropTypes.arrayOf(PropTypes.model),
  targets: PropTypes.arrayOf(PropTypes.model),
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

const mapStateToProps = rootState => {
  const alertSel = alertSelector(rootState);
  const userDefaults = getUserSettingsDefaults(rootState);
  const scannersSel = scannerSelector(rootState);
  const scheduleSel = scheduleSelector(rootState);
  const targetSel = targetSelector(rootState);
  return {
    timezone: getTimezone(rootState),
    alerts: alertSel.getEntities(ALL_FILTER),
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
    scanners: scannersSel.getEntities(ALL_FILTER),
    schedules: scheduleSel.getEntities(ALL_FILTER),
    targets: targetSel.getEntities(ALL_FILTER),
  };
};

const mapDispatchToProp = (dispatch, {gmp}) => ({
  loadAlerts: () => dispatch(loadAlerts(gmp)(ALL_FILTER)),
  loadScanners: () => dispatch(loadScanners(gmp)(ALL_FILTER)),
  loadSchedules: () => dispatch(loadSchedules(gmp)(ALL_FILTER)),
  loadTargets: () => dispatch(loadTargets(gmp)(ALL_FILTER)),
  loadUserSettingsDefaults: () => dispatch(loadUserSettingDefaults(gmp)()),
});

export default compose(
  withGmp,
  withCapabilities,
  connect(
    mapStateToProps,
    mapDispatchToProp,
  ),
)(PolicyComponent);
