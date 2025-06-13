/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Checkbox from 'web/components/form/Checkbox';
import PropTypes from 'web/utils/PropTypes';

export class EntitySelection extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleSelection = this.handleSelection.bind(this);
    this.state = {
      selected: false,
    };
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
    this.setState({selected: value});
  }

  render() {
    const {selected} = this.state;
    return <Checkbox checked={selected} onChange={this.handleSelection} />;
  }
}

EntitySelection.propTypes = {
  entity: PropTypes.model,
  onDeselected: PropTypes.func,
  onSelected: PropTypes.func,
};

export default EntitySelection;
