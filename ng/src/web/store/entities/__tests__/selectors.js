/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import EntitiesSelector from '../selectors';
import Filter from 'gmp/models/filter';

describe('EntitiesSelector getIsLoading tests', () => {

  test('isLoading for undefined state', () => {
    const selector = new EntitiesSelector();
    expect(selector.getIsLoading()).toEqual(false);
  });

  test('isLoading for undefined state with filter', () => {
    const selector = new EntitiesSelector();
    const filter = Filter.fromString('name=foo');

    expect(selector.getIsLoading(filter)).toEqual(false);
  });

  test('isLoading for empty state', () => {
    const selector = new EntitiesSelector({});
    expect(selector.getIsLoading()).toEqual(false);
  });

  test('isLoading for empty state with filter', () => {
    const selector = new EntitiesSelector({});
    const filter = Filter.fromString('name=foo');

    expect(selector.getIsLoading(filter)).toEqual(false);
  });

  test('isLoading should be true with default filter', () => {
    const selector = new EntitiesSelector({
      default: {
        isLoading: true,
      },
      'name=foo': {
        isLoading: false,
      },
    });

    expect(selector.getIsLoading()).toEqual(true);
  });

  test('isLoading should be true with filter', () => {
    const selector = new EntitiesSelector({
      default: {
        isLoading: false,
      },
      'name=foo': {
        isLoading: true,
      },
    });
    const filter = Filter.fromString('name=foo');

    expect(selector.getIsLoading(filter)).toEqual(true);
  });

  test('isLoading should be false for unkown filter', () => {
    const selector = new EntitiesSelector({
      default: {
        isLoading: true,
      },
      'name=foo': {
        isLoading: true,
      },
    });
    const filter = Filter.fromString('name=bar');

    expect(selector.getIsLoading(filter)).toEqual(false);
  });

  test('isLoading should be undefined for undefined isLoading', () => {
    const selector = new EntitiesSelector({
      default: {
      },
      'name=foo': {
        isLoading: false,
      },
    });

    expect(selector.getIsLoading()).toBeUndefined();
  });

});

describe('EntitiesSelector getEntities tests', () => {

  test('getEntities for undefined state', () => {
    const selector = new EntitiesSelector();
    expect(selector.getEntities()).toBeUndefined();
  });

  test('getEntities for undefined state with filter', () => {
    const selector = new EntitiesSelector();
    const filter = Filter.fromString('name=foo');

    expect(selector.getEntities(filter)).toBeUndefined();
  });

  test('getEntities for empty state', () => {
    const selector = new EntitiesSelector({});
    expect(selector.getEntities()).toBeUndefined();
  });

  test('getEntities for empty state with filter', () => {
    const selector = new EntitiesSelector({});
    const filter = Filter.fromString('name=foo');

    expect(selector.getEntities(filter)).toBeUndefined();
  });

  test('getEntities should return entities with default filter', () => {
    const selector = new EntitiesSelector({
      default: {
        entities: ['foo', 'bar'],
      },
      'name=foo': {
        entities: ['lorem', 'ipsum'],
      },
    });

    expect(selector.getEntities()).toEqual(['foo', 'bar']);
  });

  test('getEntities should return entities with filter', () => {
    const selector = new EntitiesSelector({
      default: {
        entities: ['foo', 'bar'],
      },
      'name=foo': {
        entities: ['lorem', 'ipsum'],
      },
    });
    const filter = Filter.fromString('name=foo');

    expect(selector.getEntities(filter)).toEqual(['lorem', 'ipsum']);
  });

  test('getEntities should return undefined for undefined entities', () => {
    const selector = new EntitiesSelector({
      default: {
      },
    });

    expect(selector.getEntities()).toBeUndefined();
  });

  test('getEntities should return undefined for unkown filter', () => {
    const selector = new EntitiesSelector({
      default: {
        entities: ['foo', 'bar'],
      },
      'name=foo': {
        entities: ['lorem', 'ipsum'],
      },
    });
    const filter = Filter.fromString('name=bar');

    expect(selector.getEntities(filter)).toBeUndefined();
  });

});

describe('EntitiesSelector getError tests', () => {

  test('getError for undefined state', () => {
    const selector = new EntitiesSelector();
    expect(selector.getError()).toBeUndefined();
  });

  test('getError for undefined state with filter', () => {
    const selector = new EntitiesSelector();
    const filter = Filter.fromString('name=foo');

    expect(selector.getError(filter)).toBeUndefined();
  });

  test('getError for empty state', () => {
    const selector = new EntitiesSelector({});
    expect(selector.getError()).toBeUndefined();
  });

  test('getError for empty state with filter', () => {
    const selector = new EntitiesSelector({});
    const filter = Filter.fromString('name=foo');

    expect(selector.getError(filter)).toBeUndefined();
  });

  test('getError should return error with default filter', () => {
    const selector = new EntitiesSelector({
      default: {
        error: 'An error',
      },
      'name=foo': {
        error: 'Another error',
      },
    });

    expect(selector.getError()).toEqual('An error');
  });

  test('getError should return error with filter', () => {
    const selector = new EntitiesSelector({
      default: {
        error: 'An error',
      },
      'name=foo': {
        error: 'Another error',
      },
    });
    const filter = Filter.fromString('name=foo');

    expect(selector.getError(filter)).toEqual('Another error');
  });

  test('getEeror should return undefined for undefined error', () => {
    const selector = new EntitiesSelector({
      default: {
      },
    });

    expect(selector.getError()).toBeUndefined();
  });

  test('getError should return undefined for unkown filter', () => {
    const selector = new EntitiesSelector({
      default: {
        error: 'An error',
      },
      'name=foo': {
        error: 'Another error',
      },
    });
    const filter = Filter.fromString('name=bar');

    expect(selector.getError(filter)).toBeUndefined();
  });

});

// vim: set ts=2 sw=2 tw=80:
