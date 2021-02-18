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

import {_, _l} from 'gmp/locale/lang';

import {isDefined, hasValue} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import Layout from 'web/components/layout/layout';

import ExternalLink from 'web/components/link/externallink';
import Link from 'web/components/link/link';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';

import PropTypes from 'web/utils/proptypes';

const CVSS_PROPS = {
  accessVector: _l('Access Vector'),
  accessComplexity: _l('Access Complexity'),
  authentication: _l('Authentication'),
  attackVector: _l('Attack Vector'),
  attackComplexity: _l('Attack Complexity'),
  privilegesRequired: _l('Privileges Required'),
  userInteraction: _l('User Interaction'),
  scope: _l('Scope'),
  confidentiality: _l('Confidentiality Impact'),
  integrity: _l('Integrity Impact'),
  availability: _l('Availability Impact'),
};

const CveDetails = ({entity}) => {
  const {description, refs = [], cvssVector, vector} = entity;

  return (
    <Layout flex="column" grow="1">
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
                <SeverityBar severity={entity.score / 10} />
              </TableData>
            </TableRow>
            {hasValue(cvssVector) && (
              <TableRow>
                <TableData>{_('Base Vector')}</TableData>
                <TableData>
                  <Link to="cvsscalculator" query={cvssVector}>
                    {cvssVector}
                  </Link>
                </TableData>
              </TableRow>
            )}
            {Object.entries(CVSS_PROPS)
              .filter(([name]) => hasValue(vector[name]))
              .map(([name, title]) => (
                <TableRow key={name}>
                  <TableData>{`${title}`}</TableData>
                  <TableData>{vector[name]}</TableData>
                </TableRow>
              ))}
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {refs.length > 0 && (
        <DetailsBlock title={_('References')}>
          <InfoTable>
            <TableBody>
              {refs.map(ref => (
                <TableRow key={ref.reference}>
                  <TableData>{ref.source}</TableData>
                  <TableData>
                    <span>
                      <ExternalLink to={ref.link}>{ref.reference}</ExternalLink>
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
