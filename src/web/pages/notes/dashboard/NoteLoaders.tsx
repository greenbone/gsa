/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CreatedData} from 'web/components/dashboard/display/created/created-transform';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';

interface WordCloudGroup {
  count: number;
  value: string;
}

export interface WordCloudData {
  groups?: WordCloudGroup[];
}

interface NotesActiveDaysGroup {
  value: number;
  count: number;
  bulked?: boolean;
}

export interface NotesActiveDaysData {
  groups?: NotesActiveDaysGroup[];
}

export const NOTES_ACTIVE_DAYS = 'notes-active-days';
export const NOTES_CREATED = 'notes-created';
export const NOTES_WORD_COUNT = 'notes-wordcount';

const notesActiveDaysLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.notes.getActiveDaysAggregates({filter}).then(r => r.data),
  NOTES_ACTIVE_DAYS,
);

export const NotesActiveDaysLoader = ({
  filter,
  children,
}: DisplayLoaderProps<NotesActiveDaysData>) => (
  <Loader
    dataId={NOTES_ACTIVE_DAYS}
    filter={filter}
    load={notesActiveDaysLoadFunc}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);

const notesCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.notes.getCreatedAggregates({filter}).then(r => r.data),
  NOTES_CREATED,
);

export const NotesCreatedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CreatedData>) => (
  <Loader
    dataId={NOTES_CREATED}
    filter={filter}
    load={notesCreatedLoadFunc}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);

const notesWordCountLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.notes.getWordCountsAggregates({filter}).then(r => r.data),
  NOTES_WORD_COUNT,
);

export const NotesWordCountLoader = ({
  filter,
  children,
}: DisplayLoaderProps<WordCloudData>) => (
  <Loader
    dataId={NOTES_WORD_COUNT}
    filter={filter}
    load={notesWordCountLoadFunc}
    subscriptions={['notes.timer', 'notes.changed']}
  >
    {children}
  </Loader>
);
