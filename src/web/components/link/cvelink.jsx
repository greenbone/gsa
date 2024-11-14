/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

import DetailsLink from './detailslink';

const CveLink = ({id, ...props}) => (
  <DetailsLink {...props} id={id} type="cve" data-testid="cve_link">
    {id}
  </DetailsLink>
);

CveLink.propTypes = {
  id: PropTypes.string.isRequired,
};

export default CveLink;

// vim: set ts=2 sw=2 tw=80:
