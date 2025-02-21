/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/PropTypes';

import SvgIcon from './SvgIcon';

const SvgIconWrapper = ({component: Component, size, ...props}) => (
  <SvgIcon size={size} {...props}>
    {svgProps => <Component {...svgProps} />}
  </SvgIcon>
);

SvgIconWrapper.propTypes = {
  component: PropTypes.elementType.isRequired,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

export default SvgIconWrapper;
