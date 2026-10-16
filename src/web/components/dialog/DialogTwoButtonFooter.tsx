/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DialogFooterLayout} from 'web/components/dialog/DialogFooter';
import Button from 'web/components/form/Button';
import useTranslation from 'web/hooks/useTranslation';

interface DialogTwoButtonFooterProps {
  isLoading?: boolean;
  isSaving?: boolean;
  leftButtonDisabled?: boolean;
  leftButtonTitle?: string;
  rightButtonAction?: typeof DELETE_ACTION;
  rightButtonDisabled?: boolean;
  rightButtonTitle: string;
  onLeftButtonClick?: () => void;
  onRightButtonClick?: () => void;
}

export const DELETE_ACTION = 'delete';

const DialogTwoButtonFooter = ({
  isLoading = false,
  isSaving = false,
  leftButtonDisabled = false,
  leftButtonTitle,
  rightButtonAction,
  rightButtonDisabled = false,
  rightButtonTitle,
  onLeftButtonClick,
  onRightButtonClick,
}: DialogTwoButtonFooterProps) => {
  const [_] = useTranslation();
  leftButtonTitle = leftButtonTitle || _('Cancel');
  const isRightButtonAction = DELETE_ACTION === rightButtonAction;
  return (
    <DialogFooterLayout align={['space-between', 'center']} shrink="0">
      <Button
        data-testid="dialog-close-button"
        disabled={leftButtonDisabled || isSaving}
        variant={isRightButtonAction ? 'default' : 'outline'}
        onClick={onLeftButtonClick}
      >
        {leftButtonTitle}
      </Button>
      <Button
        data-testid="dialog-save-button"
        disabled={rightButtonDisabled || isSaving || isLoading}
        isLoading={isSaving || isLoading}
        variant={isRightButtonAction ? 'danger' : 'filled'}
        onClick={onRightButtonClick}
      >
        {rightButtonTitle}
      </Button>
    </DialogFooterLayout>
  );
};

export default DialogTwoButtonFooter;
