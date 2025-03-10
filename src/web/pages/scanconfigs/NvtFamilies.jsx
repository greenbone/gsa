/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  parseTrend,
} from 'gmp/models/scanconfig';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Checkbox from 'web/components/form/Checkbox';
import Radio from 'web/components/form/Radio';
import EditIcon from 'web/components/icon/EditIcon';
import Divider from 'web/components/layout/Divider';
import Section from 'web/components/section/Section';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import useTranslation from 'web/hooks/useTranslation';
import Trend from 'web/pages/scanconfigs/Trend';
import PropTypes from 'web/utils/PropTypes';

const WHOLE_SELECTION_FAMILIES = [
  'AIX Local Security Checks',
  'AlmaLinux Local Security Checks',
  'Amazon Linux Local Security Checks',
  'CentOS Local Security Checks',
  'Debian Local Security Checks',
  'Fedora Local Security Checks',
  'FreeBSD Local Security Checks',
  'Gentoo Local Security Checks',
  'HP-UX Local Security Checks',
  'Huawei EulerOS Local Security Checks',
  'Mageia Linux Local Security Checks',
  'Mandrake Local Security Checks',
  'openSUSE Local Security Checks',
  'openEuler Local Security Checks',
  'Oracle Linux Local Security Checks',
  'Red Hat Local Security Checks',
  'Rocky Linux Local Security Checks',
  'Slackware Local Security Checks',
  'Solaris Local Security Checks',
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
  const [_] = useTranslation();
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
            checked={isToSelectWhole || trend === SCANCONFIG_TREND_DYNAMIC}
            convert={parseTrend}
            disabled={isToSelectWhole}
            name={familyName}
            value={SCANCONFIG_TREND_DYNAMIC}
            onChange={onTrendChange}
          />
          <Trend active={!isToSelectWhole} trend={SCANCONFIG_TREND_DYNAMIC} />
          <Radio
            flex
            checked={
              (!isToSelectWhole && trend === SCANCONFIG_TREND_STATIC) ||
              (isToSelectWhole && select === NO_VALUE)
            }
            convert={parseTrend}
            disabled={isToSelectWhole}
            name={familyName}
            value={SCANCONFIG_TREND_STATIC}
            onChange={onTrendChange}
          />
          <Trend active={!isToSelectWhole} trend={SCANCONFIG_TREND_STATIC} />
        </Divider>
      </TableData>
      <TableData align={['start', 'center']}>
        <Checkbox
          flex
          checked={select === YES_VALUE}
          checkedValue={YES_VALUE}
          name={familyName}
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
  const [_] = useTranslation();
  const onTrendChange = (value, name) => {
    trend[name] = value;

    onValueChange(trend, 'trend');
  };
  const onSelectChange = (value, name) => {
    const isToSelectWhole = WHOLE_SELECTION_FAMILIES.includes(name);
    select[name] = value;
    if (isToSelectWhole) {
      onTrendChange(value, name);
    }
    onValueChange(select, 'select');
  };
  return (
    <Section
      foldable
      data-testid="nvt-families-section"
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
                familyMaxNvtCount={family.maxNvtCount}
                familyName={family.name}
                familyNvtCount={
                  isDefined(configFamily) ? configFamily.nvts.count : 0
                }
                select={select[name]}
                title={editTitle}
                trend={trend[name]}
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
