/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import NotesCommand from 'gmp/commands/note';
import {
  createHttp,
  createEntityResponse,
  createActionResultResponse,
} from 'gmp/commands/testing';
import {
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  ANY,
  MANUAL,
} from 'gmp/models/override';

describe('NotesCommand tests', () => {
  test('should request single note', async () => {
    const response = createEntityResponse('note', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_note',
        note_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create a simple note', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const resp = await cmd.create({
      text: 'note text',
      oid: 'oid',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_note',
        oid: 'oid',
        text: 'note text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should create a note with details', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const resp = await cmd.create({
      active: ACTIVE_YES_FOR_NEXT_VALUE,
      days: 15,
      hostsManual: 'host1,host2',
      hosts: MANUAL,
      oid: 'oid',
      port: MANUAL,
      portManual: '22/tcp',
      resultId: MANUAL,
      resultUuid: 'result-uuid',
      severity: 'High',
      taskId: MANUAL,
      taskUuid: 'task-uuid',
      text: 'note text',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        active: '1',
        cmd: 'create_note',
        hosts: 'host1,host2',
        oid: 'oid',
        port: '22/tcp',
        result_id: 'result-uuid',
        severity: 'High',
        task_id: 'task-uuid',
        text: 'note text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save a simple note', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'foo',
      text: 'updated note text',
      oid: 'oid',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_note',
        oid: 'oid',
        note_id: 'foo',
        text: 'updated note text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to save a note with details', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'foo',
      active: ACTIVE_YES_UNTIL_VALUE,
      days: 15,
      hostsManual: 'host1,host2',
      hosts: MANUAL,
      oid: 'oid',
      port: MANUAL,
      portManual: '22/tcp',
      resultId: ANY,
      resultUuid: 'result-uuid',
      severity: 'High',
      taskId: ANY,
      taskUuid: 'task-uuid',
      text: 'updated note text',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        active: 15,
        cmd: 'save_note',
        hosts: 'host1,host2',
        note_id: 'foo',
        oid: 'oid',
        port: '22/tcp',
        severity: 'High',
        text: 'updated note text',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });
});
