/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import Loading from '../loading.js';
import PropTypes from '../proptypes.js';
import Section from '../section.js';
import Toolbar from '../toolbar.js';

import EntityInfo from './info.js';

class EntityPage extends React.Component {

  renderToolbarIcons() {
    const {toolBarIcons, entity, ...other} = this.props;

    if (!is_defined(toolBarIcons)) {
      return null;
    }

    return React.createElement(toolBarIcons, {entity, ...other});
  }

  renderSection() {
    const {entity, sectionIcon, foldable, title} = this.props;
    let SectionComponent = this.props.section;

    if (SectionComponent === false) {
      return null;
    }

    if (!is_defined(SectionComponent)) {
      SectionComponent = Section;
    }

    let section_title = title;
    if (is_defined(entity)) {
      section_title = title + ': ' + entity.name;
    }

    const Details = this.props.details;

    return (
      <SectionComponent
        title={section_title}
        className="entity-section"
        img={sectionIcon}
        foldable={foldable}
      >
        <Details
          entity={entity}
        />
      </SectionComponent>
    );
  }

  renderInfo() {
    const {entity} = this.props;
    let InfoComponent = this.props.info;

    if (InfoComponent === false) {
      return null;
    }

    if (!is_defined(InfoComponent)) {
      InfoComponent = EntityInfo;
    }

    return (
      <Layout flex align="end">
        <InfoComponent
          entity={entity}
        />
      </Layout>
    );
  }

  render() {
    const {loading} = this.props;
    if (loading) {
      return (
        <Loading loading={loading}/>
      );
    }
    return (
      <Layout flex="column">
        <Toolbar>
          {this.renderToolbarIcons()}
        </Toolbar>
        {this.renderInfo()}
        {this.renderSection()}
      </Layout>
    );
  }
}

EntityPage.propTypes = {
  details: PropTypes.component,
  entity: PropTypes.model,
  foldable: PropTypes.bool,
  info: PropTypes.componentOrFalse,
  loading: PropTypes.bool,
  sectionIcon: PropTypes.icon,
  section: PropTypes.componentOrFalse,
  title: PropTypes.string,
  toolBarIcons: PropTypes.component,
};

export default EntityPage;

// vim: set ts=2 sw=2 tw=80:
