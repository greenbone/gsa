/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';

const StyledDialogContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 10% auto;
  border: 0;
  outline: 0;
  width: ${props => (isDefined(props.width) ? props.width : '400px')};
  height: ${props => (isDefined(props.height) ? props.height : 'auto')};
`;

const DialogContainer = React.forwardRef(
  ({width = '', height = '', ...other}, ref) => {
    if (!width.toString().endsWith('px')) {
      width += 'px';
    }
    if (!height.toString().endsWith('px')) {
      height += 'px';
    }
    return (
      <StyledDialogContainer
        data-testid="dialogcontainer"
        {...other}
        ref={ref}
        width={width}
        height={height}
      />
    );
  },
);

DialogContainer.displayName = 'DialogContainer';

DialogContainer.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DialogContainer;

// vim: set ts=2 sw=2 tw=80:
