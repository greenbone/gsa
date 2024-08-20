/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {getLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';

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

const ManualLink = ({anchor, page, searchTerm, lang, ...props}) => {
  const gmp = useGmp();
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
  lang: PropTypes.string,
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string,
};

export default ManualLink;

// vim: set ts=2 sw=2 tw=80:
