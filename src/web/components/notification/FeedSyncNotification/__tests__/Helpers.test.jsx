/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  useFeedSyncStatus,
  useFeedSyncDialog,
} from 'web/components/notification/FeedSyncNotification/Helpers';
import {act, rendererWith} from 'web/testing';

const mockCheckFeedSync = testing.fn();

const gmp = {
  feedstatus: {
    checkFeedSync: () => mockCheckFeedSync(),
  },
};
const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

testing.useFakeTimers();
describe('FeedSyncNotification helpers', () => {
  describe('useFeedSyncStatus Hook', () => {
    beforeEach(() => {
      testing.clearAllMocks();
      testing.useFakeTimers();
    });

    test('should dispatch setSyncStatus on successful API call', async () => {
      mockCheckFeedSync.mockResolvedValue({isSyncing: true});

      const {renderHook, store} = rendererWith({store: true, gmp});

      renderHook(() => useFeedSyncStatus());

      await act(async () => Promise.resolve());

      expect(store.getState().feedStatus.isSyncing).toBe(true);
      expect(store.getState().feedStatus.error).toBeNull();
    });
    test('should dispatch setError on API call failure', async () => {
      const errorMessage = 'Network Error';
      mockCheckFeedSync.mockRejectedValue(new Error(errorMessage));

      const {renderHook, store} = rendererWith({store: true, gmp});

      renderHook(() => useFeedSyncStatus());

      await act(async () => Promise.resolve());

      expect(store.getState().feedStatus.isSyncing).toBe(false);
      expect(store.getState().feedStatus.error).toBe(`Error: ${errorMessage}`);
    });

    test('should call API periodically', async () => {
      mockCheckFeedSync.mockResolvedValue({isSyncing: false});

      const {renderHook} = rendererWith({store: true, gmp});
      renderHook(() => useFeedSyncStatus());

      testing.advanceTimersByTime(FIVE_MINUTES);

      expect(mockCheckFeedSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('useFeedSyncDialog Hook', () => {
    beforeEach(() => {
      testing.clearAllMocks();
      testing.useFakeTimers();
    });

    test('should open dialog when feedStatus.isSyncing is true', () => {
      const {renderHook, store} = rendererWith({store: true, gmp});
      store.dispatch({type: 'SET_SYNC_STATUS', payload: {isSyncing: true}});
      const {result} = renderHook(() => useFeedSyncDialog());

      expect(result.current[0]).toBe(true);
    });

    test('should open dialog when feedStatus.error is not null', () => {
      const {renderHook, store} = rendererWith({store: true, gmp});
      store.dispatch({type: 'SET_SYNC_STATUS', payload: {error: 'Error'}});
      const {result} = renderHook(() => useFeedSyncDialog());

      expect(result.current[0]).toBe(true);
    });

    test('should close dialog after THIRTY_SECONDS', () => {
      const {renderHook, store} = rendererWith({store: true, gmp});
      store.dispatch({type: 'SET_SYNC_STATUS', payload: {isSyncing: true}});
      const {result} = renderHook(() => useFeedSyncDialog());

      expect(result.current[0]).toBe(true);

      act(() => {
        testing.advanceTimersByTime(THIRTY_SECONDS);
      });

      expect(result.current[0]).toBe(false);
    });
  });
});
