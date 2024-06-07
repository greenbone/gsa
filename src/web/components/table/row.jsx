/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import PropTypes from '../../utils/proptypes';

const TableRow = ({items = [], children, ...other}) => {
  const data = items.map((item, i) => {
    return <th key={i}>{item}</th>;
  });
  return (
    <tr {...other}>
      {data}
      {children}
    </tr>
  );
};

TableRow.propTypes = {
  items: PropTypes.array,
};

export default TableRow;

// vim: set ts=2 sw=2 tw=80:
