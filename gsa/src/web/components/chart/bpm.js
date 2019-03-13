/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import 'core-js/fn/array/for-each';

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {GraphView, GraphUtils} from 'web/components/directedgraph';
// import {GraphView, GraphUtils} from 'react-digraph';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import {MENU_PLACEHOLDER_WIDTH} from './utils/constants';
import {shouldUpdate} from './utils/update';

import SeverityBar from 'web/components/bar/severitybar';
import {riskFactorColorScale} from 'web/components/dashboard/display/utils';

import Layout from 'web/components/layout/layout';
import Button from 'web/components/form/button';

import EditIcon from 'web/components/icon/editicon';
import DeleteIcon from 'web/components/icon/deleteicon';

import MultiSelect from 'web/components/form/multiselect';

import StripedTable from 'web/components/table/stripedtable';
import Body from 'web/components/table/body';
import Row from 'web/components/table/row';
import Data from 'web/components/table/data';
import Head from 'web/components/table/head';
import Header from 'web/components/table/header';

import {
  NA_VALUE,
  LOG,
  FALSE_POSITIVE,
  ERROR,
  NA,
  HIGH,
  MEDIUM,
  LOW,
  LOG_VALUE,
  FALSE_POSITIVE_VALUE,
  ERROR_VALUE,
} from 'web/utils/severity';

import Legend from './legend';
import Svg from './svg';
import Group from './group';

const LEGEND_MARGIN = 20;
const MIN_RATIO = 2.0;
const MIN_WIDTH = 200;

const Container = styled(Layout)`
  overflow: hidden;
  height: ${props => props.height};
  align-items: stretch;
  ${'' /* border: 1px solid red; */}
`;

const GraphBox = styled(Layout)`
  position: relative;
  height: 100%;
  width: 80%;
  ${'' /* border: 1px solid blue; */}
`;

const SideBox = styled(Layout)`
  height: 100%;
  max-width: 20%;
  ${'' /* border: 1px solid blue; */}
`;

const ProcessBox = styled(Layout)`
  justify-content: flex-start;
  ${'' /* border: 1px solid #008000; */}
`;

const ProcessTitle = styled(Layout)`
  font-weight: bold;
  font-size: 18px;
  margin: 20px;
`;

const HostList = styled(Layout)`
  ${'' /* border: 1px solid violet; */}
  overflow: auto;
  padding-top: 50px;
  display: flex;
`;

const sample = {
  nodes: [
    {
      id: '1',
      title: 'Sales',
      nodeTitle: 'Sales NodeTitle',
      severity: Theme.warningRed,
      x: 258.3976135253906,
      y: 331.9783248901367,
      type: 'high',
    },
    {
      id: '2',
      title: 'Order',
      severity: Theme.lightGreen,
      x: 593.9393920898438,
      y: 260.6060791015625,
      type: 'medium',
    },
    {
      id: '3',
      title: 'Production',
      severity: Theme.goldYellow,
      x: 237.5757598876953,
      y: 61.81818389892578,
      type: 'high',
    },
    // {
    //   "id": '4',
    //   "title": "Lunchbreak",
    //   "severity": Theme.dialogGray,
    //   "x": 600.5757598876953,
    //   "y": 600.81818389892578,
    //   "type": "log"
    // },
    {
      id: '5',
      title: 'Ganz langer Titel mal fuer einen Test',
      severity: Theme.dialogGray,
      x: 500.5757598876953,
      y: 500.81818389892578,
      type: 'log',
    },
  ],
  edges: [
    {
      source: '1',
      target: '2',
      type: 'emptyEdge',
      title: 'Process Transition for some reason',
    },
    // {
    //   "source": '2',
    //   "target": '4',
    //   "type": "emptyEdge"
    // },
    // {
    //   source: '4',
    //   target: '3',
    //   type: "emptyEdge",
    // }
  ],
};

const NODE_KEY = 'id';

const GraphConfig = {
  NodeTypes: {
    // custom: { // required to show empty nodes
    //   typeText: "None",
    //   shapeId: "#custom", // relates to the type property of a node
    //   shape: (
    //     <symbol viewBox="0 0 100 100" id="custom" key="0">
    //       <circle cx="50" cy="50" r="25"></circle>
    //     </symbol>
    //   )
    // },
    empty: {
      // required to show empty nodes
      typeText: 'None',
      shapeId: '#empty', // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 100" id="empty" key="0">
          <circle
            cx="50"
            cy="50"
            r="25"
            fill={Theme.white}
            stroke={Theme.black}
          />
        </symbol>
      ),
    },
    log: {
      typeText: 'None2',
      shapeId: '#log', // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 100" id="log" key="0" fill="#00FF00">
          <circle cx="50" cy="50" r="100" fill={riskFactorColorScale(LOG)} />
        </symbol>
      ),
    },
    low: {
      // typeText: "None2",
      shapeId: '#low', // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 100" id="low" key="0">
          <circle cx="50" cy="50" r="25" fill={riskFactorColorScale(LOW)} />
        </symbol>
      ),
    },
    medium: {
      // typeText: "None2",
      shapeId: '#medium', // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 100" id="medium" key="0">
          <circle cx="50" cy="50" r="25" fill={riskFactorColorScale(MEDIUM)} />
        </symbol>
      ),
    },
    high: {
      // typeText: "None2",
      shapeId: '#high', // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 100" id="high" key="0">
          <circle cx="50" cy="50" r="25" fill={riskFactorColorScale(HIGH)} />
        </symbol>
      ),
    },
    selected: {
      // typeText: "None2",
      shapeId: '#selected', // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 100" id="selected" key="0">
          <circle
            cx="50"
            cy="50"
            r="25"
            fill={Theme.green}
            strokeWidth="5"
            stroke={Theme.green}
          />
        </symbol>
      ),
    },
  },
  NodeSubtypes: {},
  EdgeTypes: {
    emptyEdge: {
      // required to show empty edges
      shapeId: '#emptyEdge',
      shape: (
        <symbol viewBox="0 0 50 50" id="emptyEdge" key="0">
          <circle cx="25" cy="25" r="3" fill="currentColor">
            {' '}
          </circle>
        </symbol>
      ),
    },
  },
};

class BpmChart extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      graph: sample,
      selected: null,
    };
    this.GraphView = React.createRef();
  }

  // Helper to find the index of a given node
  getNodeIndex(searchNode) {
    return this.state.graph.nodes.findIndex(node => {
      return node[NODE_KEY] === searchNode[NODE_KEY];
    });
  }

  // Helper to find the index of a given edge
  getEdgeIndex(searchEdge) {
    return this.state.graph.edges.findIndex(edge => {
      return (
        edge.source === searchEdge.source && edge.target === searchEdge.target
      );
    });
  }

  // Given a nodeKey, return the corresponding node
  getViewNode(nodeKey) {
    const searchNode = {};
    searchNode[NODE_KEY] = nodeKey;
    const i = this.getNodeIndex(searchNode);
    return this.state.graph.nodes[i];
  }

  makeItLarge = () => {
    // const graph = this.state.graph;
    // const generatedSample = generateSample(this.state.totalNodes);
    // graph.nodes = generatedSample.nodes;
    // graph.edges = generatedSample.edges;
    // this.setState(this.state);
  };

  addStartNode = () => {
    const {graph} = this.state;
    // using a new array like this creates a new memory reference
    // this will force a re-render
    graph.nodes = [
      {
        id: Date.now(),
        title: 'Node A',
        type: 'empty2',
        x: 0,
        y: 0,
      },
      ...this.state.graph.nodes,
    ];
    this.setState({
      graph,
    });
  };
  deleteStartNode = () => {
    const {graph} = this.state;
    graph.nodes.splice(0, 1);
    // using a new array like this creates a new memory reference
    // this will force a re-render
    graph.nodes = [...this.state.graph.nodes];
    this.setState({
      graph,
    });
  };

  handleChange = event => {
    this.setState(
      {
        totalNodes: parseInt(event.target.value || '0', 10),
      },
      this.makeItLarge,
    );
  };

  /*
   * Handlers/Interaction
   */

  // Called by 'drag' handler, etc..
  // to sync updates from D3 with the graph
  onUpdateNode = viewNode => {
    const {graph} = this.state;
    const i = this.getNodeIndex(viewNode);

    graph.nodes[i] = viewNode;
    this.setState({graph});
  };

  // Node 'mouseUp' handler
  onSelectNode = viewNode => {
    // Deselect events will send Null viewNode
    // const {graph} = this.state;
    // if(viewNode !== null) {
    //   const i = this.getNodeIndex(viewNode);
    //   viewNode.type = 'selected';
    //   graph.nodes[i] = viewNode;
    // }
    this.setState({selected: viewNode});
    // this.setState({selected: viewNode, graph});
  };

  // Edge 'mouseUp' handler
  onSelectEdge = viewEdge => {
    this.setState({selected: viewEdge});
  };

  // Updates the graph with a new node
  onCreateNode = (x, y) => {
    const {graph} = this.state;

    // This is just an example - any sort of logic
    // could be used here to determine node type
    // There is also support for subtypes. (see 'sample' above)
    // The subtype geometry will underlay the 'type' geometry for a node
    const type = 'empty';

    const viewNode = {
      id: Date.now(),
      title: _('Unnamed'),
      type,
      x,
      y,
    };

    graph.nodes = [...graph.nodes, viewNode];
    this.setState({graph});
  };

  // Deletes a node from the graph
  onDeleteNode = (viewNode, nodeId, nodeArr) => {
    const {graph} = this.state;
    // Delete any connected edges
    const newEdges = graph.edges.filter((edge, i) => {
      return (
        edge.source !== viewNode[NODE_KEY] && edge.target !== viewNode[NODE_KEY]
      );
    });
    graph.nodes = nodeArr;
    graph.edges = newEdges;

    this.setState({graph, selected: null});
  };

  // Creates a new node between two edges
  onCreateEdge = (sourceViewNode, targetViewNode) => {
    const {graph} = this.state;
    // This is just an example - any sort of logic
    // could be used here to determine edge type
    const type = 'empty';

    const viewEdge = {
      source: sourceViewNode[NODE_KEY],
      target: targetViewNode[NODE_KEY],
      type,
    };

    // Only add the edge when the source node is not the same as the target
    if (viewEdge.source !== viewEdge.target) {
      graph.edges = [...graph.edges, viewEdge];
      this.setState({
        graph,
        selected: viewEdge,
      });
    }
  };

  // Called when an edge is reattached to a different target.
  onSwapEdge = (sourceViewNode, targetViewNode, viewEdge) => {
    const {graph} = this.state;
    const i = this.getEdgeIndex(viewEdge);
    const edge = JSON.parse(JSON.stringify(graph.edges[i]));

    edge.source = sourceViewNode[NODE_KEY];
    edge.target = targetViewNode[NODE_KEY];
    graph.edges[i] = edge;
    // reassign the array reference if you want the graph to re-render a swapped edge
    graph.edges = [...graph.edges];

    this.setState({
      graph,
      selected: edge,
    });
  };

  // Called when an edge is deleted
  onDeleteEdge = (viewEdge, edges) => {
    const {graph} = this.state;
    graph.edges = edges;
    this.setState({
      graph,
      selected: null,
    });
  };

  onUndo = () => {
    // Not implemented
    // console.warn('Undo is not currently implemented in the example.');
    // Normally any add, remove, or update would record the action in an array.
    // In order to undo it one would simply call the inverse of the action performed. For instance, if someone
    // called onDeleteEdge with (viewEdge, i, edges) then an undelete would be a splicing the original viewEdge
    // into the edges array at position i.
  };

  onCopySelected = () => {
    if (this.state.selected.source) {
      // console.warn('Cannot copy selected edges, try selecting a node instead.');
      return;
    }
    const x = this.state.selected.x + 10;
    const y = this.state.selected.y + 10;
    this.setState({
      copiedNode: {...this.state.selected, x, y},
    });
  };

  onPasteSelected = () => {
    if (!this.state.copiedNode) {
      // console.warn('No node is currently in the copy queue. Try selecting a node and copying it with Ctrl/Command-C');
    }
    const {graph} = this.state;
    const newNode = {...this.state.copiedNode, id: Date.now()};
    graph.nodes = [...graph.nodes, newNode];
    this.forceUpdate();
  };
  render() {
    const {width, height, className} = this.props;

    const {nodes, edges} = this.state.graph;
    const {selected} = this.state;
    const {NodeTypes, NodeSubtypes, EdgeTypes} = GraphConfig;

    const processTitle =
      selected === null ? _('No process selected') : selected.title;
    console.log('NODES', nodes);
    return (
      <Container height={height} grow="1">
        <GraphBox id="graph">
          <GraphView
            ref="GraphView"
            className={className}
            nodeKey={NODE_KEY}
            nodes={nodes}
            edges={edges}
            selected={selected}
            nodeTypes={NodeTypes}
            nodeSubtypes={NodeSubtypes}
            edgeTypes={EdgeTypes}
            width={width}
            height={height}
            onSelectNode={this.onSelectNode}
            onCreateNode={this.onCreateNode}
            onUpdateNode={this.onUpdateNode}
            onDeleteNode={this.onDeleteNode}
            onSelectEdge={this.onSelectEdge}
            onCreateEdge={this.onCreateEdge}
            onSwapEdge={this.onSwapEdge}
            onDeleteEdge={this.onDeleteEdge}
          />
        </GraphBox>
        <SideBox flex="column" grow="1">
          <ProcessBox grow="1" flex="column">
            <Layout style={{justifyContent: 'space-between'}}>
              <ProcessTitle>{processTitle}</ProcessTitle>
              <EditIcon
                active={selected !== null}
                style={{marginRight: '10px'}}
              />
            </Layout>
            <MultiSelect
              disabled={selected === null}
              width="100%"
              items={[
                {label: 'test', value: 'host'},
                {label: 'test2', value: 'host2'},
                {label: 'test3', value: 'host3'},
                {label: 'test4', value: 'host4'},
                {label: 'test5', value: 'host5'},
                {label: 'test6', value: 'host6'},
                {label: 'test7', value: 'host7'},
                {label: 'test8', value: 'host8'},
                {label: 'test9', value: 'host9'},
                {label: 'test10', value: 'host10'},
              ]}
            />
            <Button title="Add hosts" disabled={selected === null} />
          </ProcessBox>
          <HostList>
            {selected !== null && (
              <StripedTable>
                <Header>
                  <Row>
                    <Head>{_('Host')}</Head>
                    <Head>{_('Severity')}</Head>
                    <Head>{_('Actions')}</Head>
                  </Row>
                </Header>
                <Body>
                  <Row>
                    <Data>Host 1</Data>
                    <Data>
                      <SeverityBar severity={10} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 2</Data>
                    <Data>
                      <SeverityBar severity={10} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 3</Data>
                    <Data>
                      <SeverityBar severity={10} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 4</Data>
                    <Data>
                      <SeverityBar severity={9.5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 5</Data>
                    <Data>
                      <SeverityBar severity={8} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 6</Data>
                    <Data>
                      <SeverityBar severity={8} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 7</Data>
                    <Data>
                      <SeverityBar severity={7.5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 8</Data>
                    <Data>
                      <SeverityBar severity={7.5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 9</Data>
                    <Data>
                      <SeverityBar severity={7.5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 10</Data>
                    <Data>
                      <SeverityBar severity={7} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 11</Data>
                    <Data>
                      <SeverityBar severity={7} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 12</Data>
                    <Data>
                      <SeverityBar severity={5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 13</Data>
                    <Data>
                      <SeverityBar severity={5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 14</Data>
                    <Data>
                      <SeverityBar severity={4.5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 15</Data>
                    <Data>
                      <SeverityBar severity={4.5} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 16</Data>
                    <Data>
                      <SeverityBar severity={3} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 17</Data>
                    <Data>
                      <SeverityBar severity={3} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 18</Data>
                    <Data>
                      <SeverityBar severity={3} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 19</Data>
                    <Data>
                      <SeverityBar severity={1} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 20</Data>
                    <Data>
                      <SeverityBar severity={0} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 21</Data>
                    <Data>
                      <SeverityBar severity={0} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 22</Data>
                    <Data>
                      <SeverityBar severity={0} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 23</Data>
                    <Data>
                      <SeverityBar severity={0} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                  <Row>
                    <Data>Host 24</Data>
                    <Data>
                      <SeverityBar severity={0} />
                    </Data>
                    <Data>
                      <DeleteIcon title={_('Remove Host from Process')} />
                    </Data>
                  </Row>
                </Body>
              </StripedTable>
            )}
          </HostList>
        </SideBox>
      </Container>
    );
  }
}

BpmChart.propTypes = {
  height: PropTypes.number.isRequired,
  showLegend: PropTypes.bool,
  svgRef: PropTypes.ref,
  width: PropTypes.number.isRequired,
  onDataClick: PropTypes.func,
  onLegendItemClick: PropTypes.func,
};

export default BpmChart;

// vim: set ts=2 sw=2 tw=80:
