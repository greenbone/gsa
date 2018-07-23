/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined, hasValue} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';

import PropTypes from '../utils/proptypes.js';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';

import Toolbar from '../components/bar/toolbar.js';

import Layout from '../components/layout/layout.js';
import Wrapper from '../components/layout/wrapper.js';

import Loading from '../components/loading/loading.js';

import PowerFilter from '../components/powerfilter/powerfilter.js';

import Section from '../components/section/section.js';

import {loadEntities, selector} from 'web/store/entities/filters';

const exclude_props = [
  'children',
  'dashboard',
  'dashboard2',
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

const renderSectionTitle = (counts, title) => {
  if (!isDefined(counts)) {
    return title;
  }

  return _('{{title}} {{filtered}} of {{all}}', {
    title,
    ...counts,
  });
};


class EntitiesPage extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      showFilterDialog: false,
    };

    this.handleFilterEditClick = this.handleFilterEditClick.bind(this);
    this.handleFilterDialogCloseClick =
      this.handleFilterDialogCloseClick.bind(this);
  }

  componentDidMount() {
    this.props.loadFilters();
  }

  getSectionTitle() {
    const {entitiesCounts, title} = this.props;

    return renderSectionTitle(entitiesCounts, title);
  }

  handleFilterEditClick() {
    this.setState({showFilterDialog: true});
  }

  handleFilterDialogCloseClick() {
    this.setState({showFilterDialog: false});
  }

  renderSection() {
    const {
      entities,
      filter,
      loading,
      sectionIcon,
      dashboard: DashboardComponent,
      dashboard2,
      dashboardControls,
      onFilterChanged,
    } = this.props;

    let {
      section: SectionComponent,
    } = this.props;

    if (SectionComponent === false) {
      return null;
    }

    if (!isDefined(SectionComponent)) {
      SectionComponent = Section;
    }

    const extra = isDefined(dashboardControls) ? dashboardControls() :
      undefined;
    return (
      <SectionComponent
        title={this.getSectionTitle()}
        className="entities-section"
        img={sectionIcon}
        extra={extra}
      >
        <Layout
          flex="column"
          grow="1"
        >
          {DashboardComponent &&
            <DashboardComponent filter={filter}/>
          }
          {isDefined(dashboard2) &&
            dashboard2({filter, onFilterChanged})
          }
          {loading && !isDefined(entities) ?
            this.renderLoading() :
            this.renderTable()
          }
        </Layout>
      </SectionComponent>
    );
  }

  renderLoading() {
    const {loading} = this.props;
    return (
      <Loading loading={loading}/>
    );
  }

  renderTable() {
    const {
      filter,
      entities,
      entitiesCounts,
      table: TableComponent,
      ...props
    } = this.props;

    if (!isDefined(entities) || !isDefined(TableComponent)) {
      return null;
    }

    const other = excludeObjectProps(props, exclude_props);

    return (
      <TableComponent
        {...other}
        filter={filter}
        entities={entities}
        entitiesCounts={entitiesCounts}
      />
    );
  }

  renderPowerFilter() {
    const {
      createFilterType,
      filter,
      filterEditDialog,
      filters,
      powerfilter = PowerFilter,
      onError,
      onFilterChanged,
      onFilterCreated,
      onFilterReset,
    } = this.props;

    if (!powerfilter) {
      return null;
    }

    const PowerFilterComponent = powerfilter;

    const handler = isDefined(filterEditDialog) ?
      this.handleFilterEditClick : undefined;

    return (
      <Layout
        flex
        align="end"
        grow="1"
      >
        <PowerFilterComponent
          createFilterType={createFilterType}
          filter={filter}
          filters={filters}
          onEditClick={handler}
          onError={onError}
          onFilterCreated={onFilterCreated}
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

  renderDialogs() {
    const {
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
        filter={filter}
        onFilterChanged={onFilterChanged}
        onCloseClick={this.handleFilterDialogCloseClick}
      />
    );
  }

  render() {
    return (
      <Wrapper>
        {this.renderToolbar()}
        {this.renderSection()}
        {this.renderDialogs()}
      </Wrapper>
    );
  }
}

EntitiesPage.propTypes = {
  createFilterType: PropTypes.string,
  dashboard: PropTypes.componentOrFalse,
  dashboard2: PropTypes.func,
  dashboardControls: PropTypes.func,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.counts,
  filter: PropTypes.filter,
  filterEditDialog: PropTypes.component,
  filters: PropTypes.array,
  filtersFilter: PropTypes.filter,
  loadFilters: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  powerfilter: PropTypes.componentOrFalse,
  section: PropTypes.componentOrFalse,
  sectionIcon: PropTypes.icon,
  table: PropTypes.componentOrFalse,
  title: PropTypes.string,
  toolBarIcons: PropTypes.componentOrElement,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
  onFilterReset: PropTypes.func.isRequired,
};

export const createEntitiesPage = (options = {}) => {
  const EntitiesPageWrapper = props => {
    return (
      <EntitiesPage {...options} {...props}/>
    );
  };
  return EntitiesPageWrapper;
};

const mapStateToProps = (state, {filtersFilter}) => {
  if (!isDefined(filtersFilter)) {
    return {
      filters: [],
    };
  }

  const filterSelector = selector(state);
  const filters = filterSelector.getEntities(filtersFilter);
  return {
    filters: hasValue(filters) ? filters : [],
  };
};

const mapDispatchToProps = (dispatch, {gmp, filtersFilter}) => ({
  loadFilters: () => dispatch(loadEntities({gmp, filter: filtersFilter})),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(EntitiesPage);

// vim: set ts=2 sw=2 tw=80:
