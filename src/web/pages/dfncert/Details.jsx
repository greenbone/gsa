/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import SeverityBar from 'web/components/bar/SeverityBar';
import Layout from 'web/components/layout/Layout';
import ExternalLink from 'web/components/link/ExternalLink';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import {Col} from 'web/entity/Page';
import PropTypes from 'web/utils/PropTypes';

const DfnCertAdvDetails = ({entity, links = true}) => {
  const {title, severity, advisoryLink} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(title) && (
            <TableRow>
              <TableData>{_('Title')}</TableData>
              <TableData>{title}</TableData>
            </TableRow>
          )}

          <TableRow>
            <TableData>{_('Severity')}</TableData>
            <TableData>
              <SeverityBar severity={severity} />
            </TableData>
          </TableRow>

          {isDefined(advisoryLink) && (
            <TableRow>
              <TableData>{_('Advisory Link')}</TableData>
              <TableData>
                <span>
                  <ExternalLink to={advisoryLink}>{advisoryLink}</ExternalLink>
                </span>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

DfnCertAdvDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default DfnCertAdvDetails;
