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

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Layout from '../../components/layout/layout.js';

import ExternalLink from '../../components/link/externallink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const DfnCertAdvDetails = ({
  entity,
  links = true,
}) => {
  const {
    title,
    severity,
    advisory_link,
  } = entity;
  return (
    <Layout
      flex="column"
      grow>

      <InfoTable>
        <TableBody>

          {is_defined(title) &&
            <TableRow>
              <TableData>
                {_('Title')}
              </TableData>
              <TableData>
                {title}
              </TableData>
            </TableRow>
          }

          <TableRow>
            <TableData>
              {_('Severity')}
            </TableData>
            <TableData>
              <SeverityBar
                severity={severity}
              />
            </TableData>
          </TableRow>

          {is_defined(advisory_link) &&
            <TableRow>
              <TableData>
                {_('Advisory Link')}
              </TableData>
              <TableData>
                <ExternalLink
                  to={advisory_link}
                >
                  {advisory_link}
                </ExternalLink>
              </TableData>
            </TableRow>
          }
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

DfnCertAdvDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default DfnCertAdvDetails;

// vim: set ts=2 sw=2 tw=80:
