/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {generateFilename, renderSelectItems} from '../render';

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

// vim: set ts=2 sw=2 tw=80:
