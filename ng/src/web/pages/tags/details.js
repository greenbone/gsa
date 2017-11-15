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
import {render_yesno, type_name, N_A} from '../../utils/render.js';

import EntityLink from '../../entity/link.js';

import Layout from '../../components/layout/layout.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const TagDetails = ({
  entity,
}) => {
  const {
    comment,
    value,
    resource,
  } = entity;
  return (
    <Layout
      grow
      flex="column"
    >
      <InfoTable>
        <TableBody>
          {is_defined(comment) &&
            <TableRow>
              <TableData>
                {_('Comment')}
              </TableData>
              <TableData>
                {comment}
              </TableData>
            </TableRow>
          }

          <TableRow>
            <TableData>
              {_('Value')}
            </TableData>
            <TableData>
              {value}
            </TableData>
          </TableRow>

          {is_defined(resource) && 
            <TableRow>
              <TableData>
                {_('Resoure Type')}
              </TableData>
              <TableData>
                {type_name(resource.entity_type)}
              </TableData>
            </TableRow>
          }
          {is_defined(resource) &&
            <TableRow>
              <TableData>
                {_('Resource')}
              </TableData>
              <TableData>
                {entity.isOrphan() ?
                  <span>{N_A}{' '}
                    <i>({resource.id})</i>
                  </span> :
                  <EntityLink entity={resource} />
                }
              </TableData>
            </TableRow>
          }

          <TableRow>
            <TableData>
              {_('Active')}
            </TableData>
            <TableData>
              {render_yesno(entity.isActive())}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Orphan')}
            </TableData>
            <TableData>
              {render_yesno(entity.isOrphan())}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

TagDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default TagDetails;

// vim: set ts=2 sw=2 tw=80:
