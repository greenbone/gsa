/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {typeName, getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityLink from 'web/entity/link';
import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import {permissionDescription} from 'web/utils/render';

const PermissionDetails = ({entity}) => {
  const {comment, name, resource, subject} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(comment) && (
            <TableRow>
              <TableData>{_('Comment')}</TableData>
              <TableData>{comment}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Description')}</TableData>
            <TableData>{permissionDescription(name, resource)}</TableData>
          </TableRow>

          {isDefined(resource) && (
            <TableRow>
              <TableData>{_('Resource')}</TableData>
              <TableData>
                <Divider>
                  <span>{typeName(getEntityType(resource))}</span>
                  <EntityLink entity={resource} />
                </Divider>
              </TableData>
            </TableRow>
          )}

          {isDefined(subject) && (
            <TableRow>
              <TableData>{_('Subject')}</TableData>
              <TableData>
                <Divider>
                  <span>{typeName(getEntityType(subject))}</span>
                  <EntityLink entity={subject} />
                </Divider>
              </TableData>
            </TableRow>
          )}
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
