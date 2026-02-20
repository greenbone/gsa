/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import useGmp from 'web/hooks/useGmp';

interface UseGetTimezonesParams {
  enabled?: boolean;
}

export const useGetTimezones = ({
  enabled = true,
}: UseGetTimezonesParams = {}) => {
  const gmp = useGmp();
  const {token} = gmp.settings;

  return useQuery({
    enabled: enabled && !!token,
    queryKey: ['get_timezones', token],
    queryFn: async () => {
      const response = await gmp.timezones.get();
      return response.data;
    },
  });
};
