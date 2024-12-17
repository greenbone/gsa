/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import AddToAssetsIcon from 'web/components/icon/addtoassetsicon';
import DownloadIcon from 'web/components/icon/downloadicon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import PerformanceIcon from 'web/components/icon/performanceicon';
import RemoveFromAssetsIcon from 'web/components/icon/removefromassetsicon';
import ResultIcon from 'web/components/icon/resulticon';
import TaskIcon from 'web/components/icon/taskicon';
import TlsCertificateIcon from 'web/components/icon/tlscertificateicon';
import VulnerabilityIcon from 'web/components/icon/vulnerabilityicon';
import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';
import PropTypes from 'web/utils/proptypes';

import AlertActions from './alertactions';

const ToolBarIcons = ({
  audit = false,
  delta = false,
  filter,
  isLoading,
  report,
  reportId,
  showThresholdMessage,
  task,
  threshold,
  onAddToAssetsClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  showError,
  showErrorMessage,
  showSuccessMessage,
  onInteraction,
}) => (
  <Divider margin="15px">
    <IconDivider>
      <ManualIcon
        anchor="reading-a-report"
        page="reports"
        title={_('Help: Reading Reports')}
      />
      {audit ? (
        <ListIcon page="auditreports" title={_('Audit Reports List')} />
      ) : (
        <ListIcon page="reports" title={_('Reports List')} />
      )}
    </IconDivider>
    {!isLoading && (
      <React.Fragment>
        <IconDivider>
          <AddToAssetsIcon
            title={_('Add to Assets with QoD=>70% and Overrides enabled')}
            onClick={onAddToAssetsClick}
          />
          <RemoveFromAssetsIcon
            title={_('Remove from Assets')}
            onClick={onRemoveFromAssetsClick}
          />
        </IconDivider>
        <IconDivider>
          <DetailsLink
            id={isDefined(task) ? task.id : ''}
            textOnly={!isDefined(task)}
            title={_('Corresponding Task')}
            type="task"
          >
            <TaskIcon />
          </DetailsLink>
          <Link
            filter={'report_id=' + reportId}
            title={_('Corresponding Results')}
            to="results"
          >
            <ResultIcon />
          </Link>
          {!audit && (
            <Link
              filter={'report_id=' + reportId}
              title={_('Corresponding Vulnerabilities')}
              to="vulnerabilities"
            >
              <VulnerabilityIcon />
            </Link>
          )}
          {!delta && (
            <Link
              filter={'report_id=' + reportId}
              title={_('Corresponding TLS Certificates')}
              to="tlscertificates"
            >
              <TlsCertificateIcon />
            </Link>
          )}
          {isDefined(task) && !task.isContainer() && (
            <Link
              query={{
                start: isDefined(report.scan_start)
                  ? report.scan_start.toISOString()
                  : undefined,
                end: isDefined(report.scan_end)
                  ? report.scan_end.toISOString()
                  : undefined,
                ...(isDefined(report.slave) && {scanner: report.slave.id}),
              }}
              title={_('Corresponding Performance')}
              to="performance"
            >
              <PerformanceIcon />
            </Link>
          )}
        </IconDivider>
        <IconDivider>
          <DownloadIcon
            title={_('Download filtered Report')}
            onClick={onReportDownloadClick}
          />
          {!delta && (
            <AlertActions
              filter={filter}
              reportId={reportId}
              showError={showError}
              showErrorMessage={showErrorMessage}
              showSuccessMessage={showSuccessMessage}
              showThresholdMessage={showThresholdMessage}
              threshold={threshold}
              onInteraction={onInteraction}
            />
          )}
        </IconDivider>
      </React.Fragment>
    )}
  </Divider>
);

ToolBarIcons.propTypes = {
  audit: PropTypes.bool,
  delta: PropTypes.bool,
  filter: PropTypes.filter,
  isLoading: PropTypes.bool,
  report: PropTypes.shape({
    scan_end: PropTypes.date,
    scan_start: PropTypes.date,
    slave: PropTypes.shape({
      id: PropTypes.id.isRequired,
    }),
  }),
  reportId: PropTypes.id.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  showThresholdMessage: PropTypes.bool,
  task: PropTypes.model,
  threshold: PropTypes.number,
  onAddToAssetsClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
};

export default ToolBarIcons;
