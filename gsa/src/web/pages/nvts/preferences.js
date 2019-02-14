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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

const Preferences = ({preferences = [], default_timeout}) => {
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
            {isDefined(default_timeout) ? default_timeout : _('default')}
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
  default_timeout: PropTypes.number,
  preferences: PropTypes.array,
};

export default Preferences;

// vim: set ts=2 sw=2 tw=80:
