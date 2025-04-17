/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DateTime from 'web/components/date/DateTime';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const CertInfo = ({info}) => {
  const [_] = useTranslation();
  const {activationTime, expirationTime, issuer, md5_fingerprint} = info;
  return (
    <InfoTable data-testid="cert-info-table">
      <colgroup>
        <Col width="10%" />
        <Col width="90%" />
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
            {md5_fingerprint}
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

CertInfo.propTypes = {
  info: PropTypes.object.isRequired,
};

export default CertInfo;
