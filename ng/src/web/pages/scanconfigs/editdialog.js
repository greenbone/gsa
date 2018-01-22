/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {is_defined, map} from 'gmp/utils.js';
import {parse_yesno, YES_VALUE, NO_VALUE} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';
import {render_options} from '../../utils/render.js';

import withDialog from '../../components/dialog/withDialog.js';

import Checkbox from '../../components/form/checkbox.js';
import {noop_convert} from '../../components/form/form.js';
import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import TextField from '../../components/form/textfield.js';
import Select from '../../components/form/select.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import EditIcon from '../../components/icon/editicon.js';

import Layout from '../../components/layout/layout.js';

import Section from '../../components/section/section.js';

import Table from '../../components/table/table.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import Trend from './trend.js';

import {
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from 'gmp/models/scanconfig.js';

class NvtPreferenceDisplay extends React.Component {

  shouldComponentUpdate(nextProps) {
    return nextProps.preference !== this.props.preference;
  }

  render() {
    const {
      config,
      preference,
      onEditNvtDetailsClick,
    } = this.props;
    return (
      <TableRow>
        <TableData style={{overflowWrap: 'break-word'}}>
          {preference.nvt.name}
        </TableData>
        <TableData style={{overflowWrap: 'break-word'}}>
          {preference.name}
        </TableData>
        <TableData>
          {preference.value}
        </TableData>
        <TableData>
          <EditIcon
            title={_('Edit Scan Config NVT Details')}
            value={{config, nvt: preference.nvt}}
            onClick={onEditNvtDetailsClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

NvtPreferenceDisplay.propTypes = {
  config: PropTypes.model.isRequired,
  preference: PropTypes.object.isRequired,
  onEditNvtDetailsClick: PropTypes.func.isRequired,
};

class NvtPreferences extends React.Component {

  render() {
    const {
      config,
      preferences,
      onEditNvtDetailsClick,
    } = this.props;
    return (
      <Section
        foldable
        title={_('Network Vulnerability Test Preferences')}
      >
        <Table fixed>
          <TableHeader>
            <TableRow>
              <TableHead width="30%">
                {_('NVT')}
              </TableHead>
              <TableHead width="30%">
                {_('Name')}
              </TableHead>
              <TableHead width="30%">
                {_('Value')}
              </TableHead>
              <TableHead width="10%">
                {_('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              map(preferences, pref => {
                return (
                  <NvtPreferenceDisplay
                    key={pref.nvt.name + pref.name}
                    config={config}
                    preference={pref}
                    onEditNvtDetailsClick={onEditNvtDetailsClick}
                  />
                );
              })
            }
          </TableBody>
        </Table>
      </Section>
    );
  }
}

NvtPreferences.propTypes = {
  config: PropTypes.model.isRequired,
  preferences: PropTypes.array.isRequired,
  onEditNvtDetailsClick: PropTypes.func.isRequired,
};

class ScannerPreference extends React.Component {

  shouldComponentUpdate(nextProps) {
    return nextProps.preference !== this.props.preference ||
      nextProps.value !== this.props.value;
  }

  render() {
    const {
      preference,
      value,
      onPreferenceChange,
    } = this.props;
    const {hr_name, name} = preference;
    const is_radio = name === 'ping_hosts' || name === 'reverse_lookup' ||
      name === 'unscanned_closed' || name === 'nasl_no_signature_check' ||
      name === 'ping_hosts' || name === 'reverse_lookup' ||
      name === 'unscanned_closed_udp' || name === 'auto_enable_dependencies' ||
      name === 'kb_dont_replay_attacks' || name === 'kb_dont_replay_denials' ||
      name === 'kb_dont_replay_info_gathering' ||
      name === 'kb_dont_replay_scanners' || name === 'kb_restore' ||
      name === 'log_whole_attack' ||
      name === 'only_test_hosts_whose_kb_we_dont_have' ||
      name === 'only_test_hosts_whose_kb_we_have' || name === 'optimize_test' ||
      name === 'safe_checks' || name === 'save_knowledge_base' ||
      name === 'silent_dependencies' || name === 'slice_network_addresses' ||
      name === 'use_mac_addr' || name === 'drop_privileges' ||
      name === 'network_scan' || name === 'report_host_details';
    return (
      <TableRow>
        <TableData>
          {hr_name}
        </TableData>
        <TableData>
          {is_radio ?
            <Layout flex>
              <YesNoRadio
                yesValue="yes"
                noValue="no"
                name={name}
                value={value}
                convert={noop_convert}
                onChange={onPreferenceChange}
              />
            </Layout> :
            <TextField
              name={name}
              value={value}
              onChange={onPreferenceChange}
            />
          }
        </TableData>
        <TableData>
          {preference.default}
        </TableData>
      </TableRow>
    );
  }
}

ScannerPreference.propTypes = {
  preference: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired,
  onPreferenceChange: PropTypes.func,
};

class ScannerPreferences extends React.Component {

  constructor(...args) {
    super(...args);

    this.onPreferenceChange = this.onPreferenceChange.bind(this);
  }

  onPreferenceChange(value, name) {
    const {values, onValueChange} = this.props;

    values[name] = value;

    onValueChange(values, 'scanner_preference_values');
  }

  render() {
    const {preferences, values} = this.props;
    return (
      <Section
        foldable
        title={_('Edit Scanner Preferences')}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Name')}
              </TableHead>
              <TableHead>
                {_('New Value')}
              </TableHead>
              <TableHead>
                {_('Default Value')}
              </TableHead>
              <TableHead>
                {_('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              map(preferences, pref => {
                return (
                  <ScannerPreference
                    key={pref.name}
                    preference={pref}
                    value={values[pref.name]}
                    onPreferenceChange={this.onPreferenceChange}
                  />
                );
              })
            }
          </TableBody>
        </Table>
      </Section>
    );
  }
}


ScannerPreferences.propTypes = {
  preferences: PropTypes.array.isRequired,
  values: PropTypes.object.isRequired,
  onValueChange: PropTypes.func,
};

class NvtFamily extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.config !== this.props.config ||
      nextProps.family !== this.props.family ||
      nextProps.select !== this.props.select ||
      nextProps.trend !== this.props.trend;
  }

  render() {
    const {
      config,
      family,
      select,
      trend,
      onEditConfigFamilyClick,
      onSelectChange,
      onTrendChange,
    } = this.props;
    const {name} = family;
    const config_family = config.families[name];
    const counts = {
      count: 0,
      max: family.max,
    };

    if (is_defined(config_family)) {
      counts.count = config_family.nvts.count;
      counts.max = config_family.nvts.max;
    }

    return (
      <TableRow key={name}>
        <TableData>
          {name}
        </TableData>
        <TableData>
          <Layout flex align="end">
            {_('{{count}} of {{max}}', counts)}
          </Layout>
        </TableData>
        <TableData flex align={['center', 'center']}>
          <Radio
            flex
            name={name}
            checked={trend === YES_VALUE}
            convert={parse_yesno}
            value={YES_VALUE}
            onChange={onTrendChange}
          />
          <Trend trend="1"/>
          <Radio
            flex
            name={name}
            checked={trend === NO_VALUE}
            convert={parse_yesno}
            value={NO_VALUE}
            onChange={onTrendChange}
          />
          <Trend trend="0"/>
        </TableData>
        <TableData flex align={['center', 'center']}>
          <Checkbox
            flex
            name={name}
            checked={select === YES_VALUE}
            checkedValue={YES_VALUE}
            unCheckedValue={NO_VALUE}
            onChange={onSelectChange}
          />
        </TableData>
        <TableData flex align="center">
          <EditIcon
            title={_('Edit Scan Config Family')}
            value={{name, config}}
            onClick={onEditConfigFamilyClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

NvtFamily.propTypes = {
  config: PropTypes.model.isRequired,
  family: PropTypes.object.isRequired,
  select: PropTypes.yesno.isRequired,
  trend: PropTypes.yesno.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onSelectChange: PropTypes.func,
  onTrendChange: PropTypes.func,
};

class NvtFamilies extends React.Component {

  constructor(...args) {
    super(...args);

    this.onSelectChange = this.onSelectChange.bind(this);
    this.onTrendChange = this.onTrendChange.bind(this);
  }

  onSelectChange(value, name) {
    const {select, onValueChange} = this.props;

    select[name] = value;

    onValueChange(select, 'select');
  }

  onTrendChange(value, name) {
    const {trend, onValueChange} = this.props;

    trend[name] = value;

    onValueChange(trend, 'trend');
  }

  render() {
    const {
      config,
      families,
      trend,
      select,
      onEditConfigFamilyClick,
    } = this.props;

    return (
      <Section
        foldable
        title={_('Edit Network Vulnerability Test Families')}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Family')}
              </TableHead>
              <TableHead>
                {_('NVTs selected')}
              </TableHead>
              <TableHead>
                {_('Trend')}
              </TableHead>
              <TableHead width="8em">
                {_('Select all NVTs')}
              </TableHead>
              <TableHead>
                {_('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              map(families, family => {
                const {name} = family;
                return (
                  <NvtFamily
                    key={name}
                    config={config}
                    family={family}
                    trend={trend[name]}
                    select={select[name]}
                    onEditConfigFamilyClick={onEditConfigFamilyClick}
                    onSelectChange={this.onSelectChange}
                    onTrendChange={this.onTrendChange}
                  />
                );
              })
            }
            <TableRow>
              <TableData>
                {_('Total: {{count}}', {count: config.families.count})}
              </TableData>
              <TableData flex align="end">
                {_('{{known}} of {{max}}', config.nvts)}
              </TableData>
            </TableRow>
          </TableBody>
        </Table>
      </Section>
    );
  }
}

NvtFamilies.propTypes = {
  config: PropTypes.model.isRequired,
  families: PropTypes.array.isRequired,
  select: PropTypes.object.isRequired,
  trend: PropTypes.object.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onValueChange: PropTypes.func,
};

class EditDialog extends React.Component {

  render() {
    const {
      comment,
      config,
      families,
      name,
      scanner_id,
      scanner_preference_values,
      scanners,
      select,
      trend,
      onEditConfigFamilyClick,
      onEditNvtDetailsClick,
      onValueChange,
    } = this.props;
    return (
      <Layout flex="column">

        <FormGroup title={_('Name')}>
          <TextField
            name="name"
            grow="1"
            value={name}
            size="30"
            onChange={onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField
            name="comment"
            value={comment}
            grow="1"
            size="30"
            maxLength="400"
            onChange={onValueChange}/>
        </FormGroup>

        {!config.isInUse() &&
          config.scan_config_type === OSP_SCAN_CONFIG_TYPE &&
          <FormGroup title={_('Scanner')}>
            <Select
              name="scanner_id"
              value={scanner_id}
              onChange={onValueChange}
            >
              {render_options(scanners)}
            </Select>
          </FormGroup>
        }

        {!config.isInUse() &&
          config.scan_config_type === OPENVAS_SCAN_CONFIG_TYPE &&
          <NvtFamilies
            config={config}
            families={families}
            trend={trend}
            select={select}
            onEditConfigFamilyClick={onEditConfigFamilyClick}
            onValueChange={onValueChange}
          />
        }

        {!config.isInUse() &&
          <ScannerPreferences
            values={scanner_preference_values}
            preferences={config.preferences.scanner}
            onValueChange={onValueChange}
          />
        }

        {!config.isInUse() &&
          config.scan_config_type === OPENVAS_SCAN_CONFIG_TYPE &&
          <NvtPreferences
            config={config}
            preferences={config.preferences.nvt}
            onValueChange={onValueChange}
            onEditNvtDetailsClick={onEditNvtDetailsClick}
          />
        }

      </Layout>
    );
  }
}

EditDialog.propTypes = {
  comment: PropTypes.string,
  config: PropTypes.model.isRequired,
  families: PropTypes.array,
  name: PropTypes.string,
  scanner_id: PropTypes.id,
  scanner_preference_values: PropTypes.object,
  scanners: PropTypes.array,
  select: PropTypes.object,
  trend: PropTypes.object,
  onEditConfigFamilyClick: PropTypes.func,
  onEditNvtDetailsClick: PropTypes.func,
  onValueChange: PropTypes.func,
};

export default withDialog({
  footer: _('Save'),
  defaultState: {
    comment: '',
  },
})(EditDialog);

// vim: set ts=2 sw=2 tw=80:
