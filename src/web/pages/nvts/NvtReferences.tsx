/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Nvt from 'gmp/models/nvt';
import {isDefined} from 'gmp/utils/identity';
import CertLink from 'web/components/link/CertLink';
import CveLink from 'web/components/link/CveLink';
import ExternalLink from 'web/components/link/ExternalLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData, {TableDataAlignTop} from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/DetailsBlock';
import useTranslation from 'web/hooks/useTranslation';

interface NvtReferencesProps {
  nvt: Nvt;
  links?: boolean;
  'data-testid'?: string;
}

const NvtReferences = ({
  nvt,
  links = true,
  'data-testid': dataTestId = 'nvt-references',
}: NvtReferencesProps) => {
  const [_] = useTranslation();
  const {cves = [], certs = [], xrefs = []} = nvt;
  const hasReference = cves.length > 0 || certs.length > 0 || xrefs.length > 0;
  if (!hasReference) {
    return null;
  }
  return (
    <DetailsBlock data-testid={dataTestId} title={_('References')}>
      <InfoTable>
        <TableBody>
          {cves.length > 0 && (
            <TableRow>
              <TableDataAlignTop>{_('CVE')}</TableDataAlignTop>
              <TableData>
                {cves.map(cveId => {
                  return (
                    <span key={cveId}>
                      <CveLink
                        id={cveId}
                        textOnly={!links}
                        title={_('View Details of {{cve_id}}', {cve_id: cveId})}
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

export default NvtReferences;
