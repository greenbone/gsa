/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Dialog from 'web/components/dialog/Dialog';
import DialogTwoButtonFooter from 'web/components/dialog/DialogTwoButtonFooter';
import {type ReportExportState} from 'web/hooks/useReportExport';
import useTranslation from 'web/hooks/useTranslation';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

interface ReportExportProgressDialogProps {
  state: ReportExportState;
  onCancel: () => void;
  onClose: () => void;
}

const ReportExportProgressDialog = ({
  state,
  onCancel,
  onClose,
}: ReportExportProgressDialogProps) => {
  const [_] = useTranslation();
  const isCancelable =
    state.status === 'creating' ||
    state.status === 'pending' ||
    state.status === 'running' ||
    state.status === 'cancel_requested';
  const progress = state.exportData?.progress;
  const error = state.status === 'error' ? state.error.message : undefined;

  return (
    <Dialog
      footer={
        <DialogTwoButtonFooter
          isLoading={state.status === 'creating'}
          leftButtonTitle={_('Close')}
          rightButtonDisabled={!isCancelable}
          rightButtonTitle={_('Cancel Export')}
          onLeftButtonClick={onClose}
          onRightButtonClick={onCancel}
        />
      }
      title={_('Report Export')}
      onClose={onClose}
    >
      <Content data-testid="report-export-progress">
        <strong>{_('Status: {{status}}', {status: state.status})}</strong>
        {progress && (
          <span>
            {_('Progress: {{progress}}', {progress: String(progress)})}
          </span>
        )}
        {error && <span role="alert">{error}</span>}
        {!isCancelable && state.status !== 'error' && (
          <span>{_('The report export is no longer running.')}</span>
        )}
      </Content>
    </Dialog>
  );
};

export default ReportExportProgressDialog;
