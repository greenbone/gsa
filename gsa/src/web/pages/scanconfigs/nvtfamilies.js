/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

const WHOLE_SELECTION_FAMILIES = [
  'CentOS Local Security Checks',
  'Debian Local Security Checks',
  'Fedora Local Security Checks',
  'Huawei EulerOS Local Security Checks',
  'Oracle Linux Local Security Checks',
  'Red Hat Local Security Checks',
  'SuSE Local Security Checks',
  'Ubuntu Local Security Checks',
];

const NvtFamily = ({
  familyMaxNvtCount = 0,
  familyName,
  familyNvtCount = 0,
  select,
  title,
  trend,
  onEditConfigFamilyClick,
  onSelectChange,
  onTrendChange,
}) => {
  const isToSelectWhole = WHOLE_SELECTION_FAMILIES.includes(familyName);
  return (
    <TableRow key={familyName}>
      <TableData>{familyName}</TableData>
      <TableData align="start">
        {_('{{count}} of {{max}}', {
          count: familyNvtCount,
          max: familyMaxNvtCount,
        })}
      </TableData>
      <TableData align={['center', 'start']}>
        <Divider>
          <Radio
            flex
            name={familyName}
            checked={isToSelectWhole || trend === SCANCONFIG_TREND_DYNAMIC}
            convert={parseTrend}
            value={SCANCONFIG_TREND_DYNAMIC}
            onChange={onTrendChange}
          />
          <Trend trend={SCANCONFIG_TREND_DYNAMIC} />
          <Radio
            flex
            name={familyName}
            checked={!isToSelectWhole && trend === SCANCONFIG_TREND_STATIC}
            disabled={isToSelectWhole}
            convert={parseTrend}
            value={SCANCONFIG_TREND_STATIC}
            onChange={onTrendChange}
          />
          <Trend active={!isToSelectWhole} trend={SCANCONFIG_TREND_STATIC} />
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
        {!isToSelectWhole && (
          <EditIcon
            title={title}
            value={familyName}
            onClick={onEditConfigFamilyClick}
          />
        )}
      </TableData>
    </TableRow>
  );
};

NvtFamily.propTypes = {
  familyMaxNvtCount: PropTypes.number,
  familyName: PropTypes.string.isRequired,
  familyNvtCount: PropTypes.number,
  select: PropTypes.yesno.isRequired,
  title: PropTypes.string,
  trend: PropTypes.yesno.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onSelectChange: PropTypes.func,
  onTrendChange: PropTypes.func,
};

const NvtFamilies = ({
  configFamilies,
  editTitle,
  families = [],
  trend,
  select,
  onEditConfigFamilyClick,
  onValueChange,
}) => {
  const onTrendChange = (value, name) => {
    trend[name] = value;

    onValueChange(trend, 'trend');
  };
  const onSelectChange = (value, name) => {
    select[name] = value;

    onValueChange(select, 'select');
  };
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
            const configFamily = configFamilies[name];
            return (
              <NvtFamily
                key={name}
                familyName={family.name}
                familyMaxNvtCount={family.maxNvtCount}
                familyNvtCount={
                  isDefined(configFamily) ? configFamily.nvts.count : 0
                }
                title={editTitle}
                trend={trend[name]}
                select={select[name]}
                onEditConfigFamilyClick={onEditConfigFamilyClick}
                onSelectChange={onSelectChange}
                onTrendChange={onTrendChange}
              />
            );
          })}
        </TableBody>
      </Table>
    </Section>
  );
};

NvtFamilies.propTypes = {
  configFamilies: PropTypes.object.isRequired,
  editTitle: PropTypes.string,
  families: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      maxNvtCount: PropTypes.number,
    }),
  ),
  select: PropTypes.object.isRequired,
  trend: PropTypes.object.isRequired,
  onEditConfigFamilyClick: PropTypes.func,
  onValueChange: PropTypes.func.isRequired,
};

export default NvtFamilies;
