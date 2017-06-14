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

import _ from '../../locale.js';
import {classes, is_empty, is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import SolutionType from '../solutiontype.js';
import {render_nvt_name} from '../render.js';

import LegacyLink from '../link/legacylink.js';

import SimpleTable from '../table/simple.js';
import TableBody from '../table/body.js';
import TableData from '../table/data.js';
import TableRow from '../table/row.js';

import './css/details.css';

const N_A = 'N/A';

const ResultBlock = ({
    children,
    className,
    title,
  }) => {
  className = classes(className, 'result-block');
  return (
    <Layout
      flex="column"
      className={className}>
      <h2>{title}</h2>
      <div className="details">
        {children}
      </div>
    </Layout>
  );
};

ResultBlock.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const ResultDetails = ({
    className,
    links = true,
    result,
  }) => {

  if (!is_defined(result)) {
    return null;
  }

  let tags;
  if (is_defined(result.nvt) && is_defined(result.nvt.tags)) {
    tags = result.nvt.tags;
  }
  else {
    tags = {};
  }

  const {oid} = result.nvt;
  const detection_title = result.severity > 0 || result.nvt.severity > 0 ?
    _('Vulnerability Detection Method') : _('Log Method');
  const is_oval = is_defined(oid) && oid.startsWith('oval:');

  return (
    <Layout flex="column" className={className}>
      <ResultBlock
        title={_('Summary')}>
        {tags.summary}
      </ResultBlock>

      <ResultBlock
        title={_('Vulnerability Detection Result')}>
        {!is_empty(result.description) && result.description.length > 1 ?
          (
            <pre>
              {result.description}
            </pre>
          ) : (
            _('Vulnerability was detected according to the Vulnerability ' +
            'Detection Method.')
          )
        }
      </ResultBlock>

      {is_defined(tags.impact) && tags.impact !== N_A &&
        <ResultBlock
          title={_('Impact')}>
          {tags.impact}
        </ResultBlock>
      }

      {is_defined(tags.solution) && tags.solution !== N_A &&
        <ResultBlock
          title={_('Solution')}>
          <Layout
            flex
            className="solution-type">
            <b>{_('Solution Type:')}</b>
            <SolutionType
              displayTitleText
              type={tags.solution_type}/>
          </Layout>
          <div>
            {tags.solution}
          </div>
        </ResultBlock>
      }

      {is_defined(tags.affected) && tags.affected !== N_A &&
        <ResultBlock
          title={_('Affected Software/OS')}>
          {tags.affected}
        </ResultBlock>
      }

      {is_defined(tags.insight) && tags.insight !== N_A &&
        <ResultBlock
          title={_('Vulnerability Insight')}>
          {tags.insight}
        </ResultBlock>
      }

      <ResultBlock
        title={detection_title}>
        <Layout flex="column">
          <Layout flex box>
            {tags.vuldetect}
          </Layout>
          <Layout flex box>
            {_('Details: ')}
            {is_oval && (
              links === true ? (
                <LegacyLink
                  cmd="get_info"
                  info_type="oval_def"
                  info_id={oid}
                  details="1"
                  title={_('View Details of OVAL Definition {{oid}}', {oid})}
                >
                  {oid}
                </LegacyLink>
              ) : (
                {oid}
              )
            )}
            {is_defined(oid) && oid.startsWith('1.3.6.1.4.1.25623.1.0.') && (
              links === true ?
              (
                <LegacyLink
                  cmd="get_info"
                  info_type="nvt"
                  info_id={oid}>
                  {render_nvt_name(result.nvt)}{' '}
                  {_('OID: {{oid}}', {oid})}
                </LegacyLink>
              ) : (
                <span>
                  {render_nvt_name(result.nvt)}{' '}
                  {_('OID: {{oid}}', {oid})}
                </span>
              )
            )}
            {!is_defined(oid) &&
              _('No details available for this method.')
            }
          </Layout>
          {!is_empty(result.scan_nvt_version) &&
            <Layout flex box>
              <p>
                {_('Version used: {{version}}',
                  {version: result.scan_nvt_version})}
              </p>
            </Layout>
          }
        </Layout>
      </ResultBlock>

      {is_defined(result.detection) && is_defined(result.detection.result) &&
        <ResultBlock
          title={_('Product Detection Result')}>
          <SimpleTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Product')}
                </TableData>
              </TableRow>
            </TableBody>
          </SimpleTable>
        </ResultBlock>
      }
    </Layout>
  );
};

ResultDetails.propTypes = {
  className: PropTypes.string,
  links: PropTypes.bool,
  result: PropTypes.model,
};

export default ResultDetails;

// vim: set ts=2 sw=2 tw=80:
