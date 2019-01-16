/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import {FoldState} from 'web/components/folding/folding';

import Icon from './icon';

export const FoldIcon = ({
    foldState,
    title,
    ...other
  }) => {
  const folded = foldState === FoldState.FOLDED ||
      foldState === FoldState.FOLDING ||
      foldState === FoldState.FOLDING_START;
  const img = folded ? 'unfold.svg' : 'fold.svg';

  if (!isDefined(title)) {
    title = folded ? _('Unfold') : _('Fold');
  }

  return (
    <Icon
      {...other}
      img={img}
      title={title}
    />
  );
};

FoldIcon.propTypes = {
  foldState: PropTypes.string,
  title: PropTypes.string,
};

export default FoldIcon;

// vim: set ts=2 sw=2 tw=80:
