/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Features from 'gmp/capabilities/features';

const FeaturesContext = React.createContext<Features | undefined>(undefined);

export default FeaturesContext;
