/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const NOTES_ACTIVE_DAYS = 'notes-active-days';
export const NOTES_CREATED = 'notes-created';
export const NOTES_WORD_COUNT = 'notes-wordcount';

export const notesActiveDaysLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.notes.getActiveDaysAggregates({filter}).then(r => r.data),
  NOTES_ACTIVE_DAYS,
);

export const NotesActiveDaysLoader = ({filter, children}) => (
  <Loader
    dataId={NOTES_ACTIVE_DAYS}
    filter={filter}
    load={notesActiveDaysLoadFunc}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);

export const notesCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.notes.getCreatedAggregates({filter}).then(r => r.data),
  NOTES_CREATED,
);

export const NotesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={NOTES_CREATED}
    filter={filter}
    load={notesCreatedLoadFunc}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);

export const notesWordCountLoader = createLoadFunc(
  ({gmp, filter}) =>
    gmp.notes.getWordCountsAggregates({filter}).then(r => r.data),
  NOTES_WORD_COUNT,
);

export const NotesWordCountLoader = ({filter, children}) => (
  <Loader
    dataId={NOTES_WORD_COUNT}
    filter={filter}
    load={notesWordCountLoader}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);
