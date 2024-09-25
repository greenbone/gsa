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
        <TableRow>
          <TableData>{_('Activation')}</TableData>
          <TableData>
            {isDefined(activationTime) ? (
              <DateTime date={activationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>{_('Expiration')}</TableData>
          <TableData>
            {isDefined(expirationTime) ? (
              <DateTime date={expirationTime} />
            ) : (
              _('N/A')
            )}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>{_('MD5 Fingerprint')}</TableData>
          <TableData>{md5_fingerprint}</TableData>
        </TableRow>

        <TableRow>
          <TableData>{_('Issuer')}</TableData>
          <TableData>{issuer}</TableData>
        </TableRow>
      </TableBody>
    </InfoTable>
  );
};

CertInfo.propTypes = {
  info: PropTypes.object.isRequired,
};

export default CertInfo;
