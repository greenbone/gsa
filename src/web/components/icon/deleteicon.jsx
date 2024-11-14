/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

import withSvgIcon from './withSvgIcon';

import Icon from './svg/delete.svg';

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
  return <DeleteSvgIcon {...props} title={title} data-testid="delete_icon"/>;
};

DeleteIcon.propTypes = {
  selectionType: PropTypes.string,
  title: PropTypes.string,
};

export default DeleteIcon;

// vim: set ts=2 sw=2 tw=80:
