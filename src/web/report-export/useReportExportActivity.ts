/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useRef} from 'react';
import {type ReportExportJob} from 'web/report-export/report-export-job-model';
import {useReportExportManager} from 'web/report-export/ReportExportManager';

type IndicatorState = 'error' | 'active' | 'complete';

const isComplete = (job: ReportExportJob) => job.view.kind === 'complete';

// newest exports first; jobs without a server creation time (started but
// not yet polled) count as the newest and come first. Infinity - Infinity
// is NaN, which is falsy, so the fallback orders those ties by tracking
// order. dayjs instances order by their valueOf().
const getReportExportJobSortKey = (job: ReportExportJob) =>
  job.exportData?.creationTime?.valueOf() ?? Number.POSITIVE_INFINITY;

const compareReportExportJobs = (
  first: {job: ReportExportJob; index: number},
  second: {job: ReportExportJob; index: number},
) =>
  getReportExportJobSortKey(second.job) -
    getReportExportJobSortKey(first.job) || second.index - first.index;

const useReportExportActivity = () => {
  const {activityOpen, clearFinished, isActive, jobs, setActivityOpen} =
    useReportExportManager();
  const previousJobKeys = useRef(new Set(jobs.map(job => job.key)));

  // Every tracked row stays visible and counted until it is removed by the
  // user or the login session ends; completed rows keep the activity
  // accessible after closing the popover.
  const visibleJobs = jobs
    .map((job, index) => ({job, index}))
    .sort(compareReportExportJobs)
    .map(({job}) => job);
  const changeActivityOpen = setActivityOpen;

  // Newly started exports open the activity automatically.
  useEffect(() => {
    const additions = jobs
      .filter(job => !previousJobKeys.current.has(job.key) && !isComplete(job))
      .map(job => job.key);
    if (additions.length) {
      setActivityOpen(true);
    }
    previousJobKeys.current = new Set(jobs.map(job => job.key));
  }, [jobs, setActivityOpen]);

  let indicatorState: IndicatorState = 'complete';
  if (isActive) indicatorState = 'active';
  if (visibleJobs.some(job => job.view.kind === 'failed' || job.cancelError))
    indicatorState = 'error';

  return {
    activityOpen,
    changeActivityOpen,
    clearFinished,
    indicatorState,
    shouldRenderActivity: visibleJobs.length > 0,
    visibleJobs,
  };
};

export default useReportExportActivity;
