/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import equal from 'fast-deep-equal';

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';
import {exclude_object_props} from 'gmp/utils/object';

import PropTypes from '../../../utils/proptypes';
import Theme from '../../../utils/theme';

import Loading from '../../../components/loading/loading';

import MenuEntry from '../../menu/menuentry';

import Display, {
  DISPLAY_HEADER_HEIGHT,
} from './display';
import DisplayMenu from './displaymenu';

const ownProps = [
  'title',
  'dataTransform',
  'data',
  'isLoading',
  'menu',
  'height',
  'width',
  'id',
  'onRemoveClick',
];

const Download = glamorous.a({
  color: Theme.black,
  textDecoration: 'none',
  '&:link': {
    color: Theme.black,
    textDecoration: 'none',
  },
  '&:hover': {
    color: Theme.white,
    textDecoration: 'none',
  },
});

class DataDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.svgRef = React.createRef();
    this.downloadRef = React.createRef();

    this.state = {
      data: DataDisplay.getTransformedData(this.props),
      originalData: this.props.data,
    };

    this.handleOpenCopyableSvg = this.handleOpenCopyableSvg.bind(this);
    this.handleDownloadSvg = this.handleDownloadSvg.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!equal(prevState.originalData, nextProps.data)) {
      // data has changed update transformed data
      return {
        data: DataDisplay.getTransformedData(nextProps),
        originalData: nextProps.data,
      };
    }
    return null;
  }

  static getTransformedData(props) {
    const {data, dataTransform, ...other} = props;

    const tprops = exclude_object_props(other, ownProps);

    return is_defined(dataTransform) ?
      dataTransform(data, tprops) : data;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.height !== this.props.height ||
      nextProps.width !== this.props.width ||
      nextState.data !== this.state.data ||
      nextState.hasSvg !== this.state.hasSvg;
  }

  createSvgUrl() {
    const {current: svg} = this.svgRef;
    const {height, width} = this.props;

    const svg_data = `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN"
     "http://www.w3.org/TR/SVG/DTD/svg10.dtd">
      <svg
       xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink"
       viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        ${svg.innerHTML}
      </svg>`;


    const svg_blob = new Blob([svg_data], {type: 'image/svg+xml'});
    return URL.createObjectURL(svg_blob);
  }

  handleOpenCopyableSvg() {
    const {document} = window.open('', '_blank');

    const body = document.querySelector('body');
    const img = document.createElement('img');

    img.setAttribute('src', this.createSvgUrl());

    body.appendChild(img);
  }

  cleanupDownloadSvg() {
    if (is_defined(this.downloadSvgUrl)) {
      URL.revokeObjectURL(this.downloadSvgUrl);
      this.downloadSvgUrl = undefined;
    }
  }

  handleDownloadSvg() {
    const {current: download} = this.downloadRef;

    this.cleanupDownloadSvg();

    this.downloadSvgUrl = this.createSvgUrl();

    download.setAttribute('href', this.downloadSvgUrl);
  }

  componentWillUnmount() {
    this.cleanupDownloadSvg();
  }

  setHasSvg() {
    const {current: svg} = this.svgRef;

    this.setState({hasSvg: svg !== null});
  }

  componentDidUpdate() {
    this.setHasSvg();
  }

  componentDidMount() {
    this.setHasSvg();
  }

  render() {
    const {data: transformedData} = this.state;
    let {
      data: originalData,
      height,
      isLoading,
    } = this.props;
    const {
      children,
      menu,
      id,
      width,
      title,
      onRemoveClick,
      ...props
    } = this.props;

    const {hasSvg = false} = this.state;

    height = height - DISPLAY_HEADER_HEIGHT;

    isLoading = isLoading && !is_defined(originalData);

    const otherProps = exclude_object_props(props, ownProps);
    return (
      <Display
        menu={
          hasSvg ?
            <DisplayMenu>
              <MenuEntry onClick={this.handleOpenCopyableSvg}>
                {_('Show copyable SVG')}
              </MenuEntry>
              <MenuEntry onClick={this.handleDownloadSvg}>
                <Download download="chart.svg" innerRef={this.downloadRef}>
                  {_('Download SVG')}
                </Download>
              </MenuEntry>
            </DisplayMenu> : null
        }
        title={isLoading ? _('Loading') : title({data: transformedData, id})}
        onRemoveClick={onRemoveClick}
        {...otherProps}
      >
        {isLoading ?
          <Loading/> :
          children({
            id,
            data: transformedData,
            width,
            height,
            svgRef: this.svgRef,
          })
        }
      </Display>
    );
  }
}

DataDisplay.propTypes = {
  children: PropTypes.func.isRequired,
  data: PropTypes.any,
  dataTransform: PropTypes.func,
  height: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  menu: PropTypes.element,
  title: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
};

export default DataDisplay;

// vim: set ts=2 sw=2 tw=80:
