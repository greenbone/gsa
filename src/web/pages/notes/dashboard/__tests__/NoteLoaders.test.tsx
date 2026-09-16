/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  SubscriptionContext,
  type SubscribeFunc,
} from 'web/components/provider/SubscriptionProvider';
import {
  NOTES_ACTIVE_DAYS,
  NOTES_CREATED,
  NOTES_WORD_COUNT,
  NotesActiveDaysLoader,
  NotesCreatedLoader,
  NotesWordCountLoader,
} from 'web/pages/notes/dashboard/NoteLoaders';

const createGmp = (notes: Record<string, unknown>) => ({notes});

const renderWithSubscriptionContext = ({
  gmp,
  subscribe,
  children,
}: {
  gmp: Record<string, unknown>;
  subscribe: SubscribeFunc;
  children: ReactElement;
}) => {
  const {render} = rendererWith({gmp, store: true});

  return render(
    <SubscriptionContext.Provider value={subscribe}>
      {children}
    </SubscriptionContext.Provider>,
  );
};

const expectNoteSubscriptions = (subscribe: SubscribeFunc) => {
  expect(subscribe).toHaveBeenCalledWith('notes.timer', expect.any(Function));
  expect(subscribe).toHaveBeenCalledWith('notes.changed', expect.any(Function));
};

describe('Note loaders', () => {
  test('should export the note data IDs', () => {
    expect(NOTES_ACTIVE_DAYS).toBe('notes-active-days');
    expect(NOTES_CREATED).toBe('notes-created');
    expect(NOTES_WORD_COUNT).toBe('notes-wordcount');
  });

  describe('NotesActiveDaysLoader', () => {
    test('should load active days aggregates and render them', async () => {
      const data = {groups: [{value: 1, count: 5}]};
      const getActiveDaysAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getActiveDaysAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <NotesActiveDaysLoader filter={filter}>
            {children}
          </NotesActiveDaysLoader>
        ),
      });

      await waitFor(() => {
        expect(getActiveDaysAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNoteSubscriptions(subscribe);
    });
  });

  describe('NotesCreatedLoader', () => {
    test('should load created aggregates and render them', async () => {
      const data = {
        groups: [{value: '2026-01-01', count: '5', c_count: '10'}],
      };
      const getCreatedAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getCreatedAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <NotesCreatedLoader filter={filter}>{children}</NotesCreatedLoader>
        ),
      });

      await waitFor(() => {
        expect(getCreatedAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNoteSubscriptions(subscribe);
    });
  });

  describe('NotesWordCountLoader', () => {
    test('should load word count aggregates and render them', async () => {
      const data = {groups: [{value: 'note', count: 5}]};
      const getWordCountsAggregates = testing.fn().mockResolvedValue({data});
      const gmp = createGmp({getWordCountsAggregates});
      const filter = QueryFilter.fromString('first=1 rows=10');
      const subscribe = testing.fn().mockReturnValue(testing.fn());
      const children = testing.fn().mockReturnValue(null);

      renderWithSubscriptionContext({
        gmp,
        subscribe,
        children: (
          <NotesWordCountLoader filter={filter}>
            {children}
          </NotesWordCountLoader>
        ),
      });

      await waitFor(() => {
        expect(getWordCountsAggregates).toHaveBeenCalledWith({filter});
        expect(children).toHaveBeenLastCalledWith({data, isLoading: false});
      });

      expectNoteSubscriptions(subscribe);
    });
  });
});
