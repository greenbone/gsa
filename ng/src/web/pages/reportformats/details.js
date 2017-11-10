/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _, {short_date} from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_yesno} from '../../utils/render.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const ReportFormatDetails = ({
  entity,
  links = true,
}) => {
  const {
    extension,
    content_type,
    trust = {},
    summary,
    description,
    alerts = [],
  } = entity;
  return (
    <Layout
      grow
      flex="column"
    >
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Extension')}
            </TableData>
            <TableData>
              {extension}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Content Type')}
            </TableData>
            <TableData>
              {content_type}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Trust')}
            </TableData>
            <TableData>
              <Divider>
                <span>
                  {render_yesno(trust.value)}
                </span>
                {is_defined(trust.time) &&
                  <span>({short_date(trust.time)})</span>
                }
              </Divider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Active')}
            </TableData>
            <TableData>
              {render_yesno(entity.isActive())}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Predefined')}
            </TableData>
            <TableData>
              {render_yesno(entity.isPredefined())}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Summary')}
            </TableData>
            <TableData>
              {summary}
            </TableData>
          </TableRow>

          {alerts.length > 0 &&
            <TableRow>
              <TableData>
                {_('Alerts using this Report Format')}
              </TableData>
              <TableData>
                <Divider>
                  {alerts.map(alert => (
                    <DetailsLink
                      key={alert.id}
                      id={alert.id}
                      type="alert"
                    >
                      {alert.name}
                    </DetailsLink>
                  ))}
                </Divider>
              </TableData>
            </TableRow>
          }

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
