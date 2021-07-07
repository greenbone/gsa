/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import ReactDOM from 'react-dom';

import * as Sentry from '@sentry/react';

import {GSA_VERSION} from 'version';

import {isDefined} from 'gmp/utils/identity';

import App from './web/app.js';

const config = isDefined(global.config) ? global.config : {};
const {sentryDSN, sentryEnvironment} = config;

Sentry.init({
  attachStacktrace: true,
  dsn: sentryDSN,
  environment: sentryEnvironment,
  enabled: isDefined(sentryDSN),
  release: GSA_VERSION,
});

ReactDOM.render(<App />, document.getElementById('app'));

// vim: set ts=2 sw=2 tw=80:
