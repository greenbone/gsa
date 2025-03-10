/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import {rendererWith, wait} from 'web/utils/Testing';

describe('useEntityClone', () => {
  test('should allow to clone an entity', async () => {
    const entity = {id: '123'};
    const cloneEntity = testing.fn().mockResolvedValue(entity);
    const gmp = {
      foo: {clone: cloneEntity},
    };
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntityClone('foo', {
        onCloned,
        onCloneError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined;
    result.current(entity);
    await wait();
    expect(cloneEntity).toHaveBeenCalledWith(entity);
    expect(onCloned).toHaveBeenCalledWith(entity);
    expect(onCloneError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onCloneError when cloning an entity fails', async () => {
    const cloneEntity = testing.fn().mockRejectedValue(new Error('error'));
    const entity = {id: '123'};
    const gmp = {
      foo: {clone: cloneEntity},
    };
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const onInteraction = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntityClone('foo', {
        onCloned,
        onCloneError,
        onInteraction,
      }),
    );
    expect(result.current).toBeDefined;
    result.current(entity);
    await wait();
    expect(cloneEntity).toHaveBeenCalledWith(entity);
    expect(onCloned).not.toHaveBeenCalled();
    expect(onCloneError).toHaveBeenCalledWith(new Error('error'));
    expect(onInteraction).toHaveBeenCalledOnce();
  });
});
