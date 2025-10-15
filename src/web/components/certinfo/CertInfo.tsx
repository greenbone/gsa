/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type Date as GmpDate} from 'gmp/models/date';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';

interface CertInfoProps {
  info: {
    activationTime?: GmpDate;
    expirationTime?: GmpDate;
    issuer?: string;
    md5Fingerprint?: string;
  };
}

const CertInfo = ({info}: CertInfoProps) => {
  const [_] = useTranslation();
  const {activationTime, expirationTime, issuer, md5Fingerprint} = info;
  return (
    <InfoTable data-testid="cert-info-table">
      <colgroup>
        <TableCol width="10%" />
        <TableCol width="90%" />
      </colgroup>
      <TableBody>
        <TableRow data-testid="cert-info-activation-row">
          <TableData data-testid="cert-info-activation-label">
            {_('Activation')}
          </TableData>
          <TableData data-testid="cert-info-activation-data">
            {isDefined(activationTime) ? (
              <DateTime date={activationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow data-testid="cert-info-expiration-row">
          <TableData data-testid="cert-info-expiration-label">
            {_('Expiration')}
          </TableData>
          <TableData data-testid="cert-info-expiration-data">
            {isDefined(expirationTime) ? (
              <DateTime date={expirationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow data-testid="cert-info-md5-row">
          <TableData data-testid="cert-info-md5-label">
            {_('MD5 Fingerprint')}
          </TableData>
          <TableData data-testid="cert-info-md5-data">
            {md5Fingerprint}
          </TableData>
        </TableRow>

        <TableRow data-testid="cert-info-issuer-row">
          <TableData data-testid="cert-info-issuer-label">
            {_('Issuer')}
          </TableData>
          <TableData data-testid="cert-info-issuer-data">{issuer}</TableData>
        </TableRow>
      </TableBody>
    </InfoTable>
  );
};

export default CertInfo;
