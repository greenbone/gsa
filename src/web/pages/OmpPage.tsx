/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {ROUTES} from 'web/route-paths';

/**
 * Component to redirect old secinfo urls like
 *
 * /omp?cmd=get_info&info_type=ovaldef&info_id=oval:org.mitre.oval:def:29419_6
 *
 * to the current replacement pages
 */

const OmpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cmd = searchParams.get('cmd');
    const infoType = searchParams.get('info_type');
    const infoId = searchParams.get('info_id') || '';

    if (cmd !== 'get_info') {
      void navigate(ROUTES.notFound.url, {replace: true});
      return;
    }

    switch (infoType) {
      case 'nvt':
        void navigate(ROUTES.nvt.url(infoId), {replace: true});
        break;
      case 'cve':
        void navigate(ROUTES.cve.url(infoId), {replace: true});
        break;
      case 'cpe':
        void navigate(ROUTES.cpe.url(infoId), {replace: true});
        break;
      case 'cert_bund_adv':
        void navigate(ROUTES.certBundAdvisory.url(infoId), {
          replace: true,
        });
        break;
      case 'dfn_cert_adv':
        void navigate(ROUTES.dfnCertAdvisory.url(infoId), {
          replace: true,
        });
        break;
      default:
        void navigate(ROUTES.notFound.url, {replace: true});
        break;
    }
  }, [navigate, searchParams]);

  return null;
};

export default OmpPage;
