/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ComponentType} from 'react';
import Dialog from 'web/components/dialog/Dialog';
import DialogContent from 'web/components/dialog/DialogContent';
import DialogTwoButtonFooter, {
  type DialogTwoButtonFooterProps,
} from 'web/components/dialog/DialogTwoButtonFooter';
import useTranslation from 'web/hooks/useTranslation';

interface ConfirmationDialogProps {
  content?: React.ReactNode;
  title: string;
  rightButtonTitle?: string;
  footer?: ComponentType<DialogTwoButtonFooterProps>;
  width?: string;
  onClose?: () => void;
  onResumeClick?: () => void;
  loading?: boolean;
}

const DEFAULT_DIALOG_WIDTH = '400px';

const ConfirmationDialog = ({
  width = DEFAULT_DIALOG_WIDTH,
  content,
  title,
  rightButtonTitle,
  footer: FooterComponent = DialogTwoButtonFooter,
  onClose,
  onResumeClick,
  loading,
}: ConfirmationDialogProps) => {
  const [_] = useTranslation();

  rightButtonTitle = rightButtonTitle ?? _('OK');

  return (
    <Dialog
      footer={
        <FooterComponent
          isLoading={loading}
          rightButtonTitle={rightButtonTitle}
          onLeftButtonClick={onClose}
          onRightButtonClick={onResumeClick}
        />
      }
      testId="confirmation-dialog"
      title={title}
      width={width}
      onClose={onClose}
    >
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
