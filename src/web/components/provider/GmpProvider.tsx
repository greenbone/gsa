/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Gmp from 'gmp/gmp';
import React from 'react';

const GmpContext = React.createContext<Gmp | undefined>(undefined);

export default GmpContext;
