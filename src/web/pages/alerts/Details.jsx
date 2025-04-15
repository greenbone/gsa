/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EVENT_TYPE_UPDATED_SECINFO,
  EVENT_TYPE_NEW_SECINFO,
  DELTA_TYPE_PREVIOUS,
  DELTA_TYPE_REPORT,
} from 'gmp/models/alert';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import Condition from 'web/pages/alerts/Condition';
import Event from 'web/pages/alerts/Event';
import Method from 'web/pages/alerts/Method';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

const AlertDetails = ({capabilities, entity, reportFormats, reportConfigs}) => {
  const [_] = useTranslation();
  const {comment, condition, event, method, tasks = [], filter} = entity;
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
            method?.data?.delta_type?.value === DELTA_TYPE_PREVIOUS && (
              <TableRow>
                <TableData>{_('Delta Report')}</TableData>
                <TableData>
                  {_('Previous completed report of the same task')}
                </TableData>
              </TableRow>
            )}

          {capabilities.mayAccess('report') &&
            isDefined(method?.data?.delta_type) &&
            isDefined(method?.data?.delta_report_id) &&
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
                details={true}
                method={method}
                reportConfigs={reportConfigs}
                reportFormats={reportFormats}
              />
            </TableData>
          </TableRow>

          {isDefined(method?.data?.details_url?.value) &&
            (event.type === EVENT_TYPE_NEW_SECINFO ||
              event.type === EVENT_TYPE_UPDATED_SECINFO) && (
              <TableRow>
                <TableData>{_('Details URL')}</TableData>
                <TableData>{method.data.details_url.value}</TableData>
              </TableRow>
            )}

          {capabilities.mayAccess('filter') && isDefined(filter) && (
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
                <HorizontalSep $wrap>
                  {tasks.map(task => {
                    const [_] = useTranslation();

                    return (
                      <span key={task.id}>
                        <DetailsLink id={task.id} type="task">
                          {task.name}
                        </DetailsLink>
                      </span>
                    );
                  })}
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
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
};

export default withCapabilities(AlertDetails);
