/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {connect} from 'react-redux';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Gmp from 'gmp/gmp';
import Rejection from 'gmp/http/rejection';
import Filter from 'gmp/models/filter';
import Model from 'gmp/models/model';
import {isDefined, hasValue} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import Toolbar from 'web/components/bar/Toolbar';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import PowerFilter from 'web/components/powerfilter/PowerFilter';
import Section from 'web/components/section/Section';
import {TranslateFunc} from 'web/hooks/useTranslation';
import {loadAllEntities, selector} from 'web/store/entities/filters';
import compose from 'web/utils/Compose';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

const excludeProps = [
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

interface FilterDialogComponentProps {
  createFilterType?: string;
  filter?: Filter;
  onCloseClick: () => void;
  onFilterChanged: (filter: Filter) => void;
  onFilterCreated: (filter: Filter) => void;
}

interface TableComponentProps<TModel extends Model = Model> {
  entities: TModel[];
  entitiesCounts?: CollectionCounts;
  filter?: Filter;
}

interface PowerFilterComponentProps {
  filter?: Filter;
  filters?: Filter[];
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  onEditClick?: () => void;
  onError?: (error: Error | Rejection) => void;
  onRemoveClick?: () => void;
  onResetClick?: () => void;
  onUpdate?: (filter: Filter) => void;
}

interface SectionComponentProps {
  className: string;
  extra?: React.ReactNode;
  img?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}

interface EntitiesPageState {
  showFilterDialog: boolean;
}

export interface EntitiesPageProps<TModel extends Model = Model, TProps = {}> {
  createFilterType: string;
  dashboard?: () => React.ReactNode;
  dashboardControls?: () => React.ReactNode;
  entities?: TModel[];
  entitiesCounts?: CollectionCounts;
  entitiesError?: Error | Rejection;
  filter?: Filter;
  filterEditDialog: React.ComponentType<FilterDialogComponentProps>;
  filtersFilter: Filter;
  isLoading?: boolean;
  powerfilter?: React.ComponentType<PowerFilterComponentProps>;
  section?: false | React.ComponentType<SectionComponentProps>;
  sectionIcon?: React.ReactNode;
  table: React.ComponentType<TableComponentProps<TModel> & TProps>;
  title: string;
  toolBarIcons?: React.ComponentType<TProps> | React.ReactElement<TProps>;
  onError: (error: Error | Rejection) => void;
  onFilterChanged: (newFilter: Filter) => void;
  onFilterCreated: (newFilter: Filter) => void;
  onFilterRemoved: () => void;
  onFilterReset: () => void;
}

interface EntitiesPagePropsWithHOCs<TModel extends Model = Model, TProps = {}>
  extends EntitiesPageProps<TModel, TProps> {
  filters: Filter[];
  gmp: Gmp;
  loadFilters: () => void;
  isLoadingFilters?: boolean;
  _: TranslateFunc;
}

class EntitiesPage<
  TModel extends Model = Model,
  TProps extends {} = {},
> extends React.Component<
  EntitiesPagePropsWithHOCs<TModel, TProps>,
  EntitiesPageState
> {
  constructor(props: EntitiesPagePropsWithHOCs<TModel, TProps> & TProps) {
    super(props);

    this.state = {
      showFilterDialog: false,
    };

    this.handleFilterCreated = this.handleFilterCreated.bind(this);
    this.handleFilterEditClick = this.handleFilterEditClick.bind(this);
    this.handleFilterDialogCloseClick =
      this.handleFilterDialogCloseClick.bind(this);
  }

  componentDidMount() {
    this.props.loadFilters();
  }

  getSectionTitle() {
    const {entitiesCounts, title, _} = this.props;

    if (!isDefined(entitiesCounts)) {
      return title;
    }

    return _('{{title}} {{filtered}} of {{all}}', {
      title,
      filtered: entitiesCounts.filtered,
      all: entitiesCounts.all,
    });
  }

  handleFilterEditClick() {
    this.setState({showFilterDialog: true});
  }

  handleFilterDialogCloseClick() {
    this.setState({showFilterDialog: false});
  }

  renderSection() {
    const {entities, isLoading, sectionIcon, dashboard, dashboardControls} =
      this.props;

    let {section: SectionComponent = Section} = this.props;

    if (SectionComponent === false) {
      return null;
    }

    const extra = isDefined(dashboardControls)
      ? dashboardControls()
      : undefined;
    return (
      <SectionComponent
        className="entities-section"
        extra={extra}
        img={sectionIcon}
        title={this.getSectionTitle()}
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

    const other = excludeObjectProps(props, excludeProps);

    return (
      <TableComponent
        {...(other as TProps)}
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
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
    let {toolBarIcons: ToolBarIconsComponent, ...other} = this.props;

    if (!isDefined(ToolBarIconsComponent)) {
      return null;
    }

    if (React.isValidElement(ToolBarIconsComponent)) {
      return ToolBarIconsComponent;
    }
    const otherProps = excludeObjectProps(other, excludeProps);
    return <ToolBarIconsComponent {...(otherProps as TProps)} />;
  }

  renderToolbar() {
    return (
      <Toolbar>
        {this.renderToolbarIcons()}
        {this.renderPowerFilter()}
      </Toolbar>
    );
  }

  handleFilterCreated(filter: Filter) {
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
        onCloseClick={this.handleFilterDialogCloseClick}
        onFilterChanged={onFilterChanged}
        onFilterCreated={this.handleFilterCreated}
      />
    );
  }

  render() {
    return (
      <Layout align="start" flex="column" grow="1">
        {this.renderToolbar()}
        {this.renderSection()}
        {this.renderDialogs()}
      </Layout>
    );
  }
}

export const createEntitiesPage = (options = {}) => {
  const EntitiesPageWrapper = props => {
    return <EntitiesPage {...options} {...props} />;
  };
  return EntitiesPageWrapper;
};

const mapStateToProps = (
  state: unknown,
  {filtersFilter}: {filtersFilter: Filter},
) => {
  if (!isDefined(filtersFilter)) {
    return {
      filters: [],
      isLoadingFilters: false,
    };
  }

  const filterSelector = selector(state);
  const filters = filterSelector.getAllEntities(filtersFilter) as
    | Filter[]
    | undefined;

  return {
    filters: hasValue(filters) ? filters : [],
    isLoadingFilters: filterSelector.isLoadingAllEntities(filtersFilter),
  };
};

const mapDispatchToProps = (
  dispatch,
  {
    gmp,
    filtersFilter,
  }: {
    gmp: Gmp;
    filtersFilter: Filter;
  },
) => ({
  loadFilters: () => dispatch(loadAllEntities(gmp)(filtersFilter)),
});

export default compose(
  withGmp,
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
)(EntitiesPage) as <TModel extends Model = Model, TProps = {}>(
  props: EntitiesPageProps<TModel, TProps> & TProps,
) => React.ReactElement<EntitiesPageProps<TModel, TProps> & TProps>;
