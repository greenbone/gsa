/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import date from 'gmp/models/date';
import {
  generateFilename,
  permissionDescription,
  renderSelectItems,
  renderYesNo,
  type Resource,
  simplePermissionDescription,
  simplePermissionDescriptionWithSubject,
} from 'web/utils/Render';

describe('renderSelectItems test', () => {
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

    expect(items.length).toEqual(2);
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

    expect(items.length).toEqual(3);
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

    expect(items.length).toEqual(3);
    expect(items[0]).toEqual({label: '?', value: '3'});
    expect(items[1]).toEqual({label: 'A Task', value: '1'});
    expect(items[2]).toEqual({label: 'B Task', value: '2'});
  });

  test.each([
    {name: 'Item 1', id: '1', deprecated: '1'},
    {name: 'Item 2', id: '2'},
    {name: 123, id: '3', deprecated: '1'},
    {name: true, id: '4'},
    {name: null, id: '5'},
    {name: undefined, id: '6'},
  ])('should return labels as strings for item with id %s', item => {
    const default_item_value = '0';
    const default_item_label = 'Default Item';

    const result = renderSelectItems(
      // @ts-expect-error
      [item],
      default_item_value,
      default_item_label,
    );

    expect(typeof result[1].label).toEqual('string');
  });
});

describe('generateFilename tests', () => {
  test('should generate filename for details export filename', () => {
    const data = {
      creationTime: date('2019-10-10T12:00:00'),
      fileNameFormat: 'foo_%C-%c-%F-%M-%m-%N-%%-%T-%U-%u_42',
      id: '123',
      modificationTime: date('2019-10-10T13:00:00'),
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
      creationTime: date('2019-10-10T12:00:00Z'),
    };
    const filename = generateFilename(data);
    expect(filename).toEqual('20191010.xml');
  });

  test('if no creation time, should fall back to (current) time', () => {
    const data = {
      fileNameFormat: '%C',
    };
    const filename = generateFilename(data);
    expect(filename.length).toEqual(12);
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

  describe('permissionDescription tests', () => {
    test('should return description for resource without subject', () => {
      const resource = {name: 'Task 1', entityType: 'task'} as Resource;

      expect(permissionDescription('super', resource)).toEqual(
        'Has super access to all resources of task Task 1',
      );

      expect(permissionDescription('create_task', resource)).toEqual(
        'May create a new task',
      );

      expect(permissionDescription('delete_task', resource)).toEqual(
        'May delete task Task 1',
      );

      expect(permissionDescription('get_task', resource)).toEqual(
        'Has read access to task Task 1',
      );

      expect(permissionDescription('modify_task', resource)).toEqual(
        'Has write access to task Task 1',
      );
    });

    test('should return description for resource with subject', () => {
      const resource1 = {name: 'Task 1', entityType: 'task'} as Resource;
      const resource2 = {
        name: 'Installer 1',
        entityType: 'agentinstaller',
      } as Resource;
      const subject = {name: 'User 1', entityType: 'user'} as Resource;

      expect(permissionDescription('super', resource1, subject)).toEqual(
        'User User 1 has super access to all resources of Task Task 1',
      );

      expect(permissionDescription('create_task', resource1, subject)).toEqual(
        'User User 1 may create a new Task',
      );

      expect(permissionDescription('delete_task', resource1, subject)).toEqual(
        'User User 1 may delete Task Task 1',
      );

      expect(permissionDescription('get_task', resource1, subject)).toEqual(
        'User User 1 has read access to Task Task 1',
      );

      expect(permissionDescription('modify_task', resource1, subject)).toEqual(
        'User User 1 has write access to Task Task 1',
      );

      expect(
        permissionDescription('get_agent_installers', resource2, subject),
      ).toEqual('User User 1 has read access to Agent Installer Installer 1');
    });

    test('should return simple permission description if resource is undefined', () => {
      expect(permissionDescription('super')).toEqual('Has super access');
      expect(permissionDescription('authenticate')).toEqual('May login');
      expect(permissionDescription('unknown_command')).toEqual(
        'unknown_command',
      );
    });

    test('should return simple permission description with subject if resource is undefined', () => {
      const subject = {name: 'User 1', entityType: 'user'} as Resource;

      expect(permissionDescription('super', undefined, subject)).toEqual(
        'User User 1 has super access',
      );

      expect(permissionDescription('authenticate', undefined, subject)).toEqual(
        'User User 1 may login',
      );

      expect(
        permissionDescription('unknown_command', undefined, subject),
      ).toEqual('unknown_command');
    });

    test('should handle unknown commands gracefully', () => {
      const resource = {name: 'Task 1', entityType: 'task'} as Resource;
      const subject = {name: 'User 1', entityType: 'user'} as Resource;

      expect(permissionDescription('unknown_command', resource)).toEqual(
        'unknown_command',
      );

      expect(
        permissionDescription('unknown_command', resource, subject),
      ).toEqual('unknown_command');
    });
  });

  describe('simplePermissionDescription tests', () => {
    test.each([
      {name: 'super', expected: 'Has super access'},
      {name: 'authenticate', expected: 'May login'},
      {name: 'commands', expected: 'May run multiple GMP commands in one'},
      {name: 'everything', expected: 'Has permission to run all commands'},
      {name: 'empty_trashcan', expected: 'May empty the trashcan'},
      {name: 'get_dependencies', expected: 'May get the dependencies of NVTs'},
      {name: 'get_version', expected: 'May get version information'},
      {name: 'help', expected: 'May get the help text'},
      {
        name: 'modify_auth',
        expected: 'Has write access to the authentication configuration',
      },
      {name: 'restore', expected: 'May restore items from the trashcan'},
      {name: 'create_task', expected: 'May create a new Task'},
      {name: 'delete_task', expected: 'May delete an existing Task'},
      {name: 'get_tasks', expected: 'Has read access to Tasks'},
      {name: 'modify_task', expected: 'Has write access to Task'},
      {name: 'sync_feed', expected: 'May sync the NVT feed'},
      {name: 'sync_cert', expected: 'May sync the CERT feed'},
      {name: 'sync_scap', expected: 'May sync the SCAP feed'},
      {name: 'move_task', expected: 'May move Task'},
      {name: 'verify_task', expected: 'May verify Task'},
      {name: 'unknown_command', expected: 'unknown_command'}, // Default fallback
    ])('should return $expected for $name', ({name, expected}) => {
      expect(simplePermissionDescription(name)).toEqual(expected);
    });
  });

  describe('simplePermissionDescriptionWithSubject tests', () => {
    test.each([
      {
        name: 'super',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo has super access',
      },
      {
        name: 'authenticate',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo may login',
      },
      {
        name: 'commands',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo may run multiple GMP commands in one',
      },
      {
        name: 'everything',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo has all permissions',
      },
      {
        name: 'empty_trashcan',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo may empty the trashcan',
      },
      {
        name: 'get_dependencies',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo may get the dependencies of NVTs',
      },
      {
        name: 'get_version',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo may get version information',
      },
      {
        name: 'help',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected: 'User foo may get the help text',
      },
      {
        name: 'modify_auth',
        subject: {name: 'foo', entityType: 'user'} as Resource,
        expected:
          'User foo has write access to the authentication configuration',
      },
      {
        name: 'create_task',
        subject: {name: 'foo', entityType: 'role'} as Resource,
        expected: 'Role foo may create a new Task',
      },
      {
        name: 'delete_task',
        subject: {name: 'foo', entityType: 'role'} as Resource,
        expected: 'Role foo may delete an existing Task',
      },
      {
        name: 'get_tasks',
        subject: {name: 'foo', entityType: 'role'} as Resource,
        expected: 'Role foo has read access to Tasks',
      },
      {
        name: 'modify_task',
        subject: {name: 'foo', entityType: 'role'} as Resource,
        expected: 'Role foo has write access to Task',
      },
      {
        name: 'unknown_command',
        subject: {name: 'foo', entityType: 'role'} as Resource,
        expected: 'unknown_command',
      },
    ])(
      'should return $expected for $name with subject $subject.name',
      ({name, subject, expected}) => {
        expect(simplePermissionDescriptionWithSubject(name, subject)).toEqual(
          expected,
        );
      },
    );
  });
});

describe('renderYesNo tests', () => {
  test.each([
    {value: true, expected: 'Yes'},
    {value: 1, expected: 'Yes'},
    {value: '1', expected: 'Yes'},
    {value: 'Yes', expected: 'Yes'},
    {value: 'yes', expected: 'Yes'},
    {value: false, expected: 'No'},
    {value: 0, expected: 'No'},
    {value: '0', expected: 'No'},
    {value: 'No', expected: 'No'},
    {value: 'no', expected: 'No'},
    {value: undefined, expected: 'Unknown'},
    {value: null, expected: 'Unknown'},
    {value: '', expected: 'Unknown'},
    {value: 'foo', expected: 'Unknown'},
  ])('should return $expected for for $value', ({value, expected}) => {
    expect(renderYesNo(value)).toEqual(expected);
  });
});
