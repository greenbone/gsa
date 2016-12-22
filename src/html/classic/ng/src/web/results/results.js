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

import {autobind} from '../../utils.js';
import  _ from '../../locale.js';

import HelpIcon from '../helpicon.js';
import Toolbar from '../toolbar.js';
import Section from '../section.js';
import PowerFilter from '../powerfilter.js';

import EntitiesComponent from '../entities/component.js';

import {Dashboard, DashboardControls} from '../dashboard/dashboard.js';

import ResultCharts from './charts.js';
import ResultsList from './resultslist.js';
import ResultsFilterDialog from './filterdialog.js';

import {RESULTS_FILTER_FILTER} from '../../gmp/commands/filters.js';

export class Results extends EntitiesComponent {

  constructor(props) {
    super(props);

    autobind(this, 'on');
  }

  getCounts() {
    return this.state.results.getCounts();
  }

  load(filter) {
    this.context.gmp.results.get(filter).then(results => {
      filter = results.getFilter();
      this.setState({results, filter});
    });
  }

  loadFilters() {
    this.context.gmp.filters.get(RESULTS_FILTER_FILTER).then(filters => {
      this.setState({filters});
    });
  }

  render() {
    let {filters, filter} = this.state;
    return (
      <div>
        <Toolbar>
          <HelpIcon page="results"/>
          <PowerFilter
            filter={filter}
            filters={filters}
            onFilterCreated={this.onFilterCreated}
            onResetClick={this.onFilterReset}
            onEditClick={() => this.filter_dialog.show()}
            onUpdate={this.onFilterUpdate}/>
          <ResultsFilterDialog
            filter={filter}
            ref={ref => this.filter_dialog = ref}
            onSave={this.onFilterUpdate}/>
        </Toolbar>

        <Section title={_('Results')} img="result.svg"
          extra={<DashboardControls/>}>
          <Dashboard hide-filter-select
            filter={filter}
            config-pref-id="0b8ae70d-d8fc-4418-8a72-e65ac8d2828e"
            default-controllers-string={'result-by-severity-class|' +
              'result-by-vuln-words|result-by-cvss'}
            default-controller-string="result-by-cvss">
            <ResultCharts filter={filter}/>
          </Dashboard>

          <ResultsList
            results={this.state.results}
            onFirstClick={this.onFirst}
            onLastClick={this.onLast}
            onNextClick={this.onNext}
            onPreviousClick={this.onPrevious}
            onToggleOverridesClick={this.onToggleOverrides}/>
        </Section>
      </div>
    );
  }
}

Results.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default Results;

// vim: set ts=2 sw=2 tw=80:
