/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import Checkbox from 'web/components/form/Checkbox';
import PropTypes from 'web/utils/PropTypes';

const EntitySelection = ({entity, onDeselected, onSelected}) => {
  const [selected, setSelected] = useState(false);

  const handleSelection = value => {
    if (value) {
      if (onSelected) {
        onSelected(entity);
      }
    } else if (onDeselected) {
      onDeselected(entity);
    }
    setSelected(value);
  };
  return (
    <Checkbox
      checked={selected}
      data-testid={`entity-selection-${entity.id}`}
      onChange={handleSelection}
    />
  );
};

EntitySelection.propTypes = {
  entity: PropTypes.model,
  onDeselected: PropTypes.func,
  onSelected: PropTypes.func,
};

export default EntitySelection;
