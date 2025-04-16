/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import CertLink from 'web/components/link/CertLink';
import CveLink from 'web/components/link/CveLink';
import ExternalLink from 'web/components/link/ExternalLink';
import TableBody from 'web/components/table/Body';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import DetailsBlock from 'web/entity/Block';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const References = ({nvt, links = true}) => {
  const [_] = useTranslation();
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
                {cves.map(cve_id => {
                  return (
                    <span key={cve_id}>
                      <CveLink
                        id={cve_id}
                        textOnly={!links}
                        title={_('View Details of {{cve_id}}', {cve_id})}
                      />
                    </span>
                  );
                })}
              </TableData>
            </TableRow>
          )}

          {certs.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('CERT')}</TableDataAlignTop>
              <TableData>
                {certs.map(cert => {
                  return (
                    <span key={cert.id}>
                      <CertLink
                        id={cert.id}
                        textOnly={!links}
                        type={cert.type}
                      />
                    </span>
                  );
                })}
              </TableData>
            </TableRow>
          )}

          {xrefs.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('Other')}</TableDataAlignTop>
              <TableData>
                {xrefs.map(xref => {
                  return (
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
                  );
                })}
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
