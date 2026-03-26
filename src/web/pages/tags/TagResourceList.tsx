/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import styled from 'styled-components';
import Filter from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import type Tag from 'gmp/models/tag';
import {
  type EntityType,
  type NormalizeType,
  pluralizeType,
  normalizeType,
} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import ListIcon from 'web/components/icon/ListIcon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Loading from 'web/components/loading/Loading';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface NotificationProps {
  id: string;
  resourceType: EntityType;
}

interface ResourceListProps {
  entity: Tag;
}

const MAX_RESOURCES = 40;

const Spacer = styled.div`
  height: 12px;
`;

const Notification = ({id, resourceType}: NotificationProps) => {
  const [_] = useTranslation();
  const filter = Filter.fromString('tag_id=' + id);
  const normalized = normalizeType(resourceType as NormalizeType);
  return (
    <Divider>
      <span>
        {_('Listing only the first {{num}} items. ', {num: MAX_RESOURCES})}
        {_('To see all assigned resources click here:')}
      </span>
      <ListIcon
        filter={filter}
        page={normalized ? pluralizeType(normalized) : ''}
        title={_('List Items')}
      />
    </Divider>
  );
};

const ResourceList = ({entity}: ResourceListProps) => {
  const gmp = useGmp();
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<Model[]>([]);

  const {id, resourceCount, resourceType} = entity;

  useEffect(() => {
    if (!isDefined(entity) || !isDefined(resourceType)) {
      setIsLoading(false);
      return;
    }

    const filter = Filter.fromString(
      'tag_id="' + id + '" rows=' + MAX_RESOURCES,
    );
    const entitiesCommand = gmp[pluralizeType(resourceType)];

    if (!isDefined(entitiesCommand)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const loadResources = async () => {
      try {
        const response: {data: Model[]} = await entitiesCommand.get({filter});
        setResources(response.data);
      } finally {
        setIsLoading(false);
      }
    };

    void loadResources();
  }, [gmp, entity, id, resourceType]);

  const showNotification =
    isDefined(resourceCount) && resourceCount > MAX_RESOURCES;

  if (isLoading) return <Loading />;

  return (
    <Layout flex="column">
      {showNotification && (
        <Notification
          id={id as string}
          resourceType={resourceType as EntityType}
        />
      )}
      <Spacer />
      <ul>
        {resources.map(resource => (
          <li key={resource.id}>
            <DetailsLink
              id={resource.id as string}
              type={resourceType as EntityType}
            >
              {resource.name}
            </DetailsLink>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default ResourceList;
