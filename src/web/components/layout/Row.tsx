/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Flex, FlexProps} from '@mantine/core';

/**
 * React component that renders a row layout
 *
 */
const Row: React.FC<FlexProps> = ({
  children,
  gap = 'md',
  align = 'center',
  justify,
  ...props
}) => {
  return (
    <Flex {...props} align={align} direction="row" gap={gap} justify={justify}>
      {children}
    </Flex>
  );
};

export default Row;
