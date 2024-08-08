/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

export const withComponentDefaults = (options = {}) => Component => {
  const ComponentDefaultsWrapper = props => (
    <Component {...options} {...props} />
  );
  return ComponentDefaultsWrapper;
};

export default withComponentDefaults;

// vim: set ts=2 sw=2 tw=80:
