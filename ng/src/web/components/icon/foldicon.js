/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import {FoldState} from '../folding/folding.js';

import Icon from './icon.js';

export const FoldIcon = ({
    foldState,
    title,
    ...other,
  }) => {
  let folded = foldState === FoldState.FOLDED ||
      foldState === FoldState.FOLDING ||
      foldState === FoldState.FOLDING_START;
  let img = folded ? 'unfold.svg' : 'fold.svg';

  if (!is_defined(title)) {
    title = folded ? _('Unfold') : _('Fold');
  }

  return (
    <Icon
      {...other}
      img={img}
      title={title}/>
  );
};

FoldIcon.propTypes = {
  foldState: PropTypes.string,
  title: PropTypes.string,
};

export default FoldIcon;

// vim: set ts=2 sw=2 tw=80:

