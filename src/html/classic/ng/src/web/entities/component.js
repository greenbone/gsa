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
import _ from '../../locale.js';
import logger from '../../log.js';

import DashboardControls from '../dashboard/controls.js';
import FilterDialog from '../filterdialog.js';
import Layout from '../layout.js';
import PowerFilter from '../powerfilter.js';
import Section from '../section.js';
import SelectionType from '../selectiontype.js';
import Toolbar from '../toolbar.js';

import EntitiesTable from '../entities/table.js';

import Download from '../form/download.js';

import HelpIcon from '../icons/helpicon.js';

import Filter from '../../gmp/models/filter.js';

const log = logger.getLogger('web.entities.component');

export class EntitiesComponent extends React.Component {

  constructor(props, options = {}) {
    super(props);

    this.name = options.name;
    this.icon_name = options.icon_name;
    this.title = options.title;
    this.filters_filter = options.filters_filter;
    this.sort_fields = options.sort_fields;
    this.download_name = options.download_name;

    this.state = {
      filters: [],
      selection_type: SelectionType.SELECTION_PAGE_CONTENTS,
      selected: [],
    };

    this.reload = this.reload.bind(this);
    this.onFirst = this.onFirst.bind(this);
    this.onLast = this.onLast.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
    this.onFilterReset = this.onFilterReset.bind(this);
    this.onFilterUpdate = this.onFilterUpdate.bind(this);
    this.onFilterCreated = this.onFilterCreated.bind(this);
    this.onFilterEditClick = this.onFilterEditClick.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.onDownloadBulk = this.onDownloadBulk.bind(this);
    this.onDeleteBulk = this.onDeleteBulk.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onDeselect = this.onDeselect.bind(this);
    this.onSelectionTypeChange = this.onSelectionTypeChange.bind(this);
  }

  renderDashboard() {
    return null;
  }

  renderHeader() {
    return null;
  }

  renderFooter() {
    return null;
  }

  renderRow(entity) {
    return null;
  }

  renderCreateDialog() {
    return null;
  }

  load(filter) {
    let gmp = this.getGmp();
    gmp.get(filter).then(entities => {
      let {selection_type} = this.state;

      filter = entities.getFilter();

      this.setState({entities, filter});

      if (selection_type !== SelectionType.SELECTION_USER) {
        this.setState({selected: entities});
      }
    });
  }

  loadFilters() {
    this.context.gmp.filters.get(this.filters_filter).then(filters => {
      this.setState({filters});
    });
  }

  getGmp() {
    return this.context.gmp[this.name];
  }

  getSectionTitle() {
    let entities = this.getEntities();

    if (!entities) {
      return this.title;
    }

    let counts = this.getCounts();
    return _('{{title}} ({{filtered}} of {{all}})',
      {title: this.title, ...counts});
  }

  componentDidMount() {
    let {gmp} = this.context;
    let filter_string = this.props.location.query.filter;
    let refresh = gmp.globals.autorefresh;
    let filter;

    if (filter_string) {
      filter = Filter.fromString(filter_string);
    }

    this.load(filter);
    this.loadFilters();

    if (refresh) {
      log.debug('Setting reload interval', refresh);
      this.timer = window.setInterval(this.reload, refresh * 1000);
    }
  }

  componentWillUnmount() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload interval');
      window.clearInterval(this.timer);
    }
  }

  reload() {
    this.load(this.state.filter);
  }

  onFirst() {
    let {filter} = this.state;

    this.load(filter.first());
  }

  onNext() {
    let {filter} = this.state;

    this.load(filter.next());
  }

  onPrevious() {
    let {filter} = this.state;

    this.load(filter.previous());
  }

  onLast() {
    let {filter} = this.state;
    let counts = this.getCounts();

    let last = Math.floor((counts.filtered - 1) / counts.rows) *
      counts.rows + 1;

    this.load(filter.first(last));
  }

  onFilterReset() {
    this.load();
  }

  onFilterUpdate(filter) {
    this.load(filter);
  }

  onFilterCreated(filter) {
    let {filters = []} = this.state;

    filters.push(filter);

    this.setState({filters});
  }

  onSortChange(field) {
    let {filter} = this.state;

    let sort = 'sort';
    let sort_field = filter.get('sort');

    if (sort_field) {
      if (sort_field === field) {
        sort = 'sort-reverse';
      }
    }

    filter.set(sort, field);

    this.load(filter);
  }

  onDownloadBulk() {
    let {selected, selection_type} = this.state;
    let entities = this.getEntities();
    let gmp = this.getGmp();
    let filter = entities.getFilter();
    let promise;

    if (selection_type === SelectionType.SELECTION_USER) {
      promise = gmp.export(selected);
    }
    else if (selection_type === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = gmp.exportByFilter(filter);
    }
    else {
      promise = gmp.exportByFilter(filter.all());
    }

    promise.then(xhr => {
      this.download.setData(xhr.responseText);
      this.download.download();
    }, err => log.error(err));
  }

  onDeleteBulk() {
    let {selected, selection_type} = this.state;
    let gmp = this.getGmp();
    let entities = this.getEntities();
    let promise;

    if (selection_type === SelectionType.SELECTION_FILTER) {
      let filter = entities.getFilter().all();
      promise  = gmp.deleteByFilter(filter);
    }
    else {
      promise = gmp.delete(selected);
    }

    promise.then(deleted => {
      this.reload();
      log.debug('successfully deleted entities', deleted);
    }, err => log.error(err));
  }

  onSelect(entity) {
    let {selected} = this.state;

    selected.add(entity);

    this.setState({selected});
  }

  onDeselect(entity) {
    let {selected} = this.state;

    selected.delete(entity);

    this.setState({selected});
  }

  onSelectionTypeChange(value) {
    let selected;
    if (value === SelectionType.SELECTION_USER) {
      selected = new Set();
    }
    else {
      selected = this.getEntities();
    }

    this.setState({selection_type: value, selected});
  }

  onFilterEditClick() {
    this.filter_dialog.show();
  }

  getEntities() {
    return this.state.entities;
  }

  getCounts() {
    let entities = this.getEntities();
    if (entities) {
      return entities.getCounts();
    }
    return {};
  }

  renderHelpIcon() {
    return (
      <HelpIcon page={this.name}/>
    );
  }

  renderToolbarIconButtons() {
    return (
      <Layout flex>
        {this.renderHelpIcon()}
      </Layout>
    );
  }

  renderPowerFilter() {
    let {filters, filter} = this.state;
    return (
      <PowerFilter
        filter={filter}
        filters={filters}
        onFilterCreated={this.onFilterCreated}
        onResetClick={this.onFilterReset}
        onEditClick={this.onFilterEditClick}
        onUpdate={this.onFilterUpdate}/>
    );

  }

  renderFilterDialog() {
    let {filter} = this.state;
    return (
      <FilterDialog
        sortFields={this.sort_fields}
        filter={filter}
        ref={ref => this.filter_dialog = ref}
        onSave={this.onFilterUpdate}/>
    );
  }

  renderToolbar() {
    return (
      <Toolbar>
        {this.renderToolbarIconButtons()}
        {this.renderPowerFilter()}
      </Toolbar>
    );
  }
  renderRows() {
    let entities = this.getEntities();

    if (!is_defined(entities)) {
      return null;
    }

    return entities.map(entity => {
      return this.renderRow(entity);
    });
  }

  renderEntitiesTable() {
    let {filter} = this.state;
    let counts = this.getCounts();
    return (
      <EntitiesTable
        header={this.renderHeader()}
        footer={this.renderFooter()}
        counts={counts}
        filter={filter}
        emptyTitle={this.empty_title}
        rows={this.renderRows()}
        onFirstClick={this.onFirst}
        onLastClick={this.onLast}
        onNextClick={this.onNext}
        onPreviousClick={this.onPrevious}/>
    );
  }

  renderDownload() {
    return (
      <Download ref={ref => this.download = ref}
        filename={this.download_name}/>
    );
  }

  renderSection() {
    return (
      <Section title={this.getSectionTitle()}
        img={this.icon_name}
        extra={<DashboardControls/>}>
        {this.renderDashboard()}
        {this.renderEntitiesTable()}
        {this.renderDownload()}
      </Section>
    );
  }

  renderDialogs() {
    return (
      <span>
        {this.renderFilterDialog()}
        {this.renderCreateDialog()}
      </span>
    );
  }

  render() {
    return (
      <div>
        {this.renderToolbar()}
        {this.renderSection()}
        {this.renderDialogs()}
      </div>
    );
  }
}

export default EntitiesComponent;

// vim: set ts=2 sw=2 tw=80:
