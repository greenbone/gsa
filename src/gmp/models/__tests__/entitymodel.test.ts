/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import date from 'gmp/models/date';
import EntityModel, {parseEntityModelProperties} from 'gmp/models/entitymodel';
import UserTag from 'gmp/models/usertag';
import {NO_VALUE, YES_VALUE, type YesNo} from 'gmp/parser';

describe('EntityModel tests', () => {
  test('should use defaults', () => {
    const model = new EntityModel();
    expect(model._type).toBeUndefined();
    expect(model.active).toBeUndefined();
    expect(model.comment).toBeUndefined();
    expect(model.creationTime).toBeUndefined();
    expect(model.endTime).toBeUndefined();
    expect(model.entityType).toBeUndefined();
    expect(model.id).toBeUndefined();
    expect(model.inUse).toBeUndefined();
    expect(model.modificationTime).toBeUndefined();
    expect(model.name).toBeUndefined();
    expect(model.orphan).toBeUndefined();
    expect(model.owner).toBeUndefined();
    expect(model.summary).toBeUndefined();
    expect(model.timestamp).toBeUndefined();
    expect(model.trash).toBeUndefined();
    expect(model.userCapabilities.length).toEqual(0);
    expect(model.userTags).toEqual([]);
    expect(model.writable).toBeUndefined();

    expect(model.isActive()).toEqual(true);
    expect(model.isInTrash()).toEqual(false);
    expect(model.isInUse()).toEqual(false);
    expect(model.isOrphan()).toEqual(false);
    expect(model.isWritable()).toEqual(true);
  });

  test('should allow to override entityType', () => {
    // @ts-expect-error
    const model = new EntityModel({}, 'customType');
    expect(model.entityType).toEqual('customType');
  });

  test('should create an instance of EntityModel with properties', () => {
    const model = new EntityModel({
      _type: 'testType',
      active: YES_VALUE as YesNo,
      comment: 'Test comment',
      creationTime: date('2024-01-01T00:00:00Z'),
      endTime: date('2024-01-02T00:00:00Z'),
      id: '123',
      inUse: false,
      modificationTime: date('2024-01-03T00:00:00Z'),
      name: 'Test Entity',
      orphan: NO_VALUE as YesNo,
      owner: {name: 'Owner Name'},
      summary: 'Test summary',
      timestamp: date('2024-01-04T00:00:00Z'),
      trash: NO_VALUE as YesNo,
      userCapabilities: new Capabilities(['get_tasks']),
      userTags: [
        new UserTag({id: 'tag1', name: 'Tag Name', value: 'Tag Value'}),
      ],
      writable: YES_VALUE as YesNo,
    });
    expect(model._type).toEqual('testType');
    expect(model.active).toEqual(YES_VALUE);
    expect(model.comment).toEqual('Test comment');
    expect(model.creationTime).toEqual(date('2024-01-01T00:00:00.000Z'));
    expect(model.endTime).toEqual(date('2024-01-02T00:00:00.000Z'));
    expect(model.id).toEqual('123');
    expect(model.inUse).toEqual(false);
    expect(model.modificationTime).toEqual(date('2024-01-03T00:00:00.000Z'));
    expect(model.name).toEqual('Test Entity');
    expect(model.orphan).toEqual(NO_VALUE);
    expect(model.owner).toEqual({name: 'Owner Name'});
    expect(model.summary).toEqual('Test summary');
    expect(model.timestamp).toEqual(date('2024-01-04T00:00:00.000Z'));
    expect(model.trash).toEqual(NO_VALUE);
    expect(model.userCapabilities.mayAccess('task')).toEqual(true);
    expect(model.userTags.length).toEqual(1);
    expect(model.userTags[0].id).toEqual('tag1');
    expect(model.writable).toEqual(YES_VALUE);

    expect(model.isActive()).toEqual(true);
    expect(model.isInTrash()).toEqual(false);
    expect(model.isInUse()).toEqual(false);
    expect(model.isOrphan()).toEqual(false);
    expect(model.isWritable()).toEqual(true);
  });

  test('should create an instance of EntityModel from element', () => {
    const model = EntityModel.fromElement({
      _id: '456',
      type: 'testType',
      active: YES_VALUE,
      comment: 'Element comment',
      creation_time: '2024-01-05T00:00:00Z',
      end_time: '2024-01-06T00:00:00Z',
      in_use: NO_VALUE,
      modification_time: '2024-01-07T00:00:00Z',
      name: 'Element Entity',
      orphan: NO_VALUE,
      owner: {name: 'Element Owner'},
      summary: 'Element summary',
      timestamp: '2024-01-08T00:00:00Z',
      trash: NO_VALUE,
      permissions: {permission: [{name: 'get_tasks'}]},
      user_tags: {
        tag: [{_id: 'tag2', name: 'Element Tag', value: 'Tag Value'}],
      },
      writable: YES_VALUE,
    });
    expect(model.id).toEqual('456');
    expect(model._type).toEqual('testType');
    expect(model.active).toEqual(YES_VALUE);
    expect(model.comment).toEqual('Element comment');
    expect(model.creationTime).toEqual(date('2024-01-05T00:00:00.000Z'));
    expect(model.endTime).toEqual(date('2024-01-06T00:00:00.000Z'));
    expect(model.inUse).toEqual(false);
    expect(model.modificationTime).toEqual(date('2024-01-07T00:00:00.000Z'));
    expect(model.name).toEqual('Element Entity');
    expect(model.orphan).toEqual(NO_VALUE);
    expect(model.owner).toEqual({name: 'Element Owner'});
    expect(model.summary).toEqual('Element summary');
    expect(model.timestamp).toEqual(date('2024-01-08T00:00:00.000Z'));
    expect(model.trash).toEqual(NO_VALUE);
    expect(model.userCapabilities.mayAccess('task')).toEqual(true);
    expect(model.userTags.length).toEqual(1);
    expect(model.userTags[0].id).toEqual('tag2');
    expect(model.writable).toEqual(YES_VALUE);

    expect(model.isActive()).toEqual(true);
    expect(model.isInTrash()).toEqual(false);
    expect(model.isInUse()).toEqual(false);
    expect(model.isOrphan()).toEqual(false);
    expect(model.isWritable()).toEqual(true);
  });

  test('should return correct status methods', () => {
    const model = new EntityModel({
      active: YES_VALUE as YesNo,
      inUse: true,
      orphan: YES_VALUE as YesNo,
      trash: YES_VALUE as YesNo,
      writable: NO_VALUE as YesNo,
    });
    expect(model.isActive()).toEqual(true);
    expect(model.isInTrash()).toEqual(true);
    expect(model.isInUse()).toEqual(true);
    expect(model.isOrphan()).toEqual(true);
    expect(model.isWritable()).toEqual(false);
  });
});

describe('parseEntityModelFromElement tests', () => {
  test('should parse empty properties from element', () => {
    const props = parseEntityModelProperties();
    expect(props.id).toBeUndefined();
    expect(props._type).toBeUndefined();
    expect(props.active).toBeUndefined();
    expect(props.comment).toBeUndefined();
    expect(props.creationTime).toBeUndefined();
    expect(props.endTime).toBeUndefined();
    expect(props.inUse).toBeUndefined();
    expect(props.modificationTime).toBeUndefined();
    expect(props.name).toBeUndefined();
    expect(props.orphan).toBeUndefined();
    expect(props.owner).toBeUndefined();
    expect(props.summary).toBeUndefined();
    expect(props.timestamp).toBeUndefined();
    expect(props.trash).toBeUndefined();
    expect(props.userCapabilities?.length).toEqual(0);
    expect(props.userTags).toEqual([]);
    expect(props.writable).toBeUndefined();
  });

  test('should parse properties from element', () => {
    const props = parseEntityModelProperties({
      _id: '789',
      type: 'testType',
      active: YES_VALUE,
      comment: 'Parsed comment',
      creation_time: '2024-01-09T00:00:00Z',
      end_time: '2024-01-10T00:00:00Z',
      in_use: NO_VALUE,
      modification_time: '2024-01-11T00:00:00Z',
      name: 'Parsed Entity',
      orphan: NO_VALUE,
      owner: {name: 'Parsed Owner'},
      summary: 'Parsed summary',
      timestamp: '2024-01-12T00:00:00Z',
      trash: NO_VALUE,
      permissions: {permission: [{name: 'get_tasks'}]},
      user_tags: {
        tag: [{_id: 'tag3', name: 'Parsed Tag', value: 'Tag Value'}],
      },
      writable: YES_VALUE,
    });
    expect(props.id).toEqual('789');
    expect(props._type).toEqual('testType');
    expect(props.active).toEqual(YES_VALUE);
    expect(props.comment).toEqual('Parsed comment');
    expect(props.creationTime).toEqual(date('2024-01-09T00:00:00.000Z'));
    expect(props.endTime).toEqual(date('2024-01-10T00:00:00.000Z'));
    expect(props.inUse).toEqual(false);
    expect(props.modificationTime).toEqual(date('2024-01-11T00:00:00.000Z'));
    expect(props.name).toEqual('Parsed Entity');
    expect(props.orphan).toEqual(NO_VALUE);
    expect(props.owner).toEqual({name: 'Parsed Owner'});
    expect(props.summary).toEqual('Parsed summary');
    expect(props.timestamp).toEqual(date('2024-01-12T00:00:00.000Z'));
    expect(props.trash).toEqual(NO_VALUE);
    expect(props.userCapabilities?.mayAccess('task')).toEqual(true);
    expect(props.userTags?.length).toEqual(1);
    expect(props.userTags?.[0].id).toEqual('tag3');
    expect(props.writable).toEqual(YES_VALUE);
  });
});
