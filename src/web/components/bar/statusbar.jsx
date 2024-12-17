/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {getTranslatableTaskStatus, TASK_STATUS} from 'gmp/models/task';

import PropTypes from 'web/utils/proptypes';

import ProgressBar, {adjustProgress} from './progressbar';

const Span = styled.span`
  white-space: nowrap;
`;

const StatusBar = ({status = 'Unknown', progress = '0'}) => {
  progress = adjustProgress(progress);

  let text = getTranslatableTaskStatus(status);
  if (
    status === 'Unknown' ||
    status === TASK_STATUS.new ||
    status === TASK_STATUS.done ||
    status === TASK_STATUS.container ||
    status === TASK_STATUS.stoprequested ||
    status === TASK_STATUS.deleterequested ||
    status === TASK_STATUS.ultimatedeleterequested ||
    status === TASK_STATUS.resumerequested ||
    status === TASK_STATUS.requested ||
    status === TASK_STATUS.queued
  ) {
    progress = '100';
  }

  if (status === TASK_STATUS.stopped || status === TASK_STATUS.interrupted) {
    text = _('{{status}} at {{progress}} %', {status: text, progress});
  } else if (status === TASK_STATUS.running) {
    text = _('{{progress}} %', {progress});
  }

  let background;
  if (
    status === TASK_STATUS.stopped ||
    status === TASK_STATUS.stoprequested ||
    status === TASK_STATUS.deleterequested ||
    status === TASK_STATUS.ultimatedeleterequested ||
    status === TASK_STATUS.resumerequested ||
    status === TASK_STATUS.requested ||
    status === TASK_STATUS.queued
  ) {
    background = 'warn';
  } else if (status === TASK_STATUS.interrupted) {
    background = 'error';
  } else if (
    status === TASK_STATUS.uploading ||
    status === TASK_STATUS.container ||
    status === TASK_STATUS.done
  ) {
    background = 'low';
  } else if (status === TASK_STATUS.new) {
    background = 'new';
  } else if (
    status === TASK_STATUS.processing ||
    status === TASK_STATUS.running
  ) {
    background = 'run';
  }

  const title =
    status === TASK_STATUS.queued
      ? _('Task is queued for scanning')
      : getTranslatableTaskStatus(status);

  return (
    <ProgressBar title={title} progress={progress} background={background} data-testid={`progress-bar-${status.toLowerCase()}`}>
      <Span data-testid="statusbar-text">{text}</Span>
    </ProgressBar>
  );
};

StatusBar.propTypes = {
  progress: PropTypes.numberOrNumberString,
  status: PropTypes.string,
};

export default StatusBar;

// vim: set ts=2 sw=2 tw=80:
