/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import PropTypes from 'web/utils/PropTypes';

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
