/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import Comment from 'web/components/comment/comment';

import DateTime from 'web/components/date/datetime';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableData from 'web/components/table/data';
import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import EntityLink from 'web/entity/link';
import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const TicketDetails = ({entity, links = true}) => {
  const {task = {}} = entity;
  const taskIsInTrash = isDefined(task.isInTrash) ? task.isInTrash() : false;
  return (
    <React.Fragment>
      {!entity.isOrphan() && (
        <DetailsBlock title={_('References')}>
          <InfoTable size="full">
            <colgroup>
              <Col width="10%" />
              <Col width="90%" />
            </colgroup>
            <TableBody>
              {isDefined(entity.task) && (
                <TableRow>
                  <TableData>{_('Task')}</TableData>
                  <TableData>
                    <span>
                      <EntityLink entity={entity.task} textOnly={!links} />
                    </span>
                  </TableData>
                </TableRow>
              )}
              {isDefined(entity.report) && (
                <TableRow>
                  <TableData>{_('Report')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        type="report"
                        id={entity.report.id}
                        textOnly={!links}
                      >
                        <DateTime date={entity.report.timestamp} />
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
              {isDefined(entity.result) && (
                <TableRow>
                  <TableData>{_('Result')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        type="result"
                        id={entity.result.id}
                        textOnly={!links || taskIsInTrash}
                      >
                        {entity.name}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      )}
      <DetailsBlock title={_('Status Details')}>
        <InfoTable size="full">
          <colgroup>
            <Col width="10%" />
            <Col width="90%" />
          </colgroup>
          <TableBody>
            {isDefined(entity.openTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Opened')}</TableData>
                  <TableData>
                    <DateTime date={entity.openTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Note')}</TableData>
                  <TableData>
                    <Comment>{entity.openNote}</Comment>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
            {isDefined(entity.fixedTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Fixed')}</TableData>
                  <TableData>
                    <DateTime date={entity.fixedTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Note')}</TableData>
                  <TableData>
                    <Comment>{entity.fixedNote}</Comment>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
            {isDefined(entity.fixedVerifiedTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Fix Verified')}</TableData>
                  <TableData>
                    <DateTime date={entity.fixedVerifiedTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Report')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        type="report"
                        id={entity.fixedVerifiedReport.id}
                        textOnly={!links}
                      >
                        <DateTime date={entity.fixedVerifiedReport.timestamp} />
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
            {isDefined(entity.closedTime) && (
              <React.Fragment>
                <TableRow>
                  <TableData>{_('Closed')}</TableData>
                  <TableData>
                    <DateTime date={entity.closedTime} />
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('With Note')}</TableData>
                  <TableData>
                    <Comment>{entity.closedNote}</Comment>
                  </TableData>
                </TableRow>
              </React.Fragment>
            )}
          </TableBody>
        </InfoTable>
      </DetailsBlock>
    </React.Fragment>
  );
};

TicketDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool.isRequired,
};

export default TicketDetails;
