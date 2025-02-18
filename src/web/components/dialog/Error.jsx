/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

import CloseButton from './CloseButton';

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
    <StyledLayout align={['space-between', 'center']}>
      <span
        style={{
          whiteSpace: 'pre-line',
        }}
      >
        {error}
      </span>
      <DialogCloseButton
        data-testid="error-close-button"
        title={_('Close')}
        onClick={onCloseClick}
      />
    </StyledLayout>
  );
};

DialogError.propTypes = {
  error: PropTypes.string,
  onCloseClick: PropTypes.func,
};

export default DialogError;
