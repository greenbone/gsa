/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/PropTypes';

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
        {...other}
        ref={ref}
        height={height}
        width={width}
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
