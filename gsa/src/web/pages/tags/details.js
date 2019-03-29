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
import {typeName} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const TagDetails = ({entity}) => {
  const {comment, value, resourceType, resources} = entity;
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
            <TableData>{_('Value')}</TableData>
            <TableData>{value}</TableData>
          </TableRow>

          {isDefined(resources) && (
            <TableRow>
              <TableData>{_('Resource Type')}</TableData>
              <TableData>{typeName(resourceType)}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Active')}</TableData>
            <TableData>{renderYesNo(entity.isActive())}</TableData>
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
