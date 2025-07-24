/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {connect} from 'react-redux';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Gmp from 'gmp/gmp';
import Rejection from 'gmp/http/rejection';
import Filter from 'gmp/models/filter';
import Model from 'gmp/models/model';
import {DownloadFunc} from 'web/components/form/useDownload';
import withDownload from 'web/components/form/withDownload';
import Reload from 'web/components/loading/Reload';
import withDialogNotification, {
  DialogNotificationProps,
} from 'web/components/notification/withDialogNotification';
import SubscriptionProvider, {
  NotifyFunc,
} from 'web/components/provider/SubscriptionProvider';
import EntitiesContainer, {
  EntitiesContainerRenderProps,
} from 'web/entities/EntitiesContainer';
import FilterProvider from 'web/entities/FilterProvider';
import {pageFilter} from 'web/store/pages/actions';
import compose from 'web/utils/Compose';
import {updateDisplayName} from 'web/utils/displayName';
import withGmp from 'web/utils/withGmp';

const noop = () => {};

interface ReduxMapProps {
  gmp: Gmp;
  filter: Filter;
}

interface EntitiesReloadOptions {
  filter?: Filter;
}

interface EntitiesSelector<TModel extends Model = Model> {
  getEntities: (filter?: Filter) => TModel[];
  getEntitiesCounts: (filter?: Filter) => CollectionCounts;
  getEntitiesError: (filter?: Filter) => Error | Rejection;
  isLoadingEntities: (filter?: Filter) => boolean;
  getLoadedFilter: (filter?: Filter) => Filter;
}

interface EntitiesContainerWrapperProps {
  filter: Filter;
  loadEntities: (filter: Filter) => void;
  notify: NotifyFunc;
}

interface OtherProps<TModel extends Model = Model>
  extends DialogNotificationProps {
  gmp: Gmp;
  entities: TModel[];
  entitiesCounts: CollectionCounts;
  entitiesError?: Error | Rejection;
  filter: Filter;
  isLoading: boolean;
  loadedFilter: Filter;
  loadEntities: (filter?: Filter) => void;
  updateFilter: (filter?: Filter) => void;
  onDownload: DownloadFunc;
}

interface ReloadIntervalProps<TModel extends Model = Model> {
  gmp: Gmp;
  entities: TModel[];
  entitiesCounts: CollectionCounts;
  isLoading: boolean;
}

interface WithEntitiesContainerProps<TModel extends Model = Model> {
  reloadInterval?: (props: ReloadIntervalProps<TModel>) => number | void;
  fallbackFilter?: Filter;
  entitiesSelector: (state: unknown) => EntitiesSelector<TModel>;
  loadEntities: (gmp: Gmp) => (filter?: Filter) => void;
}

const withEntitiesContainer =
  <TModel extends Model = Model>(
    gmpName: string,
    {
      entitiesSelector,
      loadEntities: loadEntitiesFunc,
      reloadInterval = noop,
      fallbackFilter,
    }: WithEntitiesContainerProps<TModel>,
  ) =>
  (Component: React.ComponentType<EntitiesContainerRenderProps<TModel>>) => {
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
      loadEntities: (filter?: Filter) =>
        dispatch(loadEntitiesFunc(gmp)(filter)),
      updateFilter: (filter?: Filter) => dispatch(pageFilter(gmpName, filter)),
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
      }: EntitiesContainerWrapperProps & OtherProps<TModel>) => (
        <Reload<EntitiesReloadOptions>
          name={gmpName}
          reload={(newFilter = filter) => loadEntities(newFilter)}
          reloadInterval={() =>
            reloadInterval({gmp, entities, entitiesCounts, isLoading})
          }
        >
          {({reload}) => (
            <EntitiesContainer<TModel>
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
              {(pageProps: EntitiesContainerRenderProps<TModel>) => (
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
