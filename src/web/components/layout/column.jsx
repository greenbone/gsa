/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Flex} from '@mantine/core';
import PropTypes from 'web/utils/proptypes';

/**
 * React component that renders a stack (column) layout
 *
 */
const Column = ({
  children,
  gap = 'md',
  grow,
  align = 'stretch',
  wrap,
  justify = 'flex-start',
  ...props
}) => {
  return (
    <Flex
      {...props}
      align={align}
      direction="column"
      gap={gap}
      grow={grow}
      justify={justify}
      wrap={wrap}
    >
      {children}
    </Flex>
  );
};

Column.propTypes = {
  align: PropTypes.string,
  gap: PropTypes.string,
  grow: PropTypes.numberOrNumberString,
  justify: PropTypes.string,
  wrap: PropTypes.string,
};

export default Column;
