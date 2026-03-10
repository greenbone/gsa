/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {KeyResponse} from 'gmp/commands/feed-key';
import useGmp from 'web/hooks/useGmp';

export const useGetKey = () => {
  const gmp = useGmp();
  const {token} = gmp.settings;

  return useQuery<string>({
    queryKey: ['get_feed_key', token],
    enabled: Boolean(token),
    queryFn: gmp.feedkey.get.bind(gmp.feedkey),
    retry: false,
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();
  const gmp = useGmp();

  return useMutation<KeyResponse, Error>({
    mutationFn: gmp.feedkey.delete.bind(gmp.feedkey),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['get_feed_key']});
    },
  });
};

export const useUploadKey = () => {
  const queryClient = useQueryClient();
  const gmp = useGmp();

  return useMutation<KeyResponse, Error, File>({
    mutationFn: gmp.feedkey.save.bind(gmp.feedkey),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['get_feed_key']});
    },
  });
};
