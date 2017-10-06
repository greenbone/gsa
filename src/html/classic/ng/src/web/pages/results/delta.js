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

import _ from 'gmp/locale.js';

import {Delta} from 'gmp/models/result.js';

import PropTypes from '../../utils/proptypes.js';

const ResultDelta = ({delta}) => {
  switch (delta.delta_type) {
    case Delta.TYPE_NEW:
      return (
        <span title={_('New')}>
          [ + ]
        </span>
      );
    case Delta.TYPE_CHANGED:
      return (
        <span title={_('Changed')}>
          [ ~ ]
        </span>
      );
    case Delta.TYPE_GONE:
      return (
        <span title={_('Gone')}>
          [ \u2212 ]
        </span>
      );
    case Delta.TYPE_SAME:
      return (
        <span title={_('Same')}>
          [ = ]
        </span>
      );
    default:
      return null;
  }
};

ResultDelta.propTypes = {
  delta: PropTypes.object.isRequired,
};

export default ResultDelta;

// vim: set ts=2 sw=2 tw=80:
