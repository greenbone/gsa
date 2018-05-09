/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {storiesOf} from '@storybook/react';

import Everything from 'gmp/capabilities/everything';

import CapabilitiesProvider from 'web/components/provider/capabilitiesprovider';
import GmpProvider from 'web/components/provider/gmpprovider';
import IconSizeProvider from 'web/components/provider/iconsizeprovider';

import Powerfilter from 'web/components/powerfilter/powerfilter';

const fakegmp = {
  globals: {
    manualurl: 'http://example.com',
  },
};

const Box = glamorous.div({
  display: 'flex',
  padding: '5px',
  border: '1px solid black',
});

storiesOf('Powerfilter', module)
  .add('default', () => (
    <GmpProvider gmp={fakegmp}>
      <CapabilitiesProvider capabilities={new Everything()}>
        <Box>
          <IconSizeProvider size="medium">
            <Powerfilter />
          </IconSizeProvider>
        </Box>
      </CapabilitiesProvider>
    </GmpProvider>
  ));

// vim: set ts=2 sw=2 tw=80:
