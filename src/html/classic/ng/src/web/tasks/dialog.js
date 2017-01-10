/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import React from 'react'; // eslint-disable-line max-lines

import {parse_int, for_each, map, is_array, is_defined, is_empty, first,
  includes, autobind, classes, select_save_id, extend} from '../../utils.js';
import _ from '../../locale.js';
import logger from '../../log.js';

import {OSP_SCANNER_TYPE, OPENVAS_SCANNER_TYPE, OSP_SCAN_CONFIG_TYPE,
  OPENVAS_SCAN_CONFIG_TYPE, OPENVAS_DEFAULT_SCANNER_ID, OPENVAS_CONFIG_EMPTY_ID,
  OPENVAS_CONFIG_FULL_AND_FAST_ID,
  SLAVE_SCANNER_TYPE} from '../../gmp/commands/scanners.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';

import Select2 from '../form/select2.js';
import Spinner from '../form/spinner.js';
import FormGroup from '../form/formgroup.js';
import FormItem from '../form/formitem.js';
import Checkbox from '../form/checkbox.js';
import Radio from '../form/radio.js';
import YesNoRadio from '../form/yesnoradio.js';
import TextField from '../form/textfield.js';

import Icon from '../icons/icon.js';

import ScheduleDialog from '../schedules/dialog.js';
import TargetsDialog from '../targets/dialog.js';
import AlertDialog from '../alerts/dialog.js';

const log = logger.getLogger('web.tasks.dialog');

export class TaskDialog extends Dialog {

  constructor(...args) {
    super(...args);

    autobind(this, 'on');
  }

  defaultState() {
    return extend(super.defaultState(), {
      alerts: [],
      alert_ids: [],
      schedules: [],
      targets: [],
      tags: [],
      scanners: [],
      scan_configs: {0: [], 1: []},
      in_assets: 1,
      apply_overrides: 1,
      alterable: 0,
      auto_delete: 'keep',
      auto_delete_data: 5,
      add_tag: 0,
      scanner_type: 2,
      max_checks: 4,
      max_hosts: 20,
      min_qod: 70,
      schedule_periods: 0,
      hosts_ordering: 'sequential',
      name: _('unnamed'),
      schedule_id: 0,
      target_id: 0,
      width: 800,
    });
  }

  getSortedScanConfigs(scan_configs) {
    let sorted_scan_configs = {0: [], 1: []};
    for_each(scan_configs, config => {
      let type = parse_int(config.type);
      if (!is_array(sorted_scan_configs[type])) {
        sorted_scan_configs[type] = [];
      }
      sorted_scan_configs[type].push(config);
    });
    return sorted_scan_configs;
  }

  loadData() {
    let {task} = this.props;
    let {gmp, capabilities} = this.context;

    if (task) {
      log.debug(task);
      gmp.task.editTaskSettings(task).then(settings => {
        let {targets, scan_configs, alerts, scanners, schedules} = settings;

        let sorted_scan_configs = this.getSortedScanConfigs(scan_configs);
        let osp_config_id = select_save_id(
          sorted_scan_configs[OSP_SCAN_CONFIG_TYPE], task.config.id);

        let openvas_config_id =  select_save_id(
          sorted_scan_configs[OPENVAS_SCAN_CONFIG_TYPE], task.config.id,
          OPENVAS_CONFIG_FULL_AND_FAST_ID);

        let schedule_id;
        if (capabilities.mayOp('get_schedules') &&
          !is_empty(task.schedule.id)) {
          schedule_id = task.schedule.id;
        }
        else {
          schedule_id = 0;
        }

        this.setState({
          id: task.id,
          alert_ids: map(task.alerts, alert => alert.id),
          alerts,
          alterable: task.alterable,
          comment: task.comment,
          config_id: task.config.id,
          osp_config_id,
          openvas_config_id,
          name: task.name,
          scan_configs: sorted_scan_configs,
          scanner_id: task.scanner.id,
          scanner_type: task.scanner.type,
          scanners,
          schedule_id,
          schedules,
          target_id: task.isContainer() ? 0 : task.target.id,
          targets,
          task: task,
          visible: true,
        });
      });
    }
    else {
      gmp.task.newTaskSettings().then(settings => {
        let {schedule_id, alert_id, config_id, osp_config_id, target_id,
          targets, scanner_id, scan_configs, alerts, scanners, schedules,
          tags} = settings;

        let sorted_scan_configs = this.getSortedScanConfigs(scan_configs);

        scanner_id = select_save_id(scanners, scanner_id,
          OPENVAS_DEFAULT_SCANNER_ID);

        let scanner = this.getScanner(scanner_id, scanners);

        target_id = select_save_id(targets, target_id);

        schedule_id = select_save_id(schedules, schedule_id, 0);

        alert_id = includes(alerts, alert_id) ? alert_id : undefined;

        let alert_ids = is_defined(alert_id) ? [alert_id] : [];

        osp_config_id = select_save_id(
          sorted_scan_configs[OSP_SCAN_CONFIG_TYPE], osp_config_id);
        config_id = select_save_id(
          sorted_scan_configs[OPENVAS_SCAN_CONFIG_TYPE], config_id,
          OPENVAS_CONFIG_FULL_AND_FAST_ID);

        this.setState({
          alert_ids,
          alerts,
          config_id,
          scanners,
          scanner_id,
          scanner_type: is_defined(scanner) ? scanner.type : undefined,
          osp_config_id,
          openvas_config_id: config_id,
          scan_configs: sorted_scan_configs,
          schedule_id,
          schedules,
          tag_name: first(tags).name,
          tags,
          target_id,
          targets,
          visible: true,
        });
      });
    }
  }

  save() {
    let {gmp} = this.context;


    let promise;
    if (this.state.task) {
      promise = gmp.task.save(this.state);
    }
    else {
      promise = gmp.task.create(this.state);
    }

    return promise.then(() => {
      this.close();
    }, xhr => {
      this.showErrorMessage(xhr.action_result.message);
      throw new Error('Saving task failed. Reason: ' +
        xhr.action_result.message);
    });
  }

  show() {
    this.setState(this.defaultState());
    this.loadData();
  }

  onInAssetChange(value) {
    log.debug('on inasset change', value);
    this.setState({in_assets: value});
  }

  onApplyOverridesChange(value) {
    log.debug('on applyoverrides change', value);
    this.setState({apply_overrides: value});
  }

  onAlterableChange(alterable) {
    log.debug('on alterable change', alterable);
    this.setState({alterable});
  }

  onAutoDeleteChange(auto_delete) {
    log.debug('on autodelete change', auto_delete);
    this.setState({auto_delete});
  }

  onAutoDeleteDataChange(value) {
    log.debug('on autodeletedata change', value);
    this.setState({auto_delete_data: value});
  }

  onAddTagChange(value) {
    log.debug('on tagvalue change', value);
    this.setState({add_tag: value ? 1 : 0});
  }

  onTagValueChange(tag_value) {
    log.debug('on tagvalue change', tag_value);
    this.setState({tag_value});
  }

  onTagNameChange(value) {
    log.debug('on tagname change', value);
    this.setState({tag_name: value});
  }

  onSourceIfaceChange(source_iface) {
    log.debug('on sourceiface change', source_iface);
    this.setState({source_iface});
  }

  onTargetIdChange(value) {
    let {task} = this.state;

    if (task) {
      if (task.isContainer() || !task.isNew()) {
        value = 0;
      }
    }
    log.debug('on targetid change', value);
    this.setState({target_id: value});
  }

  onMinQodChange(value) {
    log.debug('on minqod change', value);
    this.setState({min_qod: value});
  }

  onScannerChange(value) {
    log.debug('on scanner change', value);
    let scanner = this.getScanner(value, this.state.scanners);
    let config_id;
    if (scanner.type === OPENVAS_SCANNER_TYPE ||
      scanner.type === SLAVE_SCANNER_TYPE) {
      config_id = this.state.openvas_config_id;
    }
    else if (scanner.type === OSP_SCANNER_TYPE) {
      config_id = this.state.osp_config_id;
    }
    else {
      config_id = 0;
    }
    this.setState({scanner_id: value, scanner_type: scanner.type, config_id});
  }

  onOpenvasScanConfigChange(value) {
    log.debug('on openvasscanconfig change', value);
    this.setState({config_id: value, openvas_config_id: value});
  }

  onOspScanConfigChange(value) {
    log.debug('on ospscanconfig change', value);
    this.setState({config_id: value, osp_config_id: value});
  }

  onScheduleChange(value) {
    log.debug('on schedule change', value);
    this.setState({schedule_id: value});
  }

  onSchedulePeriodsChange(value) {
    log.debug('on schedule periods change', value);
    this.setState({schedule_periods: value ? 1 : 0});
  }

  onHostOrderingChange(value) {
    log.debug('on hostordering change', value);
    this.setState({hosts_ordering: value});
  }

  onMaxChecksChange(value) {
    log.debug('on maxchecks change', value);
    this.setState({max_checks: value});
  }

  onMaxHostsChange(value) {
    log.debug('on maxhosts change', value);
    this.setState({max_hosts: value});
  }

  onNameChange(name) {
    log.debug('on name change', name);
    this.setState({name});
  }

  onCommentChange(comment) {
    log.debug('on comment change', comment);
    this.setState({comment: comment});
  }

  onAlertIdsChange(value) {
    log.debug('on alertids change', value);
    this.setState({alert_ids: value});
  }

  onAddNewSchedule(schedule) {
    let {schedules} = this.state;

    schedules.push(schedule);
    this.setState({schedules, schedule_id: schedule.id});
  }

  onAddNewTarget(target) {
    let {targets} = this.state;

    targets.push(target);
    log.debug('adding target to task dialog', target, targets);
    this.setState({targets, target_id: target.id});
  }

  onAddNewAlert(alert) {
    let {alerts, alert_ids} = this.state;

    alerts.push(alert);
    alert_ids.push(alert.id);
    log.debug('adding alert to task dialog', alert, alerts);
    this.setState({alerts, alert_ids});
  }

  getScanner(scanner_id, scanners) {
    return scanners.find(sc => {
      return sc.id === scanner_id;
    });
  }

  renderContent() {
    let {task, targets, schedules, tags, scanners, scan_configs, in_assets,
      apply_overrides, alterable, auto_delete, auto_delete_data, add_tag,
      max_checks, max_hosts, schedule_id, target_id, source_iface, tag_name,
      tag_value, min_qod, schedule_periods, hosts_ordering, comment, name,
      alerts, alert_ids, scanner_id, openvas_config_id, osp_config_id,
    } = this.state;
    let {capabilities} = this.context;

    let scanner = this.getScanner(scanner_id, scanners);

    let is_osp_scanner = is_defined(scanner) &&
      scanner.type === OSP_SCANNER_TYPE;

    let use_openvas_scan_config = is_defined(scanner) &&
      (scanner.type === OPENVAS_SCANNER_TYPE ||
        scanner.type === SLAVE_SCANNER_TYPE);

    let tag_opts = tags.map(tag => {
      return (
        <option key={tag.name} value={tag.name}>
          {tag.name}
        </option>
      );
    });

    let target_opts = this.renderOptions(targets, target_id);

    let schedule_opts = this.renderOptions(schedules, schedule_id, 0);

    let scanner_opts = scanner && this.renderOptions(scanners, scanner.id);

    let osp_scan_config_opts = is_osp_scanner && this.renderOptions(
      scan_configs[OSP_SCAN_CONFIG_TYPE], osp_config_id);

    let openvas_scan_config_opts = use_openvas_scan_config &&
      this.renderOptions(
        scan_configs[OPENVAS_SCAN_CONFIG_TYPE].filter(config => {
          // Skip the "empty" config
          return config.id !== OPENVAS_CONFIG_EMPTY_ID;
        }), openvas_config_id);

    let alert_opts = this.renderOptions(alerts, alert_ids);

    let change_task = task ? task.isNew() : true;

    return (
      <Layout flex="column">
        <FormGroup title={_('Name')} flex>
          <TextField name="name"
            value={name} size="30"
            onChange={this.onNameChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')} flex>
          <TextField name="comment" value={comment}
            size="30" maxLength="400"
            onChange={this.onCommentChange}/>
        </FormGroup>

        <FormGroup title={_('Scan Targets')} flex>
          <FormItem>
            <Select2 name="target_id" disabled={!change_task}
              onChange={this.onTargetIdChange} value={target_id}>
              {target_opts}
            </Select2>
          </FormItem>
          {change_task &&
            <FormItem>
              <Icon img="new.svg"
                onClick={() => this.targets_dialog.show()}
                title={_('Create a new target')}/>
            </FormItem>
          }
        </FormGroup>

        <FormGroup condition={capabilities.mayOp('get_alerts')}
          title={_('Alerts')} flex>
          <FormItem>
            <Select2 name="alert_ids" multiple="multiple" id="alert_ids"
              onChange={this.onAlertIdsChange} value={alert_ids}>
              {alert_opts}
            </Select2>
          </FormItem>
          <FormItem>
            <Icon title={_('Create a new alert')} img="new.svg"
              onClick={() => {this.alert_dialog.show();}}/>
          </FormItem>
        </FormGroup>

        <FormGroup condition={capabilities.mayOp('get_schedules')}
          title={_('Schedule')} flex>
          <FormItem>
            <Select2 name="schedule_id" value={schedule_id}
              onChange={this.onScheduleChange}>
              {schedule_opts}
            </Select2>
          </FormItem>
          <FormItem>
            <Checkbox name="schedule_periods"
              checked={schedule_periods === 1}
              onChange={this.onSchedulePeriodsChange}
              title={_('Once')}/>
          </FormItem>
          <FormItem>
            <Icon img="new.svg" title={_('Create a new schedule')}
              onClick={() => { this.schedule_dialog.show(); }}/>
          </FormItem>
        </FormGroup>

        <FormGroup title={_('Add results to Assets')} flex>
          <YesNoRadio value={in_assets} onChange={this.onInAssetChange} />
        </FormGroup>

        <Layout flex="column" className={classes('offset-container offset-2',
          in_assets === 1 ? '' : 'disabled')}>
          <FormGroup title={_('Apply Overrides')} flex>
            <YesNoRadio value={apply_overrides} disabled={in_assets !== 1}
              onChange={this.onApplyOverridesChange}/>
          </FormGroup>

          <FormGroup title={_('Min QoD')} flex>
            <FormItem>
              <Spinner name="min_qod" value={min_qod} size="4"
                onChange={this.onMinQodChange}
                disabled={in_assets !== 1} type="float" min="0" max="100"/>
            </FormItem>
            <FormItem>%</FormItem>
          </FormGroup>
        </Layout>

        <FormGroup title={_('Alterable Task')} condition={change_task} flex>
          <YesNoRadio value={alterable} onChange={this.onAlterableChange}/>
        </FormGroup>

        <FormGroup title={_('Auto Delete Reports')} flex>
          <Radio title={_('Do not automatically delete reports')}
            name="auto_delete" value="no"
            onChange={this.onAutoDeleteChange}
            checked={auto_delete !== 'keep'}/>
          <Radio name="auto_delete" value="keep"
            onChange={this.onAutoDeleteChange}
            checked={auto_delete === 'keep'}>
            {_('Automatically delete oldest reports but always' +
              ' keep newest ')}
            <FormItem>
              <Spinner type="int" min="0"
                name="auto_delete_data"
                value={auto_delete_data}
                disabled={auto_delete !== 'keep'}
                onChange={this.onAutoDeleteDataChange}/>
            </FormItem>
            {_(' reports')}
          </Radio>
        </FormGroup>

        <FormGroup title={_('Scanner')} flex>
          <Select2 name="scanner_id" value={scanner_id}
            disabled={!change_task}
            onChange={this.onScannerChange}>
            {scanner_opts}
          </Select2>
        </FormGroup>

        {use_openvas_scan_config &&
          <Layout flex="column"
            className="form-group offset-container offset-2">
            <FormGroup titleSize="4" title={_('Scan Config')} flex>
              <Select2 name="config_id" value={openvas_config_id}
                disabled={!change_task}
                onChange={this.onOpenvasScanConfigChange}>
                {openvas_scan_config_opts}
              </Select2>
            </FormGroup>
            <FormGroup flex titleSize="4" title={_('Network Source Interface')}>
              <FormItem>
                <TextField name="source_iface"
                  onChange={this.onSourceIfaceChange}
                  value={source_iface}/>
              </FormItem>
            </FormGroup>
            <FormGroup flex titleSize="4" title={_('Order for target hosts')}>
              <Select2 name="hosts_ordering" value={hosts_ordering}
                onChange={this.onHostOrderingChange}>
                <option value="sequential">
                  {_('Sequential')}
                </option>
                <option value="random">
                  {_('Random')}
                </option>
                <option value="reverse">
                  {_('Reverse')}
                </option>
              </Select2>
            </FormGroup>
            <FormGroup titleSize="4" flex
              title={_('Maximum concurrently executed NVTs per host')}>
              <Spinner name="max_checks" value={max_checks}
                min="0" size="10" maxLength="10"
                onChange={this.onMaxChecksChange}/>
            </FormGroup>
            <FormGroup titleSize="4" flex
              title={_('Maximum concurrently scanned hosts')}>
              <Spinner name="max_hosts" value={max_hosts}
                type="int" min="0"
                size="10" maxLength="10"
                onChange={this.onMaxHostsChange}/>
            </FormGroup>
          </Layout>
        }

        {is_osp_scanner &&
          <Layout flex="column"
            className="form-group offset-container offset-2">
            <FormGroup titleSize="4" title={_('Scan Config')} flex>
              <Select2 name="config_id" value={osp_config_id}
                onChange={this.onOspScanConfigChange}>
                {osp_scan_config_opts}
              </Select2>
            </FormGroup>
          </Layout>
        }

        {capabilities.mayOp('get_tags') && capabilities.mayOp('create_task') &&
          tags.length > 0 &&
          <h3>{_('Tag')}</h3>
        }
        <FormGroup condition={capabilities.mayOp('get_tags') &&
          capabilities.mayOp('create_task') && tags.length > 0} flex>
          <FormItem>
            <Checkbox name="add_tag"
              onChange={this.onAddTagChange}
              checked={add_tag === 1} title={_('Add Tag:')}/>
          </FormItem>
          <FormItem>
            <Select2 name="tag_name" onChange={this.onTagNameChange}
              value={tag_name}>
              {tag_opts}
            </Select2>
          </FormItem>
          <FormItem>
            {_('with Value')}
          </FormItem>
          <FormItem>
            <TextField name="tag_value"
              value={tag_value}
              onChange={this.onTagValueChange}/>
          </FormItem>
        </FormGroup>

      </Layout>
    );
  }

  renderSubDialogs() {
    return (
      <span>
        <ScheduleDialog title={_('Create new Schedule')}
          ref={ref => this.schedule_dialog = ref}
          onSave={this.onAddNewSchedule}/>
        <TargetsDialog title={_('Create new Target')}
          ref={ref => this.targets_dialog = ref} onSave={this.onAddNewTarget}/>
        <AlertDialog title={_('Create new Alert')}
          ref={ref => this.alert_dialog = ref} onSave={this.onAddNewAlert}/>
      </span>
    );
  }
}

TaskDialog.propTypes = {
  task: React.PropTypes.object,
};

TaskDialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default TaskDialog;

// vim: set ts=2 sw=2 tw=80:
