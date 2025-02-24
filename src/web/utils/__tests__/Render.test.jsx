/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {generateFilename, renderSelectItems} from 'web/utils/Render';

describe('render_select_items test', () => {
  test('should convert entities list', () => {
    const entities = [
      {
        name: 'A Task',
        id: '1',
      },
      {
        name: 'B Task',
        id: '2',
      },
    ];

    const items = renderSelectItems(entities);

    expect(items.length).toBe(2);
    expect(items[0]).toEqual({label: 'A Task', value: '1'});
    expect(items[1]).toEqual({label: 'B Task', value: '2'});
  });

  test('should add default item', () => {
    const entities = [
      {
        name: 'A Task',
        id: '1',
      },
      {
        name: 'B Task',
        id: '2',
      },
    ];

    const items = renderSelectItems(entities, '3');

    expect(items.length).toBe(3);
    expect(items[0]).toEqual({label: '--', value: '3'});
    expect(items[1]).toEqual({label: 'A Task', value: '1'});
    expect(items[2]).toEqual({label: 'B Task', value: '2'});
  });

  test('should add default item with label', () => {
    const entities = [
      {
        name: 'A Task',
        id: '1',
      },
      {
        name: 'B Task',
        id: '2',
      },
    ];

    const items = renderSelectItems(entities, '3', '?');

    expect(items.length).toBe(3);
    expect(items[0]).toEqual({label: '?', value: '3'});
    expect(items[1]).toEqual({label: 'A Task', value: '1'});
    expect(items[2]).toEqual({label: 'B Task', value: '2'});
  });

  test.each([
    {name: 'Item 1', id: 1, deprecated: '1'},
    {name: 'Item 2', id: 2},
    {name: 123, id: 3, deprecated: '1'},
    {name: true, id: 4},
    {name: null, id: 5},
    {name: undefined, id: 6},
  ])('should return labels as strings for item with id %s', item => {
    const default_item_value = 0;
    const default_item_label = 'Default Item';

    const result = renderSelectItems(
      [item],
      default_item_value,
      default_item_label,
    );

    expect(typeof result[1].label).toBe('string');
  });
});

describe('generateFilename tests', () => {
  test('should generate filename for details export filename', () => {
    const data = {
      creationTime: new Date('2019-10-10T12:00:00'),
      fileNameFormat: 'foo_%C-%c-%F-%M-%m-%N-%%-%T-%U-%u_42',
      id: '123',
      modificationTime: new Date('2019-10-10T13:00:00'),
      resourceName: 'lorem',
      resourceType: 'type',
      username: 'ObiWLAN',
    };

    const filename = generateFilename(data);
    expect(filename).toEqual(
      'foo_20191010-121000-XML-20191010-131000-lorem-%-type-123-ObiWLAN_42.xml',
    );
  });

  test('should generate filename for list export filename', () => {
    const data = {
      fileNameFormat: 'foo_%F-%N-%%-%T-%U-%u_42',
      resourceType: 'types',
      username: 'ObiWLAN',
    };

    const filename = generateFilename(data);
    expect(filename).toEqual('foo_XML-types-%-types-list-ObiWLAN_42.xml');
  });

  test('should generate filename for report export filename', () => {
    const data = {
      fileNameFormat: 'foo_%F-%N-%%-%T-%U-%u_42',
      id: '123',
      reportFormat: 'pdf',
      resourceName: 'name',
      resourceType: 'report',
      username: 'ObiWLAN',
    };

    const filename = generateFilename(data);
    expect(filename).toEqual('foo_pdf-name-%-report-123-ObiWLAN_42.xml');
  });

  test('if no resource name, should fall back to resource type', () => {
    const data = {
      fileNameFormat: '%N',
      resourceType: 'type',
    };
    const filename = generateFilename(data);
    expect(filename).toEqual('type.xml');
  });

  test('if no modification time, should fall back to creation time', () => {
    const data = {
      fileNameFormat: '%M',
      creationTime: new Date('2019-10-10T12:00:00Z'),
    };
    const filename = generateFilename(data);
    expect(filename).toEqual('20191010.xml');
  });

  test('if no creation time, should fall back to (current) time', () => {
    const data = {
      fileNameFormat: '%C',
    };
    const filename = generateFilename(data);
    expect(filename.length).toBe(12);
  });

  test('should apply extension', () => {
    const data = {
      extension: 'ext',
      fileNameFormat: 'foo_%T',
      resourceType: 'type',
    };

    const filename = generateFilename(data);
    expect(filename).toEqual('foo_type.ext');
  });

  test('should return fall back filename, if no filename was generated', () => {
    const filename = generateFilename({});
    expect(filename).toEqual('unnamed.unknown');
  });
});
