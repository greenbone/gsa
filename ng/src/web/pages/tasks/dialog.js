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
import {classes, is_defined, map, select_save_id} from 'gmp/utils';

import {
  NO_VALUE,
  YES_VALUE,
} from 'gmp/parser.js';

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

const DEFAULTS = {
  add_tag: NO_VALUE,
  alert_ids: [],
  alerts: [],
  alterable: NO_VALUE,
  apply_overrides: YES_VALUE,
  auto_delete_data: 5,
  auto_delete: 'keep',
  hosts_ordering: 'sequential',
  in_assets: YES_VALUE,
  max_checks: 4,
  max_hosts: 20,
  min_qod: 70,
  name: _('Unnamed'),
  scan_configs: {
    [OPENVAS_SCAN_CONFIG_TYPE]: [],
    [OSP_SCAN_CONFIG_TYPE]: [],
  },
  scanner_type: OPENVAS_SCANNER_TYPE,
  schedule_id: UNSET_VALUE,
  schedule_periods: NO_VALUE,
  scanner_id: OPENVAS_DEFAULT_SCANNER_ID,
};

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

const TaskDialog = ({
    add_tag,
    alert_ids,
    alerts,
    alterable,
    apply_overrides,
    auto_delete,
    auto_delete_data,
    capabilities,
    comment,
    config_id,
    hosts_ordering,
    in_assets,
    max_checks,
    max_hosts,
    min_qod,
    name,
    scan_configs = {
      [OPENVAS_SCAN_CONFIG_TYPE]: [],
      [OSP_SCAN_CONFIG_TYPE]: [],
    },
    scanner_id,
    scanners,
    schedule_id,
    schedule_periods,
    schedules,
    source_iface,
    tag_name,
    tags,
    tag_value,
    target_id,
    targets,
    task,
    title = _('New Task'),
    visible = true,
    onClose,
    onNewAlertClick,
    onNewScheduleClick,
    onNewTargetClick,
    onSave,
    ...data
  }) => {
  const scanner = get_scanner(scanners, scanner_id);

  const is_osp_scanner = is_defined(scanner) &&
    scanner.scanner_type === OSP_SCANNER_TYPE;

  const use_openvas_scan_config = is_defined(scanner) &&
    (scanner.scanner_type === OPENVAS_SCANNER_TYPE ||
      scanner.scanner_type === SLAVE_SCANNER_TYPE);

  const tag_items = map(tags, tag => ({
    value: tag.name,
    label: tag.name,
  }));

  const target_items = render_select_items(targets);

  const schedule_items = render_select_items(schedules, UNSET_VALUE);

  const osp_scan_config_items = is_osp_scanner && render_select_items(
    scan_configs[OSP_SCAN_CONFIG_TYPE]);

  const openvas_scan_config_items = use_openvas_scan_config &&
    render_select_items(
      scan_configs[OPENVAS_SCAN_CONFIG_TYPE].filter(config => {
        // Skip the "empty" config
        return config.id !== EMPTY_SCAN_CONFIG_ID;
      }));

  const alert_items = render_select_items(alerts);

  const change_task = task ? task.isChangeable() : true;

  const osp_config_id = select_save_id(scan_configs[OSP_SCAN_CONFIG_TYPE],
    config_id);
  const openvas_config_id = select_save_id(
    scan_configs[OPENVAS_SCAN_CONFIG_TYPE], config_id);

  const has_tags = tag_items.length > 0;

  const initialData = {
    ...DEFAULTS,
    ...data,
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">

            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
                maxLength="80"/>
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30" maxLength="400"
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Scan Targets')}>
              <Divider>
                <Select
                  name="target_id"
                  disabled={!change_task}
                  value={state.target_id}
                  items={target_items}
                  onChange={onValueChange}
                />
                {change_task &&
                  <Layout flex box>
                    <NewIcon
                      onClick={onNewTargetClick}
                      title={_('Create a new target')}/>
                  </Layout>
                }
              </Divider>
            </FormGroup>

            <FormGroup
              condition={capabilities.mayOp('get_alerts')}
              title={_('Alerts')}>
              <Divider>
                <MultiSelect
                  name="alert_ids"
                  multiple="multiple"
                  id="alert_ids"
                  value={state.alert_ids}
                  items={alert_items}
                  onChange={onValueChange}
                />
                <Layout flex box>
                  <NewIcon
                    title={_('Create a new alert')}
                    onClick={onNewAlertClick}/>
                </Layout>
              </Divider>
            </FormGroup>

            <FormGroup
              condition={capabilities.mayOp('get_schedules')}
              title={_('Schedule')}>
              <Divider>
                <Select
                  name="schedule_id"
                  value={state.schedule_id}
                  items={schedule_items}
                  onChange={onValueChange}
                />
                <Checkbox
                  name="schedule_periods"
                  checked={state.schedule_periods === YES_VALUE}
                  checkedValue={YES_VALUE}
                  unCheckedValue={NO_VALUE}
                  onChange={onValueChange}
                  title={_('Once')}/>
                <Layout flex box>
                  <NewIcon
                    title={_('Create a new schedule')}
                    onClick={onNewScheduleClick}/>
                </Layout>
              </Divider>
            </FormGroup>


            <AddResultsToAssetsGroup
              inAssets={state.in_assets}
              onChange={onValueChange}/>

            <Layout
              flex="column"
              offset="2"
              className={classes('offset-container',
                state.in_assets === YES_VALUE ? '' : 'disabled')}>
              <FormGroup title={_('Apply Overrides')}>
                <YesNoRadio
                  name="apply_overrides"
                  value={state.apply_overrides}
                  disabled={state.in_assets !== YES_VALUE}
                  onChange={onValueChange}/>
              </FormGroup>

              <FormGroup
                title={_('Min QoD')}>
                <Spinner
                  name="min_qod"
                  value={state.min_qod}
                  size="4"
                  onChange={onValueChange}
                  disabled={state.in_assets !== YES_VALUE}
                  type="int"
                  min="0" max="100"/>
                <Layout box>%</Layout>
              </FormGroup>
            </Layout>

            <FormGroup
              title={_('Alterable Task')}
              condition={change_task}>
              <YesNoRadio
                name="alterable"
                value={state.alterable}
                disabled={task && !task.isNew()}
                onChange={onValueChange}/>
            </FormGroup>

            <AutoDeleteReportsGroup
              autoDelete={state.auto_delete}
              autoDeleteData={state.auto_delete_data}
              onChange={onValueChange}/>

            <ScannerSelect
              scanConfigs={scan_configs}
              scanners={scanners}
              scannerId={scanner_id}
              changeTask={change_task}
              onChange={onValueChange}
            />

            {use_openvas_scan_config &&
              <Layout
                offset="2"
                className="offset-container">
                <Layout
                  flex="column"
                  grow="1">
                  <FormGroup
                    titleSize="4"
                    title={_('Scan Config')}>
                    <Select
                      name="config_id"
                      value={openvas_config_id}
                      disabled={!change_task}
                      items={openvas_scan_config_items}
                      onChange={onValueChange}
                    />
                  </FormGroup>
                  <FormGroup
                    titleSize="4"
                    title={_('Network Source Interface')}>
                    <TextField
                      name="source_iface"
                      value={state.source_iface}
                      onChange={onValueChange}/>
                  </FormGroup>
                  <FormGroup
                    titleSize="4"
                    title={_('Order for target hosts')}>
                    <Select
                      name="hosts_ordering"
                      value={state.hosts_ordering}
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
                      onChange={onValueChange}
                     />
                  </FormGroup>
                  <FormGroup
                    titleSize="4"
                    title={_('Maximum concurrently executed NVTs per host')}>
                    <Spinner
                      name="max_checks"
                      value={state.max_checks}
                      min="0" size="10"
                      maxLength="10"
                      onChange={onValueChange}/>
                  </FormGroup>
                  <FormGroup
                    titleSize="4"
                    title={_('Maximum concurrently scanned hosts')}>
                    <Spinner
                      name="max_hosts"
                      value={state.max_hosts}
                      type="int" min="0"
                      size="10"
                      maxLength="10"
                      onChange={onValueChange}/>
                  </FormGroup>
                </Layout>
              </Layout>
            }

            {is_osp_scanner &&
              <Layout
                float
                offset="2"
                className="offset-container">
                <FormGroup
                  titleSize="4"
                  title={_('Scan Config')}>
                  <Select
                    name="config_id"
                    value={osp_config_id}
                    items={osp_scan_config_items}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </Layout>
            }

            {capabilities.mayAccess('tags') && capabilities.mayCreate('task') &&
              has_tags &&
              <h3>{_('Tag')}</h3>
            }
            <FormGroup
              condition={capabilities.mayAccess('tags') &&
              capabilities.mayCreate('task') && has_tags}>
              <Divider>
                <Checkbox
                  name="add_tag"
                  onChange={onValueChange}
                  checkedValue={YES_VALUE}
                  unCheckedValue={NO_VALUE}
                  checked={state.add_tag === YES_VALUE}
                  title={_('Add Tag:')}/>
                <Select
                  name="tag_name"
                  value={state.tag_name}
                  items={tag_items}
                  onChange={onValueChange}
                />
                <Text>
                  {_('with Value')}
                </Text>
                <TextField
                  name="tag_value"
                  value={state.tag_value}
                  onChange={onValueChange}/>
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
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func,
  onNewScheduleClick: PropTypes.func,
  onNewTargetClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default withCapabilities(TaskDialog);

// vim: set ts=2 sw=2 tw=80:
