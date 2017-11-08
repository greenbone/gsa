/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Dashboards initialization.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

(function(global, window, document, gsa, d3, $, console, promise) {
  'use strict';

  if (!gsa.is_defined(gsa.charts)) {
    gsa.charts = {};
  }

  var gch = gsa.charts;

  /**
   * Unescapes XML entities in a string.
   *
   * @param string  Escaped XML string.
   *
   * @return  Unescaped string.
   */
  function unescape_xml(string) {
    if (!gsa.is_defined(gsa.parser)) {
      gsa.parser = new DOMParser();
    }

    var doc = gsa.parser.parseFromString('<doc>' + string + '</doc>',
                                        'application/xml');
    return doc.documentElement.textContent;
  }

  function split(str, pattern) {
    if (str) {
      return str.split(pattern ? pattern : ',');
    }
    return undefined;
  }

  /* Initialization on page load */

  /**
   * Initializes all dashboards elements on a page.
   *
   * @param   The document object where to init the dashboards.
   */
  function on_ready(doc) {
    doc = $(doc);

    doc.find('.dashboard').each(function() {
      var elem = $(this);
      var max_components = gsa.is_defined(elem.data('max-components')) ?
        elem.data('max-components') : 8;
      var no_chart_links = gsa.is_defined(elem.data('no-chart-links')) ?
        !!(elem.data('no-chart-links')) : false;

      var dashboard = new gch.Dashboard(elem.attr('id'),
          elem.data('config'),
          {
            config_pref_id: elem.data('config-pref-id'),
            filter: elem.data('filter'),
            filt_id: elem.data('filter-id'),
            max_components: max_components,
            default_controller_string: elem.data('default-controller-string'),
            default_controllers_string: elem.data('default-controllers'),
            default_filters_string: elem.data('default-filters'),
            default_heights_string: elem.data('default-heights'),
            hide_controller_select: elem.data('hide-controller-select'),
            hide_filter_select: elem.data('hide-filter-select'),
            dashboard_controls: '#' + elem.data('dashboard-controls'),
          }
      );

      elem.find('.dashboard-filter').each(function() {
        var elem = $(this);
        dashboard.addFilter(elem.data('id'), elem.data('name'),
            unescape_xml(elem.data('term')), elem.data('type'));
      });

      elem.find('.dashboard-data-source').each(function() {
        var ds_elem = $(this);
        var type = ds_elem.data('type');
        var data_source_name = ds_elem.data('source-name');
        var aggregate_type = ds_elem.data('aggregate-type');
        var group_column = ds_elem.data('group-column');
        var subgroup_column = ds_elem.data('subgroup-column');

        var data_source = new gch.DataSource(data_source_name,
            {
              type: type,
              aggregate_type: aggregate_type,
              group_column: group_column,
              subgroup_column: subgroup_column,
              data_column: ds_elem.data('column'),
              data_columns: split(ds_elem.data('columns')),
              text_columns: split(ds_elem.data('text-columns')),
              filter: ds_elem.data('filter'),
              filt_id: ds_elem.data('filter-id'),
              sort_fields: split(ds_elem.data('sort-fields')),
              sort_orders: split(ds_elem.data('sort-orders')),
              sort_stats: split(ds_elem.data('sort-stats')),
              aggregate_mode: ds_elem.data('aggregate-mode'),
              max_groups: ds_elem.data('max-groups'),
              first_group: ds_elem.data('first-group'),
            });

        ds_elem.find('.dashboard-chart').each(function() {
          var c_elem = $(this);
          var chart_template = c_elem.data('chart-template');
          var chart_type = c_elem.data('chart-type');
          var chart_name = c_elem.data('chart-name');
          var chart_title = c_elem.data('chart-title');
          var chart_title_count_column = c_elem.data('chart-title-count');
          var gen_params = {extra: {}};
          var init_params = {};

          if (gsa.is_defined(no_chart_links)) {
            gen_params.no_chart_links = no_chart_links;
          }
          if (c_elem.data('x-field')) {
            gen_params.x_field = c_elem.data('x-field');
          }
          if (c_elem.data('y-fields')) {
            gen_params.y_fields = c_elem.data('y-fields').split(',');
          }
          if (c_elem.data('z-fields')) {
            gen_params.z_fields = c_elem.data('z-fields').split(',');
          }

          var key;
          var c_elem_gen_params = c_elem.data('gen-params');
          if (gsa.is_object(c_elem_gen_params)) {
            for (key in c_elem_gen_params) {
              gen_params.extra[key] = c_elem_gen_params[key];
            }
          }

          var c_elem_init_params = c_elem.data('init-params');
          if (gsa.is_object(c_elem_init_params)) {
            for (key in c_elem_init_params) {
              init_params[key] = c_elem_init_params[key];
            }
          }

          dashboard.addControllerFactory(chart_name, function(for_display) {
            if (!gsa.is_defined(for_display)) {
              log.error('Display not defined');
              return null;
            }

            return new gch.ChartController(chart_name, chart_type,
                chart_template, chart_title, data_source, for_display,
                chart_title_count_column, gen_params, init_params);
          });
        });
      });

      dashboard.init();
      dashboard.initDisplays();

      if (elem.data('detached')) {
        $(window).on('resize', gch.detached_chart_resize_listener(dashboard));
      }
    });
  }

  $(document).ready(function() {
    on_ready(document);
  });


})(window, window, window.document, window.gsa, window.d3, window.$,
  window.console, window.Promise);

// vim: set ts=2 sw=2 tw=80:
