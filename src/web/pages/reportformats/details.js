/* Copyright (C) 2017-2022 Greenbone AG
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
import {shortDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const ReportFormatDetails = ({entity, links = true}) => {
  const {
    configurable,
    deprecated,
    extension,
    content_type,
    trust = {},
    summary,
    description,
    alerts = [],
    invisible_alerts = 0,
    report_configs = [],
    invisible_report_configs = 0,
  } = entity;

  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {deprecated && (
            <TableRow>
              <TableData>{_('Deprecated')}</TableData>
              <TableData>{_('yes')}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Extension')}</TableData>
            <TableData>{extension}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Content Type')}</TableData>
            <TableData>{content_type}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Trust')}</TableData>
            <TableData>
              <Divider>
                <span>{renderYesNo(trust.value)}</span>
                {isDefined(trust.time) && (
                  <span>({shortDate(trust.time)})</span>
                )}
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Active')}</TableData>
            <TableData>{renderYesNo(entity.isActive())}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Summary')}</TableData>
            <TableData>{summary}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Configurable')}</TableData>
            <TableData>{renderYesNo(configurable)}</TableData>
          </TableRow>

          {(alerts.length > 0 || invisible_alerts > 0) && (
            <TableRow>
              <TableDataAlignTop>
                {_('Alerts using this Report Format')}
              </TableDataAlignTop>
              <TableData>
                {alerts.map(alert => (
                  <span key={alert.id}>
                    <DetailsLink id={alert.id} type="alert">
                      {alert.name}
                    </DetailsLink>
                  </span>
                ))}
                {invisible_alerts > 0 && (
                  <span>
                    {_('{{count}} alert(s) only visible to other users', {
                      count: invisible_alerts,
                    })}
                  </span>
                )}
              </TableData>
            </TableRow>
          )}

          {(report_configs.length > 0 || invisible_report_configs > 0) && (
            <TableRow>
              <TableDataAlignTop>
                {_('Report Configs using this Report Format')}
              </TableDataAlignTop>
              <TableData>
                {report_configs.map(report_config => (
                  <span key={report_config.id}>
                    <DetailsLink id={report_config.id} type="reportconfig">
                      {report_config.name}
                    </DetailsLink>
                  </span>
                ))}
                {invisible_report_configs > 0 && (
                  <span>
                    {_(
                      '{{count}} report config(s) only visible to other users',
                      {count: invisible_report_configs},
                    )}
                  </span>
                )}
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>

      <h2>{_('Description')}</h2>
      <pre>{description}</pre>
    </Layout>
  );
};

ReportFormatDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ReportFormatDetails;

// vim: set ts=2 sw=2 tw=80:
