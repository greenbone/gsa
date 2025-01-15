/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import useManualURL from 'web/hooks/useManualURL';
import PropTypes from 'web/utils/proptypes';

import BlankLink from './blanklink';

const ManualLink = ({anchor, page, searchTerm, lang, ...props}) => {
  const manualURL = useManualURL(lang);

  let url = manualURL + '/' + page + '.html';

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
