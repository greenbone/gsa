/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import HelpIcon from 'web/components/icon/HelpIcon';
import ManualLink from 'web/components/link/ManualLink';
import PropTypes from 'web/utils/PropTypes';


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
