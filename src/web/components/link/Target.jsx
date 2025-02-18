/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Theme from 'web/utils/Theme';

/**
 * Can be used as link anchor. Offsets the target so that it doesn't hide
 * behind the top menu bar.
 *
 * @module components/link/target.js
 *
 * @exports {Target}
 */

const Target = styled.div`
  content: '';
  display: block;
  height: 35px;
  z-index: ${Theme.Layers.belowAll};
  margin: -35px 0 0 0;
  position: relative;
  ${'' /* needs to be set for z-index to work in Firefox */}
`;

export default Target;
