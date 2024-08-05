/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {setSyncStatus, setError} from 'web/store/feedStatus/actions';
import useGmp from 'web/hooks/useGmp';

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

/**
 * Custom hook to check the feed sync status updating the store with the response
 * at regular intervals defined by `FIVE_MINUTES`.
 * @returns {void}
 */

export const useFeedSyncStatus = () => {
  const dispatch = useDispatch();
  const gmp = useGmp();

  useEffect(() => {
    const fetchAndDispatch = async () => {
      try {
        const response = await gmp.feedstatus.checkFeedSync();
        dispatch(setSyncStatus(response.isSyncing));
      } catch (error) {
        dispatch(setError(error.toString()));
      }
    };

    fetchAndDispatch();
    const intervalId = setInterval(fetchAndDispatch, FIVE_MINUTES);

    return () => clearInterval(intervalId);
  }, [dispatch, gmp]);
};

/**
 * Hook to manage the feed sync dialog state.
 *
 * @returns {[boolean, React.Dispatch<React.SetStateAction<boolean>>, { isSyncing: boolean, error: string }]}
 * An array containing the dialog state, a function to set the dialog state, and the feed status.
 */

export const useFeedSyncDialog = () => {
  const feedStatus = useSelector(state => state.feedStatus);

  const [isFeedSyncDialogOpened, setIsFeedSyncDialogOpened] = useState(false);

  useEffect(() => {
    if (feedStatus.isSyncing || feedStatus.error) {
      setIsFeedSyncDialogOpened(true);

      const timer = setTimeout(() => {
        setIsFeedSyncDialogOpened(false);
      }, THIRTY_SECONDS);

      return () => clearTimeout(timer);
    }
  }, [feedStatus.isSyncing, feedStatus.error]);

  return [isFeedSyncDialogOpened, setIsFeedSyncDialogOpened, feedStatus];
};
