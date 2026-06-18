/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import Note from 'gmp/models/note';

interface NoteAggregateParams {
  filter?: Filter | string;
}

class NotesCommand extends EntitiesCommand<Note> {
  constructor(http: Http) {
    super(http, 'note', Note);
    this.setDefaultParam('details', 1);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_notes.get_notes_response;
  }

  getActiveDaysAggregates({filter}: NoteAggregateParams = {}) {
    return this.getAggregates({
      aggregate_type: 'note',
      group_column: 'active_days',
      filter,
      maxGroups: 250,
    });
  }

  getCreatedAggregates({filter}: NoteAggregateParams = {}) {
    return this.getAggregates({
      aggregate_type: 'note',
      group_column: 'created',
      aggregate_mode: 'count',
      filter,
    });
  }

  getWordCountsAggregates({filter}: NoteAggregateParams = {}) {
    return this.getAggregates({
      aggregate_type: 'note',
      group_column: 'text',
      aggregate_mode: 'word_counts',
      filter,
    });
  }
}

export default NotesCommand;
