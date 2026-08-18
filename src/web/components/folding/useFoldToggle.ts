/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import {FoldState, type FoldStateType} from 'web/components/folding/Folding';

export interface UseFoldToggleProps {
  initialFoldState?: FoldStateType;
}

export interface UseFoldToggleResult {
  foldState: FoldStateType;
  onFoldStepEnd: () => void;
  onFoldToggle: () => void;
}

const useFoldToggle = ({
  initialFoldState = FoldState.UNFOLDED,
}: UseFoldToggleProps = {}): UseFoldToggleResult => {
  const [foldState, setFoldState] = useState(initialFoldState);

  const onFoldToggle = useCallback(() => {
    setFoldState(currentFoldState => {
      switch (currentFoldState) {
        case FoldState.FOLDED:
          return FoldState.UNFOLDING_START;
        case FoldState.UNFOLDED:
          return FoldState.FOLDING_START;
        case FoldState.UNFOLDING_START:
          return FoldState.FOLDED;
        case FoldState.FOLDING_START:
          return FoldState.UNFOLDED;
        case FoldState.UNFOLDING:
          return FoldState.FOLDING;
        case FoldState.FOLDING:
          return FoldState.UNFOLDING;
        default:
          return FoldState.UNFOLDED;
      }
    });
  }, []);

  const onFoldStepEnd = useCallback(() => {
    setFoldState(currentFoldState => {
      switch (currentFoldState) {
        case FoldState.FOLDED:
          return FoldState.FOLDED;
        case FoldState.UNFOLDED:
          return FoldState.UNFOLDED;
        case FoldState.UNFOLDING_START:
          return FoldState.UNFOLDING;
        case FoldState.FOLDING_START:
          return FoldState.FOLDING;
        case FoldState.UNFOLDING:
          return FoldState.UNFOLDED;
        case FoldState.FOLDING:
          return FoldState.FOLDED;
        default:
          return FoldState.UNFOLDED;
      }
    });
  }, []);

  return {foldState, onFoldStepEnd, onFoldToggle};
};

export default useFoldToggle;
