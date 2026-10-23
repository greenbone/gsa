/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type React from 'react';
import type ReportTask from 'gmp/models/report/task';
import {isDefined} from 'gmp/utils/identity';
import {
  ContainerIcon,
  GlobeIcon,
  HatAndGlassesIcon,
  ImportIcon,
  RadarIcon,
} from 'web/components/icon';

interface ReportTaskTypePresentation {
  icon: React.ReactNode;
  label: string;
}

const getReportTaskTypePresentation = (
  task: ReportTask | undefined,
  _: (key: string) => string,
): ReportTaskTypePresentation => {
  if (isDefined(task) && task.isImport()) {
    return {
      icon: <ImportIcon size="small" title={_('Import Task')} />,
      label: _('Import Task'),
    };
  }

  if (isDefined(task?.agentGroup)) {
    return {
      icon: <HatAndGlassesIcon size="small" title={_('Agent Task')} />,
      label: _('Agents Scan'),
    };
  }

  if (isDefined(task?.ociImageTarget)) {
    return {
      icon: <ContainerIcon size="small" title={_('Container Image Task')} />,
      label: _('Container Scan'),
    };
  }

  if (isDefined(task?.webApplicationTarget)) {
    return {
      icon: <GlobeIcon size="small" title={_('Web Application Task')} />,
      label: _('Web Application Scan'),
    };
  }

  return {
    icon: <RadarIcon size="small" title={_('Task')} />,
    label: _('Scan'),
  };
};

export default getReportTaskTypePresentation;
