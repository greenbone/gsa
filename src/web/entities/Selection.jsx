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
