/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import Checkbox from 'web/components/form/checkbox';

import PropTypes from 'web/utils/proptypes';

export class EntitySelection extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleSelection = this.handleSelection.bind(this);
  }

  handleSelection(value) {
    const {onDeselected, onSelected, entity} = this.props;

    if (value) {
      if (onSelected) {
        onSelected(entity);
      }
    } else if (onDeselected) {
      onDeselected(entity);
    }
  }

  render() {
    return <Checkbox onChange={this.handleSelection} />;
  }
}

EntitySelection.propTypes = {
  entity: PropTypes.model,
  onDeselected: PropTypes.func,
  onSelected: PropTypes.func,
};

export default EntitySelection;

// vim: set ts=2 sw=2 tw=80:
