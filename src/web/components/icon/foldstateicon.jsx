/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import {FoldState} from 'web/components/folding/folding';

import UnfoldIcon from './unfoldicon';
import FoldIcon from './foldicon';

const FoldStateIcon = ({foldState, ...props}) => {
  const folded =
    foldState === FoldState.FOLDED ||
    foldState === FoldState.FOLDING ||
    foldState === FoldState.FOLDING_START;

  if (folded) {
    return <FoldIcon title={_('Unfold')} {...props} data-testid="fold_icon"/>;
  }

  return <UnfoldIcon title={_('Fold')} {...props} data-testid="unfold_icon"/>;
};

FoldStateIcon.propTypes = {
  foldState: PropTypes.string,
  title: PropTypes.string,
};

export default FoldStateIcon;

// vim: set ts=2 sw=2 tw=80:
