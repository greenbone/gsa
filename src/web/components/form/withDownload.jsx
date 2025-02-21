/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Download from 'web/components/form/Download';

const withDownload = Component => {
  class DownloadWrapper extends React.Component {
    constructor(...args) {
      super(...args);

      this.handleDownload = this.handleDownload.bind(this);
    }

    handleDownload({filename, data, mimetype}) {
      this.download.setFilename(filename);
      this.download.setData(data, mimetype);
      this.download.download();
    }

    render() {
      return (
        <React.Fragment>
          <Component {...this.props} onDownload={this.handleDownload} />
          <Download ref={ref => (this.download = ref)} />
        </React.Fragment>
      );
    }
  }

  return DownloadWrapper;
};

export default withDownload;
