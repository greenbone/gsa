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
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * or, at your option, any later version as published by the Free
 * Software Foundation
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
 * Creates adds display elements to a selected part of the HTML page
 */
function create_chart_box (parent_id, container_id, width, height)
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

  displays [container_id] = new Display (container);
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
                p_label, p_icon, add_to_display)
{
  var data_src = p_data_src;
  var generator = p_generator;
  var display = p_display;
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
      generator.generate (data, display, data_src, gen_params);
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
  var data = null;

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
                              data = xml_select;
                              last_uri = data_uri;

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

  var charts = [];
  var chart_i = 0;

  var last_generator = null;
  var last_gen_params = null;

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
          .attr ("onclick", "displays [\"" + name + "\"].prev_chart ()")
          .append ("img")
            .attr ("src", "img/previous.png")
            .style ("vertical-align", "middle")

    select_elem = footer.append ("select")
                          .style ("margin-left", "5px")
                          .style ("margin-right", "5px")
                          .style ("vertical-align", "middle")
                          .attr ("onchange", "displays [\""+ name + "\"].select_chart (parseInt (this.value))");

    for (var i = 0; i < charts.length; i++)
      {
        select_elem.append ("option")
                      .attr ("value", i)
                      .attr ("id", name + "_chart_opt_" + i)
                      .text (charts [i].label ())
      }

    footer.append ("a")
          .attr ("href", "javascript: void (0);")
          .attr ("onclick", "displays [\"" + name + "\"].next_chart ()")
          .append ("img")
            .attr ("src", "img/next.png")
            .style ("vertical-align", "middle")
  }

  /* refreshes the current chart */
  my.refresh = function ()
                {
                  charts [chart_i].request_data ();
                }

  /* Selects and shows a chart from the charts list by index */
  my.select_chart = function (index)
                      {
                        if (typeof (index) != "number" || index < 0 || index >= charts.length)
                          return console.error ("Invalid chart index: " + index);
                        charts [index].request_data ();
                        chart_i = index;
                        select_elem.select ("option#" + name + "_chart_opt_" + (index))
                                    .property ("selected", "selected")
                      }

  /* Selects and shows the previous chart from the charts list if possible */
  my.prev_chart = function ()
                    {
                      if (chart_i > 0)
                        my.select_chart (chart_i - 1);

                    }

  /* Selects and shows the next chart from the charts list if possible */
  my.next_chart = function ()
                    {
                      if (chart_i < charts.length - 1)
                        my.select_chart (chart_i + 1);
                    }

  return my;
}


/*
 * Helper functions
 */

/*
 * creates a GSA request URI from a command name, parameters array and prefix
 */
function create_uri (command, params, prefix)
{
  var params_str = prefix + "cmd=" + command;
  for (prop_name in params)
    {
      params_str = (params_str + "&" + prop_name
                    + "=" + params[prop_name]);
    }
  params_str = params_str + "&token=" + gsa_token;
  return encodeURI (params_str);
}

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
 * Data extraction helpers
 */

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
 * Gets capitalized resource and attribute names
 */
function capitalize (str)
{
  switch (str.toLowerCase ())
  {
      case "nvt", "cve", "cpe":
        return str.toUpperCase ();
        break;
      default:
        var split_str = str.split ("_");
        for (i in split_str)
          {
            split_str [i] = split_str [i].charAt (0).toUpperCase ()
                            + split_str [i].slice (1);
          }
        return split_str.join(" ");
  }
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
 * Convert SVG element to export format
 */
svg_from_elem = function (svg_elem)
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
  // create SVG
  var svg_data =  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                  + "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.0//EN\" \"http://www.w3.org/TR/SVG/DTD/svg10.dtd\"> "
                  + "<svg xmlns=\"http://www.w3.org/2000/svg\""
                  + " viewBox=\"0 0 " + svg_elem.attr ("width") + " " + svg_elem.attr ("height") + "\""
                  + " width=\"" + svg_elem.attr ("width") + "\""
                  + " height=\"" + svg_elem.attr ("height") + "\">"
                  + " <defs><style type=\"text/css\">" + css_text + "</style></defs>"
                  + svg_elem.html ()
                  + "</svg>";
  return svg_data;
}