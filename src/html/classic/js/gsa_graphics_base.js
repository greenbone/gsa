/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for graphics in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 - 2016 Greenbone Networks GmbH
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

(function(global, window, document, gsa, d3, $, console) {
  'use strict';
  if (!gsa.is_defined(gsa.dashboards)) {
    gsa.dashboards = {};
  }

  if (!gsa.is_defined(gsa.data_sources)) {
    gsa.data_sources = {};
  }

  // Default date and time formats
  gsa.date_format = d3.time.format.utc('%Y-%m-%d');
  gsa.datetime_format = d3.time.format.utc('%Y-%m-%d %H:%M');
  gsa.iso_time_format = d3.time.format.utc('%Y-%m-%dT%H:%M');

  gsa.title_static = title_static;
  gsa.format_data = format_data;
  gsa.column_label = column_label;
  gsa.default_column_label = default_column_label;
  gsa.severity_level = severity_level;
  gsa.resource_type_name = resource_type_name;
  gsa.resource_type_name_plural = resource_type_name_plural;
  gsa.open_detached = open_detached;
  gsa.csv_from_records = csv_from_records;
  gsa.html_table_from_records = html_table_from_records;
  gsa.svg_from_elem = svg_from_elem;
  gsa.blob_img_window = blob_img_window;
  gsa.severity_bar_style = severity_bar_style;
  gsa.data_raw = data_raw;
  gsa.field_color_scale = field_color_scale;
  gsa.field_name_colors = field_name_colors;
  gsa.severity_colors_gradient = severity_colors_gradient;
  gsa.register_chart_generator = register_chart_generator;
  gsa.get_chart_generator = get_chart_generator;
  gsa.BaseChartGenerator = BaseChartGenerator;
  gsa.fill_empty_fields = fill_empty_fields;
  gsa.details_page_url = details_page_url;
  gsa.filtered_list_url = filtered_list_url;
  gsa.wrap_text = wrap_text;

  /*
  * Generic chart styling helpers
  */

  /* Color scales */

  /*
  * Color scale for SecInfo severity levels
  */
  gsa.severity_level_color_scale =
    field_color_scale(undefined, 'severity_level');

  function field_color_scale(type, column) {
    var scale = d3.scale.ordinal();

    var red = d3.interpolateHcl('#d62728', '#ff9896');
    var green = d3.interpolateHcl('#2ca02c', '#98df8a');
    var blue = d3.interpolateHcl('#aec7e8', '#1f77b4');
    var orange = d3.interpolateHcl('#ff7f0e', '#ffbb78');
    var yellow = d3.interpolateHcl('#ad9e39', '#ffff99');
    var red_yellow = d3.interpolateHcl('#d62728', '#ffff8e');

    switch (column) {
      case 'class':
        scale.domain([
            'compliance',
            'inventory',
            'miscellaneous',
            'patch',
            'vulnerability',
            'N/A',
        ]);
        scale.range([
            blue(0),
            blue(1),
            green(0),
            green(1),
            orange(0),
            'silver',
        ]);
        break;
      case 'qod':
        scale = d3.scale.linear();
        scale.domain([0, 30, 60, 70, 80, 95, 100]);
        scale.range([
            d3.hsl('#881100'),
            d3.hsl('#ff7f0e'),
            d3.hsl('#ffff0e'),
            d3.hsl('#f8f8f8'),
            d3.hsl('#22cc22'),
            d3.hsl('#22ddff'),
            d3.hsl('#000044'),
        ]);
        break;
      case 'qod_type':
        scale.domain([
            'Exploit',
            'Remote vulnerability',
            'Remote Active',
            'Remote analysis',
            'Remote App',
            'Remote Banner',
            'Remote probe',
            'Package check',
            'Registry check',
            'Executable version',
            'Unreliable rem. banner',
            'Unreliable exec. version',
            'General Note',
            'None',
        ]);
        scale.range([
            red(0),
            orange(0),
            green(0),
            green(0.5),
            green(0.25),
            green(0.75),
            green(1.0),
            blue(1.0),
            blue(0.5),
            blue(0.0),
            yellow(0.5),
            yellow(1.0),
            'grey',
            'silver',
        ]);
        break;
      case 'severity_level':
      case 'threat':
        scale.domain([
            'Error',
            'Debug',
            'False Positive',
            'Log',
            'Low',
            'Medium',
            'High',
            'N/A',
        ]);
        scale.range([
          '#800000',
          '#008080',
          '#808080',
          '#DDDDDD',
          'skyblue',
          'orange',
          '#D80000',
          'silver',
        ]);
        break;
      case 'solution_type':
        scale.domain([
            'Mitigation',
            'NoneAvailable',
            'VendorFix',
            'WillNotFix',
            'Workaround',
            'N/A',
        ]);
        scale.range([
            green(0.5),
            red_yellow(0.5),
            blue(1),
            red_yellow(0),
            red_yellow(0.75),
            'silver',
        ]);
        break;
      case 'status':
        scale.domain([
            'Delete Requested',
            'Ultimate Delete Requested',
            'Internal Error',
            'New', 'Requested',
            'Running',
            'Stop Requested',
            'Stopped',
            'Done',
            'N/A',
        ]);
        scale.range([
            red(1.0),
            red(0.5),
            red(0.0),
            green(1.0),
            green(0.5),
            green(0.0),
            orange(1.0),
            orange(0.0),
            blue(0.5),
            'silver',
        ]);
        break;
      case 'type':
        scale.domain([
            'NVTs',
            'CVEs',
            'CPEs',
            'OVAL definitions',
            'CERT-Bund Advisories',
            'DFN-CERT Advisories',
            'N/A']);
        scale.range([
            orange(0.0),
            blue(0.0),
            blue(0.5),
            blue(1.0),
            green(0.0),
            green(1.0),
            'silver',
        ]);
        break;
      default:
        return d3.scale.category20();
    }
    return scale;
  }

  /**
   * Create a color scales for a color for each field name. If alt_color_limit
   *  is defined, the fields starting at that index will use alternate (lighter
   *  or darker) colors.
   *
   * @param {array}  y_fields         An array containing the field names.
   * @param {object} column_info      The column info object of the dataset
   * @param {number} alt_color_limit  Index at which alternate colors are used
   *
   * A d3 color scale for the field names given
   */
  function field_name_colors(y_fields, column_info, alt_color_limit) {
    var range = [];
    var scale = d3.scale.ordinal();
    var subgroup_scale;

    if (column_info.group_columns && column_info.group_columns[1]) {
      var type = column_info.columns.subgroup_value.type;
      var column = column_info.group_columns[1];
      subgroup_scale = gsa.field_color_scale(type, column);
    }

    for (var index in y_fields) {
      var field_info = column_info.columns[y_fields[index]];
      var color = 'green';

      if (gsa.is_defined(field_info.subgroup_value)) {
        color = subgroup_scale(field_info.subgroup_value);
      }
      else if ((y_fields.length <= 1 && !gsa.is_defined(alt_color_limit)) ||
               y_fields.length - alt_color_limit <= 1) {
        color = 'green';
      }
      else if (gsa.is_defined(field_info.stat)) {
        if (field_info.stat === 'max') {
          color = '#ff7f0e';
        }
        else if (field_info.stat === 'min') {
          color = '#9467bd';
        }
        else if (field_info.stat === 'sum') {
          color = '#7f7f7f';
        }
      }

      if (!gsa.is_defined(alt_color_limit) || index < alt_color_limit) {
        range.push(color);
      }
      else if (d3.lab(color).l >= 70) {
        range.push(d3.rgb(color).darker().toString());
      }
      else {
        range.push(d3.rgb(color).brighter().toString());
      }
    }

    scale.domain(y_fields);
    scale.range(range);

    return scale;
  }

  /*
  * Severity gradient
  */
  function severity_colors_gradient() {
    return d3.scale.linear()
              .domain([-1.0,
                        gsa.severity_levels.max_log,
                        gsa.severity_levels.max_low,
                        gsa.severity_levels.max_medium,
                        10.0])
              .range([d3.rgb('grey'),
                      d3.rgb('silver'),
                      d3.rgb('skyblue'),
                      d3.rgb('orange'),
                      d3.rgb('red')]);
  }

  /*
   * Severity bar chart style
   */
  function severity_bar_style(field, max_log, max_low, max_medium) {
    var medium_high_color = d3.interpolateHcl('#D80000', 'orange')(0.5);
    var low_medium_color = d3.interpolateHcl('orange', 'skyblue')(0.5);
    var log_low_color = d3.interpolateHcl('skyblue', 'silver')(0.5);

    var func = function(d) {
      if (Number(d[field]) > Math.ceil(max_medium)) {
        return ('fill: #D80000');
      }
      else if (Number(d[field]) > max_medium) {
        return ('fill: ' + medium_high_color);
      }
      else if (Number(d[field]) > Math.ceil(max_low)) {
        return ('fill: orange');
      }
      else if (Number(d[field]) > max_low) {
        return ('fill: ' + low_medium_color);
      }
      else if (Number(d[field]) > Math.ceil(max_log)) {
        return ('fill: skyblue');
      }
      else if (Number(d[field]) > max_log) {
        return ('fill: ' + log_low_color);
      }
      else {
        return ('fill: silver');
      }
    };
    func.max_low = max_low;
    func.max_medium = max_medium;
    func.field = field;
    return func;
  }

  var chart_generators = {};

  /*
  * Dashboard functions
  */
  function create_dashboard(id, controllersString, heightsString, filtersString,
                      dashboardOpts) {
    if (gsa.has_value(heightsString)) {
      // ensure a string
      heightsString += '';
    }
    var elem = $('#' + id);
    var rows = {};
    var components = {};
    var controllerFactories = {};
    var filters = [{id: '', name: '--', term: '', type: ''}];
    var prevControllersString = controllersString;
    var prevHeightsString = heightsString;
    var prevFiltersString = filtersString;
    var lastRowIndex = 0;
    var lastComponentIndex = 0;
    var currentResizeTimeout;
    var width = -1;
    var height = -1;
    var topTarget, bottomTarget;
    var editMode = false;
    var totalComponents = 0;
    var controllersPrefRequest;
    var heightsPrefRequest;
    var filtersPrefRequest;

    /*
    * Extra options
    */
    // Controller selection preference
    var controllersPrefID = '';
    // Row heights preference
    var heightsPrefID;
    // Filter selection preference
    var filtersPrefID = '';
    // Controller String for new components
    var defaultControllerString = 'by-cvss';
    // Filter String for new components
    var defaultFilterString;
    // Maximum number of components
    var maxComponents = 8;
    // Maximum number of components per row
    var maxPerRow = 4;

    // Controls element
    var dashboardControls;
    var startEditButton;
    var stopEditButton;
    var newComponentButton;

    var dashboard = {
      id: get_id,
      elem: get_elem,
      editMode: edit_mode,
      maxComponents: max_components,
      maxPerRow: max_per_row,
      addNewRow: add_new_row,
      addToNewRow: add_to_new_row,
      registerComponent: register_component,
      unregisterComponent: unregister_component,
      component: get_component,
      getNextRowId: get_next_row_id,
      getNextComponentId: get_next_component_id,
      controllersString: get_controllers_string,
      filtersString: get_filters_string,
      updateControllersString: update_controllers_string,
      updateHeightsString: update_heights_string,
      updateFiltersString: update_filters_string,
      removeRow: remove_row,
      updateComponentCountClasses: update_component_count_classes,
      updateRows: update_rows,
      removeComponent: remove_component,
      newComponent: new_component,
      loadContent: load_content,
      resized: resized,
      resize: resize,
      redraw: redraw,
      addControllerFactory: add_controller_factory,
      addFilter: add_filter,
      addControllersForComponent: add_controllers_for_component,
      addFiltersForComponent: add_filters_for_component,
      initComponentsFromString: init_components_from_string,
      startEdit: start_edit,
      stopEdit: stop_edit,
    };

    init();

    return dashboard;

    function init() {
      if (dashboardOpts) {
        if (dashboardOpts.controllersPrefID) {
          controllersPrefID = dashboardOpts.controllersPrefID;
        }
        if (dashboardOpts.heightsPrefID) {
          heightsPrefID = dashboardOpts.heightsPrefID;
        }
        if (dashboardOpts.filtersPrefID) {
          filtersPrefID = dashboardOpts.filtersPrefID;
        }
        if (dashboardOpts.defaultFilterString) {
          defaultFilterString = dashboardOpts.defaultFilterString;
        }
        if (dashboardOpts.defaultControllerString) {
          defaultControllerString = dashboardOpts.defaultControllerString;
        }
        if (dashboardOpts.defaultFilterString) {
          defaultFilterString = dashboardOpts.defaultFilterString;
        }
        if (dashboardOpts.maxComponents) {
          maxComponents = dashboardOpts.maxComponents;
        }
        if (dashboardOpts.maxPerRow) {
          maxPerRow = dashboardOpts.maxPerRow;
        }
        if (dashboardOpts.dashboardControls) {
          dashboardControls = dashboardOpts.dashboardControls;
        }
      }

      if (dashboardControls) {
        startEditButton = $('<a/>', {
          href: 'javascript:void(0);',
          on: {
            click: function() {dashboard.startEdit();},
          },
        })
        .append($('<img/>', {
          src: 'img/edit.png',
          alt: gsa._('Edit Dashboard'),
          title: gsa._('Edit Dashboard'),
        }))
        .appendTo($(dashboardControls));

        newComponentButton = $('<a/>', {
          href: 'javascript:void(0);',
          on: {
            click: function() {dashboard.newComponent();},
          }
        })
        .append($('<img/>', {
          src: 'img/new.png',
          alt: gsa._('Add new Component'),
          title: gsa._('Add new Component'),
        }))
        .appendTo($(dashboardControls));

        newComponentButton.hide();

        stopEditButton = $('<a/>', {
          href: 'javascript:void(0);',
          on: {
            click: function() {dashboard.stopEdit();},
          }
        })
        .append($('<img/>', {
          src: 'img/stop.png',
          alt: gsa._('Stop Editing'),
          title: gsa._('Stop Editing'),
        }))
        .appendTo($(dashboardControls));

        stopEditButton.hide();
      }

      width = elem[0].clientWidth;

      $(window).on('load', function() {
        // Window resize
        $(window).on('resize', function() {
          dashboard.resized(false);
        });
      });

      // add drop targets for new rows
      topTarget = create_dashboard_new_row_target(dashboard, 'top');
      elem.prepend(topTarget.elem());
      bottomTarget = create_dashboard_new_row_target(dashboard, 'bottom');
      elem.append(bottomTarget.elem());
    }

    function get_id() {
      return id;
    }

    function get_elem() {
      return elem[0];
    }

    function edit_mode() {
      return editMode;
    }

    function max_components() {
      return maxComponents;
    }

    function max_per_row() {
      return maxPerRow;
    }

    function add_new_row(options) {
      if (!gsa.is_defined(options)) {
        options = {};
      }
      if (!gsa.is_defined(options.height)) {
        options.height = 280;
      }
      else if (options.height < 150) {
        options.height = 150;
      }
      var row = create_dashboard_row(dashboard, dashboard.getNextRowId(),
          options.rowControllersString, options.rowFiltersString,
          options.height, dashboardOpts);
      rows[row.id()] = row;

      if (gsa.is_defined(options.position) && options.position === 'top') {
        elem.prepend(row.elem());
        elem.prepend(topTarget.elem());
      }
      else {
        elem.append(row.elem());
        elem.append(bottomTarget.elem());
      }
      if (editMode) {
        row.startEdit();
      }
      return row;
    }

    function add_to_new_row(componentID, position) {
      var newRow = dashboard.addNewRow({position: position});
      var component = components[componentID];
      newRow.addComponent(component);
      dashboard.resize();
      dashboard.redraw();
      dashboard.updateRows();
    }

    function register_component(component) {
      components[component.id()] = component;
    }

    function unregister_component(component) {
      delete components[component.id()];
    }

    function get_component(id) {
      return components[id];
    }

    function get_next_row_id() {
      lastRowIndex++;
      return id + '-row-' + lastRowIndex;
    }

    function get_next_component_id() {
      lastComponentIndex++;
      return id + '-box-' + lastComponentIndex;
    }

    function get_controllers_string() {
      return controllersString;
    }

    function get_filters_string() {
      return filtersString;
    }

    function update_controllers_string() {
      controllersString = '';

      elem.find('.dashboard-row').each(function() {
        var entry = $(this).attr('id');
        var row = rows[entry];
        var rowControllersString = row.updateControllersString();
        if (row.componentsCount() !== 0) {
          controllersString += rowControllersString;
          controllersString += '#';
        }
      });

      controllersString = controllersString.slice(0, -1);

      save_controllers_string();

      return controllersString;
    }

    function save_controllers_string() {
      if (controllersString !== prevControllersString) {
        prevControllersString = controllersString;

        if (controllersPrefID !== '') {
          if (controllersPrefRequest) {
            controllersPrefRequest.abort();
          }

          controllersPrefRequest = d3.xhr('/omp');

          var form_data = new FormData();
          form_data.append('chart_preference_id', controllersPrefID);
          form_data.append('chart_preference_value', controllersString);
          form_data.append('token', gsa.gsa_token);
          form_data.append('cmd', 'save_chart_preference');

          controllersPrefRequest.post(form_data);
        }
      }
    }

    function update_heights_string() {
      heightsString = '';

      elem.find('.dashboard-row').each(function() {
        var entry = $(this).attr('id');
        var row = rows[entry];
        var rowHeight = row.height();
        if (row.componentsCount() !== 0) {
          heightsString += rowHeight;
          heightsString += '#';
        }
      });

      heightsString = heightsString.slice(0, -1);

      save_heights_string();

      return heightsString;
    }

    function save_heights_string() {
      if (heightsString !== prevHeightsString) {
        if (heightsPrefID !== '' && gsa.has_value(heightsPrefID)) {
          if (heightsPrefRequest) {
            heightsPrefRequest.abort();
          }

          heightsPrefRequest = d3.xhr('/omp');

          var form_data = new FormData();
          form_data.append('chart_preference_id', heightsPrefID);
          form_data.append('chart_preference_value', heightsString);
          form_data.append('token', gsa.gsa_token);
          form_data.append('cmd', 'save_chart_preference');

          heightsPrefRequest.post(form_data);
        }
      }
    }

    function update_filters_string() {
      if (!gsa.has_value(filtersString)) {
        return;
      }

      filtersString = '';
      elem.find('.dashboard-row').each(function() {
        var entry = $(this).attr('id');
        var row = rows[entry];
        var rowFiltersString = row.updateFiltersString();
        if (row.componentsCount() !== 0) {
          filtersString += rowFiltersString;
          filtersString += '#';
        }
      });

      filtersString = filtersString.slice(0, -1);

      save_filters_string();

      return filtersString;
    }

    function save_filters_string() {
      if (filtersString !== prevFiltersString) {
        prevFiltersString = filtersString;
        if (filtersPrefID !== '') {
          if (filtersPrefRequest) {
            filtersPrefRequest.abort();
          }

          filtersPrefRequest = d3.xhr('/omp');

          var form_data = new FormData();
          form_data.append('chart_preference_id', filtersPrefID);
          form_data.append('chart_preference_value', filtersString);
          form_data.append('token', gsa.gsa_token);
          form_data.append('cmd', 'save_chart_preference');

          filtersPrefRequest.post(form_data);
        }
      }
    }

    function remove_row(row) {
      var id = row.id();

      if (!(id in rows)) {
        return;
      }

      $(row.elem()).hide('blind', {}, 250, function() {
        $(row.elem()).remove();
        dashboard.resize();
        dashboard.redraw();
        delete rows[id];
      });
    }

    function update_component_count_classes() {
      for (var item in rows) {
        rows[item].updateComponentCountClasses();
      }
    }

    function update_rows() {
      totalComponents = 0;
      for (var id in rows) {
        var row = rows[id];
        row.updateComponents();
        if (row.componentsCount() === 0) {
          dashboard.removeRow(row);
        }

        totalComponents += row.componentsCount();
      }
      if (gsa.has_value(controllersString)) {
        dashboard.updateControllersString();
      }
      if (gsa.has_value(heightsString)) {
        dashboard.updateHeightsString();
      }
      if (gsa.has_value(filtersString)) {
        dashboard.updateFiltersString();
      }
    }

    function remove_component(component) {
      var row = component.row();
      row.removeComponent(component);
      dashboard.unregisterComponent(component);

      if (row.componentsCount() === 0) {
        dashboard.removeRow(row);
      }

      dashboard.updateRows();

      if (totalComponents < maxComponents) {
        newComponentButton.show();
      }
    }

    function new_component() {
      if (totalComponents >= maxComponents) {
        console.error('Maximum number of components reached');
        return;
      }

      var lastFreeRowElem = elem.find('.dashboard-row:not(".full")').last();
      var row;
      var component;
      if (lastFreeRowElem[0]) {
        row = rows[lastFreeRowElem.attr('id')];
        component = create_dashboard_component(row,
            dashboard.getNextComponentId(), defaultControllerString,
            defaultFilterString, dashboardOpts);
        dashboard.registerComponent(component);
        row.addComponent(component);
        row.resize();
        row.redraw();
      }
      else {
        // All rows full
        row = dashboard.addNewRow({
          rowControllersString: defaultControllerString,
          rowFiltersString: defaultFilterString,
          position: 'bottom',
        });
        component = row.lastAddedComponent();
        dashboard.resize();
        dashboard.redraw();
      }
      component.activateSelectors();
      component.selectController(component.controllerString(), false, true);
      dashboard.updateRows();

      if (totalComponents >= maxComponents) {
        newComponentButton.hide();
      }
    }

    function load_content() {
      for (var item in rows) {
        rows[item].loadContent();
      }
    }

    function resized(checkHeight) {
      var dom_elem = elem[0];
      if (checkHeight) {
        if (width === dom_elem.clientWidth &&
            height === dom_elem.clientHeight) {
          return;
        }
      }
      else {
        if (width === dom_elem.clientWidth) {
          return;
        }
      }
      width = dom_elem.clientWidth;
      height = dom_elem.clientHeight;
      dashboard.resize();
      global.clearTimeout(currentResizeTimeout);
      currentResizeTimeout = global.setTimeout(dashboard.redraw, 50);
    }

    function resize() {
      for (var item in rows) {
        if (!gsa.has_value(heightsString)) {
          rows[item].height(elem[0].clientHeight);
        }
        rows[item].resize();
      }
    }

    function redraw() {
      for (var item in rows) {
        rows[item].redraw();
      }
    }

    function add_controller_factory(factoryName, factoryFunc) {
      controllerFactories[factoryName] = factoryFunc;
    }

    function add_filter(filterID, filterName, filterTerm, filterType) {
      filters.push({
        id: filterID,
        name: filterName,
        term: filterTerm,
        type: filterType
      });
    }

    function add_controllers_for_component(component) {
      for (var factoryName in controllerFactories) {
        controllerFactories[factoryName](component);
      }
    }

    function add_filters_for_component(component) {
      for (var filterIndex in filters) {
        var filter = filters[filterIndex];
        component.addFilter(filter.id, filter);
      }
    }

    function init_components_from_string() {
      var rowControllersStringList = [];
      if (controllersString) {
        rowControllersStringList = controllersString.split('#');
      }

      var rowFiltersStringList = null;
      if (filtersString) {
        rowFiltersStringList = filtersString.split('#');
      }

      var rowHeightsList;
      if (heightsString) {
        rowHeightsList = heightsString.split('#');
      }
      else {
        rowHeightsList = [];
      }

      for (var index in rowControllersStringList) {
        height = parseInt(rowHeightsList[index]);
        if (isNaN(height)) {
          height = undefined;
        }

        dashboard.addNewRow({
          rowControllersString: rowControllersStringList[index],
          rowFiltersString: filtersString ? rowFiltersStringList[index] : null,
          height: height,
        });
      }

      totalComponents = Object.keys(components).length;

      dashboard.resize();
      dashboard.redraw();

      var id;
      if (controllersString) {
        for (id in components) {
          components[id].updateControllerSelect();
          components[id].updateFilterSelect();
        }
      }
      for (id in components) {
        components[id].activateSelectors();
      }
      dashboard.redraw();
    }

    function start_edit() {
      if (editMode) {
        return;
      }
      editMode = true;
      $(topTarget.elem()).show('blind', {}, 150);
      $(bottomTarget.elem()).show('blind', {}, 150);
      elem.addClass('edit');
      for (var item in rows) {
        rows[item].startEdit();
      }

      if (dashboardControls) {
        startEditButton.hide();
        stopEditButton.show();

        if (totalComponents < maxComponents) {
          newComponentButton.show();
        }
      }
    }

    function stop_edit() {
      if (!editMode) {
        return;
      }
      $(topTarget.elem()).hide('blind', {}, 150);
      $(bottomTarget.elem()).hide('blind', {}, 150);
      editMode = false;
      elem.removeClass('edit');
      for (var item in rows) {
        rows[item].stopEdit();
      }

      if (dashboardControls) {
        startEditButton.show();
        stopEditButton.hide();
        newComponentButton.hide();
      }
    }
  }

  /*
  * Dashboard Rows
  */
  function create_dashboard_row(dashboard, id, controllersString, filtersString,
      height, dashboardOpts) {
    var components = {};
    var compCountOffset = 0;
    var lastAddedComponent;
    var prevHeight = height;
    var elem;
    var componentStringList = [];
    var filterStringList;

    var dashboard_row = {
      elem: get_elem,
      id: get_id,
      dashboard: get_dashboard,
      height: get_set_height,
      component: get_component,
      controllersString: get_controllers_string,
      filtersString: get_filters_string,
      lastAddedComponent: get_last_added_component,
      componentsCount: get_components_count,
      registerComponent: register_component,
      unregisterComponent: unregister_component,
      updateControllersString: update_controllers_string,
      updateFiltersString: update_filters_string,
      updateComponentCountClasses: update_component_count_classes,
      updateComponents: update_components,
      removeComponent: remove_component,
      loadContent: load_content,
      startEdit: start_edit,
      stopEdit: stop_edit,
      redraw: redraw,
      resize: resize,
      addComponent: add_component,
    };

    init();

    return dashboard_row;

    function init() {
      elem = $('<div/>', {
        'class': 'dashboard-row',
        id: id,
        height: height,
      });

      elem.css('height', height);

      if (controllersString) {
        componentStringList = controllersString.split('|');
      }

      if (filtersString) {
        filterStringList = filtersString.split('|');
      }

      for (var index in componentStringList) {
        var component = create_dashboard_component(dashboard_row,
            dashboard.getNextComponentId(), componentStringList[index],
            filterStringList ? filterStringList[index] : null,
            dashboardOpts);
        dashboard.registerComponent(component);
        dashboard_row.addComponent(component);
      }
    }

    function get_elem() {
      return elem[0];
    }

    function get_dashboard() {
      return dashboard;
    }

    function get_id() {
      return id;
    }

    function add_component(component) {
      dashboard_row.registerComponent(component);
      elem.append(component.elem());
      return dashboard_row;
    }

    function get_set_height(newHeight) {
      if (!gsa.is_defined(newHeight)) {
        return height;
      }

      if (height !== newHeight) {
        height = newHeight;
        prevHeight = height;
      }
    }

    function get_component(id) {
      return components[id];
    }

    function get_controllers_string() {
      return controllersString;
    }

    function get_last_added_component() {
      return lastAddedComponent;
    }

    function get_components_count() {
      var placeholderCount = $(elem).find(
          '.dashboard-placeholder').toArray().length;
      return Object.keys(components).length + placeholderCount +
        compCountOffset;
    }

    function register_component(component) {
      components[component.id()] = component;
      lastAddedComponent = component;
    }

    function unregister_component(component) {
      delete components[component.id()];
    }

    function get_filters_string() {
      return filtersString;
    }

    function update_controllers_string() {
      controllersString = '';
      for (var item in components) {
        controllersString += components[item].controllerString();
        controllersString += '|';
      }
      controllersString = controllersString.slice(0, -1);
      return controllersString;
    }

    function update_filters_string() {
      filtersString = '';
      for (var item in components) {
        filtersString += components[item].filterString();
        filtersString += '|';
      }
      filtersString = filtersString.slice(0, -1);
      return filtersString;
    }

    function update_component_count_classes() {
      for (var i = 0; i <= 4; i++) {
        $(elem).removeClass('num-components-' +  i);
      }
      $(elem).addClass('num-components-' + dashboard_row.componentsCount());
    }

    function update_components() {
      var componentElems = $(elem).children('div.dashboard-box').toArray();
      var newComponents = {};
      for (var index in componentElems) {
        var id = componentElems[index].id;
        newComponents[id] = dashboard.component(id);
        newComponents[id].row(dashboard_row);
      }
      components = newComponents;
      compCountOffset = 0;

      if (dashboard_row.componentsCount() >= dashboard.maxPerRow()) {
        $(elem).addClass('full');
      }
      else {
        $(elem).removeClass('full');
      }

      dashboard_row.updateComponentCountClasses();
    }

    function remove_component(component) {
      var id = component.id();
      if (!(id in components)) {
        return;
      }
      component.elem().remove();
      dashboard_row.unregisterComponent(component);
    }

    function load_content() {
      for (var item in components) {
        components[item].loadContent();
      }
    }

    function resize(newRowWidth, newRowHeight) {
      if (newRowHeight) {
        height = newRowHeight;
      }

      $(elem).css('height', height);
      $(elem).attr('height', height);

      for (var item in components) {
        components[item].resize(newRowWidth, newRowHeight);
      }
    }

    function redraw() {
      for (var item in components) {
        components[item].redraw();
      }
    }

    function start_edit() {
      for (var componentID in components) {
        components[componentID].startEdit();
      }

      $(elem).resizable({
        handles: 's',
        minHeight: 150,
        grid: [10, 10],
        resize: function(event, ui) {
          dashboard_row.resize(undefined, ui.size.height);
          dashboard.resize();
        },
        stop: function(event, ui) {
          dashboard.redraw();
          dashboard.updateHeightsString();
        }
      });
      $(elem).sortable({
        handle: '.chart-head',
        connectWith: '.dashboard-row:not(".full"), .dashboard-add-row',
        placeholder: 'dashboard-placeholder',
        forcePlaceholderSize: true,
        opacity: 0.75,
        tolerance: 'pointer',
        start: function(event, ui) {
          compCountOffset = -1;
          dashboard.resize();
        },
        stop: function(event, ui) {
          dashboard.updateRows();
          dashboard.resize();
          dashboard.redraw();
        },
        change: function(event, ui) {
          dashboard.resize();
          dashboard.updateComponentCountClasses();
        }
      });
    }

    function stop_edit() {
      for (var componentID in components) {
        components[componentID].stopEdit();
      }

      $(elem).resizable('destroy');
      $(elem).sortable('destroy');
    }
  }

  /*
  * Dashboard "New Row" drop target
  */
  function create_dashboard_new_row_target(dashboard, position) {
    var id;
    var elem;

    var new_row_target = {
      elem: get_elem,
      dashboard: get_dashboard,
      id: get_id,
    };

    init();

    return new_row_target;

    function init() {
      id = dashboard.id() + '-' + position + '-add';
      elem = $('<div/>', {
        'class': 'dashboard-add-row',
        id: id,
        css: {
          'display': dashboard.editMode() ? 'block' : 'none',
        },
      });

      elem.sortable({
        handle: '.chart-head',
        forcePlaceholderSize: true,
        opacity: 0.75,
        tolerance: 'pointer',
        receive: function(event, ui) {
          var receivedID = ui.item.attr('id');
          dashboard.addToNewRow(receivedID, position);
        },
      });
    }

    function get_elem() {
      return elem;
    }

    function get_dashboard() {
      return dashboard;
    }

    function get_id() {
      return id;
    }
  }

  /*
  * Dashboard Component Boxes
  */
  function create_dashboard_component(row, id, controllerString, filterString,
      dashboardOpts) {
    var dashboard = row ? row.dashboard() : null;
    var controllers = [];
    var controllerIndexes = {};
    var currentCtrlIndex = -1;
    var filterType;
    var allFilters = [];
    var filters = [];
    var filterIndexes = {};
    var currentFilterIndex = -1;
    var selectorsActive = false;

    var lastRequestedController;
    var lastRequestedFilter;
    var last_generator;
    var last_gen_params;

    var hideControllerSelect;
    var hideFilterSelect;
    var controllerSelectElem;
    var filterSelectElem;

    var elem;
    var menu;
    var svg;
    var content;
    var loading;
    var header;
    var footer;
    var topButtons;

    var dashboard_component = {
      elem: get_elem,
      header: get_header,
      svg: get_svg,
      row: get_set_row,
      dashboard: get_dashboard,
      id: get_id,
      controllerString: get_set_controller_string,
      filterType: get_set_filter_type,
      filterString: get_set_filter_string,
      currentFilter: get_current_filter,
      addController: add_controller,
      addFilter: add_filter,
      remove: remove,
      resize: resize,
      redraw: redraw,
      lastRequestedController: get_set_last_requested_controller,
      lastRequestedFilter: get_set_last_requested_filter,
      startEdit: start_edit,
      stopEdit: stop_edit,
      activateSelectors: activate_selectors,
      updateControllerSelect: update_controller_select,
      selectController: select_controller,
      selectControllerIndex: select_controller_index,
      showError: show_error,
      showLoading: show_loading,
      hideLoading: hide_loading,
      prevController: select_prev_controller,
      nextController: select_next_controller,
      createChartSelector: create_chart_selector,
      updateFilterSelect: update_filter_select,
      selectFilter: select_filter,
      selectFilterIndex: select_filter_index,
      prevFilter: select_pref_filter,
      nextFilter: select_next_filter,
      createFilterSelector: create_filter_selector,
      setTitle: set_title,
      // TODO use camel case here
      last_generator: get_last_generator,
      last_gen_params: get_last_gen_params,
      update_gen_data: update_gen_data,
      create_or_get_menu_item: create_or_get_menu_item,
    };

    init();

    return dashboard_component;

    function init() {
      if (dashboardOpts) {
        if (dashboardOpts.hideControllerSelect) {
          hideControllerSelect = dashboardOpts.hideControllerSelect;
        }
        if (dashboardOpts.hideControllerSelect) {
          hideFilterSelect = dashboardOpts.hideFilterSelect;
        }
      }

      elem = $('<div/>', {
        'class': 'dashboard-box',
        id: id,
      });

      var innerElem_d3 = $('<div/>', {
        'class': 'chart-box',
      }).appendTo(elem);

      menu = $('<li/>')
        .appendTo($('<ul/>')
            .appendTo($('<div/>', {
                id: 'chart_list',
              })
              .appendTo(innerElem_d3))
          );

      $('<a/>', {
        'id': 'section_list_first',
      }).appendTo(menu);

      menu = $('<ul/>', {
        id: id + '-menu',
      }).appendTo(menu);

      menu = menu[0];

      topButtons = $('<div/>', {
        'class': 'chart-top-buttons',
      }).appendTo(innerElem_d3);

      $('<a/>', {
        'class': 'remove-button',
        href: 'javascript:void(0);',
        on: {
          click: function() { dashboard_component.remove(); },
        },
        css: {
          'display': dashboard.editMode() ? 'inline' : 'none',
        }
      })
      .append($('<img/>', {
        src: '/img/delete.png',
        alt: gsa._('Remove'),
        title: gsa._('Remove'),
      }))
      .appendTo(topButtons);

      header = $('<div/>', {
        'class': 'chart-head',
        id: id + '-head',
        text: gsa._('Initializing component "{{component}}"...',
            {component: controllerString}),
      }).appendTo(innerElem_d3);

      header = header[0];

      content = $('<div/>', {
        'class': 'dashboard-box-content',
        id: id + '-content',
      }).appendTo(innerElem_d3);

      loading = $('<div/>', {
        'class': 'dashboard-loading',
      }).appendTo(content);

      loading.append($('<span/>', {
        'class': 'ui-icon ui-icon-waiting',
      }));

      $('<span/>').text(gsa._('Loading data ...')).appendTo(loading);

      svg = d3.select(content[0])
        .append('svg')
        .attr('class', 'chart-svg')
        .attr('id', id + '-svg')
        .attr('width', 450)
        .attr('height', 250);

      footer = $('<div/>', {
        'class': 'chart-foot',
        'id': id + '-foot',
      }).appendTo(innerElem_d3);

      footer = footer[0];

      dashboard.addControllersForComponent(dashboard_component);
      dashboard.addFiltersForComponent(dashboard_component);

      if (!hideControllerSelect) {
        dashboard_component.createChartSelector();
      }
      if (!hideFilterSelect && allFilters.length > 1) {
        dashboard_component.createFilterSelector();
      }
    }

    function get_elem() {
      return elem;
    }

    function get_header() {
      return d3.select(header);
    }

    function get_svg() {
      return svg;
    }

    function set_title(title) {
      $(header).text(title);
      return dashboard_component;
    }

    function get_set_row(newRow) {
      if (!gsa.is_defined(newRow)) {
        return row;
      }
      row = newRow;
      return dashboard_component;
    }

    function get_dashboard() {
      return dashboard;
    }

    function get_id() {
      return id;
    }

    function get_set_controller_string(newStr) {
      if (!gsa.is_defined(newStr)) {
        return controllerString;
      }
      controllerString = newStr;
      dashboard.updateControllersString();
    }

    function get_set_filter_type(newType) {
      if (!gsa.is_defined(newType)) {
        return filterType;
      }
      else if (newType !== filterType) {
        var prevFilter = filters[currentFilterIndex];
        var select2data;
        var i;
        select2data = [];
        filterType = newType;
        filterIndexes = {};
        filters = [];
        for (i = 0; i < allFilters.length; i++) {
          if (allFilters[i].type === '' || allFilters[i].type === filterType) {
            var filterID = allFilters[i].id;
            filterIndexes[filterID] = filters.length;
            if (filterSelectElem) {
              select2data.push({text: allFilters[i].name, id: filterID});
            }
            filters.push(allFilters[i]);
          }
        }
        if (filterSelectElem) {
          filterSelectElem.html('');
          filterSelectElem.select2({data: select2data});
        }
        if (gsa.is_defined(prevFilter)) {
          var newIndex;
          for (i = 0; i < filters.length; i++) {
            if (filters[i].id === prevFilter.id) {
              newIndex = i;
              break;
            }
          }
          if (gsa.is_defined(newIndex)) {
            currentFilterIndex = newIndex;
            filterSelectElem.select2()
              .val(prevFilter.id ? prevFilter.id : '--');
          }
          else {
            filterSelectElem.select2().val('--').trigger('change');
          }
        }
      }
    }

    function get_set_filter_string(newStr) {
      if (!gsa.is_defined(newStr)) {
        return filterString;
      }
      filterString = newStr;
      dashboard.updateFiltersString();
    }

    function get_current_filter() {
      if (currentFilterIndex >= 0) {
        return filters [currentFilterIndex];
      }
      else {
        return null;
      }
    }

    function add_controller(controllerName, controller) {
      controllerIndexes[controllerName] = controllers.length;
      controllers.push(controller);
    }

    function add_filter(filterID, filter) {
      allFilters.push(filter);
    }

    function remove() {
      $(elem).hide('fade', {}, 250, function() {
        dashboard.removeComponent(dashboard_component);
        row.resize();
        row.redraw();
      });
    }

    function resize(newRowWidth, newRowHeight) {
      var rowWidth, rowHeight;
      var componentsCount = row.componentsCount();
      // Set height first
      if (!gsa.is_defined(newRowHeight)) {
        rowHeight = $(row.elem()).attr('height');
      }
      else {
        rowHeight = newRowHeight;
      }
      var newHeight = rowHeight - header.clientHeight - footer.clientHeight - 8;
      dashboard_component.svg().attr('height', newHeight);

      if (!gsa.is_defined(newRowWidth)) {
        rowWidth = dashboard.elem().clientWidth;
      }
      else {
        rowWidth = newRowWidth;
      }
      var newWidth = (rowWidth - 2) / (componentsCount ? componentsCount : 1);
      dashboard_component.svg().attr('width', newWidth - 8);
      $(elem).css('width', newWidth);
    }

    function redraw() {
      svg.selectAll('*').remove();
      apply_select2();
      if (currentCtrlIndex >= 0) {
        controllers[currentCtrlIndex]
          .sendRequest(filters[currentFilterIndex]);
      }
    }

    function get_set_last_requested_controller(newController) {
      if (!gsa.is_defined(newController)) {
        return lastRequestedController;
      }
      lastRequestedController = newController;
      return dashboard_component;
    }

    function get_set_last_requested_filter(newFilter) {
      if (!gsa.is_defined(newFilter)) {
        return lastRequestedFilter;
      }
      lastRequestedFilter = newFilter;
      return dashboard_component;
    }

    // Edit management
    function start_edit() {
      topButtons.children('.remove-button').show();
    }

    function stop_edit() {
      topButtons.children('.remove-button').hide();
    }

    // Data management

    /* Gets the last successful generator */
    function get_last_generator() {
      return last_generator;
    }

    /* Gets the parameters for the last successful generator run */
    function get_last_gen_params() {
      return last_gen_params;
    }

    /* Updates the data on the last successful generator.
    * Should be called by the generator if it was successful */
    function update_gen_data(generator, gen_params) {
      last_generator = generator;
      last_gen_params = gen_params;
      return dashboard_component;
    }

    /* Puts an error message into the header and clears the svg element */
    function show_error(message) {
      $(header).text(message);
      dashboard_component.svg().text('');
    }

    /* Gets a menu item or creates it if it does not exist */
    function create_or_get_menu_item(menu_item_id, last) {
      var menu_d3 = d3.select(menu);
      var item = menu_d3
                  .select('li #' + id + '_' + menu_item_id)
                    .select('a');

      if (item.empty()) {
        var li = menu_d3.append('li');
        if (last) {
          li.attr('class', 'last');
        }
        item = li.attr('id', id + '_' + menu_item_id).append('a');
      }

      return item;
    }

    // Activators selectors
    function activate_selectors() {
      selectorsActive = true;
    }

    // Controller selection

    function update_controller_select() {
      if (controllerSelectElem) {
        $(controllerSelectElem).select2('val', controllerString);
      }
      else {
        dashboard_component.selectController(controllerString, false, false);
      }
    }

    function select_controller(name, savePreference, requestData) {
      var index = controllerIndexes[name];
      if (!gsa.is_defined(index)) {
        console.warn('Chart not found: ' + name);
        dashboard_component.selectControllerIndex(0, savePreference,
            requestData);
      }
      else {
        dashboard_component.selectControllerIndex(index, savePreference,
            requestData);
      }
    }

    function select_controller_index(index, savePreference, requestData) {
      if (typeof(index) !== 'number' || index < 0 ||
          index >= controllers.length) {
        return console.error('Invalid chart index: ' + index);
      }
      var prev_filter_type;
      var new_filter_type;
      if (controllers[currentCtrlIndex]) {
        prev_filter_type = controllers[currentCtrlIndex].filterType();
      }
      new_filter_type = controllers[index].filterType();

      currentCtrlIndex = index;
      dashboard_component.controllerString(
          controllers[currentCtrlIndex].chart_name());

      if (prev_filter_type !== new_filter_type) {
        dashboard_component.filterType(new_filter_type);
      }

      if (requestData && selectorsActive) {
        dashboard_component.redraw();
      }
    }

    function select_prev_controller() {
      if (currentCtrlIndex <= 0) {
        $(controllerSelectElem)
          .select2('val', controllers[controllers.length - 1].chart_name());
      }
      else {
        $(controllerSelectElem)
          .select2('val', controllers[currentCtrlIndex - 1].chart_name());
      }
    }

    function select_next_controller() {
      if (currentCtrlIndex >= controllers.length - 1) {
        $(controllerSelectElem)
          .select2('val', controllers[0].chart_name());
      }
      else {
        $(controllerSelectElem)
          .select2('val', controllers[currentCtrlIndex + 1].chart_name());
      }
    }

    /* Adds a chart selector to the footer */
    function create_chart_selector() {
      $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {dashboard_component.prevController();},
        }
      })
      .append($('<img/>', {
        src: 'img/previous.png',
        css: {
          'vertical-align': 'middle'
        },
      }))
      .appendTo(footer);

      controllerSelectElem = $('<select/>', {
        css: {
          'margin-left': '5px',
          'margin-right': '5px',
          'vertical-align': 'middle',
        },
        on: {
          change: function() {
            dashboard_component.selectController(this.value, true, true);
          },
        },
      })
      .appendTo(footer);

      for (var controllerIndex in controllers) {
        var controller = controllers[controllerIndex];
        var controllerName = controller.chart_name();
        $('<option/>', {
          value: controllerName,
          id: id + '_chart_opt_' + controllerIndex,
          text: controller.label(),
        })
        .appendTo(controllerSelectElem);
      }

      $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {
            dashboard_component.nextController();
          },
        },
      })
      .append($('<img/>', {
        src: 'img/next.png',
        css: {
          'vertical-align': 'middle',
        },
      }))
      .appendTo(footer);

      $('<br>').appendTo(footer);
    }

    function update_filter_select() {
      if (filterSelectElem) {
        $(filterSelectElem).select2('val', filterString);
      }
      else {
        if (filterString) {
          dashboard_component.selectFilter(filterString, false, false);
        }
      }
    }

    function select_filter(id, savePreference, requestData) {
      var index = filterIndexes[id];
      if (!gsa.is_defined(index)) {
        console.warn('Filter not found: "' + id + '"');
        dashboard_component.selectFilterIndex(0, savePreference, requestData);
      }
      else {
        dashboard_component.selectFilterIndex(index, savePreference,
            requestData);
      }
    }

    function select_filter_index(index, savePreference, requestData) {
      if (typeof(index) !== 'number' || index < 0 || index >= filters.length) {
        return console.error('Invalid filter index: ' + index);
      }
      currentFilterIndex = index;
      dashboard_component.filterString(filters[currentFilterIndex].id);

      if (requestData && selectorsActive) {
        dashboard_component.redraw();
      }
    }

    function select_pref_filter() {
      if (currentFilterIndex <= 0) {
        $(filterSelectElem)
          .select2('val', filters[filters.length - 1].id);
      }
      else {
        $(filterSelectElem)
          .select2('val', filters[currentFilterIndex - 1].id);
      }
    }

    function select_next_filter() {
      if (currentFilterIndex >= filters.length - 1) {
        $(filterSelectElem)
          .select2('val', filters[0].id);
      }
      else {
        $(filterSelectElem)
          .select2('val', filters[currentFilterIndex + 1].id);
      }
    }

    /* Adds a filter selector to the footer */
    function create_filter_selector() {
      $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {
            dashboard_component.prevFilter();
          },
        },
      })
      .append($('<img/>', {
        src: 'img/previous.png',
        css: {
          'vertical-align': 'middle',
        },
      }))
      .appendTo(footer);

      filterSelectElem = $('<select/>', {
        css: {
          'margin-left': '5px',
          'margin-right': '5px',
          'vertical-align': 'middle',
        },
      })
      .appendTo(footer);

      for (var filterIndex in filters) {
        var filter = filters[filterIndex];
        $('<option/>', {
          value: filter.id,
          id: id + '_filter_opt_' + filter.id,
          text: filter.name,
        })
        .appendTo(filterSelectElem);
      }

      $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {
            dashboard_component.nextFilter();
          },
        },
      })
      .append($('<img/>', {
        src: 'img/next.png',
        css: {
          'vertical-align': 'middle',
        },
      }))
      .appendTo(footer);

      $('<br>').appendTo(footer);
    }

    function apply_select2() {
      $(elem).find('.select2-container').remove();
      if (controllerSelectElem) {
        $(controllerSelectElem).select2();
      }
      if (filterSelectElem) {
        $(filterSelectElem).select2();
        $(filterSelectElem).on('change', function() {
          var value = this.value !== '--' ? this.value : '';
          dashboard_component.selectFilter(value, true, true);
        });
      }
    }

    function show_loading() {
      loading.show();
    }

    function hide_loading() {
      loading.hide();
    }
  }

  /*
  * Creates a new Chart controller which manages the data source, generator and
  *  display of a chart
  *
  * Parameters:
  *  p_data_src:  The DataSource to use
  *  p_generator: The chart generator to use
  *  p_display:   The Display to use
  */
  function create_chart_controller(p_data_src, p_generator, p_display,
                  p_chart_name, p_label, p_icon,
                  p_chart_type, p_chart_template, p_gen_params, p_init_params) {
    var data_src = p_data_src;
    var generator = p_generator;
    var gen_params = p_gen_params;
    var init_params = p_init_params;
    var display = p_display;
    var chart_type = p_chart_type;
    var chart_template = p_chart_template ? p_chart_template : '';
    var chart_name = p_chart_name;
    var label = p_label ? p_label : gsa._('Unnamed chart');
    var icon = p_icon ? p_icon : '/img/help.png';
    var current_request;

    var controller = {
      id: get_id,
      showError: show_error,
      display: get_display,
      generator: get_set_generator,
      label: get_set_label,
      icon: get_set_icon,
      sendRequest: send_request,
      filterType: get_filter_type,

      // TODO use camel case
      data_src: get_set_data_source,
      chart_name: get_chart_name,
      chart_type: get_chart_type,
      current_request: get_set_current_request,
      show_loading: show_loading,
      data_loaded: on_data_loaded,
      detached_url: get_detached_url,
    };

    init();

    return controller;

    function init() {
      display.addController(chart_name, controller);
    }

    function get_id() {
      return chart_name + '@' + display.id();
    }

    function show_error(message) {
      return display.showError(message);
    }

    /* Gets or sets the data source */
    function get_set_data_source(value) {
      if (!arguments.length) {
        return data_src;
      }
      data_src = value;
      return controller;
    }

    /* Gets or sets the generator */
    function get_set_generator(value) {
      if (!arguments.length) {
        return generator;
      }
      generator = value;
      return controller;
    }

    /* Gets the display */
    function get_display(value) {
      return display;
    }

    /* Gets the chart name */
    function get_chart_name() {
      return chart_name;
    }

    /* Gets or sets the label */
    function get_set_label(value) {
      if (!arguments.length) {
        return label;
      }
      label = value;
      return controller;
    }

    /* Gets or sets the icon */
    function get_set_icon(value) {
      if (!arguments.length) {
        return icon;
      }
      icon = value;
      return controller;
    }

    /* Gets the chart type */
    function get_chart_type() {
      return chart_type;
    }

    /* Gets the filter type */
    function get_filter_type() {
      return data_src.filterType();
    }

    /* Gets or sets the current request */
    function get_set_current_request(value) {
      if (!arguments.length) {
        return current_request;
      }
      current_request = value;
      return controller;
    }

    /* Delegates a data request to the data source */
    function send_request(filter, p_gen_params) {
      if (p_gen_params) {
        gen_params = p_gen_params;
      }

      show_loading();
      data_src.sendRequest(controller, filter, gen_params);
    }

    /* Shows the "Loading ..." text in the display */
    function show_loading() {
      display.setTitle(generator.getTitle());
      display.showLoading();
    }

    /* Callback for when data has been loaded */
    function on_data_loaded(orig_data, gen_params) {
      display.hideLoading();
      generator.evaluateParams(gen_params);
      //TODO remove gen_params argument after all generators are using
      // evaluateParams
      var data = generator.generateData(controller, orig_data, gen_params);
      if (data === null) {
        return;
      }

      display.setTitle(generator.getTitle(data));
      generator.generate(controller.display(), data);
      display.update_gen_data(generator, gen_params);
      generator.addMenuItems(controller, data);
    }

    /* Construct URL for detached chart */
    function get_detached_url() {
      var extra_params_str = '';
      var field;
      if (gsa.has_value(gen_params.no_chart_links)) {
        extra_params_str = extra_params_str + '&no_chart_links=' +
                            (gen_params.no_chart_links ? '1' : '0');
      }

      if (gsa.has_value(gen_params.x_field)) {
        extra_params_str = extra_params_str + '&x_field=' +
                            encodeURIComponent(gen_params.x_field);
      }
      if (gsa.has_value(gen_params.y_fields)) {
        for (field in gen_params.y_fields) {
          extra_params_str = extra_params_str + '&y_fields:' +
                              (1 + Number(field)) +
                              '=' +
                              encodeURIComponent(gen_params.y_fields[field]);
        }
      }
      if (gsa.has_value(gen_params.z_fields)) {
        for (field in gen_params.z_fields) {
          extra_params_str = extra_params_str + '&z_fields:' +
                              (1 + Number(field)) +
                              '=' +
                              encodeURIComponent(gen_params.z_fields[field]);
        }
      }
      var param;
      for (param in init_params) {
        extra_params_str = extra_params_str + '&chart_init:' +
                            encodeURIComponent(param) +
                            '=' +
                            encodeURIComponent(init_params[param]);
      }
      for (param in gen_params.extra) {
        extra_params_str = extra_params_str + '&chart_gen:' +
                            encodeURIComponent(param) +
                            '=' +
                            encodeURIComponent(gen_params.extra[param]);
      }

      var command = data_src.command();
      if (command !== 'get_aggregate') {
        command = encodeURIComponent(command) + '_chart';
      }

      return create_uri(command,
                        display.currentFilter(),
                        data_src.params(),
                        data_src.prefix(),
                        true) +
            '&chart_type=' + encodeURIComponent(chart_type) +
            '&chart_template=' + encodeURIComponent(chart_template) +
            extra_params_str;
    }
  }

  /*
  * Data source (parameters for GSA request, XML response cache)
  *
  * Parameters:
  *  name: name of the data source
  *  options:  parameters for the command
  *  prefix:  prefix for OMP commands
  *  filter_type: Accepted filter type or empty for any.
  */
  function create_data_source(name, options, prefix) {
    prefix = gsa.is_defined(prefix) ? prefix : '/omp?';
    options = gsa.is_defined(options) ? options : {};
    var requestingControllers = {};
    var activeRequests = {};
    var xml_data = {};
    var column_info = {};
    var data = {};
    var params = {
      xml: 1,
    };
    var command;
    var filter_type;

    var data_source = {
      prefix: get_set_prefix,
      command: get_set_command,
      filterType: get_filter_type,
      param: get_set_param,
      params: get_params,
      addRequest: add_request,
      removeRequest: remove_request,
      checkRequests: check_requests,
      sendRequest: send_request,

      // TODO use camelcase
      delete_param: delete_param,
      column_info: get_column_info,
    };

    init();

    return data_source;

    function init() {
      if (gsa.is_defined(options.filter)) {
        params.filter = options.filter;
      }

      if (gsa.is_defined(options.filt_id)) {
        params.filt_id = options.filt_id;
      }

      if (options.type === 'task' || options.type === 'tasks') {
        command = 'get_tasks';
        filter_type = 'Task';

        params.ignore_pagination = 1;
        params.no_filter_history = 1;
        params.schedules_only = 1;
      }
      else {
        command = 'get_aggregate';
        filter_type = filter_type_name(options.aggregate_type);

        params.aggregate_type = options.aggregate_type;

        params.data_column = gsa.is_defined(options.data_column) ?
          options.data_column : '';
        params.group_column = gsa.is_defined(options.group_column) ?
          options.group_column : '';
        params.subgroup_column = gsa.is_defined(options.subgroup_column) ?
          options.subgroup_column : '';

        if (!options.data_columns) {
          params.data_columns = [];
        }
        else {
          params.data_columns = options.data_columns.split(',');
        }

        if (!options.text_columns) {
          params.text_columns = [];
        }
        else {
          params.text_columns = options.text_columns.split(',');
        }

        if (!options.sort_fields) {
          params.sort_fields = [];
        }
        else {
          params.sort_fields = options.sort_fields.split(',');
        }

        if (!options.sort_orders) {
          params.sort_orders = [];
        }
        else {
          params.sort_orders = options.sort_orders.split(',');
        }

        if (!options.sort_stats) {
          params.sort_stats = [];
        }
        else {
          params.sort_stats = options.sort_stats.split(',');
        }

        if (options.first_group) {
          params.first_group = options.first_group;
        }
        if (options.max_groups) {
          params.max_groups = options.max_groups;
        }
        if (options.aggregate_mode) {
          params.aggregate_mode = options.aggregate_mode;
        }
      }

      register_data_source();
    }

    function register_data_source() {
      gsa.data_sources[name] = data_source;
    }

    /* Gets or sets the prefix */
    function get_set_prefix(value) {
      if (!arguments.length) {
        return prefix;
      }
      prefix = value;
      return data_source;
    }

    /* Gets or sets the command name */
    function get_set_command(value) {
      if (!arguments.length) {
        return command;
      }

      command = value;
      return data_source;
    }

    /* Gets the filter type */
    function get_filter_type() {
      return filter_type;
    }

    /* Gets or sets a parameter */
    function get_set_param(param_name, value) {
      if (!arguments.length) {
        return undefined;
      }
      else if (arguments.length === 1) {
        return params[param_name];
      }
      else {
        params[param_name] = value;
      }
      return data_source;
    }

    /* Gets the parameters array */
    function get_params() {
      return params;
    }

    /* Removes a parameter */
    function delete_param(param_name) {
      delete params [param_name];
      return data_source;
    }

    /* Gets the Column data of the last successful request */
    function get_column_info() {
      return column_info;
    }

    function add_request(controller, filter, gen_params) {
      var filterID = filter ? filter.id : '';

      if (!gsa.is_defined(requestingControllers[filterID])) {
        requestingControllers[filterID] = {};
      }

      requestingControllers[filterID][controller.id()] = {
        active: true,
        controller: controller,
        filter: filter,
        gen_params: gen_params
      };
      controller.display().lastRequestedController(controller);
      controller.display().lastRequestedFilter(filter);
    }

    function remove_request(controller, filter) {
      var filterID = filter ? filter.id : '';

      if (requestingControllers[filterID] &&
          requestingControllers[filterID][controller.id()]) {
        delete requestingControllers[filterID][controller.id()];
      }
      controller.display().lastRequestedController(null);
      controller.display().lastRequestedFilter(null);
    }

    function check_requests(filter) {
      var filterID = filter ? filter.id : '';
      var requestingCount
            = Object.keys(requestingControllers[filterID]).length;

      if (requestingCount === 0) {
        if (activeRequests[filterID]) {
          activeRequests[filterID].abort();
          delete activeRequests[filterID];
        }
      }
      else {
        if (activeRequests[filterID]) {
          return;
        }
        else {
          var data_uri = create_uri(data_source.command(),
              filter, data_source.params(), data_source.prefix(), false);

          if (!gsa.is_defined(data[filterID])) {
            data[filterID] = {};
          }

          if (xml_data[filterID]) {
            for (var controllerID in requestingControllers[filterID]) {
              if (!requestingControllers[filterID][controllerID].active) {
                continue;
              }

              var xml_select = xml_data[filterID];
              var gen_params = requestingControllers[filterID][
                controllerID].gen_params;

              if (!gsa.is_defined(data[filterID][controllerID])) {
                if (command === 'get_aggregate') {
                  data[filterID][controllerID] = {
                    original_xml: xml_select,
                    records: extract_simple_records(xml_select,
                        'aggregate group'),
                    column_info: extract_column_info(xml_select, gen_params),
                    filter_info: extract_filter_info(xml_select, gen_params)
                  };
                }
                else if (command === 'get_tasks') {
                  data[filterID][controllerID] = {
                    original_xml: xml_select,
                    records: extract_task_records(xml_select),
                    column_info: tasks_column_info(),
                    filter_info: extract_filter_info(xml_select)
                  };
                }
              }

              if (!gsa.is_defined(data[filterID][controllerID])) {
                output_error(
                    requestingControllers[filterID][controllerID].controller,
                    gsa._('Internal error: Invalid request'),
                    gsa._('Invalid request command: "{{command}}"',
                      {command: command}));
              }

              requestingControllers[filterID][controllerID].active = false;
              requestingControllers[filterID][controllerID]
                .controller
                  .data_loaded(data[filterID][controllerID], gen_params);
            }
            return;
          }
          activeRequests[filterID] = d3.xml(data_uri, 'application/xml');
          activeRequests[filterID].get(
              function(error, xml) {
                var ctrls = requestingControllers[filterID];
                var controllerID;
                var omp_status;
                var omp_status_text;
                var gen_params;

                if (error) {
                  if (error instanceof XMLHttpRequest) {
                    if (error.status === 0) {
                      for (controllerID in ctrls) {
                        output_error(ctrls[controllerID].controller,
                            gsa._('Loading aborted'));
                      }
                      return;
                    }
                    else {
                      if (error.status === 401) {
                        // not authorized (anymore)
                        // reload page to show login dialog
                        window.location.reload();
                        return;
                      }
                      for (controllerID in ctrls) {
                        output_error(ctrls[controllerID].controller,
                            gsa._('HTTP error {{error}}',
                              {error: error.status}),
                            gsa._('Error: HTTP request returned status ' +
                              '{{status}} for URL: {{url}}',
                              {status: error.status, url: data_uri}));
                      }
                      return;
                    }
                  }
                  else {
                    for (controllerID in ctrls) {
                      output_error(ctrls[controllerID].controller,
                          gsa._('Error reading XML'),
                          gsa._('Error reading XML from URL {{url}}: {{error}}',
                            {url: data_uri, error: error}));
                    }
                    return;
                  }
                }
                else {
                  var xml_select = d3.select(xml.documentElement);
                  if (xml.documentElement.localName === 'parsererror') {
                    for (controllerID in ctrls) {
                      output_error(ctrls[controllerID].controller,
                          gsa._('Error parsing XML data'),
                          gsa._('Error parsing XML data. Details: {{details}}' +
                            {details: xml.documentElement.textContent}));
                    }
                    return;
                  }

                  if (command === 'get_aggregate') {
                    omp_status = xml_select.select(
                        'get_aggregate get_aggregates_response').attr('status');
                    omp_status_text = xml_select.select(
                        'get_aggregate get_aggregates_response')
                      .attr('status_text');

                    if (omp_status !== '200') {
                      for (controllerID in ctrls) {
                        if (!ctrls[controllerID].active) {
                          continue;
                        }
                        output_error(ctrls[controllerID].controller,
                            gsa._('Error {{omp_status}}: {{omp_status_text}}',
                              {omp_status: omp_status,
                                omp_status_text: omp_status_text}),
                            gsa._('OMP Error {{omp_status}}: ' +
                              '{{omp_status_text}}',
                              {omp_status: omp_status,
                                omp_status_text: omp_status_text}));
                      }
                      return data_source;
                    }

                    xml_data[filterID] = xml_select;

                    for (controllerID in ctrls) {
                      if (!ctrls[controllerID].active) {
                        continue;
                      }
                      gen_params = ctrls[controllerID].gen_params;
                      data[filterID][controllerID] = {
                        original_xml: xml_select,
                        records: extract_simple_records(xml_select,
                            'aggregate group'),
                        column_info: extract_column_info(xml_select,
                            gen_params),
                        filter_info: extract_filter_info(xml_select, gen_params)
                      };
                    }
                  }
                  else if (command === 'get_tasks') {
                    omp_status = xml_select.select(
                        'get_tasks get_tasks_response')
                      .attr('status');
                    omp_status_text = xml_select.select(
                        'get_tasks get_tasks_response')
                      .attr('status_text');

                    if (omp_status !== '200') {
                      for (controllerID in ctrls) {
                        if (!ctrls[controllerID].active) {
                          continue;
                        }
                        output_error(ctrls[controllerID].controller,
                            gsa._('Error {{omp_status}}: {{omp_status_text}}',
                              {omp_status: omp_status,
                                omp_status_text: omp_status_text}),
                            gsa._('OMP Error {{omp_status}}: ' +
                              '{{omp_status_text}}',
                              {omp_status: omp_status,
                                omp_status_text: omp_status_text}));
                      }
                      return data_source;
                    }

                    xml_data[filterID] = xml_select;

                    for (controllerID in ctrls) {
                      if (!ctrls[controllerID].active) {
                        continue;
                      }
                      data[filterID][controllerID] = {
                        original_xml: xml_select,
                        records: extract_task_records(xml_select),
                        column_info: tasks_column_info(),
                        filter_info: extract_filter_info(xml_select)
                      };
                    }
                  }
                  else {
                    for (controllerID in ctrls) {
                      output_error(ctrls[controllerID].controller,
                          gsa._('Internal error: Invalid request'),
                          gsa._('Invalid request command: "{{command}}',
                            {command: command}));
                    }
                    return data_source;
                  }

                  for (controllerID in ctrls) {
                    var ctrl = ctrls[controllerID];
                    if (!ctrl.active) {
                      continue;
                    }
                    gen_params = ctrl.gen_params;
                    ctrl.active = false;
                    ctrl.controller.data_loaded(
                        data[filterID][controllerID], gen_params);
                  }
                  delete activeRequests[filterID];
                }
              });
        }
      }
    }

    /* Sends an HTTP request to get XML data.
    * Once the data is loaded, the controller will be notified via the
    * data_loaded callback */
    function send_request(ctrl, filter, gen_params) {
      var lastRequestedController
        = ctrl.display().lastRequestedController();
      var lastRequestedFilter
        = ctrl.display().lastRequestedFilter();

      if (lastRequestedController) {
        lastRequestedController
          .data_src()
            .removeRequest(lastRequestedController, lastRequestedFilter);
      }
      data_source.addRequest(ctrl, filter, gen_params);

      if (lastRequestedController &&
          lastRequestedController.data_src() !== ctrl.data_src()) {
        lastRequestedController.data_src().checkRequests(lastRequestedFilter);
      }

      data_source.checkRequests(filter);

      return data_source;
    }
  }

  /*
  * Generic helper functions
  */

  /*
  * Unescapes XML entities
  */
  function unescape_xml(string) {
    if (!gsa.is_defined(gsa.parser)) {
      gsa.parser = new DOMParser();
    }

    var doc = gsa.parser.parseFromString('<doc>' + string + '</doc>',
                                        'application/xml');
    return doc.documentElement.textContent;
  }

  /*
  * Data Source Helper functions
  */

  /*
  * creates a GSA request URI from a command name, parameters array and prefix
  */
  function create_uri(command, filter, params, prefix, no_xml) {
    var params_str = prefix + 'cmd=' + encodeURIComponent(command);
    for (var prop_name in params) {
      if ((!no_xml || prop_name !== 'xml') &&
          (!gsa.is_defined(filter) ||
              (prop_name !== 'filter' && prop_name !== 'filt_id'))) {
        if (params[prop_name] instanceof Array) {
          for (var i = 0; i < params[prop_name].length; i++) {
            params_str = (params_str + '&' +
                          encodeURIComponent(prop_name) + ':' + i +
                          '=' +
                          encodeURIComponent(params[prop_name][i]));
          }
        }
        else {
          params_str = (params_str + '&' + encodeURIComponent(prop_name) +
                        '=' + encodeURIComponent(params[prop_name]));
        }
      }
    }
    if (gsa.has_value(filter) && filter.id && filter.id !== '') {
      params_str = params_str + '&filt_id=' + encodeURIComponent(filter.id);
    }
    else if (gsa.has_value(filter) && filter.term === '') {
      params_str = params_str + '&filter= ';
    }
    params_str = params_str + '&token=' + encodeURIComponent(gsa.gsa_token);
    return params_str;
  }

  /*
  * Extracts records from XML
  */
  function extract_simple_records(xml_data, selector) {
    var date_regex = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])T([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?([+-](0\d|1[0-4]):[0-5]\d|Z|)$/;
    var records = [];

    function get_date(elem) {
      return new Date(elem.text().substr(0, 19) + 'Z');
    }

    function get_float(elem) {
      return parseFloat(elem.text());
    }

    function set_record_value(record, field_name, elem) {
      if (!isNaN(get_float(elem)) && isFinite(elem.text())) {
        record[field_name] = get_float(elem);
      }
      else {
        set_text_record_value(record, field_name, elem);
      }
    }

    function set_text_record_value(record, field_name, elem) {
      if (elem.text().match(date_regex)) {
        record[field_name] = get_date(elem);
      }
      else {
        record[field_name] = elem.text();
      }
    }

    xml_data.selectAll(selector).each(function() {
      var record = {};
      d3.select(this)
        .selectAll('value, count, c_count, stats, text')
        .each(function() {
          var elem = d3.select(this);
          var in_subgroup = (this.parentNode.localName === 'subgroup');
          var subgroup_value;

          if (in_subgroup) {
            subgroup_value = d3.select(this.parentNode).select('value').text();
          }
          if (this.localName === 'stats') {
            var col_name = elem.attr('column');

            elem.selectAll('*').each(function() {
              var child = d3.select(this);
              var field_name = col_name + '_' + this.localName;

              if (in_subgroup) {
                field_name = field_name + '[' + subgroup_value + ']';
              }

              set_record_value(record, field_name, child);
            });
          }
          else if (this.localName === 'text') {
            set_text_record_value(record, elem.attr('column'), elem);
          }
          else {
            var field_name = this.localName;
            if (in_subgroup) {
              field_name = field_name + '[' + subgroup_value + ']';
            }

            set_record_value(record, field_name, elem);
          }
        });
      records.push(record);
    });
    return records;
  }

  /*
  * Extracts column info from XML
  */
  function extract_column_info(xml_data, gen_params) {
    var column_info = {
      group_columns: [],
      subgroup_columns: [],
      data_columns: [],
      text_columns: [],
      columns: {},
      subgroups: [],
    };

    xml_data.selectAll('aggregate subgroups value').each(function() {
      column_info.subgroups.push(d3.select(this).text());
    });

    xml_data.selectAll(
        'aggregate column_info aggregate_column').each(function() {
      var column = {};
      d3.select(this)
        .selectAll('*')
        .each(function() {
          if (!isNaN(parseFloat(d3.select(this).text())) &&
              isFinite(d3.select(this).text())) {
            column[this.localName] =
              parseFloat(d3.select(this).text());
          }
          else {
            column[this.localName] =
              d3.select(this).text();
          }
        });
      column_info.columns[column.name] = column;
      for (var i = 0; i < column_info.subgroups.length; i++) {
        // Create copies of columns for subgroups
        if (column.name !== 'value' && column.name !== 'subgroup_value') {
          var column_copy = {};
          var copy_name = column.name + '[' + column_info.subgroups[i] + ']';
          for (var prop in column) {
            column_copy[prop] = column[prop];
          }
          column_copy.name = copy_name;
          column_copy.subgroup_value = column_info.subgroups[i];
          column_info.columns[copy_name] = column_copy;
        }
      }
    });

    for (var i = 0; i < column_info.subgroups.length; i++) {
      // Create copies of subgroup_value column for individual subgroups
      var column_copy = {};
      var copy_name = 'value[' + column_info.subgroups[i] + ']';
      for (var prop in column_info.columns.subgroup_value) {
        column_copy[prop] = column_info.columns.subgroup_value[prop];
      }
      column_copy.name = copy_name;
      column_copy.subgroup_value = column_info.subgroups[i];
      column_info.columns[copy_name] = column_copy;
    }

    xml_data.selectAll('aggregate group_column').each(function() {
      column_info.group_columns.push(d3.select(this).text());
    });

    xml_data.selectAll('aggregate subgroup_column').each(function() {
      column_info.group_columns.push(d3.select(this).text());
    });

    xml_data.selectAll('aggregate data_column').each(function() {
      column_info.data_columns.push(d3.select(this).text());
    });

    xml_data.selectAll('aggregate text_column').each(function() {
      column_info.text_columns.push(d3.select(this).text());
    });

    if (gen_params) {
      var add_missing_column = function(field) {
        if (gsa.is_defined(column_info.columns[field])) {
          return;
        }

        if (field.indexOf('[') !== -1 && field.lastIndexOf(']') !== -1) {
          var base = field.substr(0, field.indexOf('['));
          var subgroup = field.substr(field.indexOf('[') + 1,
              field.lastIndexOf(']') - field.indexOf('[') - 1);
          var base_column = column_info.columns[base];

          if (gsa.is_defined(base_column)) {
            var column_copy = {};
            var copy_name = base + '[' + subgroup + ']';
            for (var prop in base_column) {
              column_copy[prop] = base_column[prop];
            }
            column_copy.name = copy_name;
            column_copy.subgroup_value = subgroup;
            column_info.columns[copy_name] = column_copy;
          }
          else {
            console.warn('Could not find base column info "' + base +
                '" for "' + field + '"');
          }
        }
      };

      var index;
      var field;

      if (gen_params.y_fields) {
        for (index = 0; index < gen_params.y_fields.length; index++) {
          field = gen_params.y_fields[index];
          if (!gsa.is_defined(column_info.columns[field])) {
            add_missing_column(field);
          }
        }
      }

      if (gen_params.z_fields) {
        for (index = 0; index < gen_params.z_fields.length; index++) {
          field = gen_params.z_fields[index];
          if (!gsa.is_defined(column_info.columns[field])) {
            add_missing_column(field);
          }
        }
      }

    }
    return column_info;
  }

  /*
  * Gets column info for get_tasks
  */
  function tasks_column_info() {
    return {
      columns: {
        id: {
          name: 'id',
          stat: 'value',
          type: 'task',
          column: 'id',
          data_type: 'uuid'
        },
        name: {
          name: 'name',
          stat: 'value',
          type: 'task',
          column: 'name',
          data_type: 'text'
        },
        schedule_id: {
          name: 'schedule_id',
          stat: 'value',
          type: 'task',
          column: 'schedule_id',
          data_type: 'uuid'
        },
        schedule_name: {
          name: 'schedule_name',
          stat: 'value',
          type: 'task',
          column: 'schedule_name',
          data_type: 'text'
        },
        schedule_next_time: {
          name: 'schedule_next_time',
          stat: 'value',
          type: 'task',
          column: 'schedule_next_time',
          data_type: 'iso_time'
        },
        schedule_trash: {
          name: 'schedule_trash',
          stat: 'value',
          type: 'task',
          column: 'schedule_trash',
          data_type: 'integer'
        },
        schedule_first_time: {
          name: 'schedule_first_time',
          stat: 'value',
          type: 'task',
          column: 'schedule_first_time',
          data_type: 'iso_time'
        },
        schedule_period: {
          name: 'schedule_period',
          stat: 'value',
          type: 'task',
          column: 'schedule_period',
          data_type: 'integer'
        },
        schedule_period_months: {
          name: 'schedule_period_months',
          stat: 'value',
          type: 'task',
          column: 'schedule_period_months',
          data_type: 'integer'
        },
        schedule_duration: {
          name: 'schedule_duration',
          stat: 'value',
          type: 'task',
          column: 'schedule_duration',
          data_type: 'integer'
        },
        schedule_periods: {
          name: 'schedule_periods',
          stat: 'value',
          type: 'task',
          column: 'schedule_periods',
          data_type: 'integer'
        }
      }
    };
  }

  /*
  * Extracts filter info from XML
  */
  function extract_filter_info(xml_data) {
    var filter_info = {};
    var keyword_elems;

    filter_info.id =  xml_data.selectAll('filters').attr('id');
    filter_info.term =  xml_data.selectAll('filters term').text();

    if (!xml_data.selectAll('filters name').empty()) {
      filter_info.name = xml_data.selectAll('filters name').text();
    }
    else {
      filter_info.name = '';
    }

    filter_info.keywords = [];
    filter_info.criteria_str = '';
    filter_info.extra_options_str = '';
    filter_info.criteria = [];
    filter_info.extra_options = [];

    keyword_elems = xml_data.selectAll('filters keywords keyword');
    keyword_elems.each(function() {
      var elem = d3.select(this);
      var column = elem.select('column').text();
      var current_keyword = {
        column: column,
        relation: elem.select('relation').text(),
        value: elem.select('value').text(),
      };

      // Create term split into criteria and extra options
      if (current_keyword.column === '') {
        // boolean operators and search phrase
        if (filter_info.criteria.length) {
          filter_info.criteria_str += ' ';
        }
        filter_info.criteria.push(current_keyword);
        if (current_keyword.relation === '=') {
          filter_info.criteria_str += '=' + current_keyword.value;
        } else {
          filter_info.criteria_str += current_keyword.value;
        }
      } else if (current_keyword.column === 'apply_overrides' ||
          current_keyword.column === 'autofp' ||
          current_keyword.column === 'rows' ||
          current_keyword.column === 'first' ||
          current_keyword.column === 'sort' ||
          current_keyword.column === 'sort-reverse' ||
          current_keyword.column === 'notes' ||
          current_keyword.column === 'overrides' ||
          current_keyword.column === 'timezone' ||
          current_keyword.column === 'result_hosts_only' ||
          current_keyword.column === 'levels' ||
          current_keyword.column === 'min_qod' ||
          current_keyword.column === 'delta_states') {
        // special options
        if (filter_info.extra_options.length !== '') {
          filter_info.extra_options_str += ' ';
        }
        filter_info.extra_options.push(current_keyword);
        filter_info.extra_options_str += current_keyword.column +
          current_keyword.relation + current_keyword.value;
      } else {
        // normal column criteria
        if (filter_info.criteria.length) {
          filter_info.criteria_str += ' ';
        }
        filter_info.criteria.push(current_keyword);
        filter_info.criteria_str += current_keyword.column +
          current_keyword.relation + current_keyword.value;
      }
    });

    return filter_info;
  }

  /*
  * Extracts records from XML
  */
  function extract_task_records(xml_data) {
    var records = [];
    xml_data.selectAll('task').each(function() {
      var task = d3.select(this);
      var schedule = task.select('schedule');
      var periods = task.select('schedule_periods');

      var record = {
        id: task.attr('id'),
        name: task.select('name').text()
      };
      record.schedule_id = schedule.attr('id');
      schedule.selectAll('*')
        .each(function() {
          record['schedule_' + this.localName] =
            this.textContent;
        });

      if (periods.node()) {
        record.schedule_periods = periods.text();
      }

      records.push(record);
    });

    return records;
  }

  /*
  * Helpers for processing extracted data
  */

  /*
  * Gets capitalized resource and attribute names
  */
  function capitalize(str) {
    switch (str.toLowerCase()) {
      case 'nvt':
      case 'cve':
      case 'cpe':
        return str.toUpperCase();
      default:
        var split_str = str.split('_');
        for (var i in split_str) {
          split_str[i] = split_str[i].charAt(0).toUpperCase() +
            split_str[i].slice(1);
        }
        return split_str.join(' ');
    }
  }

  /*
   * Gets the severity level name for a numeric cvss value.
   *
   * @param {number}  value The numeric value to convert.
   *
   * @return {string} The severity level name.
   */
  function severity_level(value) {
    if (value >= gsa.severity_levels.min_high) {
      return gsa._('High');
    }
    else if (value >= gsa.severity_levels.min_medium) {
      return gsa._('Medium');
    }
    else if (value >= gsa.severity_levels.min_low) {
      return gsa._('Low');
    }
    else if (value >= 0.0) {
      return gsa._('Log');
    }
    else if (value === -1.0) {
      return gsa._('False Positive');
    }
    else if (value === -2.0) {
      return gsa._('Debug');
    }
    else if (value === -3.0) {
      return gsa._('Error');
    }
    else {
      return gsa._('N/A');
    }
  }

  /*
  * Gets the full name of a resource type.
  */
  function resource_type_name(type) {
    switch (type.toLowerCase()) {
      case 'os':
        return gsa._('Operating System');
      case 'ovaldef':
        return gsa._('OVAL definition');
      case 'cert_bund_adv':
        return gsa._('CERT-Bund Advisory');
      case 'dfn_cert_adv':
        return gsa._('DFN-CERT Advisory');
      case 'allinfo':
        return gsa._('SecInfo Item');
      default:
        return capitalize(type);
    }
  }

  /*
  * Gets the plural form of the full name of a resource type.
  */
  function resource_type_name_plural(type) {
    switch (type.toLowerCase()) {
      case 'dfn_cert_adv':
        return gsa._('DFN-CERT Advisories');
      case 'cert_bund_adv':
        return gsa._('CERT-Bund Advisories');
      default:
        return resource_type_name(type) + 's';
    }
  }

  /*
  * Gets the Filter type name of a resource type.
  */
  function filter_type_name(type) {
    switch (type.toLowerCase()) {
      case 'asset':
      case 'os':
      case 'host':
        return 'Asset';
      case 'info':
      case 'nvt':
      case 'cve':
      case 'cpe':
      case 'ovaldef':
      case 'cert_bund_adv':
      case 'dfn_cert_adv':
      case 'allinfo':
        return 'SecInfo';
      default:
        return capitalize(type);
    }
  }

  /*
  * Gets the full form of an aggregate field.
  */
  function field_name(field, type) {
    switch (field.toLowerCase()) {
      case 'c_count':
        return gsa._('total {{resource_type_plural}}',
            {
              resource_type_plural: resource_type_name_plural(type),
              interpolation: {escape: false},
            });
      case 'count':
        return resource_type_name_plural(type);
      case 'created':
        return gsa._('creation time');
      case 'modified':
        return gsa._('modification time');
      case 'qod':
        return gsa._('QoD');
      case 'qod_type':
        return gsa._('QoD type');
      case 'high':
        return gsa._('High');
      case 'high_per_host':
        return gsa._('High / host');
      default:
        if (gsa.is_string(field)) {
          return field.replace('_', ' ');
        }
        return field;
    }
  }

  /*
  * Generates a label from a column info object.
  */
  function column_label(info, capitalize_label, include_type, include_stat) {
    if (info.label_generator) {
      return info.label_generator(info, capitalize_label,
                                  include_type, include_stat);
    }
    else {
      return default_column_label(info, capitalize_label,
                                  include_type, include_stat);
    }
  }

  /*
  * Generates a label in the default format from a column info object.
  */
  function default_column_label(info, capitalize_label,
                                include_type, include_stat) {
    var label = '';
    if (include_stat) {
      switch (info.stat) {
        case 'min':
          label = label + 'min. ';
          break;
        case 'max':
          label = label + 'max. ';
          break;
        case 'mean':
          label = label + 'average ';
          break;
        case 'sum':
          label = label + 'summed ';
          break;
      }
    }

    label = label + field_name(info.column ? info.column : info.stat,
                                info.type);

    if (include_type && info.stat !== 'count' && info.stat !== 'c_count') {
      label = label + ' (' + resource_type_name(info.type) + ')';
    }
    if (capitalize_label) {
      label = capitalize(label);
    }

    if (gsa.is_defined(info.subgroup_value) && info.subgroup_value !== '') {
      label += ' (' + info.subgroup_value + ')';
    }

    return label;
  }

  /**
  * Generates a string representation of a data value using the column info.
  */
  function format_data(value, col_info_item) {
    if (col_info_item && col_info_item.data_formatter) {
      col_info_item.data_formatter(value, col_info_item);
    }
    else {
      return format_data_default(value, col_info_item);
    }
  }

  /**
  * Generates a default string representation of a data value using column info.
  */
  function format_data_default(value, col_info_item) {
    if (!gsa.has_value(value)) {
      return value;
    }

    if (col_info_item) {
      switch (col_info_item.data_type) {
        case 'js_date':
          return gsa.date_format(value);
        case 'js_datetime':
          return gsa.datetime_format(value);
        case 'unix_time':
          return gsa.datetime_format(new Date(value * 1000));
        case 'cvss':
          return value.toFixed(1);
        case 'decimal':
          return value.toFixed(3).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,
              '$1');
        default:
          return String(value);
      }
    }
    else {
      return String(value);
    }
  }

  /*
  * Record set transformation functions
  */

  /*
  * Dummy function returning the raw data
  */
  function data_raw(data) {
    return data;
  }

  /*
  * Transform data into a severity histogram
  */
  function data_severity_histogram(old_data, params) {
    var bins = ['N/A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    var bins_long = ['N/A', '0.0', '0.1 - 1.0', '1.1 - 2.0', '2.1 - 3.0',
                    '3.1 - 4.0', '4.1 - 5.0', '5.1 - 6.0', '6.1 - 7.0',
                    '7.1 - 8.0', '8.1 - 9.0', '9.1 - 10.0'];
    var severity_field = 'value';
    var count_field = 'count';

    if (params) {
      if (params.severity_field) {
        severity_field = params.severity_field;
      }
      if (params.count_field) {
        count_field = params.count_field;
      }
    }

    var column_info = {
      group_columns: [severity_field],
      data_columns: [count_field],
      columns: {}
    };

    var bin_func = function(val) {
      if (val !== '' && Number(val) <= 0.0) {
        return 1;
      }
      else if (Number(val) >= 10.0) {
        return 11;
      }
      else if (Number(val) > 0.0) {
        return Math.ceil(Number(val)) + 1;
      }
      else {
        return 0;
      }
    };

    var records = bins.map(function(d) {
      var record = {};
      record [severity_field] = d;
      record [count_field] = 0;
      return record;
    });

    column_info.columns[severity_field] =
      {
          name: severity_field,
          type: old_data.column_info.columns[severity_field].type,
          column: old_data.column_info.columns [severity_field].column,
          stat: old_data.column_info.columns[severity_field].stat,
          data_type: 'text'
        };

    column_info.columns[count_field] =
      {
          name: count_field,
          type: old_data.column_info.columns [count_field].type,
          column: '',
          stat: 'count',
          data_type: 'integer'
        };

    var i;
    for (i in old_data.records) {
      records[bin_func(old_data.records[i][severity_field])][count_field] =
        Number(records[
            bin_func(old_data.records[i][severity_field])
        ][count_field]) + Number(old_data.records[i][count_field]);
    }

    for (i in records) {
      records[i][severity_field + '~long'] = bins_long[i];
    }

    var data = {
      original_xml: old_data.original_xml,
      records: records,
      column_info: column_info,
      filter_info: old_data.filter_info
    };

    return data;
  }

  /*
  * Gets the counts of severity levels from records containing the counts
  * the counts for each numeric CVSS score.
  */
  function data_severity_level_counts(old_data, params) {
    var bins = ['N/A', 'Log', 'Low', 'Medium', 'High'];
    var bins_long = ['N/A',
                    'Log (0.0 - ' +
                    gsa.severity_levels.max_log.toFixed(1) + ')',
                    'Low (' +
                    gsa.severity_levels.min_low.toFixed(1) +
                    ' - ' + gsa.severity_levels.max_low.toFixed(1) + ')',
                    'Medium (' +
                    gsa.severity_levels.min_medium.toFixed(1) +
                    ' - ' + gsa.severity_levels.max_medium.toFixed(1) + ')',
                    'High (' +
                    gsa.severity_levels.min_high.toFixed(1) +
                    ' - ' + gsa.severity_levels.max_high.toFixed(1) + ')'];
    var severity_field = 'value';
    var count_field = 'count';
    var ascending = false;

    if (params) {
      if (params.severity_field) {
        severity_field = params.severity_field;
      }
      if (params.count_field) {
        count_field = params.count_field;
      }
      if (gsa.is_defined(params.ascending)) {
        ascending = params.ascending;
      }
    }

    var records = bins.map(function(d) {
      var record = {};
      record[severity_field] = d;
      record[count_field] = 0;
      return record;
    });

    var column_info = {
      group_columns: [severity_field],
      data_columns: [count_field],
      columns: {}
    };

    column_info.columns[severity_field] = {
      name: severity_field,
      type: old_data.column_info.columns[severity_field].type,
      column: old_data.column_info.columns[severity_field].column,
      stat: old_data.column_info.columns[severity_field].stat,
      data_type: 'text'
    };

    column_info.columns[count_field] = {
      name: count_field,
      type: old_data.column_info.columns[count_field].type,
      column: '',
      stat: 'count',
      data_type: 'integer'
    };

    var i;
    for (i in old_data.records) {
      var val = old_data.records[i][severity_field];
      var count = old_data.records[i][count_field];

      if (val !== '' && Number(val) <= gsa.severity_levels.max_log) {
        records[1][count_field] += count;
      }
      else if (Number(val) >= gsa.severity_levels.min_low &&
          Number(val) <= gsa.severity_levels.max_low) {
        records[2][count_field] += count;
      }
      else if (Number(val) >= gsa.severity_levels.min_medium &&
          Number(val) <= gsa.severity_levels.max_medium) {
        records[3][count_field] += count;
      }
      else if (Number(val) >= gsa.severity_levels.min_high) {
        records[4][count_field] += count;
      }
      else {
        records[0][count_field] += count;
      }
    }

    for (i in records) {
      records[i][severity_field + '~long'] = bins_long [i];
    }

    if (gsa.severity_levels.min_high === gsa.severity_levels.max_medium) {
      delete records[4];
    }
    if (gsa.severity_levels.min_medium === gsa.severity_levels.max_low) {
      delete records[3];
    }
    if (gsa.severity_levels.min_low === gsa.severity_levels.max_log) {
      delete records[2];
    }

    for (i in records) {
      if (records[i][count_field] === 0) {
        delete records[i];
      }
    }

    var data = {
      original_xml: old_data.original_xml,
      records: ascending ? records : records.reverse(),
      column_info: column_info,
      filter_info: old_data.filter_info
    };

    return data;
  }

  /**
  * Get counts by resource type, using the full type name for the x field.
  */
  function resource_type_counts(old_data, params) {
    var new_column_info = {
      group_columns: old_data.column_info.group_columns,
      data_columns: old_data.column_info.data_columns,
      text_columns: old_data.column_info.text_columns,
      columns: {}
    };
    for (var col in old_data.column_info.columns) {
      new_column_info.columns[col] = old_data.column_info.columns[col];
    }

    var new_data = {
      original_xml: old_data.original_xml,
      records: [],
      column_info: new_column_info,
      filter_info: old_data.filter_info
    };

    var type_field = 'value';
    if (params) {
      if (params.type_field) {
        type_field = params.type_field;
      }
    }

    if (gsa.is_defined(
          old_data.column_info.columns[type_field + '~original'])) {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field + '~original'];
    } else {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field];
    }

    for (var record in old_data.records) {
      var new_record = {};
      for (var field in old_data.records[record]) {
        if (field === type_field) {
          if (gsa.is_defined(new_record[field + '~original'])) {
            new_record[field + '~original'] =
              old_data.records[record][field + '~original'];
          } else {
            new_record[field + '~original'] = old_data.records[record][field];
          }
          new_record[field] = resource_type_name_plural(
              old_data.records[record][field]);
        }
        else {
          new_record[field] = old_data.records[record][field];
        }
      }
      new_data.records.push(new_record);
    }
    return new_data;
  }

  /**
  * Get counts by qod type, using the full type name for the x field.
  */
  function qod_type_counts(old_data, params) {
    var new_column_info = {
      group_columns: old_data.column_info.group_columns,
      data_columns: old_data.column_info.data_columns,
      text_columns: old_data.column_info.text_columns,
      columns: {}
    };
    for (var col in old_data.column_info.columns) {
      new_column_info.columns[col] = old_data.column_info.columns[col];
    }

    var new_data = {
      original_xml: old_data.original_xml,
      records: [],
      column_info: new_column_info,
      filter_info: old_data.filter_info
    };

    var type_field = 'value';
    if (params) {
      if (params.type_field) {
        type_field = params.type_field;
      }
    }

    if (gsa.is_defined(
          old_data.column_info.columns[type_field + '~original'])) {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field + '~original'];
    } else {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field];
    }

    for (var record in old_data.records) {
      var new_record = {};
      for (var field in old_data.records[record]) {
        if (field === type_field) {
          if (gsa.is_defined(new_record[field + '~original'])) {
            new_record[field + '~original'] =
              old_data.records[record][field + '~original'];
          } else {
            new_record[field + '~original'] = old_data.records[record][field];
          }
          switch (old_data.records[record][field]) {
            case (''):
              new_record[field] = gsa._('None');
              break;
            case ('exploit'):
              new_record[field] = gsa._('Exploit');
              break;
            case ('remote_vul'):
              new_record[field] = gsa._('Remote vulnerability');
              break;
            case ('package'):
              new_record[field] = gsa._('Package check');
              break;
            case ('registry'):
              new_record[field] = gsa._('Registry check');
              break;
            case ('executable_version'):
              new_record[field] = gsa._('Executable version');
              break;
            case ('remote_analysis'):
              new_record[field] = gsa._('Remote analysis');
              break;
            case ('remote_probe'):
              new_record[field] = gsa._('Remote probe');
              break;
            case ('remote_banner_unreliable'):
              new_record[field] = gsa._('Unreliable rem. banner');
              break;
            case ('executable_version_unreliable'):
              new_record[field] = gsa._('Unreliable exec. version');
              break;
            default:
              new_record[field] = resource_type_name(
                  old_data.records[record][field]);
          }
        }
        else {
          new_record[field] = old_data.records[record][field];
        }
      }
      new_data.records.push(new_record);
    }

    var sort_func = function(a, b) {
      return b.count - a.count;
    };

    new_data.records.sort(sort_func);
    return new_data;
  }

  /**
  * Get counts by qod type, using the full type name for the x field.
  */
  function percentage_counts(old_data, params) {
    var new_column_info = {
      group_columns: old_data.column_info.group_columns,
      data_columns: old_data.column_info.data_columns,
      text_columns: old_data.column_info.text_columns,
      columns: {}
    };
    for (var col in old_data.column_info.columns) {
      new_column_info.columns[col] = old_data.column_info.columns[col];
    }

    var new_data = {original_xml: old_data.original_xml,
                    records: [],
                    column_info: new_column_info,
                    filter_info: old_data.filter_info};

    var type_field = 'value';
    if (params) {
      if (params.type_field) {
        type_field = params.type_field;
      }
    }

    if (gsa.is_defined(
          old_data.column_info.columns[type_field + '~original'])) {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field + '~original'];
    } else {
      new_column_info.columns[type_field + '~original'] =
        old_data.column_info.columns[type_field];
    }

    var record;
    for (record in old_data.records) {
      var new_record = {};
      for (var field in old_data.records[record]) {
        new_record[field] = old_data.records[record][field];
      }
      new_data.records.push(new_record);
    }

    var sort_func = function(a, b) {
      return b[type_field] - a[type_field];
    };
    new_data.records.sort(sort_func);

    for (record in new_data.records) {
      if (gsa.is_defined(
            old_data.column_info.columns[type_field + '~original'])) {
        new_data.records[record][type_field + '~original'] =
          new_data.records[record][type_field + '~original'];
      } else {
        new_data.records[record][type_field + '~original'] =
          new_data.records[record][type_field];
      }
      new_data.records[record][type_field] =
        new_data.records[record][type_field] + '%';
    }

    return new_data;
  }

  /**
  * Get counts by resource type, using the full type name for the x field.
  */
  function fill_empty_fields(old_data, params) {
    var new_data = {
      original_xml: old_data.original_xml,
      records: [],
      column_info: old_data.column_info,
      filter_info: old_data.filter_info
    };

    var empty_x_records = [];

    var x_field = 'value';
    if (params) {
      if (params.type_field) {
        x_field = params.type_field;
      }
    }

    var record;
    for (record in old_data.records) {
      var new_record = {};
      var empty_x = false;
      for (var field in old_data.records [record]) {
        if (old_data.records[record][field] ||
            old_data.records[record][field] === 0) {
          new_record[field] = old_data.records [record][field];
        }
        else if (field.lastIndexOf('~original') !== (field.length - 9)) {
          switch (old_data.column_info.columns[field].data_type) {
            case 'integer':
            case 'decimal':
            case 'cvss':
            case 'unix_time':
              new_record[field] = 0;
              break;
            case 'js_time':
              new_record[field] = new Date(0);
              break;
            default:
              new_record[field] = 'N/A';
          }

          new_record[field + '~original'] = '';

          if (field === x_field) {
            empty_x = true;
          }
        }
        else {
          new_record[field] = '';
        }
      }

      if (empty_x) {
        empty_x_records.push(new_record);
      }
      else {
        new_data.records.push(new_record);
      }
    }

    for (record in empty_x_records) {
      new_data.records.push(empty_x_records[record]);
    }

    return new_data;
  }

  /*
   * In-chart link generator functions
   */

  /**
   * @summary Helper function to get the type as used in cmd=get_[...].
   *
   * @param {string}  type         Resource type or subtype
   *
   * @return {string} The resource type as used in cmd=get_[...].
   */
  function cmd_type(type) {
    var get_type;
    if (type === 'host' || type === 'os') {
      get_type = 'asset';
    }
    else if (type === 'allinfo' || type === 'nvt' || type === 'cve' ||
        type === 'cpe' || type === 'ovaldef' || type === 'cert_bund_adv' ||
        type === 'dfn_cert_adv') {
      get_type = 'info';
    }
    else {
      get_type = type;
    }
    return get_type;
  }

  /**
   * @summary Generates a filtered list page URL
   *
   * @param {string}  type         Resource type or subtype
   * @param {string}  column       Column name
   * @param {string}  value        Column value
   * @param {Object}  filter_info  filter_info from generator
   * @param {string}  relation     The relation to use
   *
   * @return {string} The page URL.
   */
  function filtered_list_url(type, column, value, filter_info, relation) {
    var result = '/omp?';
    var get_type;
    var get_type_plural;

    if (!gsa.is_defined(relation)) {
      relation = '=';
    }

    // Get "real" type and plural
    get_type = cmd_type(type);

    if (get_type === 'info') {
      get_type_plural = get_type;
    }
    else {
      get_type_plural = get_type + 's';
    }

    // Add command and (if needed) subtype
    result += ('cmd=get_' + get_type_plural);

    if (get_type !== type) {
      result += ('&' + get_type + '_type=' + type);
    }

    // Add existing extra options from filter
    result += '&filter=' + filter_info.extra_options_str + ' ';

    // Create new column filter keyword(s)
    var criteria_addition = '';
    if (relation === '=') {
      if (column.indexOf('severity') !== -1) {
        switch (value) {
          case ('High'):
            criteria_addition += column + '>' + gsa.severity_levels.max_medium;
            break;
          case ('Medium'):
            criteria_addition += column + '>' + gsa.severity_levels.max_low +
            ' and ' + column + '<' + gsa.severity_levels.min_high;
            break;
          case ('Low'):
            criteria_addition += column + '>' + gsa.severity_levels.max_log +
            ' and ' + column + '<' + gsa.severity_levels.min_medium;
            break;
          case ('Log'):
            if (gsa.severity_levels.max_log === 0.0) {
              criteria_addition += column + '=0';
            }
            else {
              criteria_addition += column + '>-1 and ' + column + '<' +
                gsa.severity_levels.min_low;
            }
            break;
          case (''):
          case ('N/A'):
            criteria_addition += column + '=""';
            break;
          case ('0'):
            criteria_addition += column + '=0';
            break;
          default:
            var severity = parseFloat(value);
            if (severity.isNaN) {
              criteria_addition += column + '=' + value;
            } else if (severity >= 10.0) {
              criteria_addition += column + 'severity>9.0';
            } else {
              criteria_addition += column + '>' + (severity - 1.0).toFixed(1) +
                ' and severity<' + (severity + 0.1).toFixed(1);
            }
        }
      }
      else {
        criteria_addition += column + '="' + value + '"';
      }
    } else if (relation === 'range') {
      criteria_addition = (column + '>' + value[0] +
          ' and ' + column + '<' + value[1]);
    } else {
      criteria_addition += column + relation + '"' + value + '"';
    }

    // Add other criteria
    var new_criteria = '';
    for (var i in filter_info.criteria) {
      var current_keyword = filter_info.criteria[i];
      if (i > 0) {
        new_criteria += ' ';
      }

      if (current_keyword.column === '') {
        if (current_keyword.relation === '=') {
          new_criteria += '=' + current_keyword.value;
        } else {
          new_criteria += current_keyword.value;
        }
      } else {
        new_criteria += current_keyword.column + current_keyword.relation +
          current_keyword.value;
      }

      if (current_keyword.value !== 'and' && current_keyword.value !== 'or' &&
          current_keyword.value !== 'not' &&
          // last keyword was not an "and" operator
          (i <= 0 || filter_info.criteria[i - 1].value !== 'and' ||
           filter_info.criteria[i - 1].column !== '')) {
        new_criteria += ' and ' + criteria_addition;
      }
    }
    if (gsa.is_defined(filter_info.criteria) &&
        filter_info.criteria.length === 0) {
      new_criteria = criteria_addition;
    }

    result += new_criteria;

    // Add token
    result += '&token=' + gsa.gsa_token;

    return result;
  }

  /**
   * @summary Generates a details page URL
   *
   * @param {string}  type         Resource type or subtype
   * @param {string}  id           id of the resource to get
   * @param {Object}  filter_info  filter_info from generator
   * @param {string}  relation     The relation to use
   *
   * @return {string} the page URL
   */
  function details_page_url(type, id, filter_info) {
    var result = '/omp?';
    var get_type = cmd_type(type);

    // Add command and (if needed) subtype
    result += ('cmd=get_' + get_type);

    if (get_type !== type) {
      result += ('&' + get_type + '_type=' + type);
    }

    // Add resource id
    result += ('&' + get_type + '_id=' + id);

    // Add filter
    result += ('&filter=' + filter_info.term);
    result += ('&filt_id=' + filter_info.id);

    // Add token
    result += ('&token=' + gsa.gsa_token);

    return result;
  }

  /*
  * Generic display helper functions
  */

  /*
  * Prints an error to the console and shows it on the display of a chart.
  */
  function output_error(controller, display_message, console_message,
      console_extra) {
    if (gsa.is_defined(console_message)) {
      console.error(console_message);
    }
    if (gsa.is_defined(console_extra)) {
      console.debug(console_extra);
    }

    controller.showError(display_message);
  }

  /*
  * Opens a popup window for a detached chart
  */
  function open_detached(url) {
    var new_window = window.open(url, '', 'width=460, height=340');
    new_window.fit_window = true;
    return false;
  }

  /*
  * Resizes a chart display to fill the whole window
  */
  function detached_chart_resize_listener(dashboard) {
    return function() {
      var window_height = window.innerHeight;
      $(dashboard.elem())
          .height(window_height - (Number(d3.select('.gsa-footer')
                                            .property('clientHeight')) +
                                    Number(d3.select('#applied_filter')
                                                .property('clientHeight')) +
                                    20));
      dashboard.resized(true);
    };
  }

  /*
  * Wrap SVG text at a given width
  */
  function wrap_text(text_selection, width) {
    text_selection.each(function() {
      var text = d3.select(this);
      var words = text.text()
                        .match(/[^\s-]+[\s-]*/g)
                          .reverse();
      var line = [];
      var line_number = 0;
      var line_height = 1.2; //em
      var x = text.attr('x');
      var y = text.attr('y');
      var tspan = text.text(null)
                      .append('tspan')
                        .attr('x', x)
                        .attr('y', y);
      var word;
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(''));
        if (tspan.node().getComputedTextLength() > width) {
          if (line.length > 1) {
            line.pop();
            tspan.text(line.join(''));
            line = [word];
          }
          else {
            tspan.text(line.join(''));
            line.pop();
          }

          tspan = text.append('tspan')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('dy', ++line_number * line_height + 'em')
                        .text(line.join(''));
        }
      }
    });
  }

  /*
  * Generic chart title generators
  */

  /*
  * Returns a static title
  */
  function title_static(loading_text, loaded_text) {
    return function(data) {
      if (!gsa.is_defined(data)) {
        return loading_text;
      }
      else {
        return loaded_text;
      }
    };
  }

  /*
  * Returns a title containing the total count of the resources.
  */
  function title_total(title, count_field) {
    return function(data) {
      var filter_text = '';

      if (data && data.filter_info && data.filter_info.name !== '') {
        filter_text = ': ' + data.filter_info.name;
      }

      if (!gsa.is_defined(data)) {
        return gsa._('{{title}} (Loading...)', {title: title});
      }

      var total = 0;
      for (var i = 0; i < data.records.length; i++) {
        total = Number(total) + Number(data.records[i][count_field]);
      }
      return gsa._('{{title}} {{filter_text}} (Total: {{count}})',
          {title: title, filter_text: filter_text, count: '' + total});
    };
  }

  /*
  * Data export helpers
  */

  /*
  * Generate CSV data from simple records
  */
  function csv_from_records(records, column_info, columns, headers,
      title) {
    var csv_data = '';

    if (gsa.is_defined(title)) {
      csv_data += (title + '\r\n');
    }

    var col_i;
    if (gsa.is_defined(headers)) {
      for (col_i in headers) {
        csv_data += '"' + String(headers[col_i]).replace('"', '""') + '"';
        if (col_i < columns.length - 1) {
          csv_data += ',';
        }
      }
      csv_data += '\r\n';
    }

    for (var row in records) {
      for (col_i in columns) {
        var col = columns [col_i];
        var record = records[row][col];
        if (gsa.has_value(record)) {
          csv_data += '"' + format_data(record, column_info.columns[col])
            .replace('"', '""') + '"';
        }
        else {
          csv_data += '""';
        }

        if (col_i < columns.length - 1) {
          csv_data += ',';
        }
      }
      csv_data += '\r\n';
    }

    return csv_data;
  }

  /*
  * Generate HTML table from simple records
  */
  function html_table_from_records(records, column_info, columns,
      headers, title, filter) {
    var doc = document.implementation.createDocument(
        'http://www.w3.org/1999/xhtml', 'html', null);
    var head_s = d3.select(doc.documentElement).append('head');
    var body_s = d3.select(doc.documentElement).append('body');
    var table_s;
    var row_class = 'odd';

    var stylesheet;
    for (var sheet_i = 0; !gsa.is_defined(stylesheet) &&
        sheet_i < document.styleSheets.length; sheet_i++) {
      if (document.styleSheets[sheet_i].href.indexOf(
            '/gsa-style.css', document.styleSheets[sheet_i].href.length -
            '/gsa-style.css'.length) !== -1) {
        stylesheet = document.styleSheets[sheet_i];
      }
    }

    head_s.append('title')
            .text(gsa._('Greenbone Security Assistant - Chart data table'));

    head_s.append('link')
            .attr('href', stylesheet.href)
            .attr('type', 'text/css')
            .attr('rel', 'stylesheet');

    body_s.style('padding', '10px');

    table_s = body_s.append('table')
                      .attr('cellspacing', '2')
                      .attr('cellpadding', '4')
                      .attr('border', '0')
                      .attr('class', 'gbntable');

    table_s.append('tr')
            .attr('class', 'gbntablehead1')
            .append('td')
              .attr('colspan', headers.length)
              .text(title);

    var col_i;
    var tr_s;
    if (gsa.is_defined(headers)) {
      tr_s = table_s.append('tr')
                          .attr('class', 'gbntablehead2');
      for (col_i in headers) {
        tr_s.append('td')
              .text(headers[col_i]);
      }
    }

    for (var row in records) {
      tr_s = table_s.append('tr')
        .attr('class', row_class);
      for (col_i in columns) {
        var col = columns[col_i];
        tr_s.append('td')
              .text(format_data(records[row][col],
                                  column_info.columns[col]));
      }
      row_class = (row_class === 'odd') ? 'even' : 'odd';
    }

    if (filter) {
      body_s.append('p')
              .attr('class', 'footnote')
              .text(gsa._('Applied filter: {{filter}}', {filter: filter}));
    }

    return doc.documentElement.outerHTML;
  }

  /*
  * Convert SVG element to export format
  */
  function svg_from_elem(svg_elem, title) {
    var css_text = '';
    // find stylesheet
    /*
    * FIXME: Consider moving chart styles to extra CSS file to reduce SVG size.
    *        Axes are only shown correctly in programs more "dedicated" to SVG
    *         like browsers and Inkscape: Lines with ticks become black boxes
    *         elsewhere. Workaround: Save copy as "plain SVG" in Inkscape.
    */
    var stylesheet;

    var width = Number(svg_elem.attr('width'));
    var height = Number(svg_elem.attr('height'));

    for (var sheet_i = 0; !gsa.is_defined(stylesheet)  &&
        sheet_i < document.styleSheets.length; sheet_i++) {
      if (document.styleSheets[sheet_i].href.indexOf('/gsa-style.css',
            document.styleSheets[sheet_i]
            .href.length - '/gsa-style.css'.length) !== -1) {
        stylesheet = document.styleSheets[sheet_i];
      }
    }
    // get stylesheet text
    for (var i = 0; i < stylesheet.cssRules.length; i++) {
      css_text += stylesheet.cssRules[i].cssText;
    }

    var title_xml;
    if (title && title !== '') {
      title_xml = '<text x="' + (width / 2) + '" y="0"' +
                  ' text-anchor="middle"' +
                  ' style="font-weight: bold; font-size: 12px">' +
                  title +
                  '</text>';
    }
    else {
      title_xml = '';
    }

    var svg_clone = d3.select(svg_elem.node().cloneNode(true));
    svg_clone.selectAll('.remove_on_static').remove();

    var defs = svg_clone.selectAll('defs');
    if (defs.empty()) {
      defs = svg_clone.insert('defs', ':first-child');
    }

    defs.insert('style')
          .attr('type', 'text/css')
          .html(css_text);

    // create SVG
    var svg_data =  '<?xml version="1.0" encoding="UTF-8"?>' +
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" ' +
      '"http://www.w3.org/TR/SVG/DTD/svg10.dtd"> ' +
      '<svg xmlns="http://www.w3.org/2000/svg"' +
      ' viewBox="0 ' + (title !== null ? '-14' : '0') + ' ' + width + ' ' +
      height + '"' +
      ' width="' + width + '"' +
      ' height="' + (height + (title !== null ? 14 : 0)) + '">' +
      svg_clone.html() +
      title_xml +
      '</svg>';
    return svg_data;
  }

  /*
  * Shows a blob url inside an img element in a new window.
  */
  function blob_img_window(blob_url) {
    var new_window = window.open('', '_blank');

    d3.select(new_window.document)
        .select('body')
          .insert('img')
            .attr('src', blob_url);
    return;
  }

  function get_selector_label(type, chart_type, chart_template, aggregate_type,
      group_column, title_text) {

    if (title_text) {
      return title_text;
    }

    if (type === 'task') {
      return gsa._('Next scheduled tasks');
    }

    if (chart_template === 'info_by_class' ||
        chart_template === 'recent_info_by_class') {
      if (group_column === 'average_severity') {
        return gsa._('{{resource_type_plural}} by average Severity Class',
            {
              resource_type_plural: resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
      else {
        return gsa._('{{resource_type_plural}} by Severity Class',
            {
              resource_type_plural: resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
    }

    if (chart_template === 'info_by_cvss' ||
        chart_template === 'recent_info_by_cvss') {
      if (group_column === 'average_severity') {
        return gsa._('{{resource_type_plural}} by average CVSS',
            {
              resource_type_plural: resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
      else {
        return gsa._('{{resource_type_plural}} by CVSS',
            {
              resource_type_plural: resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
    }

    if (chart_type === 'cloud') {
      return gsa._('{{resource_type_plural}} {{field_name}} word cloud',
          {
            resource_type_plural: resource_type_name_plural(aggregate_type),
            field_name: field_name(group_column),
            interpolation: {escape: false}
          });
    }

    return gsa._('{{resource_type_plural}} by {{field_name}}',
        {
          resource_type_plural: resource_type_name_plural(aggregate_type),
          field_name: field_name(group_column),
          interpolation: {escape: false},
        });
  }

  function get_title_generator(type, chart_type, chart_template, aggregate_type,
      group_column, title_text) {

    if (title_text) {
      return title_static(gsa._('{{title_text}} (Loading...)',
            {title_text: title_text}), title_text);
    }

    if (type === 'task') {
      return title_static(gsa._('Next scheduled tasks (Loading...)'),
          gsa._('Next scheduled Tasks'));
    }

    if (chart_template === 'info_by_class' ||
        chart_template === 'info_by_cvss') {
      return title_total(gsa._('{{resource_type_plural}} by {{field_name}}',
            {
              resource_type_plural: resource_type_name_plural(aggregate_type),
              field_name: 'severity',
              interpolation: {escape: false},
            }), 'count');
    }

    if (chart_type === 'bubbles') {
      return title_total(gsa._('{{resource_type_plural}} by {{field_name}}',
          {
            resource_type_plural: resource_type_name_plural(aggregate_type),
            field_name: field_name(group_column),
            interpolation: {escape: false},
          }), 'size_value');
    }

    if (chart_type === 'cloud') {
      var cloud_text = gsa._(
        '{{resource_type_plural}} {{field_name}} word cloud', {
        resource_type_plural: resource_type_name_plural(aggregate_type),
        field_name: field_name(group_column),
      });
      var cloud_text_loading = gsa._(
          '{{resource_type_plural}} {{field_name}} word cloud (Loading...)',
          {
            resource_type_plural: resource_type_name_plural(aggregate_type),
            field_name: field_name(group_column),
            interpolation: {escape: false}
          });
      return title_static(cloud_text_loading, cloud_text);
    }

    return title_total(gsa._('{{resource_type_plural}} by {{field_name}}',
          {
            resource_type_plural: resource_type_name_plural(aggregate_type),
            field_name: field_name(group_column),
            interpolation: {escape: false},
          }), 'count');
  }

  function BaseChartGenerator(name) {
    this.csv_url = null;

    this.html_table_data = null;
    this.html_table_url = null;

    this.svg_url = null;
    this.svg = null;

    this.setDataTransformFunc(data_raw);
    this.setName(name);

    this.init();
  }

  BaseChartGenerator.prototype.init = function() {
  };

  BaseChartGenerator.prototype.getName = function() {
    return this.name;
  };

  BaseChartGenerator.prototype.setName = function(value) {
    this.name = value;
    return this;
  };

  BaseChartGenerator.prototype.getTitle = function(data) {
    return this.title_generator(data);
  };

  BaseChartGenerator.prototype.setTitleGenerator = function(value) {
    this.title_generator = value;
    return this;
  };

  BaseChartGenerator.prototype.mustUpdate = function(display) {
    return display.last_generator() !== this;
  };

  BaseChartGenerator.prototype.setDataTransformFunc = function(value) {
    this.data_transform_func = value;
    return this;
  };

  BaseChartGenerator.prototype.transformData = function(original_data,
      gen_params) {
    return this.data_transform_func(original_data, gen_params);
  };

  BaseChartGenerator.prototype.generate = function(display, data) {
  };

  BaseChartGenerator.prototype.generateData = function(controller,
      original_data, gen_params) {
    return null;
  };

  BaseChartGenerator.prototype.generateCsvData = function(controller, data) {
    return null;
  };

  BaseChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    return null;
  };

  BaseChartGenerator.prototype.addMenuItems = function(controller, data) {
    this.addDetachedChartMenuItem(controller);

    // Generate CSV
    var csv_data = this.generateCsvData(controller, data);
    this.addCsvDownloadMenuItem(controller, csv_data);
    this.addHtmlTableMenuItem(controller);

    // Generate HTML table
    var html_table_data = this.generateHtmlTableData(controller, data);
    this.addHtmlTableMenuItem(controller, html_table_data);

    this.addSvgMenuItems(controller);
    return this;
  };

  BaseChartGenerator.prototype.addDetachedChartMenuItem = function(controller) {
    // Create detach menu item
    controller.display().create_or_get_menu_item('detach')
      .attr('href', 'javascript:void(0);')
      .on('click', function() {
        open_detached(controller.detached_url());
      })
      .text(gsa._('Show detached chart window'));
    return this;
  };

  BaseChartGenerator.prototype.addCsvDownloadMenuItem = function(controller,
      csv_data) {
    if (this.csv_url !== null) {
      URL.revokeObjectURL(this.csv_url);
    }

    var csv_blob = new Blob([csv_data], {type: 'text/csv'});
    this.csv_url = URL.createObjectURL(csv_blob);

    controller.display().create_or_get_menu_item('csv_dl')
      .attr('href', this.csv_url)
      .attr('download', 'gsa_' + this.getName() + '_chart-' +
          new Date().getTime() + '.csv')
      .text(gsa._('Download CSV'));
    return this;
  };

  BaseChartGenerator.prototype.addHtmlTableMenuItem = function(controller,
      html_table_data) {
    var self = this;

    if (this.html_table_url !== null) {
      URL.revokeObjectURL(this.html_table_url);
      this.html_table_url = null;
    }

    var html_table_blob = new Blob([html_table_data],
        {type: 'text/html'});
    this.html_table_url = URL.createObjectURL(html_table_blob);

    controller.display().create_or_get_menu_item('html_table')
      .attr('href', '#')
      .on('click', function() {
        window.open(self.html_table_url);
        return true;
      })
      .text(gsa._('Show HTML table'));
    return this;
  };

  BaseChartGenerator.prototype.addSvgMenuItems = function(controller) {
    var self = this;
    var display = controller.display();

    function create_svg_url() {
      var svg_data = svg_from_elem(display.svg(), display.header().text());

      if (self.svg_url !== null) {
        URL.revokeObjectURL(self.svg_url);
      }
      var svg_blob = new Blob([svg_data], {type: 'image/svg+xml'});
      self.svg_url = URL.createObjectURL(svg_blob);
      return self.svg_url;
    }

    display.create_or_get_menu_item('svg_window')
      .attr('href', 'javascript:void(0)')
      .on('click', function() {
        blob_img_window(create_svg_url());
      })
      .text(gsa._('Show copyable SVG'));

    display.create_or_get_menu_item('svg_dl', true /* Last. */)
      .attr('download', 'gsa_' + self.getName() + '_chart-' +
          new Date().getTime() + '.svg')
      .on('click', function() {
        $(this).attr('href', create_svg_url());
      })
      .text(gsa._('Download SVG'));
    return this;
  };

  BaseChartGenerator.prototype.setBarStyle = function(value) {
    this.bar_style = value;
    return this;
  };

  BaseChartGenerator.prototype.setColorScale = function(value) {
    this.color_scale = value;
    return this;
  };

  BaseChartGenerator.prototype.scaleColor = function(value) {
    var color = this.color_scale(value);
    if (color === '#NaNNaNNaN') {
      return undefined;
    } else {
      return color;
    }
  };

  BaseChartGenerator.prototype.evaluateParams = function(gen_params) {
    if (gsa.is_defined(gen_params.no_chart_links)) {
      this.no_chart_links = gen_params.no_chart_links;
    }

    if (gen_params.chart_template === 'resource_type_counts') {
      this.setDataTransformFunc(resource_type_counts);
    }
    else if (gen_params.chart_template === 'qod_type_counts') {
      this.setDataTransformFunc(qod_type_counts);
    }
    else if (gen_params.chart_template === 'percentage_counts') {
      this.setDataTransformFunc(percentage_counts);
    }
    else if (gen_params.chart_template === 'info_by_class' ||
        gen_params.chart_template === 'recent_info_by_class') {
      this.setDataTransformFunc(data_severity_level_counts);
    }
    else if (gen_params.chart_template === 'info_by_cvss' ||
        gen_params.chart_template === 'recent_info_by_cvss') {
      this.setDataTransformFunc(data_severity_histogram);
    }
  };

  BaseChartGenerator.prototype.createGenerateLinkFunc = function(column, type,
      filter_info) {
    var self = this;
    return function(d, i) {
      if (self.no_chart_links !== true) {
        return self.generateLink(d, i, column, type, filter_info);
      }
    };
  };

  BaseChartGenerator.prototype.generateLink = function(d, i, column, type,
      filter_info) {
  };

  function new_chart_generator(chart_type) {
    var Generator = get_chart_generator(chart_type);
    if (gsa.is_function(Generator)) {
      return new Generator();
    }
    return Generator;
  }

  function get_chart_generator(chart_type) {
    var Generator = chart_generators[chart_type];
    if (!gsa.has_value(Generator)) {
      return null;
    }
    return Generator;
  }

  function register_chart_generator(chart_type, generator) {
    chart_generators[chart_type] = generator;
    chart_generators[generator.name] = generator;
  }

  function on_ready(doc) {
    doc = $(doc);

    doc.find('.dashboard').each(function() {
      var elem = $(this);
      var dashboard_name = elem.data('dashboard-name');
      var max_components = gsa.is_defined(elem.data('max-components')) ?
        elem.data('max-components') : 8;
      var no_chart_links = gsa.is_defined(elem.data('no-chart-links')) ?
        !!(elem.data('no-chart-links')) : false;

      var dashboard = create_dashboard(dashboard_name,
          elem.data('controllers'), elem.data('heights'),
          elem.data('filters-string'),
          {
            controllersPrefID: elem.data('controllers-pref-id'),
            filtersPrefID: elem.data('filters-pref-id'),
            heightsPrefID: elem.data('heights-pref-id'),
            filter: elem.data('filter'),
            filt_id: elem.data('filter-id'),
            max_components: max_components,
            defaultControllerString: elem.data('default-controller-string'),
            hideControllerSelect: elem.data('hide-controller-select'),
            dashboardControls: $('#' + elem.data('dashboard-controls'))[0]
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

        var data_source = create_data_source(data_source_name,
            {
              type: type,
              aggregate_type: aggregate_type,
              group_column: group_column,
              subgroup_column: subgroup_column,
              data_column: ds_elem.data('column'),
              data_columns: ds_elem.data('columns'),
              text_columns: ds_elem.data('text-columns'),
              filter: ds_elem.data('filter'),
              filt_id: ds_elem.data('filter-id'),
              sort_fields: ds_elem.data('sort-fields'),
              sort_orders: ds_elem.data('sort-orders'),
              sort_stats: ds_elem.data('sort-stats'),
              aggregate_mode: ds_elem.data('aggregate-mode'),
              max_groups: ds_elem.data('max-groups'),
              first_group: ds_elem.data('first-group'),
            });

        ds_elem.find('.dashboard-chart').each(function() {
          var c_elem = $(this);
          var chart_template = c_elem.data('chart-template');
          var chart_type = c_elem.data('chart-type');
          var chart_name = c_elem.data('chart-name');
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
          if (gsa.is_defined(chart_template)) {
            gen_params.chart_template = chart_template;
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

          var selector_label = get_selector_label(type, chart_type,
              chart_template, aggregate_type, group_column,
              init_params.title_text);

          var title_generator = get_title_generator(type, chart_type,
              chart_template, aggregate_type, group_column,
              init_params.title_text);

          dashboard.addControllerFactory(chart_name, function(for_component) {
            if (!gsa.is_defined(for_component)) {
              console.error('Component not defined');
              return null;
            }

            var generator = new_chart_generator(chart_type);

            if (!generator) {
              console.error('No chart generator for ' + chart_type + ' found');
              return;
            }

            generator.setTitleGenerator(title_generator);

            if (chart_template === 'info_by_cvss' ||
                chart_template === 'recent_info_by_cvss' &&
                chart_type !== 'donut') {
              generator.setBarStyle(severity_bar_style('value',
                    gsa.severity_levels.max_log,
                    gsa.severity_levels.max_low,
                    gsa.severity_levels.max_medium));
            }
            create_chart_controller(data_source, generator, for_component,
                chart_name, selector_label,
                '/img/charts/severity-bar-chart.png', chart_type,
                chart_template, gen_params, init_params);
          });
        });
      });

      gsa.dashboards[dashboard_name] = dashboard;

      dashboard.initComponentsFromString();

      if (elem.data('detached')) {
        $(window).on('resize', detached_chart_resize_listener(dashboard));
      }
    });
  }

  $(document).ready(function() {
    on_ready(document);
  });

})(window, window, window.document, window.gsa, window.d3, window.$,
  window.console);

// vim: set ts=2 sw=2 tw=80:
