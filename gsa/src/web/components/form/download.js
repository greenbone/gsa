/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

class Download extends React.Component {
  componentWillUnmount() {
    this.release();
  }

  release() {
    if (this.obj_url) {
      window.URL.revokeObjectURL(this.obj_url);
    }
  }

  setFilename(name) {
    this.anchor.download = name;
  }

  setData(data, mimetype = 'application/octet-stream') {
    const blob = new Blob([data], {type: mimetype});

    this.release();

    this.obj_url = window.URL.createObjectURL(blob);

    this.anchor.href = this.obj_url;
  }

  download() {
    this.anchor.click();
  }

  render() {
    const {filename} = this.props;
    return (
      <a
        download={filename}
        aria-hidden
        ref={ref => (this.anchor = ref)}
        style={{display: 'none'}}
      >
        Download
      </a>
    );
  }
}

Download.propTypes = {
  filename: PropTypes.string,
};

export default Download;

// vim: set ts=2 sw=2 tw=80:
