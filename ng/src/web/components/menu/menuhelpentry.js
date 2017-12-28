/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {get_language} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import MenuEntry from './menuentry.js';

const LANGUAGE_MAPPING = {};
const DEFAULT_LANGUAGE_PATH = 'en';

const get_language_path = () => {
  const lang = get_language();

  if (!is_defined(lang)) {
    return DEFAULT_LANGUAGE_PATH;
  }

  const code = lang.slice(0, 1);
  const path = LANGUAGE_MAPPING[code];

  return is_defined(path) ? path : DEFAULT_LANGUAGE_PATH;
};

const MenuHelpEntry = ({
    gmp,
    title,
    ...other
  }) => {

    const {manualurl} = gmp.globals;
    let url = manualurl;
    if (!url.endsWith('/')) {
      url += '/';
    }

    url += get_language_path() + '/index.html';

    return (
      <MenuEntry
        to={url}
        title={title}
        manualLink={true}
      />
    );
};

MenuHelpEntry.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  title: PropTypes.string.isRequired,
};

export default withGmp(MenuHelpEntry);

// vim: set ts=2 sw=2 tw=80:
