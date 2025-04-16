/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import DetailsBlock from 'web/entity/Block';
import EntityLink from 'web/entity/Link';
import OverrideBox from 'web/entity/Override';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {
  translatedResultSeverityRiskFactor,
  LOG_VALUE,
} from 'web/utils/severity';

const OverrideDetails = ({entity}) => {
  const [_] = useTranslation();
  const {hosts, port, result, severity, task} = entity;
  return (
    <Layout flex="column" grow="1">
      <DetailsBlock title={_('Application')}>
        <InfoTable size="full">
          <colgroup>
            <Col width="10%" />
            <Col width="90%" />
          </colgroup>
          <TableBody>
            <TableRow>
              <TableData>{_('Hosts')}</TableData>
              <TableData>
                {hosts.length > 0 ? (
                  <HorizontalSep>
                    {hosts.map(host => {
                      return <span key={host}>{host}</span>;
                    })}
                  </HorizontalSep>
                ) : (
                  _('Any')
                )}
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Port')}</TableData>
              <TableData>{isDefined(port) ? port : _('Any')}</TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Severity')}</TableData>
              <TableData>
                {isDefined(severity)
                  ? severity > LOG_VALUE
                    ? _('> 0.0')
                    : translatedResultSeverityRiskFactor(severity)
                  : _('Any')}
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Task')}</TableData>
              <TableData>
                {entity.isOrphan() ? (
                  <b>{_('Orphan')}</b>
                ) : isDefined(task) ? (
                  <span>
                    <EntityLink entity={task} />
                  </span>
                ) : (
                  _('Any')
                )}
              </TableData>
            </TableRow>

            <TableRow>
              <TableData>{_('Result')}</TableData>
              <TableData>
                {entity.isOrphan() ? (
                  <b>{_('Orphan')}</b>
                ) : isDefined(result) ? (
                  <span>
                    <EntityLink entity={result} />
                  </span>
                ) : (
                  _('Any')
                )}
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>
      <DetailsBlock
        title={
          entity.isActive() ? _('Appearance') : _('Appearance when active')
        }
      >
        <OverrideBox detailsLink={false} override={entity} />
      </DetailsBlock>
    </Layout>
  );
};

OverrideDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default OverrideDetails;
