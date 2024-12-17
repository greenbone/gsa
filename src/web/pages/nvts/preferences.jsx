/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import Table from 'web/components/table/stripedtable';
import PropTypes from 'web/utils/proptypes';

const Preferences = ({preferences = [], defaultTimeout}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{_('Name')}</TableHead>
          <TableHead>{_('Default Value')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableData>{_('Timeout')}</TableData>
          <TableData>
            {isDefined(defaultTimeout) ? defaultTimeout : _('default')}
          </TableData>
        </TableRow>
        {preferences.map(pref => (
          <TableRow key={pref.name}>
            <TableData>{pref.hr_name}</TableData>
            <TableData>{pref.default}</TableData>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

Preferences.propTypes = {
  defaultTimeout: PropTypes.number,
  preferences: PropTypes.array,
};

export default Preferences;

// vim: set ts=2 sw=2 tw=80:
