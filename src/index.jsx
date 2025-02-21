/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {createRoot} from 'react-dom/client';
import {StyleSheetManager} from 'styled-components';
import App from 'web/App';

const root = createRoot(document.getElementById('app'));
root.render(
  <StyleSheetManager enableVendorPrefixes>
    <App />
  </StyleSheetManager>,
);
