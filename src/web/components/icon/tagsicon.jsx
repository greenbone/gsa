/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

import TagsSvgIcon from './tagssvgicon';

const TagsIcon = ({active = true, selectionType, title, ...other}) => {
  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Add tag to page contents');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Add tag to selection');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Add tag to filtered');
    }
  }
  return <TagsSvgIcon {...other} active={active} title={title} />;
};

TagsIcon.propTypes = {
  active: PropTypes.bool,
  selectionType: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default TagsIcon;

// vim: set ts=2 sw=2 tw=80:
