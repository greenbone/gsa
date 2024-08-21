/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import Button from 'web/components/form/button';

import Theme from 'web/utils/theme';

const DialogButton = styled(({loading, ...props}) => <Button {...props} />)`
  border: 1px solid ${Theme.mediumGray};
  color: ${props => (props.loading ? 'rgba(0, 0, 0, 0.0)' : Theme.white)};
  background: ${props =>
    props.loading
      ? Theme.green + ' url(/img/loading.gif) center center no-repeat'
      : Theme.green};

  /* when hovering these settings have to be overwritten explicitly */
  :hover {
    color: ${props => (props.loading ? 'rgba(0, 0, 0, 0.0)' : Theme.darkGreen)};
    background: ${props =>
      props.loading
        ? Theme.green + ' url(/img/loading.gif) center center no-repeat'
        : Theme.lightGreen};
  }
`;

export default DialogButton;

// vim: set ts=2 sw=2 tw=80:
