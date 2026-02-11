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
  createPlainResponse,
  createResponse,
} from 'gmp/commands/testing';
import type Http from 'gmp/http/http';
import Response from 'gmp/http/response';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import {
  type EntityModelElement,
  type EntityModelProperties,
} from 'gmp/models/entity-model';
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
  constructor(http: Http) {
    super(http, 'foo', Foo);
  }
  getElementFromRoot(root: XmlResponseData): FooElement {
    // @ts-expect-error
    return root.get_foo.get_foos_response.foo;
  }
}

class TestEntityWithAssetTypeCommand extends EntityCommand<Foo> {
  constructor(http: Http) {
    super(http, 'foo', Foo);
    this.setDefaultParam('asset_type', 'test_asset');
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
    const filter = Filter.fromString('foo=bar');
    const response = createEntityResponse('foo', {id: '123'});
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityCommand(fakeHttp);
    const cmdResponse = await cmd.get({id: '123'}, {filter: filter});
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
    const response = createResponse();
    const fakeHttp = createHttp(response);

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
    const response = createPlainResponse(content);
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
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toEqual(content);
  });

  test('should include asset_type when defined via setDefaultParam in export of entity', async () => {
    const content = '<some><xml>exported-data</xml></some>';
    const response = createPlainResponse(content);
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityWithAssetTypeCommand(fakeHttp);
    const cmdResponse = await cmd.export({id: '123'});

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'bulk_export',
        resource_type: 'foo',
        asset_type: 'test_asset',
        bulk_select: 1,
        'bulk_selected:123': 1,
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toEqual(content);
  });

  test('should create an entity action request', async () => {
    const response = createActionResultResponse({
      action: 'create_foo',
      id: '123',
      message: 'Foo created successfully',
    });
    const fakeHttp = createHttp(response);

    const cmd = new TestEntityCommand(fakeHttp);
    // @ts-expect-error
    const cmdResponse = await cmd.entityAction(
      {cmd: 'create_foo', resource_type: 'foo'},
      {extraParams: {name: 'Test Foo'}},
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_foo',
        resource_type: 'foo',
        name: 'Test Foo',
      },
    });
    expect(cmdResponse).toBeInstanceOf(Response);
    expect(cmdResponse.data).toEqual({
      id: '123',
    });
  });
});
