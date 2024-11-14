/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import Layout from 'web/components/layout/layout';

import CloseButton from './closebutton';

const StyledLayout = styled(Layout)`
  padding: 15px;
  margin: 0px 15px 20px 15px;
  border: 1px solid ${Theme.mediumLightRed};
  border-radius: 2px;
  color: ${Theme.darkRed};
  background-color: ${Theme.lightRed};
`;

const DialogCloseButton = styled(CloseButton)`
  background: 0;
  color: ${Theme.darkRed};

  :hover {
    border: 1px solid ${Theme.darkRed};
  }
`;

const DialogError = ({error, onCloseClick}) => {
  if (!isDefined(error)) {
    return null;
  }
  return (
    <StyledLayout align={['space-between', 'center']} data-testid="layout_error">
      <span>{error}</span>
      <DialogCloseButton onClick={onCloseClick} title={_('Close')} data-testid="error_close_button"/>
    </StyledLayout>
  );
};

DialogError.propTypes = {
  error: PropTypes.string,
  onCloseClick: PropTypes.func,
};

export default DialogError;

// vim: set ts=2 sw=2 tw=80:
