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

const OmpComponent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cmd = searchParams.get('cmd');
    const info_type = searchParams.get('info_type');
    const info_id = searchParams.get('info_id') || '';

    if (cmd !== 'get_info') {
      navigate('/notfound', {replace: true});
      return;
    }

    const id = encodeURIComponent(info_id);

    switch (info_type) {
      case 'nvt':
        navigate('/nvt/' + id, {replace: true});
        break;
      case 'cve':
        navigate('/cve/' + id, {replace: true});
        break;
      case 'cpe':
        navigate('/cpe/' + id, {replace: true});
        break;
      case 'cert_bund_adv':
        navigate('/certbund/' + id, {replace: true});
        break;
      case 'dfn_cert_adv':
        navigate('/dfncert/' + id, {replace: true});
        break;
      default:
        navigate('/notfound', {replace: true});
        break;
    }
  }, [navigate, searchParams]);

  return null;
};

export default OmpComponent;
