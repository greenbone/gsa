/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {extend, is_defined} from '../utils.js';

export class LegacyLink extends React.Component {

  render() {
    let {children, path, className, cmd, title, ...params} = this.props;

    let {gmp} = this.context;
    let iparams = {
      token: gmp.token,
    };

    if (is_defined(cmd)) {
      iparams.cmd = cmd;

      if (!is_defined(path)) {
        path = 'omp';
      }
    }

    let url = gmp.buildUrl(path, extend({}, params, iparams));
    return (
      <a href={url}
        className={className}
        title={title}>
        {children}
      </a>
    );
  }
}

LegacyLink.propTypes = {
  className: React.PropTypes.string,
  cmd: React.PropTypes.string,
  path: React.PropTypes.string,
  params: React.PropTypes.object,
  title: React.PropTypes.string,
};

LegacyLink.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default LegacyLink;

// vim: set ts=2 sw=2 tw=80:
