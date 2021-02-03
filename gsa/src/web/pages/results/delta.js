/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import React from 'react';

import _ from 'gmp/locale';

import {Delta} from 'gmp/models/result';

import PropTypes from 'web/utils/proptypes';

const ResultDelta = ({delta}) => {
  switch (delta.delta_type) {
    case Delta.TYPE_NEW:
      return <span title={_('New')}>[ + ]</span>;
    case Delta.TYPE_CHANGED:
      return <span title={_('Changed')}>[ ~ ]</span>;
    case Delta.TYPE_GONE:
      return <span title={_('Gone')}>[ &#8722; ]</span>;
    case Delta.TYPE_SAME:
      return <span title={_('Same')}>[ = ]</span>;
    default:
      return null;
  }
};

ResultDelta.propTypes = {
  delta: PropTypes.object.isRequired,
};

export default ResultDelta;

// vim: set ts=2 sw=2 tw=80:
