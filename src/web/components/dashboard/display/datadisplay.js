/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled from 'styled-components';

import equal from 'fast-deep-equal';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import Display, {DISPLAY_HEADER_HEIGHT, DISPLAY_BORDER_WIDTH} from './display';
import DataDisplayIcons from './datadisplayicons';

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
  'showFilterString',
  'onRemoveClick',
];

const Download = styled.a`
  color: ${Theme.black};
  text-decoration: none;
  display: none;
  &:link {
    color: ${Theme.black};
    text-decoration: none;
  }
  &:hover {
    color: ${Theme.white};
    text-decoration: none;
  }
`;

const FilterString = styled.div`
  font-size: 10px;
  color: ${Theme.mediumGray};
  padding: 5px;
  overflow: hidden;
`;

const IconBar = styled.div`
  height: 100%;
  width: 26px;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: start;
  padding-top: 5px;
  position: absolute;
  right: 0;
  z-index: ${Theme.Layers.higher};
  background: ${Theme.lightGray};
  opacity: 0;
  transition: opacity 500ms;
`;

const DisplayBox = styled.div`
  display: flex;
  flex-grow: 1;
  position: relative;

  &:hover ${IconBar} {
    opacity: 1;
    transition: opacity 500ms;
  }
`;

const escapeCsv = value => '"' + `${value}`.replace('"', '""') + '"';

const renderIcons = props => <DataDisplayIcons {...props} />;

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

    this.handleDownloadSvg = this.handleDownloadSvg.bind(this);
    this.handleDownloadCsv = this.handleDownloadCsv.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
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

    const tprops = excludeObjectProps(other, ownProps);

    return isDefined(dataTransform) ? dataTransform(data, tprops) : data;
  }

  componentWillUnmount() {
    this.cleanupDownloadSvg();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.height !== this.props.height ||
      nextProps.width !== this.props.width ||
      nextState.data !== this.state.data ||
      nextProps.showFilterString !== this.props.showFilterString ||
      nextProps.state !== this.props.state ||
      this.hasFilterChanged(nextProps)
    );
  }

  hasFilterChanged(nextProps) {
    if (isDefined(this.props.filter)) {
      return this.props.filter.equals(nextProps.filter);
    }

    return isDefined(nextProps.filter);
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

  cleanupDownloadSvg() {
    if (isDefined(this.downloadSvgUrl)) {
      URL.revokeObjectURL(this.downloadSvgUrl);
      this.downloadSvgUrl = undefined;
    }
  }

  cleanupDownloadCsv() {
    if (isDefined(this.downloadCsvUrl)) {
      URL.revokeObjectURL(this.downloadCsvUrl);
      this.downloadCsvUrl = undefined;
    }
  }

  getCurrentState(state = this.props.state) {
    return {
      showLegend: true,
      ...this.props.initialState,
      ...state,
    };
  }

  handleDownloadSvg() {
    const {current: download} = this.downloadRef;
    const {current: svg} = this.svgRef;

    if (!svg || !download) {
      // don't crash if refs haven't been set in some way
      return;
    }

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
      ...data.map(row =>
        dataRow(row)
          .map(val => escapeCsv(val))
          .join(','),
      ),
    ].join('\n');

    const csv_blob = new Blob([csv_data], {type: 'text/csv'});
    this.downloadCsvUrl = URL.createObjectURL(csv_blob);

    download.setAttribute('href', this.downloadCsvUrl);
    download.setAttribute('download', 'data.csv');
    download.click();
  }

  handleSetState(stateFunc) {
    return this.props.setState(state => stateFunc(this.getCurrentState(state)));
  }

  render() {
    const {data: transformedData, title} = this.state;
    let {
      data: originalData,
      height,
      width,
      isLoading,
      showFilterString = false,
      showFilterSelection = false,
    } = this.props;
    const {
      children,
      id,
      dataTitles,
      dataRow,
      filter,
      icons = renderIcons,
      showSvgDownload,
      showToggleLegend,
      onSelectFilterClick,
      onRemoveClick,
      ...props
    } = this.props;

    height = height - DISPLAY_HEADER_HEIGHT;
    width = width - DISPLAY_BORDER_WIDTH;

    isLoading = isLoading && !isDefined(originalData);

    const otherProps = excludeObjectProps(props, ownProps);
    const showCsvDownload = isDefined(dataRow) && isDefined(dataTitles);

    showFilterString = showFilterString && isDefined(filter);
    if (showFilterString) {
      height = height - 20; // padding top + bottom + font size
    }

    const showContent = height > 0 && width > 0; // > 0 also checks for null, undefined and null
    const state = this.getCurrentState();
    return (
      <Display title={`${title}`} onRemoveClick={onRemoveClick} {...otherProps}>
        <DisplayBox>
          <Layout flex="column" grow="1">
            {isLoading ? (
              <Loading />
            ) : (
              showContent && (
                <React.Fragment>
                  {children({
                    id,
                    data: transformedData,
                    width,
                    height,
                    svgRef: this.svgRef,
                    state,
                    setState: this.handleSetState,
                  })}
                </React.Fragment>
              )
            )}
            <IconBar>
              <IconDivider flex="column">
                {icons &&
                  icons({
                    state,
                    setState: this.handleSetState,
                    showFilterSelection,
                    showCsvDownload,
                    showSvgDownload,
                    showToggleLegend,
                    onDownloadCsvClick: this.handleDownloadCsv,
                    onDownloadSvgClick: this.handleDownloadSvg,
                    onSelectFilterClick,
                  })}
              </IconDivider>
            </IconBar>
            {showFilterString && (
              <FilterString>
                ({_('Applied filter: ')}
                <b>{filter.name}</b>&nbsp;
                <i>{filter.simple().toFilterString()}</i>)
              </FilterString>
            )}
          </Layout>
        </DisplayBox>
        <Download ref={this.downloadRef} />
      </Display>
    );
  }
}

DataDisplay.propTypes = {
  children: PropTypes.func.isRequired,
  data: PropTypes.any,
  dataRow: PropTypes.func,
  dataTitles: PropTypes.arrayOf(PropTypes.toString),
  dataTransform: PropTypes.func,
  filter: PropTypes.filter,
  height: PropTypes.number.isRequired,
  icons: PropTypes.func,
  id: PropTypes.string.isRequired,
  initialState: PropTypes.object,
  isLoading: PropTypes.bool,
  setState: PropTypes.func,
  showFilterSelection: PropTypes.bool,
  showFilterString: PropTypes.bool,
  showSvgDownload: PropTypes.bool,
  showToggleLegend: PropTypes.bool,
  state: PropTypes.object,
  title: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
  onSelectFilterClick: PropTypes.func,
};

export default DataDisplay;

// vim: set ts=2 sw=2 tw=80:
