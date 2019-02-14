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
import {shortDate} from 'gmp/locale/date';

import PropTypes from 'web/utils/proptypes';

import Layout from 'web/components/layout/layout.js';

import InfoTable from 'web/components/table/infotable.js';
import TableBody from 'web/components/table/body.js';
import TableData from 'web/components/table/data.js';
import TableRow from 'web/components/table/row.js';

import {Col} from 'web/entity/page';

const AgentDetails = ({entity}) => {
  const {comment, trust} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Trust')}</TableData>
            <TableData>
              {trust.status} ({shortDate(trust.time)})
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

AgentDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default AgentDetails;

// vim: set ts=2 sw=2 tw=80:
