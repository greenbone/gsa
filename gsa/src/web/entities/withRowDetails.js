/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {isFunction} from 'gmp/utils/identity';

import PropTypes from '../utils/proptypes.js';

import Icon from '../components/icon/icon.js';

import Layout from '../components/layout/layout.js';

import DetailsLink from '../components/link/detailslink.js';

import TableData from '../components/table/data.js';
import TableRow from '../components/table/row.js';

const Indent = glamorous.div({
  display: 'flex',
  width: '3em',
  borderRight: '2px solid black',
  marginRight: '1em',
  flexShrink: 0, // don't shrink at all
});

Indent.displayName = 'Indent';

const StyledTableRow = glamorous(TableRow, {
  displayName: 'StyledTableRow',
})({
  '&, &:hover': {
    backgroundColor: 'white !important',
  },
});

const withRowDetails = (type, colSpan = '10') => Component => {
  const RowDetailsWrapper = ({entity, links = true, ...props}) => (
    <StyledTableRow>
      <TableData
        colSpan={colSpan}
        flex
        align={['start', 'stretch']}
      >
        {links &&
          <Layout flex align={['start', 'start']}>
            <DetailsLink
              type={isFunction(type) ? type(entity) : type}
              id={entity.id}
            >
              <Icon
                img="details.svg"
                size="small"
                title={_('Open all details')}
              />
            </DetailsLink>
          </Layout>
        }
        <Indent/>
        <Component
          {...props}
          links={links}
          entity={entity}
        />
      </TableData>
    </StyledTableRow>
  );

  RowDetailsWrapper.propTypes = {
    entity: PropTypes.model.isRequired,
    links: PropTypes.bool,
  };
  return RowDetailsWrapper;
};

export default withRowDetails;

// vim: set ts=2 sw=2 tw=80:
