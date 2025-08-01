/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DialogFooterLayout} from 'web/components/dialog/DialogFooter';
import Button from 'web/components/form/Button';
import useTranslation from 'web/hooks/useTranslation';

interface DialogTwoButtonFooterProps {
  leftButtonTitle?: string;
  rightButtonTitle: string;
  onLeftButtonClick?: () => void;
  onRightButtonClick?: () => void;
  loading?: boolean;
  isLoading?: boolean;
  rightButtonAction?: typeof DELETE_ACTION;
}

export const DELETE_ACTION = 'delete';

const DialogTwoButtonFooter = ({
  leftButtonTitle,
  rightButtonTitle,
  onLeftButtonClick,
  onRightButtonClick,
  loading = false,
  isLoading = loading,
  rightButtonAction,
}: DialogTwoButtonFooterProps) => {
  const [_] = useTranslation();
  leftButtonTitle = leftButtonTitle || _('Cancel');
  const isRightButtonAction = DELETE_ACTION === rightButtonAction;
  return (
    <DialogFooterLayout align={['space-between', 'center']} shrink="0">
      <Button
        data-testid="dialog-close-button"
        disabled={isLoading}
        variant={isRightButtonAction ? 'default' : 'outline'}
        onClick={onLeftButtonClick}
      >
        {leftButtonTitle}
      </Button>
      <Button
        data-testid="dialog-save-button"
        isLoading={isLoading}
        variant={isRightButtonAction ? 'danger' : 'filled'}
        onClick={onRightButtonClick}
      >
        {rightButtonTitle}
      </Button>
    </DialogFooterLayout>
  );
};

export default DialogTwoButtonFooter;
