/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isActive, TASK_STATUS, type TaskStatus} from 'gmp/models/task';
import {RefreshIcon, TargetIcon, TaskIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import InfoPanel from 'web/components/panel/InfoPanel';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import ReportPanel from 'web/pages/reports/details/ReportPanel';

interface EmptyReportProps {
  'data-test-id'?: string;
  hasTarget?: boolean;
  progress?: number;
  status: TaskStatus;
  onTargetEditClick: () => void;
}

const EmptyReport = ({
  'data-test-id': dataTestId = 'empty-report',
  hasTarget = false,
  progress = 0,
  status,
  onTargetEditClick,
}: EmptyReportProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const mayEditTarget = capabilities.mayEdit('target');
  const isActiveReport = hasTarget && isActive(status);
  return (
    <Divider
      grow
      align={['start', 'stretch']}
      data-testid={dataTestId}
      flex="column"
    >
      {/* @ts-expect-error */}
      <InfoPanel
        heading={_(
          'The Report is empty. This can happen for the following ' +
            'reasons:',
        )}
      />
      <Divider wrap>
        {!isActiveReport && (
          <>
            <ReportPanel
              icon={props => <TaskIcon {...props} />}
              title={_('The scan did not collect any results')}
            >
              {_(
                'If the scan got interrupted you can try to re-start the task.',
              )}
            </ReportPanel>
            <ReportPanel
              icon={props => <TargetIcon {...props} />}
              title={_('The target hosts could be regarded dead')}
              onClick={mayEditTarget ? onTargetEditClick : undefined}
            >
              {_(
                'You should change the Alive Test Method of the ' +
                  'target for the next scan. However, if the target hosts ' +
                  'are indeed dead, the scan duration might increase ' +
                  'significantly.',
              )}
            </ReportPanel>
          </>
        )}
        {isActiveReport && progress === 1 && (
          <ReportPanel
            icon={props => <RefreshIcon {...props} />}
            title={_('The scan just started and no results have arrived yet')}
          >
            {_('Just wait for results to arrive.')}
          </ReportPanel>
        )}
        {isActiveReport && progress > 1 && (
          <ReportPanel
            icon={props => <RefreshIcon {...props} />}
            title={_(
              'The scan is still running and no results have arrived yet',
            )}
          >
            {_('Just wait for results to arrive.')}
          </ReportPanel>
        )}
        {progress < 1 && hasTarget && status !== TASK_STATUS.interrupted && (
          <ReportPanel
            icon={props => <TargetIcon {...props} />}
            title={_('The target hosts could be regarded dead')}
            onClick={mayEditTarget ? onTargetEditClick : undefined}
          >
            {_(
              'You should change the Alive Test Method of the ' +
                'target for the next scan. However, if the target hosts ' +
                'are indeed dead, the scan duration might increase ' +
                'significantly.',
            )}
          </ReportPanel>
        )}
      </Divider>
    </Divider>
  );
};

export default EmptyReport;
