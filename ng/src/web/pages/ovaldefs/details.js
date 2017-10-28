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

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Layout from '../../components/layout/layout.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const OvaldefDetails = ({
  entity,
}) => {
  const {
    title,
    severity,
    version,
    cve_refs,
    deprecation,
    file,
    metadata,
  } = entity;
  return (
    <Layout
      flex="column"
      grow="1">

      <InfoTable>
        <TableBody>
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

          {is_defined(entity.class) &&
            <TableRow>
              <TableData>
                {_('Definition Class')}
              </TableData>
              <TableData>
                {entity.class}
              </TableData>
            </TableRow>
          }

          {is_defined(cve_refs) &&
            <TableRow>
              <TableData>
                {_('Referenced CVEs')}
              </TableData>
              <TableData>
                {cve_refs}
              </TableData>
            </TableRow>
          }

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

          {is_defined(entity.isDeprecated) && entity.isDeprecated() &&
            <TableRow>
              <TableData>
                {_('Deprecated')}
              </TableData>
              <TableData>
                {deprecation}
              </TableData>
            </TableRow>
          }

          {is_defined(file) &&
            <TableRow>
              <TableData>
                {_('File')}
              </TableData>
              <TableData>
                {file}
              </TableData>
            </TableRow>
          }

        </TableBody>
      </InfoTable>

      {is_defined(metadata) &&
        <div>
          <h2>{_('Description')}</h2>
          <p>
            {is_defined(metadata.description) ?
                metadata.description :
                _('None')}
          </p>
        </div>
      }
    </Layout>
  );
};

OvaldefDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default OvaldefDetails;

// vim: set ts=2 sw=2 tw=80:
