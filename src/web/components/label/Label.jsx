/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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

/**
 * A higher-order component that creates a Label component with specified styles and properties.
 *
 * @param {string} backgroundColor - The background color of the label.
 * @param {string} borderColor - The border color of the label.
 * @param {string} textColor - The text color of the label.
 * @param {string} testId - The test ID for the label, used for testing purposes.
 * @param {string} text - The text content of the label.
 * @returns {Function} A function that takes props and returns a Label component with the specified styles and properties.
 */
const createLabel =
  (backgroundColor, borderColor, textColor, testId, text) => props => {
    return (
      <Label
        {...props}
        $backgroundColor={backgroundColor}
        $borderColor={borderColor}
        $textColor={textColor}
        data-testid={testId}
      >
        {String(text)}
      </Label>
    );
  };

export default createLabel;
