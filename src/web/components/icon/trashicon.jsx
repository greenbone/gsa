/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

import TrashcanIcon from 'web/components/icon/trashcanicon';

const TrashIcon = ({selectionType, title, ...other}) => {
  if (!isDefined(title)) {
    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      title = _('Move page contents to trashcan');
    } else if (selectionType === SelectionType.SELECTION_USER) {
      title = _('Move selection to trashcan');
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      title = _('Move all filtered to trashcan');
    }
  }
  return <TrashcanIcon {...other} title={title} />;
};

TrashIcon.propTypes = {
  selectionType: PropTypes.string,
  title: PropTypes.string,
};

export default TrashIcon;

// vim: set ts=2 sw=2 tw=80:
