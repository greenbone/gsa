/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Download from 'web/components/form/Download';
import useDownload, {DownloadFunc} from 'web/components/form/useDownload';

interface DownloadProps {
  onDownload: DownloadFunc;
}

const withDownload =
  <P extends {}>(Component: React.ComponentType<P & DownloadProps>) =>
  (props: P) => {
    const [ref, download] = useDownload();
    return (
      <>
        <Download ref={ref} />
        <Component {...props} onDownload={download} />
      </>
    );
  };

export default withDownload;
