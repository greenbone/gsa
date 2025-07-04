/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import * as ReactIs from 'react-is';
import styled from 'styled-components';
import {typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import Toolbar from 'web/components/bar/Toolbar';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Message from 'web/components/error/Message';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import EntityInfo from 'web/entity/EntityInfo';
import useTranslation from 'web/hooks/useTranslation';

export interface Entity {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface InfoComponentProps {
  entity: Entity;
  [key: string]: unknown;
}

interface ToolBarIconsComponentProps {
  entity: Entity;
  [key: string]: unknown;
}

interface SectionComponentProps {
  className: string;
  children: React.ReactNode;
  extra: React.ReactNode;
  img: React.ReactElement;
  title: string;
}

interface EntityError {
  status: number;
  message: string;
}

interface EntityPageProps {
  children: () => React.ReactNode;
  entity: Entity;
  entityError?: EntityError;
  entityType: string;
  infoComponent?:
    | React.ComponentType<InfoComponentProps>
    | React.ReactElement
    | false;
  isLoading: boolean;
  sectionComponent?: React.ComponentType<SectionComponentProps> | false;
  sectionIcon: React.ReactElement;
  title: string;
  toolBarIcons:
    | React.ComponentType<ToolBarIconsComponentProps>
    | React.ReactElement;
  onInteraction: () => void;
  [key: string]: unknown;
}

export const Col = styled.col`
  width: ${props => props.width};
`;

const ErrorContent = styled.div`
  white-space: pre;
`;

const MessageContent = styled.div`
  white-space: pre;
`;

const EntityPage: React.FC<EntityPageProps> = ({
  children,
  infoComponent: InfoComponent,
  sectionIcon,
  sectionComponent: SectionComponent,
  entity,
  entityError,
  entityType,
  isLoading = true,
  title,
  toolBarIcons: ToolBarIconsComponent,
  onInteraction,
  ...props
}: EntityPageProps) => {
  const [_] = useTranslation();

  const renderToolbarIcons = () => {
    if (ReactIs.isElement(ToolBarIconsComponent)) {
      return ToolBarIconsComponent;
    }

    if (ReactIs.isValidElementType(ToolBarIconsComponent)) {
      return <ToolBarIconsComponent entity={entity} {...props} />;
    }

    return null;
  };

  const renderInfo = () => {
    if (!isDefined(InfoComponent)) {
      // @ts-expect-error
      InfoComponent = EntityInfo;
    }

    if (ReactIs.isElement(InfoComponent)) {
      return <Layout align="start">{InfoComponent}</Layout>;
    }

    if (ReactIs.isValidElementType(InfoComponent)) {
      return (
        <Layout align="start">
          <InfoComponent entity={entity} />
        </Layout>
      );
    }

    return null;
  };

  const renderSection = () => {
    if (!isDefined(SectionComponent)) {
      // @ts-expect-error
      SectionComponent = Section;
    }
    if (SectionComponent === false) {
      return null;
    }

    let sectionTitle = title;
    if (isDefined(entity)) {
      sectionTitle = title + ': ' + shorten(entity.name, 80);
    }

    return (
      // @ts-expect-error
      <SectionComponent
        className="entity-section"
        extra={renderInfo()}
        img={sectionIcon}
        title={sectionTitle}
      >
        {children()}
      </SectionComponent>
    );
  };

  if (!isDefined(entity)) {
    if (isLoading) {
      return <Loading />;
    }
    if (isDefined(entityError)) {
      if (entityError.status === 404) {
        let content = _(
          '\nYou might have followed an incorrect link and the {{entity}} ' +
            'does not exist.',
          {entity: typeName(entityType)},
        );

        if (entityType === 'cpe') {
          content = _(
            '\nThis could have the following reasons:\n' +
              '1. The CPE might not be included in the official NVD CPE dictionary ' +
              'yet, and no additional information is available.\n' +
              '2. You might have followed an incorrect link and the CPE does ' +
              'not exist.',
          );
        }

        if (entityType === 'cve') {
          content = _(
            '\nThis could have the following reasons:\n' +
              '1. The CVE might not be included in the SCAP database yet. ' +
              'For new CVEs it can take a month or more until they become ' +
              'available.\n' +
              '2. You might have followed an incorrect link and the CVE does ' +
              'not exist.',
          );
        }

        if (entityType === 'cpe' || entityType === 'cve') {
          return (
            <Message
              flex="column"
              message={_(
                'The {{entity}} you were looking for could not be found.',
                {
                  entity: typeName(entityType),
                },
              )}
            >
              <MessageContent>{content}</MessageContent>
            </Message>
          );
        }

        return (
          <ErrorMessage
            flex="column"
            message={_(
              'The {{entity}} you were looking for could not be found.',
              {
                entity: typeName(entityType),
              },
            )}
          >
            <ErrorContent>{content}</ErrorContent>
          </ErrorMessage>
        );
      }

      return <ErrorMessage message={entityError.message} />;
    }
    return null;
  }

  return (
    <Layout align="start" flex="column" grow="1">
      <Toolbar>{renderToolbarIcons()}</Toolbar>
      {renderSection()}
    </Layout>
  );
};

export default EntityPage;
