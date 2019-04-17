/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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

const CertBundAdvDetails = ({entity}) => {
  const {
    title,
    version,
    severity,
    software,
    platform,
    effect,
    remote_attack,
    risk,
    reference_source,
    reference_url,
  } = entity;
  return (
    <Layout flex="column" grow>
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
          {isDefined(remote_attack) && (
            <TableRow>
              <TableData>{_('Remote Attack')}</TableData>
              <TableData>{remote_attack}</TableData>
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
          {isDefined(reference_source) && (
            <TableRow>
              <TableData>{_('Reference Source')}</TableData>
              <TableData>{reference_source}</TableData>
            </TableRow>
          )}
          {isDefined(reference_url) && (
            <TableRow>
              <TableData>{_('Reference URL')}</TableData>
              <TableData>
                <span>
                  <ExternalLink to={reference_url}>
                    {reference_url}
                  </ExternalLink>
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

// vim: set ts=2 sw=2 tw=80:
