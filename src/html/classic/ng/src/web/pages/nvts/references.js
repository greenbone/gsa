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

import DetailsBlock from '../../entity/block.js';

import PropTypes from '../../utils/proptypes.js';

import Divider from '../../components/layout/divider.js';

import CertLink from '../../components/link/certlink.js';
import CveLink from '../../components/link/cvelink.js';
import ExternalLink from '../../components/link/externallink.js';

import InfoTable from '../../components/table/info.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const References = ({
  nvt,
  links = true,
}) => {
  const {cves, bids, certs, xrefs} = nvt;
  const has_reference = cves.length > 0 || bids.length > 0 ||
    certs.length > 0 || xrefs.length > 0;
  if (!has_reference) {
    return null;
  }
  return (
    <DetailsBlock
      title={_('References')}>
      <InfoTable>
        <TableBody>
          {cves.length > 0 &&
            <TableRow>
              <TableData>
                {_('CVE')}
              </TableData>
              <TableData>
                <Divider>
                  {
                    cves.map(cve_id => (
                      <CveLink
                        title={_('View Details of {{cve_id}}', {cve_id})}
                        key={cve_id}
                        id={cve_id}
                        textOnly={!links}
                      />
                    ))
                  }
                </Divider>
              </TableData>
            </TableRow>
          }

          {bids.length > 0 &&
            <TableRow>
              <TableData>
                {_('BID')}
              </TableData>
              <TableData>
                <Divider wrap>
                  {bids.map(bid => (
                    <span key={bid}>{bid}</span>
                  ))}
                </Divider>
              </TableData>
            </TableRow>
          }

          {certs.length > 0 &&
            <TableRow>
              <TableData>
                {_('CERT')}
              </TableData>
              <TableData>
                <Divider wrap>
                  {certs.map(cert => (
                    <CertLink
                      key={cert.id}
                      type={cert.type}
                      id={cert.id}
                      links={links}
                    />
                  ))}
                </Divider>
              </TableData>
            </TableRow>
          }

          {xrefs.length > 0 &&
            <TableRow>
              <TableData>
                {_('Other')}
              </TableData>
              <TableData>
                <Divider wrap>
                  {
                    xrefs.map(xref => (
                      <ExternalLink
                        key={xref.ref}
                        textOnly={!links || xref.type !== 'URL'}
                        href={xref.ref}>
                        {xref.ref}
                      </ExternalLink>
                    ))
                  }
                </Divider>
              </TableData>
            </TableRow>
          }
        </TableBody>
      </InfoTable>
    </DetailsBlock>
  );
};

References.propTypes = {
  nvt: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default References;

// vim: set ts=2 sw=2 tw=80:
