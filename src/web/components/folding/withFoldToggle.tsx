/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useState} from 'react';
import hoistStatics from 'hoist-non-react-statics';
import {FoldState, type FoldStateType} from 'web/components/folding/Folding';
import {updateDisplayName} from 'web/utils/display-name';

interface FoldToggleProps {
  initialFoldState?: FoldStateType;
}

export interface FoldToggleComponentProps {
  foldState: FoldStateType;
  onFoldStepEnd: () => void;
  onFoldToggle: () => void;
}

type FoldTogglePublicProps<TProps extends FoldToggleComponentProps> = Omit<
  TProps,
  keyof FoldToggleComponentProps
> &
  FoldToggleProps;

/**
 * HOC to add fold parent functionality to a component.
 */
const withFoldToggle = <TProps extends FoldToggleComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  const FoldToggleWrapper = (props: FoldTogglePublicProps<TProps>) => {
    const [foldState, setFoldState] = useState(
      props.initialFoldState ?? FoldState.UNFOLDED,
    );

    const handleFoldToggle = useCallback(() => {
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

    const handleFoldStepEnd = useCallback(() => {
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

    const {...other} = props;
    const componentProps = {
      ...(other as Omit<TProps, keyof FoldToggleComponentProps>),
      foldState,
      onFoldStepEnd: handleFoldStepEnd,
      onFoldToggle: handleFoldToggle,
    } as TProps;

    return <Component {...componentProps} />;
  };

  return hoistStatics(
    updateDisplayName(FoldToggleWrapper, Component, 'withFoldToggle'),
    Component,
  );
};

export default withFoldToggle;
