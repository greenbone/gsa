/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import DateTime from 'web/components/date/datetime';

import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableData from 'web/components/table/data';
import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

import {
  loadEntity as loadTlsCertificate,
  selector as tlsCertificateSelector,
} from 'web/store/entities/tlscertificates';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

const TlsCertificateDetails = ({entity, links = true}) => {
  return (
    <Layout grow="1" flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(entity.valid) && (
            <TableRow>
              <TableData>{_('Valid')}</TableData>
              <TableData>{renderYesNo(entity.valid)}</TableData>
            </TableRow>
          )}
          {isDefined(entity.activationTime) && (
            <TableRow>
              <TableData>{_('Activates')}</TableData>
              <TableData>
                <DateTime date={entity.activationTime} />
              </TableData>
            </TableRow>
          )}
          {isDefined(entity.expirationTime) && (
            <TableRow>
              <TableData>{_('Expires')}</TableData>
              <TableData>
                <DateTime date={entity.expirationTime} />
              </TableData>
            </TableRow>
          )}
          {isDefined(entity.sha256Fingerprint) && (
            <TableRow>
              <TableData>{_('SHA-256 Fingerprint')}</TableData>
              <TableData>{entity.sha256Fingerprint}</TableData>
            </TableRow>
          )}
          {isDefined(entity.md5Fingerprint) && (
            <TableRow>
              <TableData>{_('MD5 Fingerprint')}</TableData>
              <TableData>{entity.md5Fingerprint}</TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

TlsCertificateDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const mapStateToProps = (rootState, {entity = {}}) => {
  const tlsCertificateSel = tlsCertificateSelector(rootState);
  return {
    tlsCertificate: tlsCertificateSel.getEntity(entity.id),
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadTlsCertificate: id => dispatch(loadTlsCertificate(gmp)(id)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(TlsCertificateDetails);

// vim: set ts=2 sw=2 tw=80:
