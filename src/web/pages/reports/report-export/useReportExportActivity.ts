/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useRef, useState} from 'react';
import {useReportExportManager} from 'web/pages/reports/report-export/ReportExportManager';
import {type ReportExportJob} from 'web/report-export/report-export-job';

type IndicatorState = 'error' | 'active' | 'complete';

const isComplete = (job: ReportExportJob) => job.view.kind === 'complete';

const useReportExportActivity = () => {
  const {
    activityOpen,
    discoveryError,
    discoveryIncomplete,
    isActive,
    jobs,
    setActivityOpen,
  } = useReportExportManager();
  const previousJobKeys = useRef(new Set(jobs.map(job => job.key)));
  const [recentKeys, setRecentKeys] = useState(
    () => new Set(jobs.filter(job => !isComplete(job)).map(job => job.key)),
  );
  const visibleJobs = jobs
    .map((job, index) => ({job, index}))
    .filter(({job}) => !isComplete(job) || recentKeys.has(job.key))
    .sort((first, second) => {
      if (first.job.autoDownload !== second.job.autoDownload)
        return first.job.autoDownload ? -1 : 1;
      return second.index - first.index;
    })
    .map(({job}) => job);
  const changeActivityOpen = (open: boolean) => {
    if (!open)
      setRecentKeys(
        new Set(jobs.filter(job => !isComplete(job)).map(job => job.key)),
      );
    setActivityOpen(open);
  };

  useEffect(() => {
    const additions = jobs
      .filter(job => !previousJobKeys.current.has(job.key) && !isComplete(job))
      .map(job => job.key);
    if (additions.length) {
      setRecentKeys(current => new Set([...current, ...additions]));
      setActivityOpen(true);
    }
    previousJobKeys.current = new Set(jobs.map(job => job.key));
  }, [jobs, setActivityOpen]);

  let indicatorState: IndicatorState = 'complete';
  if (isActive) indicatorState = 'active';
  if (
    visibleJobs.some(job => job.view.kind === 'failed' || job.cancelError) ||
    discoveryError ||
    discoveryIncomplete
  )
    indicatorState = 'error';

  return {
    activityOpen,
    changeActivityOpen,
    discoveryError,
    discoveryIncomplete,
    indicatorState,
    shouldRenderActivity:
      visibleJobs.length > 0 || Boolean(discoveryError) || discoveryIncomplete,
    visibleJobs,
  };
};

export default useReportExportActivity;
