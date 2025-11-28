/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import TableCol from 'web/components/table/TableCol';

const CredentialDetailsColGroup = () => {
  return (
    <colgroup>
      <TableCol width="15%" />
      <TableCol width="85%" />
    </colgroup>
  );
};

export default CredentialDetailsColGroup;
