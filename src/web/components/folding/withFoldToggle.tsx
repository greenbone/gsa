/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import useFoldToggle, {
  type UseFoldToggleProps,
  type UseFoldToggleResult,
} from 'web/components/folding/useFoldToggle';
import {updateDisplayName} from 'web/utils/display-name';

export type FoldToggleProps = UseFoldToggleProps;

export type FoldToggleComponentProps = UseFoldToggleResult;

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
    const {foldState, onFoldStepEnd, onFoldToggle} = useFoldToggle({
      initialFoldState: props.initialFoldState,
    });

    const {...other} = props;
    const componentProps = {
      ...(other as Omit<TProps, keyof FoldToggleComponentProps>),
      foldState,
      onFoldStepEnd,
      onFoldToggle,
    } as TProps;

    return <Component {...componentProps} />;
  };

  return hoistStatics(
    updateDisplayName(FoldToggleWrapper, Component, 'withFoldToggle'),
    Component,
  );
};

export default withFoldToggle;
