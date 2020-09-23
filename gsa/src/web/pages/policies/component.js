/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import 'core-js/features/promise/finally';

import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {ALL_FILTER} from 'gmp/models/filter';
import {DEFAULT_MIN_QOD} from 'gmp/models/audit';

import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {selectSaveId} from 'gmp/utils/id';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import {
  ospScannersFilter,
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
  GMP_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
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

import AlertComponent from 'web/pages/alerts/component';

import AuditDialog from 'web/pages/audits/dialog';

import {createSelectedNvts} from 'web/pages/scanconfigs/component';
import EditPolicyFamilyDialog from 'web/pages/scanconfigs/editconfigfamilydialog';
import EditPolicyDialog from 'web/pages/scanconfigs/editdialog';
import EditNvtDetailsDialog from 'web/pages/scanconfigs/editnvtdetailsdialog';
import ImportDialog from 'web/pages/scanconfigs/importdialog';

import ScheduleComponent from 'web/pages/schedules/component';

import TargetComponent from 'web/pages/targets/component';

import PolicyDialog from './dialog';

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
    this.handleScannerChange = this.handleScannerChange.bind(this);
    this.handleSavePolicy = this.handleSavePolicy.bind(this);
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
    this.setState({
      policy, // put policy from list with reduced data in state
      editPolicyDialogVisible: true,
      title: _('Edit Policy {{name}}', {name: shorten(policy.name)}),
    });

    this.loadEditPolicySettings(policy.id);

    this.loadScanners();

    this.handleInteraction();
  }

  closeEditPolicyDialog() {
    this.setState({
      editPolicyDialogVisible: false,
      policy: undefined,
      families: undefined,
    });
  }

  handleCloseEditPolicyDialog() {
    this.closeEditPolicyDialog();
    this.handleInteraction();
  }

  handleSavePolicy(d) {
    const {gmp} = this.props;
    const {policy} = this.state;

    this.handleInteraction();
    const {name, comment, id} = d;
    let saveData = d;
    if (policy.isInUse()) {
      saveData = {name, comment, id};
    }

    return gmp.policy.save(saveData).then(() => this.closeEditPolicyDialog());
  }

  openCreatePolicyDialog() {
    this.loadScanners();

    this.setState({
      createPolicyDialogVisible: true,
    });

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
    this.props.loadScanners();
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
    scannerId = OPENVAS_DEFAULT_SCANNER_ID,
    scannerType = OPENVAS_SCANNER_TYPE,
    scheduleId,
    schedulePeriods,
    sourceIface,
    targetId,
  }) {
    const {gmp} = this.props;
    const {policyId} = this.state;

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

  openEditPolicyFamilyDialog(familyName) {
    this.handleInteraction();

    this.setState({
      editPolicyFamilyDialogVisible: true,
      editPolicyFamilyDialogTitle: _('Edit Policy Family {{name}}', {
        name: shorten(familyName),
      }),
      familyName,
    });

    return this.loadFamily(familyName);
  }

  loadFamily(familyName, silent = false) {
    const {gmp} = this.props;
    const {policy} = this.state;

    this.setState(({isLoadingFamily}) => ({
      isLoadingFamily: silent ? isLoadingFamily : true,
    }));

    return gmp.policy
      .editPolicyFamilySettings({
        id: policy.id,
        familyName,
      })
      .then(response => {
        const {data} = response;
        const {nvts} = data;

        const policyFamily = policy.families[familyName];
        const selected = createSelectedNvts(policyFamily, nvts);

        this.setState({
          familyNvts: data.nvts,
          familySelectedNvts: selected,
          isLoadingFamily: false,
        });
      })
      .catch(error => {
        this.setState({
          isLoadingFamily: false,
          selected: {}, // ensure selected is defined to stop loading indicator
        });
        throw error;
      });
  }

  closeEditPolicyFamilyDialog() {
    this.setState({
      editPolicyFamilyDialogVisible: false,
      familyName: undefined,
      selected: undefined,
    });
  }

  handleCloseEditPolicyFamilyDialog() {
    this.closeEditPolicyFamilyDialog();
    this.handleInteraction();
  }

  openEditNvtDetailsDialog(nvtOid) {
    this.handleInteraction();

    this.setState({
      editNvtDetailsDialogVisible: true,
      editNvtDetailsDialogTitle: _('Edit Policy NVT {{nvtOid}}', {nvtOid}),
    });

    this.loadNvt(nvtOid);
  }

  loadNvt(nvtOid) {
    const {gmp} = this.props;
    const {policy} = this.state;

    this.setState({
      isLoadingNvt: true,
    });

    return gmp.nvt
      .getConfigNvt({
        configId: policy.id,
        oid: nvtOid,
      })
      .then(response => {
        const {data: loadedNvt} = response;

        this.setState({
          nvt: loadedNvt,
          editNvtDetailsDialogTitle: _('Edit Policy NVT {{name}}', {
            name: shorten(loadedNvt.name),
          }),
        });
      })
      .finally(() => {
        this.setState({
          isLoadingNvt: false,
        });
      });
  }

  closeEditNvtDetailsDialog() {
    this.setState({
      editNvtDetailsDialogVisible: false,
      nvt: undefined,
    });
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

  handleSavePolicyFamily({familyName, configId, selected}) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.policy
      .savePolicyFamily({
        id: configId,
        familyName,
        selected,
      })
      .then(() => this.loadEditPolicySettings(configId, true))
      .then(() => {
        this.closeEditPolicyFamilyDialog();
      });
  }

  handleSavePolicyNvt({
    configId,
    timeout,
    useDefaultTimeout,
    nvtOid,
    preferenceValues,
  }) {
    const {gmp} = this.props;
    const {editPolicyFamilyDialogVisible, familyName} = this.state;

    this.handleInteraction();

    return gmp.policy
      .savePolicyNvt({
        id: configId,
        timeout: useDefaultTimeout === '1' ? undefined : timeout,
        oid: nvtOid,
        preferenceValues,
      })
      .then(() => {
        let promise;

        const policyPromise = this.loadPolicy(configId, true);

        if (editPolicyFamilyDialogVisible) {
          promise = this.loadFamily(familyName, true);
        } else {
          promise = policyPromise;
        }

        return promise;
      })
      .then(() => {
        this.closeEditNvtDetailsDialog();
      });
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  loadScanners() {
    const {gmp} = this.props;

    this.setState({isLoadingScanners: true});

    return gmp.scanners
      .getAll()
      .then(response => {
        let {data: scanners} = response;
        scanners = scanners.filter(ospScannersFilter);
        return {
          scanners,
          scannerId: selectSaveId(scanners),
          isLoadingScanners: false,
        };
      })
      .finally(() => {
        this.setState({
          isLoadingScanners: false,
        });
      });
  }

  loadPolicy(policyId, silent = false) {
    const {gmp} = this.props;

    this.setState(({isLoadingConfig}) => ({
      isLoadingPolicy: silent ? isLoadingConfig : true,
    }));

    return gmp.policy
      .get({id: policyId})
      .then(response => {
        this.setState({
          policy: response.data,
        });
      })
      .finally(() => {
        this.setState({
          isLoadingPolicy: false,
        });
      });
  }

  loadFamilies(silent = false) {
    const {gmp} = this.props;

    this.setState(({isLoadingFamilies}) => ({
      isLoadingFamilies: silent ? isLoadingFamilies : true,
    }));

    return gmp.nvtfamilies
      .get()
      .then(familiesResponse => {
        this.setState({
          families: familiesResponse.data,
        });
      })
      .finally(() => {
        this.setState({
          isLoadingFamilies: false,
        });
      });
  }

  loadEditPolicySettings(policyId, silent) {
    return Promise.all([
      this.loadPolicy(policyId, silent),
      this.loadFamilies(silent),
    ]);
  }

  handleScannerChange(scannerId) {
    this.setState({scannerId});
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
      comment,
      createPolicyDialogVisible,
      createAuditDialogVisible,
      editPolicyDialogVisible,
      editPolicyFamilyDialogVisible,
      editPolicyFamilyDialogTitle,
      editNvtDetailsDialogVisible,
      editNvtDetailsDialogTitle,
      families,
      familyName,
      familyNvts,
      familySelectedNvts,
      hostsOrdering,
      id,
      importDialogVisible,
      in_assets,
      isLoadingFamilies,
      isLoadingFamily,
      isLoadingNvt,
      isLoadingPolicy,
      isLoadingScanners,
      maxChecks,
      maxHosts,
      name,
      nvt,
      policy,
      policyName,
      policyId,
      scannerId,
      scanners,
      scheduleId,
      schedulePeriods,
      sourceIface,
      targetId,
      title,
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
                              isLoadingScanners={this.props.isLoadingScanners}
                              maxChecks={maxChecks}
                              maxHosts={maxHosts}
                              name={name}
                              policies={[{name: policyName, id: policyId}]}
                              policyId={policyId}
                              scannerId={scannerId}
                              scanners={this.props.scanners}
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
                              onScannerChange={this.handleScannerChange}
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
                  onClose={this.handleCloseCreatePolicyDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeCreatePolicyDialog());
                  }}
                />
              )}
              {editPolicyDialogVisible && (
                <EditPolicyDialog
                  comment={policy.comment}
                  configFamilies={policy.families}
                  configId={policy.id}
                  configIsInUse={policy.isInUse()}
                  configType={policy.policy_type}
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
                  onClose={this.handleCloseEditPolicyDialog}
                  onEditConfigFamilyClick={this.openEditPolicyFamilyDialog}
                  onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
                  onSave={this.handleSavePolicy}
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
            configId={policy.id}
            configNameLabel={_('Policy')}
            configName={policy.name}
            familyName={familyName}
            isLoadingFamily={isLoadingFamily}
            nvts={familyNvts}
            selected={familySelectedNvts}
            title={editPolicyFamilyDialogTitle}
            onClose={this.handleCloseEditPolicyFamilyDialog}
            onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
            onSave={this.handleSavePolicyFamily}
          />
        )}
        {editNvtDetailsDialogVisible && (
          <EditNvtDetailsDialog
            configId={policy.id}
            configName={policy.name}
            configNameLabel={_('Policy')}
            defaultTimeout={isDefined(nvt) ? nvt.defaultTimeout : undefined}
            isLoadingNvt={isLoadingNvt}
            nvtAffectedSoftware={isDefined(nvt) ? nvt.tags.affected : undefined}
            nvtCvssVector={
              isDefined(nvt) ? nvt.tags.cvss_base_vector : undefined
            }
            nvtFamily={isDefined(nvt) ? nvt.family : undefined}
            nvtName={isDefined(nvt) ? nvt.name : undefined}
            nvtLastModified={isDefined(nvt) ? nvt.modificationTime : undefined}
            nvtOid={isDefined(nvt) ? nvt.oid : undefined}
            nvtSeverity={isDefined(nvt) ? nvt.severity : undefined}
            nvtSummary={isDefined(nvt) ? nvt.tags.summary : undefined}
            preferences={isDefined(nvt) ? nvt.preferences : undefined}
            timeout={isDefined(nvt) ? nvt.timeout : undefined}
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
  isLoadingScanners: PropTypes.bool,
  loadAlerts: PropTypes.func.isRequired,
  loadScanners: PropTypes.func.isRequired,
  loadSchedules: PropTypes.func.isRequired,
  loadTargets: PropTypes.func.isRequired,
  scanners: PropTypes.arrayOf(PropTypes.model),
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

  const scannerList = scannersSel.getEntities(ALL_FILTER);
  const scanners = isDefined(scannerList)
    ? scannerList.filter(
        scanner =>
          scanner.scannerType === OPENVAS_SCANNER_TYPE ||
          scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE ||
          scanner.scannerType === GMP_SCANNER_TYPE,
      )
    : undefined;

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
    isLoadingScanners: scannersSel.isLoadingAllEntities(ALL_FILTER),
    scanners,
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
  connect(mapStateToProps, mapDispatchToProp),
)(PolicyComponent);
