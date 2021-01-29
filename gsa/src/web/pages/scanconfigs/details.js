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

import {isDefined} from 'gmp/utils/identity';

import {OSP_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const ScanConfigDetails = ({entity}) => {
  const {comment, scanConfigType, scanner, tasks = []} = entity;
  return (
    <Layout flex="column" grow>
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
          {scanConfigType === OSP_SCAN_CONFIG_TYPE && isDefined(scanner) && (
            <TableRow>
              <TableData>{_('Scanner')}</TableData>
              <TableData>
                <span>
                  <DetailsLink type="scanner" id={scanner.id}>
                    {scanner.name}
                  </DetailsLink>
                </span>
              </TableData>
            </TableRow>
          )}

          {tasks.length > 0 && (
            <TableRow>
              <TableData>{_('Tasks using this Scan Config')}</TableData>
              <TableData>
                <Divider wrap>
                  {tasks.map((task, index) => {
                    return (
                      <React.Fragment key={task.id}>
                        <DetailsLink id={task.id} type="task">
                          {task.name}
                        </DetailsLink>
                        {index !== tasks.length - 1 && ','}
                      </React.Fragment>
                    );
                  })}
                </Divider>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

ScanConfigDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default ScanConfigDetails;

// vim: set ts=2 sw=2 tw=80:
