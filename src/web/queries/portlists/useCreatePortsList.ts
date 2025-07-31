/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {PortListCommandCreateParams} from 'gmp/commands/portlists';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';
import {useCreateMutation} from 'web/queries/useEntityMutation';

export function useCreatePortsList(options?: {
  onSuccess?: (data: Response<ActionResult, XmlMeta>) => void;
  onError?: (error: unknown) => void;
}) {
  return useCreateMutation<
    PortListCommandCreateParams,
    Response<ActionResult, XmlMeta>
  >({
    entityKey: 'portlist',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
