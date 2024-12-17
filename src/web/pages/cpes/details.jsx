/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import SeverityBar from 'web/components/bar/severitybar';
import DateTime from 'web/components/date/datetime';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import InfoTable from 'web/components/table/infotable';
import TableRow from 'web/components/table/row';
import {Col} from 'web/entity/page';
import PropTypes from 'web/utils/proptypes';

const CpeDetails = ({entity, links = true}) => {
  const {title, nvdId, deprecatedBy, updateTime, status, severity} = entity;
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
          {isDefined(nvdId) && (
            <TableRow>
              <TableData>{_('NVD ID')}</TableData>
              <TableData>{nvdId}</TableData>
            </TableRow>
          )}
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
          {isDefined(status) && (
            <TableRow>
              <TableData>{_('Status')}</TableData>
              <TableData>{status}</TableData>
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

// vim: set ts=2 sw=2 tw=80:
