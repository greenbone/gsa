/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {
  getTranslatableTaskStatus,
  TASK_STATUS,
  TaskStatus,
} from 'gmp/models/task';
import {BACKGROUND_STATES} from 'web/components/bar/definitions';
import ProgressBar, {adjustProgress} from 'web/components/bar/ProgressBar';
import useTranslation from 'web/hooks/useTranslation';

interface StatusBarProps {
  progress?: string | number;
  status?: TaskStatus;
}

const Span = styled.span`
  white-space: nowrap;
`;

const StatusBar = ({
  status = TASK_STATUS.unknown,
  progress = '0',
}: StatusBarProps) => {
  const [_] = useTranslation();
  progress = adjustProgress(progress);

  let text = getTranslatableTaskStatus(status);
  if (
    status === TASK_STATUS.unknown ||
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
    background = BACKGROUND_STATES.WARN;
  } else if (status === TASK_STATUS.interrupted) {
    background = BACKGROUND_STATES.ERROR;
  } else if (
    status === TASK_STATUS.uploading ||
    status === TASK_STATUS.container ||
    status === TASK_STATUS.done
  ) {
    background = BACKGROUND_STATES.LOW;
  } else if (status === TASK_STATUS.new) {
    background = BACKGROUND_STATES.NEW;
  } else if (
    status === TASK_STATUS.processing ||
    status === TASK_STATUS.running
  ) {
    background = BACKGROUND_STATES.RUN;
  }

  const title =
    status === TASK_STATUS.queued
      ? _('Task is queued for scanning')
      : getTranslatableTaskStatus(status);

  return (
    <ProgressBar
      background={background}
      data-testid={`progress-bar-${status.toLowerCase()}`}
      progress={progress}
      title={title}
    >
      <Span data-testid="statusbar-text">{text}</Span>
    </ProgressBar>
  );
};

export default StatusBar;
