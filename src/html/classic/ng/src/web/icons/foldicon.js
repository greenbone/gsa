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

import _ from '../../locale.js';

import Icon from './icon.js';

import {FoldState} from '../folding.js';

export const FoldIcon = (props, context) => {
  let {foldState, onFoldToggle, ...other} = props;
  let folded = (foldState === FoldState.FOLDED ||
      foldState === FoldState.FOLDING ||
      foldState === FoldState.FOLDING_START);
  let url = '';
  let img = folded ? 'unfold.svg' : 'fold.svg';
  let title = folded ? _('Unfold') : _('Fold');

  return (
    <Icon img={img} href={url} title={title} onClick={onFoldToggle} {...other}/>
  );
};

FoldIcon.propTypes = {
  title: React.PropTypes.string,
  onFoldToggle: React.PropTypes.func,
  page: React.PropTypes.string,
};

FoldIcon.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default FoldIcon;

// vim: set ts=2 sw=2 tw=80:

