/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useSyncExternalStore} from 'react';
import useGmp from 'web/hooks/useGmp';

/**
 * Custom hook to access the user session token.
 *
 * This hook provides access to the user session token used for authentication.
 *
 * @returns The user session token
 */
const useSessionToken = () => {
  const gmp = useGmp();
  const token = useSyncExternalStore(
    listener => gmp.session.subscribeToChanges(listener),
    () => gmp.session.token,
  );
  return token;
};

export default useSessionToken;
