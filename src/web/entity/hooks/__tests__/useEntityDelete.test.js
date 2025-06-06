/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, wait} from 'web/testing';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';

describe('useEntityDelete', () => {
  test('should allow to delete an entity', async () => {
    const entity = {id: '123'};
    const deleteEntity = testing.fn().mockResolvedValue(entity);
    const gmp = {
      foo: {delete: deleteEntity},
    };
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useEntityDelete('foo', {
        onDeleted,
        onDeleteError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined();
    result.current(entity);
    await wait();
    expect(deleteEntity).toHaveBeenCalledWith(entity);
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(onDeleteError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onDeleteError when deleting an entity fails', async () => {
    const deleteEntity = testing.fn().mockRejectedValue(new Error('error'));
    const entity = {id: '123'};
    const gmp = {
      foo: {delete: deleteEntity},
    };
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});
    const {result} = renderHook(() =>
      useEntityDelete('foo', {
        onDeleted,
        onDeleteError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined();
    result.current(entity);
    await wait();
    expect(deleteEntity).toHaveBeenCalledWith(entity);
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onDeleteError).toHaveBeenCalledOnce();
    expect(onInteraction).toHaveBeenCalledOnce();
  });
});
