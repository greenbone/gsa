/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

interface DownloadProps {
  filename?: string;
}

export type DownloadData = string | ArrayBuffer;

class Download extends React.Component<DownloadProps> {
  obj_url: string | undefined;
  anchor: HTMLAnchorElement | null = null;

  componentWillUnmount() {
    this.release();
  }

  release() {
    if (this.obj_url) {
      window.URL.revokeObjectURL(this.obj_url);
    }
  }

  setFilename(name: string) {
    if (!this.anchor) {
      throw new Error('Anchor element not referenced');
    }

    this.anchor.download = name;
  }

  setData(data: DownloadData, mimetype: string = 'application/octet-stream') {
    const blob = new Blob([data], {type: mimetype});

    this.release();

    this.obj_url = window.URL.createObjectURL(blob);

    if (!this.anchor) {
      throw new Error('Anchor element not referenced');
    }

    this.anchor.href = this.obj_url;
  }

  download() {
    if (!this.anchor) {
      throw new Error('Anchor element not referenced');
    }

    this.anchor.click();
  }

  render() {
    const {filename} = this.props;
    return (
      <a
        ref={ref => (this.anchor = ref)}
        aria-hidden
        download={filename}
        style={{display: 'none'}}
      >
        Download
      </a>
    );
  }
}

export default Download;
