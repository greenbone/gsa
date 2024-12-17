/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isString} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import DetailsLink from './detailslink';

const CertLink = ({id, textOnly = false, type}) => {
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
    <DetailsLink title={title} id={id} type={info_type} textOnly={textOnly} data-testid="cert_link">
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

// vim: set ts=2 sw=2 tw=80:
