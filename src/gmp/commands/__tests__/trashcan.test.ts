/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createResponse, createHttp} from 'gmp/commands/testing';
import TrashCanCommand from 'gmp/commands/trashcan';

describe('TrashCanCommand tests', () => {
  test('should allow to restore an entity', async () => {
    const response = createResponse({});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TrashCanCommand(fakeHttp);
    await cmd.restore({id: '1234'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'restore',
        target_id: '1234',
      },
    });
  });

  test('should allow to empty the trashcan', async () => {
    const response = createResponse({});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TrashCanCommand(fakeHttp);
    await cmd.empty();
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'empty_trashcan'},
    });
  });

  test('should allow to delete an entity from the trashcan', async () => {
    const response = createResponse({});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TrashCanCommand(fakeHttp);
    await cmd.delete({id: '1234', entityType: 'host'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'delete_from_trash',
        host_id: '1234',
        resource_type: 'host',
      },
    });
  });

  test('should allow to get the trashcan contents', async () => {
    const response = createResponse({
      get_trash: {
        get_alerts_response: {
          alert: [{_id: 'alert1'}, {_id: 'alert2'}],
        },
        get_configs_response: {
          config: [
            {_id: 'config1', usage_type: 'scan'},
            {_id: 'policy1', usage_type: 'audit'},
          ],
        },
        get_credentials_response: {
          credential: [{_id: 'cred1'}, {_id: 'cred2'}],
        },
        get_filters_response: {
          filter: [{_id: 'filter1'}, {_id: 'filter2'}],
        },
        get_groups_response: {
          group: [{_id: 'group1'}, {_id: 'group2'}],
        },
        get_notes_response: {
          note: [{_id: 'note1'}, {_id: 'note2'}],
        },
        get_overrides_response: {
          override: [{_id: 'override1'}, {_id: 'override2'}],
        },
        get_permissions_response: {
          permission: [{_id: 'perm1'}, {_id: 'perm2'}],
        },
        get_port_lists_response: {
          port_list: {_id: 'portlist1'},
        },
        get_report_configs_response: {
          report_config: {_id: 'reportconfig1'},
        },
        get_report_formats_response: {
          report_format: [{_id: 'reportformat1'}, {_id: 'reportformat2'}],
        },
        get_roles_response: {
          role: [{_id: 'role1'}, {_id: 'role2'}],
        },
        get_scanners_response: {
          scanner: {_id: 'scanner1'},
        },
        get_schedules_response: {
          schedule: {_id: 'schedule1'},
        },
        get_tags_response: {
          tag: [{_id: 'tag1'}, {_id: 'tag2'}],
        },
        get_targets_response: {
          target: [{_id: 'target1'}, {_id: 'target2'}],
        },
        get_tasks_response: {
          task: [
            {_id: 'task1', usage_type: 'scan'},
            {_id: 'audit1', usage_type: 'audit'},
          ],
        },
        get_tickets_response: {
          ticket: [{_id: 'ticket1'}, {_id: 'ticket2'}],
        },
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new TrashCanCommand(fakeHttp);
    const data = await cmd.get();
    expect(data.data.alerts.length).toBe(2);
    expect(data.data.audits.length).toBe(1);
    expect(data.data.credentials.length).toBe(2);
    expect(data.data.filters.length).toBe(2);
    expect(data.data.groups.length).toBe(2);
    expect(data.data.notes.length).toBe(2);
    expect(data.data.overrides.length).toBe(2);
    expect(data.data.permissions.length).toBe(2);
    expect(data.data.portLists.length).toBe(1);
    expect(data.data.policies.length).toBe(1);
    expect(data.data.reportConfigs.length).toBe(1);
    expect(data.data.reportFormats.length).toBe(2);
    expect(data.data.roles.length).toBe(2);
    expect(data.data.scanConfigs.length).toBe(1);
    expect(data.data.scanners.length).toBe(1);
    expect(data.data.schedules.length).toBe(1);
    expect(data.data.tags.length).toBe(2);
    expect(data.data.targets.length).toBe(2);
    expect(data.data.tasks.length).toBe(1);
    expect(data.data.tickets.length).toBe(2);
  });
});
