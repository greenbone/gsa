/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import EntityCommand from 'gmp/commands/entity';
import {createEntityResponse, createHttp} from 'gmp/commands/testing';
import Filter from 'gmp/models/filter';

class TestEntityCommand extends EntityCommand {
  getModelFromResponse(response) {
    return response.data;
  }
}

describe('EntityCommand tests', () => {
  test('should add filter parameter', () => {
    const filter = Filter.fromString('foo=bar');
    const response = createEntityResponse('foo', {});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TestEntityCommand(fakeHttp, 'foo');
    return cmd.get({id: 'foo'}, {filter}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_foo',
          foo_id: 'foo',
          filter: 'foo=bar',
        },
      });
    });
  });

  test('should add filter_id parameter', () => {
    const filter = Filter.fromElement({_id: 'bar'});
    const response = createEntityResponse('foo', {});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TestEntityCommand(fakeHttp, 'foo');
    return cmd.get({id: 'foo'}, {filter}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_foo',
          foo_id: 'foo',
          filter_id: 'bar',
        },
      });
    });
  });

  test('should prefer filter_id over filter parameter', () => {
    const filter = Filter.fromElement({
      _id: 'bar',
      keywords: {
        keyword: {relation: '=', value: 'bar', column: 'foo'},
      },
    });
    const response = createEntityResponse('foo', {});
    const fakeHttp = createHttp(response);

    expect(filter.toFilterString()).toEqual('foo=bar');

    expect.hasAssertions();

    const cmd = new TestEntityCommand(fakeHttp, 'foo');
    return cmd.get({id: 'foo'}, {filter}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_foo',
          foo_id: 'foo',
          filter_id: 'bar',
        },
      });
    });
  });
});
