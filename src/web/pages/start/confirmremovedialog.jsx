/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogTitle from 'web/components/dialog/title';
import DialogTwoButtonFooter from 'web/components/dialog/twobuttonfooter';

const Content = styled.div`
  padding: 5px 15px;
`;

const ConfirmRemoveDialog = ({
  dashboardTitle,
  dashboardId,
  onConfirm,
  onDeny,
}) => (
  <Dialog width="450px" minHeight={100} minWidth={200} onClose={onDeny}>
    {({moveProps}) => (
      <DialogContent>
        <DialogTitle
          title={_('Remove Dashboard {{name}}', {name: dashboardTitle})}
          onCloseClick={onDeny}
          {...moveProps}
        />
        <Content>
          {_(
            'Do you really want to remove the Dashboard {{name}} and its ' +
              'configuration?',
            {name: dashboardTitle},
          )}
        </Content>
        <DialogTwoButtonFooter
          rightButtonTitle={_('Remove')}
          onLeftButtonClick={onDeny}
          onRightButtonClick={() => onConfirm(dashboardId)}
        />
      </DialogContent>
    )}
  </Dialog>
);

ConfirmRemoveDialog.propTypes = {
  dashboardId: PropTypes.string.isRequired,
  dashboardTitle: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onDeny: PropTypes.func.isRequired,
};

export default ConfirmRemoveDialog;

// vim: set ts=2 sw=2 tw=80:
