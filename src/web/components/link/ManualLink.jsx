/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import BlankLink from 'web/components/link/BlankLink';
import useManualURL from 'web/hooks/useManualURL';
import PropTypes from 'web/utils/PropTypes';

const ManualLink = ({anchor, page, searchTerm, lang, highlight, ...props}) => {
  const manualURL = useManualURL(lang);

  let url = manualURL + '/' + page + '.html';

  if (page === 'search' && isDefined(searchTerm)) {
    url += '?q=' + searchTerm;
  } else if (isDefined(highlight)) {
    url += '?highlight=' + highlight;
  } else if (isDefined(anchor)) {
    url += '#' + anchor;
  }
  return <BlankLink {...props} to={url} />;
};

ManualLink.propTypes = {
  anchor: PropTypes.string,
  highlight: PropTypes.string,
  lang: PropTypes.string,
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string,
};

export default ManualLink;
