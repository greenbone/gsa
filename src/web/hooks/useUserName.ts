/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSyncExternalStore} from 'react';
import useGmp from 'web/hooks/useGmp';

/**
 * Custom hook to get and set the username.
 *
 * @returns The current username.
 */
const useUserName = () => {
  const gmp = useGmp();
  const username = useSyncExternalStore(
    listener => gmp.session.subscribeToChanges(listener),
    () => gmp.session.username,
  );
  return username;
};

export default useUserName;
