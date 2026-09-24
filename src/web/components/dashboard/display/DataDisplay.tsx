/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useRef, type ReactNode} from 'react';
import equal from 'fast-deep-equal';
import styled from 'styled-components';
import {type FilterType} from 'gmp/models/filter';
import {type ToString} from 'gmp/types';
import {hasValue, isDefined, isFunction} from 'gmp/utils/identity';
import {
  type DisplayProps,
  type DisplayState,
  type DisplaySetStateFunc,
  type DisplayStateFunc,
} from 'web/components/dashboard/display';
import DataDisplayIcons, {
  type DataDisplayIconsProps,
} from 'web/components/dashboard/display/DataDisplayIcons';
import DisplayContainer, {
  DISPLAY_HEADER_HEIGHT,
  DISPLAY_BORDER_WIDTH,
} from 'web/components/dashboard/display/DisplayContainer';
import useDataTransform, {
  type TransformFunc,
} from 'web/components/dashboard/display/useDataTransform';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

export type DataRowFunc<TData> = (row: TData) => ToString[];
export type DataTitles = ToString[];

type TitleFunc<TData> = ({
  data,
  isLoading,
}: {
  data: TData;
  isLoading?: boolean;
}) => string;

interface IconsRenderProps<
  TState extends DisplayState,
> extends DataDisplayIconsProps<TState> {
  state: TState;
}

type IconsRenderFunc<TState extends DisplayState> = (
  props: IconsRenderProps<TState>,
) => ReactNode;

interface DataDisplayRenderProps<TData, TState extends DisplayState> {
  width: number;
  height: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
  data: TData;
  state: TState;
  setState: DisplaySetStateFunc<TState>;
}

type DataDisplayChildren<TTransformedData, TState extends DisplayState> = (
  props: DataDisplayRenderProps<TTransformedData, TState>,
) => React.ReactNode;

export type DataDisplayProps<
  TData,
  TTransformedData extends Array<unknown>,
  TTransformProps extends object = object,
  TState extends DisplayState = DisplayState,
  TChildren = DataDisplayChildren<TTransformedData, TState>,
> = Omit<DisplayProps<TState>, 'children' | 'title'> & {
  data?: TData;
  dataRow?: DataRowFunc<TTransformedData[number]>;
  dataTitles?: DataTitles;
  dataTransform: TransformFunc<TData, TTransformedData, TTransformProps>;
  filter?: FilterType;
  icons?: IconsRenderFunc<TState>;
  children?: TChildren;
  initialState?: TState;
  onSelectFilterClick?: () => void;
  showFilterSelection?: boolean;
  showFilterString?: boolean;
  showSvgDownload?: boolean;
  showToggleLegend?: boolean;
  title: TitleFunc<TTransformedData>;
} & TTransformProps;

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

const renderIcons = <TState extends DisplayState>(
  props: IconsRenderProps<TState>,
) => {
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

const DataDisplay = <
  TData,
  TProps extends DataDisplayProps<
    TData,
    TTransformedData,
    TTransformProps,
    TState
  >,
  TTransformedData extends Array<unknown>,
  TTransformProps extends object = object,
  TState extends DisplayState = DisplayState,
>({
  children,
  data,
  dataRow,
  dataTitles,
  dataTransform,
  dragHandleRef,
  filter,
  height,
  icons = renderIcons,
  initialState,
  isLoading,
  setState,
  showFilterSelection = false,
  showFilterString = false,
  showSvgDownload = true,
  showToggleLegend = true,
  state,
  title: titleFunc,
  width,
  onSelectFilterClick,
  onRemoveClick,
}: TProps) => {
  const [_] = useTranslation();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);
  const downloadSvgUrlRef = useRef<string | undefined>(undefined);
  const downloadCsvUrlRef = useRef<string | undefined>(undefined);

  const originalData = data;
  const transformedData = useDataTransform(originalData, dataTransform);
  const title = titleFunc({data: transformedData, isLoading});

  const getCurrentState = (newState: TState | undefined = state): TState => {
    return {
      showLegend: true,
      ...initialState,
      ...newState,
    } as TState;
  };

  const cleanupDownloadSvg = useCallback(() => {
    const url = downloadSvgUrlRef.current;
    if (isDefined(url)) {
      URL.revokeObjectURL(url);
      downloadSvgUrlRef.current = undefined;
    }
  }, []);

  const cleanupDownloadCsv = useCallback(() => {
    const url = downloadCsvUrlRef.current;
    if (isDefined(url)) {
      URL.revokeObjectURL(url);
      downloadCsvUrlRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupDownloadSvg();
      cleanupDownloadCsv();
    };
  }, [cleanupDownloadCsv, cleanupDownloadSvg]);

  const handleDownloadSvg = () => {
    const {current: download} = downloadRef;
    const {current: svg} = svgRef;

    if (!svg || !download) {
      // don't crash if refs haven't been set in some way
      return;
    }

    cleanupDownloadSvg();

    const url = createSvgUrl(height, width, svgRef.current);
    downloadSvgUrlRef.current = url;

    download.setAttribute('href', url);
    download.setAttribute('download', 'chart.svg');
    download.click();
  };

  const handleDownloadCsv = () => {
    const {current: download} = downloadRef;

    cleanupDownloadCsv();

    if (!isDefined(dataTitles) || !hasValue(dataRow)) {
      console.warn(
        'DataDisplay: dataTitles or dataRow not defined, cannot download CSV',
      );
      return;
    }

    const csvData = [
      escapeCsv(title),
      dataTitles.map(t => escapeCsv(String(t))).join(','),
      ...transformedData.map(row =>
        dataRow(row)
          .map(val => escapeCsv(String(val)))
          .join(','),
      ),
    ].join('\n');

    const csvBlob = new Blob([csvData], {type: 'text/csv'});
    const url = URL.createObjectURL(csvBlob);
    downloadCsvUrlRef.current = url;

    if (download) {
      download.setAttribute('href', url);
      download.setAttribute('download', 'data.csv');
      download.click();
    }
  };

  const handleSetState = (stateFunc: DisplayStateFunc<TState>): void => {
    setState?.((newState: TState | undefined) =>
      stateFunc(getCurrentState(newState)),
    );
  };

  height = height - DISPLAY_HEADER_HEIGHT;
  width = width - DISPLAY_BORDER_WIDTH;

  isLoading = isLoading && !isDefined(originalData);

  const showCsvDownload = isDefined(dataRow) && isDefined(dataTitles);

  showFilterString = showFilterString && isDefined(filter);
  if (showFilterString) {
    height = height - 20; // padding top + bottom + font size
  }

  const showContent = height > 0 && width > 0; // > 0 also checks for null, undefined and null
  const displayState = getCurrentState();
  return (
    <DisplayContainer
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
                    ? // oxlint-disable-next-line react/refs
                      children({
                        data: transformedData,
                        width,
                        height,
                        svgRef,
                        state: displayState,
                        setState: handleSetState,
                      })
                    : null}
                </>
              )}
            </div>
          )}
          <IconBar>
            <IconDivider flex="column">
              {icons &&
                // oxlint-disable-next-line react/refs
                icons({
                  state: displayState,
                  setState: handleSetState,
                  showFilterSelection,
                  showCsvDownload,
                  showSvgDownload,
                  showToggleLegend,
                  onDownloadCsvClick: handleDownloadCsv,
                  onDownloadSvgClick: handleDownloadSvg,
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
      <Download ref={downloadRef} />
    </DisplayContainer>
  );
};

const areDataDisplayPropsEqual = <
  TData,
  TTransformedData extends Array<unknown>,
  TTransformProps extends object = object,
  TState extends DisplayState = DisplayState,
>(
  previous: Readonly<
    DataDisplayProps<TData, TTransformedData, TTransformProps, TState>
  >,
  next: Readonly<
    DataDisplayProps<TData, TTransformedData, TTransformProps, TState>
  >,
) => {
  const filterChanged = isDefined(previous.filter)
    ? !previous.filter.equals(next.filter)
    : isDefined(next.filter);

  return (
    equal(previous.data, next.data) &&
    previous.height === next.height &&
    previous.width === next.width &&
    previous.isLoading === next.isLoading &&
    previous.showFilterString === next.showFilterString &&
    previous.state === next.state &&
    !filterChanged
  );
};

export default React.memo(DataDisplay, areDataDisplayPropsEqual) as unknown as <
  TData,
  TProps extends DataDisplayProps<
    TData,
    TTransformedData,
    TTransformProps,
    TState
  >,
  TTransformedData extends Array<unknown>,
  TTransformProps extends object = object,
  TState extends DisplayState = DisplayState,
>(
  props: TProps,
) => ReactNode;
