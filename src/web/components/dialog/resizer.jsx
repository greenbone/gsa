/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import Theme from 'web/utils/theme';

const ResizerSymbol = styled.div`
  width: 0;
  height: 0;
  cursor: nwse-resize;
  border-right: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-top: 20px solid ${Theme.white};
`;

const ResizerBox = styled.div`
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 20px;
  height: 20px;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 2px,
    ${Theme.black} 2px,
    ${Theme.black} 3px
  );
`;

const Resizer = props => {
  return (
    <ResizerBox>
      <ResizerSymbol {...props} />
    </ResizerBox>
  );
};

export default Resizer;

// vim: set ts=2 sw=2 tw=80:
