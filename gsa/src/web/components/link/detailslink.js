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

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';

import Link from './link';

const DetailsLink = ({
  id,
  type,
  textOnly = false,
  'data-testid': dataTestId = 'details-link',
  ...props
}) => {
  const capabilities = useCapabilities();

  textOnly = textOnly || !capabilities.mayAccess(type);

  return (
    <Link
      {...props}
      data-testid={dataTestId}
      textOnly={textOnly}
      to={`/${type}/${encodeURIComponent(id)}`}
    />
  );
};

DetailsLink.propTypes = {
  'data-testid': PropTypes.string,
  id: PropTypes.id.isRequired,
  textOnly: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

export default DetailsLink;

// vim: set ts=2 sw=2 tw=80:
