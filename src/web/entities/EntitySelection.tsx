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

interface EntitySelectionProps<TEntity> {
  entity: TEntity;
  selected?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
  onDeselected?: (entity: TEntity) => void;
  onSelected?: (entity: TEntity) => void;
}

const EntitySelection = <TEntity extends Entity>({
  entity,
  selected: controlledSelected,
  disabled,
  indeterminate,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  onDeselected,
  onSelected,
}: EntitySelectionProps<TEntity>) => {
  const [internalSelected, setSelected] = useState(false);
  const selected = controlledSelected ?? internalSelected;

  const handleSelection = (value: boolean) => {
    if (value) {
      if (onSelected) {
        onSelected(entity);
      }
    } else if (onDeselected) {
      onDeselected(entity);
    }
    if (controlledSelected === undefined) setSelected(value);
  };
  return (
    <Checkbox
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      checked={selected}
      data-testid={`entity-selection-${entity.id}`}
      disabled={disabled}
      indeterminate={indeterminate}
      onChange={handleSelection}
    />
  );
};

export default EntitySelection;
