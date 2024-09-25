/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import AddToAssetsIcon from 'web/components/icon/addtoassetsicon';
import DownloadIcon from 'web/components/icon/downloadicon';
import VulnerabilityIcon from 'web/components/icon/vulnerabilityicon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import PerformanceIcon from 'web/components/icon/performanceicon';
import RemoveFromAssetsIcon from 'web/components/icon/removefromassetsicon';
import ResultIcon from 'web/components/icon/resulticon';
import TaskIcon from 'web/components/icon/taskicon';
import TlsCertificateIcon from 'web/components/icon/tlscertificateicon';

import IconDivider from 'web/components/layout/icondivider';

import Divider from 'web/components/layout/divider';

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
        page="reports"
        anchor="reading-a-report"
        title={_('Help: Reading Reports')}
      />
      {audit ? (
        <ListIcon title={_('Audit Reports List')} page="auditreports" />
      ) : (
        <ListIcon title={_('Reports List')} page="reports" />
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
            type="task"
            textOnly={!isDefined(task)}
            id={isDefined(task) ? task.id : ''}
            title={_('Corresponding Task')}
          >
            <TaskIcon />
          </DetailsLink>
          <Link
            to="results"
            filter={'report_id=' + reportId}
            title={_('Corresponding Results')}
          >
            <ResultIcon />
          </Link>
          {!audit && (
            <Link
              to="vulnerabilities"
              filter={'report_id=' + reportId}
              title={_('Corresponding Vulnerabilities')}
            >
              <VulnerabilityIcon />
            </Link>
          )}
          {!delta && (
            <Link
              to="tlscertificates"
              filter={'report_id=' + reportId}
              title={_('Corresponding TLS Certificates')}
            >
              <TlsCertificateIcon />
            </Link>
          )}
          {isDefined(task) && !task.isContainer() && (
            <Link
              to="performance"
              title={_('Corresponding Performance')}
              query={{
                start: isDefined(report.scan_start)
                  ? report.scan_start.toISOString()
                  : undefined,
                end: isDefined(report.scan_end)
                  ? report.scan_end.toISOString()
                  : undefined,
                ...(isDefined(report.slave) && {scanner: report.slave.id}),
              }}
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
              showSuccessMessage={showSuccessMessage}
              showErrorMessage={showErrorMessage}
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
