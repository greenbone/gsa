/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from 'gmp/log';
import {hasValue} from 'gmp/utils/identity';
import React, {useRef, useCallback} from 'react';
import Download from 'web/components/form/Download';

const log = logger.getLogger('web.components.form.useDownload');

type DownloadParams = {
  filename: string;
  data: string;
  mimetype?: string;
};

export type DownloadFunc = (params: DownloadParams) => void;

/**
 * Hook to download a file
 *
 * Should be used in combination with the Download component
 *
 * @returns Array of downloadRef and download function
 */
const useDownload = (): [
  React.MutableRefObject<Download | null>,
  DownloadFunc,
] => {
  const downloadRef = useRef<Download | null>(null);

  const download = useCallback(({filename, data, mimetype}: DownloadParams) => {
    if (!hasValue(downloadRef.current)) {
      log.warn('Download ref not set.');
      return;
    }

    downloadRef.current.setFilename(filename);
    downloadRef.current.setData(data, mimetype);
    downloadRef.current.download();
  }, []);
  return [downloadRef, download];
};

export default useDownload;
