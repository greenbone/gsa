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
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
} from 'gmp/models/task';

import {
  ospScannersFilter,
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVAS_SCANNER_TYPE,
} from 'gmp/models/scanner';
// import {FULL_AND_FAST_SCAN_CONFIG_ID} from 'gmp/models/scanconfig';

import {
  loadEntities as loadScanConfigs,
  selector as scanConfigsSelector,
} from 'web/store/entities/scanconfigs';

import {
  loadEntities as loadScanners,
  selector as scannerSelector,
} from 'web/store/entities/scanners';

import {
  loadEntities as loadTags,
  selector as tagsSelector,
} from 'web/store/entities/tags';

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
import {UNSET_VALUE} from 'web/utils/render';

import EntityComponent from 'web/entity/component';

import EditConfigFamilyDialog from 'web/pages/scanconfigs/editconfigfamilydialog';
import EditScanConfigDialog from 'web/pages/scanconfigs/editdialog';
import EditNvtDetailsDialog from 'web/pages/scanconfigs/editnvtdetailsdialog';
import AuditDialog from './createauditdialog';
import ImportDialog from 'web/pages/scanconfigs/importdialog';
import ScanConfigDialog from 'web/pages/policies/dialog';

import TargetComponent from 'web/pages/targets/component';

const DEFAULT_MAX_CHECKS = 4;
const DEFAULT_MAX_HOSTS = 20;
const DEFAULT_MIN_QOD = 70;

const get_scanner = (scanners, scanner_id) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scanner_id;
  });
};

class PolicyComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      createConfigDialogVisible: false,
      editConfigDialogVisible: false,
      editConfigFamilyDialogVisible: false,
      editNvtDetailsDialogVisible: false,
      createAuditDialogVisible: false,
      importDialogVisible: false,
    };

    this.handleImportConfig = this.handleImportConfig.bind(this);
    this.handleSaveConfigFamily = this.handleSaveConfigFamily.bind(this);
    this.handleSaveConfigNvt = this.handleSaveConfigNvt.bind(this);
    this.openCreateConfigDialog = this.openCreateConfigDialog.bind(this);
    this.handleCloseCreateConfigDialog = this.handleCloseCreateConfigDialog.bind(
      this,
    );
    this.openEditConfigDialog = this.openEditConfigDialog.bind(this);
    this.handleCloseEditConfigDialog = this.handleCloseEditConfigDialog.bind(
      this,
    );
    this.openEditConfigFamilyDialog = this.openEditConfigFamilyDialog.bind(
      this,
    );
    this.handleCloseEditConfigFamilyDialog = this.handleCloseEditConfigFamilyDialog.bind(
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
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleTargetCreated = this.handleTargetCreated.bind(this);
  }

  handleTargetChange(target_id) {
    this.setState({target_id});
  }

  handleTargetCreated(resp) {
    const {data} = resp;

    this.props.loadTargets();

    this.setState({target_id: data.id});
  }

  openEditConfigDialog(config) {
    Promise.all([
      this.loadEditScanConfigSettings(config),
      this.loadScanners(),
    ]).then(([scanConfigState, scannerState]) => {
      this.setState({
        ...scannerState,
        ...scanConfigState,
        base: config.base,
        editConfigDialogVisible: true,
        title: _('Edit Scan Config {{name}}', {name: shorten(config.name)}),
      });
    });

    this.handleInteraction();
  }

  closeEditConfigDialog() {
    this.setState({editConfigDialogVisible: false});
  }

  handleCloseEditConfigDialog() {
    this.closeEditConfigDialog();
    this.handleInteraction();
  }

  openCreateConfigDialog() {
    this.loadScanners().then(state =>
      this.setState({
        ...state,
        createConfigDialogVisible: true,
      }),
    );

    this.handleInteraction();
  }

  closeCreateConfigDialog() {
    this.setState({createConfigDialogVisible: false});
  }

  handleCloseCreateConfigDialog() {
    this.closeCreateConfigDialog();
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

  openCreateAuditDialog(config) {
    // const {capabilities} = this.props;

    // console.log(config);

    this.props.loadScanConfigs();
    // this.props.loadScanners();
    this.props.loadTargets();
    this.props.loadTags();

    const {
      // defaultAlertId,
      // defaultScanConfigId = FULL_AND_FAST_SCAN_CONFIG_ID,
      // defaultScannerId = OPENVAS_DEFAULT_SCANNER_ID,
      // defaultScheduleId,
      defaultTargetId,
    } = this.props;

    // console.log('defaults', defaultAlertId, defaultScheduleId, defaultTargetId);

    // console.log('default=', defaultScannerId);
    // const alert_ids = isDefined(defaultAlertId) ? [defaultAlertId] : [];

    this.setState({
      createAuditDialogVisible: true,
      // alert_ids,
      // alterable: undefined,
      // apply_overrides: undefined,
      // auto_delete: undefined,
      // auto_delete_data: undefined,
      comment: '',
      // config_id: defaultScanConfigId,
      // config_id: isDefined(config) ? config.id : defaultScanConfigId,
      config_id: isDefined(config) ? config.id : undefined, // must not use default because the scanconfig has to be the policy
      // hosts_ordering: undefined,
      // id: undefined,
      // in_assets: undefined,
      // max_checks: undefined,
      // max_hosts: undefined,
      // min_qod: undefined,
      name: undefined,
      // scanner_id: defaultScannerId,
      // schedule_id: defaultScheduleId,
      // schedule_periods: undefined,
      // source_iface: undefined,
      target_id: defaultTargetId,
      // task: undefined,
      title: _('New Task'),
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

  handleSaveAudit({comment, name, target_id}) {
    const {gmp, defaultAlertId, defaultScheduleId} = this.props;
    const {config_id} = this.state;

    const scanner_id = OPENVAS_DEFAULT_SCANNER_ID;
    const scanners = [
      {
        id: OPENVAS_DEFAULT_SCANNER_ID,
        scannerType: OPENVAS_SCANNER_TYPE,
      },
    ];
    const scanner = get_scanner(scanners, scanner_id);
    const scanner_type = isDefined(scanner) ? scanner.scannerType : undefined;

    const tag = this.props.tags.find(element => {
      return element.name === 'task:compliance';
    });
    const tag_id = tag ? tag.id : undefined;
    const add_tag = YES_VALUE;

    const alert_ids = isDefined(defaultAlertId) ? [defaultAlertId] : [];
    const alterable = NO_VALUE;
    const apply_overrides = YES_VALUE;
    const auto_delete = AUTO_DELETE_NO;
    const auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE;
    const hosts_ordering = HOSTS_ORDERING_SEQUENTIAL;
    const in_assets = YES_VALUE;
    const max_checks = DEFAULT_MAX_CHECKS;
    const max_hosts = DEFAULT_MAX_HOSTS;
    const min_qod = DEFAULT_MIN_QOD;
    const schedule_id = isDefined(defaultScheduleId)
      ? defaultScheduleId
      : UNSET_VALUE;
    const schedule_periods = NO_VALUE;
    const source_iface = '';

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

  openEditConfigFamilyDialog({config, name}) {
    this.loadEditScanConfigFamilySettings(config, name).then(state => {
      this.setState({
        ...state,
        config,
        editConfigFamilyDialogVisible: true,
        editConfigFamilyDialogTitle: _('Edit Scan Config Family {{name}}', {
          name: shorten(name),
        }),
      });
    });
    this.handleInteraction();
  }

  closeEditConfigFamilyDialog() {
    this.setState({editConfigFamilyDialogVisible: false});
  }

  handleCloseEditConfigFamilyDialog() {
    this.closeEditConfigFamilyDialog();
    this.handleInteraction();
  }

  openEditNvtDetailsDialog({config, nvt}) {
    this.loadEditScanConfigNvtSettings(config, nvt).then(state => {
      this.setState({
        ...state,
        config,
        editNvtDetailsDialogVisible: true,
        editNvtDetailsDialogTitle: _('Edit Scan Config NVT {{name}}', {
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

  handleImportConfig(data) {
    const {gmp, onImported, onImportError} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .import(data)
      .then(onImported, onImportError)
      .then(() => this.closeImportDialog());
  }

  handleSaveConfigFamily(data) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigFamily(data)
      .then(() => {
        return this.loadEditScanConfigSettings(data.config);
      })
      .then(state => {
        this.closeEditConfigFamilyDialog();
        this.setState({...state});
      });
  }

  handleSaveConfigNvt(values) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigNvt(values)
      .then(response => {
        // update nvt timeouts in nvt family dialog
        this.loadEditScanConfigFamilySettings(
          values.config,
          values.family_name,
        ).then(state => {
          this.setState({state});
        });

        // update nvt preference values in edit dialog
        this.loadEditScanConfigSettings(values.config).then(state => {
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

  loadEditScanConfigSettings(config) {
    const {gmp} = this.props;

    return gmp.scanconfig.editScanConfigSettings(config).then(response => {
      const {data} = response;
      const {families, scanconfig} = data;
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
    });
  }

  loadEditScanConfigFamilySettings(config, name) {
    const {gmp} = this.props;
    const {select} = this.state;

    return gmp.scanconfig
      .editScanConfigFamilySettings({
        id: config.id,
        family_name: name,
        config_name: config.name,
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

  loadEditScanConfigNvtSettings(config, nvt) {
    const {gmp} = this.props;

    return gmp.scanconfig
      .editScanConfigNvtSettings({
        id: config.id,
        oid: nvt.oid,
        config_name: config.name,
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
          config: data.config,
          config_name: data.config.name,
          family_name: data.nvt.family,
          id: data.config.id,
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
      children,
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
      base,
      comment,
      config,
      config_name,
      createConfigDialogVisible,
      createAuditDialogVisible,
      editConfigDialogVisible,
      editConfigFamilyDialogVisible,
      editConfigFamilyDialogTitle,
      editNvtDetailsDialogVisible,
      editNvtDetailsDialogTitle,
      families,
      family_name,
      id,
      importDialogVisible,
      manual_timeout,
      name,
      nvt,
      nvts,
      preference_values,
      scanner_id,
      scanner_preference_values,
      scanners,
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
          name="scanconfig"
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
                create: this.openCreateConfigDialog,
                edit: this.openEditConfigDialog,
                import: this.openImportDialog,
              })}
              {createAuditDialogVisible && (
                <TargetComponent
                  onCreated={this.handleTargetCreated}
                  onInteraction={onInteraction}
                >
                  {({create: createtarget}) => (
                    <AuditDialog
                      target_id={target_id}
                      targets={targets}
                      onNewTargetClick={createtarget}
                      onTargetChange={this.handleTargetChange}
                      onClose={this.handleCloseCreateAuditDialog}
                      onSave={this.handleSaveAudit}
                    />
                  )}
                </TargetComponent>
              )}
              {createConfigDialogVisible && (
                <ScanConfigDialog
                  scanner_id={scanner_id}
                  scanners={scanners}
                  onClose={this.handleCloseCreateConfigDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeCreateConfigDialog());
                  }}
                />
              )}
              {editConfigDialogVisible && (
                <EditScanConfigDialog
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
                  onClose={this.handleCloseEditConfigDialog}
                  onEditConfigFamilyClick={this.openEditConfigFamilyDialog}
                  onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeEditConfigDialog());
                  }}
                />
              )}
            </React.Fragment>
          )}
        </EntityComponent>
        {importDialogVisible && (
          <ImportDialog
            onClose={this.handleCloseImportDialog}
            onSave={this.handleImportConfig}
          />
        )}
        {editConfigFamilyDialogVisible && (
          <EditConfigFamilyDialog
            config={config}
            config_name={config_name}
            family_name={family_name}
            id={id}
            nvts={nvts}
            selected={selected}
            title={editConfigFamilyDialogTitle}
            onClose={this.handleCloseEditConfigFamilyDialog}
            onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
            onSave={this.handleSaveConfigFamily}
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
            onSave={this.handleSaveConfigNvt}
          />
        )}
      </React.Fragment>
    );
  }
}

PolicyComponent.propTypes = {
  children: PropTypes.func.isRequired,
  defaultAlertId: PropTypes.id,
  defaultScanConfigId: PropTypes.id,
  defaultScannerId: PropTypes.id,
  defaultScheduleId: PropTypes.id,
  defaultTargetId: PropTypes.id,
  gmp: PropTypes.gmp.isRequired,
  loadScanConfigs: PropTypes.func.isRequired,
  loadScanners: PropTypes.func.isRequired,
  loadTags: PropTypes.func.isRequired,
  loadTargets: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.model),
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

const TAGS_FILTER = ALL_FILTER.copy().set('resource_type', 'task');

const mapStateToProps = rootState => {
  const userDefaults = getUserSettingsDefaults(rootState);
  const scanConfigsSel = scanConfigsSelector(rootState);
  const scannersSel = scannerSelector(rootState);
  const tagsSel = tagsSelector(rootState);
  const targetSel = targetSelector(rootState);
  return {
    timezone: getTimezone(rootState),
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
    scanConfigs: scanConfigsSel.getEntities(ALL_FILTER),
    scanners: scannersSel.getEntities(ALL_FILTER),
    tags: tagsSel.getEntities(TAGS_FILTER),
    targets: targetSel.getEntities(ALL_FILTER),
  };
};

const mapDispatchToProp = (dispatch, {gmp}) => ({
  loadScanConfigs: () => dispatch(loadScanConfigs(gmp)(ALL_FILTER)),
  loadScanners: () => dispatch(loadScanners(gmp)(ALL_FILTER)),
  loadTags: () => dispatch(loadTags(gmp)(TAGS_FILTER)),
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
