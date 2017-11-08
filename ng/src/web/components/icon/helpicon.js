/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import {is_defined, capitalize_first_letter} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import Icon from './icon.js';

const HelpIcon = ({
  anchor,
  gmp,
  page,
  title,
  ...other
}) => {
  const params = {
    token: gmp.token,
  };

  const path = 'help/' + page + '.html';

  if (!is_defined(title)) {
    title = _('Help: {{pagename}}', {pagename: capitalize_first_letter(page)});
  }

  const url = gmp.buildUrl(path, params, anchor);
  return (
    <Icon
      img="help.svg"
      href={url}
      title={title}
      {...other}/>
  );
};

HelpIcon.propTypes = {
  anchor: PropTypes.string,
  gmp: PropTypes.gmp.isRequired,
  page: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default withGmp(HelpIcon);

// vim: set ts=2 sw=2 tw=80:

