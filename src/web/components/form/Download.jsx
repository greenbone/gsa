/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/PropTypes';

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

Download.propTypes = {
  filename: PropTypes.string,
};

export default Download;
