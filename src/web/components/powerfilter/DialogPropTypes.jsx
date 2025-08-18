/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/PropTypes';

const dialogPropType = {
  filter: PropTypes.filter,
  filterString: PropTypes.string,
  sortFields: PropTypes.array,
  onFilterStringChange: PropTypes.func,
  onFilterValueChange: PropTypes.func,
  onSortByChange: PropTypes.func,
  onSortOrderChange: PropTypes.func,
};

export default dialogPropType;
