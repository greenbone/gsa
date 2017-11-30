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

import DetailsBlock from '../../entity/block.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Layout from '../../components/layout/layout.js';

import ExternalLink from '../../components/link/externallink.js';
import LegacyLink from '../../components/link/legacylink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const cvss_props = {
  cvss_access_vector: _('Access Vector'),
  cvss_access_complexity: _('Access Complexity'),
  cvss_authentication: _('Authentication'),
  cvss_confidentiality_impact: _('Confidentiality Impact'),
  cvss_integrity_impact: _('Integrity Impact'),
  cvss_availability_impact: _('Availability Impact'),
};

const CveDetails = ({
  entity,
}) => {
  const {
    cvss_base_vector,
    cwe_id,
    description,
    references = [],
    severity,
  } = entity;

  return (
    <Layout
      flex="column"
      grow="1">

      {is_defined(cwe_id) &&
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('CWE ID')}
              </TableData>
              <TableData>
                {entity.cwe_id}
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      }

      {is_defined(description) &&
        <DetailsBlock
          title={_('Description')}>
          <p>{description}</p>
        </DetailsBlock>
      }

      <DetailsBlock
        title={_('CVSS')}>
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Base Score')}
              </TableData>
              <TableData>
                <SeverityBar
                  severity={severity}
                />
              </TableData>
            </TableRow>
            {is_defined(cvss_base_vector) &&
              <TableRow>
                <TableData>
                  {_('Base Vector')}
                </TableData>
                <TableData>
                  <LegacyLink
                    target="_blank"
                    cmd="cvss_calculator"
                    cvss_vector={cvss_base_vector}
                  >
                    {cvss_base_vector}
                  </LegacyLink>
                </TableData>
              </TableRow>
            }
            {Object.entries(cvss_props)
              .filter(([name]) => is_defined(entity[name]))
              .map(([name, title]) => (
                <TableRow key={name}>
                  <TableData>
                    {title}
                  </TableData>
                  <TableData>
                    {entity[name]}
                  </TableData>
                </TableRow>
              )
            )}
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {references.length > 0 &&
        <DetailsBlock
          title={_('References')}>
          <InfoTable>
            <TableBody>
              {references.map(ref => (
                <TableRow
                  key={ref.name}
                >
                  <TableData>
                    {ref.source}
                  </TableData>
                  <TableData>
                    <ExternalLink
                      to={ref.href}>
                      {ref.name}
                    </ExternalLink>
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }
    </Layout>
  );
};

CveDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default CveDetails;

// vim: set ts=2 sw=2 tw=80:
