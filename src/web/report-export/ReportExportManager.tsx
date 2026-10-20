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

interface ReportExportManagerContextValue {
  exportReport: (params: StartReportExportParams) => Promise<boolean>;
  cancel: (key: string) => Promise<void>;
  dismiss: (key: string) => void;
  retry: (key: string) => Promise<void>;
  clearFinished: () => void;
  isActive: boolean;
  supportsCancellation: boolean;
  activityOpen: boolean;
  setActivityOpen: Dispatch<SetStateAction<boolean>>;
  jobs: ReportExportJob[];
}

interface ReportExportManagerProps {
  children: ReactNode;
}

const ReportExportManagerContext = createContext<
  ReportExportManagerContextValue | undefined
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
  const contextValue = useMemo(
    () => ({
      exportReport: (params: StartReportExportParams) =>
        reportExport.start(params),
      cancel: (key: string) =>
        supportsCancellation ? reportExport.cancel(key) : Promise.resolve(),
      dismiss: reportExport.dismiss,
      retry: reportExport.retry,
      clearFinished: reportExport.clearFinished,
      isActive: reportExport.isActive,
      supportsCancellation,
      activityOpen,
      setActivityOpen,
      jobs: reportExport.jobs,
    }),
    [activityOpen, reportExport, supportsCancellation],
  );

  return (
    <ReportExportManagerContext value={contextValue}>
      <Download ref={downloadRef} onClick={event => event.stopPropagation()} />
      {children}
    </ReportExportManagerContext>
  );
};

export const useReportExportManager = () => {
  const context = useContext(ReportExportManagerContext);
  if (!context) {
    throw new Error(
      'useReportExportManager must be used within ReportExportManager',
    );
  }
  return context;
};

export default ReportExportManager;
