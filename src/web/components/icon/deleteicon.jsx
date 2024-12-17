/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import {CircleX as Icon} from 'lucide-react';
import React from 'react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';
import PropTypes from 'web/utils/proptypes';
import SelectionType from 'web/utils/selectiontype';

import withSvgIcon from './withSvgIcon';


const DeleteSvgIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} data-testid="delete-icon"/>
));

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
