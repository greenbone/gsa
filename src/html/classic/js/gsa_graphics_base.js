/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for graphics in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 Greenbone Networks GmbH
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

/*
 * GSA base object
 */
if (typeof gsa === 'undefined') gsa = {};

/*
 * Basic chart components
 */

/*
 * Creates and adds display elements to a selected part of the HTML page
 */
function create_chart_box (parent_id, container_id, width, height,
                           select_pref_id, filter_pref_id)
{
  var parent = d3.select ("#" + parent_id);
  var container = parent.append ("div")
                        .attr ("class", "dashboard_box")
                        .attr ("id", container_id);

  var menu = container.append ("div")
               .attr ("id", "chart_list")
                 .append ("ul")
                    .append ("li");

  menu.append ("a")
        .attr ("id", "section_list_first");

  menu = menu.append ("ul")
          .attr ("id", container_id + "-menu");

  container.append ("div")
        .attr ("class", "chart-head")
        .attr ("id", container_id + "-head")
        .text ("Initializing chart...");

  container.append ("svg")
      .attr ("class", "chart-svg")
      .attr ("id", container_id + "-svg")
      .attr ("width", width)
      .attr ("height", height);

  container.append ("div")
      .attr ("class", "chart-foot")
      .attr ("id", container_id + "-foot")

  gsa.displays [container_id] = new Display (container);
  if (select_pref_id != '')
    gsa.displays [container_id].select_pref_id (select_pref_id);

  if (filter_pref_id != '')
    gsa.displays [container_id].filter_pref_id (filter_pref_id);

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
function Chart (p_data_src, p_generator, p_display,
                p_chart_name, p_label, p_icon, add_to_display,
                p_chart_type, p_chart_template)
{
  var data_src = p_data_src;
  var generator = p_generator;
  var display = p_display;
  var chart_type = p_chart_type;
  var chart_template = p_chart_template;
  var chart_name = p_chart_name;
  var label = p_label ? p_label : "Unnamed chart";
  var icon = p_icon ? p_icon : "/img/help.png";
  var current_request = null;

  function my () {};

  if (add_to_display)
    display.add_chart (my);

  /* Gets or sets the data source */
  my.data_src = function (value)
    {
      if (!arguments.length)
        return data_src;
      data_src = value;
      return my;
    }

  /* Gets or sets the generator */
  my.generator = function (value)
    {
      if (!arguments.length)
        return generator;
      generator = value;
      return my;
    }

  /* Gets or sets the display */
  my.display = function (value)
    {
      if (!arguments.length)
        return display;
      display = value;
      return my;
    }

  /* Gets the chart name */
  my.chart_name = function ()
    {
      return chart_name;
    }

  /* Gets or sets the label */
  my.label = function (value)
    {
      if (!arguments.length)
        return label;
      label = value;
      return my;
    }

  /* Gets or sets the icon */
  my.icon = function (value)
    {
      if (!arguments.length)
        return icon;
      icon = value;
      return my;
    }

  /* Gets the chart type */
  my.chart_type = function ()
    {
      return chart_type;
    }

  /* Gets the chart template */
  my.chart_template = function ()
    {
      return chart_template;
    }

  /* Gets or sets the current request */
  my.current_request = function (value)
    {
      if (!arguments.length)
        return current_request;
      current_request = value;
      return my;
    }

  /* Delegates a data request to the data source */
  my.request_data = function (gen_params)
    {
      data_src.request_data (this, gen_params);
    }

  /* Shows the "Loading ..." text in the display */
  my.show_loading = function ()
    {
      generator.show_loading (display);
    }

  /* Callback for when data has been loaded */
  my.data_loaded = function (data, gen_params)
    {
      generator.generate (data, this, gen_params);
    }

  /* Construct URL for detached chart */
  my.detached_url = function ()
    {
      return create_uri (data_src.command (),
                         data_src.params (),
                         data_src.prefix (),
                         true)
             + "&chart_type=" + chart_type
             + "&chart_template=" + chart_template
    }

  return my;
}


/*
 * Data source (parameters for GSA request, XML response cache)
 *
 * Parameters:
 *  command: command name like "get_aggregate"
 *  params:  parameters for the command
 *  prefix:  prefix for OMP commands
 */
function DataSource (command, params, prefix)
{
  var prefix = (undefined == prefix) ? "/omp?" : prefix;
  var command;
  var params = (params == undefined) ? {} : params;
  var data_uri = null;
  var last_uri = null;
  var column_info = {};
  var data = {};

  function my () {};

  /* Gets or sets the prefix */
  my.prefix = function (value)
    {
      if (!arguments.length)
        return prefix;
      prefix = value;
      return my;
    }

  /* Gets or sets the command name */
  my.command = function (value)
    {
      if (!arguments.length)
        return command;

      command = value;
      return my;
    }

  /* Gets or sets a parameter */
  my.param = function (param_name, value)
    {
      if (!arguments.length)
        return undefined;
      else if (arguments.length == 1)
        return params [param_name];
      else
        params [param_name] = value;
      return my;
    }

  /* Gets the parameters array */
  my.params = function ()
    {
      return params;
    }

  /* Removes a parameter */
  my.delete_param = function (param_name)
    {
      delete params [param_name];
      return my;
    }

  /* Gets the current data URI */
  my.data_uri = function ()
    {
      return data_uri;
    }

  /* Gets the URI of the last successful request */
  my.last_uri = function ()
    {
      return last_uri;
    }

  /* Gets the Column data of the last successful request */
  my.column_info = function ()
    {
      return column_info;
    }

  /* Sends an HTTP request to get XML data.
   * Once the data is loaded, the chart will be notified via the
   * data_loaded callback */
  my.request_data = function (chart, gen_params, ignore_cache)
    {
      data_uri = create_uri (command, params, prefix);

      if (ignore_cache || last_uri != data_uri)
        {
          chart.show_loading ();

          if (chart.current_request () != null)
            chart.current_request ().abort ();

          chart.current_request (d3.xml (data_uri, "application/xml"));
          chart.current_request ()
                 .get (function (error, xml)
                        {
                          if (error)
                            {
                              if (error instanceof XMLHttpRequest)
                                {
                                  if (error.status === 0)
                                    {
                                      output_error (chart, "Loading aborted");
                                      return;
                                    }
                                  else
                                    {
                                      output_error (chart, "HTTP error", "Error: HTTP request returned status " + error.status + " for URL: " + data_src.data_uri);
                                      return;
                                    }
                                }
                              else
                                {
                                  output_error (chart, "Error reading XML", "Error reading XML from URL '" + data_src.data_uri + "': " + error);
                                  return;
                                }
                            }
                          else
                            {
                              var xml_select = d3.select(xml.documentElement);
                              if (xml.documentElement.localName == "parsererror")
                                {
                                  output_error (chart, "Error parsing XML data", "Error parsing XML data, details follow in a debug message", xml.documentElement.textContent);
                                  return;
                                }
                              last_uri = data_uri;

                              if (command == "get_aggregate")
                                {
                                  data = { original_xml : xml_select,
                                           records : extract_simple_records (xml_select, "aggregate group"),
                                           column_info : extract_column_info (xml_select, gen_params) };
                                }
                              else
                                {
                                  output_error (chart, "Internal error: Invalid request", "Invalid request command: \"" + command + "\"")
                                  return my;
                                }
                              chart.data_loaded (data, gen_params);
                              chart.current_request (null);
                            }
                        });
        }
      else
        {
          chart.data_loaded (data, gen_params);
        }
      return my;
    }

  my.command (command);

  return my;
}

/*
 * Display
 *
 * Parameters:
 *  p_container: the div containing the header, svg and footer elements
 */
function Display (p_container)
{
  var container = p_container;
  var name = container.attr ("id");
  var menu = container.select ("#" + container.attr ("id") + "-menu");
  var header = container.select ("#" + container.attr ("id") + "-head");
  var svg = container.select ("#" + container.attr ("id") + "-svg");
  var footer = container.select ("#" + container.attr ("id") + "-foot");
  var select_elem = null;
  var filter_elem = null;

  var charts = [];
  var chart_i = 0;
  var chart_name_indexes = {};

  var filters = {"": { name:"--", term:"" }};

  var last_generator = null;
  var last_gen_params = null;

  var select_pref_id = "";
  var filter_pref_id = "";
  var chart_pref_request = null;

  function my() {};

  /* Gets the Display name */
  my.display_name = function ()
    {
      return name;
    }

  /* Gets the header element */
  my.header = function ()
    {
      return header;
    }

  /* Gets the svg element */
  my.svg = function ()
    {
      return svg;
    }

  /* Gets the footer element */
  my.footer = function ()
    {
      return footer;
    }

  /* Adds a new chart to the list */
  my.add_chart = function (new_chart)
    {
      charts.push (new_chart);
    }

  /* Gets the last successful generator */
  my.last_generator = function ()
    {
      return last_generator;
    }

  /* Gets the parameters for the last successful generator run */
  my.last_gen_params = function ()
    {
      return last_gen_params;
    }

  /* Updates the data on the last successful generator.
   * Should be called by the generator if it was successful */
  my.update_gen_data = function (generator, gen_params)
    {
      last_generator = generator;
      last_gen_params = gen_params;
      return my;
    }

  /* Puts an error message into the header and clears the svg element */
  my.show_error = function (message)
    {
      header.text (message);
      svg.text ("");
    }

  /* Gets a menu item or creates it if it does not exist */
  my.create_or_get_menu_item = function (id)
    {
      var item = menu.select ("li #" + name + "_" + id)
                      .select ("a");

      if (item.empty ())
        item = menu.append ("li")
                     .attr ("id", name + "_" + id)
                     .append ("a")

      return item;
    }

  /* Adds a chart selector to the footer */
  my.create_chart_selector = function ()
  {
    footer.append ("a")
          .attr ("href", "javascript: void (0);")
          .attr ("onclick", "gsa.displays [\"" + name + "\"].prev_chart ()")
          .append ("img")
            .attr ("src", "img/previous.png")
            .style ("vertical-align", "middle")

    select_elem = footer.append ("select")
                          .style ("margin-left", "5px")
                          .style ("margin-right", "5px")
                          .style ("vertical-align", "middle")
                          .attr ("onchange", "gsa.displays [\""+ name + "\"].select_chart (this.value, true, true)");

    for (var i = 0; i < charts.length; i++)
      {
        chart_name_indexes [charts [i].chart_name ()] = i
        select_elem.append ("option")
                      .attr ("value", charts [i].chart_name ())
                      .attr ("id", name + "_chart_opt_" + i)
                      .text (charts [i].label ())
      }

    footer.append ("a")
          .attr ("href", "javascript: void (0);")
          .attr ("onclick", "gsa.displays [\"" + name + "\"].next_chart ()")
          .append ("img")
            .attr ("src", "img/next.png")
            .style ("vertical-align", "middle")
  }

  /* Creates a filter selector */
  my.create_filter_selector = function ()
    {
      filter_elem = footer.append ("div")
                            .attr ("id", name + "_filter_selector")
                            .text ("Filter: ")
                              .append ("select")
                              .attr ("onchange", "gsa.displays [\""+ name + "\"].select_filter (this.value, true, true)")
      filter_elem.append ("option")
                  .text ("--")
                  .attr ("value", "")
    }

  /* Adds a filter to the selector */
  my.add_filter = function (id, filter_name, term)
    {
      filters [id] = {name: filter_name, term: term}
      d3.select ("#" + name + "_filter_selector select")
          .append ("option")
            .text (filter_name)
            .attr ("value", id)
            .attr ("id", name + "_filter_opt_" + id)
    }

  my.select_filter = function (filter_id, save_preference, request_data)
    {
      if (filters [filter_id] == undefined)
        {
          console.warn ("Filter not found: " + filter_id)
          my.select_filter ("", save_preference, request_data);
          return;
        }

      for (var chart in charts)
        {
          charts[chart].data_src ().param ("filter", filters [filter_id].term);
        }

      if (request_data)
        charts [chart_i].request_data (my);

      if (save_preference && select_pref_id != "")
        {
          if (chart_pref_request != null)
            chart_pref_request.abort ();

          chart_pref_request = d3.xhr ("/omp")

          var form_data = new FormData ();
          form_data.append ("chart_preference_id", filter_pref_id);
          form_data.append ("chart_preference_value", filter_id);
          form_data.append ("token", gsa.gsa_token);
          form_data.append ("cmd", "save_chart_preference");

          chart_pref_request.post (form_data);
        }

      filter_elem.select ("option#" + name + "_filter_opt_" + filter_id)
                                    .property ("selected", "selected")
    }

  my.select_pref_id = function (value)
    {
      if (!arguments.length)
        return select_pref_id;

      select_pref_id = value;

      return my;
    }

  my.filter_pref_id = function (value)
    {
      if (!arguments.length)
        return filter_pref_id;

      filter_pref_id = value;

      return my;
    }

  my.width = function (new_width)
    {
      if (!arguments.length)
        return container.property ("clientWidth");

      svg.attr ("width",
                Math.max (new_width, 200));
      return my;
    }

  my.height = function (new_height)
    {
      if (!arguments.length)
        return container.property ("clientHeight");

      svg.attr ("height",
                Math.max (new_height - (header.property ("clientHeight") + footer.property ("clientHeight")), 100));
      return my;
    }

  /* refreshes the current chart */
  my.refresh = function ()
    {
      charts [chart_i].request_data ();
    }

  /* Selects and shows a chart from the charts list by name */
  my.select_chart = function (name, save_preference, request_data)
    {
      if (chart_name_indexes [name] == undefined)
        {
          console.warn ("Chart not found: " + name);
          my.select_chart_index (0, save_preference, request_data)
        }
      else
        my.select_chart_index (chart_name_indexes [name],
                               save_preference, request_data)
    }

  /* Selects and shows a chart from the charts list by index */
  my.select_chart_index = function (index, save_preference, request_data)
    {
      if (typeof (index) != "number" || index < 0 || index >= charts.length)
        return console.error ("Invalid chart index: " + index);
      chart_i = index;

      if (request_data)
        charts [index].request_data ();

      if (save_preference && select_pref_id != "")
        {
          if (chart_pref_request != null)
            chart_pref_request.abort ();

          chart_pref_request = d3.xhr ("/omp")

          var form_data = new FormData ();
          form_data.append ("chart_preference_id", select_pref_id);
          form_data.append ("chart_preference_value", charts [index].chart_name ());
          form_data.append ("token", gsa.gsa_token);
          form_data.append ("cmd", "save_chart_preference");

          chart_pref_request.post (form_data);
        }

      select_elem.select ("option#" + name + "_chart_opt_" + (index))
                  .property ("selected", "selected")
    }

  /* Selects and shows the previous chart from the charts list if possible */
  my.prev_chart = function ()
    {
      if (chart_i > 0)
        my.select_chart_index (chart_i - 1, true, true);
      else
        my.select_chart_index (charts.length - 1, true, true);
    }

  /* Selects and shows the next chart from the charts list if possible */
  my.next_chart = function ()
    {
      if (chart_i < charts.length - 1)
        my.select_chart_index (chart_i + 1, true, true);
      else
        my.select_chart_index (0, true, true);
    }

  return my;
}


/*
 * Data Source Helper functions
 */

/*
 * creates a GSA request URI from a command name, parameters array and prefix
 */
function create_uri (command, params, prefix, no_xml)
{
  var params_str = prefix + "cmd=" + command;
  for (var prop_name in params)
    {
      if (!no_xml || prop_name != "xml")
        params_str = (params_str + "&" + prop_name
                      + "=" + params[prop_name]);
    }
  params_str = params_str + "&token=" + gsa.gsa_token;
  return encodeURI (params_str);
}

/*
 * Extracts records from XML
 */
function extract_simple_records (xml_data, selector)
{
  var records = [];
  xml_data.selectAll (selector)
            .each (function (d, i)
                    {
                      var record = {};
                      d3.select(this)
                          .selectAll ("*")
                            .each (function (d, i)
                                    {
                                      if (!isNaN (parseFloat (d3.select (this).text ()))
                                          && isFinite (d3.select (this).text ()))
                                        record [this.localName]
                                          = parseFloat (d3.select (this).text ())
                                      else
                                        record [this.localName]
                                          = d3.select (this).text ()
                                    });
                      records.push (record);
                     });
  return records;
}

/*
 * Extracts column info from XML
 */
function extract_column_info (xml_data, gen_params)
{
  var column_info = { group_columns : [],
                      data_columns : [],
                      columns : {} };

  xml_data.selectAll ("aggregate column_info aggregate_column")
            .each (function (d, i)
                    {
                      var column = {};
                      d3.select(this)
                          .selectAll ("*")
                            .each (function (d, i)
                                    {
                                      if (!isNaN (parseFloat (d3.select (this).text ()))
                                          && isFinite (d3.select (this).text ()))
                                        column [this.localName]
                                          = parseFloat (d3.select (this).text ())
                                      else
                                        column [this.localName]
                                          = d3.select (this).text ()
                                    });
                      column_info.columns [column.name] = column;
                     });

  xml_data.selectAll ("aggregate group_column")
            .each (function (d, i)
                    {
                      column_info.group_columns.push (d3.select (this).text ())
                    })

  xml_data.selectAll ("aggregate data_column")
            .each (function (d, i)
                    {
                      column_info.data_columns.push (d3.select (this).text ())
                    })

  return column_info;
}


/*
 * Helpers for processing extracted data
 */

/*
 * Gets capitalized resource and attribute names
 */
function capitalize (str)
{
  switch (str.toLowerCase ())
    {
      case "nvt":
      case "cve":
      case "cpe":
        return str.toUpperCase ();
        break;
      default:
        var split_str = str.split ("_");
        for (var i in split_str)
          {
            split_str [i] = split_str [i].charAt (0).toUpperCase ()
                            + split_str [i].slice (1);
          }
        return split_str.join(" ");
    }
}

/*
 * Gets the full name of a resource type.
 */
function resource_type_name (type)
{
  switch (type.toLowerCase())
    {
      case "ovaldef":
        return "OVAL definition"
      case "cert_bund_adv":
        return "CERT-Bund Advisory"
      case "dfn_cert_adv":
        return "DFN-CERT Advisory"
      case "allinfo":
        return "SecInfo Item"
      default:
        return capitalize (type);
    }
}

/*
 * Gets the plural form of the full name of a resource type.
 */
function resource_type_name_plural (type)
{
  switch (type.toLowerCase())
    {
      case "dfn_cert_adv":
        return "DFN-CERT Advisories"
      case "cert_bund_adv":
        return "CERT-Bund Advisories"
      default:
        return resource_type_name (type) + "s"
    }
}

/*
 * Gets the full form of an aggregate field.
 */
function field_name (field, type)
{
  switch (field.toLowerCase())
    {
      case "c_count":
        return "total " + resource_type_name_plural (type)
      case "count":
        return resource_type_name_plural (type)
      case "created":
        return "creation time"
      case "modified":
        return "modification time"
      default:
        return field;
    }
}

/*
 * Generates a label from a column info object.
 */
function column_label (info, capitalize_label, include_type, include_stat)
{
  var label = "";
  if (include_stat)
    switch (info.stat)
      {
        case "min":
          label = label + "min. ";
          break;
        case "max":
          label = label + "max. ";
          break;
        case "mean":
          label = label + "average ";
          break;
        case "sum":
          label = label + "summed ";
          break;
      }

  label = label + field_name (info.column ? info.column : info.stat,
                              info.type);

  if (include_type && info.stat != "count" && info.stat != "c_count")
    label = label + " (" + resource_type_name (info.type) + ")";
  if (capitalize_label)
    return capitalize (label)
  else
    return label;
}


/*
 * Record set transformation functions
 */

/*
 * Dummy function returning the raw data
 */
function data_raw (data)
{
  return data;
}

/*
 * Transform data into a severity histogram
 */
function data_severity_histogram (old_data, params)
{
  var bins = ["N/A", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  var severity_field = "value";
  var count_field = "count";

  if (params)
    {
      if (params.severity_field)
        severity_field = params.severity_field;
      if (params.count_field)
        count_field = params.count_field;
    }

  var column_info = { group_columns : [severity_field],
                      data_columns : [count_field],
                      columns : {} }

  var bin_func = function (val)
    {
      if (val !== "" && Number (val) <= 0.0)
        return 1;
      else if (Number (val) >= 10.0)
        return 11;
      else if (Number (val) > 0.0)
        return Math.ceil (Number (val)) + 1;
      else
        return 0;
    };

  var records = bins.map (function (d)
                            {
                              var record = {};
                              record [severity_field] = d;
                              record [count_field] = 0;
                              return record;
                            });

  column_info.columns [severity_field]
    = {
        name : severity_field,
        type : old_data.column_info.columns [severity_field].type,
        column : old_data.column_info.columns [severity_field].column,
        stat : old_data.column_info.columns [severity_field].stat,
        data_type : "text"
      }

  column_info.columns [count_field]
    = {
        name : count_field,
        type : old_data.column_info.columns [count_field].type,
        column : "",
        stat : "count",
        data_type : "integer"
      }

  for (var i in old_data.records)
    {
      records[bin_func (old_data.records [i][severity_field])][count_field]
                     = Number(records[bin_func (old_data.records [i][severity_field])][count_field])
                       + Number(old_data.records[i][count_field]);
    };

  var data = {
              original_xml : old_data.original_xml,
              records : records,
              column_info : column_info
             };

  return data;
}

/*
 * Gets the counts of severity levels from records containing the counts
 * the counts for each numeric CVSS score.
 */
function data_severity_level_counts (old_data, params)
{
  var bins = ["N/A", "None", "Low", "Medium", "High"]
  var severity_field = "value";
  var count_field = "count";
  var ascending = false;

  if (params)
    {
      if (params.severity_field)
        severity_field = params.severity_field;
      if (params.count_field)
        count_field = params.count_field;
      if (params.ascending != undefined)
        ascending = params.ascending;
    }

  var records = bins.map (function (d)
                            {
                              var record = {};
                              record [severity_field] = d;
                              record [count_field] = 0;
                              return record;
                            });

  var column_info = { group_columns : [severity_field],
                      data_columns : [count_field],
                      columns : {} }

  column_info.columns [severity_field]
    = {
        name : severity_field,
        type : old_data.column_info.columns [severity_field].type,
        column : old_data.column_info.columns [severity_field].column,
        stat : old_data.column_info.columns [severity_field].stat,
        data_type : "text"
      }

  column_info.columns [count_field]
    = {
        name : count_field,
        type : old_data.column_info.columns [count_field].type,
        column : "",
        stat : "count",
        data_type : "integer"
      }

  for (var i in old_data.records)
    {
      var val = old_data.records [i][severity_field];
      var count = old_data.records [i][count_field];

      if (val !== "" && Number (val) <= 0.0)
        records[1][count_field] += count;
      else if (Number (val) >= gsa.severity_levels.min_high)
        records[4][count_field] += count;
      else if (Number (val) >= gsa.severity_levels.min_medium)
        records[3][count_field] += count;
      else if (Number (val) >= gsa.severity_levels.min_low)
        records[2][count_field] += count;
      else
        records[0][count_field] += count;
    };

  var data = {
              original_xml : old_data.original_xml,
              records : ascending ? records : records.reverse (),
              column_info : column_info
             };

  return data;
}

/**
 * Get counts by resource type, using the full type name for the x field.
 */
function resource_type_counts (old_data, params)
{
  var new_data = { original_xml : old_data.original_xml,
                   records : [],
                   column_info : old_data.column_info };

  var type_field = "value";
  if (params)
    {
      if (params.type_field != null)
        type_field = params.type_field;
    }

  for (var record in old_data.records)
    {
      var new_record = {};
      for (field in old_data.records [record])
        {
          if (field == type_field)
            new_record[field] = resource_type_name_plural (old_data.records [record][field]);
          else
            new_record[field] = old_data.records [record][field];
        }
      new_data.records.push (new_record);
    }
  return new_data;
}


/*
 * Generic display helper functions
 */

/*
 * Prints an error to the console and shows it on the display of a chart.
 */
function output_error (chart, display_message, console_message, console_extra)
{
  if (undefined != console_message)
    console.error (console_message);
  if (undefined != console_extra)
    console.debug (console_extra);

  chart.display ().show_error (display_message);
}

/*
 * Opens a popup window for a detached chart
 */
function open_detached (url)
{
  var new_window = window.open (url, "", "width=460, height=340");
  new_window.fit_window = true;
  return false;
}

/*
 * Resize a detached chart window to fit the chart display, filter and footer
 */
function fit_detached_window ()
{
  var display = d3.select ("#aggregate-display");
  var display_width = Number (display.property ("scrollWidth"));
  var display_height = Number (display.property ("scrollHeight"));
  var filter = d3.select ("#applied_filter");
  var footer = d3.select (".gsa_footer")
  var height_diff = this.outerHeight - this.innerHeight;
  var width_diff = this.outerWidth - this.innerWidth;

  this.resizeTo (display_width + width_diff + 24,
                  this.innerHeight)
  this.resizeTo (display_width + width_diff + 24,
                  20 + height_diff + display_height
                  + Number (filter.property ("scrollHeight"))
                  + Number (footer.property ("scrollHeight")))
}

/*
 * Resizes a chart display to fill the whole window
 */
function detached_chart_resize_listener (display)
{
  return function ()
    {
      var window_width = window.innerWidth;
      var window_height = window.innerHeight;

      display.width (window_width - 20);
      display.height (window_height - (  Number (d3.select (".gsa_footer")
                                                    .property ("clientHeight"))
                                       + Number (d3.select ("#applied_filter")
                                                    .property ("clientHeight"))
                                       + 20));
      display.refresh ();
    }
}

/*
 * Wrap SVG text at a given width
 */
function wrap_text (text_selection, width)
{
  text_selection.each(function()
    {
      var text = d3.select(this);
      var words = text.text()
                        .match (/[^\s-]+[\s-]*/g)
                          .reverse();
      var current_word;
      var line = [];
      var line_number = 0;
      var line_height = 1.2; //em
      var x = text.attr ("x");
      var y = text.attr ("y");
      var dy = parseFloat (text.attr ("dy"));
      var tspan = text.text (null)
                      .append ("tspan")
                        .attr ("x", x)
                        .attr ("y", y)
      var word;
      while (word = words.pop ())
        {
          line.push (word);
          tspan.text(line.join (""));
          if (tspan.node ().getComputedTextLength () > width) {
            if (line.length > 1)
              {
                line.pop ();
                tspan.text (line.join (""));
                line = [word];
              }
            else
              {
                tspan.text (line.join (""));
                line.pop ();
              }

            tspan = text.append ("tspan")
                          .attr("x", x)
                          .attr("y", y)
                          .attr("dy", ++line_number * line_height + "em")
                          .text(line.join (""));
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
function title_static (loading_text, loaded_text)
{
  return function (data)
    {
      if (typeof data === 'undefined')
        return loading_text;
      else
        return loaded_text;
    }
}

/*
 * Returns a title containing the total count of the resources.
 */
function title_total (loading_text, prefix, suffix, count_field)
{
  return function (data)
    {
      if (typeof data === 'undefined')
        return loading_text;

      var total = 0;
      for (var i = 0; i < data.records.length; i++)
        total = Number(total) + Number(data.records[i][count_field]);
      return (prefix + String(total) + suffix);
    }
}

/*
 * Generic chart styling helpers
 */

/* Color scales */

/*
 * Color scale for SecInfo severity levels
 */
severity_level_color_scale
  = d3.scale.ordinal ()
              .range (["silver", "#DDDDDD", "skyblue", "orange", "#D80000"])
              .domain (["N/A", "None", "Low", "Medium", "High"]);

/*
 * Severity gradient
 */
severity_colors_gradient = function ()
{
  return d3.scale.linear()
            .domain([-1.0,
                      0.0,
                      gsa.severity_levels.max_low,
                      gsa.severity_levels.max_medium,
                      10.0])
            .range([d3.rgb ("grey"),
                    d3.rgb ("silver"),
                    d3.rgb ("skyblue"),
                    d3.rgb ("orange"),
                    d3.rgb ("red")]);
}


/*
 * Data export helpers
 */

/*
 * Generate CSV data from simple records
 */
csv_from_records = function (records, columns, headers, title)
{
  var csv_data = "";

  if (title != undefined)
    csv_data += (title + "\r\n");

  if (headers != undefined)
    {
      for (var col_i in headers)
        {
          csv_data += "\"" + String (headers[col_i]).replace ("\"", "\"\"") + "\"";
          if (col_i < columns.length - 1)
            csv_data += ",";
        }
      csv_data += "\r\n";
    }

  for (var row in records)
    {
      for (var col_i in columns)
        {
          var col = columns [col_i];
          csv_data += "\"" + String (records [row][col]).replace ("\"", "\"\"") + "\"";
          if (col_i < columns.length - 1)
            csv_data += ",";
        }
      csv_data += "\r\n";
    }

  return csv_data;
}

/*
 * Generate HTML table from simple records
 */
html_table_from_records = function (records, columns, headers, title, filter)
{
  var csv_data = "";

  var doc = document.implementation.createDocument ("http://www.w3.org/1999/xhtml", "html", null);
  var head_s = d3.select (doc.documentElement).append ("head");
  var body_s = d3.select (doc.documentElement).append ("body");
  var table_s;
  var row_class = "odd";

  var stylesheet;
  for (var sheet_i = 0; stylesheet == undefined && sheet_i < document.styleSheets.length; sheet_i++)
    {
      if (document.styleSheets [sheet_i].href.indexOf("/gsa-style.css", document.styleSheets [sheet_i].href.length - "/gsa-style.css".length) !== -1 )
        stylesheet = document.styleSheets [sheet_i];
    }

  head_s.append ("title")
          .text ("Greenbone Security Assistant - Chart data table")

  head_s.append ("link")
          .attr ("href", stylesheet.href)
          .attr ("type", "text/css")
          .attr ("rel", "stylesheet")

  body_s.style ("padding", "10px")

  table_s = body_s.append ("table")
                    .attr ("cellspacing", "2")
                    .attr ("cellpadding", "4")
                    .attr ("border", "0")
                    .attr ("class", "gbntable")

  table_s.append ("tr")
          .attr ("class", "gbntablehead1")
          .append ("td")
            .attr ("colspan", headers.length)
            .text (title)

  if (headers != undefined)
    {
      var tr_s = table_s.append ("tr")
                          .attr ("class", "gbntablehead2");
      for (var col_i in headers)
        {
          tr_s.append ("td")
                .text (headers[col_i])
        }
    }

  for (var row in records)
    {
      var tr_s = table_s.append ("tr")
                          .attr ("class", row_class);
      for (var col_i in columns)
        {
          var col = columns [col_i];
          tr_s.append ("td")
                .text (records [row][col])
        }
      row_class = (row_class == "odd") ? "even" : "odd";
    }

  if (filter != null)
    body_s.append ("p")
            .attr ("class", "footnote")
            .text ("Applied filter: " + filter);

  return doc.documentElement.outerHTML;
}

/*
 * Convert SVG element to export format
 */
svg_from_elem = function (svg_elem, title)
{
  var css_text = "";
  // find stylesheet
  /*
   * FIXME: Consider moving chart styles to extra CSS file to reduce SVG size.
   *        Axes are only shown correctly in programs more "dedicated" to SVG
   *         like browsers and Inkscape: Lines with ticks become black boxes
   *         elsewhere. Workaround: Save copy as "plain SVG" in Inkscape.
   */
  var stylesheet;

  var width = Number (svg_elem.attr ("width"));
  var height = Number (svg_elem.attr ("height"));

  for (var sheet_i = 0; stylesheet == undefined && sheet_i < document.styleSheets.length; sheet_i++)
    {
      if (document.styleSheets [sheet_i].href.indexOf("/gsa-style.css", document.styleSheets [sheet_i].href.length - "/gsa-style.css".length) !== -1 )
        stylesheet = document.styleSheets [sheet_i];
    }
  // get stylesheet text
  var css_text = "";
  for (var i = 0; i < stylesheet.cssRules.length; i++)
    {
      css_text += stylesheet.cssRules[i].cssText;
    }

  var title_xml;
  if (title != null && title != "")
    title_xml =   "<text x=\"" + (width/2) + "\" y=\"0\""
                + " text-anchor=\"middle\""
                + " style=\"font-weight: bold; font-size: 12px\">"
                + title
                + "</text>"
  else
    title_xml = ""

  // create SVG
  var svg_data =  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                  + "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.0//EN\" \"http://www.w3.org/TR/SVG/DTD/svg10.dtd\"> "
                  + "<svg xmlns=\"http://www.w3.org/2000/svg\""
                  + " viewBox=\"0 " + (title != null ? "-14" : "0") + " " + width + " " + height + "\""
                  + " width=\"" + width + "\""
                  + " height=\"" + (height + (title != null ? 14 : 0)) + "\">"
                  + " <defs><style type=\"text/css\">" + css_text + "</style></defs>"
                  + title_xml
                  + svg_elem.html ()
                  + "</svg>";
  return svg_data;
}

/*
 * Shows a blob url inside an img element in a new window.
 */
function blob_img_window (blob_url)
{
  var new_window = window.open ("", "_blank");

  d3.select (new_window.document)
      .select ("body")
        .insert ("img")
          .attr ("src", blob_url)
  return;
}