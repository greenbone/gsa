/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from '../../utils/proptypes';

const TableRow = ({items = [], children, ...other}) => {
  const data = items.map((item, i) => {
    return (
      <th key={item.id && item.name ? `${item.id}-${item.name}` : i}>{item}</th>
    );
  });
  return (
    <tr {...other}>
      {data}
      {children}
    </tr>
  );
};

TableRow.propTypes = {
  children: PropTypes.node,
  items: PropTypes.array,
};

export default TableRow;
