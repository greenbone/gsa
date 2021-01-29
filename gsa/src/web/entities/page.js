/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined, hasValue} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';

import Toolbar from 'web/components/bar/toolbar';

import ErrorMessage from 'web/components/error/errormessage';

import Layout from 'web/components/layout/layout';

import Loading from '../components/loading/loading';

import PowerFilter from 'web/components/powerfilter/powerfilter';

import Section from 'web/components/section/section';

import {loadAllEntities, selector} from 'web/store/entities/filters';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

const exclude_props = [
  'children',
  'dashboard',
  'dashboardControls',
  'filterEditDialog',
  'filters',
  'powerfilter',
  'section',
  'sectionIcon',
  'table',
  'title',
  'toolBarIcons',
];

class EntitiesPage extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      showFilterDialog: false,
    };

    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterEditClick = this.handleFilterEditClick.bind(this);
    this.handleFilterDialogCloseClick = this.handleFilterDialogCloseClick.bind(
      this,
    );
  }

  componentDidMount() {
    this.props.loadFilters();
  }

  getSectionTitle() {
    const {entities, entitiesCounts, title, isLoading} = this.props;

    if (!isDefined(entitiesCounts) || (isLoading && !isDefined(entities))) {
      return title;
    }

    return _('{{title}} {{filtered}} of {{all}}', {
      title,
      ...entitiesCounts,
    });
  }

  handleFilterEditClick() {
    this.setState({showFilterDialog: true});
    this.handleInteraction();
  }

  handleFilterDialogCloseClick() {
    this.setState({showFilterDialog: false});
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  renderSection() {
    const {
      entities,
      isLoading,
      sectionIcon,
      dashboard,
      dashboardControls,
    } = this.props;

    let {section: SectionComponent} = this.props;

    if (SectionComponent === false) {
      return null;
    }

    if (!isDefined(SectionComponent)) {
      SectionComponent = Section;
    }

    const extra = isDefined(dashboardControls)
      ? dashboardControls()
      : undefined;
    return (
      <SectionComponent
        title={this.getSectionTitle()}
        data-testid="entities-section"
        className="entities-section"
        img={sectionIcon}
        extra={extra}
      >
        <Layout flex="column" grow="1">
          {isDefined(dashboard) && dashboard()}
          {isLoading && !isDefined(entities) ? <Loading /> : this.renderTable()}
        </Layout>
      </SectionComponent>
    );
  }

  renderTable() {
    const {
      filter,
      entities,
      entitiesCounts,
      entitiesError,
      table: TableComponent,
      ...props
    } = this.props;

    if (isDefined(entitiesError)) {
      return <ErrorMessage message={entitiesError.message} />;
    }

    if (!isDefined(entities) || !isDefined(TableComponent)) {
      return null;
    }

    const other = excludeObjectProps(props, exclude_props);

    return (
      <TableComponent
        {...other}
        data-testid="entities-table"
        filter={filter}
        entities={entities}
        entitiesCounts={entitiesCounts}
      />
    );
  }

  renderPowerFilter() {
    const {
      filter,
      filterEditDialog,
      filters,
      isLoading,
      isLoadingFilters,
      powerfilter = PowerFilter,
      onError,
      onFilterChanged,
      onFilterRemoved,
      onFilterReset,
    } = this.props;

    if (!powerfilter) {
      return null;
    }

    const PowerFilterComponent = powerfilter;

    const handler = isDefined(filterEditDialog)
      ? this.handleFilterEditClick
      : undefined;

    return (
      <Layout flex align="end" grow="1">
        <PowerFilterComponent
          filter={filter}
          filters={filters}
          isLoading={isLoading}
          isLoadingFilters={isLoadingFilters}
          onEditClick={handler}
          onError={onError}
          onRemoveClick={onFilterRemoved}
          onResetClick={onFilterReset}
          onUpdate={onFilterChanged}
        />
      </Layout>
    );
  }

  renderToolbarIcons() {
    let {toolBarIcons, ...other} = this.props;

    if (!isDefined(toolBarIcons)) {
      return null;
    }

    if (React.isValidElement(toolBarIcons)) {
      return toolBarIcons;
    }
    other = excludeObjectProps(other, exclude_props);
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

  handleFilterCreated(filter) {
    this.props.loadFilters();
    this.props.onFilterCreated(filter);
  }

  renderDialogs() {
    const {
      createFilterType,
      filter,
      filterEditDialog: FilterDialogComponent,
      onFilterChanged,
    } = this.props;
    const {showFilterDialog} = this.state;

    if (!FilterDialogComponent || !showFilterDialog) {
      return null;
    }

    return (
      <FilterDialogComponent
        createFilterType={createFilterType}
        filter={filter}
        onFilterChanged={onFilterChanged}
        onFilterCreated={this.handleFilterCreated}
        onCloseClick={this.handleFilterDialogCloseClick}
      />
    );
  }

  render() {
    return (
      <Layout grow="1" flex="column">
        {this.renderToolbar()}
        {this.renderSection()}
        {this.renderDialogs()}
      </Layout>
    );
  }
}

EntitiesPage.propTypes = {
  createFilterType: PropTypes.string,
  dashboard: PropTypes.func,
  dashboardControls: PropTypes.func,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.counts,
  entitiesError: PropTypes.error,
  filter: PropTypes.filter,
  filterEditDialog: PropTypes.component,
  filters: PropTypes.array,
  filtersFilter: PropTypes.filter,
  isLoading: PropTypes.bool,
  isLoadingFilters: PropTypes.bool,
  loadFilters: PropTypes.func.isRequired,
  powerfilter: PropTypes.componentOrFalse,
  section: PropTypes.componentOrFalse,
  sectionIcon: PropTypes.icon,
  table: PropTypes.componentOrFalse,
  title: PropTypes.string,
  toolBarIcons: PropTypes.componentOrElement,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
  onFilterRemoved: PropTypes.func.isRequired,
  onFilterReset: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export const createEntitiesPage = (options = {}) => {
  const EntitiesPageWrapper = props => {
    return <EntitiesPage {...options} {...props} />;
  };
  return EntitiesPageWrapper;
};

const mapStateToProps = (state, {filtersFilter}) => {
  if (!isDefined(filtersFilter)) {
    return {
      filters: [],
      isLoadingFilters: false,
    };
  }

  const filterSelector = selector(state);
  const filters = filterSelector.getAllEntities(filtersFilter);

  return {
    filters: hasValue(filters) ? filters : [],
    isLoadingFilters: filterSelector.isLoadingAllEntities(filtersFilter),
  };
};

const mapDispatchToProps = (dispatch, {gmp, filtersFilter}) => ({
  loadFilters: () => dispatch(loadAllEntities(gmp)(filtersFilter)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(EntitiesPage);

// vim: set ts=2 sw=2 tw=80:
