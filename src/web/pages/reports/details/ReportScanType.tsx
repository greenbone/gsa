/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import type ReportTask from 'gmp/models/report/task';
import {isDefined} from 'gmp/utils/identity';
import {
  ContainerIcon,
  GlobeIcon,
  HatAndGlassesIcon,
  RadarIcon,
} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';

interface ReportScanTypeProps {
  task?: ReportTask;
  heading?: boolean;
}

const ReportScanType = ({
  task,
  heading = false,
}: ReportScanTypeProps) => {
  const [_] = useTranslation();
  let scanType = _('Scan');
  let scanTypeIcon = <RadarIcon size="small" title={_('Task')} />;

  if (isDefined(task?.agentGroup)) {
    scanType = _('Agents Scan');
    scanTypeIcon = <HatAndGlassesIcon size="small" title={_('Agent Task')} />;
  } else if (isDefined(task?.ociImageTarget)) {
    scanType = _('Container Scan');
    scanTypeIcon = (
      <ContainerIcon size="small" title={_('Container Image Task')} />
    );
  } else if (isDefined(task?.webApplicationTarget)) {
    scanType = _('Web Application Scan');
    scanTypeIcon = (
      <GlobeIcon size="small" title={_('Web Application Task')} />
    );
  }

  if (heading) {
    return (
      <span style={{whiteSpace: 'nowrap'}}>
        {scanTypeIcon} {_('Report:')}
      </span>
    );
  }

  return <>{scanType}</>;
};

export default ReportScanType;
