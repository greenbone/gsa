/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isString} from 'gmp/utils/identity';
import DetailsLink from 'web/components/link/DetailsLink';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const CertLink = ({id, textOnly = false, type}) => {
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

  let info_type;
  let title;

  if (lcType === 'cert-bund') {
    info_type = 'certbund';
    title = _('View details of CERT-Bund Advisory {{name}}', {name: id});
  } else if (lcType === 'dfn-cert') {
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

CertLink.propTypes = {
  id: PropTypes.string.isRequired,
  textOnly: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

export default CertLink;
