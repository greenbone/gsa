/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useEffect} from 'react';
import useGmp from 'web/hooks/useGmp';
import {applianceTitle} from 'web/utils/applianceData';
import PropTypes from 'web/utils/PropTypes';

const PageTitle = ({title}) => {
  const gmp = useGmp();
  const vendorLabel = gmp?.settings?.vendorLabel || 'defaultVendorLabel';
  const defaultTitle =
    applianceTitle[vendorLabel] || 'Greenbone Security Assistant';

  useEffect(() => {
    if (isDefined(title)) {
      document.title = defaultTitle + ' - ' + title;
    } else {
      document.title = defaultTitle;
    }

    return () => {
      document.title = defaultTitle;
    };
  }, [defaultTitle, title]);

  return null;
};

PageTitle.propTypes = {
  title: PropTypes.string,
};

export default PageTitle;
