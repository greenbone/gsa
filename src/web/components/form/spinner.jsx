/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import NumberField from './numberfield';

const Spinner = props => {
  return <NumberField {...props} hideControls={false} />;
};

export default Spinner;
