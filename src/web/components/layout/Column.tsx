/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Flex, type FlexProps} from '@mantine/core';

/**
 * React component that renders a stack (column) layout
 *
 */
const Column: React.FC<FlexProps> = ({
  children,
  gap = 'md',
  align = 'stretch',
  justify = 'flex-start',
  ...props
}) => {
  return (
    <Flex {...props} align={align} direction="column" gap={gap}>
      {children}
    </Flex>
  );
};

export default Column;
