/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  parseTrend,
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  WHOLE_SELECTION_FAMILIES,
  type ScanConfigTrend as ScanConfigTrendType,
} from 'gmp/models/scan-config';
import {NO_VALUE, YES_VALUE, type YesNo} from 'gmp/parser';
import Checkbox from 'web/components/form/Checkbox';
import Radio from 'web/components/form/Radio';
import {EditIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import ScanConfigTrend from 'web/pages/scanconfigs/ScanConfigTrend';

interface ScanConfigNvtFamilyProps {
  familyMaxNvtCount?: number;
  familyName: string;
  familyNvtCount?: number;
  select: YesNo;
  title?: string;
  trend: ScanConfigTrendType;
  onEditConfigFamilyClick?: (familyName: string) => void;
  onSelectChange?: (value: YesNo, name: string) => void;
  onTrendChange?: (value: ScanConfigTrendType, name: string) => void;
}

const ScanConfigNvtFamily = ({
  familyMaxNvtCount = 0,
  familyName,
  familyNvtCount = 0,
  select,
  title,
  trend,
  onEditConfigFamilyClick,
  onSelectChange,
  onTrendChange,
}: ScanConfigNvtFamilyProps) => {
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
            checked={isToSelectWhole || trend === SCANCONFIG_TREND_DYNAMIC}
            convert={parseTrend}
            disabled={isToSelectWhole}
            name={familyName}
            value={SCANCONFIG_TREND_DYNAMIC}
            onChange={
              onTrendChange as (
                value: ScanConfigTrendType,
                name?: string,
              ) => void
            }
          />
          <ScanConfigTrend
            active={!isToSelectWhole}
            trend={SCANCONFIG_TREND_DYNAMIC}
          />
          <Radio
            checked={
              (!isToSelectWhole && trend === SCANCONFIG_TREND_STATIC) ||
              (isToSelectWhole && select === NO_VALUE)
            }
            convert={parseTrend}
            disabled={isToSelectWhole}
            name={familyName}
            value={SCANCONFIG_TREND_STATIC}
            onChange={
              onTrendChange as (
                value: ScanConfigTrendType,
                name?: string,
              ) => void
            }
          />
          <ScanConfigTrend
            active={!isToSelectWhole}
            trend={SCANCONFIG_TREND_STATIC}
          />
        </Divider>
      </TableData>
      <TableData align={['start', 'center']}>
        <Checkbox<YesNo>
          checked={select === YES_VALUE}
          checkedValue={YES_VALUE}
          name={familyName}
          unCheckedValue={NO_VALUE}
          onChange={onSelectChange as (value: YesNo, name?: string) => void}
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

export default ScanConfigNvtFamily;
