/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';
import GmpContext from 'web/components/provider/GmpProvider';

const useGmp = () => useContext(GmpContext);

export default useGmp;
