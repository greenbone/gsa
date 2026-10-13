/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {createAll} from 'web/store/entities/utils/main';

const {
  loadAllEntities,
  loadEntities,
  reducer,
  selector,
  entitiesLoadingActions,
  entityLoadingActions,
} = createAll('cpe');

const loadEntity = gmp => id => (dispatch, getState) => {
  const state = selector(getState());

  if (state.isLoadingEntity(id)) {
    return Promise.resolve();
  }

  dispatch(entityLoadingActions.request(id));

  return gmp.cpe.get({id}).then(
    response => dispatch(entityLoadingActions.success(id, response.data)),
    error => dispatch(entityLoadingActions.error(id, error)),
  );
};

export {
  loadAllEntities,
  loadEntities,
  loadEntity,
  reducer,
  selector,
  entitiesLoadingActions,
  entityLoadingActions,
};
