/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Gmp from 'gmp/gmp';
import {type default as Filter, type FilterType} from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import {isDefined, hasValue} from 'gmp/utils/identity';
import ToolBar from 'web/components/bar/ToolBar';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import PowerFilter from 'web/components/powerfilter/PowerFilter';
import Section from 'web/components/section/Section';
import useTranslation from 'web/hooks/useTranslation';
import {loadAllEntities, selector} from 'web/store/entities/filters';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';

interface FilterDialogComponentProps {
  createFilterType?: string;
  filter?: FilterType;
  onClose: () => void;
  onFilterChanged: (filter: FilterType) => void;
  onFilterCreated: (filter: Filter) => void;
}

interface TableComponentProps<TModel extends Model = Model> {
  entities: TModel[];
  entitiesCounts?: CollectionCounts;
  filter?: FilterType;
}

interface PowerFilterComponentProps {
  filter?: FilterType;
  filters?: Filter[];
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  onEditClick?: () => void;
  onError?: (error: Error) => void;
  onRemoveClick?: () => void;
  onResetClick?: () => void;
  onUpdate?: (filter: FilterType) => void;
}

interface SectionComponentProps {
  className: string;
  extra?: React.ReactNode;
  img?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}

export interface EntitiesPageProps<TModel extends Model = Model, TProps = {}> {
  createFilterType: string;
  dashboard?: React.ReactNode | (() => React.ReactNode);
  dashboardControls?: React.ReactNode | (() => React.ReactNode);
  entities?: TModel[];
  entitiesCounts?: CollectionCounts;
  entitiesError?: Error;
  filter?: FilterType;
  filterEditDialog: React.ComponentType<FilterDialogComponentProps>;
  filtersFilter: FilterType;
  isLoading?: boolean;
  powerfilter?: React.ComponentType<PowerFilterComponentProps>;
  section?: false | React.ComponentType<SectionComponentProps>;
  sectionIcon?: React.ReactNode;
  table:
    | React.ComponentType<TableComponentProps<TModel> & TProps>
    | React.ReactElement<TableComponentProps<TModel> & TProps>;
  title: string;
  toolBarIcons?: React.ComponentType<TProps> | React.ReactElement<TProps>;
  onError: (error: Error) => void;
  onFilterChanged: (newFilter: FilterType) => void;
  onFilterCreated: (newFilter: Filter) => void;
  onFilterRemoved: () => void;
  onFilterReset: () => void;
}

interface EntitiesPagePropsWithHOCs<
  TModel extends Model = Model,
  TProps = {},
> extends EntitiesPageProps<TModel, TProps> {
  filters: Filter[];
  gmp: Gmp;
  loadFilters: () => void;
  isLoadingFilters?: boolean;
}

const EntitiesPage = <
  TModel extends Model = Model,
  TProps extends object = object,
>({
  createFilterType,
  dashboard,
  dashboardControls,
  entities,
  entitiesCounts,
  entitiesError,
  filter,
  filterEditDialog: FilterDialogComponent,
  filters,
  isLoading,
  isLoadingFilters,
  loadFilters,
  powerfilter = PowerFilter,
  section: SectionComponent = Section,
  sectionIcon,
  table: TableComponent,
  title,
  toolBarIcons: ToolBarIconsComponent,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
  ...props
}: EntitiesPagePropsWithHOCs<TModel, TProps> & TProps) => {
  const [_] = useTranslation();
  const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);

  useEffect(() => {
    loadFilters();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSectionTitle = () => {
    if (!isDefined(entitiesCounts)) {
      return title;
    }

    return _('{{title}} {{filtered}} of {{all}}', {
      title,
      filtered: entitiesCounts.filtered,
      all: entitiesCounts.all,
    });
  };

  const handleFilterEditClick = useCallback(() => {
    setShowFilterDialog(true);
  }, []);

  const handleFilterDialogCloseClick = useCallback(() => {
    setShowFilterDialog(false);
  }, []);

  const renderSection = () => {
    if (SectionComponent === false) {
      return null;
    }

    const extra =
      typeof dashboardControls === 'function'
        ? dashboardControls()
        : dashboardControls;
    return (
      <SectionComponent
        className="entities-section"
        extra={extra}
        img={sectionIcon}
        title={getSectionTitle()}
      >
        <Layout flex="column" grow="1">
          {typeof dashboard === 'function' ? dashboard() : dashboard}
          {isLoading && !isDefined(entities) ? <Loading /> : renderTable()}
        </Layout>
      </SectionComponent>
    );
  };

  const renderTable = () => {
    if (isDefined(entitiesError)) {
      return <ErrorMessage message={entitiesError.message} />;
    }

    if (!isDefined(entities) || !isDefined(TableComponent)) {
      return null;
    }

    if (React.isValidElement(TableComponent)) {
      return TableComponent;
    }

    return (
      <TableComponent
        {...(props as TProps)}
        entities={entities}
        entitiesCounts={entitiesCounts}
        filter={filter}
      />
    );
  };

  const renderPowerFilter = () => {
    if (!powerfilter) {
      return null;
    }

    const PowerFilterComponent = powerfilter;

    const handler = isDefined(FilterDialogComponent)
      ? handleFilterEditClick
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
  };

  const renderToolbarIcons = () => {
    if (!isDefined(ToolBarIconsComponent)) {
      return null;
    }

    if (React.isValidElement(ToolBarIconsComponent)) {
      return ToolBarIconsComponent;
    }
    return <ToolBarIconsComponent {...(props as TProps)} />;
  };

  const renderToolbar = () => {
    return (
      <ToolBar>
        {renderToolbarIcons()}
        {renderPowerFilter()}
      </ToolBar>
    );
  };

  const handleFilterCreated = useCallback(
    (filter: Filter) => {
      loadFilters();
      onFilterCreated(filter);
    },
    [loadFilters, onFilterCreated],
  );

  const renderDialogs = () => {
    if (!FilterDialogComponent || !showFilterDialog) {
      return null;
    }

    return (
      <FilterDialogComponent
        createFilterType={createFilterType}
        filter={filter}
        onClose={handleFilterDialogCloseClick}
        onFilterChanged={onFilterChanged}
        onFilterCreated={handleFilterCreated}
      />
    );
  };

  return (
    <Layout align="start" flex="column" grow="1">
      {renderToolbar()}
      {renderSection()}
      {renderDialogs()}
    </Layout>
  );
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
  connect(mapStateToProps, mapDispatchToProps),
)(EntitiesPage) as <TModel extends Model = Model, TProps = {}>(
  props: EntitiesPageProps<TModel, TProps> & TProps,
) => React.ReactElement<EntitiesPageProps<TModel, TProps> & TProps>;
