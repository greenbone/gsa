/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {connect} from 'react-redux';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Gmp from 'gmp/gmp';
import type Rejection from 'gmp/http/rejection';
import {type default as Filter, type FilterType} from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import {type EntityType} from 'gmp/utils/entity-type';
import {type DownloadFunc} from 'web/components/form/useDownload';
import withDownload from 'web/components/form/withDownload';
import Reload from 'web/components/loading/Reload';
import withDialogNotification, {
  type DialogNotificationProps,
} from 'web/components/notification/withDialogNotification';
import SubscriptionProvider, {
  type NotifyFunc,
} from 'web/components/provider/SubscriptionProvider';
import EntitiesContainer, {
  type EntitiesContainerRenderProps,
} from 'web/entities/EntitiesContainer';
import FilterProvider from 'web/entities/FilterProvider';
import {pageFilter} from 'web/store/pages/actions';
import compose from 'web/utils/Compose';
import {updateDisplayName} from 'web/utils/display-name';
import withGmp from 'web/utils/withGmp';

interface ReduxMapProps {
  gmp: Gmp;
  filter: FilterType;
}

interface EntitiesReloadOptions {
  filter?: FilterType;
}

interface EntitiesSelector<TEntity extends Model = Model> {
  getEntities: (filter?: FilterType) => TEntity[];
  getEntitiesCounts: (filter?: FilterType) => CollectionCounts;
  getEntitiesError: (filter?: FilterType) => Error | Rejection;
  isLoadingEntities: (filter?: FilterType) => boolean;
  getLoadedFilter: (filter?: FilterType) => Filter;
}

interface EntitiesContainerWrapperProps {
  filter: FilterType;
  loadEntities: (filter: FilterType) => void;
  notify: NotifyFunc;
}

interface OtherProps<
  TEntity extends Model = Model,
> extends DialogNotificationProps {
  gmp: Gmp;
  entities: TEntity[];
  entitiesCounts: CollectionCounts;
  entitiesError?: Error | Rejection;
  filter: FilterType;
  isLoading: boolean;
  loadedFilter: FilterType;
  loadEntities: (filter?: FilterType) => void;
  updateFilter: (filter?: FilterType) => void;
  onDownload: DownloadFunc;
}

interface ReloadIntervalProps<TEntity extends Model = Model> {
  gmp: Gmp;
  entities: TEntity[];
  entitiesCounts: CollectionCounts;
  isLoading: boolean;
}

/**
 * Represents the props provided for the component passed to `withEntitiesContainer`.
 *
 * @template TEntity - A type that extends the `Model` interface, representing the data model
 *                    associated with the entities container.
 */
export type WithEntitiesContainerComponentProps<TEntity extends Model> =
  EntitiesContainerRenderProps<TEntity>;

interface WithEntitiesContainerOptions<TEntity extends Model = Model> {
  reloadInterval?: (props: ReloadIntervalProps<TEntity>) => number | void;
  fallbackFilter?: FilterType;
  entitiesSelector: (state: unknown) => EntitiesSelector<TEntity>;
  loadEntities: (gmp: Gmp) => (filter?: FilterType) => void;
}

const noop = () => {};

/**
 * A higher-order component (HOC) that wraps a given React component to provide
 * entity-related functionality, such as loading, filtering, and managing entities
 * from a Redux store. This HOC is designed to work with entities managed by GMP (Greenbone Management Protocol).
 *
 * @template TEntity - The type of the entity being managed, extending the `Model` type.
 *
 * @param gmpName - The name of the GMP entity being managed.
 * @param options - Configuration options for the HOC.
 * @param options.entitiesSelector - A selector function to retrieve entities from the Redux state.
 * @param options.loadEntities - A function to dispatch an action to load entities.
 * @param options.reloadInterval - A function or value to determine the reload interval for entities.
 * @param options.fallbackFilter - A fallback filter to use when no filter is provided.
 *
 * @returns A function that takes a React component and returns a new component wrapped with entity-related functionality.
 *          The returned new component doesn't need or forwards any props.
 *
 * @example
 * ```tsx
 * const MyComponent = ({ entities }: WithEntitiesContainerComponentProps<MyEntity>) => {
 *   return (
 *     <div>
 *       {entities.map(entity => (
 *         <div key={entity.id}>{entity.name}</div>
 *       ))}
 *     </div>
 *   );
 * };
 *
 * const MyComponentWithEntities = withEntitiesContainer<MyEntity>('myGmpName', {
 *   entitiesSelector: state => state.myEntities,
 *   loadEntities: myLoadEntitiesAction,
 *   reloadInterval: myReloadIntervalFunction,
 *   fallbackFilter: myFallbackFilter,
 * })(MyComponent);
 * ```
 */
const withEntitiesContainer =
  <TEntity extends Model = Model>(
    gmpName: EntityType,
    {
      entitiesSelector,
      loadEntities: loadEntitiesFunc,
      reloadInterval = noop,
      fallbackFilter,
    }: WithEntitiesContainerOptions<TEntity>,
  ) =>
  (
    Component: React.ComponentType<
      WithEntitiesContainerComponentProps<TEntity>
    >,
  ) => {
    const mapStateToProps = (state: unknown, {filter}: ReduxMapProps) => {
      const eSelector = entitiesSelector(state);
      const entities = eSelector.getEntities(filter);
      return {
        entities,
        entitiesCounts: eSelector.getEntitiesCounts(filter),
        entitiesError: eSelector.getEntitiesError(filter),
        filter,
        isLoading: eSelector.isLoadingEntities(filter),
        loadedFilter: eSelector.getLoadedFilter(filter),
      };
    };

    const mapDispatchToProps = (dispatch, {gmp}: ReduxMapProps) => ({
      loadEntities: (filter?: FilterType) =>
        dispatch(loadEntitiesFunc(gmp)(filter)),
      updateFilter: (filter?: FilterType) =>
        dispatch(pageFilter(gmpName, filter)),
    });

    const EntitiesContainerWrapper = compose(
      withDialogNotification,
      withDownload,
      withGmp,
      connect(mapStateToProps, mapDispatchToProps),
    )(
      ({
        entities,
        entitiesCounts,
        entitiesError,
        filter,
        gmp,
        isLoading,
        loadedFilter,
        loadEntities,
        notify,
        updateFilter,
        showError,
        showErrorMessage,
        showSuccessMessage,
        onDownload,
      }: EntitiesContainerWrapperProps & OtherProps<TEntity>) => (
        <Reload<EntitiesReloadOptions>
          name={gmpName}
          reload={(newFilter = filter) => loadEntities(newFilter)}
          reloadInterval={() =>
            reloadInterval({gmp, entities, entitiesCounts, isLoading})
          }
        >
          {({reload}) => (
            <EntitiesContainer<TEntity>
              entities={entities}
              entitiesCounts={entitiesCounts}
              entitiesError={entitiesError}
              filter={filter}
              gmp={gmp}
              gmpName={gmpName}
              isLoading={isLoading}
              loadedFilter={loadedFilter}
              notify={notify}
              reload={reload}
              showError={showError}
              showErrorMessage={showErrorMessage}
              showSuccessMessage={showSuccessMessage}
              updateFilter={updateFilter}
              onDownload={onDownload}
            >
              {(pageProps: EntitiesContainerRenderProps<TEntity>) => (
                <Component {...pageProps} />
              )}
            </EntitiesContainer>
          )}
        </Reload>
      ),
    );

    updateDisplayName(
      EntitiesContainerWrapper,
      Component,
      'withEntitiesContainer',
    );

    const WithEntitiesContainer = () => {
      return (
        <SubscriptionProvider>
          {({notify}) => (
            <FilterProvider fallbackFilter={fallbackFilter} gmpName={gmpName}>
              {({filter}) => (
                <EntitiesContainerWrapper filter={filter} notify={notify} />
              )}
            </FilterProvider>
          )}
        </SubscriptionProvider>
      );
    };
    return WithEntitiesContainer;
  };

export default withEntitiesContainer;
