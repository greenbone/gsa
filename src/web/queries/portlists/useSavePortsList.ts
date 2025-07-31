/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';
import {SavePortListData} from 'web/pages/portlists/PortListDialog';
import {PortRange} from 'web/pages/portlists/PortRangesTable';
import {useSaveMutation} from 'web/queries/useEntityMutation';

export function useSavePortList(options?: {
  onSuccess?: (data: Response<ActionResult, XmlMeta>) => void;
  onError?: (error: unknown) => void;
}) {
  return useSaveMutation<
    SavePortListData<PortRange>,
    Response<ActionResult, XmlMeta>
  >({
    entityKey: 'portlist',
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
