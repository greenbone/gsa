/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {BACKGROUND_STATES} from 'web/components/bar/definitions';
import Theme from 'web/utils/Theme';

interface ProgressBarBoxProps {
  $boxBackground?: string;
}

interface ProgressProps {
  $background?: string;
  $progress?: string | number;
}

interface ProgressBarProps {
  background?: string;
  boxBackground?: string;
  children?: React.ReactNode;
  progress?: string | number;
  title?: string;
}

const ProgressBarBox = styled.div<ProgressBarBoxProps>`
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

export const adjustProgress = (progress?: string | number): string => {
  if (!progress) {
    return '0';
  }

  if (parseInt(String(progress)) > 100) {
    return '100';
  }
  if (parseInt(String(progress)) < 0) {
    return '0';
  }
  return String(progress);
};

const Progress = styled.div<ProgressProps>`
  height: 16px;
  border-radius: 8px;

  @media print {
    background: none;
  }
  ${props => {
    let {$background, $progress} = props;

    if ($background === BACKGROUND_STATES.WARN) {
      $background = Theme.severityWarnYellow;
    } else if ($background === BACKGROUND_STATES.ERROR) {
      $background = Theme.errorRed;
    } else if ($background === BACKGROUND_STATES.LOW) {
      $background = Theme.severityLowBlue;
    } else if ($background === BACKGROUND_STATES.NEW) {
      $background = Theme.statusNewGreen;
    } else if ($background === BACKGROUND_STATES.RUN) {
      $background = Theme.statusRunGreen;
    } else if ($background === BACKGROUND_STATES.LOG) {
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
}: ProgressBarProps) => {
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

export default ProgressBar;
