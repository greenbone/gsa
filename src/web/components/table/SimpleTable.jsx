/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/PropTypes';

import Table from './Table';

const SimpleTable = ({size = 'auto', ...props}) => (
  <Table {...props} size={size} />
);

SimpleTable.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SimpleTable;
