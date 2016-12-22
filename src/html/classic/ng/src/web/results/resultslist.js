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

import _ from '../../locale.js';

import {TableRow, TableHead} from '../table.js';
import Layout from '../layout.js';
import Icon from '../icon.js';
import SelectionType from '../selectiontype.js';
import Sort from '../sortby.js';

import OverridesIcon from '../icons/overridesicon.js';

import EntitiesFooter from '../entities/footer.js';
import EntitiesList from '../entities/list.js';

import ResultsListEntry from './resultslistentry.js';

export class ResultsList extends EntitiesList {

  constructor(...args) {
    super(...args);

    this.export_filename = 'results.xml';
    this.empty_title = _('No results available');
  }

  getEntities() {
    return this.props.results;
  }

  getGmp() {
    return this.context.gmp.results;
  }

  renderHeader() {
    let {onSortChange} = this.props;
    let {selection_type} = this.state;
    let entities = this.getEntities();
    let filter = entities.getFilter();
    let overrides = filter.get('apply_overrides');
    return (
      <TableRow key="1">
        <TableHead>
          <Sort by="vulnerability" onClick={onSortChange}>
            {_('Vulnerability')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Sort by="solution_type" onClick={onSortChange}>
            <Layout flex align="space-between">
              <Icon title={_('Solution type')} img="solution_type.svg"/>
              {_('Solution type')}
            </Layout>
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Layout flex align="space-between">
            <Sort by="severity" onClick={onSortChange}>
              {_('Severity')}
            </Sort>
            <OverridesIcon overrides={overrides}
              onClick={this.props.onToggleOverridesClick}/>
          </Layout>
        </TableHead>
        <TableHead width="6em">
          <Sort by="qod" onClick={onSortChange}>
            {_('QoD')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Sort by="host" onClick={onSortChange}>
            {_('Host')}
          </Sort>
        </TableHead>
        <TableHead width="10em">
          <Sort by="location" onClick={onSortChange}>
            {_('Location')}
          </Sort>
        </TableHead>
        <TableHead width="20em">
          <Sort by="created" onClick={onSortChange}>
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
        onDownloadClick={this.onDownload}
        onSelectionTypeChange={this.onSelectionTypeChange}>
      </EntitiesFooter>
    );
  }

  renderEntities() {
    let {selection_type} = this.state;
    let entities = this.getEntities();
    return entities.map(result => {
      return (
        <ResultsListEntry key={result.id}
          result={result}
          selection={selection_type === SelectionType.SELECTION_USER}
          onSelected={this.onSelectTask}
          onDeselected={this.onDeselectTask}/>
      );
    });
  }
}

ResultsList.propTypes = {
  results: React.PropTypes.object,
  onFirstClick: React.PropTypes.func,
  onLastClick: React.PropTypes.func,
  onPreviousClick: React.PropTypes.func,
  onNextClick: React.PropTypes.func,
  onToggleOverridesClick: React.PropTypes.func,
};

export default ResultsList;
