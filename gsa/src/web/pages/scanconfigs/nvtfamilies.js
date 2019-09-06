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

import _ from 'gmp/locale';

import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  parseTrend,
} from 'gmp/models/scanconfig';

import {isDefined} from 'gmp/utils/identity';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import Checkbox from 'web/components/form/checkbox';
import Radio from 'web/components/form/radio';

import EditIcon from 'web/components/icon/editicon';

import Divider from 'web/components/layout/divider';

import Section from 'web/components/section/section';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';

import Trend from './trend';

class NvtFamily extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.familyMaxNvtCount !== this.props.familyMaxNvtCount ||
      nextProps.familyName !== this.props.familyName ||
      nextProps.config !== this.props.config ||
      nextProps.select !== this.props.select ||
      nextProps.trend !== this.props.trend
    );
  }

  render() {
    const {
      config,
      familyMaxNvtCount,
      familyName,
      select,
      trend,
      onEditConfigFamilyClick,
      onSelectChange,
      onTrendChange,
    } = this.props;
    const config_family = config.families[familyName];
    const counts = {
      count: 0,
      max: familyMaxNvtCount,
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
      <TableRow key={familyName}>
        <TableData>{familyName}</TableData>
        <TableData align="start">{_('{{count}} of {{max}}', counts)}</TableData>
        <TableData align={['center', 'start']}>
          <Divider>
            <Radio
              flex
              name={familyName}
              checked={trend === SCANCONFIG_TREND_DYNAMIC}
              convert={parseTrend}
              value={SCANCONFIG_TREND_DYNAMIC}
              onChange={onTrendChange}
            />
            <Trend trend={SCANCONFIG_TREND_DYNAMIC} />
            <Radio
              flex
              name={familyName}
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
            name={familyName}
            checked={select === YES_VALUE}
            checkedValue={YES_VALUE}
            unCheckedValue={NO_VALUE}
            onChange={onSelectChange}
          />
        </TableData>
        <TableData align={['center', 'center']}>
          <EditIcon
            title={title}
            value={{familyName, configId: config.id}}
            onClick={onEditConfigFamilyClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

NvtFamily.propTypes = {
  config: PropTypes.model.isRequired,
  familyMaxNvtCount: PropTypes.number.isRequired,
  familyName: PropTypes.string.isRequired,
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
                  familyName={family.name}
                  familyMaxNvtCount={family.maxNvtCount}
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

export default NvtFamilies;
