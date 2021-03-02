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

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const PortListDetails = ({entity, ...props}) => {
  const {
    comment,
    port_count = {
      all: 0,
      tcp: 0,
      udp: 0,
    },
    targets = [],
  } = entity;
  return (
    <Layout flex="column" grow>
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
            <TableData>{_('Port Count')}</TableData>
            <TableData>{port_count.all}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('TCP Port Count')}</TableData>
            <TableData>{port_count.tcp}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('UDP Port Count')}</TableData>
            <TableData>{port_count.udp}</TableData>
          </TableRow>

          {targets.length > 0 && (
            <TableRow>
              <TableDataAlignTop>
                {_('Targets using this Port List')}
              </TableDataAlignTop>
              <TableData>
                {targets.map(target => (
                  <span key={target.id}>
                    <DetailsLink id={target.id} type="target">
                      {target.name}
                    </DetailsLink>
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

PortListDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default PortListDetails;

// vim: set ts=2 sw=2 tw=80:
