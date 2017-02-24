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
import {is_defined, exclude, includes} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import Section from '../section.js';
import Toolbar from '../toolbar.js';

import PowerFilter from '../powerfilter/powerfilter.js';

import DashboardControls from '../dashboard/controls.js';

const exclude_props = [
  'children',
  'cache',
  'title',
  'sectionIcon',
  'toolBarIcons',
  'dashboard',
  'powerfilter',
  'filterEditDialog',
  'table',
  'filters',
  'children',
];

export class EntitiesPage extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleFilterEditClick = this.handleFilterEditClick.bind(this);
    this.handleFilterChanged = this.handleFilterChanged.bind(this);
    this.onFirst = this.onFirst.bind(this);
    this.onLast = this.onLast.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
  }

  getSectionTitle() {
    let {entities, title} = this.props;

    if (!entities) {
      return title;
    }

    let counts = entities.getCounts();
    return _('{{title}} ({{filtered}} of {{all}})', {title, ...counts});
  }

  handleFilterEditClick() {
    if (this.filter_dialog) {
      this.filter_dialog.show();
    }
  }

  handleFilterChanged(filter) {
    let {onFilterChanged} = this.props;

    if (onFilterChanged) {
      onFilterChanged(filter);
    }
  }

  onFirst() {
    let {filter} = this.props;

    this.handleFilterChanged(filter.first());
  }

  onNext() {
    let {filter} = this.props;

    this.handleFilterChanged(filter.next());
  }

  onPrevious() {
    let {filter} = this.props;

    this.handleFilterChanged(filter.previous());
  }

  onLast() {
    let {filter, entities} = this.props;
    let counts = entities.getCounts();

    let last = Math.floor((counts.filtered - 1) / counts.rows) *
      counts.rows + 1;

    this.handleFilterChanged(filter.first(last));
  }

  renderSection() {
    let {sectionIcon, filter, cache} = this.props;
    let DashboardComponent = this.props.dashboard;

    return (
      <Section
        title={this.getSectionTitle()}
        className="entities-section"
        img={sectionIcon}
        extra={DashboardComponent ? <DashboardControls/> : null}>
        {DashboardComponent &&
          <DashboardComponent cache={cache} filter={filter}/>
        }
        {this.renderTable()}
      </Section>
    );
  }

  renderTable() {
    let {filter, entities, ...other} = this.props;
    let TableComponent = this.props.table;

    if (!TableComponent) {
      return null;
    }

    other = exclude(other, key => includes(exclude_props, key));

    return (
      <TableComponent
        {...other}
        filter={filter}
        entities={entities}
        onFirstClick={this.onFirst}
        onLastClick={this.onLast}
        onNextClick={this.onNext}
        onPreviousClick={this.onPrevious}/>
    );
  }

  renderPowerFilter() {
    let {filters, filter, onFilterCreateClick, onFilterChanged,
      filterEditDialog, powerfilter = PowerFilter} = this.props;

    if (!powerfilter) {
      return null;
    }

    const PowerFilterComponent = powerfilter;

    let handler = is_defined(filterEditDialog) ?
      this.handleFilterEditClick : undefined;

    return (
      <Layout flex align="end" grow="1">
        <PowerFilterComponent
          filter={filter}
          filters={filters}
          onEditClick={handler}
          onCreateClick={onFilterCreateClick}
          onResetClick={onFilterChanged}
          onUpdate={onFilterChanged}/>
      </Layout>
    );
  }

  renderToolbarIcons() {
    let {toolBarIcons, ...other} = this.props;

    if (!is_defined(toolBarIcons)) {
      return null;
    }

    if (React.isValidElement(toolBarIcons)) {
      return toolBarIcons;
    }
    other = exclude(other, key => includes(exclude_props));
    return React.createElement(toolBarIcons, other);
  }

  renderToolbar() {
    return (
      <Toolbar>
        {this.renderToolbarIcons()}
        {this.renderPowerFilter()}
      </Toolbar>
    );
  }

  renderDialogs() {
    let {filter} = this.props;
    let FilterDialogComponent = this.props.filterEditDialog;

    if (!FilterDialogComponent) {
      return null;
    }

    return (
      <FilterDialogComponent
        filter={filter}
        ref={ref => this.filter_dialog = ref}
        onFilterChanged={this.handleFilterChanged}/>
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

EntitiesPage.propTypes = {
  cache: React.PropTypes.object,
  title: React.PropTypes.string,
  entities: React.PropTypes.object,
  filter: React.PropTypes.object,
  filters: React.PropTypes.object,
  dashboard: PropTypes.componentOrFalse,
  powerfilter: PropTypes.componentOrFalse,
  table: PropTypes.componentOrFalse,
  filterEditDialog: PropTypes.component,
  sectionIcon: PropTypes.icon,
  toolBarIcons: PropTypes.componentOrElement,
  onFilterChanged: React.PropTypes.func,
  onFilterCreateClick: React.PropTypes.func,
};

export const createEntitiesPage = (options = {}) => {
  const EntitiesPageWrapper = props => {
    return (
      <EntitiesPage {...options} {...props}/>
    );
  };
  return EntitiesPageWrapper;
};

export default EntitiesPage;

// vim: set ts=2 sw=2 tw=80:
