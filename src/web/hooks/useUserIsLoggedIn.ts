/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSyncExternalStore} from 'react';
import useGmp from 'web/hooks/useGmp';

/**
 * Custom hook to query the user's logged-in state.
 *
 * This hook provides a boolean value indicating whether the user is logged in.
 *
 * @returns A boolean indicating the current logged-in state of the user.
 *
 * @example
 * const isLoggedIn = useUserIsLoggedIn();
 */
const useUserIsLoggedIn = () => {
  const gmp = useGmp();
  const isLoggedIn = useSyncExternalStore(
    listener => gmp.session.subscribeToChanges(listener),
    () => gmp.session.isLoggedIn(),
  );
  return isLoggedIn;
};

export default useUserIsLoggedIn;
