/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  testEntitiesActions,
  testLoadEntities,
  testReducerForEntities,
  testReducerForEntity,
} from 'web/store/entities/utils/testing';

import {deltaReportActions} from '../report/actions';
import {entitiesActions, loadEntities, reducer, deltaReducer} from '../reports';

testEntitiesActions('report', entitiesActions);
testLoadEntities('report', loadEntities);
testReducerForEntities('report', reducer, entitiesActions);

testReducerForEntity('deltaReport', deltaReducer, deltaReportActions);

// vim: set ts=2 sw=2 tw=80:
