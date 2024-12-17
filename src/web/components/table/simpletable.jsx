/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';
import PropTypes from 'web/utils/proptypes';

import Table from './table';

const SimpleTable = ({size = 'auto', ...props}) => (
  <Table {...props} size={size} />
);

SimpleTable.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SimpleTable;

// vim: set ts=2 sw=2 tw=80:
