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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

import withSvgIcon from './withSvgIcon';

import {ReactComponent as Icon} from './svg/delete.svg';

const DeleteSvgIcon = withSvgIcon()(Icon);

const DeleteIcon = ({selectionType, title, ...props}) => {
  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Delete page contents');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Delete selection');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Delete all filtered');
    }
  }
  return <DeleteSvgIcon {...props} title={title} />;
};

DeleteIcon.propTypes = {
  selectionType: PropTypes.string,
  title: PropTypes.string,
};

export default DeleteIcon;

// vim: set ts=2 sw=2 tw=80:
