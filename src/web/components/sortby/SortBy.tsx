/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';

const SortButton = styled.button`
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
`;

export const ASC = 'asc';
export const DESC = 'desc';

export type ByType = typeof ASC | typeof DESC;

interface SortByProps {
  by: ByType;
  children?: React.ReactNode;
  className?: string;
  onClick?: (by: ByType) => void;
}

const SortBy = ({by, children, className, onClick}: SortByProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(by);
    }
  };

  return (
    <SortButton className={className} onClick={handleClick}>
      {children}
    </SortButton>
  );
};

SortBy.ASC = ASC;
SortBy.DESC = DESC;

export default SortBy;
