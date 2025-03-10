/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import useEntitySave from 'web/entity/hooks/useEntitySave';
import {rendererWith, wait} from 'web/utils/Testing';

describe('useEntitySave', () => {
  test('should allow to save an entity', async () => {
    const entity = {id: '123'};
    const saveEntity = testing.fn().mockResolvedValue(entity);
    const gmp = {
      foo: {save: saveEntity},
    };
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntitySave('foo', {
        onSaved,
        onSaveError,
        onCreated,
        onCreateError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined;
    result.current(entity);
    await wait();
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
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntitySave('foo', {
        onSaved,
        onSaveError,
        onCreated,
        onCreateError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined;
    result.current(entity);
    await wait();
    expect(saveEntity).toHaveBeenCalledWith(entity);
    expect(onSaved).not.toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledOnce();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should allow to create an entity', async () => {
    const entity = {name: 'foo'};
    const createEntity = testing.fn().mockResolvedValue(entity);
    const gmp = {
      foo: {create: createEntity},
    };
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntitySave('foo', {
        onSaved,
        onSaveError,
        onCreated,
        onCreateError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined;
    result.current(entity);
    await wait();
    expect(createEntity).toHaveBeenCalledWith(entity);
    expect(onCreated).toHaveBeenCalledWith(entity);
    expect(onCreateError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onCreateError when creating an entity fails', async () => {
    const createEntity = testing.fn().mockRejectedValue(new Error('error'));
    const entity = {name: 'foo'};
    const gmp = {
      foo: {create: createEntity},
    };
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntitySave('foo', {
        onSaved,
        onSaveError,
        onCreated,
        onCreateError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined;
    result.current(entity);
    await wait();
    expect(createEntity).toHaveBeenCalledWith(entity);
    expect(onCreated).not.toHaveBeenCalled();
    expect(onCreateError).toHaveBeenCalledOnce();
    expect(onInteraction).toHaveBeenCalledOnce();
  });
});
