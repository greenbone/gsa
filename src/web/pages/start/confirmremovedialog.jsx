/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import DialogContent from 'web/components/dialog/content';
import Dialog from 'web/components/dialog/dialog';
import DialogTwoButtonFooter, {
  DELETE_ACTION,
} from 'web/components/dialog/twobuttonfooter';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

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
      title={_('Remove Dashboard {{name}}', {name: dashboardTitle})}
      onClose={onDeny}
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
          rightButtonAction={DELETE_ACTION}
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
