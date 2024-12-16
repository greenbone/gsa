/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Divider from './divider';

const HorizontalSep = styled(Divider)`
  flex-wrap: ${props => (isDefined(props.$wrap) ? props.$wrap : null)};
  & > *:not(:last-child)::after {
    content: ${({$separator = '•'}) => `'${$separator}'`};
    margin-left: ${({$spacing = '5px'}) => $spacing};
  }
`;

HorizontalSep.propTypes = {
  separator: PropTypes.string,
  spacing: PropTypes.string,
  wrap: PropTypes.oneOf([true, 'wrap', 'nowrap']),
};

export default HorizontalSep;
