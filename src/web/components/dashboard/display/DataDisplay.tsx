/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {type ReactNode} from 'react';
import equal from 'fast-deep-equal';
import styled from 'styled-components';
import {type FilterType} from 'gmp/models/filter';
import {type ToString} from 'gmp/types';
import {hasValue, isDefined, isFunction} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import DataDisplayIcons, {
  type DataDisplayIconsProps,
} from 'web/components/dashboard/display/DataDisplayIcons';
import Display, {
  DISPLAY_HEADER_HEIGHT,
  DISPLAY_BORDER_WIDTH,
  type DisplayProps,
} from 'web/components/dashboard/display/Display';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import Theme from 'web/utils/theme';
import withTranslation, {
  type WithTranslationComponentProps,
} from 'web/utils/withTranslation';

export interface State {
  showLegend?: boolean;
}

export type DataRowFunc<TData> = (row: TData) => ToString[];
export type DataTitles = ToString[];

export type DisplayStateFunc<TState extends State> = (
  state: TState | undefined,
) => TState;

export type DisplaySetStateFunc<TState extends State> = (
  func: DisplayStateFunc<TState>,
) => void;

type TitleFunc<TData> = ({
  data,
  isLoading,
}: {
  data: TData[];
  isLoading?: boolean;
}) => string;

interface IconsRenderProps<
  TState extends State,
> extends DataDisplayIconsProps<TState> {
  state: TState;
}

type IconsRenderFunc<TState extends State> = (
  props: IconsRenderProps<TState>,
) => ReactNode;

interface DataDisplayRenderProps<TData, TState extends State> {
  width: number;
  height: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
  data: TData[];
  state: TState;
  setState: DisplaySetStateFunc<TState>;
}

export type TransformFunc<
  TData,
  TTransformedData,
  TTransformProps extends object = object,
> = (data: TData, props: TTransformProps) => TTransformedData[];

type DataDisplayChildren<TTransformedData, TState extends State> = (
  props: DataDisplayRenderProps<TTransformedData, TState>,
) => React.ReactNode;

export interface DataDisplayProps<
  TData,
  TState extends State,
  TTransformedData = TData,
  TTransformProps extends object = object,
  TChildren = DataDisplayChildren<TTransformedData, TState>,
> extends Omit<DisplayProps, 'children' | 'title'> {
  data: TData;
  dataRow: (data: TTransformedData) => string[];
  dataTitles: string[];
  dataTransform: TransformFunc<TData, TTransformedData, TTransformProps>;
  filter?: FilterType;
  height: number;
  icons?: IconsRenderFunc<TState>;
  children?: TChildren;
  initialState: TState;
  onSelectFilterClick: () => void;
  setState?: DisplaySetStateFunc<TState>;
  showCsvDownload: boolean;
  showFilterSelection: boolean;
  showFilterString: boolean;
  showSvgDownload: boolean;
  showToggleLegend: boolean;
  state: TState;
  title: TitleFunc<TTransformedData>;
  width: number;
}

type DataDisplayWithTranslationProps<
  TData,
  TState extends State,
  TTransformedData = TData,
  TTransformProps extends object = object,
> = WithTranslationComponentProps &
  DataDisplayProps<TData, TState, TTransformedData, TTransformProps>;

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

const renderIcons = <TState extends State>(props: IconsRenderProps<TState>) => {
  return <DataDisplayIcons {...props} />;
};

const createSvgUrl = (
  height: number,
  width: number,
  svg: SVGSVGElement | null,
) => {
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
};

class DataDisplay<
  TData,
  TProps extends DataDisplayWithTranslationProps<
    TData,
    TState,
    TTransformedData,
    TTransformProps
  >,
  TState extends State,
  TTransformedData,
  TTransformProps extends object = object,
> extends React.Component<TProps, DataDisplayState<TData, TTransformedData>> {
  svgRef: React.RefObject<SVGSVGElement | null>;
  downloadRef: React.RefObject<HTMLAnchorElement | null>;
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
      title: this.props.title({data}),
    };

    this.handleDownloadSvg = this.handleDownloadSvg.bind(this);
    this.handleDownloadCsv = this.handleDownloadCsv.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
  }

  static getDerivedStateFromProps<
    TData,
    TProps extends DataDisplayWithTranslationProps<
      TData,
      TTransformedData,
      TTransformProps,
      TState
    >,
    TTransformedData extends Array<any>,
    TTransformProps extends object = object,
    TState extends DisplayState = DisplayState,
  >(nextProps: TProps, prevState: DataDisplayState<TData, TTransformedData>) {
    if (!equal(prevState.originalData, nextProps.data)) {
      // data has changed update transformed data
      const data = DataDisplay.getTransformedData<
        TData,
        TProps,
        TTransformedData,
        TTransformProps,
        TState
      >(nextProps);
      return {
        data,
        originalData: nextProps.data,
        title: nextProps.title({
          data,
          isLoading: nextProps.isLoading,
        }),
      };
    }
    return null;
  }

  static getTransformedData<
    TData,
    TProps extends DataDisplayWithTranslationProps<
      TData,
      TState,
      TTransformedData,
      TTransformProps
    >,
    TState extends State,
    TTransformedData,
    TTransformProps extends object = object,
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
    nextProps: DataDisplayWithTranslationProps<
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
      nextProps.isLoading !== this.props.isLoading ||
      nextState.data !== this.state.data ||
      nextProps.showFilterString !== this.props.showFilterString ||
      nextProps.state !== this.props.state ||
      this.hasFilterChanged(nextProps)
    );
  }

  hasFilterChanged(
    nextProps: DataDisplayWithTranslationProps<
      TData,
      TState,
      TTransformedData,
      TTransformProps
    >,
  ): boolean {
    if (isDefined(this.props.filter)) {
      return !this.props.filter.equals(nextProps.filter);
    }

    return isDefined(nextProps.filter);
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

    this.downloadSvgUrl = createSvgUrl(
      this.props.height,
      this.props.width,
      this.svgRef.current,
    );

    download.setAttribute('href', this.downloadSvgUrl);
    download.setAttribute('download', 'chart.svg');
    download.click();
  }

  handleDownloadCsv() {
    const {current: download} = this.downloadRef;

    const {dataTitles, dataRow} = this.props;
    const {data, title} = this.state;

    this.cleanupDownloadCsv();

    if (!isDefined(dataTitles) || !hasValue(dataRow)) {
      console.warn(
        'DataDisplay: dataTitles or dataRow not defined, cannot download CSV',
      );
      return;
    }

    const csvData = [
      escapeCsv(title),
      dataTitles.map(t => escapeCsv(String(t))).join(','),
      ...data.map(row =>
        dataRow(row)
          .map(val => escapeCsv(String(val)))
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

  handleSetState(stateFunc: DisplayStateFunc<TState>): void {
    this.props.setState?.((state: TState | undefined) =>
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
    const {_} = this.props;
    const {
      children,
      dataTitles,
      dataRow,
      filter,
      icons = renderIcons,
      showSvgDownload,
      showToggleLegend,
      onSelectFilterClick,
      onRemoveClick,
      dragHandleRef,
    } = this.props;

    height = height - DISPLAY_HEADER_HEIGHT;
    width = width - DISPLAY_BORDER_WIDTH;

    isLoading = isLoading && !isDefined(originalData);

    const showCsvDownload = isDefined(dataRow) && isDefined(dataTitles);

    showFilterString = showFilterString && isDefined(filter);
    if (showFilterString) {
      height = height - 20; // padding top + bottom + font size
    }

    const showContent = height > 0 && width > 0; // > 0 also checks for null, undefined and null
    const state = this.getCurrentState();
    return (
      <Display
        dragHandleRef={dragHandleRef}
        isLoading={isLoading}
        title={`${title}`}
        onRemoveClick={onRemoveClick}
      >
        <DisplayBox>
          <Layout flex="column" grow="1">
            {showContent && (
              <div style={{height, width}}>
                {!isLoading && (
                  <>
                    {isFunction(children)
                      ? children({
                          data: transformedData,
                          width,
                          height,
                          svgRef: this.svgRef,
                          state,
                          setState: this.handleSetState,
                        })
                      : null}
                  </>
                )}
              </div>
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

export default withTranslation(DataDisplay) as unknown as <
  TData,
  TProps extends DataDisplayProps<
    TData,
    TState,
    TTransformedData,
    TTransformProps
  >,
  TState extends State,
  TTransformedData,
  TTransformProps extends object = object,
>(
  props: TProps,
) => ReactNode;
