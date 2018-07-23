/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import DetailsBlock from '../../entity/block.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Layout from '../../components/layout/layout.js';

import ExternalLink from '../../components/link/externallink.js';
import Link from '../../components/link/link.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const CVSS_PROPS = {
  cvssAccessVector: _('Access Vector'),
  cvssAccessComplexity: _('Access Complexity'),
  cvssAuthentication: _('Authentication'),
  cvssConfidentialityImpact: _('Confidentiality Impact'),
  cvssIntegrityImpact: _('Integrity Impact'),
  cvssAvailabilityImpact: _('Availability Impact'),
};

const CveDetails = ({
  entity,
}) => {
  const {
    cvssBaseVector,
    cwe_id,
    description,
    references = [],
    severity,
  } = entity;

  return (
    <Layout
      flex="column"
      grow="1"
    >

      {isDefined(cwe_id) &&
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

      {isDefined(description) &&
        <DetailsBlock
          title={_('Description')}
        >
          <p>{description}</p>
        </DetailsBlock>
      }

      <DetailsBlock
        title={_('CVSS')}
      >
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
            {isDefined(cvssBaseVector) &&
              <TableRow>
                <TableData>
                  {_('Base Vector')}
                </TableData>
                <TableData>
                  <Link
                    to="cvsscalculator"
                    query={{cvssVector: cvssBaseVector}}
                  >
                    {cvssBaseVector}
                  </Link>
                </TableData>
              </TableRow>
            }
            {Object.entries(CVSS_PROPS)
              .filter(([name]) => isDefined(entity[name]))
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
          title={_('References')}
        >
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
                      to={ref.href}
                    >
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
