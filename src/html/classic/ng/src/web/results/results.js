/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {is_defined} from '../../utils.js';
import  _ from '../../locale.js';

import Layout from '../layout.js';
import Sort from '../sortby.js';
import SelectionType from '../selectiontype.js';

import EntitiesComponent from '../entities/component.js';
import EntitiesFooter from '../entities/footer.js';

import Dashboard from '../dashboard/dashboard.js';


import Icon from '../icons/icon.js';

import TableRow from '../table/row.js';
import TableHead from '../table/head.js';

import ResultCharts from './charts.js';
import ResultsFilterDialog from './filterdialog.js';
import ResultsListRow from './resultslistrow.js';

import {RESULTS_FILTER_FILTER} from '../../gmp/commands/filters.js';

export class Results extends EntitiesComponent {

  constructor(props) {
    super(props, {
      name: 'results',
      icon_name: 'result.svg',
      download_name: 'results.xml',
      title: _('Results'),
      empty_title: _('No results available'),
      filter_filter: RESULTS_FILTER_FILTER,
    });
  }

  renderHeader() {
    let entities = this.getEntities();

    if (!is_defined(entities)) {
      return null;
    }

    let {selection_type} = this.state;
    return (
      <TableRow key="1">
        <TableHead>
          <Sort by="vulnerability" onClick={this.onSortChange}>
            {_('Vulnerability')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Sort by="solution_type" onClick={this.onSortChange}>
            <Layout flex align="space-between">
              <Icon title={_('Solution type')} img="solution_type.svg"/>
              {_('Solution type')}
            </Layout>
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Layout flex align="space-between">
            <Sort by="severity" onClick={this.onSortChange}>
              {_('Severity')}
            </Sort>
          </Layout>
        </TableHead>
        <TableHead width="6em">
          <Sort by="qod" onClick={this.onSortChange}>
            {_('QoD')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Sort by="host" onClick={this.onSortChange}>
            {_('Host')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Sort by="location" onClick={this.onSortChange}>
            {_('Location')}
          </Sort>
        </TableHead>
        <TableHead width="20em">
          <Sort by="created" onClick={this.onSortChange}>
            {_('Created')}
          </Sort>
        </TableHead>
        {selection_type === SelectionType.SELECTION_USER &&
          <TableHead width="6em">{_('Actions')}</TableHead>
        }
      </TableRow>
    );
  }

  renderFooter() {
    let {selection_type} = this.state;
    let span = selection_type === SelectionType.SELECTION_USER ? 8 : 7;
    return (
      <EntitiesFooter span={span} download
        selectionType={selection_type}
        onDownloadClick={this.onDownloadBulk}
        onSelectionTypeChange={this.onSelectionTypeChange}>
      </EntitiesFooter>
    );
  }

  renderRows() {
    let entities = this.getEntities();

    if (!is_defined(entities)) {
      return null;
    }

    let {selection_type} = this.state;
    return entities.map(result => {
      return (
        <ResultsListRow key={result.id}
          result={result}
          selection={selection_type}
          onSelected={this.onSelect}
          onDeselected={this.onDeselect}/>
      );
    });
  }

  renderDashboard() {
    let {filter} = this.state;
    return (
      <Dashboard hide-filter-select
        filter={filter}
        config-pref-id="0b8ae70d-d8fc-4418-8a72-e65ac8d2828e"
        default-controllers-string={'result-by-severity-class|' +
          'result-by-vuln-words|result-by-cvss'}
        default-controller-string="result-by-cvss">
        <ResultCharts filter={filter}/>
      </Dashboard>
    );
  }

  renderFilterDialog() {
    let {filter} = this.state;
    return (
      <ResultsFilterDialog
        filter={filter}
        ref={ref => this.filter_dialog = ref}
        onSave={this.onFilterUpdate}/>
    );
  }
}

Results.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default Results;

// vim: set ts=2 sw=2 tw=80:
