/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {type NvtFamily} from 'gmp/commands/nvt-families';
import {
  type ScanConfigFamilyTrends,
  type ScanConfigNvtsSelected,
} from 'gmp/commands/scan-config';
import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  type ScanConfigFamilies,
  type ScanConfigTrend,
  WHOLE_SELECTION_FAMILIES,
} from 'gmp/models/scan-config';
import {YES_VALUE, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import Section from 'web/components/section/Section';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import ScanConfigNvtFamily from 'web/pages/scanconfigs/ScanConfigNvtFamily';

interface ScanConfigNvtFamiliesProps {
  configFamilies: ScanConfigFamilies;
  editTitle?: string;
  families?: NvtFamily[];
  select: ScanConfigNvtsSelected;
  trend: ScanConfigFamilyTrends;
  onEditConfigFamilyClick?: (familyName: string) => void;
  onTrendChange: (value: ScanConfigFamilyTrends) => void;
  onSelectChange: (value: ScanConfigNvtsSelected) => void;
}

const ScanConfigNvtFamilies = ({
  configFamilies,
  editTitle,
  families = [],
  trend,
  select,
  onEditConfigFamilyClick,
  onTrendChange,
  onSelectChange,
}: ScanConfigNvtFamiliesProps) => {
  const [_] = useTranslation();
  const handleTrendChange = useCallback(
    (value: ScanConfigTrend, name?: string) => {
      onTrendChange({
        ...trend,
        [name as string]: value,
      });
    },
    [trend, onTrendChange],
  );
  const handleSelectChange = useCallback(
    (value: YesNo, name: string) => {
      const isToSelectWhole = WHOLE_SELECTION_FAMILIES.includes(name);
      if (isToSelectWhole) {
        handleTrendChange(
          value === YES_VALUE
            ? SCANCONFIG_TREND_DYNAMIC
            : SCANCONFIG_TREND_STATIC,
          name,
        );
      }
      onSelectChange({
        ...select,
        [name]: value,
      });
    },
    [select, onSelectChange, handleTrendChange],
  );
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
              <ScanConfigNvtFamily
                key={name}
                familyMaxNvtCount={family.maxNvtCount}
                familyName={family.name}
                familyNvtCount={
                  isDefined(configFamily?.nvts) ? configFamily.nvts.count : 0
                }
                select={select[name]}
                title={editTitle}
                trend={trend[name]}
                onEditConfigFamilyClick={onEditConfigFamilyClick}
                onSelectChange={handleSelectChange}
                onTrendChange={handleTrendChange}
              />
            );
          })}
        </TableBody>
      </Table>
    </Section>
  );
};

export default ScanConfigNvtFamilies;
