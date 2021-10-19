/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
    <DetailsLink title={title} id={id} type={info_type} textOnly={textOnly}>
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
