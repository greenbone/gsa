/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Theme from 'web/utils/theme';

import PropTypes from '../../utils/proptypes';

const Label = React.forwardRef(({x, y, children, ...props}, ref) => (
  <text
    ref={ref}
    fill={Theme.dialogGray} // to have labels a bit visible on white background
    textAnchor="middle"
    x={x}
    y={y}
    dy=".33em"
    fontSize="12px"
    fontWeight="bold"
    className="pie-label"
    {...props}
  >
    {children}
  </text>
));

Label.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

export default Label;

// vim: set ts=2 sw=2 tw=80:
