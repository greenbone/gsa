/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import Table from 'web/components/table/StripedTable';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const Preferences = ({preferences = [], defaultTimeout}) => {
  const [_] = useTranslation();
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
        {preferences.map(pref => {
          return (
            <TableRow key={pref.name}>
              <TableData>{pref.hr_name}</TableData>
              <TableData>{pref.default}</TableData>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

Preferences.propTypes = {
  defaultTimeout: PropTypes.number,
  preferences: PropTypes.array,
};

export default Preferences;
