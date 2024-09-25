/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import {DialogFooterLayout} from 'web/components/dialog/footer';

import Button from 'web/components/form/button';

import Divider from 'web/components/layout/divider';
import useTranslation from 'web/hooks/useTranslation';

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
}) => {
  const [_] = useTranslation();
  leftButtonTitle = leftButtonTitle || _('Cancel');
  rightButtonTitle = rightButtonTitle || _('Save');
  return (
    <StyledLayout align={['end', 'center']} shrink="0">
      <Button
        data-testid="dialog-close-button"
        disabled={loading}
        onClick={onLeftButtonClick}
        title={leftButtonTitle}
      >
        {leftButtonTitle}
      </Button>
      <Divider>
        <Button
          data-testid="dialog-previous-button"
          disabled={prevDisabled}
          onClick={onPreviousButtonClick}
          title={previousButtonTitle}
        >
          {previousButtonTitle}
        </Button>
        <Button
          data-testid="dialog-next-button"
          disabled={nextDisabled}
          onClick={onNextButtonClick}
          title={nextButtonTitle}
        >
          {nextButtonTitle}
        </Button>
        <Button
          data-testid="dialog-save-button"
          onClick={onRightButtonClick}
          title={rightButtonTitle}
          loading={loading}
        >
          {rightButtonTitle}
        </Button>
      </Divider>
    </StyledLayout>
  );
};

MultiStepFooter.propTypes = {
  leftButtonTitle: PropTypes.string,
  loading: PropTypes.bool,
  nextButtonTitle: PropTypes.string,
  nextDisabled: PropTypes.bool,
  prevDisabled: PropTypes.bool,
  previousButtonTitle: PropTypes.string,
  rightButtonTitle: PropTypes.string.isRequired,
  onLeftButtonClick: PropTypes.func,
  onNextButtonClick: PropTypes.func,
  onPreviousButtonClick: PropTypes.func,
  onRightButtonClick: PropTypes.func,
};

export default MultiStepFooter;

// vim: set ts=2 sw=2 tw=80:
