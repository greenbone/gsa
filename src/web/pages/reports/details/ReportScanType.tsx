/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type ReportTask from 'gmp/models/report/task';
import useTranslation from 'web/hooks/useTranslation';
import getReportTaskTypePresentation from 'web/pages/reports/details/ReportTaskType';

interface ReportScanTypeProps {
  task?: ReportTask;
  heading?: boolean;
}

const ReportScanType = ({task, heading = false}: ReportScanTypeProps) => {
  const [_] = useTranslation();
  const {icon, label} = getReportTaskTypePresentation(task, _);

  if (heading) {
    return (
      <span style={{whiteSpace: 'nowrap'}}>
        {icon} {_('Report:')}
      </span>
    );
  }

  return <>{label}</>;
};

export default ReportScanType;
