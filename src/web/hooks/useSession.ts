/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useGmp from 'web/hooks/useGmp';

/**
 * Custom hook to access the user session information.
 *
 * This hook provides access to the user session information,
 * including the JWT token, session timeout, locale, timezone, and username.
 *
 * @returns A user session
 */
const useSession = () => {
  const gmp = useGmp();

  return gmp.settings.session;
};

export default useSession;
