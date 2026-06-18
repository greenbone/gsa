/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import NotesCommand from 'gmp/commands/notes';
import {
  createHttp,
  createEntitiesResponse,
  createAggregatesResponse,
} from 'gmp/commands/testing';
import Note from 'gmp/models/note';

describe('NotesCommand tests', () => {
  test('should fetch notes with default params', async () => {
    const response = createEntitiesResponse('note', [
      {_id: '1', text: 'Note 1'},
      {_id: '2', text: 'Note 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_notes', details: 1},
    });
    expect(result.data).toEqual([
      new Note({id: '1', text: 'Note 1'}),
      new Note({id: '2', text: 'Note 2'}),
    ]);
  });

  test('should fetch notes with custom filter', async () => {
    const response = createEntitiesResponse('note', [
      {_id: '3', text: 'Custom Note'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const result = await cmd.get({filter: "text='Custom Note'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_notes', filter: "text='Custom Note'", details: 1},
    });
    expect(result.data).toEqual([new Note({id: '3', text: 'Custom Note'})]);
  });

  test('should fetch all notes', async () => {
    const response = createEntitiesResponse('note', [
      {_id: '1', text: 'Note 1'},
      {_id: '2', text: 'Note 2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_notes', filter: 'first=1 rows=-1', details: 1},
    });
    expect(result.data).toEqual([
      new Note({id: '1', text: 'Note 1'}),
      new Note({id: '2', text: 'Note 2'}),
    ]);
  });

  test('should fetch active days aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 1, count: 5},
        {value: 2, count: 3},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const result = await cmd.getActiveDaysAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'note',
        details: 1,
        group_column: 'active_days',
        max_groups: '250',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 1, count: 5},
        {value: 2, count: 3},
      ],
    });
  });

  test('should fetch created aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: '2024-01-01', count: 10},
        {value: '2024-01-02', count: 7},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const result = await cmd.getCreatedAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'note',
        details: 1,
        group_column: 'created',
        aggregate_mode: 'count',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: '2024-01-01', count: 10},
        {value: '2024-01-02', count: 7},
      ],
    });
  });

  test('should fetch word counts aggregates', async () => {
    const response = createAggregatesResponse({
      group: [
        {value: 'vulnerability', count: 15},
        {value: 'false positive', count: 8},
      ],
    });
    const fakeHttp = createHttp(response);

    const cmd = new NotesCommand(fakeHttp);
    const result = await cmd.getWordCountsAggregates();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_aggregate',
        aggregate_type: 'note',
        details: 1,
        group_column: 'text',
        aggregate_mode: 'word_counts',
      },
    });
    expect(result.data).toEqual({
      groups: [
        {value: 'vulnerability', count: 15},
        {value: 'false positive', count: 8},
      ],
    });
  });
});
