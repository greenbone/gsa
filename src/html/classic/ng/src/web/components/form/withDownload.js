/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Download from './download.js';

import Layout from '../layout/layout.js';

const withDownload = Component => {

  class DownloadWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.handleDownload = this.handleDownload.bind(this);
    }

    handleDownload({filename, data}) {
      this.download.setFilename(filename);
      this.download.setData(data);
      this.download.download();
    }

    render() {
      return (
        <Layout>
          <Component
            {...this.props}
            onDownload={this.handleDownload}
          />
          <Download
            ref={ref => this.download = ref}
          />
        </Layout>
      );
    }
  }

  return DownloadWrapper;
};

export default withDownload;

// vim: set ts=2 sw=2 tw=80:
