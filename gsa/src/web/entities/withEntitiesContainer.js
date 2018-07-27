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

import getPage from 'web/store/pages/selectors';

import SubscriptionProvider from 'web/components/provider/subscriptionprovider';

import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';
import withDownload from 'web/components/form/withDownload';
import withDialogNotification from 'web/components/notification/withDialogNotifiaction'; // eslint-disable-line max-len

import EntitiesContainer from './container';
import {pageFilter} from 'web/store/pages/actions';
import {isDefined} from 'gmp/utils/identity';

const withEntitiesContainer = (gmpname, {
  entitiesSelector,
  loadEntities,
}) => Component => {
  let EntitiesContainerWrapper = props => (
    <SubscriptionProvider>
      {({notify}) => (
        <EntitiesContainer
          {...props}
          notify={notify}
          gmpname={gmpname}
        >
          {pageProps => (
            <Component
              {...pageProps}
            />
          )}
        </EntitiesContainer>
      )}
    </SubscriptionProvider>
  );

  const mapStateToProps = (state, props) => {
    const eSelector = entitiesSelector(state);
    const pSelector = getPage(state);
    const filter = pSelector.getFilter(gmpname);
    const entities = eSelector.getEntities(filter);
    return {
      entities,
      entitiesCounts: eSelector.getEntitiesCounts(filter),
      filter,
      isLoading: !isDefined(entities) || eSelector.isLoadingEntities(filter),
      loadedFilter: eSelector.getLoadedFilter(filter),
    };
  };

  const mapDispatchToProps = (dispatch, {gmp}) => ({
    loadEntities: filter => dispatch(loadEntities({gmp, filter})),
    updateFilter: filter => dispatch(pageFilter(gmpname, filter)),
  });

  EntitiesContainerWrapper = compose(
    withDialogNotification,
    withDownload,
    withGmp,
    connect(mapStateToProps, mapDispatchToProps),
  )(EntitiesContainerWrapper);

  return EntitiesContainerWrapper;
};

export default withEntitiesContainer;

// vim: set ts=2 sw=2 tw=80:
