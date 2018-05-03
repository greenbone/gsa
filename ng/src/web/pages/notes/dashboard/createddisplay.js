/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import CreatedDisplay from 'web/components/dashboard2/display/created/createddisplay'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard2/registry';

import {NotesCreatedLoader} from './loaders';

export const NotesCreatedDisplay = ({
  filter,
  ...props
}) => (
  <NotesCreatedLoader
    filter={filter}
  >
    {loaderProps => (
      <CreatedDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        title={({data: tdata}) =>
          _('Notes by Creation Time')}
        yAxisLabel={_('# of created Notes')}
        y2AxisLabel={_('Total Notes')}
        xAxisLabel={_('Time')}
        yLine={{
          color: Theme.darkGreen,
          label: _('Created Notes'),
        }}
        y2Line={{
          color: Theme.darkGreen,
          dashArray: '3, 2',
          label: _('Total Notes'),
        }}
      />
    )}
  </NotesCreatedLoader>
);

NotesCreatedDisplay.propTypes = {
  filter: PropTypes.filter,
};

NotesCreatedDisplay.displayId = 'note-by-created';

registerDisplay(NotesCreatedDisplay.displayId,
  NotesCreatedDisplay, {
    title: _('Chart: Notes by Creation Time'),
  },
);

export default NotesCreatedDisplay;

// vim: set ts=2 sw=2 tw=80:
