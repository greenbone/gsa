/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import DetailsLink from 'web/components/link/DetailsLink';
import PropTypes from 'web/utils/PropTypes';


const CveLink = ({id, ...props}) => (
  <DetailsLink {...props} data-testid="cve-link" id={id} type="cve">
    {id}
  </DetailsLink>
);

CveLink.propTypes = {
  id: PropTypes.string.isRequired,
};

export default CveLink;
