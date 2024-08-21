/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import {DialogFooterLayout} from 'web/components/dialog/footer';

import Button from './button';
import LoadingButton from 'web/components/form/loadingbutton';

import Divider from 'web/components/layout/divider';

const StyledLayout = styled(DialogFooterLayout)`
  justify-content: space-between;
`;

const MultiStepFooter = ({
  leftButtonTitle = _('Cancel'),
  nextButtonTitle = '🠮',
  previousButtonTitle = '🠬',
  rightButtonTitle = _('Save'),
  onLeftButtonClick,
  onNextButtonClick,
  onPreviousButtonClick,
  onRightButtonClick,
  prevDisabled = false,
  nextDisabled = false,
  loading = false,
}) => (
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
      <LoadingButton
        data-testid="dialog-previous-button"
        disabled={prevDisabled}
        onClick={onPreviousButtonClick}
        title={previousButtonTitle}
      >
        {previousButtonTitle}
      </LoadingButton>
      <LoadingButton
        data-testid="dialog-next-button"
        disabled={nextDisabled}
        onClick={onNextButtonClick}
        title={nextButtonTitle}
      >
        {nextButtonTitle}
      </LoadingButton>
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
