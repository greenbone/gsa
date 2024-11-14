/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import Field from './field';

const PasswordField = props => <Field {...props} type="password" data-testid="passwordfield"/>;

export default PasswordField;

// vim: set ts=2 sw=2 tw=80:
