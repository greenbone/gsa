/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React from 'react';
import * as ReactIs from 'react-is';
import styled from 'styled-components';
import Toolbar from 'web/components/bar/Toolbar';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Message from 'web/components/error/Message';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import EntityInfo from 'web/entity/EntityInfo';

interface EntityPageRenderProps {
  activeTab: number;
  onActivateTab: (index: number) => void;
}

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
  img: string;
  title: string;
}

interface EntityError {
  status: number;
  message: string;
}

interface EntityPageProps {
  children: (props: EntityPageRenderProps) => React.ReactNode;
  entity: Entity;
  entityError?: EntityError;
  entityType: string;
  infoComponent?:
    | React.ComponentType<InfoComponentProps>
    | React.ReactElement
    | false;
  isLoading: boolean;
  sectionComponent: React.ComponentType<SectionComponentProps> | false;
  sectionIcon: string;
  title: string;
  toolBarIcons:
    | React.ComponentType<ToolBarIconsComponentProps>
    | React.ReactElement;
  onInteraction: () => void;
}

interface EntityPageState {
  activeTab: number;
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

class EntityPage extends React.Component<EntityPageProps, EntityPageState> {
  constructor(props: EntityPageProps) {
    super(props);
    this.state = {activeTab: 0};

    this.handleActivateTab = this.handleActivateTab.bind(this);
  }

  renderToolbarIcons() {
    const {toolBarIcons: ToolBarIconsComponent, entity, ...other} = this.props;

    if (!isDefined(ToolBarIconsComponent)) {
      return null;
    }

    if (ReactIs.isElement(ToolBarIconsComponent)) {
      return ToolBarIconsComponent;
    }

    return <ToolBarIconsComponent entity={entity} {...other} />;
  }

  handleActivateTab(index: number) {
    const {onInteraction} = this.props;

    this.setState({activeTab: index});

    if (index !== this.state.activeTab && isDefined(onInteraction)) {
      onInteraction();
    }
  }

  renderSection() {
    const {
      children,
      entity,
      sectionIcon,
      sectionComponent: SectionComponent = Section,
      title,
    } = this.props;

    const {activeTab} = this.state;

    if (SectionComponent === false) {
      return null;
    }

    let sectionTitle = title;
    if (isDefined(entity)) {
      sectionTitle = title + ': ' + shorten(entity.name, 80);
    }

    return (
      <SectionComponent
        className="entity-section"
        extra={this.renderInfo()}
        img={sectionIcon}
        title={sectionTitle}
      >
        {children({
          activeTab,
          onActivateTab: this.handleActivateTab,
        })}
      </SectionComponent>
    );
  }

  renderInfo() {
    const {entity} = this.props;
    let {infoComponent: InfoComponent} = this.props;

    if (InfoComponent === false) {
      return null;
    }

    if (ReactIs.isElement(InfoComponent)) {
      return InfoComponent;
    }

    if (!isDefined(InfoComponent)) {
      // @ts-expect-error
      InfoComponent = EntityInfo;
    }

    return (
      <Layout align="start">
        {/* @ts-expect-error */}
        <InfoComponent entity={entity} />
      </Layout>
    );
  }

  render() {
    const {entity, entityError, entityType, isLoading = true} = this.props;

    if (!isDefined(entity)) {
      if (isLoading) {
        return <Loading />;
      }
      if (isDefined(entityError)) {
        if (entityError?.status === 404) {
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
        <Toolbar>{this.renderToolbarIcons()}</Toolbar>
        {this.renderSection()}
      </Layout>
    );
  }
}

export default EntityPage;
