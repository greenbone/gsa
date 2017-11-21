/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Table from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

const Preferences = ({
  preferences = [],
  default_timeout,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {_('Name')}
          </TableHead>
          <TableHead>
            {_('Default Value')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableData>
            {_('Timeout')}
          </TableData>
          <TableData>
            {is_defined(default_timeout) ?
              default_timeout :
              _('default')
            }
          </TableData>
        </TableRow>
        {preferences.map(pref => (
          <TableRow
            key={pref.name}>
            <TableData>
              {pref.hr_name}
            </TableData>
            <TableData>
              {pref.default}
            </TableData>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

Preferences.propTypes = {
  default_timeout: PropTypes.number,
  preferences: PropTypes.arrayLike,
};

export default Preferences;

// vim: set ts=2 sw=2 tw=80:
