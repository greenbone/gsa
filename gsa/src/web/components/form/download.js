/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import PropTypes from '../../utils/proptypes.js';

class Download extends React.Component {

  setFileName(name) {
    this.anchor.download = name;
  }

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

  setData(data) {
    const blob = new Blob([data], {type: 'application/octet-stream'});

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
        ref={ref => this.anchor = ref}
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
