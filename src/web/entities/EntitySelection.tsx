/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import Checkbox from 'web/components/form/Checkbox';

export interface Entity {
  // id should be required in future, but for now we keep it optional to match the Model class
  id?: string;
}

interface EntitySelectionProps {
  entity: Entity;
  onDeselected?: (entity: Entity) => void;
  onSelected?: (entity: Entity) => void;
}

const EntitySelection = ({
  entity,
  onDeselected,
  onSelected,
}: EntitySelectionProps) => {
  const [selected, setSelected] = useState(false);

  const handleSelection = (value: boolean) => {
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

export default EntitySelection;
