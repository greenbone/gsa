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
    className="pie-label"
    dy=".33em"
    fill={Theme.dialogGray} // to have labels a bit visible on white background
    fontSize={Theme.Font.default}
    fontWeight="bold"
    textAnchor="middle"
    x={x}
    y={y}
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
