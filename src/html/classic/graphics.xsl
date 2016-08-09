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
Björn Ricks <bjoern.ricks@greenbone.net>

Copyright:
Copyright (C) 2013-2016 Greenbone Networks GmbH

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
  <script src="/js/gsa_chart_helpers.js"></script>
  <script src="/js/gsa_graphics_base.js"></script>
  <script src="/js/gsa_dashboard.js"></script>
  <script src="/js/gsa_bar_chart.js"></script>
  <script src="/js/gsa_bubble_chart.js"></script>
  <script src="/js/gsa_cloud_chart.js"></script>
  <script src="/js/gsa_donut_chart.js"></script>
  <script src="/js/gsa_gantt_chart.js"></script>
  <script src="/js/gsa_h_bar_chart.js"></script>
  <script src="/js/gsa_line_chart.js"></script>
  <script src="/js/gsa_topology_chart.js"></script>
  <script type="text/javascript">
    gsa.gsa_token = "<xsl:value-of select="gsa:escape-js (/envelope/params/token)"/>";

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

<xsl:template name="js-scan-management-top-visualization">
  <xsl:param name="type" select="'task'"/>
  <!-- Setting UUIDs for chart selection preferences -->
  <xsl:param name="controllers_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">3d5db3c7-5208-4b47-8c28-48efc621b1e0</xsl:when>
      <xsl:when test="$type='report'">e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071</xsl:when>
      <xsl:when test="$type='result'">0b8ae70d-d8fc-4418-8a72-e65ac8d2828e</xsl:when>
    </xsl:choose>
  </xsl:param>
  <!-- Setting UUIDs for dashboard row height preferences -->
  <xsl:param name="heights_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">ce8608af-7e66-45a8-aa8a-76def4f9f838</xsl:when>
      <xsl:when test="$type='report'">fc875cd4-16bf-42d1-98ed-c0c9bd6015cd</xsl:when>
      <xsl:when test="$type='result'">cb7db2fe-3fe4-4704-9fa1-efd4b9e522a8</xsl:when>
    </xsl:choose>
  </xsl:param>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:param name="default_controllers">
    <xsl:choose>
      <xsl:when test="$type='task'">by-class|top-high-results|by-task-status</xsl:when>
      <xsl:when test="$type='report'">by-class|report-high-results-timeline|by-cvss</xsl:when>
      <xsl:when test="$type='result'">by-class|result-vuln-words|by-cvss</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>by-cvss|by-class</xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:param name="default_heights">
    <xsl:choose>
      <xsl:when test="$type='task'">280</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>280</xsl:otherwise>
    </xsl:choose>
  </xsl:param>

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
    data-filter="{$filter}"
    data-filters-id="{$filt_id}"
    data-controllers="{$controllers}"
    data-heights="{$heights}"
    data-default-controllers="{$default_controllers}"
    data-default-heights="{$default_heights}"
    data-controllers-pref-id="{$controllers_pref_id}"
    data-heights-pref-id="{$heights_pref_id}"
    data-dashboard-controls="top-dashboard-controls"
    data-no-chart-links="{/envelope/params/no_chart_links}"
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
        data-text-columns="name,modified"
        data-sort-fields="high_per_host,modified"
        data-sort-orders="descending,descending"
        data-sort-stats="max,value"
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
          data-gen-params='{{"empty_text": "No scheduled Tasks found"}}'/>
      </div>
    </xsl:if>
    <xsl:if test="$type='report'">
      <div class="dashboard-data-source"
        data-source-name="report-high-results-timeline-source"
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
      <div class="dashboard-data-source"
        data-source-name="report-duration-timeline-source"
        data-aggregate-type="{$type}"
        data-group-column="date"
        data-columns="duration,duration_per_host"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="report-duration-timeline"
          data-chart-type="line"
          data-y-fields="duration_mean,duration_max"
          data-z-fields="duration_per_host_mean,duration_per_host_max"
          data-init-params='{{"title_text": "Reports: Duration timeline"}}'
          data-gen-params='{{"show_stat_type": 0, "y_format": "duration", "y2_format": "duration"}}'/>
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

<xsl:template name="js-assets-top-visualization">
  <xsl:param name="type" select="'host'"/>
  <!-- Setting UUIDs for chart selection preferences -->
  <xsl:param name="controllers_pref_id">
    <xsl:choose>
      <xsl:when test="$type='host'">d3f5f2de-a85b-43f2-a817-b127457cc8ba</xsl:when>
      <xsl:when test="$type='os'">e93b51ed-5881-40e0-bc4f-7d3268a36177</xsl:when>
    </xsl:choose>
  </xsl:param>
  <!-- Setting UUIDs for dashboard row height preferences -->
  <xsl:param name="heights_pref_id">
    <xsl:choose>
      <xsl:when test="$type='host'">1cef4fae-57a6-4c1d-856c-0368ead863d4</xsl:when>
      <xsl:when test="$type='os'">3006052f-3f28-419b-bffa-65b41605d5c3</xsl:when>
    </xsl:choose>
  </xsl:param>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:param name="default_controllers">
    <xsl:choose>
      <xsl:when test="$type='host'">by-class|hosts-topology|host-counts-timeline</xsl:when>
      <xsl:when test="$type='os'">by-class|most-vulnerable-oss|by-cvss</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>by-cvss|by-class</xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:param name="default_heights">
    <xsl:choose>
      <xsl:when test="$type='host'">280</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>280</xsl:otherwise>
    </xsl:choose>
  </xsl:param>

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

  <xsl:variable name="filter" select="/envelope/get_assets/get_assets_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_assets/get_assets_response/filters/@id"/>

  <div class="dashboard" id="top-dashboard"
    data-dashboard-name="top-dashboard"
    data-filter="{$filter}"
    data-filters-id="{$filt_id}"
    data-controllers="{$controllers}"
    data-heights="{$heights}"
    data-default-controllers="{$default_controllers}"
    data-default-heights="{$default_heights}"
    data-controllers-pref-id="{$controllers_pref_id}"
    data-heights-pref-id="{$heights_pref_id}"
    data-dashboard-controls="top-dashboard-controls"
    data-no-chart-links="{/envelope/params/no_chart_links}"
    data-max-components="4">
    <xsl:if test="$type = 'host'">
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
      <div class="dashboard-data-source"
        data-source-name="most-vulnerable-hosts-source"
        data-aggregate-type="{$type}"
        data-group-column="uuid"
        data-columns="severity"
        data-text-columns="name,modified"
        data-sort-fields="severity,modified"
        data-sort-orders="descending,descending"
        data-sort-stats="max,value"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="most-vulnerable-hosts"
          data-chart-type="horizontal_bar"
          data-x-field="name"
          data-y-fields="severity_max"
          data-z-fields="severity_max"
          data-gen-params='{{"empty_text": "No vulnerable Hosts found",
                             "extra_tooltip_field_1": "modified",
                             "extra_tooltip_label_1": "Updated" }}'
          data-init-params='{{"title_text": "Most vulnerable hosts"}}'/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="host-counts-timeline-source"
        data-aggregate-type="{$type}"
        data-group-column="modified"
        data-subgroup-column="severity_level"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="host-counts-timeline"
          data-y-fields="c_count,c_count[High]"
          data-z-fields="count,count[High]"
          data-chart-type="line"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="hosts-topology-source"
        data-aggregate-type="{$type}"
        data-type="host"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="hosts-topology"
          data-chart-type="topology"/>
      </div>
    </xsl:if>
    <xsl:if test="$type = 'os'">
      <div class="dashboard-data-source"
        data-source-name="average-severity-count-source"
        data-group-column="average_severity"
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
      <div class="dashboard-data-source"
        data-source-name="most-vulnerable-oss-source"
        data-aggregate-type="{$type}"
        data-group-column="uuid"
        data-columns="average_severity,average_severity_score,hosts"
        data-text-columns="name,modified"
        data-sort-fields="average_severity_score,modified"
        data-sort-orders="descending,descending"
        data-sort-stats="max,value"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="most-vulnerable-oss"
          data-chart-type="horizontal_bar"
          data-x-field="name"
          data-y-fields="average_severity_score_max"
          data-z-fields="average_severity_max"
          data-gen-params='{{"empty_text": "No vulnerable Operating Systems found",
                             "score_severity" : "average_severity_max",
                             "score_assets" : "hosts_max",
                             "score_asset_type" : "hosts",
                             "extra_tooltip_field_1": "modified",
                             "extra_tooltip_label_1": "Updated"}}'
          data-init-params='{{"title_text": "Operating Systems by Vulnerability Score"}}'/>
      </div>
    </xsl:if>
  </div>
</xsl:template>

<xsl:template name="js-secinfo-top-visualization">
  <xsl:param name="type" select="'nvt'"/>
  <!-- Setting UUIDs for chart selection preferences -->
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
  <!-- Setting UUIDs for dashboard row height preferences -->
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
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:param name="default_controllers">
    <xsl:choose>
      <xsl:when test="$type='allinfo'"></xsl:when>
      <xsl:when test="$type='nvt'">by-class|by-created|nvt-by-family</xsl:when>
      <xsl:when test="$type='ovaldef'">by-class|by-created|by-oval-class</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>by-class|by-created|by-cvss</xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:param name="default_heights">
    <xsl:choose>
      <xsl:when test="$type='allinfo'"></xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>280</xsl:otherwise>
    </xsl:choose>
  </xsl:param>

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
    data-filter="{$filter}"
    data-filters-id="{$filt_id}"
    data-controllers="{$controllers}"
    data-heights="{$heights}"
    data-default-controllers="{$default_controllers}"
    data-default-heights="{$default_heights}"
    data-controllers-pref-id="{$controllers_pref_id}"
    data-heights-pref-id="{$heights_pref_id}"
    data-dashboard-controls="top-dashboard-controls"
    data-no-chart-links="{/envelope/params/no_chart_links}"
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

<xsl:template name="js-notes-top-visualization">
  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="controllers_pref_id" select="'ce7b121-c609-47b0-ab57-fd020a0336f4'"/>
  <!-- Setting UUIDs for row height preferences -->
  <xsl:variable name="heights_pref_id" select="'05eb63e9-ccd7-481d-841d-9406d3281040'"/>

  <xsl:variable name="default_controllers" select="'notes_donut_chart|by-created|notes-text-words'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280'"/>

  <xsl:variable name="envelope" select="/envelope"/>

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

  <xsl:variable name="filter" select="/envelope/get_notes/get_notes_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_notes/get_notes_response/filters/@id"/>

  <div class="section-box">
    <div id="top-notes-dashboard">
    </div>
    <div class="dashboard" id="top-dashboard"
      data-dashboard-name="top-notes-dashboard"
      data-filter="{$filter}"
      data-filters-id="{$filt_id}"
      data-controllers="{$controllers}"
      data-heights="{$heights}"
      data-default-controllers="{$default_controllers}"
      data-default-heights="{$default_heights}"
      data-controllers-pref-id="{$controllers_pref_id}"
      data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="notes_donut_chart"
      data-dashboard-controls="top-dashboard-controls"
      data-max-components="4">
      <div class="dashboard-data-source"
        data-source-name="notes-created-count-src"
        data-aggregate-type="note"
        data-aggregate-mode="count"
        data-group-column="created"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="by-created"
          data-chart-type="line"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="notes-text-words-src"
        data-aggregate-type="note"
        data-group-column="text"
        data-aggregate-mode="word_counts"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="notes-text-words"
          data-chart-type="cloud"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="notes-status-src"
        data-aggregate-type="note"
        data-group-column="active_days"
        data-sort-stat="count"
        data-sort-order="descending"
        data-max-groups="250"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="notes_donut_chart"
          data-chart-template="active_status"
          data-chart-type="donut"/>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="js-overrides-top-visualization">
  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="controllers_pref_id" select="'054862fe-0781-4527-b1aa-2113bcd16ce7'"/>
  <!-- Setting UUIDs for row height preferences -->
  <xsl:variable name="heights_pref_id" select="'a8c246f9-0506-4d8d-be35-a3befb22fbca'"/>

  <xsl:variable name="default_controllers" select="'overrides_donut_chart|by-created|overrides-text-words'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280'"/>

  <xsl:variable name="envelope" select="/envelope"/>

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

  <xsl:variable name="filter" select="/envelope/get_overrides/get_overrides_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_overrides/get_overrides_response/filters/@id"/>

  <div class="section-box">
    <div id="top-overrides-dashboard">
    </div>
    <div class="dashboard" id="top-dashboard"
      data-dashboard-name="top-overrides-dashboard"
      data-filter="{$filter}"
      data-filters-id="{$filt_id}"
      data-controllers="{$controllers}"
      data-heights="{$heights}"
      data-default-controllers="{$default_controllers}"
      data-default-heights="{$default_heights}"
      data-controllers-pref-id="{$controllers_pref_id}"
      data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="overrides_donut_chart"
      data-dashboard-controls="top-dashboard-controls"
      data-max-components="4">
      <div class="dashboard-data-source"
        data-source-name="overrides-created-count-src"
        data-aggregate-type="override"
        data-aggregate-mode="count"
        data-group-column="created"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="by-created"
          data-chart-type="line"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="overrides-text-words-src"
        data-aggregate-type="override"
        data-group-column="text"
        data-aggregate-mode="word_counts"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="overrides-text-words"
          data-chart-type="cloud"/>
      </div>
      <div class="dashboard-data-source"
        data-source-name="overrides-status-src"
        data-aggregate-type="override"
        data-group-column="active_days"
        data-sort-stat="count"
        data-sort-order="descending"
        data-max-groups="250"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="overrides_donut_chart"
          data-chart-template="active_status"
          data-chart-type="donut"/>
      </div>
    </div>
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

  <xsl:if test="secinfo_test/get_info_response/@status != 200">
    <div>
      <xsl:call-template name="error_window">
        <xsl:with-param name="heading">Warning: SecInfo Database Missing</xsl:with-param>
        <xsl:with-param name="message">
          SCAP and/or CERT database missing on OMP server.
          <a href="/help/cpes.html?token={/envelope/token}#secinfo_missing"
              title="Help: SecInfo database missing" class="icon icon-sm">
            <img src="/img/help.svg"/>
          </a>
        </xsl:with-param>
      </xsl:call-template>
    </div>
  </xsl:if>

  <xsl:choose>
    <xsl:when test="name='' or name='main'">
      <xsl:apply-templates select="." mode="main"/>
    </xsl:when>
    <xsl:when test="name='scans'">
      <xsl:apply-templates select="." mode="scans"/>
    </xsl:when>
    <xsl:when test="name='assets'">
      <xsl:apply-templates select="." mode="assets"/>
    </xsl:when>
    <xsl:when test="name='secinfo'">
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

<xsl:template match="dashboard" mode="main">
  <xsl:variable name="filters" select="get_filters_response/filter"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'tasks-by-class|by-task-status#cve_timeline_chart|hosts-topology|nvt_donut_chart'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#|'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="controllers_pref_id" select="'d97eca9f-0386-4e5d-88f2-0ed7f60c0646'"/>
  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="filters_pref_id" select="'8190fe85-3bc3-47fb-a9d4-bf1c8fcaa79c'"/>
  <!-- Setting UUIDs for row height preferences -->
  <xsl:variable name="heights_pref_id" select="'fdde8a8a-0d10-491c-8eb0-46eb0792b417'"/>

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
      <img class="icon icon-lg" src="/img/dashboard.svg" alt="Dashboard"/>
      <xsl:value-of select="gsa:i18n ('Dashboard', 'Dashboard')"/>
    </h1>
    <div id="main-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="main-dashboard" class="dashboard" data-dashboard-name="main-dashboard"
      data-controllers="{$controllers}"
      data-filters-string="{$filters_string}"
      data-heights="{$heights}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-controllers-pref-id="{$controllers_pref_id}"
      data-filters-pref-id="{$filters_pref_id}"
      data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="tasks-by-class"
      data-dashboard-controls="main-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="scans-dashboard-data"/>
      <xsl:call-template name="assets-dashboard-data"/>
      <xsl:call-template name="secinfo-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

<xsl:template name="scans-dashboard-data">
  <!-- Tasks -->
  <div class="dashboard-data-source"
    data-source-name="tasks-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="task">
    <span class="dashboard-chart"
      data-chart-name="tasks-by-cvss"
      data-chart-type="bar"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="tasks-by-class"
      data-chart-type="donut"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="task-status-count-source"
    data-aggregate-type="task"
    data-group-column="status">
    <span class="dashboard-chart"
      data-chart-name="by-task-status"
      data-chart-type="donut"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="task-high-results-source"
    data-aggregate-type="task"
    data-group-column="uuid"
    data-columns="severity,high_per_host"
    data-text-columns="name,modified"
    data-sort-fields="high_per_host,modified"
    data-sort-orders="descending,descending"
    data-sort-stats="max,value">
    <span class="dashboard-chart"
      data-chart-name="tasks-by-high-results"
      data-chart-type="bubbles"
      data-x-field="name"
      data-y-fields="high_per_host_max"
      data-z-fields="severity_max"
      data-gen-params='{{"empty_text": "No Tasks with High severity found"}}'
      data-init-params='{{"title_text": "Tasks: High results per host"}}'/>
    <span class="dashboard-chart"
      data-chart-name="tasks-top-high-results"
      data-chart-type="horizontal_bar"
      data-x-field="name"
      data-y-fields="high_per_host_max"
      data-z-fields="severity_max"
      data-gen-params='{{"empty_text": "No Tasks with High severity found"}}'
      data-init-params='{{"title_text": "Tasks with most High results per host"}}'/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="task-schedules-source"
    data-type="task">
    <span class="dashboard-chart"
      data-chart-name="task-schedules"
      data-chart-type="gantt"
      data-gen-params='{{"empty_text": "No scheduled Tasks found"}}'/>
  </div>

  <!-- Reports -->
  <div class="dashboard-data-source"
    data-source-name="reports-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="report">
    <span class="dashboard-chart"
      data-chart-name="reports-by-cvss"
      data-chart-type="bar"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="reports-by-class"
      data-chart-type="donut"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="report-high-results-timeline-source"
    data-aggregate-type="report"
    data-group-column="date"
    data-columns="high,high_per_host">
    <span class="dashboard-chart"
      data-chart-name="report-high-results-timeline"
      data-chart-type="line"
      data-y-fields="high_max"
      data-z-fields="high_per_host_max"
      data-init-params='{{"title_text": "Reports: High results timeline"}}'
      data-gen-params='{{"show_stat_type": 0}}'/>
  </div>

  <!-- Results -->
  <div class="dashboard-data-source"
    data-source-name="results-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="result">
    <span class="dashboard-chart"
      data-chart-name="results-by-cvss"
      data-chart-type="bar"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="results-by-class"
      data-chart-type="donut"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="result-vuln-words-source"
    data-aggregate-type="result"
    data-group-column="vulnerability"
    data-aggregate-mode="word_counts"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250">
    <span class="dashboard-chart"
      data-chart-name="result-vuln-words"
      data-chart-type="cloud"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="result-desc-words-source"
    data-aggregate-type="result"
    data-group-column="description"
    data-aggregate-mode="word_counts"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250">
    <span class="dashboard-chart"
      data-chart-name="result-desc-words"
      data-chart-type="cloud"/>
  </div>

  <!-- Notes -->
  <div class="dashboard-data-source"
    data-source-name="notes-created-count-src"
    data-aggregate-type="note"
    data-aggregate-mode="count"
    data-group-column="created">
    <span class="dashboard-chart"
      data-chart-name="notes-by-created"
      data-chart-type="line"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="notes-text-words-src"
    data-aggregate-type="note"
    data-group-column="text"
    data-aggregate-mode="word_counts">
    <span class="dashboard-chart"
      data-chart-name="notes-text-words"
      data-chart-type="cloud"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="notes-status-src"
    data-aggregate-type="note"
    data-group-column="active_days"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250">
    <span class="dashboard-chart"
      data-chart-name="notes_donut_chart"
      data-chart-template="active_status"
      data-chart-type="donut"/>
  </div>

  <!-- Overrides -->
  <div class="dashboard-data-source"
    data-source-name="overrides-created-count-src"
    data-aggregate-type="override"
    data-aggregate-mode="count"
    data-group-column="created">
    <span class="dashboard-chart"
      data-chart-name="overrides-by-created"
      data-chart-type="line"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="overrides-text-words-src"
    data-aggregate-type="override"
    data-group-column="text"
    data-aggregate-mode="word_counts">
    <span class="dashboard-chart"
      data-chart-name="overrides-text-words"
      data-chart-type="cloud"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="overrides-status-src"
    data-aggregate-type="override"
    data-group-column="active_days"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250">
    <span class="dashboard-chart"
      data-chart-name="overrides_donut_chart"
      data-chart-template="active_status"
      data-chart-type="donut"/>
  </div>
</xsl:template>

<xsl:template match="dashboard" mode="scans">
  <xsl:variable name="filters" select="get_filters_response/filter"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'results-by-class|reports-by-class#by-task-status|report-high-results-timeline|tasks-by-class'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#||'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="controllers_pref_id" select="'c7584d7c-649f-4f8b-9ded-9e1dc20f24c8'"/>
  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="filters_pref_id" select="'39311e88-0d10-4a46-bc0c-5becd034667b'"/>
  <!-- Setting UUIDs for row height preferences -->
  <xsl:variable name="heights_pref_id" select="'fd846514-cfb1-48b1-8deb-0cf3b5eaedcd'"/>

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
      <img class="icon icon-lg" src="/img/scan.svg" alt="Scans Dashboard"/>
      <xsl:value-of select="gsa:i18n ('Scans Dashboard', 'Dashboard')"/>
    </h1>
    <div id="scans-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="scans-dashboard" class="dashboard" data-dashboard-name="scans-dashboard"
      data-controllers="{$controllers}"
      data-filters-string="{$filters_string}"
      data-heights="{$heights}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-controllers-pref-id="{$controllers_pref_id}"
      data-filters-pref-id="{$filters_pref_id}"
      data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="tasks-by-class"
      data-dashboard-controls="scans-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="scans-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

<xsl:template name="assets-dashboard-data">
  <!-- Hosts -->
  <div class="dashboard-data-source"
    data-source-name="hosts-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="host">
    <span class="dashboard-chart"
      data-chart-name="hosts-by-cvss"
      data-chart-type="bar"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="hosts-by-class"
      data-chart-type="donut"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="most-vulnerable-hosts-source"
    data-aggregate-type="host"
    data-group-column="uuid"
    data-columns="severity"
    data-text-columns="name,modified"
    data-sort-fields="severity,modified"
    data-sort-orders="descending,descending"
    data-sort-stats="max,value">
    <span class="dashboard-chart"
      data-chart-name="most-vulnerable-hosts"
      data-chart-type="horizontal_bar"
      data-x-field="name"
      data-y-fields="severity_max"
      data-z-fields="severity_max"
      data-gen-params='{{"empty_text": "No vulnerable Hosts found",
                          "extra_tooltip_field_1": "modified",
                          "extra_tooltip_label_1": "Updated" }}'
      data-init-params='{{"title_text": "Most vulnerable hosts"}}'/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="host-counts-timeline-source"
    data-aggregate-type="host"
    data-group-column="modified"
    data-subgroup-column="severity_level">
    <span class="dashboard-chart"
      data-chart-name="host-counts-timeline"
      data-y-fields="c_count,c_count[High]"
      data-z-fields="count,count[High]"
      data-chart-type="line"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="hosts-topology-source"
    data-aggregate-type="host"
    data-type="host">
    <span class="dashboard-chart"
      data-chart-name="hosts-topology"
      data-chart-type="topology"/>
  </div>

  <!-- Operating Systems -->
  <div class="dashboard-data-source"
    data-source-name="os-average-severity-count-source"
    data-group-column="average_severity"
    data-aggregate-type="os">
    <span class="dashboard-chart"
      data-chart-name="oss-by-cvss"
      data-chart-type="bar"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="oss-by-class"
      data-chart-type="donut"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="most-vulnerable-oss-source"
    data-aggregate-type="os"
    data-group-column="uuid"
    data-columns="average_severity,average_severity_score,hosts"
    data-text-columns="name,modified"
    data-sort-fields="average_severity_score,modified"
    data-sort-orders="descending,descending"
    data-sort-stats="max,value">
    <span class="dashboard-chart"
      data-chart-name="most-vulnerable-oss"
      data-chart-type="horizontal_bar"
      data-x-field="name"
      data-y-fields="average_severity_score_max"
      data-z-fields="average_severity_max"
      data-gen-params='{{"empty_text": "No vulnerable Operating Systems found",
                          "score_severity" : "average_severity_max",
                          "score_assets" : "hosts_max",
                          "score_asset_type" : "hosts",
                          "extra_tooltip_field_1": "modified",
                          "extra_tooltip_label_1": "Updated"}}'
      data-init-params='{{"title_text": "Operating Systems by Vulnerability Score"}}'/>
  </div>
</xsl:template>

<xsl:template match="dashboard" mode="assets">
  <xsl:variable name="filters" select="get_filters_response/filter[type='Asset' or type='']"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'most-vulnerable-hosts|hosts-topology|most-vulnerable-oss#oss-by-class|host-counts-timeline'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#|'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="controllers_pref_id" select="'0320e0db-bf30-4d4f-9379-b0a022d07cf7'"/>
  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="filters_pref_id" select="'48c344eb-062e-4ff5-81db-28f7ab110ca1'"/>
  <!-- Setting UUIDs for row height preferences -->
  <xsl:variable name="heights_pref_id" select="'d52373d8-90d9-4921-b03f-1ffd11e03f49'"/>

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
      <img class="icon icon-lg" src="/img/asset.svg" alt="Assets Dashboard"/>
      <xsl:value-of select="gsa:i18n ('Assets Dashboard', 'Dashboard')"/>
    </h1>
    <div id="assets-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="assets-dashboard" class="dashboard" data-dashboard-name="assets-dashboard"
      data-controllers="{$controllers}"
      data-filters-string="{$filters_string}"
      data-heights="{$heights}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-controllers-pref-id="{$controllers_pref_id}"
      data-filters-pref-id="{$filters_pref_id}"
      data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="hosts-by-class"
      data-dashboard-controls="assets-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="assets-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

<xsl:template name="secinfo-dashboard-data">
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
</xsl:template>

<xsl:template match="dashboard" mode="secinfo">
  <xsl:variable name="filters" select="get_filters_response/filter[type='SecInfo' or type='']"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'nvt_donut_chart|cve_timeline_chart|cve_donut_chart#cert_bund_adv_timeline_chart|cert_bund_adv_bar_chart'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#|'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="controllers_pref_id" select="'84ab32da-fe69-44d8-8a8f-70034cf28d4e'"/>
  <!-- Setting UUIDs for row height preferences -->
  <xsl:variable name="heights_pref_id" select="'42d48049-3153-43bf-b30d-72ca5ab1eb49'"/>
  <!-- Setting UUID for chart selection preferences -->
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
    <div id="secinfo-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="secinfo-dashboard" class="dashboard" data-dashboard-name="secinfo-dashboard"
      data-controllers="{$controllers}"
      data-filters-string="{$filters_string}"
      data-heights="{$heights}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-controllers-pref-id="{$controllers_pref_id}"
      data-filters-pref-id="{$filters_pref_id}"
      data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="nvt_bar_chart"
      data-dashboard-controls="secinfo-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="secinfo-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

</xsl:stylesheet>
