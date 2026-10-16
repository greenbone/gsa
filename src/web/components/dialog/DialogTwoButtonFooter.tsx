/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DialogFooterLayout} from 'web/components/dialog/DialogFooter';
import Button from 'web/components/form/Button';
import useTranslation from 'web/hooks/useTranslation';

export interface DialogTwoButtonFooterProps {
  isLoading?: boolean;
  isSaving?: boolean;
  leftButtonDisabled?: boolean;
  leftButtonTitle?: string;
  rightButtonDisabled?: boolean;
  rightButtonTitle: string;
  onLeftButtonClick?: () => void;
  onRightButtonClick?: () => void;
}

const DialogTwoButtonFooter = ({
  isLoading = false,
  isSaving = false,
  leftButtonDisabled = false,
  leftButtonTitle,
  rightButtonDisabled = false,
  rightButtonTitle,
  onLeftButtonClick,
  onRightButtonClick,
}: DialogTwoButtonFooterProps) => {
  const [_] = useTranslation();
  leftButtonTitle = leftButtonTitle || _('Cancel');
  return (
    <DialogFooterLayout align={['space-between', 'center']} shrink="0">
      <Button
        data-testid="dialog-close-button"
        disabled={leftButtonDisabled || isSaving}
        variant="outline"
        onClick={onLeftButtonClick}
      >
        {leftButtonTitle}
      </Button>
      <Button
        data-testid="dialog-save-button"
        disabled={rightButtonDisabled || isSaving || isLoading}
        isLoading={isSaving || isLoading}
        variant="filled"
        onClick={onRightButtonClick}
      >
        {rightButtonTitle}
      </Button>
    </DialogFooterLayout>
  );
};

export default DialogTwoButtonFooter;
