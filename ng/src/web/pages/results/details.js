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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {is_empty, is_defined} from 'gmp/utils.js';
import {TAG_NA} from 'gmp/models/nvt.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_nvt_name} from '../../utils/render.js';

import DetailsBlock from '../../entity/block.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import References from '../nvts/references.js';
import Solution from '../nvts/solution.js';

const Pre = glamorous.pre({
  whiteSpace: 'pre-wrap',
  wordWrap: 'normal',
});

const P = Pre.withComponent('div');

const ResultDetails = ({
    className,
    links = true,
    entity,
  }) => {

  const result = entity;

  const {nvt} = result;
  const {oid, tags} = nvt;

  const detection_title = result.severity > 0 || result.nvt.severity > 0 ?
    _('Vulnerability Detection Method') : _('Log Method');
  const is_oval = is_defined(oid) && oid.startsWith('oval:');
  const has_detection = is_defined(result.detection) &&
    is_defined(result.detection.result);

  const detection_details = has_detection ? result.detection.result.details :
    undefined;

  return (
    <Layout
      flex="column"
      grow="1"
      className={className}>

      <DetailsBlock
        title={_('Summary')}>
        <P>
          {tags.summary}
        </P>
      </DetailsBlock>

      <DetailsBlock
        title={_('Vulnerability Detection Result')}>
        {!is_empty(result.description) && result.description.length > 1 ?
          (
            <Pre>
              {result.description}
            </Pre>
          ) : _('Vulnerability was detected according to the Vulnerability ' +
            'Detection Method.')
        }
      </DetailsBlock>

      {is_defined(tags.impact) && tags.impact !== TAG_NA &&
        <DetailsBlock
          title={_('Impact')}>
          <P>
            {tags.impact}
          </P>
        </DetailsBlock>
      }

      <Solution
        solution={tags.solution}
        solutionType={tags.solution_type}
      />

      {is_defined(tags.affected) && tags.affected !== TAG_NA &&
        <DetailsBlock
          title={_('Affected Software/OS')}>
          <P>
            {tags.affected}
          </P>
        </DetailsBlock>
      }

      {is_defined(tags.insight) && tags.insight !== TAG_NA &&
        <DetailsBlock
          title={_('Vulnerability Insight')}>
          <P>
            {tags.insight}
          </P>
        </DetailsBlock>
      }

      <DetailsBlock
        title={detection_title}>
        <Layout flex="column">
          <Layout flex box>
            {tags.vuldetect}
          </Layout>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Details: ')}
                </TableData>
                <TableData>
                  {is_oval && (
                    <DetailsLink
                      type="ovaldef"
                      id={oid}
                      title={_('View Details of OVAL Definition {{oid}}',
                        {oid})}
                      textOnly={!links}
                    >
                      {oid}
                    </DetailsLink>
                  )}
                  {is_defined(oid) &&
                      oid.startsWith('1.3.6.1.4.1.25623.1.0.') && (
                        <DetailsLink
                          type="nvt"
                          id={oid}
                          textOnly={!links}
                        >
                          {render_nvt_name(nvt)}
                          {' OID: ' + oid}
                        </DetailsLink>
                      )}
                  {!is_defined(oid) &&
                    _('No details available for this method.')
                  }
                </TableData>
              </TableRow>
              {!is_empty(result.scan_nvt_version) &&
                <TableRow>
                  <TableData>
                    {_('Version used: ')}
                  </TableData>
                  <TableData>
                    {result.scan_nvt_version}
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </InfoTable>
        </Layout>
      </DetailsBlock>

      {has_detection &&
        <DetailsBlock
          title={_('Product Detection Result')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Product')}
                </TableData>
                <TableData>
                  <DetailsLink
                    type="cpe"
                    id={detection_details.product}
                    textOnly={!links}
                  >
                    {detection_details.product}
                  </DetailsLink>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('Method')}
                </TableData>
                <TableData>
                  <DetailsLink
                    id={detection_details.source_oid}
                    type={
                      detection_details.source_oid.startsWith('CVE-') ?
                        'cve' : 'nvt'
                    }
                    textOnly={!links}
                  >
                    {
                      detection_details.source_name + ' (OID: ' +
                        detection_details.source_oid + ')'
                    }
                  </DetailsLink>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('Log')}
                </TableData>
                <TableData>
                  <DetailsLink
                    type="result"
                    id={result.detection.result.id}
                    textOnly={!links}
                  >
                    {_('View details of product detection')}
                  </DetailsLink>
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }

      <References
        links={links}
        nvt={nvt}
      />

    </Layout>
  );
};

ResultDetails.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default ResultDetails;

// vim: set ts=2 sw=2 tw=80:
