/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {parseBoolean} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {typeName, type EntityType} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {renderSelectItems} from 'web/utils/Render';

interface ResourceOption {
  name: string;
  id: string;
}

interface TagDialogDefaultValues {
  active: boolean;
  comment: string;
  name: string;
  value: string;
}

interface TagDialogValues {
  id?: string;
  resourceIds: string[];
  resourceType?: EntityType;
}

export type TagDialogState = TagDialogDefaultValues & TagDialogValues;

interface TagDialogProps {
  active?: boolean;
  comment?: string;
  fixed?: boolean;
  id?: string;
  name?: string;
  resourceIds?: string[];
  resourceType?: EntityType;
  resourceTypes?: EntityType[];
  resourceCount?: number;
  title?: string;
  value?: string;
  onClose?: () => void;
  onSave?: (state: TagDialogState) => Promise<void> | void;
}

export const SELECT_MAX_RESOURCES = 200; // concerns items in TagDialog's Select

const ScrollableContent = styled.div`
  max-height: 200px;
  overflow: auto;
`;

const TagDialog = ({
  id,
  active = true,
  comment = '',
  fixed = false,
  name,
  resourceIds = [],
  resourceType: initialResourceType,
  resourceTypes = [],
  resourceCount,
  title,
  value = '',
  onClose,
  onSave,
}: TagDialogProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const [resourceIdText, setResourceIdText] = useState('');
  const [resourceIdsSelected, setResourceIdsSelected] = useState(resourceIds);
  const [resourceOptions, setResourceOptions] = useState<ResourceOption[]>([]);
  const [resourceType, setResourceType] = useState<EntityType | undefined>(
    initialResourceType,
  );
  const [isLoading, setIsLoading] = useState(false);

  title = title ?? _('New Tag');
  name = name ?? _('default:unnamed');
  resourceCount = resourceCount ?? 0;

  const loadResourcesByType = useCallback(
    (type: EntityType) => {
      if (!isDefined(type)) {
        return;
      }
      setIsLoading(true);
      gmp.resourcenames
        .getAll({resourceType: type})
        .then(response => {
          const data: ResourceOption[] = response.data;
          let id: string | undefined = resourceIdText;
          if (isEmpty(id)) {
            id = undefined;
          } else {
            const idPresent = data.some(res => res.id === id);
            if (!idPresent) {
              data.push({
                name: '----',
                id: id,
              });
            }
          }
          setResourceOptions(data);
          setIsLoading(false);
        })
        .catch(err => {
          setIsLoading(false);
          throw err;
        });
    },
    [gmp, resourceIdText],
  );

  useEffect(() => {
    if (isDefined(resourceType)) {
      loadResourcesByType(resourceType);
    }
  }, [loadResourcesByType, resourceType]);

  const handleResourceTypeChange = (type: EntityType, onValueChange) => {
    onValueChange(type, 'resourceType');

    loadResourcesByType(type);
    setResourceIdsSelected([]);
    setResourceOptions([]);
    setResourceType(type);
  };

  const handleIdChange = (ids: string[], onValueChange) => {
    onValueChange(ids, 'resourceIds');

    setResourceIdsSelected(ids);
  };

  const handleIdChangeByText = async (id: string) => {
    const response = await gmp.resourcenames.get({
      resourceType,
      filter: 'uuid=' + id,
    });
    const ids = isDefined(resourceIdsSelected) ? resourceIdsSelected : [];
    if (response.data.length === 0) {
      let currentResourceOptions = resourceOptions;
      const idPresent = currentResourceOptions.filter(res => res.id === id);
      if (idPresent.length === 0 && !isEmpty(id)) {
        // if the options already contain '----', remove the old element
        currentResourceOptions = currentResourceOptions.filter(
          res => res.name !== '----',
        );
        currentResourceOptions.push({
          name: '----',
          id: id,
        });
      }

      setResourceOptions(currentResourceOptions);
      setResourceIdText(id);
    } else {
      const idSelected = ids.includes(id);
      setResourceIdText('');
      if (!idSelected) {
        setResourceIdsSelected(prevIds => [...prevIds, id]);
      }
    }
  };

  const resourceTypesOptions = map(resourceTypes, rType => ({
    label: typeName(rType),
    value: rType,
  }));

  const typeIsChosen = isDefined(resourceType);
  const showResourceSelection = resourceCount < SELECT_MAX_RESOURCES;

  return (
    <SaveDialog
      defaultValues={{
        active,
        comment,
        name,
        value,
      }}
      title={title}
      values={{
        id,
        resourceIds: resourceIdsSelected,
        resourceType,
      }}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <TextField
              name="name"
              title={_('Name')}
              value={state.name}
              onChange={onValueChange}
            />

            <TextField
              name="comment"
              title={_('Comment')}
              value={state.comment}
              onChange={onValueChange}
            />

            <TextArea
              name="value"
              title={_('Value')}
              value={state.value}
              onChange={onValueChange}
            />

            {showResourceSelection ? (
              <>
                <Select
                  disabled={fixed || resourceTypesOptions.length === 0}
                  items={resourceTypesOptions}
                  label={_('Resource Type')}
                  name="resourceType"
                  value={resourceType}
                  onChange={type =>
                    handleResourceTypeChange(type, onValueChange)
                  }
                />
                <ScrollableContent className="multiselect-scroll">
                  <MultiSelect
                    disabled={
                      !typeIsChosen ||
                      fixed ||
                      resourceTypesOptions.length === 0
                    }
                    isLoading={isLoading && resourceOptions.length === 0}
                    items={renderSelectItems(resourceOptions)}
                    label={_('Select Resource')}
                    name="resourceIds"
                    value={resourceIdsSelected}
                    onChange={ids => handleIdChange(ids, onValueChange)}
                  />
                </ScrollableContent>
                <TextField
                  disabled={!typeIsChosen || fixed}
                  name="resourceIdText"
                  title={_('Add Resource by ID')}
                  value={resourceIdText}
                  onChange={handleIdChangeByText}
                />
              </>
            ) : (
              <FormGroup title={_('Resources')}>
                <span>{_('Too many resources to list.')}</span>
              </FormGroup>
            )}
            <FormGroup title={_('Active')}>
              <YesNoRadio<boolean>
                convert={parseBoolean}
                name="active"
                noValue={false}
                value={state.active}
                yesValue={true}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

export default TagDialog;
