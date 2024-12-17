/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const ProgressBarBox = styled.div`
  height: 16px;
  box-sizing: content-box;
  display: inline-block;
  width: 150px;
  background: ${props => props.$boxBackground};
  vertical-align: middle;
  text-align: center;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media print {
    background: none;
    border: 0;
  }
`;

const Content = styled.div`
  z-index: ${Theme.Layers.higher};
  font-weight: bold;
  color: ${Theme.white};
  font-size: 10px;
  margin: 0;
  position: relative;
  top: -16px;
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

const Progress = styled.div`
  height: 16px;
  border-radius: 8px;

  @media print {
    background: none;
  }
  ${props => {
    let {$background, $progress} = props;

    if ($background === 'warn') {
      $background = Theme.severityWarnYellow;
    } else if ($background === 'error') {
      $background = Theme.errorRed;
    } else if ($background === 'low') {
      $background = Theme.severityLowBlue;
    } else if ($background === 'new') {
      $background = Theme.statusNewGreen;
    } else if ($background === 'run') {
      $background = Theme.statusRunGreen;
    } else if ($background === 'log') {
      $background = 'gray';
    }

    $progress = adjustProgress($progress);

    return {
      width: $progress + '%',
      background: `linear-gradient(90deg, ${$background} 0%, ${$background} 100%)`,
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
      $boxBackground={boxBackground}
      data-testid="progressbar-box"
      title={title}
    >
      <Progress
        $background={background}
        $progress={progress}
        data-testid="progress"
      />
      <Content>{children}</Content>
    </ProgressBarBox>
  );
};

ProgressBar.propTypes = {
  children: PropTypes.node,
  background: PropTypes.string,
  boxBackground: PropTypes.string,
  progress: PropTypes.numberOrNumberString,
  title: PropTypes.string,
};

export default ProgressBar;
