/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import logger from 'gmp/log.js';
import {is_defined, map, select_save_id} from 'gmp/utils';

import {
  NO_VALUE,
  YES_VALUE,
} from 'gmp/parser.js';

import {AUTO_DELETE_KEEP, AUTO_DELETE_DEFAULT_VALUE} from 'gmp/models/task.js';

import {
  OPENVAS_SCANNER_TYPE,
  OSP_SCANNER_TYPE,
  SLAVE_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
  CVE_SCANNER_TYPE,
} from 'gmp/models/scanner.js';

import {
  EMPTY_SCAN_CONFIG_ID,
  FULL_AND_FAST_SCAN_CONFIG_ID,
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from 'gmp/models/scanconfig.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities';
import {render_select_items, UNSET_VALUE} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import MultiSelect from '../../components/form/multiselect.js';
import Select from '../../components/form/select.js';
import Spinner from '../../components/form/spinner.js';
import FormGroup from '../../components/form/formgroup.js';
import Checkbox from '../../components/form/checkbox.js';
import YesNoRadio from '../../components/form/yesnoradio.js';
import Text from '../../components/form/text.js';
import TextField from '../../components/form/textfield.js';

import NewIcon from '../../components/icon/newicon.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import AddResultsToAssetsGroup from './addresultstoassetsgroup.js';
import AutoDeleteReportsGroup from './autodeletereportsgroup.js';

const log = logger.getLogger('web.tasks.dialog');

const get_scanner = (scanners, scanner_id) => {
  if (!is_defined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scanner_id;
  });
};

class ScannerSelect extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleScannerChange = this.handleScannerChange.bind(this);
  }

  handleScannerChange(value, name) {
    const {scanners, scanConfigs, onChange} = this.props;
    let config_id;

    const scanner = get_scanner(scanners, value);
    const scanner_type = is_defined(scanner) ? scanner.scanner_type : undefined;

    if (scanner_type === OPENVAS_SCANNER_TYPE ||
      scanner_type === SLAVE_SCANNER_TYPE) {
      config_id = select_save_id(scanConfigs[OPENVAS_SCAN_CONFIG_TYPE],
        FULL_AND_FAST_SCAN_CONFIG_ID);
    }
    else if (scanner_type === OSP_SCANNER_TYPE) {
      config_id = select_save_id(scanConfigs[OSP_SCAN_CONFIG_TYPE],
        UNSET_VALUE);
    }
    else {
      config_id = UNSET_VALUE;
    }

    log.debug('on scanner change', value, config_id, scanner);

    if (onChange) {
      onChange(config_id, 'config_id');
      onChange(value, 'scanner_id');
      onChange(scanner_type, 'scanner_type');
    }
  }

  render() {
    const {
      changeTask,
      scannerId,
      scanners,
    } = this.props;
    return (
      <FormGroup title={_('Scanner')}>
        <Select
          name="scanner_id"
          value={scannerId}
          disabled={!changeTask}
          items={render_select_items(scanners)}
          onChange={this.handleScannerChange}
        />
      </FormGroup>
    );
  }
}

ScannerSelect.propTypes = {
  changeTask: PropTypes.bool.isRequired,
  scanConfigs: PropTypes.object.isRequired,
  scannerId: PropTypes.id.isRequired,
  scanners: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

const DEFAULT_MAX_CHECKS = 4;
const DEFAULT_MAX_HOSTS = 20;
const DEFAULT_MIN_QOD = 70;
const DEFAULT_HOSTS_ORDERING = 'sequential';

const TaskDialog = ({
  add_tag = NO_VALUE,
  alert_ids = [],
  alerts = [],
  alterable = NO_VALUE,
  apply_overrides = YES_VALUE,
  auto_delete = AUTO_DELETE_KEEP,
  auto_delete_data = AUTO_DELETE_DEFAULT_VALUE,
  capabilities,
  comment = '',
  config_id = FULL_AND_FAST_SCAN_CONFIG_ID,
  hosts_ordering = DEFAULT_HOSTS_ORDERING,
  in_assets = YES_VALUE,
  max_checks = DEFAULT_MAX_CHECKS,
  max_hosts = DEFAULT_MAX_HOSTS,
  min_qod = DEFAULT_MIN_QOD,
  name = _('Unnamed'),
  scan_configs = {
    [OPENVAS_SCAN_CONFIG_TYPE]: [],
    [OSP_SCAN_CONFIG_TYPE]: [],
  },
  scanner_id = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [{
    id: OPENVAS_DEFAULT_SCANNER_ID,
    scanner_type: OPENVAS_SCANNER_TYPE,
  }],
  schedule_id = UNSET_VALUE,
  schedule_periods = NO_VALUE,
  schedules = [],
  source_iface = '',
  tag_name,
  tags = [],
  tag_value,
  target_id,
  targets,
  task,
  title = _('New Task'),
  visible = true,
  onAlertsChange,
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewTargetClick,
  onSave,
  onScheduleChange,
  onTargetChange,
  ...data
}) => {
  const scanner = get_scanner(scanners, scanner_id);
  const scanner_type = is_defined(scanner) ? scanner.scanner_type : undefined;

  const tag_items = map(tags, tag => ({
    value: tag.name,
    label: tag.name,
  }));

  const target_items = render_select_items(targets);

  const schedule_items = render_select_items(schedules, UNSET_VALUE);

  const osp_scan_config_items = render_select_items(
    scan_configs[OSP_SCAN_CONFIG_TYPE]);

  const openvas_scan_config_items = render_select_items(
    scan_configs[OPENVAS_SCAN_CONFIG_TYPE].filter(config => {
      // Skip the "empty" config
      return config.id !== EMPTY_SCAN_CONFIG_ID;
    }));

  const alert_items = render_select_items(alerts);

  const change_task = task ? task.isChangeable() : true;

  const has_tags = tag_items.length > 0;

  const uncontrolledData = {
    ...data,
    add_tag,
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
    source_iface,
    tag_name,
    tags,
    tag_value,
  };

  const controlledData = {
    target_id,
    alert_ids,
    schedule_id,
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({
        values: state,
        onValueChange,
      }) => {
        const osp_config_id = select_save_id(
          scan_configs[OSP_SCAN_CONFIG_TYPE], state.config_id);
        const openvas_config_id = select_save_id(
          scan_configs[OPENVAS_SCAN_CONFIG_TYPE], state.config_id);

        const is_osp_scanner = state.scanner_type === OSP_SCANNER_TYPE;

        const use_openvas_scan_config =
          state.scanner_type === OPENVAS_SCANNER_TYPE ||
          state.scanner_type === SLAVE_SCANNER_TYPE;
        return (
          <Layout flex="column">

            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                size="30"
                maxLength="80"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                grow="1"
                size="30"
                maxLength="400"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Scan Targets')}>
              <Divider>
                <Select
                  name="target_id"
                  disabled={!change_task}
                  items={target_items}
                  value={state.target_id}
                  onChange={onTargetChange}
                />
                {change_task &&
                  <Layout flex>
                    <NewIcon
                      title={_('Create a new target')}
                      onClick={onNewTargetClick}
                    />
                  </Layout>
                }
              </Divider>
            </FormGroup>

            <FormGroup
              condition={capabilities.mayOp('get_alerts')}
              title={_('Alerts')}
            >
              <Divider>
                <MultiSelect
                  name="alert_ids"
                  items={alert_items}
                  value={state.alert_ids}
                  onChange={onAlertsChange}
                />
                <Layout flex>
                  <NewIcon
                    title={_('Create a new alert')}
                    onClick={onNewAlertClick}
                  />
                </Layout>
              </Divider>
            </FormGroup>

            <FormGroup
              condition={capabilities.mayOp('get_schedules')}
              title={_('Schedule')}
            >
              <Divider>
                <Select
                  name="schedule_id"
                  value={state.schedule_id}
                  items={schedule_items}
                  onChange={onScheduleChange}
                />
                <Checkbox
                  name="schedule_periods"
                  checked={state.schedule_periods === YES_VALUE}
                  checkedValue={YES_VALUE}
                  unCheckedValue={NO_VALUE}
                  title={_('Once')}
                  onChange={onValueChange}
                />
                <Layout flex>
                  <NewIcon
                    title={_('Create a new schedule')}
                    onClick={onNewScheduleClick}
                  />
                </Layout>
              </Divider>
            </FormGroup>


            <AddResultsToAssetsGroup
              inAssets={state.in_assets}
              onChange={onValueChange}
            />

            <FormGroup title={_('Apply Overrides')}>
              <YesNoRadio
                name="apply_overrides"
                disabled={state.in_assets !== YES_VALUE}
                value={state.apply_overrides}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup
              title={_('Min QoD')}
            >
              <Spinner
                name="min_qod"
                size="4"
                disabled={state.in_assets !== YES_VALUE}
                type="int"
                min="0"
                max="100"
                value={state.min_qod}
                onChange={onValueChange}
              />
              <Layout box>%</Layout>
            </FormGroup>

            <FormGroup
              title={_('Alterable Task')}
              condition={change_task}
            >
              <YesNoRadio
                name="alterable"
                disabled={task && !task.isNew()}
                value={state.alterable}
                onChange={onValueChange}
              />
            </FormGroup>

            <AutoDeleteReportsGroup
              autoDelete={state.auto_delete}
              autoDeleteData={state.auto_delete_data}
              onChange={onValueChange}
            />

            <ScannerSelect
              scanConfigs={scan_configs}
              scanners={scanners}
              scannerId={state.scanner_id}
              changeTask={change_task}
              onChange={onValueChange}
            />

            {use_openvas_scan_config &&
              <Layout
                flex="column"
                grow="1"
              >
                <FormGroup
                  titleSize="2"
                  title={_('Scan Config')}
                >
                  <Select
                    name="config_id"
                    disabled={!change_task}
                    items={openvas_scan_config_items}
                    value={openvas_config_id}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup
                  titleSize="4"
                  title={_('Network Source Interface')}
                >
                  <TextField
                    name="source_iface"
                    value={state.source_iface}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup
                  titleSize="4"
                  title={_('Order for target hosts')}
                >
                  <Select
                    name="hosts_ordering"
                    items={[{
                        value: 'sequential',
                        label: _('Sequential'),
                      }, {
                        value: 'random',
                        label: _('Random'),
                      }, {
                        value: 'reverse',
                        label: _('Reverse'),
                      },
                    ]}
                    value={state.hosts_ordering}
                    onChange={onValueChange}
                   />
                </FormGroup>
                <FormGroup
                  titleSize="4"
                  title={_('Maximum concurrently executed NVTs per host')}
                >
                  <Spinner
                    name="max_checks"
                    size="10"
                    min="0"
                    maxLength="10"
                    value={state.max_checks}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup
                  titleSize="4"
                  title={_('Maximum concurrently scanned hosts')}
                >
                  <Spinner
                    name="max_hosts"
                    type="int"
                    min="0"
                    size="10"
                    maxLength="10"
                    value={state.max_hosts}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </Layout>
            }

            {is_osp_scanner &&
              <FormGroup
                titleSize="2"
                title={_('Scan Config')}
              >
                <Select
                  name="config_id"
                  items={osp_scan_config_items}
                  value={osp_config_id}
                  onChange={onValueChange}
                />
              </FormGroup>
            }

            {capabilities.mayAccess('tags') && capabilities.mayCreate('task') &&
              has_tags &&
              <h3>{_('Tag')}</h3>
            }
            <FormGroup
              condition={capabilities.mayAccess('tags') &&
              capabilities.mayCreate('task') && has_tags}
            >
              <Divider>
                <Checkbox
                  title={_('Add Tag:')}
                  name="add_tag"
                  checkedValue={YES_VALUE}
                  unCheckedValue={NO_VALUE}
                  checked={state.add_tag === YES_VALUE}
                  onChange={onValueChange}
                />
                <Select
                  name="tag_name"
                  items={tag_items}
                  value={state.tag_name}
                  onChange={onValueChange}
                />
                <Text>
                  {_('with Value')}
                </Text>
                <TextField
                  name="tag_value"
                  value={state.tag_value}
                  onChange={onValueChange}
                />
              </Divider>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

TaskDialog.propTypes = {
  add_tag: PropTypes.yesno,
  alert_ids: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.yesno,
  apply_overrides: PropTypes.yesno,
  auto_delete: PropTypes.oneOf([
    'keep', 'no',
  ]),
  auto_delete_data: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  config_id: PropTypes.idOrZero,
  hosts_ordering: PropTypes.oneOf([
    'sequential', 'random', 'reverse',
  ]),
  in_assets: PropTypes.yesno,
  max_checks: PropTypes.number,
  max_hosts: PropTypes.number,
  min_qod: PropTypes.number,
  name: PropTypes.string,
  scan_configs: PropTypes.shape({
    [OPENVAS_SCANNER_TYPE]: PropTypes.array,
    [CVE_SCANNER_TYPE]: PropTypes.array,
    [OSP_SCANNER_TYPE]: PropTypes.array,
  }),
  scanner_id: PropTypes.idOrZero,
  scanners: PropTypes.array,
  schedule_id: PropTypes.idOrZero,
  schedule_periods: PropTypes.yesno,
  schedules: PropTypes.array,
  source_iface: PropTypes.string,
  tag_name: PropTypes.string,
  tag_value: PropTypes.string,
  tags: PropTypes.array,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  task: PropTypes.model,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onAlertsChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func.isRequired,
  onNewScheduleClick: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScheduleChange: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
};

export default withCapabilities(TaskDialog);

// vim: set ts=2 sw=2 tw=80:
