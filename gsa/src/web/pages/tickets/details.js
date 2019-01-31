/* Copyright (C) 2019 Greenbone Networks GmbH
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
import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import Comment from 'web/components/comment/comment';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableData from 'web/components/table/data';
import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import EntityLink from 'web/entity/link';
import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const TicketDetails = ({
  entity,
  links = true,
}) => (
  <React.Fragment>
    <DetailsBlock
      title={_('References')}
    >
      <InfoTable>
        <colgroup>
          <Col width="10%"/>
          <Col width="90%"/>
        </colgroup>
        <TableBody>
          {isDefined(entity.task) &&
            <TableRow>
              <TableData>
                {_('Task')}
              </TableData>
              <TableData>
                <EntityLink
                  entity={entity.task}
                  textOnly={!links}
                />
              </TableData>
            </TableRow>
          }
          {isDefined(entity.report) &&
            <TableRow>
              <TableData>
                {_('Report')}
              </TableData>
              <TableData>
                <DetailsLink
                  type="report"
                  id={entity.report.id}
                  textOnly={!links}
                >
                  {longDate(entity.report.timestamp)}
                </DetailsLink>
              </TableData>
            </TableRow>
          }
          {isDefined(entity.result) &&
            <TableRow>
              <TableData>
                {_('Result')}
              </TableData>
              <TableData>
                <DetailsLink
                  type="result"
                  id={entity.result.id}
                  textOnly={!links}
                >
                  {entity.name}
                </DetailsLink>
              </TableData>
            </TableRow>
          }
        </TableBody>
      </InfoTable>
    </DetailsBlock>

    <DetailsBlock
      title={_('Status Details')}
    >
      <InfoTable>
        <colgroup>
          <Col width="10%"/>
          <Col width="90%"/>
        </colgroup>
        <TableBody>
          {isDefined(entity.openTime) &&
            <React.Fragment>
              <TableRow>
                <TableData>
                  {_('Opened')}
                </TableData>
                <TableData>
                  {longDate(entity.openTime)}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('With Note')}
                </TableData>
                <TableData>
                  <Comment>
                    {entity.openNote}
                  </Comment>
                </TableData>
              </TableRow>
            </React.Fragment>
          }
          {isDefined(entity.fixedTime) &&
            <React.Fragment>
              <TableRow>
                <TableData>
                  {_('Fixed')}
                </TableData>
                <TableData>
                  {longDate(entity.fixedTime)}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('With Note')}
                </TableData>
                <TableData>
                  <Comment>
                    {entity.fixedNote}
                  </Comment>
                </TableData>
              </TableRow>
            </React.Fragment>
          }
          {isDefined(entity.fixedVerifiedTime) &&
            <React.Fragment>
              <TableRow>
                <TableData>
                  {_('Fix Verified')}
                </TableData>
                <TableData>
                  {longDate(entity.fixedVerifiedTime)}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('With Report')}
                </TableData>
                <TableData>
                  <DetailsLink
                    type="report"
                    id={entity.fixedVerifiedReport.id}
                    textOnly={!links}
                  >
                    {longDate(entity.fixedVerifiedReport.timestamp)}
                  </DetailsLink>
                </TableData>
              </TableRow>
            </React.Fragment>
          }
          {isDefined(entity.closedTime) &&
            <React.Fragment>
              <TableRow>
                <TableData>
                  {_('Closed')}
                </TableData>
                <TableData>
                  {longDate(entity.closedTime)}
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('With Note')}
                </TableData>
                <TableData>
                  <Comment>
                    {entity.closedNote}
                  </Comment>
                </TableData>
              </TableRow>
            </React.Fragment>
          }
        </TableBody>
      </InfoTable>
    </DetailsBlock>
  </React.Fragment>
);

TicketDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool.isRequired,
};

export default TicketDetails;
