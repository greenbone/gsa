/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {PortListCommandCreateParams} from 'gmp/commands/portlists';
import {useCreateMutation} from 'web/queries/useCreateMutation';

/**
 * useCreatePortsList - React hook for creating a port list using TanStack Query mutation.
 *
 * @example
 * import {FROM_FILE} from 'gmp/commands/portlists';
 * const createPortList = useCreatePortsList({
 *   onSuccess: data => console.log('Created:', data),
 *   onError: err => console.error(err),
 * });
 *
 * createPortList.mutate({
 *   name: 'My Port List',
 *   comment: 'Example',
 *   fromFile: FROM_FILE,
 *   portRange: '1-1024',
 * });
 */
export function useCreatePortsList(options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}) {
  return useCreateMutation<PortListCommandCreateParams, unknown>({
    entityKey: 'portlist',
    method: 'create',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
