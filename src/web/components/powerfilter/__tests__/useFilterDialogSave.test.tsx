/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import Filter from 'gmp/models/filter';
import useFilterDialogSave from 'web/components/powerfilter/useFilterDialogSave';

describe('useFilterDialogSave', () => {
  test('should create a named filter and keep the entered name', async () => {
    const create = testing.fn().mockResolvedValue({data: {id: '123'}});
    const createdFilter = Filter.fromElement({_id: '123', term: 'foo=bar'});
    const get = testing.fn().mockResolvedValue({data: createdFilter});
    const onFilterCreated = testing.fn();
    const onClose = testing.fn();

    const {renderHook} = rendererWith({
      gmp: {
        filter: {
          create,
          get,
        },
      },
    });

    const {result} = renderHook(() =>
      useFilterDialogSave(
        'result',
        {onClose, onFilterCreated},
        {
          filterName: '  My Filter  ',
          saveNamedFilter: true,
          filter: Filter.fromString('foo=bar'),
          filterString: 'rows=10',
          originalFilter: Filter.fromString('foo=bar'),
        },
      ),
    );

    await result.current.handleSave();

    expect(create).toHaveBeenCalledWith({
      term: 'foo=bar rows=10',
      type: 'result',
      name: '  My Filter  ',
    });
    expect(get).toHaveBeenCalledWith({id: '123'});
    expect(onFilterCreated).toHaveBeenCalledWith(createdFilter);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should reject save when creating named filter without a valid name', async () => {
    const create = testing.fn();

    const {renderHook} = rendererWith({
      gmp: {
        filter: {
          create,
          get: testing.fn(),
        },
      },
    });

    const {result} = renderHook(() =>
      useFilterDialogSave(
        'result',
        {},
        {
          filterName: '   ',
          saveNamedFilter: true,
          filter: Filter.fromString('foo=bar'),
          filterString: 'rows=10',
          originalFilter: Filter.fromString('foo=bar'),
        },
      ),
    );

    await expect(result.current.handleSave()).rejects.toThrow(
      'Please insert a name for the new filter',
    );
    expect(create).not.toHaveBeenCalled();
  });
});
