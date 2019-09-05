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

import React, {useState, useEffect} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  parseTrend,
} from 'gmp/models/scanconfig';

import {isDefined} from 'gmp/utils/identity';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import {FoldState} from 'web/components/folding/folding';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import TextField from 'web/components/form/textfield';
import Select from 'web/components/form/select';
import Loading from 'web/components/loading/loading';

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

import ScannerPreferences from './scannerpreferences';
import Trend from './trend';

const StyledTableData = styled(TableData)`
  overflow-wrap: break-word;
`;

class NvtPreferenceDisplay extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.preference !== this.props.preference;
  }

  render() {
    const {config, preference, onEditNvtDetailsClick} = this.props;
    const title =
      config.usage_type === 'policy'
        ? _('Edit Policy NVT Details')
        : _('Edit Scan Config NVT Details');

    return (
      <TableRow>
        <StyledTableData>{preference.nvt.name}</StyledTableData>
        <StyledTableData>{preference.name}</StyledTableData>
        <StyledTableData>{preference.value}</StyledTableData>
        <TableData align={['center', 'center']}>
          <EditIcon
            title={title}
            value={{configId: config.id, nvtOid: preference.nvt.oid}}
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

const NvtPreferences = ({config, preferences = [], onEditNvtDetailsClick}) => {
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
              config={config}
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
  config: PropTypes.model.isRequired,
  preferences: PropTypes.array.isRequired,
  onEditNvtDetailsClick: PropTypes.func.isRequired,
};

class NvtFamily extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.config !== this.props.config ||
      nextProps.family !== this.props.family ||
      nextProps.select !== this.props.select ||
      nextProps.trend !== this.props.trend
    );
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
      max: family.maxNvtCount,
    };

    if (isDefined(config_family)) {
      counts.count = config_family.nvts.count;
      counts.max = config_family.nvts.max;
    }

    const title =
      config.usage_type === 'policy'
        ? _('Edit Policy Family')
        : _('Edit Scan Config Family');

    return (
      <TableRow key={name}>
        <TableData>{name}</TableData>
        <TableData align="start">{_('{{count}} of {{max}}', counts)}</TableData>
        <TableData align={['center', 'start']}>
          <Divider>
            <Radio
              flex
              name={name}
              checked={trend === SCANCONFIG_TREND_DYNAMIC}
              convert={parseTrend}
              value={SCANCONFIG_TREND_DYNAMIC}
              onChange={onTrendChange}
            />
            <Trend trend={SCANCONFIG_TREND_DYNAMIC} />
            <Radio
              flex
              name={name}
              checked={trend === SCANCONFIG_TREND_STATIC}
              convert={parseTrend}
              value={SCANCONFIG_TREND_STATIC}
              onChange={onTrendChange}
            />
            <Trend trend={SCANCONFIG_TREND_STATIC} />
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
            title={title}
            value={{familyName: name, configId: config.id}}
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
      families = [],
      trend,
      select,
      onEditConfigFamilyClick,
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
                  config={config}
                  family={family}
                  trend={trend[name]}
                  select={select[name]}
                  onEditConfigFamilyClick={onEditConfigFamilyClick}
                  onSelectChange={this.onSelectChange}
                  onTrendChange={this.onTrendChange}
                />
              );
            })}
            <TableRow>
              <TableData>
                {_('Total: {{count}}', {count: config.families.count})}
              </TableData>
              <TableData align="start">
                {_('{{known}} of {{max}}', config.nvts)}
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
  config: PropTypes.model.isRequired,
  families: PropTypes.array.isRequired,
  select: PropTypes.object.isRequired,
  trend: PropTypes.object.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onValueChange: PropTypes.func,
};

const createScannerPreferenceValues = (preferences = []) => {
  const values = {};

  preferences.forEach(preference => {
    values[preference.name] = preference.value;
  });

  return values;
};

const EditDialog = ({
  comment = '',
  config,
  families,
  name,
  nvtPreferences,
  scannerPreferences,
  scanner_id,
  scanners,
  select,
  title,
  trend,
  onClose,
  onEditConfigFamilyClick,
  onEditNvtDetailsClick,
  onSave,
}) => {
  const [scannerPreferenceValues, setScannerPreferenceValues] = useState(
    createScannerPreferenceValues(scannerPreferences),
  );

  useEffect(() => {
    setScannerPreferenceValues(
      createScannerPreferenceValues(scannerPreferences),
    );
  }, [scannerPreferences]);

  const scanConfigType =
    config.usage_type === 'policy'
      ? config.policy_type
      : config.scan_config_type;

  const uncontrolledData = {
    base: scanConfigType,
    comment,
    name,
    scanner_id,
  };

  const controlledData = {
    id: config.id,
    scannerPreferenceValues,
    select,
    trend,
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    // we want to show loading indicator while the content of the dialog is loading. 500ms is arbitrary, but the loading indicator will not disappear until rerender with the required content.
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => {
        if (isLoading) {
          return <Loading />;
        }

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

            {!config.isInUse() && scanConfigType === OSP_SCAN_CONFIG_TYPE && (
              <FormGroup title={_('Scanner')}>
                <Select
                  name="scanner_id"
                  items={renderSelectItems(scanners)}
                  value={state.scanner_id}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {!config.isInUse() &&
              scanConfigType === OPENVAS_SCAN_CONFIG_TYPE && (
                <NvtFamilies
                  config={config}
                  families={families}
                  trend={trend}
                  select={select}
                  onEditConfigFamilyClick={onEditConfigFamilyClick}
                  onValueChange={onValueChange}
                />
              )}

            {!config.isInUse() && (
              <ScannerPreferences
                values={scannerPreferenceValues}
                preferences={scannerPreferences}
                onValueChange={values => setScannerPreferenceValues(values)}
              />
            )}

            {!config.isInUse() &&
              scanConfigType === OPENVAS_SCAN_CONFIG_TYPE && (
                <NvtPreferences
                  config={config}
                  preferences={nvtPreferences}
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
  config: PropTypes.model.isRequired,
  families: PropTypes.array,
  name: PropTypes.string,
  nvtPreferences: PropTypes.arrayOf(PropTypes.object),
  scannerPreferences: PropTypes.arrayOf(PropTypes.object),
  scanner_id: PropTypes.id,
  scanners: PropTypes.array,
  select: PropTypes.object,
  title: PropTypes.string.isRequired,
  trend: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onEditNvtDetailsClick: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

export default EditDialog;

// vim: set ts=2 sw=2 tw=80:
