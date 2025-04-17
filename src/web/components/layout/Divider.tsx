/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Layout, {LayoutProps} from 'web/components/layout/Layout';

const DEFAULT_MARGIN = '5px';

interface DividerComponentProps {
  flex?: string;
  $margin: string;
}

interface DividerProps extends LayoutProps {
  flex?: string;
  margin?: string;
}

const DividerComponent = styled(Layout)<DividerComponentProps>`
  & > * {
    display: inline-flex;
  }
  ${props => {
    const edge = props.flex === 'column' ? 'Top' : 'Left';
    return {
      // try to fix flex-wrap indentation at second line and beyond by using a
      // negative outer margin
      ['margin' + edge]: '-' + props.$margin,

      '& > *': {
        ['margin' + edge]: props.$margin,
      },
    };
  }}
`;

DividerComponent.displayName = 'DividerComponent';

const DividerContainer = styled(Layout)`
  display: inline-flex;
`;

DividerContainer.displayName = 'DividerContainer';

const Divider: React.FC<DividerProps> = ({
  margin = DEFAULT_MARGIN,
  grow,
  flex,
  ...props
}: DividerProps) => {
  // put Divider into a container div to allow dividers in dividers
  return (
    <DividerContainer grow={grow}>
      <DividerComponent $margin={margin} flex={flex} grow={grow} {...props} />
    </DividerContainer>
  );
};

export default Divider;
