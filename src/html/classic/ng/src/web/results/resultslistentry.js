/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {datetime} from '../../locale.js';

import Layout from '../layout.js';
import LegacyLink from '../legacylink.js';
import SeverityBar from '../severitybar.js';
import SolutionType from '../solutiontype.js';

import Checkbox from '../form/checkbox.js';

export class ResultsListEntry extends React.Component {

  constructor(...args) {
    super(...args);

    this.onSelectionChange = this.onSelectionChange.bind(this);
  }

  onSelectionChange(value) {
    let {onDeselected, onSelected, result} = this.props;

    if (value) {
      if (onSelected) {
        onSelected(result);
      }
    }
    else if (onDeselected) {
      onDeselected(result);
    }
  }

  render() {
    let {result, selection} = this.props;

    return (
      <tr>
        <td>
          <Layout flex>
            <LegacyLink cmd="get_result" result_id={result.id}
              className="auto">
              {result.name}
            </LegacyLink>
          </Layout>
        </td>
        <td>
          <Layout flex align="center">
            {result && result.nvt && result.nvt.tags &&
              <SolutionType type={result.nvt.tags.solution_type}/>
            }
          </Layout>
        </td>
        <td>
          <Layout flex align="center">
            <SeverityBar severity={result.severity}/>
          </Layout>
        </td>
        <td>
          <Layout flex align="center">
            {result.qod.value} %
          </Layout>
        </td>
        <td>
          <Layout flex align="center">
            <LegacyLink cmd="get_asset" type="host" asset_id={result.host.id}>
              {result.host.name}
            </LegacyLink>
          </Layout>
        </td>
        <td>
          {result.port}
        </td>
        <td>
          {datetime(result.modification_time)}
        </td>
        {selection && (
          <td>
            <Layout flex align={['center', 'center']}>
              <Checkbox onChange={this.onSelectionChange}/>
            </Layout>
          </td>
        )}
      </tr>
    );
  }
}

ResultsListEntry.propTypes = {
  result: React.PropTypes.object,
  selection: React.PropTypes.bool,
  onSelected: React.PropTypes.func,
  onDeselected: React.PropTypes.func,
};

export default ResultsListEntry;

// vim: set ts=2 sw=2 tw=80:
