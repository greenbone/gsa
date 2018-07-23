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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {typeName, getEntityType} from 'gmp/utils/entitytype';

import PropTypes from '../../utils/proptypes.js';
import {permissionDescription} from '../../utils/render.js';

import EntityLink from '../../entity/link.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const PermissionDetails = ({
  entity,
}) => {
  const {
    comment,
    name,
    resource,
    subject,
  } = entity;
  return (
    <Layout
      grow
      flex="column"
    >
      <InfoTable>
        <TableBody>
          {isDefined(comment) &&
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
              {_('Description')}
            </TableData>
            <TableData>
              {permissionDescription(name, resource)}
            </TableData>
          </TableRow>

          {isDefined(resource) &&
            <TableRow>
              <TableData>
                {_('Resource')}
              </TableData>
              <TableData>
                <Divider>
                  <span>{typeName(getEntityType(resource))}</span>
                  <EntityLink entity={resource} />
                </Divider>
              </TableData>
            </TableRow>
          }

          {isDefined(subject) &&
            <TableRow>
              <TableData>
                {_('Subject')}
              </TableData>
              <TableData>
                <Divider>
                  <span>{typeName(getEntityType(subject))}</span>
                  <EntityLink entity={subject} />
                </Divider>
              </TableData>
            </TableRow>
          }
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

PermissionDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default PermissionDetails;

// vim: set ts=2 sw=2 tw=80:
