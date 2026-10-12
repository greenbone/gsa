/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityCommandParams} from 'gmp/commands/entity';
import type Nvt from 'gmp/models/nvt';
import useGmp from 'web/hooks/useGmp';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetNvtParams {
  id: string | undefined;
}

const useGetNvt = ({id}: UseGetNvtParams) => {
  const gmp = useGmp();

  return useGetEntity<Nvt>({
    gmpMethod: ({id}: EntityCommandParams) => gmp.nvt.get({id}),
    queryId: 'get_nvt',
    id,
  });
};

export default useGetNvt;
