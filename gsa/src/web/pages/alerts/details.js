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

import {
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
  DELTA_TYPE_PREVIOUS,
  DELTA_TYPE_REPORT,
} from 'gmp/models/alert';

import {hasValue} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';
import HorizontalSep from 'web/components/layout/horizontalsep';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import Condition from './condition';
import Event from './event';
import Method from './method';

const AlertDetails = ({capabilities, entity, links = true, reportFormats}) => {
  const {comment, condition, event, method, tasks = [], filter} = entity;
  return (
    <Layout flex="column" grow>
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {hasValue(comment) && (
            <TableRow>
              <TableData>{_('Comment')}</TableData>
              <TableData>{comment}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Condition')}</TableData>
            <TableData>
              <Condition condition={condition} event={event} />
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Event')}</TableData>
            <TableData>
              <Event event={event} />
            </TableData>
          </TableRow>

          {capabilities.mayAccess('report') &&
            hasValue(method.data.delta_type) &&
            method.data.delta_type.value === DELTA_TYPE_PREVIOUS && (
              <TableRow>
                <TableData>{_('Delta Report')}</TableData>
                <TableData>
                  {_('Previous completed report of the same task')}
                </TableData>
              </TableRow>
            )}

          {capabilities.mayAccess('report') &&
            hasValue(method.data.delta_type) &&
            hasValue(method.data.delta_report_id) &&
            method.data.delta_type.value === DELTA_TYPE_REPORT && (
              <TableRow>
                <TableData>{_('Delta Report')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      id={method.data.delta_report_id.value}
                      type="report"
                    >
                      {_('Report ')} {method.data.delta_report_id.value}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
            )}

          <TableRow>
            <TableData>{_('Method')}</TableData>
            <TableData>
              <Method
                method={method}
                details={true}
                reportFormats={reportFormats}
              />
            </TableData>
          </TableRow>

          {hasValue(method.data) &&
            hasValue(method.data.details_url) &&
            hasValue(method.data.details_url.value) &&
            (event.type === EVENT_TYPE_NEW_SECINFO ||
              event.type === EVENT_TYPE_UPDATED_SECINFO) && (
              <TableRow>
                <TableData>{_('Details URL')}</TableData>
                <TableData>{method.data.details_url.value}</TableData>
              </TableRow>
            )}

          {capabilities.mayAccess('filter') && hasValue(filter) && (
            <TableRow>
              <TableData>{_('Results Filter')}</TableData>
              <TableData>
                <span>
                  <DetailsLink id={filter.id} type="filter">
                    {filter.name}
                  </DetailsLink>
                </span>
              </TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Active')}</TableData>
            <TableData>{entity.isActive() ? _('Yes') : _('No')}</TableData>
          </TableRow>

          {tasks.length > 0 && (
            <TableRow>
              <TableData>{_('Tasks using this Alert')}</TableData>
              <TableData>
                <HorizontalSep wrap>
                  {tasks.map(task => (
                    <span key={task.id}>
                      <DetailsLink id={task.id} type="task">
                        {task.name}
                      </DetailsLink>
                    </span>
                  ))}
                </HorizontalSep>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

AlertDetails.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  reportFormats: PropTypes.array,
};

export default withCapabilities(AlertDetails);

// vim: set ts=2 sw=2 tw=80:
