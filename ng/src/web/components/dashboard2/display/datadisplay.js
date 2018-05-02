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
  DISPLAY_HEADER_HEIGHT, DISPLAY_BORDER_WIDTH,
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
  'dataTitles',
  'dataRow',
  'onRemoveClick',
];

const Download = glamorous.a({
  color: Theme.black,
  textDecoration: 'none',
  display: 'none',
  '&:link': {
    color: Theme.black,
    textDecoration: 'none',
  },
  '&:hover': {
    color: Theme.white,
    textDecoration: 'none',
  },
});

const escapeCsv = value => '"' + `${value}`.replace('"', '""') + '"';

class DataDisplay extends React.Component {

  constructor(...args) {
    super(...args);

    this.svgRef = React.createRef();
    this.downloadRef = React.createRef();

    const data = DataDisplay.getTransformedData(this.props);
    this.state = {
      data,
      originalData: this.props.data,
      title: this.props.title({data, id: this.props.id}),
    };

    this.handleOpenCopyableSvg = this.handleOpenCopyableSvg.bind(this);
    this.handleDownloadSvg = this.handleDownloadSvg.bind(this);
    this.handleDownloadCsv = this.handleDownloadCsv.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!equal(prevState.originalData, nextProps.data)) {
      // data has changed update transformed data
      const data = DataDisplay.getTransformedData(nextProps);
      return {
        data,
        originalData: nextProps.data,
        title: nextProps.title({
          data,
          id: nextProps.id,
          isLoading: nextProps.isLoading,
        }),
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
    const {title} = this.state;
    const {document} = window.open('', '_blank');

    const head = document.querySelector('head');

    // add a title to the new document
    const titleEl = document.createElement('title');
    titleEl.appendChild(document.createTextNode(title));
    head.appendChild(titleEl);

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

  cleanupDownloadCsv() {
    if (is_defined(this.downloadCsvUrl)) {
      URL.revokeObjectURL(this.downloadCsvUrl);
      this.downloadCsvUrl = undefined;
    }
  }

  handleDownloadSvg() {
    const {current: download} = this.downloadRef;

    this.cleanupDownloadSvg();

    this.downloadSvgUrl = this.createSvgUrl();

    download.setAttribute('href', this.downloadSvgUrl);
    download.setAttribute('download', 'chart.svg');
    download.click();
  }

  handleDownloadCsv() {
    const {current: download} = this.downloadRef;

    const {dataTitles, dataRow} = this.props;
    const {data, title} = this.state;

    this.cleanupDownloadCsv();

    const csv_data = [
      escapeCsv(title),
      dataTitles.map(t => escapeCsv(t)).join(','),
      ...data.map(row => dataRow({row}).map(val => escapeCsv(val)).join(',')),
    ].join('\n');

    const csv_blob = new Blob([csv_data], {type: 'text/csv'});
    this.downloadCsvUrl = URL.createObjectURL(csv_blob);

    download.setAttribute('href', this.downloadCsvUrl);
    download.setAttribute('download', 'data.csv');
    download.click();
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
    const {data: transformedData, title} = this.state;
    let {
      data: originalData,
      height,
      width,
      isLoading,
    } = this.props;
    const {
      children,
      menu,
      id,
      dataTitles,
      dataRow,
      onRemoveClick,
      ...props
    } = this.props;

    const {hasSvg = false} = this.state;

    height = height - DISPLAY_HEADER_HEIGHT;
    width = width - DISPLAY_BORDER_WIDTH;

    isLoading = isLoading && !is_defined(originalData);

    const otherProps = exclude_object_props(props, ownProps);
    const showDataMenus = is_defined(dataRow) && is_defined(dataTitles);
    return (
      <Display
        menu={
          showDataMenus || hasSvg ?
            <DisplayMenu>
              {hasSvg &&
                <MenuEntry onClick={this.handleOpenCopyableSvg}>
                  {_('Show copyable SVG')}
                </MenuEntry>
              }
              {showDataMenus &&
                <MenuEntry onClick={this.handleDownloadCsv}>
                  {_('Download CSV')}
                </MenuEntry>
              }
              {hasSvg &&
                <MenuEntry onClick={this.handleDownloadSvg}>
                  {_('Download SVG')}
                </MenuEntry>
              }
            </DisplayMenu> : null
        }
        title={title}
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
        <Download innerRef={this.downloadRef}>
        </Download>
      </Display>
    );
  }
}

DataDisplay.propTypes = {
  children: PropTypes.func.isRequired,
  data: PropTypes.any,
  dataRow: PropTypes.func,
  dataTitles: PropTypes.arrayOf(PropTypes.string),
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
