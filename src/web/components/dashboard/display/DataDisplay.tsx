/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import equal from 'fast-deep-equal';
import _ from 'gmp/locale';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import React from 'react';
import styled from 'styled-components';
import DataDisplayIcons from 'web/components/dashboard/display/DataDisplayIcons';
import Display, {
  DISPLAY_HEADER_HEIGHT,
  DISPLAY_BORDER_WIDTH,
} from 'web/components/dashboard/display/Display';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import Theme from 'web/utils/Theme';

export interface State {
  showLegend?: boolean;
}

type StateFunc<TState extends State> = (state: TState) => TState;
type SetStateFunc<TState extends State> = (func: StateFunc<TState>) => TState;
type TitleFunc<TData> = ({
  data,
  id,
  isLoading,
}: {
  data: TData[];
  id: string;
  isLoading?: boolean;
}) => string;

interface IconsRenderProps<TState extends State> {
  state: TState;
  setState: SetStateFunc<TState>;
  showFilterSelection: boolean;
  showCsvDownload: boolean;
  showSvgDownload: boolean;
  showToggleLegend: boolean;
  onDownloadCsvClick: () => void;
  onDownloadSvgClick: () => void;
  onSelectFilterClick: () => void;
}

interface DataDisplayRenderProps<TData, TState extends State> {
  id: string;
  width: number;
  height: number;
  svgRef: React.RefObject<SVGSVGElement>;
  data: TData[];
  state: TState;
  setState: SetStateFunc<TState>;
}

type TransformFunc<TData, TTransformedData, TTransformProps = object> = (
  data: TData,
  props: TTransformProps,
) => TTransformedData[];

export interface DataDisplayProps<
  TData,
  TState extends State,
  TTransformedData = TData,
  TTransformProps = object,
> {
  data: TData;
  dataRow: (data: TTransformedData) => string[];
  dataTitles: string[];
  dataTransform: TransformFunc<TData, TTransformedData, TTransformProps>;
  filter?: Filter;
  height: number;
  icons: (props: IconsRenderProps<TState>) => React.ReactNode;
  children: (
    props: DataDisplayRenderProps<TTransformedData, TState>,
  ) => React.ReactNode;
  id: string;
  initialState: TState;
  isLoading: boolean;
  onRemoveClick: () => void;
  onSelectFilterClick: () => void;
  setState: SetStateFunc<TState>;
  showCsvDownload: boolean;
  showFilterSelection: boolean;
  showFilterString: boolean;
  showSvgDownload: boolean;
  showToggleLegend: boolean;
  state: TState;
  title: TitleFunc<TTransformedData>;
  width: number;
}

interface DataDisplayState<TData, TTransformedData> {
  data: TTransformedData[];
  originalData: TData;
  title: string;
}

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

const escapeCsv = (value: string) => '"' + `${value}`.replace(/"/g, '""') + '"';

const renderIcons = props => <DataDisplayIcons {...props} />;

class DataDisplay<
  TData,
  TProps extends DataDisplayProps<
    TData,
    TState,
    TTransformedData,
    TTransformProps
  >,
  TState extends State,
  TTransformedData,
  TTransformProps extends object,
> extends React.Component<TProps, DataDisplayState<TData, TTransformedData>> {
  svgRef: React.RefObject<SVGSVGElement>;
  downloadRef: React.RefObject<HTMLAnchorElement>;
  downloadSvgUrl?: string;
  downloadCsvUrl?: string;

  constructor(props: TProps) {
    super(props);

    this.svgRef = React.createRef();
    this.downloadRef = React.createRef();

    const data = DataDisplay.getTransformedData<
      TData,
      TProps,
      TState,
      TTransformedData,
      TTransformProps
    >(this.props);
    this.state = {
      data,
      originalData: this.props.data,
      title: this.props.title({data, id: this.props.id}),
    };

    this.handleDownloadSvg = this.handleDownloadSvg.bind(this);
    this.handleDownloadCsv = this.handleDownloadCsv.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
  }

  static getDerivedStateFromProps<
    TData,
    TProps extends DataDisplayProps<
      TData,
      TState,
      TTransformedData,
      TTransformProps
    >,
    TState extends State,
    TTransformedData,
    TTransformProps = object,
  >(nextProps: TProps, prevState: DataDisplayState<TData, TTransformedData>) {
    if (!equal(prevState.originalData, nextProps.data)) {
      // data has changed update transformed data
      const data = DataDisplay.getTransformedData<
        TData,
        TProps,
        TState,
        TTransformedData,
        TTransformProps
      >(nextProps);
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

  static getTransformedData<
    TData,
    TProps extends DataDisplayProps<
      TData,
      TState,
      TTransformedData,
      TTransformProps
    >,
    TState extends State,
    TTransformedData,
    TTransformProps = object,
  >(props: Readonly<TProps>) {
    const {data, dataTransform, ...other} = props;

    const transformProps = excludeObjectProps(
      other,
      ownProps,
    ) as TTransformProps;

    return dataTransform(data, transformProps);
  }

  componentWillUnmount() {
    this.cleanupDownloadSvg();
  }

  shouldComponentUpdate(
    nextProps: DataDisplayProps<
      TData,
      TState,
      TTransformedData,
      TTransformProps
    >,
    nextState: DataDisplayState<TData, TTransformedData>,
  ) {
    return (
      nextProps.height !== this.props.height ||
      nextProps.width !== this.props.width ||
      nextState.data !== this.state.data ||
      nextProps.showFilterString !== this.props.showFilterString ||
      nextProps.state !== this.props.state ||
      this.hasFilterChanged(nextProps)
    );
  }

  hasFilterChanged(
    nextProps: DataDisplayProps<
      TData,
      TState,
      TTransformedData,
      TTransformProps
    >,
  ): boolean {
    if (isDefined(this.props.filter)) {
      // @ts-ignore-error
      return this.props.filter.equals(nextProps.filter);
    }

    return isDefined(nextProps.filter);
  }

  createSvgUrl() {
    const {current: svg} = this.svgRef;
    const {height, width} = this.props;

    const svgData = `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN"
     "http://www.w3.org/TR/SVG/DTD/svg10.dtd">
      <svg
       xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink"
       viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        ${svg ? svg.innerHTML : ''}
      </svg>`;

    const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
    return URL.createObjectURL(svgBlob);
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

  getCurrentState(state: TState = this.props.state): TState {
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

    const csvData = [
      escapeCsv(title),
      dataTitles.map(t => escapeCsv(t)).join(','),
      ...data.map(row =>
        dataRow(row)
          .map(val => escapeCsv(val))
          .join(','),
      ),
    ].join('\n');

    const csvBlob = new Blob([csvData], {type: 'text/csv'});
    this.downloadCsvUrl = URL.createObjectURL(csvBlob);

    if (download) {
      download.setAttribute('href', this.downloadCsvUrl);
      download.setAttribute('download', 'data.csv');
      download.click();
    }
  }

  handleSetState(stateFunc: StateFunc<TState>): TState {
    return this.props.setState((state: TState) =>
      stateFunc(this.getCurrentState(state)),
    );
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
                <>
                  {children({
                    id,
                    data: transformedData,
                    width,
                    height,
                    svgRef: this.svgRef,
                    state,
                    setState: this.handleSetState,
                  })}
                </>
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
            {showFilterString && isDefined(filter) && (
              <FilterString>
                ({_('Applied filter: ')}
                {/* @ts-ignore-error */}
                <b>{filter.name}</b>&nbsp;
                {/* @ts-ignore-error */}
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

export default DataDisplay;
