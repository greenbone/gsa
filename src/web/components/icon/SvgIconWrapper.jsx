/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/proptypes';

import SvgIcon from './svgicon';

const SvgIconWrapper = ({component: Component, size, ...props}) => (
  <SvgIcon size={size} {...props}>
    {svgProps => <Component {...svgProps} />}
  </SvgIcon>
);

SvgIconWrapper.propTypes = {
  component: PropTypes.node.isRequired,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
    PropTypes.string,
  ]),
};

export default SvgIconWrapper;
