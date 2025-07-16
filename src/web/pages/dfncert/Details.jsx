/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import Layout from 'web/components/layout/Layout';
import ExternalLink from 'web/components/link/ExternalLink';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const DfnCertAdvDetails = ({entity}) => {
  const [_] = useTranslation();
  const {title, severity, advisoryLink} = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
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
};

export default DfnCertAdvDetails;
