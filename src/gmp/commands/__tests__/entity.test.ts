/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import EntityCommand from 'gmp/commands/entity';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
  createResponse,
} from 'gmp/commands/testing';
import GmpHttp from 'gmp/http/gmp';
import Response from 'gmp/http/response';
import {XmlResponseData} from 'gmp/http/transform/fastxml';
import {
  EntityModelElement,
  EntityModelProperties,
} from 'gmp/models/entitymodel';
import Filter from 'gmp/models/filter';
import Model from 'gmp/models/model';

type FooElement = EntityModelElement;
type FooProperties = EntityModelProperties;

class Foo extends Model {
  static fromElement(element: FooElement): Foo {
    return new Foo(element as FooProperties);
  }
}

class TestEntityCommand extends EntityCommand<Foo, FooElement> {
  constructor(http: GmpHttp) {
    super(http, 'foo', Foo);
  }
  getElementFromRoot(root: XmlResponseData): FooElement {
    // @ts-expect-error
    return root.get_foo.get_foos_response.foo;
  }
}

describe('EntityCommand tests', () => {
  test('should get entity with filter string parameter', async () => {
    const filterString = 'foo=bar';
    const response = createEntityResponse('foo', {id: '123'});
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.get({id: '123'}, {filter: filterString});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foo',
        foo_id: '123',
        filter: 'foo=bar',
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toBeInstanceOf(Foo);
    expect(cmdResponse.data.id).toEqual('123');
  });

  test('should get entity with filter parameter', async () => {
    const filterString = Filter.fromString('foo=bar');
    const response = createEntityResponse('foo', {id: '123'});
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.get({id: '123'}, {filter: filterString});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foo',
        foo_id: '123',
        filter: 'foo=bar',
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toBeInstanceOf(Foo);
    expect(cmdResponse.data.id).toEqual('123');
  });

  test('should get entity with filter_id parameter', async () => {
    const filter = new Filter({id: 'bar'});
    const response = createEntityResponse('foo', {id: '123'});
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.get({id: '123'}, {filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foo',
        foo_id: '123',
        filter_id: 'bar',
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toBeInstanceOf(Foo);
    expect(cmdResponse.data.id).toEqual('123');
  });

  test('should get entity and prefer filter_id over filter parameter', async () => {
    const filter = Filter.fromElement({
      _id: 'bar',
      keywords: {
        keyword: {relation: '=', value: 'bar', column: 'foo'},
      },
    });
    const response = createEntityResponse('foo', {id: '123'});
    const fakeHttp = createHttp(response);

    expect(filter.toFilterString()).toEqual('foo=bar');

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.get({id: '123'}, {filter});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_foo',
        foo_id: '123',
        filter_id: 'bar',
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toBeInstanceOf(Foo);
    expect(cmdResponse.data.id).toEqual('123');
  });

  test('should clone an entity', async () => {
    const response = createActionResultResponse({
      action: 'Clone Foo',
      id: '456',
      message: 'Cloned Foo with id 123',
    });
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.clone({id: '123'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'clone',
        id: '123',
        resource_type: 'foo',
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toEqual({id: '456'});
  });

  test('should delete an entity', async () => {
    const fakeHttp = createHttp();

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.delete({id: '123'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_foo',
        foo_id: '123',
      },
    });
    expect(cmdResponse).toBeUndefined();
  });

  test('should export an entity', async () => {
    const content = '<some><xml>exported-data</xml></some>';
    const response = createResponse(content);
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.export({id: '123'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'foo',
        bulk_select: 1,
        'bulk_selected:123': 1,
      },
      transform: {
        rejection: expect.any(Function),
        success: expect.any(Function),
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toEqual(content);
  });
});
