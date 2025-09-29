/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isString} from 'gmp/utils/identity';
import DetailsLink from 'web/components/link/DetailsLink';
import useTranslation from 'web/hooks/useTranslation';

interface CertLinkProps {
  id: string;
  textOnly?: boolean;
  type: string;
}

const CertLink = ({id, textOnly = false, type}: CertLinkProps) => {
  const [_] = useTranslation();
  const lcType = isString(type) ? type.toLowerCase() : undefined;
  if (lcType !== 'cert-bund' && lcType !== 'dfn-cert') {
    return (
      <span>
        <b>?</b>
        {id}
      </span>
    );
  }

  let info_type: 'certbund' | 'dfncert';
  let title: string;

  if (lcType === 'cert-bund') {
    info_type = 'certbund';
    title = _('View details of CERT-Bund Advisory {{name}}', {name: id});
  } else {
    title = _('View details of DFN-CERT Advisory {{name}}', {name: id});
    info_type = 'dfncert';
  }
  return (
    <DetailsLink
      data-testid="cert_link"
      id={id}
      textOnly={textOnly}
      title={title}
      type={info_type}
    >
      {id}
    </DetailsLink>
  );
};

export default CertLink;
