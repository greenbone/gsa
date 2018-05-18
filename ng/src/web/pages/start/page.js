/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import Section from 'web/components/section/section';

import Dashboard from './dashboard';

const DEFAULT_DASHBOARD_ID = 'd97eca9f-0386-4e5d-88f2-0ed7f60c0646';

const StartPage = () => (
  <Section
    title={_('Dashboard')}
    img="dashboard.svg"
  >
    <Dashboard id={DEFAULT_DASHBOARD_ID}/>
  </Section>
);


export default StartPage;

// vim: set ts=2 sw=2 tw=80:

