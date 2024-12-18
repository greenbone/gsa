/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Link from 'web/components/link/link';
import PropTypes from 'web/utils/proptypes';

import ListSvgIcon from './listsvgicon';

const ListIcon = ({page, filter, ...props}) => {
  return (
    <Link data-testid="list-link-icon" filter={filter} to={page}>
      <ListSvgIcon {...props} data-testid="list-icon" />
    </Link>
  );
};

ListIcon.propTypes = {
  filter: PropTypes.filter,
  page: PropTypes.string.isRequired,
};

export default ListIcon;
