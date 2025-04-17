/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {TrashcanIcon} from 'web/components/icon';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';
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
  return <TrashcanIcon data-testid="trash-icon" {...other} title={title} />;
};

TrashIcon.propTypes = {
  selectionType: PropTypes.string,
  title: PropTypes.string,
};

export default TrashIcon;
