/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import Toolbar from '../components/bar/toolbar.js';

import Layout from '../components/layout/layout.js';

import Loading from '../components/loading/loading.js';

import IconSizeProvider from '../components/provider/iconsizeprovider.js';

import Section from '../components/section/section.js';

import EntityInfo from './info.js';
import EntityPermissions from './permissions.js';
import EntityTags from './tags.js';

class EntityPage extends React.Component {

  renderToolbarIcons() {
    const {toolBarIcons, entity, ...other} = this.props;

    if (!is_defined(toolBarIcons)) {
      return null;
    }

    return (
      <IconSizeProvider size="medium">
        {React.createElement(toolBarIcons, {entity, ...other})}
      </IconSizeProvider>
    );
  }

  renderSection() {
    const {
      detailsComponent: Details,
      entity,
      foldable,
      sectionIcon,
      sectionComponent: SectionComponent = Section,
      title,
      ...other
    } = this.props;

    if (SectionComponent === false) {
      return null;
    }

    let section_title = title;
    if (is_defined(entity)) {
      section_title = title + ': ' + entity.name;
    }

    return (
      <SectionComponent
        title={section_title}
        className="entity-section"
        img={sectionIcon}
        foldable={foldable}
      >
        {this.renderInfo()}
        <Details
          {...other}
          entity={entity}
        />
      </SectionComponent>
    );
  }

  renderInfo() {
    const {entity} = this.props;
    let {infoComponent: InfoComponent} = this.props;

    if (InfoComponent === false) {
      return null;
    }

    if (!is_defined(InfoComponent)) {
      InfoComponent = EntityInfo;
    }

    return (
      <Layout flex align="start">
        <InfoComponent
          entity={entity}
        />
      </Layout>
    );
  }

  renderUserTags() {
    const {
      entity,
      tagsComponent: TagsComponent = EntityTags,
      onTagAddClick,
      onTagDeleteClick,
      onTagDisableClick,
      onTagEditClick,
      onTagEnableClick,
      onTagCreateClick,
    } = this.props;
    if (TagsComponent === false) {
      return null;
    }

    return (
      <TagsComponent
        entity={entity}
        onTagAddClick={onTagAddClick}
        onTagDeleteClick={onTagDeleteClick}
        onTagDisableClick={onTagDisableClick}
        onTagEditClick={onTagEditClick}
        onTagEnableClick={onTagEnableClick}
        onTagCreateClick={onTagCreateClick}
      />
    );
  }

  renderPermissions() {
    const {
      entity,
      permissions,
      permissionsComponent: PermissionsComponent = EntityPermissions,
      onPermissionChanged,
      onPermissionDownloaded,
      onPermissionDownloadError,
    } = this.props;

    if (PermissionsComponent === false) {
      return null;
    }

    return (
      <PermissionsComponent
        entity={entity}
        permissions={is_defined(permissions) ? permissions.entities : undefined}
        onChanged={onPermissionChanged}
        onDownloaded={onPermissionDownloaded}
        onError={onPermissionDownloadError}
      />
    );
  }

  render() {
    const {entity, loading} = this.props;

    if (!is_defined(entity)) {
      if (loading) {
        return (
          <Loading loading={loading}/>
        );
      }
      return null;
    }

    return (
      <Layout
        flex="column"
        align="start"
        grow="1"
      >
        <Toolbar>
          {this.renderToolbarIcons()}
        </Toolbar>
        {this.renderSection()}
        {this.renderUserTags()}
        {this.renderPermissions()}
      </Layout>
    );
  }
}

EntityPage.propTypes = {
  detailsComponent: PropTypes.component.isRequired,
  entity: PropTypes.model,
  foldable: PropTypes.bool,
  infoComponent: PropTypes.componentOrFalse,
  loading: PropTypes.bool,
  permissions: PropTypes.object,
  permissionsComponent: PropTypes.componentOrFalse,
  sectionComponent: PropTypes.componentOrFalse,
  sectionIcon: PropTypes.icon,
  tagsComponent: PropTypes.componentOrFalse,
  title: PropTypes.string,
  toolBarIcons: PropTypes.component,
  onPermissionChanged: PropTypes.func,
  onPermissionDownloadError: PropTypes.func,
  onPermissionDownloaded: PropTypes.func,
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
};

export default EntityPage;

// vim: set ts=2 sw=2 tw=80:
