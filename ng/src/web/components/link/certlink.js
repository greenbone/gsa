/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import DetailsLink from '../../components/link/detailslink.js';

const CertLink = ({
    id,
    textOnly = false,
    type,
  }) => {

  if (type !== 'CERT-Bund' && type !== 'DFN-CERT') {
    return (
      <span><b>?</b>{id}</span>
    );
  }

  let info_type;
  let title;

  if (type === 'CERT-Bund') {
    info_type = 'certbundadv';
    title = _('View details of CERT-Bund Advisory {{name}}', {name: id});
  }
  else if (type === 'DFN-CERT') {
    title = _('View details of DFN-CERT Advisory {{name}}', {name: id});
    info_type = 'dfncertadv';
  }
  return (
    <DetailsLink
      title={title}
      id={id}
      type={info_type}
      textOnly={textOnly}>
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
