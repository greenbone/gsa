/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {
  KeyResponse,
  KeyStatusResponse,
  DeleteKeyResponse,
  UploadKeyResponse,
} from 'gmp/commands/feed-key';
import useGmp from 'web/hooks/useGmp';

export const useGetKey = () => {
  const gmp = useGmp();
  const {jwt} = gmp.settings;

  return useQuery<KeyResponse>({
    queryKey: ['get_feed_key', jwt],
    enabled: Boolean(jwt),
    queryFn: gmp.feedkey.get.bind(gmp.feedkey),
    retry: false,
  });
};

export const useGetKeyStatus = () => {
  const gmp = useGmp();
  const {jwt} = gmp.settings;

  return useQuery<KeyStatusResponse>({
    queryKey: ['get_feed_key_status', jwt],
    enabled: Boolean(jwt),
    queryFn: async () => {
      if (typeof gmp.feedkey.getStatus === 'function') {
        return gmp.feedkey.getStatus();
      }
      const res = await gmp.feedkey.get();
      return {hasKey: Boolean(res)} as KeyStatusResponse;
    },
    retry: false,
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();
  const gmp = useGmp();

  return useMutation<DeleteKeyResponse, Error>({
    mutationFn: gmp.feedkey.delete.bind(gmp.feedkey),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['get_feed_key_status']});
    },
  });
};

export const useUploadKey = () => {
  const queryClient = useQueryClient();
  const gmp = useGmp();

  return useMutation<UploadKeyResponse, Error, File>({
    mutationFn: gmp.feedkey.save.bind(gmp.feedkey),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['get_feed_key_status']});
    },
  });
};
