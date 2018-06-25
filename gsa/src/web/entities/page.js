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

import {is_defined, has_value} from 'gmp/utils/identity';
import {exclude_object_props} from 'gmp/utils/object';

import PropTypes from '../utils/proptypes.js';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';
import {render_section_title} from '../utils/render.js';

import Toolbar from '../components/bar/toolbar.js';

import Layout from '../components/layout/layout.js';
import Wrapper from '../components/layout/wrapper.js';

import Loading from '../components/loading/loading.js';

import PowerFilter from '../components/powerfilter/powerfilter.js';

import Section from '../components/section/section.js';

import getFilters from 'web/store/entities/filters/selectors';
import {loadFilters} from 'web/store/entities/filters/actions';

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

    return render_section_title(entitiesCounts, title);
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

    if (!is_defined(SectionComponent)) {
      SectionComponent = Section;
    }

    const extra = is_defined(dashboardControls) ? dashboardControls() :
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
          {is_defined(dashboard2) &&
            dashboard2({filter, onFilterChanged})
          }
          {loading && !is_defined(entities) ?
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

    if (!is_defined(entities) || !is_defined(TableComponent)) {
      return null;
    }

    const other = exclude_object_props(props, exclude_props);

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

    const handler = is_defined(filterEditDialog) ?
      this.handleFilterEditClick : undefined;

    return (
      <Layout
        flex
        align="end"
        grow="1">
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

    if (!is_defined(toolBarIcons)) {
      return null;
    }

    if (React.isValidElement(toolBarIcons)) {
      return toolBarIcons;
    }
    other = exclude_object_props(other, exclude_props);
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
  if (!is_defined(filtersFilter)) {
    return {
      filters: [],
    };
  }

  const filterSelector = getFilters(state);
  const filters = filterSelector.getEntities(filtersFilter);
  return {
    filters: has_value(filters) ? filters : [],
  };
};

const mapDispatchToProps = (dispatch, {gmp, filtersFilter}) => ({
  loadFilters: () => dispatch(loadFilters({gmp, filter: filtersFilter})),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(EntitiesPage);

// vim: set ts=2 sw=2 tw=80:
