/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Popover} from '@mantine/core';
import {DownloadIcon, TrashcanIcon, XIcon} from 'web/components/icon';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import {
  ActivityDot,
  ActivityTitle,
  ActivityTrigger,
} from 'web/report-export/report-export-activity-styles';
import {isReportExportJobFinished} from 'web/report-export/report-export-job-model';
import ReportExportJobRow from 'web/report-export/ReportExportJobRow';
import useReportExportActivity from 'web/report-export/useReportExportActivity';
import Theme from 'web/utils/theme';

export const ReportExportActivity = () => {
  const [_] = useTranslation();

  const {
    activityOpen,
    changeActivityOpen,
    clearFinished,
    indicatorState,
    shouldRenderActivity,
    visibleJobs,
  } = useReportExportActivity();

  if (!shouldRenderActivity) return null;

  return (
    <Popover
      offset={8}
      opened={activityOpen}
      position="bottom-end"
      styles={{
        dropdown: {
          boxSizing: 'border-box',
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'min(70vh, 560px)',
          overflowY: 'auto',
          width: 'min(560px, calc(100vw - 24px))',
        },
      }}
      transitionProps={{duration: 0}}
      onChange={changeActivityOpen}
    >
      <Popover.Target>
        <ActivityTrigger
          aria-label={_('Report export activity')}
          data-testid="report-export-activity-button"
          title={_('Report export activity')}
          type="button"
          onClick={() => changeActivityOpen(!activityOpen)}
        >
          <DownloadIcon color={Theme.white} />
          <ActivityDot $state={indicatorState} />
        </ActivityTrigger>
      </Popover.Target>
      <Popover.Dropdown data-testid="report-export-activity-popover">
        <Column gap="sm">
          <Row justify="space-between" wrap="nowrap">
            <ActivityTitle>
              {_('Report exports ({{count}})', {count: visibleJobs.length})}
            </ActivityTitle>
            <Row align="center" gap={8} wrap="nowrap">
              {visibleJobs.some(isReportExportJobFinished) && (
                <TrashcanIcon
                  aria-label={_('Clear completed')}
                  color={Theme.darkGray}
                  data-testid="report-export-clear-completed"
                  title={_('Clear completed')}
                  onClick={() => clearFinished()}
                />
              )}
              <XIcon
                aria-label={_('Close export activity')}
                title={_('Close export activity')}
                onClick={() => changeActivityOpen(false)}
              />
            </Row>
          </Row>
          {visibleJobs.map(job => (
            <ReportExportJobRow key={job.key} job={job} />
          ))}
        </Column>
      </Popover.Dropdown>
    </Popover>
  );
};
