/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import PropTypes from 'web/utils/proptypes';

import Link from 'web/components/link/link';

import ListSvgIcon from './listsvgicon';

const ListIcon = ({page, filter, ...props}) => {
  return (
    <Link to={page} filter={filter} data-testid="list-link-icon">
      <ListSvgIcon {...props} data-testid="list-icon"/>
    </Link>
  );
};

ListIcon.propTypes = {
  filter: PropTypes.filter,
  page: PropTypes.string.isRequired,
};

export default ListIcon;

// vim: set ts=2 sw=2 tw=80:
