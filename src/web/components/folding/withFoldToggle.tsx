/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {FoldState, type FoldStateType} from 'web/components/folding/Folding';

interface FoldToggleProps {
  initialFoldState?: FoldStateType;
}

export interface FoldToggleComponentProps {
  foldState: FoldStateType;
  onFoldStepEnd: () => void;
  onFoldToggle: () => void;
}

/**
 * HOC to add fold parent functionality to a component.
 */
const withFoldToggle = <TProps extends FoldToggleComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  type PublicProps = Omit<TProps, keyof FoldToggleComponentProps> &
    FoldToggleProps;

  class FoldToggleWrapper extends React.Component<
    PublicProps,
    {foldState: FoldStateType}
  > {
    constructor(props: PublicProps) {
      super(props);

      const {initialFoldState = FoldState.UNFOLDED} = props;

      this.state = {
        foldState: initialFoldState,
      };

      this.handleFoldStepEnd = this.handleFoldStepEnd.bind(this);
      this.handleFoldToggle = this.handleFoldToggle.bind(this);
    }

    handleFoldToggle() {
      this.setState(({foldState}) => {
        let newFoldState: FoldStateType;

        switch (foldState) {
          case FoldState.FOLDED:
            newFoldState = FoldState.UNFOLDING_START;
            break;
          case FoldState.UNFOLDED:
            newFoldState = FoldState.FOLDING_START;
            break;
          case FoldState.UNFOLDING_START:
            newFoldState = FoldState.FOLDED;
            break;
          case FoldState.FOLDING_START:
            newFoldState = FoldState.UNFOLDED;
            break;
          case FoldState.UNFOLDING:
            newFoldState = FoldState.FOLDING;
            break;
          case FoldState.FOLDING:
            newFoldState = FoldState.UNFOLDING;
            break;
          default:
            newFoldState = FoldState.UNFOLDED;
        }
        return {foldState: newFoldState};
      });
    }

    handleFoldStepEnd() {
      this.setState(({foldState}) => {
        let newFoldState: FoldStateType;

        switch (foldState) {
          case FoldState.FOLDED:
            newFoldState = FoldState.FOLDED;
            break;
          case FoldState.UNFOLDED:
            newFoldState = FoldState.UNFOLDED;
            break;
          case FoldState.UNFOLDING_START:
            newFoldState = FoldState.UNFOLDING;
            break;
          case FoldState.FOLDING_START:
            newFoldState = FoldState.FOLDING;
            break;
          case FoldState.UNFOLDING:
            newFoldState = FoldState.UNFOLDED;
            break;
          case FoldState.FOLDING:
            newFoldState = FoldState.FOLDED;
            break;
          default:
            newFoldState = FoldState.UNFOLDED;
        }
        return {foldState: newFoldState};
      });
    }

    render() {
      const {...other} = this.props;
      const {foldState} = this.state;
      const componentProps = {
        ...(other as Omit<TProps, keyof FoldToggleComponentProps>),
        foldState,
        onFoldStepEnd: this.handleFoldStepEnd,
        onFoldToggle: this.handleFoldToggle,
      } as TProps;

      return <Component {...componentProps} />;
    }
  }

  return FoldToggleWrapper;
};

export default withFoldToggle;
