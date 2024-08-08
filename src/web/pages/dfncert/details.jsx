/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';

import Layout from 'web/components/layout/layout';

import ExternalLink from 'web/components/link/externallink';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import {Col} from 'web/entity/page';

const DfnCertAdvDetails = ({entity, links = true}) => {
  const {title, severity, advisoryLink} = entity;
  return (
    <Layout flex="column" grow>
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

// vim: set ts=2 sw=2 tw=80:
