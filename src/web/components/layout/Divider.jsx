/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';


const DEFAULT_MARGIN = '5px';

const DividerComponent = styled(Layout)`
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

const Divider = ({margin = DEFAULT_MARGIN, grow, ...props}) => {
  // put Divider into a container div to allow dividers in dividers
  return (
    <DividerContainer grow={grow}>
      <DividerComponent $margin={margin} grow={grow} {...props} />
    </DividerContainer>
  );
};

Divider.propTypes = {
  grow: PropTypes.oneOfType([PropTypes.bool, PropTypes.numberOrNumberString]),
  margin: PropTypes.string,
};

export default Divider;
