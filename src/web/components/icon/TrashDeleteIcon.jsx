/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import Theme from 'web/utils/Theme';


const TrashDeleteIcon = styled(DeleteIcon)`
  & svg:hover {
    background-color: ${Theme.lightRed};
  }
  & svg:hover path {
    fill: ${Theme.darkRed};
  }
`;

export default TrashDeleteIcon;
