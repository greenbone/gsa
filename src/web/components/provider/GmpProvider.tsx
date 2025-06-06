/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Gmp from 'gmp/gmp';

const GmpContext = React.createContext<Gmp | undefined>(undefined);

export default GmpContext;
