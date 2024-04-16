/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import Dialog from 'web/components/dialog/dialog';
import DialogContent from 'web/components/dialog/content';
import DialogTwoButtonFooter from 'web/components/dialog/twobuttonfooter';

import useTranslation from 'web/hooks/useTranslation';

const Content = styled.div`
  padding: 5px 15px;
`;

const ConfirmRemoveDialog = ({
  dashboardTitle,
  dashboardId,
  onConfirm,
  onDeny,
}) => {
  const [_] = useTranslation();
  return (
    <Dialog
      onClose={onDeny}
      title={_('Remove Dashboard {{name}}', {name: dashboardTitle})}
    >
      <DialogContent>
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
    </Dialog>
  );
};

ConfirmRemoveDialog.propTypes = {
  dashboardId: PropTypes.string.isRequired,
  dashboardTitle: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onDeny: PropTypes.func.isRequired,
};

export default ConfirmRemoveDialog;

// vim: set ts=2 sw=2 tw=80:
