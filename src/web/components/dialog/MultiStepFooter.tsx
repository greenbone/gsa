/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {DialogFooterLayout} from 'web/components/dialog/DialogFooter';
import Button from 'web/components/form/Button';
import Divider from 'web/components/layout/Divider';
import useTranslation from 'web/hooks/useTranslation';

interface MultiStepFooterProps {
  leftButtonTitle?: string;
  nextButtonTitle?: string;
  previousButtonTitle?: string;
  rightButtonTitle?: string;
  onLeftButtonClick?: () => void;
  onNextButtonClick?: () => void;
  onPreviousButtonClick?: () => void;
  onRightButtonClick?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  loading?: boolean;
}

const StyledLayout = styled(DialogFooterLayout)`
  justify-content: space-between;
`;

const MultiStepFooter = ({
  leftButtonTitle,
  nextButtonTitle = '🠮',
  previousButtonTitle = '🠬',
  rightButtonTitle,
  onLeftButtonClick,
  onNextButtonClick,
  onPreviousButtonClick,
  onRightButtonClick,
  prevDisabled = false,
  nextDisabled = false,
  loading = false,
}: MultiStepFooterProps) => {
  const [_] = useTranslation();
  leftButtonTitle = leftButtonTitle || _('Cancel');
  rightButtonTitle = rightButtonTitle || _('Save');
  return (
    <StyledLayout align={['end', 'center']} shrink="0">
      <Button
        data-testid="dialog-close-button"
        disabled={loading}
        title={leftButtonTitle}
        onClick={onLeftButtonClick}
      >
        {leftButtonTitle}
      </Button>
      <Divider>
        <Button
          data-testid="dialog-previous-button"
          disabled={prevDisabled}
          title={previousButtonTitle}
          onClick={onPreviousButtonClick}
        >
          {previousButtonTitle}
        </Button>
        <Button
          data-testid="dialog-next-button"
          disabled={nextDisabled}
          title={nextButtonTitle}
          onClick={onNextButtonClick}
        >
          {nextButtonTitle}
        </Button>
        <Button
          data-testid="dialog-save-button"
          loading={loading}
          title={rightButtonTitle}
          onClick={onRightButtonClick}
        >
          {rightButtonTitle}
        </Button>
      </Divider>
    </StyledLayout>
  );
};

export default MultiStepFooter;
