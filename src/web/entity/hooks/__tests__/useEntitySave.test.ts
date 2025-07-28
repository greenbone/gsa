/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import useEntitySave from 'web/entity/hooks/useEntitySave';

describe('useEntitySave', () => {
  test('should allow to save an entity', async () => {
    const entity = {id: '123'};
    const saveEntity = testing.fn().mockResolvedValue(entity);
    const gmp = {
      foo: {save: saveEntity},
    };
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntitySave('foo', {
        onSaved,
        onSaveError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(saveEntity).toHaveBeenCalledWith(entity);
    expect(onSaved).toHaveBeenCalledWith(entity);
    expect(onSaveError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onSaveError when saving an entity fails', async () => {
    const saveEntity = testing.fn().mockRejectedValue(new Error('error'));
    const entity = {id: '123'};
    const gmp = {
      foo: {save: saveEntity},
    };
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntitySave('foo', {
        onSaved,
        onSaveError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(saveEntity).toHaveBeenCalledWith(entity);
    expect(onSaved).not.toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledOnce();
    expect(onInteraction).toHaveBeenCalledOnce();
  });
});
