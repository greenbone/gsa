/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';

const defaultTitle = 'Greenbone Security Assistant';

const PageTitle = ({title}) => {
  useEffect(() => {
    if (isDefined(title)) {
      document.title = defaultTitle + ' - ' + title;
    } else {
      document.title = defaultTitle;
    }

    return () => {
      document.title = defaultTitle;
    };
  }, [title]);
  return null;
};

PageTitle.propTypes = {
  title: PropTypes.string,
};

export default PageTitle;
