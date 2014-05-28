/* Bar styler functions */

function default_bar_style (d) {
  return ("");
}

function severity_bar_style (max_low, max_medium) {
  var func = function (d)
             {
                if (Number(d.x) > max_medium)
                  return ("fill: #D80000");
                else if (Number(d.x) >= max_low)
                  return ("fill: orange");
                else if (Number(d.x) > 0.0)
                  return ("fill: skyblue");
                else
                  return ("fill:silver");
             };
  func.max_low = max_low;
  func.max_medium = max_medium;
  return func;
}

/* Title generator functions */

function title_y_total (prefix, suffix, loading_text)
{
  return function (data)
    {
      if (typeof data === 'undefined')
        return loading_text;

      var total = 0;
      for (i = 0; i < data.length; i++)
        total = Number(total) + Number(data[i].y);
      return (prefix + String(total) + suffix);
    }
}

/* Data transformation functions */

function data_raw (data)
{
  return data;
}

function data_severity_histogram (rawData)
{
  var bins = ["N/A", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  var bin_func = function (val)
                  {
                    if (val != "" && Number (val) <= 0.0)
                      return 1;
                    else if (Number (val) >= 10.0)
                      return 11;
                    else if (Number (val) > 0.0)
                      return Math.floor (Number (val)) + 2;
                    else
                      return 0;
                  };

  var data = bins.map (function (d) { return { x : String(d) , y : 0 }; });

  for (var i = 0; i < rawData.length; i++)
    {
      data[bin_func (rawData[i].x)].y = Number(data[bin_func (rawData[i].x)].y) + Number(rawData[i].y);
    };

  return data;
}


/* Main chart generator */
function gsa_bar_chart()
{
  /* Width without margin */
  var width = 350;
  /* Height without margin */
  var height = 150;
  /* Margin dimensions */
  var margin = {top: 40, right: 20, bottom: 40, left: 60};
  //{top: 40, right: 20, bottom: 30, left: 40};

  /* CSS selector for the elements containing the x and y elements */
  var record_selector = "row";
  /* CSS selector for the elements containing the values on the x axis */
  var x_field = "xVal";
  /* CSS selector for the elements containing the values on the y axis */
  var y_field = "yVal";
  /* Axis labels */
  var x_label = "Value";
  var y_label = "";

  var x_scale = d3.scale.ordinal ()
      .rangeRoundBands ([0, width], 0.125);

  var y_scale = d3.scale.linear ()
      .range ([height, 0]);

  var xAxis = d3.svg.axis ()
      .scale(x_scale)
      .orient("bottom");

  var yAxis = d3.svg.axis ()
      .scale (y_scale)
      .orient ("left")

  var parent_element;
  var svg;
  var title_box;

  /* Bar styling function */
  var bar_style = default_bar_style;
  /* Data to title function */
  var data_to_title = title_y_total ("Total: ", "", "Loading aggregate data...");
  /* Data transformation function */
  var data_transform = data_raw;

  function my (parent_elem)
  {
    parent_element = parent_elem;

    title_box = parent_element.append ("div")
                                 .attr ("width", width + margin.left + margin.right)
                                 .attr ("class", "chart-title");

    svg = parent_element.append ("svg")
                          .attr ("width", width + margin.left + margin.right)
                          .attr ("height", height + margin.top + margin.bottom)
                          .append ("g")
                            .attr ("transform", "translate(" + margin.left + "," + margin.top + ")");

    return my;
  };

  my.width = function (value)
  {
    if (!arguments.length)
      return width;
    width = value;
    return my;
  };

  my.height = function (value)
  {
    if (!arguments.length)
      return height;
    height = value;
    return my;
  };

  my.chart_title = function (value)
  {
    if (!arguments.length)
      return chart_title;
    chart_title = value;
    title_box.text (value);
    return my;
  }

  my.record_selector = function (value)
  {
    if (!arguments.length)
      return record_selector;
    record_selector = value;
    return my;
  };

  my.x_field = function (value)
  {
    if (!arguments.length)
      return x_field;
    x_field = value;
    return my;
  };

  my.y_field = function (value)
  {
    if (!arguments.length)
      return y_field;
    y_field = value;
    return my;
  };

  my.x_label = function (value)
  {
    if (!arguments.length)
      return x_label;
    x_label = value;
    return my;
  };

  my.y_label = function (value)
  {
    if (!arguments.length)
      return y_label;
    y_label = value;
    return my;
  };

  my.bar_style = function (value) {
    if (!arguments.length)
      return bar_style;
    bar_style = value;
    return my;
  };

  my.data_to_title = function (value) {
    if (!arguments.length)
      return data_to_title;
    data_to_title = value;
    return my;
  }

  my.data_transform = function (value) {
    if (!arguments.length)
      return data_transform;
    data_transform = value;
    return my;
  }

  my.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      if (y_label != "")
        return "<strong>" + y_label + ":</strong> " + d.y + "";
      else
        return d.y;
    });

  my.load_xml_url = function (data_url)
  {
    title_box.text (data_to_title ());
    svg.append("text").attr("id", "loading_text").attr("y", "20").text("Loading aggregate data...");

    d3.xml (data_url, "application/xml",
            function (error, xml)
            {
              if (error)
                {
                  if (error instanceof XMLHttpRequest)
                    {
                      if (error.status === 0)
                        {
                          title_box.text ("- Loading aborted -");
                          svg.text("");
                          return;
                        }
                      else
                        return (parent_element.text ("Error: HTTP request returned status " + error.status + " for URL: " + data_url));
                    }
                  else
                    return (parent_element.text ("Error reading XML from URL '" + data_url + "': " + error));
                }

              var xml_select = d3.select(xml.documentElement);

              if (xml.documentElement.localName == "parsererror")
                {
                  title_box.text ("- Error parsing aggregate data -");
                  svg.text("");
                  console.warn ("Error parsing aggregate data, see debug message for details");
                  console.debug (xml.documentElement.textContent);
                  return;
                }

              var records = xml_select.selectAll(record_selector);

              var rawData = records[0].map (function (d)
                                     {
                                       return { x : d3.select(d).select(x_field).text() ,
                                                y : d3.select(d).select(y_field).text() };
                                     });

              title_box.text (data_to_title (rawData));
              data = data_transform (rawData);

              xData = data.map (function (d) { return d.x; });
              yData = data.map (function (d) { return d.y; });

              x_scale.domain (xData);
              y_scale.domain ([0, Math.max.apply( null, yData)]).nice(10);

              svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis);

              svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis);

              svg.append("text")
                  .attr ("class", "chart-label")
                  .attr ("y", -margin.top/2)
                  .attr ("x", -margin.left/2)
                  .text(y_label);

              svg.selectAll(".bar")
                    .data(data)
                  .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x_scale(d.x); })
                    .attr("width", x_scale.rangeBand())
                    .attr("y", function(d) { return y_scale(d.y); })
                    .attr("height", function(d) { return my.height() - y_scale(d.y); })
                    .attr("style", function(d) { return bar_style (d)})
                    .on("mouseover", my.tip.show)
                    .on("mouseout", my.tip.hide)

              svg.select("#loading_text").remove();
            });

    svg.call(my.tip);
  }

  return my;
}



