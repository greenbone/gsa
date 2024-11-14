/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DateTime from 'web/components/date/datetime';

import {Col} from 'web/entity/page';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const CertInfo = ({info}) => {
  const {activationTime, expirationTime, issuer, md5_fingerprint} = info;
  return (
    <InfoTable>
      <colgroup>
        <Col width="10%" />
        <Col width="90%" />
      </colgroup>
      <TableBody>
        <TableRow data-testid="row_activation">
          <TableData data-testid="label_activation">{_('Activation')}</TableData>
          <TableData data-testid="value_activation">
            {isDefined(activationTime) ? (
              <DateTime date={activationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow data-testid="row_expiration">
          <TableData data-testid="label_expiration">{_('Expiration')}</TableData>
          <TableData data-testid="value_expiration">
            {isDefined(expirationTime) ? (
              <DateTime date={expirationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow data-testid="row_fingerprint">
          <TableData data-testid="label_expiration">{_('MD5 Fingerprint')}</TableData>
          <TableData data-testid="value_expiration">{md5_fingerprint}</TableData>
        </TableRow>

        <TableRow data-testid="row_issuer">
          <TableData data-testid="label_issuer">{_('Issuer')}</TableData>
          <TableData data-testid="value_issuer">{issuer}</TableData>
        </TableRow>
      </TableBody>
    </InfoTable>
  );
};

CertInfo.propTypes = {
  info: PropTypes.object.isRequired,
};

export default CertInfo;
