<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      xmlns:exslt="http://exslt.org/common"
      xmlns:str="http://exslt.org/strings"
      xmlns="http://www.w3.org/1999/xhtml"
      extension-element-prefixes="gsa exslt str">
     <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Graphics for GSA.

Authors:
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2013-2014 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:template name="init-d3charts">
  <script src="/js/d3.v3.js"></script>
  <script src="/js/d3.layout.cloud.js"></script>
  <script src="/js/d3.tip.js"></script>
  <script src="/js/gsa_graphics_base.js"></script>
  <script src="/js/gsa_bar_chart.js"></script>
  <script src="/js/gsa_bubble_chart.js"></script>
  <script src="/js/gsa_cloud_chart.js"></script>
  <script src="/js/gsa_donut_chart.js"></script>
  <script src="/js/gsa_gantt_chart.js"></script>
  <script src="/js/gsa_h_bar_chart.js"></script>
  <script src="/js/gsa_line_chart.js"></script>
  <script type="text/javascript">
    gsa.gsa_token = "<xsl:value-of select="gsa:escape-js (/envelope/params/token)"/>";

    if (gsa.dashboards === undefined) {
      gsa.dashboards = {};
    }

    if (gsa.data_sources === undefined) {
      gsa.data_sources = {}
    }

    gsa.severity_levels =
      {max_high : <xsl:value-of select="gsa:risk-factor-max-cvss ('high')"/>,
       min_high : <xsl:value-of select="gsa:risk-factor-min-cvss ('high')"/>,
       max_medium : <xsl:value-of select="gsa:risk-factor-max-cvss ('medium')"/>,
       min_medium : <xsl:value-of select="gsa:risk-factor-min-cvss ('medium')"/>,
       max_low : <xsl:value-of select="gsa:risk-factor-max-cvss ('low')"/>,
       min_low : <xsl:value-of select="gsa:risk-factor-min-cvss ('low')"/>,
       max_log : <xsl:value-of select="gsa:risk-factor-max-cvss ('log')"/>};
  </script>
</xsl:template>

<xsl:template name="js-tasks-data-source">
  <xsl:param name="data_source_name" select="'tasks-source'"/>
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  if (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"] == undefined)
    {
      gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"]
        =
        <xsl:choose>
          <xsl:when test="0">
          </xsl:when>
          <xsl:otherwise>
            DataSource ("get_tasks",
                        {xml:1,
                         ignore_pagination : 1,
                         schedules_only : 1,
                         filter: unescapeXML ("<xsl:value-of select="gsa:escape-js ($filter)"/>"),
                         filt_id:"<xsl:value-of select="gsa:escape-js ($filt_id)"/>"});
          </xsl:otherwise>
        </xsl:choose>
    }
</xsl:template>

<xsl:template name="js-tasks-chart-factory">
  <xsl:param name="chart_name" select="'aggregate-chart'"/>
  <xsl:param name="dashboard_name" select="'dashboard'"/>
  <xsl:param name="data_source_name" select="concat($chart_name, '-source')"/>
  <xsl:param name="generator_name" select="concat($chart_name, '-generator')"/>
  <xsl:param name="display_name" select="'chart-box'"/>

  <xsl:param name="chart_type"/>
  <xsl:param name="init_params" select="''"/>
  <xsl:param name="gen_params" select="''"/>

  <xsl:param name="chart_template"/>
  <xsl:param name="auto_load" select="0"/>

  <xsl:variable name="init_params_js">
    {
      <xsl:for-each select="exslt:node-set ($init_params)/params/param">
        "<xsl:value-of select="gsa:escape-js (@name)"/>" : unescapeXML ("<xsl:value-of select="gsa:escape-js (.)"/>")
        <xsl:if test="position() &lt; count(exslt:node-set ($init_params)/params/param)">, </xsl:if>
      </xsl:for-each>
    }
  </xsl:variable>

  <xsl:variable name="gen_params_js">
    {
      "extra" : {
        <xsl:for-each select="exslt:node-set ($gen_params)/params/param">
          "<xsl:value-of select="gsa:escape-js (@name)"/>" : unescapeXML ("<xsl:value-of select="gsa:escape-js (.)"/>")
          <xsl:if test="position() &lt; count(exslt:node-set ($gen_params)/params/param)">, </xsl:if>
        </xsl:for-each>
        }
    }
  </xsl:variable>

  <!-- Select selector label -->
  <xsl:variable name="selector_label">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        <xsl:value-of select="exslt:node-set ($init_params)/params/param[@name='title_text']"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="'Next scheduled tasks'"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Select title generator -->
  <xsl:variable name="title_generator">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        title_static (unescapeXML ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/> (Loading...)"), unescapeXML ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/>")
      </xsl:when>
      <xsl:otherwise>
        title_static ("Next scheduled tasks (Loading...)", "Next scheduled tasks")
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create chart generator -->
  <xsl:variable name="chart_generator">
    <xsl:choose>
      <xsl:when test="0">
      </xsl:when>
      <xsl:otherwise>
        GanttChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create basic chart -->
  gsa.dashboards ["<xsl:value-of select="gsa:escape-js ($dashboard_name)"/>"]
        .addControllerFactory
          ("<xsl:value-of select="gsa:escape-js ($chart_name)"/>",
           function (forComponent)
            {
              // Get and check DataSource
              var dataSource = gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"]
              if (dataSource == undefined)
                {
                  console.error ("Data source not found: <xsl:value-of select="gsa:escape-js ($data_source_name)"/>");
                }

              // Create generator
              // Basic generator
              var generator = <xsl:value-of select="$chart_generator"/>;

              // Create chart controller
              return ChartController(dataSource,
                            generator,
                            forComponent,
                            "<xsl:value-of select="gsa:escape-js ($chart_name)"/>",
                            unescapeXML ("<xsl:value-of select="gsa:escape-js ($selector_label)"/>"),
                            "/img/charts/severity-bar-chart.png",
                            "<xsl:value-of select="gsa:escape-js ($chart_type)"/>",
                            "<xsl:value-of select="gsa:escape-js ($chart_template)"/>",
                            <xsl:value-of select="$gen_params_js"/>,
                            <xsl:value-of select="$init_params_js"/>);
            });
</xsl:template>

<xsl:template name="js-scan-management-top-visualization">
  <xsl:param name="type" select="'task'"/>
  <xsl:param name="controllers_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">3d5db3c7-5208-4b47-8c28-48efc621b1e0</xsl:when>
      <xsl:when test="$type='report'">e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071</xsl:when>
      <xsl:when test="$type='result'">0b8ae70d-d8fc-4418-8a72-e65ac8d2828e</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="heights_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">ce8608af-7e66-45a8-aa8a-76def4f9f838</xsl:when>
      <xsl:when test="$type='report'">fc875cd4-16bf-42d1-98ed-c0c9bd6015cd</xsl:when>
      <xsl:when test="$type='result'">cb7db2fe-3fe4-4704-9fa1-efd4b9e522a8</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="default_controllers" select="'by-cvss|by-class'"/>
  <xsl:param name="default_heights" select="'280'"/>

  <xsl:variable name="controllers">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_controllers"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="heights">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_heights"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_tasks/get_tasks_response/filters/term | /envelope/get_reports/get_reports_response/filters/term | /envelope/get_results/get_results_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_tasks/get_tasks_response/filters/@id | /envelope/get_reports/get_reports_response/filters/@id |  /envelope/get_results/get_results_response/filters/@id"/>

  <div class="dashboard" id="top-dashboard"
    data-dashboard-name="top-dashboard"
    data-controllers="{$controllers}" data-heights="{$heights}"
    data-filter="{$filter}"
    data-controllers-pref-id="{$controllers_pref_id}"
    data-filters-id="{$filt_id}" data-heights-pref-id="{$heights_pref_id}"
    data-dashboard-controls="top-dashboard-controls"
    data-max-components="4">
    <div class="dashboard-data-source"
      data-source-name="severity-count-source"
      data-group-column="severity"
      data-aggregate-type="{$type}"
      data-filter="{$filter}"
      data-filter-id="{$filt_id}">
      <span class="dashboard-chart"
        data-chart-name="by-cvss"
        data-chart-type="bar"
        data-chart-template="info_by_cvss"/>
      <span class="dashboard-chart"
        data-chart-name="by-class"
        data-chart-type="donut"
        data-chart-template="info_by_class"/>
    </div>

    <xsl:if test="$type='task'">
      <div class="dashboard-data-source"
        data-source-name="task-status-count-source"
        data-aggregate-type="{$type}"
        data-group-column="status"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="by-task-status"
          data-chart-type="donut"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="task-high-results-source"
        data-aggregate-type="{$type}"
        data-group-column="uuid"
        data-columns="severity,high_per_host"
        data-text-columns="name"
        data-sort-field="high_per_host"
        data-sort-order="descending"
        data-sort-stat="max"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="by-high-results"
          data-chart-type="bubbles"
          data-x-field="name"
          data-y-fields="high_per_host_max"
          data-z-fields="severity_max"
          data-gen-params='{{"empty_text": "No Tasks with High severity found"}}'
          data-init-params='{{"title_text": "Tasks: High results per host"}}'/>
        <span class="dashboard-chart"
          data-chart-name="top-high-results"
          data-chart-type="horizontal_bar"
          data-x-field="name"
          data-y-fields="high_per_host_max"
          data-z-fields="severity_max"
          data-gen-params='{{"empty_text": "No Tasks with High severity found"}}'
          data-init-params='{{"title_text": "Tasks with most High results per host"}}'/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="task-schedules-source"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}"
        data-type="task">
        <span class="dashboard-chart"
          data-chart-name="task-schedules"
          data-chart-type="gantt"
          data-gen-params='{{"empty_text": "No scheduled Taks found"}}'/>
      </div>
    </xsl:if>
    <xsl:if test="$type='report'">
      <div class="dashboard-data-source"
        data-source-name="task-high-results-source"
        data-aggregate-type="{$type}"
        data-group-column="date"
        data-columns="high,high_per_host"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="report-high-results-timeline"
          data-chart-type="line"
          data-y-fields="high_max"
          data-z-fields="high_per_host_max"
          data-init-params='{{"title_text": "Reports: High results timeline"}}'
          data-gen-params='{{"show_stat_type": 0}}'/>
      </div>
    </xsl:if>
    <xsl:if test="$type='result'">
      <div class="dashboard-data-source"
        data-source-name="result-vuln-words-source"
        data-aggregate-type="{$type}"
        data-group-column="vulnerability"
        data-aggregate-mode="word_counts"
        data-sort-stat="count"
        data-sort-order="descending"
        data-max-groups="250"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="result-vuln-words"
          data-chart-type="cloud"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="result-desc-words-source"
        data-aggregate-type="{$type}"
        data-group-column="description"
        data-aggregate-mode="word_counts"
        data-sort-stat="count"
        data-sort-order="descending"
        data-max-groups="250"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="result-desc-words"
          data-chart-type="cloud"/>
      </div>
    </xsl:if>
  </div>
</xsl:template>

<xsl:template name="js-secinfo-top-visualization">
  <xsl:param name="type" select="'nvt'"/>
  <xsl:param name="controllers_pref_id">
    <xsl:choose>
      <xsl:when test="$type='nvt'">f68d9369-1945-477b-968f-121c6029971b</xsl:when>
      <xsl:when test="$type='cve'">815ddd2e-8654-46c7-a05b-d73224102240</xsl:when>
      <xsl:when test="$type='cpe'">9cff9b4d-b164-43ce-8687-f2360afc7500</xsl:when>
      <xsl:when test="$type='ovaldef'">9563efc0-9f4e-4d1f-8f8d-0205e32b90a4</xsl:when>
      <xsl:when test="$type='cert_bund_adv'">a6946f44-480f-4f37-8a73-28a4cd5310c4</xsl:when>
      <xsl:when test="$type='dfn_cert_adv'">9812ea49-682d-4f99-b3cc-eca051d1ce59</xsl:when>
      <xsl:when test="$type='allinfo'">4c7b1ea7-b7e6-4d12-9791-eb9f72b6f864</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="heights_pref_id">
    <xsl:choose>
      <xsl:when test="$type='nvt'">af89a84a-d3ec-43a8-97a8-aa688bf093bc</xsl:when>
      <xsl:when test="$type='cve'">418a5746-d68a-4a2d-864a-0da993b32220</xsl:when>
      <xsl:when test="$type='cpe'">629fdb73-35fa-4247-9018-338c202f7c03</xsl:when>
      <xsl:when test="$type='ovaldef'">fe1610a3-4e87-4b0d-9b7a-f0f66fef586b</xsl:when>
      <xsl:when test="$type='cert_bund_adv'">469d50da-880a-4bfc-88ed-22e53764c683</xsl:when>
      <xsl:when test="$type='dfn_cert_adv'">72014b52-4389-435d-9438-8c13601ecbd2</xsl:when>
      <xsl:when test="$type='allinfo'">985f38eb-1a30-4a35-abb6-3eec05b5d54a</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="default_controllers" select="'by-cvss|by-class'"/>
  <xsl:param name="default_heights" select="'280'"/>

  <xsl:variable name="controllers">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_controllers"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="heights">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]">
        <xsl:value-of select="gsa:escape-js (/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]/value)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_heights"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_info/get_info_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_info/get_info_response/filters/@id"/>

  <div class="dashboard" id="top-dashboard"
    data-dashboard-name="top-dashboard"
    data-controllers="{$controllers}" data-heights="{$heights}"
    data-filter="{$filter}"
    data-controllers-pref-id="{$controllers_pref_id}"
    data-filters-id="{$filt_id}" data-heights-pref-id="{$heights_pref_id}"
    data-dashboard-controls="top-dashboard-controls"
    data-max-components="4">
    <div class="dashboard-data-source"
      data-source-name="severity-count-source"
      data-aggregate-type="{$type}"
      data-group-column="severity"
      data-filter="{$filter}"
      data-filter-id="{$filt_id}">
      <span class="dashboard-chart"
        data-chart-name="by-cvss"
        data-chart-type="bar"
        data-chart-template="info_by_cvss"/>
      <span class="dashboard-chart"
        data-chart-name="by-class"
        data-chart-type="donut"
        data-chart-template="info_by_class"/>
    </div>
    <div class="dashboard-data-source"
      data-source-name="created-count-source"
      data-aggregate-type="{$type}"
      data-group-column="created"
      data-filter="{$filter}"
      data-filter-id="{$filt_id}">
      <span class="dashboard-chart"
        data-chart-name="by-created"
        data-chart-type="line"/>
    </div>
    <xsl:if test="$type = 'nvt'">
      <div class="dashboard-data-source"
        data-source-name="nvt-by-family-source"
        data-aggregate-type="{$type}"
        data-group-column="family"
        data-column="severity"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="nvt-by-family"
          data-chart-type="bubbles"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="nvt-by-solution_type-source"
        data-aggregate-type="{$type}"
        data-group-column="solution_type"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="nvt-by-solution_type"
          data-chart-type="donut"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="nvt-by-qod_type-source"
        data-aggregate-type="{$type}"
        data-group-column="qod_type"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="nvt-by-qod_type"
          data-chart-template="qod_type_counts"
          data-chart-type="donut"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="nvt-by-qod-source"
        data-aggregate-type="{$type}"
        data-group-column="qod"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="nvt-by-qod"
          data-chart-template="percentage_counts"
          data-chart-type="donut"/>
      </div>
    </xsl:if>
    <xsl:if test="$type = 'ovaldef'">
      <div class="dashboard-data-source"
        data-source-name="ovaldef-by-class-source"
        data-aggregate-type="{$type}"
        data-group-column="class"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="by-oval-class"
          data-chart-type="donut"/>
      </div>
    </xsl:if>
    <xsl:if test="$type = 'allinfo'">
      <div class="dashboard-data-source"
        data-source-name="allinfo-by-type-source"
        data-aggregate-type="{$type}"
        data-group-column="type"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="by-info-type"
          data-chart-template="resource_type_counts"
          data-chart-type="donut"/>
      </div>
    </xsl:if>
  </div>
</xsl:template>

<xsl:template match="dashboard">
  <noscript>
    <div class="gb_window">
      <div class="gb_window_part_left_error"></div>
      <div class="gb_window_part_right_error"></div>
      <div class="gb_window_part_center_error">
        <xsl:value-of select="'JavaScript required'"/>
      </div>
      <div class="gb_window_part_content">
        <xsl:value-of select="'The Dashboard requires JavaScript. Please make sure JavaScript is supported by your browser and enabled.'"/>
      </div>
    </div>
  </noscript>

  <xsl:choose>
    <xsl:when test="name='' or name='secinfo'">
      <xsl:apply-templates select="." mode="secinfo"/>
    </xsl:when>
    <xsl:otherwise>
      <div class="gb_window">
        <div class="gb_window_part_left_error"></div>
        <div class="gb_window_part_right_error"></div>
        <div class="gb_window_part_center_error">
          <xsl:value-of select="'Dashboard not found'"/>
        </div>
        <div class="gb_window_part_content">
          <xsl:value-of select="concat('No dashboard named &quot;', name,'&quot; was found')"/>
        </div>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="dashboard" mode="secinfo">
  <xsl:variable name="filters" select="get_filters_response/filter[type='SecInfo' or type='']"/>
  <xsl:variable name="default_controllers" select="'nvt_bar_chart|nvt_donut_chart#cve_bar_chart|cve_donut_chart'"/>
  <xsl:variable name="default_heights" select="'280#280'"/>
  <xsl:variable name="default_filters" select="'|#|'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <xsl:variable name="controllers_pref_id" select="'84ab32da-fe69-44d8-8a8f-70034cf28d4e'"/>
  <xsl:variable name="heights_pref_id" select="'42d48049-3153-43bf-b30d-72ca5ab1eb49'"/>
  <xsl:variable name="filters_pref_id" select="'517d0efe-426e-49a9-baa7-eda2832c93e8'"/>

  <xsl:variable name="controllers">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_controllers"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="heights">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]">
        <xsl:value-of select="gsa:escape-js (/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]/value)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_heights"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="filters_string">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $filters_pref_id]">
        <xsl:value-of select="gsa:escape-js (/envelope/chart_preferences/chart_preference[@id = $filters_pref_id]/value)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_filters"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <div class="section-header">
    <h1>
      <img class="icon icon-lg" src="/img/allinfo.svg" alt="SecInfo Dashboard"/>
      <xsl:value-of select="gsa:i18n ('SecInfo Dashboard', 'Dashboard')"/>
    </h1>
  </div>
  <div class="section-box">
    <div id="secinfo-dashboard-controls" style="text-align:right;">
    </div>
    <div id="secinfo-dashboard" class="dashboard" data-dashboard-name="secinfo-dashboard"
      data-controllers="{$controllers}" data-heights="{$heights}"
      data-filters-string="{$filters_string}" data-controllers-pref-id="{$controllers_pref_id}"
      data-filters-pref-id="{$filters_pref_id}" data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="nvt_bar_chart"
      data-dashboard-controls="secinfo-dashboard-controls"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>
      <!-- NVTs -->
      <div class="dashboard-data-source"
        data-source-name="nvt_severity_src"
        data-aggregate-type="nvt"
        data-group-column="severity">
        <span class="dashboard-chart"
          data-chart-name="nvt_bar_chart"
          data-chart-type="bar"
          data-chart-template="info_by_cvss"/>
        <span class="dashboard-chart"
          data-chart-name="nvt_donut_chart"
          data-chart-type="donut"
          data-chart-template="info_by_class"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="nvt_timeline_src"
        data-aggregate-type="nvt"
        data-group-column="created">
        <span class="dashboard-chart"
          data-chart-name="nvt_timeline_chart"
          data-chart-type="line"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="nvt_families_src"
        data-aggregate-type="nvt"
        data-group-column="family"
        data-column="severity">
        <span class="dashboard-chart"
          data-chart-name="nvt_bubble_chart"
          data-chart-type="bubbles"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="nvt_qod_type_src"
        data-aggregate-type="nvt"
        data-group-column="qod_type">
        <span class="dashboard-chart"
          data-chart-name="nvt_qod_type"
          data-chart-type="donut"
          data-chart-template="qod_type_counts"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="nvt_qod_src"
        data-aggregate-type="nvt"
        data-group-column="qod">
        <span class="dashboard-chart"
          data-chart-name="nvt_qod"
          data-chart-type="donut"
          data-chart-template="percentage_counts"/>
      </div>

      <!-- CVEs -->
      <div class="dashboard-data-source"
        data-source-name="cve_severity_src"
        data-aggregate-type="cve"
        data-group-column="severity">
        <span class="dashboard-chart"
          data-chart-name="cve_bar_chart"
          data-chart-type="bar"
          data-chart-template="info_by_cvss"/>
        <span class="dashboard-chart"
          data-chart-name="cve_donut_chart"
          data-chart-type="donut"
          data-chart-template="info_by_class"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="cve_timeline_src"
        data-aggregate-type="cve"
        data-group-column="created">
        <span class="dashboard-chart"
          data-chart-name="cve_timeline_chart"
          data-chart-type="line"/>
      </div>

      <!-- CPEs -->
      <div class="dashboard-data-source"
        data-source-name="cpe_severity_src"
        data-aggregate-type="cpe"
        data-group-column="severity">
        <span class="dashboard-chart"
          data-chart-name="cpe_bar_chart"
          data-chart-type="bar"
          data-chart-template="info_by_cvss"/>
        <span class="dashboard-chart"
          data-chart-name="cpe_donut_chart"
          data-chart-type="donut"
          data-chart-template="info_by_class"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="cpe_timeline_src"
        data-aggregate-type="cpe"
        data-group-column="created">
        <span class="dashboard-chart"
          data-chart-name="cpe_timeline_chart"
          data-chart-type="line"/>
      </div>

      <!-- OVAL Definitions -->
      <div class="dashboard-data-source"
        data-source-name="ovaldef_severity_src"
        data-aggregate-type="ovaldef"
        data-group-column="severity">
        <span class="dashboard-chart"
          data-chart-name="ovaldef_bar_chart"
          data-chart-type="bar"
          data-chart-template="info_by_cvss"/>
        <span class="dashboard-chart"
          data-chart-name="ovaldef_donut_chart"
          data-chart-type="donut"
          data-chart-template="info_by_class"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="ovaldef_timeline_src"
        data-aggregate-type="ovaldef"
        data-group-column="created">
        <span class="dashboard-chart"
          data-chart-name="ovaldef_timeline_chart"
          data-chart-type="line"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="ovaldef_class_src"
        data-aggregate-type="ovaldef"
        data-group-column="class">
        <span class="dashboard-chart"
          data-chart-name="ovaldef_class_donut_chart"
          data-chart-type="donut"/>
      </div>

      <!-- CERT Bund -->
      <div class="dashboard-data-source"
        data-source-name="cert_bund_adv_severity_src"
        data-group-column="severity"
        data-aggregate-type="cert_bund_adv">
        <span class="dashboard-chart"
          data-chart-name="cert_bund_adv_bar_chart"
          data-chart-template="info_by_cvss"
          data-chart-type="bar"/>
        <span class="dashboard-chart"
          data-chart-name="cert_bund_adv_donut_chart"
          data-chart-template="info_by_class"
          data-chart-type="donut"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="cert_bund_adv_timeline_src"
        data-aggregate-type="cert_bund_adv"
        data-group-column="created">
        <span class="dashboard-chart"
          data-chart-name="cert_bund_adv_timeline_chart"
          data-chart-type="line"/>
      </div>

      <!-- DFN CERT -->
      <div class="dashboard-data-source"
        data-source-name="dfn_cert_adv_severity_src"
        data-aggregate-type="dfn_cert_adv"
        data-group-column="severity">
        <span class="dashboard-chart"
          data-chart-name="dfn_cert_adv_bar_chart"
          data-chart-type="bar"
          data-chart-template="info_by_cvss"/>
        <span class="dashboard-chart"
          data-chart-name="dfn_cert_adv_donut_chart"
          data-chart-type="donut"
          data-chart-template="info_by_class"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="dfn_cert_adv_timeline_src"
        data-aggregate-type="dfn_cert_adv"
        data-group-column="created">
        <span class="dashboard-chart"
          data-chart-name="dfn_cert_adv_timeline_chart"
          data-chart-type="line"/>
      </div>

      <!-- All SecInfo -->
      <div class="dashboard-data-source"
        data-source-name="allinfo_severity_src"
        data-aggregate-type="allinfo"
        data-group-column="severity">
        <span class="dashboard-chart"
          data-chart-name="allinfo_chart"
          data-chart-type="bar"
          data-chart-template="info_by_cvss"/>
        <span class="dashboard-chart"
          data-chart-name="allinfo_donut_chart"
          data-chart-type="donut"
          data-chart-template="info_by_class"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="allinfo_timeline_src"
        data-aggregate-type="allinfo"
        data-group-column="created">
        <span class="dashboard-chart"
          data-chart-name="allinfo_timeline_chart"
          data-chart-type="line"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="allinfo_by_info_type_src"
        data-aggregate-type="allinfo"
        data-group-column="type">
        <span class="dashboard-chart"
          data-chart-name="allinfo_by_info_type"
          data-chart-type="donut"
          data-chart-template="resource_type_counts"/>
      </div>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
  <!-- TODO: Update data sources to support multiple filters and
             add filter selection to chart boxes again -->
</xsl:template>

</xsl:stylesheet>
