/* Copyright (C) 2019-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
