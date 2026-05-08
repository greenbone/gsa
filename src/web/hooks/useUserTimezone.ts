/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useSyncExternalStore} from 'react';
import useGmp from 'web/hooks/useGmp';

/**
 * Custom hook to access the current user's timezone.
 *
 * This hook provides access to the user's timezone setting.
 *
 * @returns An array containing the current timezone and a function to update it.
 */
const useUserTimezone = (): [
  timezone: string | undefined,
  setTimezone: (newTimezone: string) => void,
] => {
  const gmp = useGmp();
  const timezone = useSyncExternalStore(
    listener => gmp.session.subscribeToChanges(listener),
    () => gmp.session.timezone,
  );
  const setTimezone = useCallback(
    (newTimezone: string) => {
      gmp.session.setTimezone(newTimezone);
    },
    [gmp],
  );
  return [timezone, setTimezone];
};

export default useUserTimezone;
