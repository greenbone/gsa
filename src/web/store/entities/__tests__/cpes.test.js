/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import * as cpe from 'web/store/entities/cpes';
import {testAll} from 'web/store/entities/utils/testing';

testAll('cpe', cpe);

describe('CPE entity loading', () => {
  const id = 'cpe:/a:gitlab:gitlab:18.5.1';
  const getState = testing.fn().mockReturnValue({
    entities: {cpe: {isLoading: {}}},
  });

  test('should load a CPE directly without candidate lookup', async () => {
    const dispatch = testing.fn();
    const gmp = {
      cpe: {get: testing.fn().mockResolvedValue({data: {id}})},
      cpes: {get: testing.fn()},
    };

    await cpe.loadEntity(gmp)(id)(dispatch, getState);

    expect(gmp.cpe.get).toHaveBeenCalledTimes(1);
    expect(gmp.cpe.get).toHaveBeenCalledWith({id});
    expect(gmp.cpes.get).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  test('should dispatch detail errors without list lookup', async () => {
    const dispatch = testing.fn();
    const error = new Error('CPE not found');
    const gmp = {
      cpe: {get: testing.fn().mockRejectedValue(error)},
      cpes: {get: testing.fn()},
    };

    await cpe.loadEntity(gmp)(id)(dispatch, getState);

    expect(gmp.cpe.get).toHaveBeenCalledWith({id});
    expect(gmp.cpes.get).not.toHaveBeenCalled();
    expect(dispatch.mock.calls.at(-1)[0].error).toBe(error);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});
