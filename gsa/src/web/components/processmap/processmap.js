/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import {v4 as uuid} from 'uuid';

import {_} from 'gmp/locale/lang';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';
import {exclude} from 'gmp/utils/object';

import Group from 'web/components/chart/group';
import ToolTip from 'web/components/chart/tooltip';
import ConfirmationDialog from 'web/components/dialog/confirmationdialog';
import ErrorDialog from 'web/components/dialog/errordialog';
import ErrorBoundary from 'web/components/error/errorboundary';

import {selector as hostSelector} from 'web/store/entities/hosts';
import {selector as resultSelector} from 'web/store/entities/results';

import {saveBusinessProcessMap} from 'web/store/businessprocessmaps/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import Background from './background';
import CreateProcessDialog from './createprocessdialog';
import Edge from './edge';
import ProcessNode from './processnode';
import ProcessPanel from './processpanel';
import Tools from './tools';

import {createTag, createToolTipContent, deleteTag, editTag} from './utils';

export const MAX_PROCESSES = 50;

const DEFAULT_PROCESS_SIZE = 75;

const BPM_TAG_PREFIX = 'myBP:';

const SCROLL_STEP = 0.1;

const DEFAULT_SCALE = 0.7;
const MAX_SCALE = 1.6;
const MIN_SCALE = 0.2;

const Wrapper = styled.div`
  display: flex;
  position: relative;
  height: 100%;
  width: 100%;
`;

const Map = styled.svg`
  display: flex;
  position: relative;
  width: 100%;
  align-content: stretch;
  cursor: ${props => props.cursor};
`;

const log = logger.getLogger('gmp.commands.tags');

class ProcessMap extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      confirmDeleteDialogVisible: false,
      createProcessDialogVisible: false,
      edgeDrawSource: undefined,
      edgeDrawTarget: undefined,
      tagErrorDialogVisible: false,
      scale: DEFAULT_SCALE,
      translateX: 0,
      translateY: 0,
      isDraggingBackground: false,
      isDraggingProcess: false,
      isDrawingEdge: false,
    };

    this.svg = React.createRef();

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);

    this.handleCloseCreateProcessDialog = this.handleCloseCreateProcessDialog.bind(
      this,
    );
    this.handleAddHosts = this.handleAddHosts.bind(this);
    this.handleDeleteHosts = this.handleDeleteHosts.bind(this);
    this.handleDrawEdge = this.handleDrawEdge.bind(this);
    this.handleCreateEdge = this.handleCreateEdge.bind(this);
    this.handleCreateProcess = this.handleCreateProcess.bind(this);
    this.handleInteraction = this.handleInteraction.bind(this);
    this.handleSelectElement = this.handleSelectElement.bind(this);
    this.handleSelectHost = this.handleSelectHost.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleProcessChange = this.handleProcessChange.bind(this);
    this.handleDeleteElement = this.handleDeleteElement.bind(this);

    this.keyDownListener = this.keyDownListener.bind(this);
    this.handleOpenCreateProcessDialog = this.handleOpenCreateProcessDialog.bind(
      this,
    );
    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.openCreateProcessDialog = this.openCreateProcessDialog.bind(this);
    this.openConfirmDeleteDialog = this.openConfirmDeleteDialog.bind(this);
    this.closeConfirmDeleteDialog = this.closeConfirmDeleteDialog.bind(this);
    this.saveMaps = this.saveMaps.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (isDefined(props.processMaps)) {
      return {
        ...state,
        edges: props.processMaps.edges,
        processes: props.processMaps.processes,
      };
    }
    return {
      ...state,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDownListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDownListener);
  }

  componentDidUpdate() {
    const {isDrawingEdge, edgeDrawSource, edgeDrawTarget} = this.state;
    if (
      isDrawingEdge &&
      isDefined(edgeDrawSource) &&
      isDefined(edgeDrawTarget) &&
      edgeDrawSource !== edgeDrawTarget
    ) {
      this.handleCreateEdge(edgeDrawSource, edgeDrawTarget);
    }
  }

  zoom(px, py, scale) {
    const {x, y} = this.toChartCoords(px, py);

    // calculate new pixel coords and afterwards diff to previous coords
    const diffX = x * scale - px;
    const diffY = y * scale - py;

    this.setState({
      scale,
      translateX: -diffX,
      translateY: -diffY,
    });
  }

  zoomIn(px, py) {
    let {scale} = this.state;

    scale = parseFloat((scale + SCROLL_STEP).toFixed(2));

    if (scale >= MAX_SCALE) {
      // avoid setting state and rerendering
      return;
    }

    this.zoom(px, py, scale);
  }

  zoomOut(px, py) {
    let {scale} = this.state;

    scale = parseFloat((scale - SCROLL_STEP).toFixed(2));

    if (scale <= MIN_SCALE) {
      // avoid setting state and rerendering
      return;
    }

    this.zoom(px, py, scale);
  }

  toChartCoords(x, y) {
    const {scale, translateX, translateY} = this.state;
    // transform pixel coords into chart coords
    return {
      x: (x - translateX) / scale,
      y: (y - translateY) / scale,
    };
  }

  handleMouseWheel(event) {
    const {x, y} = this.getMousePosition(event);

    // event.deltaY returns nagative values for mouse wheel up and positive values for mouse wheel down
    const isZoomOut = Math.sign(event.deltaY) === 1;

    isZoomOut ? this.zoomOut(x, y) : this.zoomIn(x, y);
  }

  handleZoomChange(dir) {
    const {scale} = this.state;
    let zoomDir;
    if (dir === '+') {
      zoomDir = 1;
    } else if (dir === '-') {
      zoomDir = -1;
    }
    let newScale;
    if (dir === '0') {
      return this.setState({
        scale: DEFAULT_SCALE,
        translateX: 0,
        translateY: 0,
      });
    }
    newScale = parseFloat((scale + zoomDir * SCROLL_STEP).toFixed(2));
    if (newScale > MAX_SCALE) {
      newScale = MAX_SCALE;
    }
    if (newScale < MIN_SCALE) {
      newScale = MIN_SCALE;
    }
    return this.setState({scale: newScale});
  }

  keyDownListener(event) {
    const {createProcessDialogVisible} = this.state;
    switch (event.key) {
      case 'Delete':
        if (
          !createProcessDialogVisible &&
          isDefined(this.selectedElement) &&
          this.selectedElement.type === 'process'
        ) {
          this.openConfirmDeleteDialog();
        } else if (
          isDefined(this.selectedElement) &&
          !createProcessDialogVisible
        ) {
          this.handleDeleteElement();
        }
        break;
      case 'Escape':
        this.setState({isDrawingEdge: false});
        break;
      default: {
        break;
      }
    }
  }

  saveMaps({processes = this.state.processes, edges = this.state.edges}) {
    const {mapId, saveUpdatedMaps} = this.props;

    const updatedMaps = {
      [mapId]: {
        processes,
        edges,
      },
      // ...otherMaps;
    };
    saveUpdatedMaps(updatedMaps);
  }

  handleDeleteElement() {
    if (isDefined(this.selectedElement)) {
      const {id} = this.selectedElement;
      const {processes, edges = {}} = this.state;
      if (isDefined(id)) {
        if (this.selectedElement && this.selectedElement.type === 'edge') {
          delete edges[id];

          this.setState({
            edges,
          });
        } else {
          // get all the edges that don't have the process as source or target
          // and exclude those from all edges in order to get a list of attached
          // edges
          const attachedEdges = exclude(edges, key => {
            return id !== edges[key].target && id !== edges[key].source;
          });
          for (const edge in attachedEdges) {
            delete edges[edge];
          }
          deleteTag({tagId: processes[id].tagId, gmp: this.props.gmp});
          delete processes[id];
          this.setState({
            edges,
            processes,
          });
        }
        this.selectedElement = undefined;
        this.selectedHost = undefined;
        this.saveMaps({processes, edges});
      }
    }
    this.handleInteraction();
  }

  getMousePosition(event) {
    const {clientX, clientY} = event;
    const {left, top} = this.svg.current.getBoundingClientRect();

    return {
      x: clientX - left,
      y: clientY - top,
    };
  }

  handleOpenCreateProcessDialog() {
    this.selectedElement = undefined; // the dialog will otherwise become an edit dialog
    this.selectedHost = undefined;
    this.setState({createProcessDialogVisible: true});
  }

  openCreateProcessDialog() {
    this.setState({createProcessDialogVisible: true});
  }

  closeCreateProcessDialog() {
    this.setState({createProcessDialogVisible: false});
  }

  openConfirmDeleteDialog() {
    this.setState({confirmDeleteDialogVisible: true});
  }

  closeConfirmDeleteDialog() {
    this.setState({confirmDeleteDialogVisible: false});
  }

  closeTagErrorDialog() {
    this.setState({tagErrorDialogVisible: false});
  }

  handleCloseCreateProcessDialog() {
    this.closeCreateProcessDialog();
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleCreateProcess(process) {
    let {processes = {}, translateX, translateY} = this.state;
    const {name, comment} = process;
    const id = uuid();
    createTag({name: BPM_TAG_PREFIX + name, gmp: this.props.gmp}).then(
      newTagId => {
        processes = {
          [id]: {
            name,
            comment,
            id,
            tagId: newTagId,
            x: 150 - translateX, // create Node next to Toolbar
            y: 100 - translateY, //
            type: 'process',
          },
          ...processes,
        };

        this.closeCreateProcessDialog();

        this.setState(() => ({
          processes,
        }));
        this.saveMaps({processes});
      },
    );
    this.handleInteraction();
  }

  handleProcessChange(newProcess) {
    const {processes} = this.state;
    const {id} = newProcess;
    const oldProcess = processes[id];

    processes[id] = {...oldProcess, ...newProcess}; // merge new info into process

    this.closeCreateProcessDialog();

    this.selectedElement = processes[id];

    this.setState(() => ({
      processes,
    }));
    editTag({
      name: BPM_TAG_PREFIX + processes[id].name,
      tagId: processes[id].tagId,
      gmp: this.props.gmp,
    });
    this.saveMaps({processes});
    this.handleInteraction();
  }

  handleAddHosts(hostIds) {
    editTag({
      hostIds,
      name: BPM_TAG_PREFIX + this.selectedElement.name,
      tagId: this.selectedElement.tagId,
      gmp: this.props.gmp,
    })
      .then(() => {
        this.props.forceUpdate();
      })
      .catch(err => {
        if (err.status === 422) {
          log.error('An error occurred while tagging hosts in BPM', err);
          this.setState({tagErrorDialogVisible: true});
        }
      });
    this.handleInteraction();
  }

  handleDeleteHosts(hostId) {
    editTag({
      action: 'remove',
      hostIds: [hostId],
      name: BPM_TAG_PREFIX + this.selectedElement.name,
      tagId: this.selectedElement.tagId,
      gmp: this.props.gmp,
    }).then(() => {
      this.selectedHost = undefined;
      this.props.forceUpdate();
    });
    this.handleInteraction();
  }

  handleDrawEdge() {
    this.setState({isDrawingEdge: true});
  }

  handleCreateEdge(source, target) {
    let {edges = {}} = this.state;
    const id = uuid();
    edges = {
      [id]: {
        source: source.id,
        target: target.id,
        id,
        type: 'edge',
      },
      ...edges,
    };
    this.selectedElement = edges[id];
    this.setState(() => ({
      edges,
      isDrawingEdge: false,
      edgeDrawSource: undefined,
      edgeDrawTarget: undefined,
    }));
    this.saveMaps({edges});
    this.handleInteraction();
  }

  handleSelectElement(event, element) {
    event.stopPropagation();
    const {isDrawingEdge, edgeDrawSource, edgeDrawTarget} = this.state;

    if (isDrawingEdge) {
      if (element.type === 'process' && !isDefined(edgeDrawSource)) {
        this.draggingElement = undefined;
        this.selectedElement = element;

        this.setState({edgeDrawSource: element});
      } else if (element.type === 'process' && !isDefined(edgeDrawTarget)) {
        this.setState({edgeDrawTarget: element});
      }
    }
    this.props.onSelectElement(element);
    this.selectedElement = element;
    this.selectedHost = undefined;
    this.draggingElement = element;
    this.handleInteraction();
  }

  handleSelectHost(host) {
    this.props.onSelectHost(host);
    this.selectedHost = host;
    this.handleInteraction();
  }

  handleMouseDown(event) {
    this.coords = {
      x: event.pageX,
      y: event.pageY,
    };
    this.selectedElement = undefined;
    this.selectedHost = undefined;
    this.setState({
      isDraggingBackground: true,
      isDrawingEdge: false,
      edgeDrawSource: undefined,
      edgeDrawTarget: undefined,
    });
  }

  handleMouseUp(event) {
    if (isDefined(this.draggingElement)) {
      this.draggingElement.dx = undefined;
      this.draggingElement.dy = undefined;
      this.draggingElement = undefined;
    }
    this.coords = {};
    if (this.state.isDraggingProcess) {
      // if dragging just stopped
      this.saveMaps({});
    }
    this.setState({isDraggingBackground: false, isDraggingProcess: false});
  }

  handleMouseMove(event) {
    if (
      isDefined(this.draggingElement) &&
      this.draggingElement.type !== 'edge'
    ) {
      // we are dragging an element
      const {x: mx, y: my} = this.getMousePosition(event);
      const {x, y} = this.toBackgroundCoords(mx, my);
      this.draggingElement.x = x;
      this.draggingElement.y = y;
      this.setState({isDraggingProcess: true});
      return;
    }

    if (!this.state.isDraggingBackground) {
      // we aren't dragging anything
      return;
    }

    event.preventDefault();

    const xDiff = this.coords.x - event.pageX;
    const yDiff = this.coords.y - event.pageY;

    this.coords.x = event.pageX;
    this.coords.y = event.pageY;

    this.setState(state => ({
      translateX: state.translateX - xDiff,
      translateY: state.translateY - yDiff,
    }));
  }

  toBackgroundCoords = (x, y) => {
    const {scale, translateX, translateY} = this.state;
    return {
      x: (x - translateX) / scale,
      y: (y - translateY) / scale,
    };
  };

  getCoordinates = processId => {
    const {processes} = this.state;
    const processNode = processes[processId];
    return {x: processNode.x, y: processNode.y};
  };

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {
      confirmDeleteDialogVisible,
      createProcessDialogVisible,
      edges = {},
      isDraggingBackground,
      isDraggingProcess,
      isDrawingEdge,
      processes = {},
      scale,
      tagErrorDialogVisible,
      translateX,
      translateY,
    } = this.state;
    const cursorType = isDraggingBackground ? 'move' : 'default';
    const processCursorType = isDraggingProcess ? 'move' : 'grab';

    const numProcesses = Object.keys(processes).length;

    const deleteHandler =
      isDefined(this.selectedElement) && this.selectedElement.type === 'process'
        ? this.openConfirmDeleteDialog
        : this.handleDeleteElement;

    return (
      <ErrorBoundary>
        <Wrapper>
          <Map
            ref={this.svg}
            cursor={cursorType}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
            onWheel={this.handleMouseWheel}
          >
            <Background ref={this.backgroundRef} />
            <Group left={translateX} top={translateY} scale={scale}>
              {Object.keys(edges).map(key => {
                const isSelected = edges[key] === this.selectedElement;
                const {id} = edges[key];
                const source = this.getCoordinates(edges[key].source);
                const target = this.getCoordinates(edges[key].target);
                return (
                  <Edge
                    isSelected={isSelected}
                    key={id}
                    source={source}
                    target={target}
                    id={id}
                    onMouseDown={event =>
                      this.handleSelectElement(event, edges[key])
                    }
                  />
                );
              })}
              {Object.keys(processes).map(key => {
                const {
                  color,
                  comment,
                  derivedSeverity,
                  id,
                  name,
                  severity,
                  x,
                  y,
                } = processes[key];
                const isSelected = processes[key] === this.selectedElement;
                return (
                  <ToolTip key={id} content={createToolTipContent({severity})}>
                    {({targetRef, hide, show}) => (
                      <ProcessNode
                        color={color}
                        comment={comment}
                        cursor={processCursorType}
                        derivedSeverity={derivedSeverity}
                        id={id}
                        isSelected={isSelected}
                        name={name}
                        radius={DEFAULT_PROCESS_SIZE}
                        scale={scale}
                        severity={severity}
                        x={x}
                        y={y}
                        forwardedRef={targetRef}
                        onMouseEnter={show}
                        onMouseLeave={hide}
                        onMouseDown={event =>
                          this.handleSelectElement(event, processes[key])
                        }
                      />
                    )}
                  </ToolTip>
                );
              })}
            </Group>
          </Map>
          <Tools
            applyConditionalColorization={
              this.props.applyConditionalColorization
            }
            drawIsActive={isDrawingEdge}
            showNoEdgeHelper={
              Object.entries(edges).length < 1 &&
              Object.entries(processes).length > 1
            }
            showNoProcessHelper={Object.entries(processes).length < 1}
            maxNumProcessesReached={numProcesses >= MAX_PROCESSES}
            maxZoomReached={scale >= MAX_SCALE - SCROLL_STEP}
            minZoomReached={scale <= MIN_SCALE + SCROLL_STEP}
            onCreateProcessClick={this.handleOpenCreateProcessDialog}
            onDrawEdgeClick={this.handleDrawEdge}
            onDeleteClick={deleteHandler}
            onToggleConditionalColorization={
              this.props.onToggleConditionalColorization
            }
            onZoomChangeClick={this.handleZoomChange}
          />
          <ProcessPanel
            element={this.selectedElement}
            hostList={this.selectedElement ? this.props.hostList : undefined}
            resultList={
              isDefined(this.selectedHost) ? this.props.resultList : undefined
            }
            onAddHosts={this.handleAddHosts}
            onDeleteHost={this.handleDeleteHosts}
            onSelectHost={this.handleSelectHost}
            onEditProcessClick={this.openCreateProcessDialog}
            onInteraction={this.handleInteraction}
          />
        </Wrapper>
        {createProcessDialogVisible && (
          <CreateProcessDialog
            comment={
              isDefined(this.selectedElement)
                ? this.selectedElement.comment
                : undefined
            }
            name={
              isDefined(this.selectedElement)
                ? this.selectedElement.name
                : undefined
            }
            id={
              isDefined(this.selectedElement)
                ? this.selectedElement.id
                : undefined
            }
            onChange={this.handleValueChange}
            onClose={this.handleCloseCreateProcessDialog}
            onCreate={this.handleCreateProcess}
            onEdit={this.handleProcessChange}
          />
        )}
        {confirmDeleteDialogVisible && (
          <ConfirmationDialog
            rightButtonTitle={_('Delete')}
            content={_(
              'Please note: Deleting the process will also delete the tag that' +
                ' is associated with it. If this tag is used for any other ' +
                'purpose besides business process mapping, this ' +
                'functionality will be lost.',
            )}
            title={_('Delete Process {{name}}', {
              name: this.selectedElement.name,
            })}
            onClose={() => this.closeConfirmDeleteDialog()}
            onResumeClick={() => {
              this.handleDeleteElement();
              this.closeConfirmDeleteDialog();
            }}
          />
        )}
        {tagErrorDialogVisible && (
          <ErrorDialog
            text={_(
              'There was an error (422) when trying to add one or more ' +
                'hosts to this process. This might occur if the name of the ' +
                'process has invalid characters. Please make sure you are ' +
                'only using a-z, A-Z and 0-9.',
            )}
            title={_('Error While Adding Host(s)')}
            onClose={() => this.closeTagErrorDialog()}
            onResumeClick={() => this.closeTagErrorDialog()}
          />
        )}
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (rootState, {hostFilter, resultFilter}) => {
  const hostSel = hostSelector(rootState);
  const resultSel = resultSelector(rootState);
  return {
    hostList: hostSel.getEntities(hostFilter),
    resultList: resultSel.getEntities(resultFilter),
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    saveUpdatedMaps: updatedMaps =>
      dispatch(saveBusinessProcessMap(gmp)(updatedMaps)),
  };
};

ProcessMap.propTypes = {
  applyConditionalColorization: PropTypes.bool,
  forceUpdate: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  hostList: PropTypes.array,
  mapId: PropTypes.id, // isRequired
  processMaps: PropTypes.object,
  resultList: PropTypes.array,
  saveUpdatedMaps: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onSelectElement: PropTypes.func.isRequired,
  onSelectHost: PropTypes.func.isRequired,
  onToggleConditionalColorization: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(ProcessMap);

// vim: set ts=2 sw=2 tw=80:
