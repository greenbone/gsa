/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@greenbone/ui-lib';
import Download from 'web/components/form/Download';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';
import useTranslation from 'web/hooks/useTranslation';
import useReportExport, {
  type ReportExportJob,
  type StartReportExportParams,
} from 'web/report-export/useReportExports';

interface ReportExportActionsContextValue {
  exportReport: (params: StartReportExportParams) => Promise<boolean>;
  cancel: (key: string) => Promise<void>;
  dismiss: (key: string) => void;
  retry: (key: string) => Promise<void>;
  clearFinished: () => void;
  supportsCancellation: boolean;
}

interface ReportExportActivityContextValue {
  isActive: boolean;
  activityOpen: boolean;
  setActivityOpen: Dispatch<SetStateAction<boolean>>;
  jobs: ReportExportJob[];
}

interface ReportExportManagerProps {
  children: ReactNode;
}

const ReportExportActionsContext = createContext<
  ReportExportActionsContextValue | undefined
>(undefined);

const ReportExportActivityContext = createContext<
  ReportExportActivityContextValue | undefined
>(undefined);

const ReportExportManager = ({children}: ReportExportManagerProps) => {
  const [_] = useTranslation();
  const [activityOpen, setActivityOpen] = useState(false);
  const downloadRef = useRef<Download>(null);
  const capabilities = useContext(CapabilitiesContext);
  const supportsCancellation =
    capabilities?.mayOp('get_report_exports') ?? false;
  const handleDownload = useCallback(
    (data: ArrayBuffer | string, filename: string, mimetype?: string) => {
      if (!downloadRef.current) throw new Error('Download is unavailable');
      downloadRef.current.setFilename(filename);
      downloadRef.current.setData(data, mimetype);
      downloadRef.current.download();
      if (!activityOpen) {
        showSuccessNotification('', _('Report download started.'));
      }
    },
    [activityOpen, _],
  );
  const reportExport = useReportExport({
    onDownload: handleDownload,
    onError: error => {
      if (!activityOpen) showErrorNotification(error.message);
    },
  });
  const {start, cancel, dismiss, retry, clearFinished} = reportExport;
  const cancelAction = useCallback(
    (key: string) => (supportsCancellation ? cancel(key) : Promise.resolve()),
    [cancel, supportsCancellation],
  );
  // Actions are stable callbacks; consumers of only exportReport must not
  // re-render on activity updates.
  const actionsContextValue = useMemo(
    () => ({
      exportReport: start,
      cancel: cancelAction,
      dismiss,
      retry,
      clearFinished,
      supportsCancellation,
    }),
    [start, cancelAction, dismiss, retry, clearFinished, supportsCancellation],
  );
  const activityContextValue = useMemo(
    () => ({
      isActive: reportExport.isActive,
      activityOpen,
      setActivityOpen,
      jobs: reportExport.jobs,
    }),
    [reportExport.isActive, reportExport.jobs, activityOpen],
  );

  return (
    <ReportExportActionsContext value={actionsContextValue}>
      <ReportExportActivityContext value={activityContextValue}>
        <Download
          ref={downloadRef}
          onClick={event => event.stopPropagation()}
        />
        {children}
      </ReportExportActivityContext>
    </ReportExportActionsContext>
  );
};

export const useReportExportActions = () => {
  const context = useContext(ReportExportActionsContext);
  if (!context) {
    throw new Error(
      'useReportExportActions must be used within ReportExportManager',
    );
  }
  return context;
};

export const useReportExportActivityState = () => {
  const context = useContext(ReportExportActivityContext);
  if (!context) {
    throw new Error(
      'useReportExportActivityState must be used within ReportExportManager',
    );
  }
  return context;
};

export default ReportExportManager;
