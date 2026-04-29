/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import useGmp from 'web/hooks/useGmp';
import useSession from 'web/hooks/useSession';

interface UseGetTimezonesParams {
  enabled?: boolean;
}

export const useGetTimezones = ({
  enabled = true,
}: UseGetTimezonesParams = {}) => {
  const gmp = useGmp();
  const session = useSession();
  const token = session?.token;

  return useQuery({
    enabled: enabled && Boolean(token),
    queryKey: ['get_timezones', token],
    queryFn: async () => {
      const response = await gmp.timezones.get();
      return response.data;
    },
  });
};
