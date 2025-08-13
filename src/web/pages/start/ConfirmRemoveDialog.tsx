/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Dialog from 'web/components/dialog/Dialog';
import DialogContent from 'web/components/dialog/DialogContent';
import DialogTwoButtonFooter, {
  DELETE_ACTION,
} from 'web/components/dialog/DialogTwoButtonFooter';
import useTranslation from 'web/hooks/useTranslation';

interface ConfirmRemoveDialogProps {
  dashboardTitle: string;
  dashboardId: string;
  onConfirm: (dashboardId: string) => void;
  onDeny: () => void;
}

const Content = styled.div`
  padding: 5px 15px;
`;

const ConfirmRemoveDialog = ({
  dashboardTitle,
  dashboardId,
  onConfirm,
  onDeny,
}: ConfirmRemoveDialogProps) => {
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

export default ConfirmRemoveDialog;
