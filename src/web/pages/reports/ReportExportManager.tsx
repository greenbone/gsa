/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import useReportExport, {
  type ReportExportJob,
  type StartReportExportParams,
} from 'web/hooks/useReportExport';
import useTranslation from 'web/hooks/useTranslation';
import {selectExportTransport} from 'web/report-export/route';

interface ReportExportManagerContextValue {
  exportReport: (
    params: StartReportExportParams,
    format?: {content_type?: string},
  ) => Promise<boolean>;
  start: (params: StartReportExportParams) => Promise<boolean>;
  startDirect: (params: StartReportExportParams) => boolean;
  cancel: (key: string) => Promise<void>;
  dismiss: (key: string) => void;
  retry: (key: string) => Promise<void>;
  download: (key: string) => Promise<void>;
  discoveryError: Error | null;
  discoveryIncomplete: boolean;
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
  const activityOpenRef = useRef(activityOpen);
  useEffect(() => {
    activityOpenRef.current = activityOpen;
  }, [activityOpen]);
  const capabilities = useContext(CapabilitiesContext);
  const supportsCancellation =
    capabilities?.mayOp('cancel_report_export') ?? false;
  const handleDownload = useCallback(
    (data: ArrayBuffer | string, filename: string, mimetype?: string) => {
      if (!downloadRef.current) throw new Error('Download is unavailable');
      downloadRef.current.setFilename(filename);
      downloadRef.current.setData(data, mimetype);
      downloadRef.current.download();
      if (!activityOpenRef.current) {
        showSuccessNotification('', _('Report download started.'));
      }
    },
    [_],
  );
  const reportExport = useReportExport({
    onDownload: handleDownload,
    onError: error => {
      if (!activityOpenRef.current) showErrorNotification(error.message);
    },
  });
  const {refreshDiscovery} = reportExport;
  useEffect(() => {
    if (activityOpen) refreshDiscovery();
  }, [activityOpen, refreshDiscovery]);
  const cancel = useCallback(
    (key: string) =>
      supportsCancellation ? reportExport.cancel(key) : Promise.resolve(),
    [reportExport, supportsCancellation],
  );
  const contextValue = useMemo(
    () => ({
      exportReport: async (
        params: StartReportExportParams,
        format?: {content_type?: string},
      ) =>
        selectExportTransport(params.kind, format, capabilities) === 'async'
          ? reportExport.start(params)
          : reportExport.startDirect(params),
      start: reportExport.start,
      startDirect: reportExport.startDirect,
      cancel,
      dismiss: reportExport.dismiss,
      retry: reportExport.retry,
      download: reportExport.download,
      discoveryError: reportExport.discoveryError,
      discoveryIncomplete: reportExport.discoveryIncomplete,
      isActive: reportExport.isActive,
      supportsCancellation,
      activityOpen,
      setActivityOpen,
      jobs: reportExport.jobs,
    }),
    [
      activityOpen,
      cancel,
      capabilities,
      reportExport,
      setActivityOpen,
      supportsCancellation,
    ],
  );

  return (
    <ReportExportManagerContext.Provider value={contextValue}>
      <Download ref={downloadRef} onClick={event => event.stopPropagation()} />
      {children}
    </ReportExportManagerContext.Provider>
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
