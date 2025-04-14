/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {FoldState} from 'web/components/folding/Folding';
import {FoldIcon, UnfoldIcon} from 'web/components/icon';

interface FoldStateIconProps {
  foldState: keyof typeof FoldState;
  title?: string;
  className?: string;
  onClick?: () => void;
}

const FoldStateIcon: React.FC<FoldStateIconProps> = ({
  foldState,
  title,
  ...props
}) => {
  const folded =
    foldState === FoldState.FOLDED ||
    foldState === FoldState.FOLDING ||
    foldState === FoldState.FOLDING_START;

  if (folded) {
    return (
      <FoldIcon
        {...props}
        dataTestId="fold-state-icon-unfold"
        title={title || _('Unfold')}
      />
    );
  }

  return (
    <UnfoldIcon
      {...props}
      dataTestId="fold-state-icon-fold"
      title={title || _('Fold')}
    />
  );
};

export default FoldStateIcon;
