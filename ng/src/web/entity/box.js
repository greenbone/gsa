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

import glamorous from 'glamorous';

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import Layout from '../components/layout/layout.js';

import InfoTable from '../components/table/infotable.js';
import TableBody from '../components/table/body.js';
import TableData from '../components/table/data.js';
import TableRow from '../components/table/row.js';

const Pre = glamorous.pre({
  whiteSpace: 'pre-wrap',
  wordWrap: 'normal',
});

const BoxLayout = glamorous(Layout)({
  border: '1px solid #CCCCCC',
  padding: '5px',
  marginBottom: '10px',
  width: '400px',
  '& h3': {
    marginTop: 0,
  },
});

const EntityBox = ({
  children,
  modified,
  end,
  text,
  title,
  toolbox,
  ...props
}) => {
  return (
    <BoxLayout
      {...props}
      flex="column"
      align="space-between">
      <Layout flex align={['space-between', 'start']}>
        <h3>{title}</h3>
        {is_defined(toolbox) && toolbox}
      </Layout>
      <Pre>{text}</Pre>
      {children}
      <InfoTable>
        <TableBody>
          {is_defined(end) &&
            <TableRow>
              <TableData>
                {_('Active until')}
              </TableData>
              <TableData>
                {datetime(end)}
              </TableData>
            </TableRow>
          }
          <TableRow>
            <TableData>
              {_('Modifed')}
            </TableData>
            <TableData>
              {datetime(modified)}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </BoxLayout>
  );
};

EntityBox.propTypes = {
  end: PropTypes.momentDate,
  modified: PropTypes.momentDate,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  toolbox: PropTypes.element,
};

export default EntityBox;

// vim: set ts=2 sw=2 tw=80:
