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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import {FoldState} from 'web/components/folding/folding';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import Select from 'web/components/form/select';
import YesNoRadio from 'web/components/form/yesnoradio';
import {noop_convert} from 'web/components/form/withChangeHandler';

import EditIcon from 'web/components/icon/editicon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Section from 'web/components/section/section';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import Trend from 'web/pages/scanconfigs/trend';

import {
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from 'gmp/models/scanconfig';

const StyledTableData = styled(TableData)`
  overflow-wrap: break-word;
`;

class NvtPreferenceDisplay extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.preference !== this.props.preference;
  }

  render() {
    const {policy, preference, onEditNvtDetailsClick} = this.props;
    return (
      <TableRow>
        <StyledTableData>{preference.nvt.name}</StyledTableData>
        <StyledTableData>{preference.name}</StyledTableData>
        <StyledTableData>{preference.value}</StyledTableData>
        <TableData align={['center', 'center']}>
          <EditIcon
            title={_('Edit Policy NVT Details')}
            value={{policy, nvt: preference.nvt}}
            onClick={onEditNvtDetailsClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

NvtPreferenceDisplay.propTypes = {
  policy: PropTypes.model.isRequired,
  preference: PropTypes.object.isRequired,
  onEditNvtDetailsClick: PropTypes.func.isRequired,
};

const NvtPreferences = ({policy, preferences = [], onEditNvtDetailsClick}) => {
  return (
    <Section
      foldable
      initialFoldState={FoldState.FOLDED}
      title={_('Network Vulnerability Test Preferences ({{counts}})', {
        counts: preferences.length,
      })}
    >
      <Table fixed>
        <TableHeader>
          <TableRow>
            <TableHead width="30%">{_('NVT')}</TableHead>
            <TableHead width="30%">{_('Name')}</TableHead>
            <TableHead width="30%">{_('Value')}</TableHead>
            <TableHead width="10%" align="center">
              {_('Actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preferences.map(pref => (
            <NvtPreferenceDisplay
              key={pref.nvt.name + pref.name}
              policy={policy}
              preference={pref}
              onEditNvtDetailsClick={onEditNvtDetailsClick}
            />
          ))}
        </TableBody>
      </Table>
    </Section>
  );
};

NvtPreferences.propTypes = {
  policy: PropTypes.model.isRequired,
  preferences: PropTypes.array.isRequired,
  onEditNvtDetailsClick: PropTypes.func.isRequired,
};

class ScannerPreference extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.preference !== this.props.preference ||
      nextProps.value !== this.props.value
    );
  }

  render() {
    const {preference, value, onPreferenceChange} = this.props;
    const {hr_name, name} = preference;
    const is_radio =
      name === 'ping_hosts' ||
      name === 'reverse_lookup' ||
      name === 'unscanned_closed' ||
      name === 'nasl_no_signature_check' ||
      name === 'reverse_lookup' ||
      name === 'unscanned_closed_udp' ||
      name === 'auto_enable_dependencies' ||
      name === 'kb_dont_replay_attacks' ||
      name === 'kb_dont_replay_denials' ||
      name === 'kb_dont_replay_info_gathering' ||
      name === 'kb_dont_replay_scanners' ||
      name === 'kb_restore' ||
      name === 'log_whole_attack' ||
      name === 'test_empty_vhost' ||
      name === 'only_test_hosts_whose_kb_we_dont_have' ||
      name === 'only_test_hosts_whose_kb_we_have' ||
      name === 'optimize_test' ||
      name === 'safe_checks' ||
      name === 'save_knowledge_base' ||
      name === 'silent_dependencies' ||
      name === 'slice_network_addresses' ||
      name === 'drop_privileges' ||
      name === 'network_scan' ||
      name === 'report_host_details';
    return (
      <TableRow>
        <TableData>{hr_name}</TableData>
        <TableData>
          {is_radio ? (
            <Layout>
              <YesNoRadio
                yesValue="yes"
                noValue="no"
                name={name}
                value={value}
                convert={noop_convert}
                onChange={onPreferenceChange}
              />
            </Layout>
          ) : (
            <TextField
              name={name}
              value={value}
              onChange={onPreferenceChange}
            />
          )}
        </TableData>
        <TableData>{preference.default}</TableData>
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
    const {preferences = [], values} = this.props;
    return (
      <Section
        foldable
        initialFoldState={FoldState.FOLDED}
        title={_('Edit Scanner Preferences ({{counts}})', {
          counts: preferences.length,
        })}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Name')}</TableHead>
              <TableHead>{_('New Value')}</TableHead>
              <TableHead>{_('Default Value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.map(pref => (
              <ScannerPreference
                key={pref.name}
                preference={pref}
                value={values[pref.name]}
                onPreferenceChange={this.onPreferenceChange}
              />
            ))}
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
    return (
      nextProps.policy !== this.props.policy ||
      nextProps.family !== this.props.family ||
      nextProps.select !== this.props.select ||
      nextProps.trend !== this.props.trend
    );
  }

  render() {
    const {
      policy,
      family,
      select,
      trend,
      onEditPolicyFamilyClick,
      onSelectChange,
      onTrendChange,
    } = this.props;
    const {name} = family;
    const policyFamily = policy.families[name];
    const counts = {
      count: 0,
      max: family.maxNvtCount,
    };

    if (isDefined(policyFamily)) {
      counts.count = policyFamily.nvts.count;
      counts.max = policyFamily.nvts.max;
    }

    return (
      <TableRow key={name}>
        <TableData>{name}</TableData>
        <TableData align="start">{_('{{count}} of {{max}}', counts)}</TableData>
        <TableData align={['center', 'start']}>
          <Divider>
            <Radio
              flex
              name={name}
              checked={trend === YES_VALUE}
              convert={parseYesNo}
              value={YES_VALUE}
              onChange={onTrendChange}
            />
            <Trend trend="1" />
            <Radio
              flex
              name={name}
              checked={trend === NO_VALUE}
              convert={parseYesNo}
              value={NO_VALUE}
              onChange={onTrendChange}
            />
            <Trend trend="0" />
          </Divider>
        </TableData>
        <TableData align={['start', 'center']}>
          <Checkbox
            flex
            name={name}
            checked={select === YES_VALUE}
            checkedValue={YES_VALUE}
            unCheckedValue={NO_VALUE}
            onChange={onSelectChange}
          />
        </TableData>
        <TableData align={['center', 'center']}>
          <EditIcon
            title={_('Edit Policy Family')}
            value={{name, policy}}
            onClick={onEditPolicyFamilyClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

NvtFamily.propTypes = {
  family: PropTypes.object.isRequired,
  policy: PropTypes.model.isRequired,
  select: PropTypes.yesno.isRequired,
  trend: PropTypes.yesno.isRequired,
  onEditPolicyFamilyClick: PropTypes.func,
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
      policy,
      families = [],
      trend,
      select,
      onEditPolicyFamilyClick,
    } = this.props;

    return (
      <Section
        foldable
        title={_('Edit Network Vulnerability Test Families ({{counts}})', {
          counts: families.length,
        })}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Family')}</TableHead>
              <TableHead>{_('NVTs selected')}</TableHead>
              <TableHead>{_('Trend')}</TableHead>
              <TableHead width="9em">{_('Select all NVTs')}</TableHead>
              <TableHead align="center">{_('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {families.map(family => {
              const {name} = family;
              return (
                <NvtFamily
                  key={name}
                  policy={policy}
                  family={family}
                  trend={trend[name]}
                  select={select[name]}
                  onEditPolicyFamilyClick={onEditPolicyFamilyClick}
                  onSelectChange={this.onSelectChange}
                  onTrendChange={this.onTrendChange}
                />
              );
            })}
            <TableRow>
              <TableData>
                {_('Total: {{count}}', {count: policy.families.count})}
              </TableData>
              <TableData align="start">
                {_('{{known}} of {{max}}', policy.nvts)}
              </TableData>
              {/* add empty cells to spread row to end of table */}
              <TableData />
              <TableData />
              <TableData />
            </TableRow>
          </TableBody>
        </Table>
      </Section>
    );
  }
}

NvtFamilies.propTypes = {
  families: PropTypes.array.isRequired,
  policy: PropTypes.model.isRequired,
  select: PropTypes.object.isRequired,
  trend: PropTypes.object.isRequired,
  onEditPolicyFamilyClick: PropTypes.func,
  onValueChange: PropTypes.func,
};

const EditDialog = ({
  comment = '',
  policy,
  families,
  name,
  scanner_id,
  scanner_preference_values,
  scanners,
  select,
  title,
  trend,
  onClose,
  onEditPolicyFamilyClick,
  onEditNvtDetailsClick,
  onSave,
}) => {
  const uncontrolledData = {
    base: policy.policy_type,
    comment,
    name,
    scanner_id,
  };

  const controlledData = {
    id: policy.id,
    scanner_preference_values,
    select,
    trend,
  };

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={state.name}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            {!policy.isInUse() && policy.policy_type === OSP_SCAN_CONFIG_TYPE && (
              <FormGroup title={_('Scanner')}>
                <Select
                  name="scanner_id"
                  items={renderSelectItems(scanners)}
                  value={state.scanner_id}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {!policy.isInUse() &&
              policy.policy_type === OPENVAS_SCAN_CONFIG_TYPE && (
                <NvtFamilies
                  policy={policy}
                  families={families}
                  trend={trend}
                  select={select}
                  onEditPolicyFamilyClick={onEditPolicyFamilyClick}
                  onValueChange={onValueChange}
                />
              )}

            {!policy.isInUse() && (
              <ScannerPreferences
                values={scanner_preference_values}
                preferences={policy.preferences.scanner}
                onValueChange={onValueChange}
              />
            )}

            {!policy.isInUse() &&
              policy.policy_type === OPENVAS_SCAN_CONFIG_TYPE && (
                <NvtPreferences
                  policy={policy}
                  preferences={policy.preferences.nvt}
                  onValueChange={onValueChange}
                  onEditNvtDetailsClick={onEditNvtDetailsClick}
                />
              )}
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

EditDialog.propTypes = {
  comment: PropTypes.string,
  families: PropTypes.array,
  name: PropTypes.string,
  policy: PropTypes.model.isRequired,
  scanner_id: PropTypes.id,
  scanner_preference_values: PropTypes.object,
  scanners: PropTypes.array,
  select: PropTypes.object,
  title: PropTypes.string.isRequired,
  trend: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEditNvtDetailsClick: PropTypes.func,
  onEditPolicyFamilyClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default EditDialog;

// vim: set ts=2 sw=2 tw=80:
