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

import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityLink from 'web/entity/link';

import DetailsBlock from 'web/entity/block';
import OverrideBox from 'web/entity/override';
import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';
import {
  translatedResultSeverityRiskFactor,
  LOG_VALUE,
} from 'web/utils/severity';

const OverrideDetails = ({entity}) => {
  const {hosts, port, result, severity, task} = entity;
  return (
    <Layout grow="1" flex="column">
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
                    {hosts.map(host => (
                      <span key={host}>{host}</span>
                    ))}
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
        <OverrideBox override={entity} detailsLink={false} />
      </DetailsBlock>
    </Layout>
  );
};

OverrideDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default OverrideDetails;

// vim: set ts=2 sw=2 tw=80:
