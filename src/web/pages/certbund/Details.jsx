/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import Layout from 'web/components/layout/Layout';
import ExternalLink from 'web/components/link/ExternalLink';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const CertBundAdvDetails = ({entity}) => {
  const [_] = useTranslation();
  const {
    title,
    version,
    severity,
    software,
    platform,
    effect,
    remoteAttack,
    risk,
    referenceSource,
    referenceUrl,
  } = entity;
  return (
    <Layout grow flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          {isDefined(version) && (
            <TableRow>
              <TableData>{_('Version')}</TableData>
              <TableData>{version}</TableData>
            </TableRow>
          )}
          {isDefined(title) && (
            <TableRow>
              <TableData>{_('Title')}</TableData>
              <TableData>{title}</TableData>
            </TableRow>
          )}
          {isDefined(software) && (
            <TableRow>
              <TableData>{_('Software')}</TableData>
              <TableData>{software}</TableData>
            </TableRow>
          )}
          {isDefined(platform) && (
            <TableRow>
              <TableData>{_('Platform')}</TableData>
              <TableData>{platform}</TableData>
            </TableRow>
          )}
          {isDefined(effect) && (
            <TableRow>
              <TableData>{_('Effect')}</TableData>
              <TableData>{effect}</TableData>
            </TableRow>
          )}
          {isDefined(remoteAttack) && (
            <TableRow>
              <TableData>{_('Remote Attack')}</TableData>
              <TableData>{remoteAttack}</TableData>
            </TableRow>
          )}
          {isDefined(severity) && (
            <TableRow>
              <TableData>{_('Severity')}</TableData>
              <TableData>
                <SeverityBar severity={severity} />
              </TableData>
            </TableRow>
          )}
          {isDefined(risk) && (
            <TableRow>
              <TableData>{_('CERT-Bund Risk Rating')}</TableData>
              <TableData>{risk}</TableData>
            </TableRow>
          )}
          {isDefined(referenceSource) && (
            <TableRow>
              <TableData>{_('Reference Source')}</TableData>
              <TableData>{referenceSource}</TableData>
            </TableRow>
          )}
          {isDefined(referenceUrl) && (
            <TableRow>
              <TableData>{_('Reference URL')}</TableData>
              <TableData>
                <span>
                  <ExternalLink to={referenceUrl}>{referenceUrl}</ExternalLink>
                </span>
              </TableData>
            </TableRow>
          )}
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

CertBundAdvDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default CertBundAdvDetails;
