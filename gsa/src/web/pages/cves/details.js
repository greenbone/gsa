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
import 'core-js/fn/object/entries';

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import DetailsBlock from 'web/entity/block';

import SeverityBar from 'web/components/bar/severitybar';

import Layout from 'web/components/layout/layout';

import ExternalLink from 'web/components/link/externallink';
import Link from 'web/components/link/link';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';

const CVSS_PROPS = {
  cvssAccessVector: _l('Access Vector'),
  cvssAccessComplexity: _l('Access Complexity'),
  cvssAuthentication: _l('Authentication'),
  cvssConfidentialityImpact: _l('Confidentiality Impact'),
  cvssIntegrityImpact: _l('Integrity Impact'),
  cvssAvailabilityImpact: _l('Availability Impact'),
};

const CveDetails = ({entity}) => {
  const {
    cvssBaseVector,
    cwe_id,
    description,
    references = [],
    severity,
  } = entity;

  return (
    <Layout flex="column" grow="1">
      {isDefined(cwe_id) && (
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>{_('CWE ID')}</TableData>
              <TableData>{entity.cwe_id}</TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      )}

      {isDefined(description) && (
        <DetailsBlock title={_('Description')}>
          <p>{description}</p>
        </DetailsBlock>
      )}

      <DetailsBlock title={_('CVSS')}>
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>{_('Base Score')}</TableData>
              <TableData>
                <SeverityBar severity={severity} />
              </TableData>
            </TableRow>
            {isDefined(cvssBaseVector) && (
              <TableRow>
                <TableData>{_('Base Vector')}</TableData>
                <TableData>
                  <Link
                    to="cvsscalculator"
                    query={{cvssVector: cvssBaseVector}}
                  >
                    {cvssBaseVector}
                  </Link>
                </TableData>
              </TableRow>
            )}
            {Object.entries(CVSS_PROPS)
              .filter(([name]) => isDefined(entity[name]))
              .map(([name, title]) => (
                <TableRow key={name}>
                  <TableData>{`${title}`}</TableData>
                  <TableData>{entity[name]}</TableData>
                </TableRow>
              ))}
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {references.length > 0 && (
        <DetailsBlock title={_('References')}>
          <InfoTable>
            <TableBody>
              {references.map(ref => (
                <TableRow key={ref.name}>
                  <TableData>{ref.source}</TableData>
                  <TableData>
                    <span>
                      <ExternalLink to={ref.href}>{ref.name}</ExternalLink>
                    </span>
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      )}
    </Layout>
  );
};

CveDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default CveDetails;

// vim: set ts=2 sw=2 tw=80:
