
/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';

import d3 from 'd3';

import _ from 'gmp/locale.js';
import {for_each, is_defined} from 'gmp/utils.js';

import {
  csv_from_records,
  extract_filter_info_json,
  goto_details_page,
  goto_list_page,
  html_table_from_records,
  title_static,
  severity_colors_gradient,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import BaseChartController from './base.js';

const NODE_LIMIT = 1000;

/**
 * Extracts host topology data from assets response data
 *
 * @param {Object} data  The assets response object
 *
 * @return  An array of records as used by chart generators.
 */
const extract_host_topology_data_json = data => {
  const nodes = [];
  const nodes_by_link_id = {};
  const links = [];
  const links_by_link_ids = {};

  const records = {
    nodes: nodes,
    nodes_by_link_id: nodes_by_link_id,
    links: links,
    links_by_link_ids: links_by_link_ids,
  };

  for_each(data.asset, asset => {
    const new_host = {
      type: 'host',
      link_id: asset.name,
      name: asset.name,
      id: asset._id,
      severity: asset.host.severity.value,
      is_scanner: false,
      in_links: [],
      out_links: [],
    };

    const identifiers = asset.identifiers.identifier;
    for_each(identifiers, identifier => {
      switch (identifier.name) {
        case 'hostname':
          if (!is_defined(new_host.hostname)) {
            new_host.hostname = identifier.value;
          }
          break;
        default:
          break;
      }
    });

    const host_details = asset.host.detail;
    for_each(host_details, function(detail) {
      switch (detail.name) {
        case 'traceroute':
          if (!is_defined(new_host.traceroute)) {
            new_host.traceroute = detail.value;
          }
          break;
        case 'best_os_txt':
          if (!is_defined(new_host.os)) {
            new_host.os = detail.value;
          }
          break;
        case 'best_os_cpe':
          if (!is_defined(new_host.os_cpe)) {
            new_host.os_cpe = detail.value;
          }
          break;
        default:
          break;
      }
    });

    nodes.push(new_host);
    nodes_by_link_id[new_host.link_id] = new_host;
  });

  // Create links between host;
  for (const host of nodes) {
    if (is_defined(host.traceroute)) {
      const route_split = host.traceroute.split(',');
      for (let hop_index = 0; hop_index < route_split.length - 1; hop_index++) {
        const source_ip = route_split[hop_index];
        const target_ip = route_split[hop_index + 1];
        const link_ips = source_ip + '>' + target_ip;

        if (is_defined(links_by_link_ids[link_ips])) {
          continue;
        }

        const new_link = {};
        let new_host;

        // Create source node if its IP address is not in the list.
        if (!is_defined(nodes_by_link_id[source_ip])) {
          new_host = {};
          new_host.type = 'host';
          new_host.link_id = source_ip;
          new_host.name = source_ip;
          new_host.in_links = [];
          new_host.out_links = [];
          nodes.push(new_host);
          nodes_by_link_id[new_host.link_id] = new_host;
        }

        // Create target node if its IP address is not in the list.
        if (!is_defined(nodes_by_link_id[target_ip])) {
          new_host = {};
          new_host.type = 'host';
          new_host.link_id = target_ip;
          new_host.name = target_ip;
          new_host.in_links = [];
          new_host.out_links = [];
          nodes.push(new_host);
          nodes_by_link_id[new_host.link_id] = new_host;
        }

        new_link.source = nodes_by_link_id[source_ip];
        new_link.target = nodes_by_link_id[target_ip];

        links.push(new_link);
        links_by_link_ids[link_ips] = new_link;
        new_link.target.in_links.push(new_link);
        new_link.source.out_links.push(new_link);
      }

      // Mark first node in route as scanner
      if (is_defined(nodes_by_link_id[route_split[0]])) {
        nodes_by_link_id[route_split[0]].is_scanner = true;
      }
    }
  }

  return records;
};

class TopologyChartGenerator extends BaseChartController {

  constructor() {
    super('topology');

    this.command = 'get_assets';
  }

  init() {
    this.margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    };

    this.setTitleGenerator(title_static(_('Loading topology chart ...'),
      _('Topology Chart')));
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }
    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }
  }

  clearInterval() {
    if (is_defined(this.interval)) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  stopLayout() {
    if (is_defined(this.layout)) {
      this.layout.stop();
      this.layout = undefined;
    }
  }

  renderLimitText(svg) {
    const height = svg.attr('height');
    const width = svg.attr('width');

    this.stopLayout();
    this.clearInterval();

    svg.selectAll('*').remove();

    // Add a text if records list is empty
    // Text if record set is empty
    this.limit_text =
      svg.insert('text')
        .attr('class', 'limit_text')
        .style('dominant-baseline', 'middle')
        .style('text-anchor', 'middle');

    this.limit_text.insert('tspan')
      .attr('x', width / 2)
      .text(_('Too many nodes to display'));

    this.limit_text.insert('tspan')
      .attr('dy', '1.2em')
      .attr('x', width / 2)
      .style('font-weight', 'normal')
      .text(_('Please try a filter selecting less hosts'));

    svg.selectAll('.limit_text')
      .attr('x', width / 2)
      .attr('y', height / 2);
  }

  renderEmptyText(svg) {
    const height = svg.attr('height');
    const width = svg.attr('width');

    // Show text if no nodes are shown
    this.stopLayout();
    this.clearInterval();

    svg.selectAll('*').remove();

    this.empty_text = svg.insert('text')
        .attr('class', 'empty_text')
        .style('dominant-baseline', 'middle')
        .style('text-anchor', 'middle');

    this.empty_text.insert('tspan')
      .attr('x', width / 2)
      .text(_('No hosts with topology selected'));

    svg.selectAll('.empty_text')
      .attr('x', width / 2)
      .attr('y', height / 2);
  }

  generate(svg, data, update) {
    if (data.topology.nodes.length > NODE_LIMIT) {
      return this.renderLimitText(svg);
    }

    if (is_defined(this.limit_text)) {
      this.limit_text.remove();
      this.limit_text = undefined;
    }

    // Create copy of topology containing only nodes with links
    const topology = {
      nodes: [],
      nodes_by_link_id: {},
      links: data.topology.links,
    };

    for (const [id, node] of Object.entries(data.topology.nodes_by_link_id)) {
      if (node.in_links.length || node.out_links.length) {
        topology.nodes.push(node);
        topology.nodes_by_link_id[id] = node;
      }
    }

    // Setup display parameters
    const height = svg.attr('height');
    const width = svg.attr('width');

    if (topology.nodes.length === 0) {
      return this.renderEmptyText(svg);
    }

    if (is_defined(this.empty_text)) {
      this.empty_text.remove();
      this.empty_text = null;
    }

    if (svg.select('g').node() === null) {
      this.graph = svg.append('g');
    }

    if (update || !is_defined(this.layout)) {
      this.layout = d3.layout.force();
      this.layout
        .charge(() => -10)
        .gravity(0.01)
        .friction(0.95)
        .linkDistance(l =>
          20 + 10 * Math.sqrt(l.source.weight + l.target.weight)
        )
        .linkStrength(0.2)
        .nodes(topology.nodes)
        .links(topology.links)
        .size([width, height])
        .start();

      this.layout.drag().on('dragstart', () =>
        d3.event.sourceEvent.stopPropagation()
      );

      this.scale = 1;
      this.translate = [0, 0];
    }

    this.layout.size([width, height]);

    this.update_layout = () => {
      this.layout.tick();

      const circle_scale = 5 * this.scale >= 2 ? 1 : 2 / 5 / this.scale;

      this.graph.selectAll('.node-marker').data(this.layout.nodes())
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      this.graph.selectAll('.node-label')
        .data(this.layout.nodes())
        .attr('x', d => d.x)
        .attr('y', d => d.y + 1 + (circle_scale * (d.is_scanner ? 8 : 5)));

      this.graph.selectAll('.link')
        .data(this.layout.links())
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    };

    this.resize_graph = () => {
      this.layout.size([width, height]);

      const circle_scale = 5 * this.scale >= 2 ? 1 : 2 / 5 / this.scale;
      const text_scale = Math.sqrt(1 / this.scale);

      this.graph.selectAll('.node-marker')
        .data(this.layout.nodes())
        .attr('r', d => circle_scale * (d.is_scanner ? 8 : 5));

      this.graph.selectAll('.node-label')
        .data(this.layout.nodes())
        .style('font-size', (8 * text_scale) + 'px')
        .style('display', this.scale >= 0.9 ? '' : 'none');

      // self.graph.selectAll('.link').data(self.layout.links())

      this.graph.attr('transform',
        'translate(' + this.translate + '),scale(' + this.scale + ')');
    };

    this.graph.selectAll('.link')
      .data(this.layout.links())
      .enter()
        .append('line')
        .attr('class', 'link')
        .style('stroke', 'green');

    const color_scale = severity_colors_gradient();

    this.graph.selectAll('.node').data(this.layout.nodes()).enter()
      .append('a')
      .classed('node', true)
      .on('click', d => is_defined(d.id) ?
        goto_details_page('host', d.id, data.filter_info) :
        undefined
      )
      .append('circle')
      .classed('node-marker', true)
      .attr('r', 1.5)
      .style('fill', d => is_defined(d.id) ? color_scale(d.severity) : 'white')
      .style('stroke', d => {
        if (is_defined(d.is_scanner)) {
          return 'green';
        }
        else if (is_defined(d.id)) {
          return d3.hcl(color_scale(d.severity)).darker(2);
        }
        return 'grey';
      })
      .style('stroke-width', d => is_defined(d.is_scanner) ? '2p' : '1px')
      .call(this.layout.drag);

    this.graph.selectAll('.node-label')
      .data(this.layout.nodes())
      .enter()
        .append('text')
        .classed('node-label', true)
        .style('font-size', '8px')
        .style('font-weight', 'normal')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'hanging')
        .style('fill', n => is_defined(n.id) ? 'black' : 'grey')
        .text(n => n.name);

    if (!is_defined(this.interval)) {
      this.interval = window.setInterval(this.update_layout, 0.0625);
    }

    const zoomed = () => {
      this.scale = d3.event.scale;
      this.translate = d3.event.translate;
      this.resize_graph();
    };

    const zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(this.scale)
      .scaleExtent([0.125, 2])
      .on('zoom', zoomed);

    svg.call(zoom);

    this.resize_graph();

    if (update) {
      for (let i = 0; i < 1000; ++i) {
        this.layout.start();
        this.layout.tick();
      }
    }
    else {
      this.layout.resume();
    }
  }

  generateCsvData(controller, data) {
    return csv_from_records(
      data.topology.nodes,
      undefined,

      /* column_info */
      ['link_id', 'hostname', 'traceroute'],
      ['IP', 'Hostname', 'Route'],
      controller.display.getTitle()
    );
  }

  generateHtmlTableData(controller, data) {
    return html_table_from_records(
      data.topology.nodes,
      undefined,

      /* column_info */
      ['link_id', 'hostname', 'traceroute'],
      ['IP', 'Hostname', 'Route'],
      controller.display.getTitle(),
      controller.data_src.getParam('filter'),
    );
  }

  generateLink(d, i, column, type, filter_info) {
    const {value} = d;
    if (column === 'uuid') {
      return goto_details_page(type, value);
    }
    return goto_list_page(type, column, value, filter_info);
  }

  extractData(data, gen_params) {
    const response = data.get_assets.get_assets_response;
    return {
      topology: extract_host_topology_data_json(response),
      filter_info: extract_filter_info_json(response.filters),
    };
  }
}

register_chart_generator('topology', TopologyChartGenerator);

// vim: set ts=2 sw=2 tw=80:
