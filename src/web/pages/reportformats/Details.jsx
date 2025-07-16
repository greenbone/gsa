/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Col from 'web/components/table/Col';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData, {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import {formattedUserSettingShortDate} from 'web/utils/userSettingTimeDateFormatters';

const ReportFormatDetails = ({entity}) => {
  const [_] = useTranslation();
  const {
    configurable,
    deprecated,
    extension,
    content_type,
    report_type,
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

          {report_type && (
            <TableRow>
              <TableData>{_('Report Type')}</TableData>
              <TableData>{report_type}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Trust')}</TableData>
            <TableData>
              <Divider>
                <span>{renderYesNo(trust.value)}</span>
                {isDefined(trust.time) && (
                  <span>({formattedUserSettingShortDate(trust.time)})</span>
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
                {alerts.map(alert => {
                  return (
                    <span key={alert.id}>
                      <DetailsLink id={alert.id} type="alert">
                        {alert.name}
                      </DetailsLink>
                    </span>
                  );
                })}
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
                {report_configs.map(report_config => {
                  return (
                    <span key={report_config.id}>
                      <DetailsLink id={report_config.id} type="reportconfig">
                        {report_config.name}
                      </DetailsLink>
                    </span>
                  );
                })}
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
};

export default ReportFormatDetails;
