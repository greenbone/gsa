/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import {applianceTitle} from 'web/utils/applianceData';
import PropTypes from 'web/utils/PropTypes';

export const DEFAULT_TITLE = 'Greenbone Security Assistant';

const PageTitle = ({title: pageTitle}) => {
  const gmp = useGmp();
  const vendorLabel = gmp?.settings?.vendorLabel || 'defaultVendorLabel';
  const vendorTitle = gmp?.settings?.vendorTitle;
  const title = vendorTitle ?? applianceTitle[vendorLabel] ?? DEFAULT_TITLE;

  useEffect(() => {
    if (isDefined(pageTitle)) {
      document.title = title + ' - ' + pageTitle;
    } else {
      document.title = title;
    }

    return () => {
      document.title = title;
    };
  }, [title, pageTitle]);

  return null;
};

PageTitle.propTypes = {
  title: PropTypes.string,
};

export default PageTitle;
