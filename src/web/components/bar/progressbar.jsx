/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';
import Theme from 'web/utils/theme';

const ProgressBarBox = styledExcludeProps(styled.div, ['boxBackground'])`
  height: 13px;
  box-sizing: content-box; /* height includes border */
  display: inline-block;
  width: 100px;
  background: ${props => props.boxBackground};
  vertical-align: middle;
  text-align: center;

  @media print {
    background: none;
    border: 0;
  }
`;

const Content = styled.div`
  z-index: ${Theme.Layers.higher};
  font-weight: bold;
  color: ${Theme.white};
  font-size: 9px;
  margin: 0;
  position: relative;
  top: -13px;
  padding-top: 1px;

  @media print {
    color: black;
  }
`;

export const adjustProgress = progress => {
  if (parseInt(progress) > 100) {
    progress = '100';
  }
  if (parseInt(progress) < 0) {
    progress = '0';
  }
  return progress;
};

const Progress = styledExcludeProps(styled.div, ['progress'])`
  height: 13px;

  @media print {
    background: none;
  }
  ${props => {
    let {background, progress} = props;

    if (background === 'warn') {
      background = Theme.severityWarnYellow;
    } else if (background === 'error') {
      background = Theme.errorRed;
    } else if (background === 'low') {
      background = Theme.severityLowBlue;
    } else if (background === 'new') {
      background = Theme.statusNewGreen;
    } else if (background === 'run') {
      background = Theme.statusRunGreen;
    } else if (background === 'log') {
      background = 'gray';
    }

    progress = adjustProgress(progress);

    return {
      width: progress + '%',
      background,
    };
  }};
`;

const ProgressBar = ({
  background,
  boxBackground = Theme.darkGray,
  children,
  progress,
  title,
}) => {
  return (
    <ProgressBarBox
      data-testid="progressbar-box"
      title={title}
      boxBackground={boxBackground}
    >
      <Progress
        data-testid="progress"
        progress={progress}
        background={background}
      />
      <Content>{children}</Content>
    </ProgressBarBox>
  );
};

ProgressBar.propTypes = {
  background: PropTypes.string,
  boxBackground: PropTypes.string,
  progress: PropTypes.numberOrNumberString,
  title: PropTypes.string,
};

export default ProgressBar;

// vim: set ts=2 sw=2 tw=80:
