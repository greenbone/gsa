/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'prop-types';

const IconWithStrokeWidth = ({IconComponent, strokeWidth = 1.5, ...props}) => {
  return <IconComponent {...props} strokeWidth={strokeWidth} />;
};

IconWithStrokeWidth.propTypes = {
  IconComponent: PropTypes.elementType.isRequired,
  strokeWidth: PropTypes.number,
};

export default IconWithStrokeWidth;
