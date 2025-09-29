/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import useEntityCreate from 'web/entity/hooks/useEntityCreate';

describe('useEntityCreate', () => {
  test('should allow to create an entity', async () => {
    const entity = {name: 'foo'};
    const createEntity = testing.fn().mockResolvedValue(entity);
    const gmp = {
      task: {create: createEntity},
    };
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntityCreate('task', {
        onCreated,
        onCreateError,
      }),
    );
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(createEntity).toHaveBeenCalledWith(entity);
    expect(onCreated).toHaveBeenCalledWith(entity);
    expect(onCreateError).not.toHaveBeenCalled();
  });

  test('should call onCreateError when creating an entity fails', async () => {
    const createEntity = testing.fn().mockRejectedValue(new Error('error'));
    const entity = {name: 'foo'};
    const gmp = {
      task: {create: createEntity},
    };
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const {renderHook} = rendererWith({gmp, store: true});

    const {result} = renderHook(() =>
      useEntityCreate('task', {
        onCreated,
        onCreateError,
      }),
    );
    expect(result.current).toBeDefined();
    await result.current(entity);
    expect(createEntity).toHaveBeenCalledWith(entity);
    expect(onCreated).not.toHaveBeenCalled();
    expect(onCreateError).toHaveBeenCalledOnce();
  });
});
