/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {deltaReportActions} from 'web/store/entities/report/actions';
import {
  entitiesActions,
  loadEntities,
  reducer,
  deltaReducer,
} from 'web/store/entities/reports';
import {
  testEntitiesActions,
  testLoadEntities,
  testReducerForEntities,
  testReducerForEntity,
} from 'web/store/entities/utils/testing';

testEntitiesActions('report', entitiesActions);
testLoadEntities('report', loadEntities);
testReducerForEntities('report', reducer, entitiesActions);

testReducerForEntity('deltaReport', deltaReducer, deltaReportActions);
