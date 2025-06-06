/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import {TagsIcon as TagsSvgIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

const TagsIcon = ({active = true, selectionType, title, ...other}) => {
  const [_] = useTranslation();
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
