/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useRef, useCallback} from 'react';

import logger from 'gmp/log';

import {hasValue} from 'gmp/utils/identity';

const log = logger.getLogger('web.components.form.useDownload');

/**
 * Hook to download a file
 *
 * Should be used in combination with the Download component
 *
 * @returns Array of downloadRef and download function
 */
const useDownload = () => {
  const downloadRef = useRef(null);

  const download = useCallback(({filename, data, mimetype}) => {
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
