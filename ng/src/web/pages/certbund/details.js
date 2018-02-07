/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Layout from '../../components/layout/layout.js';

import ExternalLink from '../../components/link/externallink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const CertBundAdvDetails = ({
  entity,
}) => {
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
    <Layout
      flex="column"
      grow>

      <InfoTable>
        <TableBody>
          {is_defined(version) &&
            <TableRow>
              <TableData>
                {_('Version')}
              </TableData>
              <TableData>
                {version}
              </TableData>
            </TableRow>
          }
          {is_defined(title) &&
            <TableRow>
              <TableData>
                {_('Title')}
              </TableData>
              <TableData>
                {title}
              </TableData>
            </TableRow>
          }
          {is_defined(software) &&
            <TableRow>
              <TableData>
                {_('Software')}
              </TableData>
              <TableData>
                {software}
              </TableData>
            </TableRow>
          }
          {is_defined(platform) &&
            <TableRow>
              <TableData>
                {_('Platform')}
              </TableData>
              <TableData>
                {platform}
              </TableData>
            </TableRow>
          }
          {is_defined(effect) &&
            <TableRow>
              <TableData>
                {_('Effect')}
              </TableData>
              <TableData>
                {effect}
              </TableData>
            </TableRow>
          }
          {is_defined(remote_attack) &&
            <TableRow>
              <TableData>
                {_('Remote Attack')}
              </TableData>
              <TableData>
                {remote_attack}
              </TableData>
            </TableRow>
          }
          {is_defined(severity) &&
            <TableRow>
              <TableData>
                {_('Severity')}
              </TableData>
              <TableData>
                <SeverityBar
                  severity={severity}
                />
              </TableData>
            </TableRow>
          }
          {is_defined(risk) &&
            <TableRow>
              <TableData>
                {_('CERT-Bund Risk Rating')}
              </TableData>
              <TableData>
                {risk}
              </TableData>
            </TableRow>
          }
          {is_defined(reference_source) &&
            <TableRow>
              <TableData>
                {_('Reference Source')}
              </TableData>
              <TableData>
                {reference_source}
              </TableData>
            </TableRow>
          }
          {is_defined(reference_url) &&
            <TableRow>
              <TableData>
                {_('Reference URL')}
              </TableData>
              <TableData>
                <ExternalLink
                  to={reference_url}
                >
                  {reference_url}
                </ExternalLink>
              </TableData>
            </TableRow>
          }
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
