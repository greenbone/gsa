/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import 'core-js/features/object/values';

import React from 'react';

import {withRouter} from 'react-router-dom';

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

import ProcessMap from 'web/components/processmap/processmap';
import Display from 'web/components/dashboard/display/display';
import {registerDisplay} from 'web/components/dashboard/registry';

import ProcessMapsLoader from './processmaploader';

export class BpmDisplay extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(data) {
    const {history} = this.props;

    history.push(`/host/${data.id}`);
  }

  render() {
    const {filter, ...props} = this.props;
    return (
      <Display
        {...props}
        filter={filter}
        title={_('Business Process Map')}
        showToggleLegend={true}
      >
        <ProcessMapsLoader>
          {/* TODO Processes need to be accessible in the store. They'll need a
          uuid to be able to have unique filter for them in order to load the
          correct tag_id.
          Filter and processes need to be handed to the BPM.
          Use a callback to inform the loader about which element (process) is
          currently selected */}
          {({...loaderProps}) => <ProcessMap {...loaderProps} />}
        </ProcessMapsLoader>
      </Display>
    );
  }
}

BpmDisplay.propTypes = {
  filter: PropTypes.filter,
  history: PropTypes.object.isRequired,
};

const DISPLAY_ID = 'processmap';

BpmDisplay = withRouter(BpmDisplay);

BpmDisplay.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, BpmDisplay, {
  title: _l('Chart: Business Process Map'),
});

// vim: set ts=2 sw=2 tw=80:
