/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const Label = styled.div`
  box-sizing: border-box;
  position: relative;
  font-weight: normal;
  font-style: normal;
  color: white;
  padding: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 1.5em;
  font-size: 0.8em;
  text-align: center;
  color: ${props => props.$textColor};
  background-color: ${props => props.$backgroundColor};
  border-radius: 5px;
  overflow: hidden;
  border-color: ${props => props.$borderColor};
`;

const createLabel =
  (backgroundColor, borderColor, textColor, testId, text) => props => {
    const [_] = useTranslation();
    return (
      <Label
        {...props}
        $backgroundColor={backgroundColor}
        $borderColor={borderColor}
        $textColor={textColor}
        data-testid={testId}
      >
        {_(text)}
      </Label>
    );
  };

export default createLabel;