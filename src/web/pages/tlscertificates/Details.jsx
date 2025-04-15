/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import useTranslation from 'src/web/hooks/useTranslation';
import DateTime from 'web/components/date/DateTime';
import Layout from 'web/components/layout/Layout';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import {
  loadEntity as loadTlsCertificate,
  selector as tlsCertificateSelector,
} from 'web/store/entities/tlscertificates';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';

const TlsCertificateDetails = ({entity}) => {
  const [_] = useTranslation();
  return (
    <Layout flex="column" grow="1">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(entity.subjectDn) && (
            <TableRow>
              <TableData>{_('Subject DN')}</TableData>
              <TableData>{entity.subjectDn}</TableData>
            </TableRow>
          )}
          {isDefined(entity.issuerDn) && (
            <TableRow>
              <TableData>{_('Issuer DN')}</TableData>
              <TableData>{entity.issuerDn}</TableData>
            </TableRow>
          )}
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
