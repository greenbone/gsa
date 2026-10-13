/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type default as React, useRef, useCallback} from 'react';
import logger from 'gmp/log';
import {hasValue} from 'gmp/utils/identity';
import Download, {type DownloadData} from 'web/components/form/Download';

interface DownloadParams {
  filename: string;
  data: DownloadData;
  mimetype?: string;
}

export type DownloadFunc = (params: DownloadParams) => void;

const log = logger.getLogger('web.components.form.useDownload');

/**
 * Hook to download a file
 *
 * Should be used in combination with the Download component
 *
 * @returns Object containing the download function and download component
 */
const useDownload = (): {
  download: DownloadFunc;
  downloadComponent: React.ReactElement<Download>;
} => {
  const downloadRef = useRef<Download | null>(null);
  const downloadComponent = <Download ref={downloadRef} />;

  const download = useCallback(({filename, data, mimetype}: DownloadParams) => {
    if (!hasValue(downloadRef.current)) {
      log.warn('Download ref not set.');
      return;
    }

    downloadRef.current.setFilename(filename);
    downloadRef.current.setData(data, mimetype);
    downloadRef.current.download();
  }, []);
  return {download, downloadComponent};
};

export default useDownload;
