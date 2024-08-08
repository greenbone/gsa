/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import {isDefined} from 'gmp/utils/identity';

import Link from './link';

const DetailsLink = ({capabilities, id, type, textOnly = false, ...props}) => {
  textOnly = textOnly || !capabilities.mayAccess(type) || !isDefined(id);

  return (
    <Link
      {...props}
      data-testid="details-link"
      textOnly={textOnly}
      to={`/${type}/${encodeURIComponent(id)}`}
    />
  );
};

DetailsLink.propTypes = {
  capabilities: PropTypes.capabilities,
  id: PropTypes.id.isRequired,
  textOnly: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

export default withCapabilities(DetailsLink);

// vim: set ts=2 sw=2 tw=80:
