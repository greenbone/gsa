/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

import withSvgIcon from './withSvgIcon';

import {FileOutput as Icon} from 'lucide-react';

import IconWithStrokeWidth from 'web/components/icon/IconWithStrokeWidth';

const ExportSvgIcon = withSvgIcon()(props => (
  <IconWithStrokeWidth IconComponent={Icon} {...props} />
));

const ExportIcon = ({selectionType, title, ...other}) => {
  let download_title = title;
  if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    download_title = _('Export page contents');
  } else if (selectionType === SelectionType.SELECTION_USER) {
    download_title = _('Export selection');
  } else if (selectionType === SelectionType.SELECTION_FILTER) {
    download_title = _('Export all filtered');
  }
  return <ExportSvgIcon {...other} title={download_title} />;
};

ExportIcon.propTypes = {
  selectionType: PropTypes.string,
  title: PropTypes.string,
};

export default ExportIcon;

// vim: set ts=2 sw=2 tw=80:
