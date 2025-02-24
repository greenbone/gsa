/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {createAll} from 'web/store/entities/utils/main';

const {
  loadAllEntities,
  entitiesLoadingActions,
  entityLoadingActions,
  loadEntities,
  loadEntity,
  reducer,
  selector,
} = createAll('schedule');

export {
  loadAllEntities,
  entitiesLoadingActions,
  entityLoadingActions,
  loadEntities,
  loadEntity,
  reducer,
  selector,
};
