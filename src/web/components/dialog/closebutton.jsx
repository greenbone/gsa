/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Theme from 'web/utils/theme';

import PropTypes from 'web/utils/proptypes';
import withIconSize from 'web/components/icon/withIconSize';

const StyledCloseButton = styled.div`
  display: flex;
  font-weight: bold;
  font-size: 12px;
  font-family: ${Theme.Font.default};
  color: ${Theme.darkGreen};
  cursor: pointer;
  border-radius: 2px;
  padding: 0;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  :hover {
    border: 1px solid ${Theme.darkGreen};
  }
`;

const CloseButton = ({title = _('Close'), ...props}) => (
  <StyledCloseButton {...props} title={title}>
    ×{/* Javascript unicode: \u00D7 */}
  </StyledCloseButton>
);

CloseButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default withIconSize('medium')(CloseButton);

// vim: set ts=2 sw=2 tw=80:
