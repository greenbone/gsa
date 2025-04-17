/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';
import GmpContext from 'web/components/provider/GmpProvider';

const useGmp = () => {
  const gmp = useContext(GmpContext);
  if (!gmp) {
    throw new Error('GMP instance is not available.');
  }
  return gmp;
};

export default useGmp;
