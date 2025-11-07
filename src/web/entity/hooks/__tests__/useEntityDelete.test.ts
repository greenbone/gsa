/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import Model from 'gmp/models/model';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';

describe('useEntityDelete', () => {
  test('should allow to delete an entity', async () => {
    const entity = new Model(
      {
        id: '123',
        name: 'Test Entity',
      },
      'task',
    );
    const deleteEntity = testing.fn().mockResolvedValue(entity);
    const gmp = {
      task: {delete: deleteEntity},
    };
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useEntityDelete(deleteEntity, {
        onDeleted,
        onDeleteError,
      }),
    );
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(deleteEntity).toHaveBeenCalledWith({id: '123'});
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(onDeleteError).not.toHaveBeenCalled();
  });

  test('should call onDeleteError when deleting an entity fails', async () => {
    const deleteEntity = testing.fn().mockRejectedValue(new Error('error'));
    const entity = new Model(
      {
        id: '123',
        name: 'Test Entity',
      },
      'task',
    );
    const gmp = {
      task: {delete: deleteEntity},
    };
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();

    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useEntityDelete(deleteEntity, {
        onDeleted,
        onDeleteError,
      }),
    );
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(deleteEntity).toHaveBeenCalledWith({id: '123'});
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onDeleteError).toHaveBeenCalledOnce();
  });
});
