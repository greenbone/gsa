/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Nvt from 'gmp/models/nvt';
import useGmp from 'web/hooks/useGmp';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetNvtParams {
  id?: string;
}

const useGetNvt = ({id}: UseGetNvtParams = {}) => {
  const gmp = useGmp();

  return useGetEntity<Nvt>({
    gmpMethod: gmp.nvt.get.bind(gmp.nvt),
    queryId: 'get_nvt',
    id: id ?? '',
  });
};

export default useGetNvt;
