/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import {useLocation} from 'react-router-dom';

import {connect} from 'react-redux';

import FilterProvider from 'web/entities/filterprovider';

import SubscriptionProvider from 'web/components/provider/subscriptionprovider';
import Reload from 'web/components/loading/reload';
import withDownload from 'web/components/form/withDownload';
import withDialogNotification from 'web/components/notification/withDialogNotifiaction'; // eslint-disable-line max-len

import {pageFilter} from 'web/store/pages/actions';
import {renewSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntitiesContainer from './container';

const noop = () => {};

const withEntitiesContainer = (
  gmpname,
  {
    entitiesSelector,
    loadEntities: loadEntitiesFunc,
    reloadInterval = noop,
    fallbackFilter,
  },
) => Component => {
  let EntitiesContainerWrapper = ({
    children,
    filter,
    loadEntities,
    notify,
    ...props
  }) => (
    <Reload
      reloadInterval={() => reloadInterval(props)}
      reload={(newFilter = filter) => loadEntities(newFilter)}
      name={gmpname}
    >
      {({reload}) => (
        <EntitiesContainer
          {...props}
          filter={filter}
          notify={notify}
          gmpname={gmpname}
          reload={reload}
        >
          {pageProps => <Component {...pageProps} />}
        </EntitiesContainer>
      )}
    </Reload>
  );

  EntitiesContainerWrapper.propTypes = {
    filter: PropTypes.filter,
    loadEntities: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
  };

  const mapStateToProps = (state, {filter}) => {
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

  const mapDispatchToProps = (dispatch, {gmp}) => ({
    loadEntities: filter => dispatch(loadEntitiesFunc(gmp)(filter)),
    updateFilter: filter => dispatch(pageFilter(gmpname, filter)),
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
  });

  EntitiesContainerWrapper = compose(
    withDialogNotification,
    withDownload,
    withGmp,
    connect(
      mapStateToProps,
      mapDispatchToProps,
    ),
  )(EntitiesContainerWrapper);

  return props => {
    const location = useLocation();
    return (
      <SubscriptionProvider>
        {({notify}) => (
          <FilterProvider
            fallbackFilter={fallbackFilter}
            gmpname={gmpname}
            locationQuery={location.query}
          >
            {({filter}) => (
              <EntitiesContainerWrapper
                {...props}
                filter={filter}
                notify={notify}
              />
            )}
          </FilterProvider>
        )}
      </SubscriptionProvider>
    );
  };
};

export default withEntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
