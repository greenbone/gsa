/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useDownload, {type DownloadFunc} from 'web/components/form/useDownload';
import {updateDisplayName} from 'web/utils/display-name';

interface DownloadProps {
  onDownload: DownloadFunc;
}

const withDownload = <P extends {}>(
  Component: React.ComponentType<P & DownloadProps>,
) => {
  const WithDownloadComponent = (props: P) => {
    const {downloadComponent, download} = useDownload();
    return (
      <>
        <Component {...props} onDownload={download} />
        {downloadComponent}
      </>
    );
  };
  return updateDisplayName(WithDownloadComponent, Component, 'withDownload');
};

export default withDownload;
