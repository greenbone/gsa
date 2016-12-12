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

import _ from '../locale.js';
import {is_defined, capitalize_first_letter} from '../utils.js';

import Icon from './icon.js';

export const HelpIcon = (props, context) => {
  let {page, title, ...other} = props;
  let path = 'help/' + page + '.html';
  let {gmp} = context;
  let params = {
    token: gmp.token,
  };

  if (!is_defined(title)) {
    title = _('Help: {{pagename}}', {pagename: capitalize_first_letter(page)});
  }

  let url = gmp.buildUrl(path, params);
  return (
    <Icon img="help.svg" href={url} title={title} {...other}/>
  );
};

HelpIcon.propTypes = {
  title: React.PropTypes.string,
  page: React.PropTypes.string,
};

HelpIcon.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default HelpIcon;

// vim: set ts=2 sw=2 tw=80:

