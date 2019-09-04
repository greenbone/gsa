/* Copyright (C) 2019 Greenbone Networks GmbH
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
import {DEFAULT_MIN_QOD} from 'gmp/models/audit';

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

import EditPolicyFamilyDialog from 'web/pages/scanconfigs/editconfigfamilydialog';
import EditPolicyDialog from 'web/pages/scanconfigs/editdialog';
import EditNvtDetailsDialog from 'web/pages/scanconfigs/editnvtdetailsdialog';
import AuditDialog from 'web/pages/audits/dialog';
import ImportDialog from 'web/pages/scanconfigs/importdialog';
import PolicyDialog from 'web/pages/policies/dialog';

import ScheduleComponent from 'web/pages/schedules/component';
import AlertComponent from 'web/pages/alerts/component';
import TargetComponent from 'web/pages/targets/component';

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
    this.handleAlertCreated = this.handleAlertCreated.bind(this);
    this.handleScheduleCreated = this.handleScheduleCreated.bind(this);
    this.handleTargetCreated = this.handleTargetCreated.bind(this);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, name) {
    this.setState({[name]: value});
  }

  handleAlertCreated(resp) {
    const {data} = resp;

    this.props.loadAlerts();

    this.setState(({alertIds}) => ({alertIds: [data.id, ...alertIds]}));
  }

  handleScheduleCreated(resp) {
    const {data} = resp;

    this.props.loadSchedules();

    this.setState({scheduleId: data.id});
  }

  handleTargetCreated(resp) {
    const {data} = resp;

    this.props.loadTargets();

    this.setState({targetId: data.id});
  }

  openEditPolicyDialog(policy) {
    Promise.all([
      this.loadEditPolicySettings(policy),
      this.loadScanners(),
    ]).then(([policyState, scannerState]) => {
      this.setState({
        ...scannerState,
        ...policyState,
        base: policy.base,
        editPolicyDialogVisible: true,
        title: _('Edit Policy {{name}}', {name: shorten(policy.name)}),
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

    const {defaultAlertId, defaultScheduleId, defaultTargetId} = this.props;

    const alertIds = isDefined(defaultAlertId) ? [defaultAlertId] : [];

    this.setState({
      createAuditDialogVisible: true,
      alertIds,
      alterable: undefined,
      auto_delete: undefined,
      auto_delete_data: undefined,
      comment: '',
      policyId: isDefined(policy) ? policy.id : undefined,
      policyName: policy.name,
      hostsOrdering: undefined,
      id: undefined,
      in_assets: undefined,
      maxChecks: undefined,
      maxHosts: undefined,
      name: undefined,
      scheduleId: defaultScheduleId,
      schedulePeriods: undefined,
      sourceIface: undefined,
      targetId: defaultTargetId,
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
    scheduleId,
    schedulePeriods,
    sourceIface,
    targetId,
  }) {
    const {gmp} = this.props;
    const {policyId} = this.state;

    const scannerId = OPENVAS_DEFAULT_SCANNER_ID;
    const scannerType = OPENVAS_SCANNER_TYPE;

    const tagId = undefined;
    const addTag = NO_VALUE;

    const applyOverrides = YES_VALUE;
    const minQod = DEFAULT_MIN_QOD;

    this.handleInteraction();

    const {onCreated, onCreateError} = this.props;
    return gmp.audit
      .create({
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
        sourceIface,
        tagId,
        targetId,
      })
      .then(onCreated, onCreateError)
      .then(() => this.closeCreateAuditDialog());
  }

  openEditPolicyFamilyDialog({config: policy, name}) {
    this.loadEditPolicyFamilySettings(policy, name).then(state => {
      this.setState({
        ...state,
        policy: policy,
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

  openEditNvtDetailsDialog({config: policy, nvt}) {
    this.loadEditPolicyNvtSettings(policy, nvt).then(state => {
      this.setState({
        ...state,
        policy: policy,
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
    const policy = data.config;

    this.handleInteraction();

    return gmp.policy
      .savePolicyFamily(data)
      .then(() => {
        return this.loadEditPolicySettings(policy);
      })
      .then(state => {
        this.closeEditPolicyFamilyDialog();
        this.setState({...state});
      });
  }

  handleSavePolicyNvt(values) {
    const {gmp} = this.props;
    const {config: policy, family_name} = values;

    this.handleInteraction();

    return gmp.policy
      .savePolicyNvt(values)
      .then(response => {
        // update nvt timeouts in nvt family dialog
        this.loadEditPolicyFamilySettings(policy, family_name).then(state => {
          this.setState({state});
        });

        // update nvt preference values in edit dialog
        this.loadEditPolicySettings(policy).then(state => {
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

  loadEditPolicySettings(policy) {
    const {gmp} = this.props;

    return Promise.all([gmp.policy.get(policy), gmp.nvtfamilies.get()]).then(
      ([policyResponse, familiesResponse]) => {
        const {data: responsePolicy} = policyResponse;
        const {data: families} = familiesResponse;
        const trend = {};
        const select = {};

        forEach(families, family => {
          const {name} = family;
          const policyFamily = responsePolicy.families[name];

          if (isDefined(policyFamily)) {
            trend[name] = parseYesNo(policyFamily.trend);
            select[name] =
              policyFamily.nvts.count === family.max ? YES_VALUE : NO_VALUE;
          } else {
            trend[name] = NO_VALUE;
            select[name] = NO_VALUE;
          }
        });

        const scanner_preference_values = {};

        forEach(responsePolicy.preferences.scanner, preference => {
          scanner_preference_values[preference.name] = preference.value;
        });

        const state = {
          comment: responsePolicy.comment,
          id: policy.id,
          name: policy.name,
          policy: responsePolicy,
          families,
          trend,
          select,
          scanner_preference_values,
        };
        return state;
      },
    );
  }

  loadEditPolicyFamilySettings(policy, name) {
    const {gmp} = this.props;
    const {select} = this.state;

    return gmp.policy
      .editPolicyFamilySettings({
        id: policy.id,
        family_name: name,
        policy_name: policy.name,
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
          policy: data.policy,
          policyName: policy.name,
          family_name: name,
          id: policy.id,
          nvts: data.nvts,
          selected,
        };

        return state;
      });
  }

  loadEditPolicyNvtSettings(policy, nvt) {
    const {gmp} = this.props;

    return gmp.nvt
      .getConfigNvt({
        configId: policy.id,
        oid: nvt.oid,
      })
      .then(response => {
        const {data: loadedNvt} = response;
        const preference_values = {};

        forEach(loadedNvt.preferences, pref => {
          let {id, value, type} = pref;

          if (type === 'password' || type === 'file') {
            value = undefined;
          }

          preference_values[pref.name] = {
            id,
            value,
            type,
          };
        });

        const state = {
          family_name: loadedNvt.family,
          oid: loadedNvt.oid,
          manual_timeout: loadedNvt.timeout,
          nvt: loadedNvt,
          nvt_name: loadedNvt.name,
          preference_values,
          timeout: isEmpty(loadedNvt.timeout) ? '0' : '1',
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
      alertIds,
      alterable,
      auto_delete,
      auto_delete_data,
      base,
      comment,
      policy,
      policyName,
      policyId,
      createPolicyDialogVisible,
      createAuditDialogVisible,
      editPolicyDialogVisible,
      editPolicyFamilyDialogVisible,
      editPolicyFamilyDialogTitle,
      editNvtDetailsDialogVisible,
      editNvtDetailsDialogTitle,
      families,
      family_name,
      hostsOrdering,
      id,
      importDialogVisible,
      in_assets,
      manual_timeout,
      maxChecks,
      maxHosts,
      name,
      nvt,
      nvts,
      preference_values,
      scanner_id,
      scanner_preference_values,
      scanners,
      scheduleId,
      schedulePeriods,
      sourceIface,
      select,
      selected,
      targetId,
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
                              alertIds={alertIds}
                              alterable={alterable}
                              auto_delete={auto_delete}
                              auto_delete_data={auto_delete_data}
                              comment={comment}
                              fromPolicy={true}
                              hostsOrdering={hostsOrdering}
                              id={id}
                              in_assets={in_assets}
                              maxChecks={maxChecks}
                              maxHosts={maxHosts}
                              name={name}
                              policies={[{name: policyName, id: policyId}]}
                              policyId={policyId}
                              scheduleId={scheduleId}
                              schedulePeriods={schedulePeriods}
                              schedules={schedules}
                              sourceIface={sourceIface}
                              targetId={targetId}
                              targets={targets}
                              title={title}
                              onChange={this.handleChange}
                              onNewAlertClick={createalert}
                              onNewTargetClick={createtarget}
                              onNewScheduleClick={createschedule}
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
                  config={policy}
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
            title={_('Import Policy')}
            text={_('Import XML policy')}
            onClose={this.handleCloseImportDialog}
            onSave={this.handleImportPolicy}
          />
        )}
        {editPolicyFamilyDialogVisible && (
          <EditPolicyFamilyDialog
            config={policy}
            configNameLabel={_('Policy')}
            config_name={policyName}
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
            config={policy}
            configNameLabel={_('Policy')}
            config_name={policyName}
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
