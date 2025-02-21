/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import {FoldState} from 'web/components/folding/Folding';
import PropTypes from 'web/utils/PropTypes';

import FoldIcon from './FoldIcon';
import UnfoldIcon from './UnfoldIcon';

const FoldStateIcon = ({foldState, ...props}) => {
  const folded =
    foldState === FoldState.FOLDED ||
    foldState === FoldState.FOLDING ||
    foldState === FoldState.FOLDING_START;

  if (folded) {
    return (
      <FoldIcon
        title={_('Unfold')}
        {...props}
        data-testid="fold-state-icon-unfold"
      />
    );
  }

  return (
    <UnfoldIcon
      title={_('Fold')}
      {...props}
      data-testid="fold-state-icon-fold"
    />
  );
};

FoldStateIcon.propTypes = {
  foldState: PropTypes.string,
  title: PropTypes.string,
};

export default FoldStateIcon;
