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

import DetailsBlock from 'web/entity/block';

import CertLink from 'web/components/link/certlink';
import CveLink from 'web/components/link/cvelink';
import ExternalLink from 'web/components/link/externallink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';

const References = ({nvt, links = true}) => {
  const {
    cveReferences = [],
    bidReferences = [],
    certReferences = [],
    otherReferences = [],
  } = nvt;
  const has_reference =
    cveReferences.length > 0 ||
    bidReferences.length > 0 ||
    certReferences.length > 0 ||
    otherReferences.length > 0;
  if (!has_reference) {
    return null;
  }
  return (
    <DetailsBlock title={_('References')}>
      <InfoTable>
        <TableBody>
          {cveReferences.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('CVE')}</TableDataAlignTop>
              <TableData>
                {cveReferences.map(cve => (
                  <span key={cve.id}>
                    <CveLink
                      title={_('View Details of {{id}}', {id: cve.id})}
                      id={cve.id}
                      textOnly={!links}
                    />
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}

          {bidReferences.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('BID')}</TableDataAlignTop>
              <TableData>
                {bidReferences.map(bid => (
                  <span key={bid.id}>{bid.id}</span>
                ))}
              </TableData>
            </TableRow>
          )}

          {certReferences.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('CERT')}</TableDataAlignTop>
              <TableData>
                {certReferences.map(cert => (
                  <span key={cert.id}>
                    <CertLink type={cert.type} id={cert.id} textOnly={!links} />
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}

          {otherReferences.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('Other')}</TableDataAlignTop>
              <TableData>
                {otherReferences.map(xref => (
                  <span key={xref.id}>
                    <ExternalLink
                      textOnly={!links || xref.type !== 'url'}
                      to={xref.id}
                    >
                      {xref.id}
                    </ExternalLink>
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </DetailsBlock>
  );
};

References.propTypes = {
  links: PropTypes.bool,
  nvt: PropTypes.model.isRequired,
};

export default References;

// vim: set ts=2 sw=2 tw=80:
