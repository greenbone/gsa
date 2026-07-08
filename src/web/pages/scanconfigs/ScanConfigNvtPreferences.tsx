/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {type ScanConfigPreference} from 'gmp/models/scan-config';
import {FoldState} from 'web/components/folding/Folding';
import {EditIcon} from 'web/components/icon';
import Section from 'web/components/section/Section';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';

interface ScanConfigNvtPreferenceDisplayProps {
  preference: ScanConfigPreference;
  title: string;
  onEditNvtDetailsClick?: (oid: string) => void;
}

interface ScanConfigNvtPreferencesProps {
  editTitle: string;
  preferences?: ScanConfigPreference[];
  onEditNvtDetailsClick?: (oid: string) => void;
}

const StyledTableData = styled(TableData)`
  overflow-wrap: break-word;
  white-space: normal;
  word-break: break-word;
`;

const shouldComponentUpdate = (
  props: ScanConfigNvtPreferenceDisplayProps,
  nextProps: ScanConfigNvtPreferenceDisplayProps,
) => nextProps.preference !== props.preference;

const ScanConfigNvtPreferenceDisplay = React.memo(
  ({
    preference,
    onEditNvtDetailsClick,
    title,
  }: ScanConfigNvtPreferenceDisplayProps) => {
    return (
      <TableRow>
        <StyledTableData>{preference.nvt?.name}</StyledTableData>
        <StyledTableData>{preference.name}</StyledTableData>
        <StyledTableData>{preference.value}</StyledTableData>
        <TableData align={['center', 'center']}>
          <EditIcon
            title={title}
            value={preference.nvt?.oid}
            onClick={onEditNvtDetailsClick}
          />
        </TableData>
      </TableRow>
    );
  },
  shouldComponentUpdate,
);

const ScanConfigNvtPreferences = ({
  editTitle,
  preferences = [],
  onEditNvtDetailsClick,
}: ScanConfigNvtPreferencesProps) => {
  const [_] = useTranslation();
  return (
    <Section
      foldable
      data-testid="nvt-preferences-section"
      initialFoldState={FoldState.FOLDED}
      title={_('Network Vulnerability Test Preferences ({{counts}})', {
        counts: preferences.length,
      })}
    >
      <Table $fixed>
        <TableHeader>
          <TableRow>
            <TableHead width="30%">{_('NVT')}</TableHead>
            <TableHead width="30%">{_('Name')}</TableHead>
            <TableHead width="30%">{_('Value')}</TableHead>
            <TableHead align="center" width="10%">
              {_('Actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preferences.map(pref => {
            return (
              <ScanConfigNvtPreferenceDisplay
                key={`${pref.nvt?.oid}-${pref.id}`}
                preference={pref}
                title={editTitle}
                onEditNvtDetailsClick={onEditNvtDetailsClick}
              />
            );
          })}
        </TableBody>
      </Table>
    </Section>
  );
};

export default ScanConfigNvtPreferences;
