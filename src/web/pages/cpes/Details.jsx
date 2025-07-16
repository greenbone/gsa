/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Col from 'web/components/table/Col';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';

const CpeDetails = ({entity, links = true}) => {
  const [_] = useTranslation();
  const {title, cpeNameId, deprecated, deprecatedBy, updateTime, severity} =
    entity;
  return (
    <Layout flex="column" grow="1">
      {!isDefined(title) && (
        <p>
          {_(
            'This CPE does not appear in the CPE dictionary but is ' +
              'referenced by one or more CVE.',
          )}
        </p>
      )}

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
          {isDefined(cpeNameId) && (
            <TableRow>
              <TableData>{_('CPE Name ID')}</TableData>
              <TableData>{cpeNameId}</TableData>
            </TableRow>
          )}
          <TableRow>
            <TableData>{_('Deprecated')}</TableData>
            <TableData>{renderYesNo(deprecated)}</TableData>
          </TableRow>
          {isDefined(deprecatedBy) && (
            <TableRow>
              <TableData>{_('Deprecated By')}</TableData>
              <TableData>
                <DetailsLink id={deprecatedBy} textOnly={!links} type="cpe">
                  {deprecatedBy}
                </DetailsLink>
              </TableData>
            </TableRow>
          )}
          {isDefined(updateTime) && (
            <TableRow>
              <TableData>{_('Last updated')}</TableData>
              <TableData>
                <DateTime date={updateTime} />
              </TableData>
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
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

CpeDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default CpeDetails;
