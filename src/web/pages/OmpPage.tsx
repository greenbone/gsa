/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router';

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
      void navigate('/notfound', {replace: true});
      return;
    }

    const id = encodeURIComponent(infoId);

    switch (infoType) {
      case 'nvt':
        void navigate(`/nvt/${id}`, {replace: true});
        break;
      case 'cve':
        void navigate(`/cve/${id}`, {replace: true});
        break;
      case 'cpe':
        void navigate(`/cpe/${id}`, {replace: true});
        break;
      case 'cert_bund_adv':
        void navigate(`/certbund/${id}`, {replace: true});
        break;
      case 'dfn_cert_adv':
        void navigate(`/dfncert/${id}`, {replace: true});
        break;
      default:
        void navigate('/notfound', {replace: true});
        break;
    }
  }, [navigate, searchParams]);

  return null;
};

export default OmpPage;
