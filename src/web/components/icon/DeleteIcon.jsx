/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import {CircleX as Icon} from 'lucide-react';
import React from 'react';
import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';
import withSvgIcon from 'web/components/icon/withSvgIcon';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

const DeleteSvgIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth
    IconComponent={Icon}
    {...props}
    data-testid="delete-icon"
  />
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
  return <DeleteSvgIcon data-testid="delete-icon" {...props} title={title} />;
};

DeleteIcon.propTypes = {
  selectionType: PropTypes.string,
  title: PropTypes.string,
};

export default DeleteIcon;
