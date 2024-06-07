/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Layout from 'web/components/layout/layout';

import DialogCloseButton from './closebutton';

const DialogTitleBar = styled(Layout)`
  padding: 5px 5px 5px 10px;
  margin-bottom: 15px;
  border-radius: 2px 2px 0 0;
  border-bottom: 1px solid ${Theme.mediumGray};
  color: ${Theme.white};
  font-weight: bold;
  background: ${Theme.green};
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  cursor: grab;
`;

const DialogTitle = ({showClose = true, title, onCloseClick, onMouseDown}) => {
  return (
    <DialogTitleBar
      data-testid="dialog-title-bar"
      align={['space-between', 'center']}
      onMouseDown={onMouseDown}
    >
      <span>{title}</span>
      {showClose && (
        <DialogCloseButton
          data-testid="dialog-title-close-button"
          title={_('Close')}
          onClick={onCloseClick}
        />
      )}
    </DialogTitleBar>
  );
};

DialogTitle.propTypes = {
  showClose: PropTypes.bool,
  title: PropTypes.string,
  onCloseClick: PropTypes.func,
  onMouseDown: PropTypes.func,
};

export default DialogTitle;

// vim: set ts=2 sw=2 tw=80:
