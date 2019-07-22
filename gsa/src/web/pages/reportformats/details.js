/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
    extension,
    content_type,
    trust = {},
    summary,
    description,
    alerts = [],
  } = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
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
            <TableData>{_('Predefined')}</TableData>
            <TableData>{renderYesNo(entity.isPredefined())}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Summary')}</TableData>
            <TableData>{summary}</TableData>
          </TableRow>

          {alerts.length > 0 && (
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
