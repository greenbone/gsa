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
import {TAG_NA} from 'gmp/models/nvt.js';

import PropTypes from '../../utils/proptypes.js';

import DetailsBlock from '../../entity/block.js';

import Severitybar from '../../components/bar/severitybar.js';

import Layout from '../../components/layout/layout.js';

import LegacyLink from '../../components/link/legacylink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import References from './references.js';
import Solution from './solution.js';

const NvtDetails = ({
  entity,
  links = true,
}) => {
  const {tags = {}, severity, qod} = entity;
  return (
    <Layout
      flex="column"
      grow="1">

      {is_defined(tags.summary) &&
        <DetailsBlock
          title={_('Summary')}>
          <p>
            {tags.summary}
          </p>
        </DetailsBlock>
      }

      {is_defined(tags.affected) && tags.affected !== TAG_NA &&
        <DetailsBlock
          title={_('Affected Software/OS')}>
          <p>
            {tags.affected}
          </p>
        </DetailsBlock>
      }

      <DetailsBlock
        title={_('Vulnerability Scoring')}>
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('CVSS Base')}
              </TableData>
              <TableData>
                <Severitybar severity={severity}/>
              </TableData>
            </TableRow>

            {is_defined(tags.cvss_base_vector) &&
              tags.cvss_base_vector !== TAG_NA &&
              <TableRow>
                <TableData>
                  {_('CVSS Base Vector')}
                </TableData>
                <TableData>
                  <LegacyLink
                    target="_blank"
                    cmd="cvss_calculator"
                    cvss_vector={tags.cvss_base_vector}
                  >
                    {tags.cvss_base_vector}
                  </LegacyLink>
                </TableData>
              </TableRow>
            }
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {is_defined(tags.insight) && tags.insight !== TAG_NA &&
        <DetailsBlock
          title={_('Vulnerability Insight')}>
          <p>
            {tags.insight}
          </p>
        </DetailsBlock>
      }

      {(is_defined(qod) ||
      (is_defined(tags.vuldetect) && tags.vuldetect !== TAG_NA)) &&
        <DetailsBlock
          title={_('Vulnerability Detection Method')}>
          {is_defined(tags.vuldetect) && tags.vuldetect !== TAG_NA &&
            <p>
              {tags.vuldetect}
            </p>
          }
          {is_defined(qod) &&
            <p>
              <b>{_('Quality of Detection')}: </b>

              {is_defined(qod.type) ?
                qod.type :
                _('N/A')
              }
              {is_defined(qod.value) &&
                ' (' + qod.value + '%)'
              }
            </p>
          }
        </DetailsBlock>
      }

      {is_defined(tags.impact) && tags.impact !== TAG_NA &&
        <DetailsBlock
          title={_('Impact')}>
          <p>
            {tags.impact}
          </p>
        </DetailsBlock>
      }

      <Solution
        solution={tags.solution}
        solutionType={tags.solution_type}
      />

      <References
        links={links}
        nvt={entity}
      />

    </Layout>
  );
};

NvtDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default NvtDetails;

// vim: set ts=2 sw=2 tw=80:
