/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

interface KeyResponse {
  status: string;
  message?: string;
}

const API_BASE_URL = 'http://127.0.0.1:3000/api/v1';
const AUTH_TOKEN =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxODAyMjQzNDg1LCJpYXQiOjE3NzA3MDc0ODV9.cSf3_mBVAiE9mVjbAZV-pC4K6LAPMKUit5jnr-BmWZg';

export const useGetKey = () => {
  return useQuery<string>({
    queryKey: ['feedKey'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/key`, {
        headers: {
          Authorization: AUTH_TOKEN,
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No key found');
        }
        throw new Error(`Request failed: ${response.status}`);
      }
      return response.text(); // Since it's application/x-pem-file
    },
    retry: false,
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();

  return useMutation<KeyResponse, Error>({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/key`, {
        method: 'DELETE',
        headers: {
          Authorization: AUTH_TOKEN,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Key deletion failed');
      }
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['feedKey']});
    },
  });
};

export const useUploadKey = () => {
  const queryClient = useQueryClient();

  return useMutation<KeyResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/key`, {
        method: 'POST',
        headers: {
          Authorization: AUTH_TOKEN,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Key upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['feedKey']});
    },
  });
};
