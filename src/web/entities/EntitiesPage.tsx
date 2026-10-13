/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useState} from 'react';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type default as Filter, type FilterType} from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
import ToolBar from 'web/components/bar/ToolBar';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import PowerFilter from 'web/components/powerfilter/PowerFilter';
import Section from 'web/components/section/Section';
import {useGetFilters} from 'web/hooks/use-query/filters';
import useTranslation from 'web/hooks/useTranslation';

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
  filtersFilter,
  isLoading,
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
}: EntitiesPageProps<TModel, TProps> & TProps) => {
  const [_] = useTranslation();
  const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);
  const {
    data,
    isLoading: isLoadingFilters,
    refetch: refetchFilters,
  } = useGetFilters({
    enabled: isDefined(filtersFilter),
    filter: isDefined(filtersFilter) ? filtersFilter.all() : undefined,
  });
  const filters = data?.entities ?? [];

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
      void refetchFilters(); // required until powerfilter is converted to query hook-based filter creation
      onFilterCreated(filter);
    },
    [refetchFilters, onFilterCreated],
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

export default EntitiesPage;
