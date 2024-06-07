/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import Button from 'web/components/form/button';

import Theme from 'web/utils/theme';
import {styledExcludeProps} from 'web/utils/styledConfig';

const LoadingButton = styledExcludeProps(styled(Button), ['isLoading'])`
  color: ${props => (props.isLoading ? 'rgba(0, 0, 0, 0.0)' : Theme.darkGray)};
  background: ${props =>
    props.isLoading
      ? Theme.lightGreen + ' url(/img/loading.gif) center center no-repeat'
      : Theme.white};

  /* when hovering these settings have to be overwritten explicitly */
  :hover {
    color: ${props => (props.isLoading ? 'rgba(0, 0, 0, 0.0)' : Theme.white)};
    background: ${props =>
      props.isLoading
        ? Theme.green + ' url(/img/loading.gif) center center no-repeat'
        : Theme.green};
  }
`;

export default LoadingButton;
