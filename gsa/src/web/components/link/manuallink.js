/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import 'core-js/fn/string/starts-with';

import React from 'react';

import {getLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import BlankLink from './blanklink';

const LANGUAGE_MAPPING = {
  de: 'de',
};

const DEFAULT_LANGUAGE_PATH = 'en';

const getLanguagePath = (
  lang = getLocale(),
  languageMapping = LANGUAGE_MAPPING,
) => {
  if (!isDefined(lang)) {
    return DEFAULT_LANGUAGE_PATH;
  }

  const code = lang.slice(0, 2);
  const path = languageMapping[code];

  return isDefined(path) ? path : DEFAULT_LANGUAGE_PATH;
};

const ManualLink = ({anchor, gmp, page, searchTerm, lang, ...props}) => {
  const {manualUrl, manualLanguageMapping} = gmp.settings;

  let url = manualUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }

  url += getLanguagePath(lang, manualLanguageMapping) + '/' + page + '.html';

  if (page === 'search' && isDefined(searchTerm)) {
    url += '?q=' + searchTerm;
  } else if (isDefined(anchor)) {
    url += '#' + anchor;
  }
  return <BlankLink {...props} to={url} />;
};

ManualLink.propTypes = {
  anchor: PropTypes.string,
  gmp: PropTypes.gmp.isRequired,
  lang: PropTypes.string,
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string,
};

export default withGmp(ManualLink);

// vim: set ts=2 sw=2 tw=80:
