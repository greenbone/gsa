/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import DetailsBlock from 'web/entity/block';

import PropTypes from 'web/utils/proptypes';

import CertLink from 'web/components/link/certlink';
import CveLink from 'web/components/link/cvelink';
import ExternalLink from 'web/components/link/externallink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData, {TableDataAlignTop} from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const References = ({nvt, links = true}) => {
  const {cves = [], certs = [], xrefs = []} = nvt;
  const has_reference = cves.length > 0 || certs.length > 0 || xrefs.length > 0;
  if (!has_reference) {
    return null;
  }
  return (
    <DetailsBlock title={_('References')}>
      <InfoTable>
        <TableBody>
          {cves.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('CVE')}</TableDataAlignTop>
              <TableData>
                {cves.map(cve_id => (
                  <span key={cve_id}>
                    <CveLink
                      title={_('View Details of {{cve_id}}', {cve_id})}
                      id={cve_id}
                      textOnly={!links}
                    />
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}

          {certs.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('CERT')}</TableDataAlignTop>
              <TableData>
                {certs.map(cert => (
                  <span key={cert.id}>
                    <CertLink type={cert.type} id={cert.id} textOnly={!links} />
                  </span>
                ))}
              </TableData>
            </TableRow>
          )}

          {xrefs.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('Other')}</TableDataAlignTop>
              <TableData>
                {xrefs.map(xref => (
                  <span key={xref.ref}>
                    <ExternalLink
                      textOnly={!links || xref.type !== 'url'}
                      to={xref.ref}
                    >
                      {isDefined(xref.type) &&
                        xref.type !== 'url' &&
                        xref.type + ': '}
                      {xref.ref}
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
