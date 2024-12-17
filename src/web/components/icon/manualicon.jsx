/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';
import ManualLink from 'web/components/link/manuallink';
import PropTypes from 'web/utils/proptypes';

import HelpIcon from './helpicon';

const ManualIcon = ({anchor, page, searchTerm, ...props}) => {
  return (
    <ManualLink anchor={anchor} page={page} searchTerm={searchTerm}>
      <HelpIcon {...props} />
    </ManualLink>
  );
};

ManualIcon.propTypes = {
  anchor: PropTypes.string,
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default ManualIcon;

// vim: set ts=2 sw=2 tw=80:
