/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {FoldState} from 'web/components/folding/folding';

import EditIcon from 'web/components/icon/editicon';

import Section from 'web/components/section/section';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';

const StyledTableData = styled(TableData)`
  overflow-wrap: break-word;
`;

class NvtPreferenceDisplay extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.preference !== this.props.preference;
  }

  render() {
    const {preference, onEditNvtDetailsClick, title} = this.props;
    return (
      <TableRow>
        <StyledTableData>{preference.nvt.name}</StyledTableData>
        <StyledTableData>{preference.name}</StyledTableData>
        <StyledTableData>{preference.value}</StyledTableData>
        <TableData align={['center', 'center']}>
          <EditIcon
            title={title}
            value={preference.nvt.oid}
            onClick={onEditNvtDetailsClick}
          />
        </TableData>
      </TableRow>
    );
  }
}

export const NvtPreferencePropType = PropTypes.shape({
  nvt: PropTypes.shape({
    oid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
});

NvtPreferenceDisplay.propTypes = {
  preference: NvtPreferencePropType.isRequired,
  title: PropTypes.string.isRequired,
  onEditNvtDetailsClick: PropTypes.func.isRequired,
};

const NvtPreferences = ({
  editTitle,
  preferences = [],
  onEditNvtDetailsClick,
}) => (
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
            title={editTitle}
            preference={pref}
            onEditNvtDetailsClick={onEditNvtDetailsClick}
          />
        ))}
      </TableBody>
    </Table>
  </Section>
);

NvtPreferences.propTypes = {
  editTitle: PropTypes.string,
  preferences: PropTypes.arrayOf(NvtPreferencePropType),
  onEditNvtDetailsClick: PropTypes.func.isRequired,
};

export default NvtPreferences;
