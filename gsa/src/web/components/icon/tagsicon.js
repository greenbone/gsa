/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import SelectionType from '../../utils/selectiontype.js';

import Icon from './icon.js';

const TagsIcon = ({
  active = true,
  selectionType,
  title,
  ...other
}) => {
  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Add tag to page contents');
    }
    else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Add tag to selection');
    }
    else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Add tag to filtered');
    }
  }
  return (
    <Icon
      {...other}
      img={'tag.svg'}
      title={title}
    />
  );
};

TagsIcon.propTypes = {
  active: PropTypes.bool,
  selectionType: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default TagsIcon;

// vim: set ts=2 sw=2 tw=80:
