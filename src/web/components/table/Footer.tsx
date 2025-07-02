/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableFooter = (props: TableFooterProps) => <tfoot {...props} />;

export default TableFooter;
