/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Table from 'web/components/table/Table';
import PropTypes from 'web/utils/PropTypes';


const SimpleTable = ({size = 'auto', ...props}) => (
  <Table {...props} size={size} />
);

SimpleTable.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SimpleTable;
