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

import {FoldState} from 'web/components/folding/folding';

import PropTypes from 'web/utils/proptypes';

import UnfoldIcon from './unfoldicon';
import FoldIcon from './foldicon';

const FoldStateIcon = ({foldState, ...props}) => {
  const folded =
    foldState === FoldState.FOLDED ||
    foldState === FoldState.FOLDING ||
    foldState === FoldState.FOLDING_START;

  if (folded) {
    return <FoldIcon title={_('Unfold')} {...props} />;
  }

  return <UnfoldIcon title={_('Fold')} {...props} />;
};

FoldStateIcon.propTypes = {
  foldState: PropTypes.string,
  title: PropTypes.string,
};

export default FoldStateIcon;

// vim: set ts=2 sw=2 tw=80:
