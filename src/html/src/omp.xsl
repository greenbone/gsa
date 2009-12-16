<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: OpenVAS Manager Protocol (OMP) stylesheet

Authors:
Matthew Mundell <matthew.mundell@intevation.de>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@intevation.de>

Copyright:
Copyright (C) 2009 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2,
or, at your option, any later version as published by the Free
Software Foundation

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<!-- NAMED TEMPLATES -->

<xsl:template name="html-task-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Tasks
     <a href="/help/tasks.html" title="Help: Tasks">
       <img src="/img/help.png" border="0"/>
     </a>
     <a href="/new_task.html" title="New Task">
       <img src="/img/new.png" border="0" style="margin-left:3px;"/>
     </a>
     <a href="/omp?cmd=get_status" title="Refresh">
       <img src="/img/refresh.png" border="0" style="margin-left:3px;"/>
     </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td rowspan="2">Task</td>
            <td width="1" rowspan="2">Status</td>
            <td colspan="3">Reports</td>
            <td rowspan="2">Threat</td>
            <td rowspan="2">Trend</td>
            <td width="100" rowspan="2">Actions</td>
          </tr>
          <tr class="gbntablehead2">
            <td width="1" style="font-size:10px;">Total</td>
            <td  style="font-size:10px;">First</td>
            <td  style="font-size:10px;">Last</td>
          </tr>
          <xsl:apply-templates/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="build-levels">
  <xsl:param name="filters"></xsl:param>
  <xsl:for-each select="$filters">
    <xsl:choose>
      <xsl:when test="text()='High'">h</xsl:when>
      <xsl:when test="text()='Medium'">m</xsl:when>
      <xsl:when test="text()='Low'">l</xsl:when>
      <xsl:when test="text()='Log'">g</xsl:when>
    </xsl:choose>
  </xsl:for-each>
</xsl:template>

<xsl:template match="all">
</xsl:template>

<xsl:template name="html-report-details">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Report Summary
      <a href="/help/view_report.html#viewreport"
         title="Help: View Report (View Report)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <div style="float:right;">
        <a href="?cmd=get_status&amp;task_id={report/task/@id}">Back to Task</a>
      </div>

      <a name="summary"/>
      <table>
      <tr>
        <td><b>Result of Task:</b></td>
        <td><b><xsl:value-of select="report/task/name"/></b></td>
      </tr>
      <tr>
        <td>Order of results:</td>
        <td>by host</td>
      </tr>
      <tr>
        <td><b>Scan started:</b></td>
        <td><b><xsl:value-of select="report/scan_start"/></b></td>
      </tr>
      <tr>
        <td>Scan ended:</td>
        <td><xsl:value-of select="report/scan_end"/></td>
      </tr>
      <tr>
        <td>Final scan run status:</td>
        <td><xsl:value-of select="report/scan_run_status"/></td>
      </tr>
      </table>

      <h1>Result Summary</h1>
      <xsl:apply-templates select="../all/get_report_response/report"
                           mode="overview"/>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Result Filtering
      <!--
      <a href="/help/view_report.html#viewreport"
         title="Help: View Report (Result Filtering)">
        <img src="/img/help.png"/>
      </a>
      -->
    </div>
    <div class="gb_window_part_content">
      <xsl:variable name="levels">
        <xsl:value-of select="report/filters/text()"/>
      </xsl:variable>
      <!-- This must match the max value in exec_omp_get in gsad.c. -->
      <xsl:variable name="increment">10</xsl:variable>
      <xsl:variable name="last" select="report/results/@start + count(report/results/result) - 1"/>
      <div style="float:left;">
        <xsl:if test = "report/results/@start &gt; 1">
          <a href="?cmd=get_report&amp;report_id={report/@id}&amp;first_result={report/results/@start - $increment}&amp;levels={$levels}&amp;sort_field={report/sort/field/text()}&amp;sort_order={report/sort/field/order}">&lt;&lt;</a>
        </xsl:if>
        Results <xsl:value-of select="report/results/@start"/> -
        <xsl:value-of select="$last"/>
        of <xsl:value-of select="report/scan_result_count/filtered"/>
        <xsl:if test = "$last &lt; report/scan_result_count/filtered">
          <a href="?cmd=get_report&amp;report_id={report/@id}&amp;first_result={report/results/@start + $increment}&amp;levels={$levels}&amp;sort_field={report/sort/field/text()}&amp;sort_order={report/sort/field/order}">&gt;&gt;</a>
        </xsl:if>
      </div>
      <div id="small_form" style="float:right;">
        <form action="" method="get">
          This report as:
          <input type="hidden" name="cmd" value="get_report"/>
          <input type="hidden" name="report_id" value="{report/@id}"/>
          <input type="hidden" name="levels" value="{$levels}"/>
          <input type="hidden"
                 name="sort_field"
                 value="{report/sort/field/text()}"/>
          <input type="hidden"
                 name="sort_order"
                 value="{report/sort/field/order}"/>
          <select name="format" style="margin-right:3px;" title="Download Format">
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="xml">XML</option>
            <option value="nbe">NBE</option>
          </select>
          <input type="submit" value="Download" title="Download"/>
        </form>
      </div>

      <!-- TODO: Move to template. -->
      <table border="0" cellspacing="0" cellpadding="3" width="100%">
        <tr>
          <td colspan="2">
            Sorting:
          </td>
          <td colspan="4">
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='port' and report/sort/field/order='ascending'">
                port ascending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=port&amp;sort_order=ascending&amp;levels={$levels}">port ascending</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='port' and report/sort/field/order='descending'">
                port descending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=port&amp;sort_order=descending&amp;levels={$levels}">port descending</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='type' and report/sort/field/order='ascending'">
                threat ascending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=type&amp;sort_order=ascending&amp;levels={$levels}">threat ascending</a>
              </xsl:otherwise>
            </xsl:choose>
            |
            <xsl:choose>
              <xsl:when test="report/sort/field/text()='type' and report/sort/field/order='descending'">
                threat descending
              </xsl:when>
              <xsl:otherwise>
                <a href="/omp?cmd=get_report&amp;report_id={report/@id}&amp;sort_field=type&amp;sort_order=descending&amp;levels={$levels}">threat descending</a>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </table>
      <br/>
      <table>
        <xsl:variable name="sort_field">
          <xsl:value-of select="report/sort/field/text()"/>
        </xsl:variable>
        <xsl:variable name="sort_order">
          <xsl:value-of select="report/sort/field/order"/>
        </xsl:variable>
        <tr>
          <td>Current View:</td>
          <td>
            <div id="small_form">
              <form action="" method="get">
                <table>
                  <tr>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='High']">
                          <input type="checkbox" disabled="1" checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" disabled="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/high.png" alt="High" title="High"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Medium']">
                          <input type="checkbox" disabled="1" checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" disabled="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/medium.png" alt="Medium" title="Medium"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Low']">
                          <input type="checkbox" disabled="1" checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" disabled="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/low.png" alt="Low" title="Low"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Log']">
                          <input type="checkbox" disabled="1" checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" disabled="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/log.png" alt="Log" title="Log"/>
                    </td>
                    <td class="threat_info_table_h">
                    </td>
                  </tr>
                </table>
              </form>
            </div>
          </td>
        </tr>
        <tr>
          <td>New Filter:</td>
          <td>
            <div id="small_form">
              <form action="" method="get">
                <input type="hidden" name="cmd" value="get_report"/>
                <input type="hidden" name="report_id" value="{report/@id}"/>
                <input type="hidden" name="sort_field" value="{$sort_field}"/>
                <input type="hidden" name="sort_order" value="{$sort_order}"/>
                <table>
                  <tr>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='High']">
                          <input type="checkbox" name="level_high" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_high" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/high.png" alt="High" title="High"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Medium']">
                          <input type="checkbox" name="level_medium" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_medium" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/medium.png" alt="Medium" title="Medium"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Low']">
                          <input type="checkbox" name="level_low" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_low" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/low.png" alt="Low" title="Low"/>
                    </td>
                    <td class="threat_info_table_h">
                      <xsl:choose>
                        <xsl:when test="report/filters/filter[text()='Log']">
                          <input type="checkbox" name="level_log" value="1"
                                 checked="1"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <input type="checkbox" name="level_log" value="1"/>
                        </xsl:otherwise>
                      </xsl:choose>
                      <img src="/img/log.png" alt="Log" title="Log"/>
                    </td>
                    <td class="threat_info_table_h">
                      <input type="submit" value="Apply" title="Apply"/>
                    </td>
                  </tr>
                </table>
              </form>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Results per Host
      <!--
      <a href="/help/view_report.html#viewreport"
         title="Help: View Report (Results per Host)">
        <img src="/img/help.png"/>
      </a>
      -->
    </div>
    <div class="gb_window_part_content">
      <xsl:apply-templates select="report" mode="details"/>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-report-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Task Summary
      <a href="/help/reports.html#tasksummary"
         title="Help: Reports (Task Summary)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_status&amp;task_id={task/@id}" title="Refresh">
        <img src="/img/refresh.png" border="0" style="margin-left:3px;"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <div style="float:right;">
        <a href="/omp?cmd=get_status">Back to Tasks</a>
      </div>
      <table>
        <tr>
          <td><b>Name:</b></td>
          <td><b><xsl:value-of select="task/name"/></b></td>
        </tr>
        <tr>
          <td>Status:</td>
          <td>
            <xsl:call-template name="status_bar">
              <xsl:with-param name="status">
                <xsl:value-of select="task/status"/>
              </xsl:with-param>
              <xsl:with-param name="progress">
                <xsl:value-of select="task/progress/text()"/>
              </xsl:with-param>
            </xsl:call-template>
          </td>
        </tr>
        <tr>
          <td>Reports:</td>
          <td>
            <xsl:value-of select="task/report_count/text()"/>
            (Finished: <xsl:value-of select="task/report_count/finished"/>)
          </td>
        </tr>
      </table>
    </div>
  </div>
  <br/>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Reports for "<xsl:value-of select="task/name"/>"
      <a href="/help/reports.html#reports" title="Help: Reports (Reports)">
        <img src="/img/help.png"/>
      </a>
      <a href="/omp?cmd=get_status&amp;task_id={task/@id}" title="Refresh">
        <img src="/img/refresh.png" border="0" style="margin-left:3px;"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="reports">
        <table class="gbntable" cellspacing="2" cellpadding="4">
          <tr class="gbntablehead2">
            <td rowspan="2">Report</td>
            <td rowspan="2">Threat</td>
            <td colspan="4">Scan Results</td>
            <td rowspan="2">Download</td>
            <td rowspan="2">Actions</td>
          </tr>
          <tr class="gbntablehead2">
            <td class="threat_info_table_h">
              <img src="/img/high.png" alt="High" title="High"/>
            </td>
            <td class="threat_info_table_h">
              <img src="/img/medium.png" alt="Medium" title="Medium"/>
            </td>
            <td class="threat_info_table_h">
              <img src="/img/low.png" alt="Low" title="Low"/>
            </td>
            <td class="threat_info_table_h">
              <img src="/img/log.png" alt="Log" title="Log"/>
            </td>
          </tr>
          <xsl:apply-templates/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template name="short_timestamp_first">
  <xsl:value-of select="substring(first_report/report/timestamp,5,6)"/>
  <xsl:value-of select="substring(first_report/report/timestamp,20,21)"/>
</xsl:template>

<xsl:template name="short_timestamp_last">
  <xsl:value-of select="substring(last_report/report/timestamp,5,6)"/>
  <xsl:value-of select="substring(last_report/report/timestamp,20,21)"/>
</xsl:template>

<xsl:template name="short_timestamp_second_last">
  <xsl:value-of select="substring(second_last_report/report/timestamp,5,6)"/>
  <xsl:value-of select="substring(second_last_report/report/timestamp,20,21)"/>
</xsl:template>

<!-- TREND METER -->
<xsl:template name="trend_meter">

  <xsl:variable name="threat_a">
    <xsl:choose>
      <xsl:when test="last_report/report/messages/hole &gt; 0">4</xsl:when>
      <xsl:when test="last_report/report/messages/warning &gt; 0">3</xsl:when>
      <xsl:when test="last_report/report/messages/info &gt; 0">2</xsl:when>
      <xsl:otherwise>1</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="sum_ta">
    <xsl:choose>
      <xsl:when test="last_report/report/messages/hole &gt; 0">
        <xsl:value-of select="last_report/report/messages/hole"/>
      </xsl:when>
      <xsl:when test="last_report/report/messages/warning &gt; 0">
        <xsl:value-of select="last_report/report/messages/warning"/>
      </xsl:when>
      <xsl:when test="last_report/report/messages/info &gt; 0">
        <xsl:value-of select="last_report/report/messages/info"/>
      </xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="sum_ta2">
    <xsl:choose>
      <xsl:when test="last_report/report/messages/hole &gt; 0">
        <xsl:value-of select="last_report/report/messages/warning"/>
      </xsl:when>
      <xsl:when test="last_report/report/messages/warning &gt; 0">
        <xsl:value-of select="last_report/report/messages/info"/>
      </xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="threat_b">
    <xsl:choose>
      <xsl:when test="second_last_report/report/messages/hole &gt; 0">
        4
      </xsl:when>
      <xsl:when test="second_last_report/report/messages/warning &gt; 0">
        3
      </xsl:when>
      <xsl:when test="second_last_report/report/messages/info &gt; 0">
        2
      </xsl:when>
      <xsl:otherwise>
        1
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="sum_tb">
    <xsl:choose>
      <xsl:when test="second_last_report/report/messages/hole &gt; 0">
        <xsl:value-of select="second_last_report/report/messages/hole"/>
      </xsl:when>
      <xsl:when test="second_last_report/report/messages/warning &gt; 0">
        <xsl:value-of select="second_last_report/report/messages/warning"/>
      </xsl:when>
      <xsl:when test="second_last_report/report/messages/info &gt; 0">
        <xsl:value-of select="second_last_report/report/messages/info"/>
      </xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="sum_tb2">
    <xsl:choose>
      <xsl:when test="second_last_report/report/messages/hole &gt; 0">
        <xsl:value-of select="second_last_report/report/messages/warning"/>
      </xsl:when>
      <xsl:when test="second_last_report/report/messages/warning &gt; 0">
        <xsl:value-of select="second_last_report/report/messages/info"/>
      </xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:choose>
    <xsl:when test="report_count/finished &gt; 1 and status!='Running'">
      <xsl:choose>
        <xsl:when test="$threat_a &gt; $threat_b">
          <img src="/img/trend_up.png" alt="Threat level increased"
               title="Threat level increased"/>
        </xsl:when>
        <xsl:when test="$threat_a &lt; $threat_b">
          <img src="/img/trend_down.png" alt="Threat level decreased"
               title="Threat level decreased"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:choose>
            <xsl:when test="$sum_ta &gt; $sum_tb">
              <img src="/img/trend_more.png" alt="Threat count increased"
                   title="Threat count increased"/>
            </xsl:when>
            <xsl:when test="$sum_ta &lt; $sum_tb">
              <img src="/img/trend_less.png" alt="Threat count decreased"
                   title="Threat count decreased"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:choose>
                <xsl:when test="$sum_ta2 &gt; $sum_tb2">
                  <img src="/img/trend_more.png" alt="Threat count increased"
                     title="Threat count increased"/>
                </xsl:when>
                <xsl:when test="$sum_ta2 &lt; $sum_tb2">
                  <img src="/img/trend_less.png" alt="Threat count decreased"
                     title="Threat count decreased"/>
                </xsl:when>
                <xsl:otherwise>
                  <img src="/img/trend_nochange.png"
                       alt="Threat did not change"
                       title="The threat did not change"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise>
    </xsl:otherwise>
  </xsl:choose>

</xsl:template>

<xsl:template match="target" mode="newtask">
  <option value="{name}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="config" mode="newtask">
  <option value="{name}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template name="status_bar">
  <xsl:param name="status">(Unknown)</xsl:param>
  <xsl:param name="progress">(Unknown)</xsl:param>
  <xsl:choose>
    <xsl:when test="$status='Running'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar" style="width:{$progress}px;"></div>
        <div class="progressbar_text">
          <xsl:value-of select="$progress"/> %
        </div>
      </div>
    </xsl:when>
    <xsl:when test="$status='New'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_new" style="width:100px;"></div>
        <div class="progressbar_text">
          <i><b><xsl:value-of select="$status"/></b></i>
        </div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Delete Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Stop Requested'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Stopped'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_request" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Internal Error'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_error" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:when test="$status='Done'">
      <div class="progressbar_box" title="{$status}">
        <div class="progressbar_bar_done" style="width:100px;"></div>
        <div class="progressbar_text"><xsl:value-of select="$status"/></div>
      </div>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$status"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- END NAMED TEMPLATES -->

<xsl:template match="message">
  <div class="message">
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match="error">
  <div class="error">
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match="task_id">
  ID=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="identifier">
  <div style="float:left">
    <span class="task_title">
      <xsl:apply-templates/>
    </span>
  </div>
</xsl:template>

<xsl:template match="status">
</xsl:template>

<xsl:template match="hole">
  H=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="warning">
  W=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="info">
  I=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="debug">
  D=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="log">
  L=<xsl:apply-templates/>
</xsl:template>

<xsl:template match="messages">
  <div>
    <xsl:apply-templates/>
  </div>
</xsl:template>

<xsl:template match="gsad_msg">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      <xsl:value-of select="@operation"/>
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
    <xsl:with-param name="details">
      <xsl:value-of select="text()"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="create_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Delete Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="delete_report_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Delete Report</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="start_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Start Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="abort_task_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Stop Task</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="task_count">
</xsl:template>

<!-- LAST_REPORT -->

<xsl:template match="last_report">
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="report">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <a href="{@host_start/host}">
        <xsl:value-of select="host_start/host"/>
      </a>
    </td>
    <td></td>
    <td>0</td>
    <td>0</td>
    <td>0</td>
    <td></td>
  </tr>
</xsl:template>

<!-- REPORT -->
<xsl:template match="get_status_response/task/report">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="timestamp"/></b><br/>
      <xsl:value-of select="scan_run_status"/>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="messages/hole &gt; 0">
          <img src="/img/high_big.png"
               title="High={messages/hole} Medium={messages/warning} Low={messages/info}"
               alt="High"/>
        </xsl:when>
        <xsl:when test="messages/warning &gt; 0">
          <img src="/img/medium_big.png"
               title="High={messages/hole} Medium={messages/warning} Low={messages/info}"
               alt="Medium"/>
        </xsl:when>
        <xsl:when test="messages/info &gt; 0">
          <img src="/img/low_big.png"
               title="High={messages/hole} Medium={messages/warning} Low={messages/info}"
               alt="Low"/>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/none_big.png"
               title="High={messages/hole} Medium={messages/warning} Low={messages/info}"
               alt="None"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="messages/hole"/>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="messages/warning"/>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="messages/info"/>
    </td>
    <td class="threat_info_table">
      <xsl:value-of select="messages/log"/>
    </td>
    <td>
      <div id="small_form">
        <form action="" method="get">
          <input type="hidden" name="report_id" value="{@id}"/>
          <input type="hidden" name="cmd" value="get_report"/>
          <select name="format"
                  style="margin-right:3px;"
                  title="Download Format">
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="xml">XML</option>
            <option value="nbe">NBE</option>
          </select>
          <input type="submit" value="Download" title="Download"/>
        </form>
      </div>
    </td>
    <td>
      <a href="/omp?cmd=get_report&amp;report_id={@id}"
         title="Details"
         style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <a href="/omp?cmd=delete_report&amp;report_id={@id}&amp;task_id={../@id}"
         title="Delete"
         style="margin-left:3px;">
        <img src="/img/delete.png" border="0" alt="Delete"/>
      </a>
    </td>
  </tr>
</xsl:template>

<!-- LAST_REPORT -->
<xsl:template match="last_report">
  <xsl:choose>
    <xsl:when test="report/messages/hole &gt; 0">
      <img src="/img/high_big.png"
           title="High={report/messages/hole} Medium={report/messages/warning} Low={report/messages/info}"
           alt="High"/>
    </xsl:when>
    <xsl:when test="report/messages/warning &gt; 0">
      <img src="/img/medium_big.png"
           title="High={report/messages/hole} Medium={report/messages/warning} Low={report/messages/info}"
           alt="Medium"/>
    </xsl:when>
    <xsl:when test="report/messages/info &gt; 0">
      <img src="/img/low_big.png"
           title="High={report/messages/hole} Medium={report/messages/warning} Low={report/messages/info}"
           alt="Low"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
        <xsl:when test="../status!='Running'">
          <img src="/img/none_big.png"
               title="High={report/messages/hole} Medium={report/messages/warning} Low={report/messages/info}"
               alt="None"/>
        </xsl:when>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- TASK -->

<xsl:template match="task">
  <xsl:choose>
    <xsl:when test="report">
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:apply-templates select="report"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <tr class="{$class}">
        <td><b><xsl:value-of select="name"/></b></td>
        <td>
          <xsl:call-template name="status_bar">
            <xsl:with-param name="status">
              <xsl:value-of select="status"/>
            </xsl:with-param>
            <xsl:with-param name="progress">
              <xsl:value-of select="progress/text()"/>
            </xsl:with-param>
          </xsl:call-template>
        </td>
        <td style="text-align:right;font-size:10px;">
          <xsl:choose>
            <xsl:when test="report_count &gt; 0">
              <a href="/omp?cmd=get_status&amp;task_id={@id}">
                <xsl:value-of select="report_count/finished"/>
              </a>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td style="font-size:10px;">
          <xsl:choose>
            <xsl:when test="last_report/report/@id = first_report/report/@id">
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=get_report&amp;report_id={first_report/report/@id}">
                <xsl:call-template name="short_timestamp_first"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td style="font-size:10px;">
          <a href="/omp?cmd=get_report&amp;report_id={last_report/report/@id}">
            <xsl:call-template name="short_timestamp_last"/>
          </a>
        </td>
        <td style="text-align:center;">
          <xsl:choose>
            <xsl:when test="last_report">
              <xsl:apply-templates select="last_report"/>
            </xsl:when>
          </xsl:choose>
        </td>
        <td style="text-align:center;">
          <!-- Trend -->
          <xsl:call-template name="trend_meter"/>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="status='Running' or status='Requested' or status='Stop Requested' or status='Delete Requested'">
              <img src="/img/start_inactive.png" border="0" alt="Start"/>
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=start_task&amp;task_id={@id}"
                 title="Start Task">
                <img src="/img/start.png" border="0" alt="Start"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="status='New' or status='Requested' or status='Done' or status='Stopped'">
              <img src="/img/stop_inactive.png" border="0"
                   alt="Abort"
                   style="margin-left:3px;"/>
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=abort_task&amp;task_id={@id}" title="Abort Task">
                <img src="/img/stop.png"
                     border="0"
                     alt="Abort"
                     style="margin-left:3px;"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="status='Running' or status='Requested'">
              <img src="/img/delete_inactive.png"
                   border="0"
                   alt="Delete"
                   style="margin-left:3px;"/>
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=delete_task&amp;task_id={@id}"
                 title="Delete Task"
                 style="margin-left:3px;">
                <img src="/img/delete.png"
                     border="0"
                     alt="Delete"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="report_count &lt; 1">
              <img src="/img/list_inactive.png"
                   border="0"
                   alt="Reports"
                   style="margin-left:3px;"/>
            </xsl:when>
            <xsl:otherwise>
              <a href="/omp?cmd=get_status&amp;task_id={@id}" title="Reports">
                <img src="/img/list.png"
                     border="0"
                     alt="Reports"
                     style="margin-left:3px;"/>
              </a>
            </xsl:otherwise>
          </xsl:choose>
        </td>
      </tr>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- GET_TASKS_RESPONSE -->

<xsl:template match="get_status_response">
  <xsl:choose>
    <xsl:when test="task/report">
      <xsl:call-template name="html-report-table"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-task-table"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="commands_response/get_status_response">
  <xsl:choose>
    <xsl:when test="task/report">
      <xsl:call-template name="html-report-table"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="html-task-table"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- BEGIN LSC_CREDENTIALS MANAGEMENT -->

<xsl:template name="html-create-lsc-credential-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      New Credential for Local Security Checks
      <a href="/help/configure_credentials.html#new_lsc_credential"
         title="Help: Configure Credentials (New Credential)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_lsc_credential"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Login</td>
            <td>
              <input type="text" name="credential_login" value="" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <table>
                <tr>
                  <td colspan="2">
                    <input type="radio" name="base" value="gen" checked="1"/>
                    Autogenerate credential
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="base" value="pass"/>
                    Password
                  </td>
                  <td>
                    <input type="password" name="password" size="30"
                           maxlength="40"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Credential"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-lsc-credentials-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      Credentials for Local Security Checks
      <a href="/help/configure_credentials.html#credentials"
         title="Help: Configure Credentials (Credentials)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Login</td>
            <td>Comment</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="lsc_credential"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_LSC_CREDENTIAL_RESPONSE -->

<xsl:template match="create_lsc_credential_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Credential</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_LSC_CREDENTIAL_RESPONSE -->

<xsl:template match="delete_lsc_credential_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Credential
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     LSC_CREDENTIAL -->

<xsl:template match="lsc_credential">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
    </td>
    <td>
      <xsl:value-of select="login"/>
    </td>
    <td>
      <xsl:value-of select="comment"/>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_lsc_credential&amp;name={name}"
             title="Delete Credential" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png" border="0" alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:if test="type='gen'">
        <a href="/omp?cmd=get_lsc_credentials&amp;name={name}&amp;package_format=rpm"
           title="Download RPM package" style="margin-left:3px;">
          <img src="/img/rpm.png" border="0" alt="Download RPM"/>
        </a>
        <a href="/omp?cmd=get_lsc_credentials&amp;name={name}&amp;package_format=deb"
           title="Download Debian package" style="margin-left:3px;">
          <img src="/img/deb.png" border="0" alt="Download Deb"/>
        </a>
        <a href="/omp?cmd=get_lsc_credentials&amp;name={name}&amp;package_format=exe"
           title="Download Exe package" style="margin-left:3px;">
          <img src="/img/exe.png" border="0" alt="Download Exe"/>
        </a>
        <a href="/omp?cmd=get_lsc_credentials&amp;name={name}&amp;package_format=key"
           title="Download Public Key" style="margin-left:3px;">
          <img src="/img/key.png" border="0" alt="Download Public Key"/>
        </a>
      </xsl:if>
    </td>
  </tr>
</xsl:template>

<!--     GET_LSC_CREDENTIALS_RESPONSE -->

<xsl:template match="get_lsc_credentials_response">
  <xsl:call-template name="html-create-lsc-credential-form"/>
  <xsl:call-template name="html-lsc-credentials-table"/>
</xsl:template>

<xsl:template match="lsc_credential" mode="select">
  <option value="{name}"><xsl:value-of select="name"/></option>
</xsl:template>

<xsl:template match="lsc_credentials_response" mode="select">
  <xsl:apply-templates select="lsc_credential" mode="select"/>
</xsl:template>

<!-- END LSC_CREDENTIALS MANAGEMENT -->

<!-- BEGIN TARGETS MANAGEMENT -->

<xsl:template name="html-create-target-form">
  <xsl:param name="lsc-credentials"></xsl:param>
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">New Target
      <a href="/help/configure_targets.html#newtarget"
         title="Help: Configure Targets (New Target)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_target"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Hosts</td>
            <td>
              <input type="text" name="hosts" value="localhost" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top" width="125">Credential (optional)</td>
            <td>
              <select name="password">
                <option value="--">--</option>
                <xsl:apply-templates select="$lsc-credentials" mode="select"/>
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Target"/>
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-targets-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Targets
      <a href="/help/configure_targets.html#targets"
         title="Help: Configure Targets (Targets)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td>Name</td>
            <td>Hosts</td>
            <td>IPs</td>
            <td>Credential</td>
            <td width="100">Actions</td>
          </tr>
          <xsl:apply-templates select="target"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_TARGET_RESPONSE -->

<xsl:template match="create_target_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Target</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_TARGET_RESPONSE -->

<xsl:template match="delete_target_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      Delete Target
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     TARGET -->

<xsl:template match="target">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </td>
    <td><xsl:value-of select="hosts"/></td>
    <td><xsl:value-of select="max_hosts"/></td>
    <td><xsl:value-of select="lsc_credential/name"/></td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_target&amp;name={name}"
             title="Delete Target" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png"
               border="0"
               alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </tr>
</xsl:template>

<!--     GET_TARGETS_RESPONSE -->

<xsl:template match="get_targets">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:apply-templates select="commands_response/delete_target_response"/>
  <xsl:apply-templates select="create_target_response"/>
  <xsl:call-template name="html-create-target-form">
    <xsl:with-param
      name="lsc-credentials"
      select="get_lsc_credentials_response | commands_response/get_lsc_credentials_response"/>
  </xsl:call-template>
  <!-- The for-each makes the get_targets_response the current node. -->
  <xsl:for-each select="get_targets_response | commands_response/get_targets_response">
    <xsl:call-template name="html-targets-table"/>
  </xsl:for-each>
</xsl:template>

<!-- END TARGETS MANAGEMENT -->

<!-- BEGIN CONFIGS MANAGEMENT -->

<xsl:template name="html-create-config-form">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      New Scan Config
      <a href="/help/configure_scanconfigs.html#newconfig"
         title="Help: Configure Scan Configs (New Scan Config)">
        <img src="/img/help.png"/>
      </a>
    </div>
    <div class="gb_window_part_content">
      <form action="/omp" method="post" enctype="multipart/form-data">
        <input type="hidden" name="cmd" value="create_config"/>
        <table border="0" cellspacing="0" cellpadding="3" width="100%">
          <tr>
            <td valign="top" width="125">Name</td>
            <td>
              <input type="text" name="name" value="unnamed" size="30"
                     maxlength="80"/>
            </td>
          </tr>
          <tr>
            <td valign="top">Comment (optional)</td>
            <td>
              <input type="text" name="comment" size="30" maxlength="400"/>
            </td>
          </tr>
          <tr>
            <td>Base</td>
            <td>
              <table>
                <tr>
                  <td colspan="2">
                    <input type="radio" name="base" value="empty"
                           checked="1"/>
                    Empty, static and fast
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <input type="radio" name="base" value="Full and fast"/>
                    Full and fast
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="base" value="file"/>
                    Import config file
                  </td>
                  <td><input type="file" name="rcfile"/></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;">
              <input type="submit" name="submit" value="Create Scan Config"/>
            </td>
          </tr>
        </table>
        <br/>
      </form>
    </div>
  </div>
</xsl:template>

<xsl:template name="html-config-family-table">
  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <xsl:choose>
    <xsl:when test="edit">
      <div class="gb_window_part_center">Edit Scan Config Family Details</div>
    </xsl:when>
    <xsl:otherwise>
      <div class="gb_window_part_center">Scan Config Family Details</div>
    </xsl:otherwise>
  </xsl:choose>
  <div class="gb_window_part_content">
    <div style="float:right;">
      <xsl:choose>
        <xsl:when test="edit">
          <a href="?cmd=edit_config&amp;name={config/name}">
            Back to Config Details
          </a>
        </xsl:when>
        <xsl:otherwise>
          <a href="?cmd=get_config&amp;name={config/name}">
            Back to Config Details
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </div>
    <br/>

    <xsl:variable name="config" select="config/name"/>
    <xsl:variable name="family" select="config/family"/>

    <table>
    <tr><td>Config:</td><td><xsl:value-of select="$config"/></td></tr>
    <tr><td>Family:</td><td><xsl:value-of select="$family"/></td></tr>
    </table>

    <xsl:choose>
      <xsl:when test="edit">
        <h1>Edit Network Vulnerability Tests</h1>
      </xsl:when>
      <xsl:otherwise>
        <h1>Network Vulnerability Tests</h1>
      </xsl:otherwise>
    </xsl:choose>

    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>OID</td>
        <td>Timeout</td>
        <td>Preferences</td>
        <xsl:if test="edit">
          <td>Selected</td>
        </xsl:if>
        <td>Action</td>
      </tr>
      <xsl:choose>
        <xsl:when test="edit">
          <form action="" method="post" enctype="multipart/form-data">
            <input type="hidden" name="cmd" value="save_config_family"/>
            <input type="hidden" name="name" value="{$config}"/>
            <input type="hidden" name="family" value="{$family}"/>
            <xsl:for-each select="all/get_nvt_details_response/nvt" >
              <xsl:variable name="current_name" select="name/text()"/>
              <xsl:variable name="id" select="@oid"/>
              <xsl:variable name="class">
                <xsl:choose>
                  <xsl:when test="position() mod 2 = 0">even</xsl:when>
                  <xsl:otherwise>odd</xsl:otherwise>
                </xsl:choose>
              </xsl:variable>
              <tr class="{$class}">
                <td><xsl:value-of select="$current_name"/></td>
                <td>
                  <xsl:value-of select="@oid"/>
                </td>
                <td>
                  <xsl:variable
                    name="timeout"
                    select="../../../get_nvt_details_response/nvt[@oid=$id]/timeout"/>
                  <xsl:choose>
                    <xsl:when test="string-length($timeout) &gt; 0">
                      <xsl:value-of select="$timeout"/>
                    </xsl:when>
                    <xsl:otherwise>
                      default
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
                <td style="text-align:center;">
                  <xsl:choose>
                    <xsl:when test="preference_count&gt;0">
                      <xsl:value-of select="preference_count"/>
                    </xsl:when>
                    <xsl:otherwise>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
                <td style="text-align:center;">
                  <xsl:choose>
                    <xsl:when test="../../../get_nvt_details_response/nvt[@oid=$id]">
                      <input type="checkbox" name="nvt:{@oid}" value="1"
                             checked="1"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <input type="checkbox" name="nvt:{@oid}" value="1"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
                <td>
                  <a href="/omp?cmd=get_config_nvt&amp;oid={@oid}&amp;name={$config}&amp;family={$family}"
                     title="NVT Details" style="margin-left:3px;">
                    <img src="/img/details.png" border="0" alt="Details"/>
                  </a>
                  <a href="/omp?cmd=edit_config_nvt&amp;oid={@oid}&amp;name={$config}&amp;family={$family}"
                     title="Select and Edit NVT Details"
                     style="margin-left:3px;">
                    <img src="/img/edit.png" border="0" alt="Details"/>
                  </a>
                </td>
              </tr>
            </xsl:for-each>
            <tr>
              <td>
                Total:
                <xsl:value-of select="count(all/get_nvt_details_response/nvt)"/>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                Total:
                <xsl:value-of select="count(get_nvt_details_response/nvt)"/>
              </td>
              <td></td>
            </tr>
            <tr>
              <td colspan="6" style="text-align:right;">
                <input type="submit"
                       name="submit"
                       value="Save Config"
                       title="Save Config"/>
              </td>
            </tr>
          </form>
        </xsl:when>
        <xsl:otherwise>
          <xsl:for-each select="get_nvt_details_response/nvt" >
            <xsl:variable name="current_name" select="name/text()"/>
            <xsl:variable name="class">
              <xsl:choose>
                <xsl:when test="position() mod 2 = 0">even</xsl:when>
                <xsl:otherwise>odd</xsl:otherwise>
              </xsl:choose>
            </xsl:variable>
            <tr class="{$class}">
              <td><xsl:value-of select="$current_name"/></td>
              <td>
                <xsl:value-of select="@oid"/>
              </td>
              <td>
                <xsl:choose>
                  <xsl:when test="string-length(timeout) &gt; 0">
                    <xsl:value-of select="timeout"/>
                  </xsl:when>
                  <xsl:otherwise>
                    default
                  </xsl:otherwise>
                </xsl:choose>
              </td>
              <td style="text-align:center;">
                <xsl:choose>
                  <xsl:when test="preference_count&gt;0">
                    <xsl:value-of select="preference_count"/>
                  </xsl:when>
                  <xsl:otherwise>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
              <td>
                <a href="/omp?cmd=get_config_nvt&amp;oid={@oid}&amp;name={$config}&amp;family={$family}"
                   title="NVT Details" style="margin-left:3px;">
                  <img src="/img/details.png" border="0" alt="Details"/>
                </a>
              </td>
            </tr>
          </xsl:for-each>
          <tr>
            <td>
              Total:
              <xsl:value-of select="count(all/get_nvt_details_response/nvt)"/>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <xsl:if test="edit">
            <tr>
              <td colspan="6" style="text-align:right;">
                <input type="submit"
                       name="submit"
                       value="Save Config"
                       title="Save Config"/>
              </td>
            </tr>
          </xsl:if>
        </xsl:otherwise>
      </xsl:choose>
    </table>
  </div>
</xsl:template>

<!--     CONFIG PREFERENCES -->

<xsl:template name="preference" match="preference">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="edit"></xsl:param>
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="nvt/name"/></td>
    <td><xsl:value-of select="name"/></td>
    <td><xsl:value-of select="value"/></td>
    <td>
      <xsl:if test="string-length($config) &gt; 0">
        <a href="/omp?cmd=get_config_nvt&amp;oid={nvt/@oid}&amp;name={$config}&amp;family={nvt/family}"
           title="Scan Config NVT Details" style="margin-left:3px;">
          <img src="/img/details.png" border="0" alt="Details"/>
        </a>
      </xsl:if>
      <xsl:if test="string-length($edit) &gt; 0">
        <a href="/omp?cmd=edit_config_nvt&amp;oid={nvt/@oid}&amp;name={$config}&amp;family={nvt/family}"
           title="Edit Scan Config NVT Details" style="margin-left:3px;">
          <img src="/img/edit.png" border="0" alt="Edit"/>
        </a>
      </xsl:if>
    </td>
  </tr>
</xsl:template>

<xsl:template match="preference" mode="details">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="name"/></td>
    <td><xsl:value-of select="value"/></td>
    <td></td>
  </tr>
</xsl:template>

<xsl:template match="preference"
              name="edit-config-preference"
              mode="edit-details">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="family"></xsl:param>
  <xsl:param name="nvt"></xsl:param>
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <xsl:if test="$config">
      <td><xsl:value-of select="nvt/name"/></td>
    </xsl:if>
    <td><xsl:value-of select="name"/></td>
    <td>
      <!-- TODO: Is name enough to make the preference unique, or is
           type required too? -->
      <xsl:choose>
        <xsl:when test="type='checkbox'">
          <xsl:choose>
            <xsl:when test="value='yes'">
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="yes" checked="1"/>
              yes
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="no"/>
              no
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="yes"/>
              yes
              <input type="radio" name="preference:{nvt/name}[checkbox]:{name}"
                     value="no" checked="1"/>
              no
            </xsl:otherwise>
          </xsl:choose>
        </xsl:when>
        <xsl:when test="type='password'">
          <input type="password" name="preference:{nvt/name}[password]:{name}"
                 value="{value}" size="30" maxlength="40"/>
          <input type="checkbox" name="password:{nvt/name}[password]:{name}"
                 value="yes"/>
          Replace old value
        </xsl:when>
        <xsl:when test="type='file'">
          <input type="file" name="preference:{nvt/name}[file]:{name}"/>
        </xsl:when>
        <xsl:when test="type='entry'">
          <input type="text" name="preference:{nvt/name}[entry]:{name}"
                 value="{value}" size="30" maxlength="400"/>
        </xsl:when>
        <xsl:when test="type='radio'">
          <input type="radio" name="preference:{nvt/name}[radio]:{name}"
                 value="{value}" checked="1"/>
          <xsl:value-of select="value"/>
          <xsl:for-each select="alt">
            <br/>
            <input type="radio"
                   name="preference:{../nvt/name}[radio]:{../name}"
                   value="{text()}"/>
            <xsl:value-of select="."/>
          </xsl:for-each>
        </xsl:when>
        <xsl:when test="type=''">
          <input type="text"
                 name="preference:scanner[scanner]:{name}"
                 value="{value}"
                 size="30"
                 maxlength="400"/>
        </xsl:when>
        <xsl:otherwise>
          <input type="text"
                 name="preference:{nvt/name}[{type}]:{name}"
                 value="{value}"
                 size="30"
                 maxlength="400"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:if test="$config">
        <a href="/omp?cmd=edit_config_nvt&amp;oid={nvt/@oid}&amp;name={$config}&amp;family={$family}"
           title="Edit NVT Details" style="margin-left:3px;">
          <img src="/img/edit.png" border="0" alt="Details"/>
        </a>
      </xsl:if>
    </td>
  </tr>
</xsl:template>

<xsl:template match="preferences" name="preferences">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="edit"></xsl:param>
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>NVT</td>
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>
      <xsl:for-each select="preference[string-length(./nvt)&gt;0]">
        <xsl:call-template name="preference">
          <xsl:with-param name="config" select="$config"/>
          <xsl:with-param name="edit" select="$edit"/>
        </xsl:call-template>
      </xsl:for-each>
    </table>
  </div>
</xsl:template>

<xsl:template match="preferences" mode="details">
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>

      <!-- Special case the NVT timeout. -->
      <tr class="even">
        <td>Timeout</td>
        <td>
          <xsl:choose>
            <xsl:when test="string-length(timeout) &gt; 0">
              <xsl:value-of select="timeout"/>
            </xsl:when>
            <xsl:otherwise>
              default
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td></td>
      </tr>

      <xsl:apply-templates select="preference" mode="details"/>
    </table>
  </div>
</xsl:template>

<xsl:template match="preferences" mode="edit-details">
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>

      <!-- Special case the NVT timeout. -->
      <tr class="even">
        <td>Timeout</td>
        <td>
          <xsl:choose>
            <xsl:when test="string-length(timeout) &gt; 0">
              <input type="radio"
                     name="timeout"
                     value="0"/>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio"
                     name="timeout"
                     value="0"
                     checked="1"/>
            </xsl:otherwise>
          </xsl:choose>
          Apply default timeout
          <br/>
          <xsl:choose>
            <xsl:when test="string-length(timeout) &gt; 0">
              <input type="radio"
                     name="timeout"
                     value="1"
                     checked="1"/>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio"
                     name="timeout"
                     value="1"/>
            </xsl:otherwise>
          </xsl:choose>
          <input type="text"
                 name="preference:scanner[scanner]:timeout.{../nvt/@oid}"
                 value="{timeout}"
                 size="30"
                 maxlength="400"/>
          <br/>
        </td>
        <td></td>
      </tr>

      <xsl:apply-templates
        select="preference"
        mode="edit-details"/>
      <tr>
        <td colspan="3" style="text-align:right;">
          <input type="submit"
                 name="submit"
                 value="Save Config"
                 title="Save Config"/>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<xsl:template match="preferences" mode="scanner">
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>
      <xsl:apply-templates
        select="preference[string-length(nvt)=0]"
        mode="details"/>
    </table>
  </div>
</xsl:template>

<xsl:template match="preferences" mode="edit-scanner-details">
  <div id="preferences">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Name</td>
        <td>Value</td>
        <td>Actions</td>
      </tr>
      <xsl:apply-templates
        select="preference[string-length(nvt)=0]"
        mode="edit-details"/>
      <tr>
        <td colspan="3" style="text-align:right;">
          <input type="submit"
                 name="submit"
                 value="Save Config"
                 title="Save Config"/>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<!--     CONFIG NVTS -->

<xsl:template name="html-config-nvt-table">
  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <xsl:choose>
    <xsl:when test="edit">
      <div class="gb_window_part_center">Edit Scan Config NVT Details</div>
    </xsl:when>
    <xsl:otherwise>
      <div class="gb_window_part_center">Scan Config NVT Details</div>
    </xsl:otherwise>
  </xsl:choose>
  <div class="gb_window_part_content">
    <xsl:variable name="family">
      <xsl:value-of select="get_nvt_details_response/nvt/family"/>
    </xsl:variable>
    <div style="float:right;">
      <xsl:choose>
        <xsl:when test="edit">
          <a href="?cmd=edit_config_family&amp;name={config/name}&amp;family={$family}">
            Back to Config Family Details
          </a>
        </xsl:when>
        <xsl:otherwise>
          <a href="?cmd=get_config_family&amp;name={config/name}&amp;family={$family}">
            Back to Config Family Details
          </a>
        </xsl:otherwise>
      </xsl:choose>
    </div>
    <br/>

    <table>
    <tr><td>Config:</td><td><xsl:value-of select="config/name"/></td></tr>
    <tr><td>Family:</td><td><xsl:value-of select="$family"/></td></tr>
    </table>

    <xsl:choose>
      <xsl:when test="edit">
        <h1>Edit Network Vulnerability Test</h1>
      </xsl:when>
      <xsl:otherwise>
        <h1>Network Vulnerability Test</h1>
      </xsl:otherwise>
    </xsl:choose>

    <h2>Details</h2>
    <xsl:apply-templates select="get_nvt_details_response/nvt"/>

    <h2>Preferences</h2>
    <xsl:choose>
      <xsl:when test="edit">
        <form action="" method="post" enctype="multipart/form-data">
          <input type="hidden" name="cmd" value="save_config_nvt"/>
          <input type="hidden" name="name" value="{config/name}"/>
          <input type="hidden" name="family" value="{$family}"/>
          <input type="hidden"
                 name="oid"
                 value="{get_nvt_details_response/nvt/@oid}"/>
          <xsl:apply-templates
            select="get_nvt_details_response/preferences"
            mode="edit-details"/>
        </form>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates
          select="get_nvt_details_response/preferences"
          mode="details"/>
      </xsl:otherwise>
    </xsl:choose>
  </div>
</xsl:template>

<!--     CONFIG FAMILIES -->

<xsl:template name="edit-families-family">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="config-family"></xsl:param>
  <xsl:variable name="current_name" select="name/text()"/>
  <xsl:choose>
    <xsl:when test="name=''">
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <tr class="{$class}">
        <td><xsl:value-of select="$current_name"/></td>
        <td>
          <xsl:choose>
            <xsl:when test="$config-family">
              <xsl:choose>
                <xsl:when test="$config-family/nvt_count='-1'">
                  N
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="$config-family/nvt_count"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
              0
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="max_nvt_count='-1'">
            </xsl:when>
            <xsl:otherwise>
              of <xsl:value-of select="max_nvt_count"/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td style="text-align:center;">
          <xsl:choose>
            <xsl:when test="$config-family">
              <xsl:choose>
                <xsl:when test="$config-family/growing=1">
                  <input type="radio" name="trend:{$current_name}" value="1"
                         checked="1"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="trend:{$current_name}" value="1"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="trend:{$current_name}" value="1"/>
            </xsl:otherwise>
          </xsl:choose>
          <img src="/img/trend_more.png"
               alt="Grows"
               title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
          <xsl:choose>
            <xsl:when test="$config-family">
              <xsl:choose>
                <xsl:when test="$config-family/growing=0">
                  <input type="radio" name="trend:{$current_name}" value="0"
                         checked="1"/>
                </xsl:when>
                <xsl:otherwise>
                  <input type="radio" name="trend:{$current_name}" value="0"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="trend:{$current_name}" value="0"
                     checked="1"/>
            </xsl:otherwise>
          </xsl:choose>
          <img src="/img/trend_nochange.png"
               alt="Static"
               title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
        </td>
        <td style="text-align:center;">
          <xsl:choose>
            <xsl:when test="$config-family and ($config-family/nvt_count = max_nvt_count)">
              <input type="checkbox" name="select:{$current_name}"
                     value="1" checked="1"/>
            </xsl:when>
            <xsl:otherwise>
              <input type="checkbox" name="select:{$current_name}"
                     value="0"/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
<!-- TODO: Need to send $current_name and next page (get_config_family) somehow.
          <input type="image"
                 name="submit"
                 value="{$current_name}"
                 title="Save Config and View Family Details"
                 src="/img/details.png"
                 border="0"
                 style="margin-left:3px;"
                 alt="Edit"/>
-->
          <input type="image"
                 name="submit"
                 value="{$current_name}"
                 title="Save Config and Edit Family Details"
                 src="/img/edit.png"
                 border="0"
                 style="margin-left:3px;"
                 alt="Edit"/>
        </td>
      </tr>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="family">
  <xsl:variable name="current_name" select="name/text()"/>
  <xsl:choose>
    <xsl:when test="name=''">
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="class">
        <xsl:choose>
          <xsl:when test="position() mod 2 = 0">even</xsl:when>
          <xsl:otherwise>odd</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <tr class="{$class}">
        <td><xsl:value-of select="$current_name"/></td>
        <td>
          <xsl:choose>
            <xsl:when test="nvt_count='-1'">
              N
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="nvt_count"/>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="max_nvt_count='-1'">
            </xsl:when>
            <xsl:otherwise>
              of <xsl:value-of select="max_nvt_count"/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>
          <a href="/omp?cmd=get_config_family&amp;name={../../name}&amp;family={$current_name}"
             title="Scan Config Family Details" style="margin-left:3px;">
            <img src="/img/details.png" border="0" alt="Details"/>
          </a>
        </td>
      </tr>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="config" mode="families">
  <div id="families">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>
          Family
          <xsl:choose>
            <xsl:when test="family_count/growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="family_count/growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>NVT's selected</td>
        <td>Trend</td>
        <td>Action</td>
      </tr>
      <xsl:apply-templates select="families/family"/>
      <tr>
        <td>Total: <xsl:value-of select="count(families/family)"/></td>
        <td>
          <xsl:value-of select="known_nvt_count/text()"/>
          of <xsl:value-of select="max_nvt_count/text()"/>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="nvt_count/growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="nvt_count/growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td></td>
      </tr>
    </table>
  </div>
</xsl:template>

<xsl:template name="edit-families">
  <xsl:param name="config"></xsl:param>
  <xsl:param name="families"></xsl:param>
  <div id="families">
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>
          Family
          <xsl:choose>
            <xsl:when test="$config/family_count/growing=1">
              <input type="radio" name="trend:" value="1" checked="1"/>
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
              <input type="radio" name="trend:" value="0"/>
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              <input type="radio" name="trend:" value="1"/>
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
              <input type="radio" name="trend:" value="0" checked="0"/>
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td>NVT's selected</td>
        <td>Trend</td>
        <td>Select all NVT's</td>
        <td>Action</td>
      </tr>
      <xsl:for-each select="$families/family">
        <xsl:variable name="family_name">
          <xsl:value-of select="name"/>
        </xsl:variable>
        <xsl:call-template name="edit-families-family">
          <xsl:with-param
            name="config-family"
            select="$config/families/family[name=$family_name]"/>
          <xsl:with-param name="config" select="$config"/>
        </xsl:call-template>
      </xsl:for-each>
      <tr>
        <td>
          Total: <xsl:value-of select="count($config/families/family)"/>
        </td>
        <td>
          <xsl:value-of select="$config/known_nvt_count/text()"/>
          of <xsl:value-of select="$config/max_nvt_count/text()"/>
        </td>
        <td>
          <xsl:choose>
            <xsl:when test="$config/nvt_count/growing='1'">
              <img src="/img/trend_more.png"
                   alt="Grows"
                   title="The NVT selection is DYNAMIC. New NVT's will automatically be added and considered."/>
            </xsl:when>
            <xsl:when test="$config/nvt_count/growing='0'">
              <img src="/img/trend_nochange.png"
                   alt="Static"
                   title="The NVT selection is STATIC. New NVT's will NOT automatically be added or considered."/>
            </xsl:when>
            <xsl:otherwise>
              N/A
            </xsl:otherwise>
          </xsl:choose>
        </td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td colspan="5" style="text-align:right;">
          <input type="submit"
                 name="submit"
                 value="Save Config"
                 title="Save Config"/>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<!--     CONFIG OVERVIEW -->

<xsl:template name="html-config-table">
  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <xsl:choose>
    <xsl:when test="edit">
      <div class="gb_window_part_center">Edit Scan Config Details</div>
    </xsl:when>
    <xsl:otherwise>
      <div class="gb_window_part_center">Scan Config Details</div>
    </xsl:otherwise>
  </xsl:choose>
  <div class="gb_window_part_content">
    <xsl:variable name="config" select="get_configs_response/config"/>
    <div style="float:right;">
      <a href="?cmd=get_configs">Back to Configs</a>
    </div>
    <br/>

    <table>
      <tr>
        <td>Name:</td><td><xsl:value-of select="$config/name"/></td>
      </tr>
      <tr>
        <td>Comment:</td><td><xsl:value-of select="$config/comment"/></td>
      </tr>
    </table>

    <xsl:choose>
      <xsl:when test="edit">
        <form action="" method="post">
          <input type="hidden" name="cmd" value="save_config"/>
          <input type="hidden" name="name" value="{$config/name}"/>

          <h1>Edit Network Vulnerability Test Families</h1>

          <xsl:call-template name="edit-families">
            <xsl:with-param name="config" select="$config"/>
            <xsl:with-param
              name="families"
              select="get_nvt_families_response/families"/>
          </xsl:call-template>

          <xsl:choose>
            <xsl:when test="count($config/preferences/preference[string-length(nvt)=0]) = 0">
              <h1>Edit Scanner Preferences: None</h1>
              <h1>Network Vulnerability Test Preferences: None</h1>
            </xsl:when>
            <xsl:otherwise>
              <h1>Edit Scanner Preferences</h1>

              <xsl:apply-templates
                select="$config/preferences"
                mode="edit-scanner-details"/>

              <h1>Network Vulnerability Test Preferences</h1>
              <xsl:for-each select="$config/preferences">
                <xsl:call-template name="preferences">
                  <xsl:with-param name="config" select="$config/name"/>
                  <xsl:with-param name="edit">yes</xsl:with-param>
                </xsl:call-template>
              </xsl:for-each>
            </xsl:otherwise>
          </xsl:choose>

        </form>
      </xsl:when>
      <xsl:otherwise>
        <h1>Network Vulnerability Test Families</h1>

        <xsl:apply-templates select="$config" mode="families"/>

        <xsl:choose>
          <xsl:when test="count($config/preferences/preference[string-length(nvt)=0]) = 0">
            <h1>Scanner Preferences: None</h1>
            <h1>Network Vulnerability Test Preferences: None</h1>
          </xsl:when>
          <xsl:otherwise>
            <h1>Scanner Preferences</h1>
            <xsl:apply-templates select="$config/preferences" mode="scanner"/>

            <h1>Network Vulnerability Test Preferences</h1>
            <xsl:for-each select="$config/preferences">
              <xsl:call-template name="preferences">
                <xsl:with-param name="config" select="$config/name"/>
              </xsl:call-template>
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </div>
</xsl:template>

<xsl:template name="html-configs-table">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">Scan Configs
      <a href="/help/configure_scanconfigs.html#scanconfigs"
         title="Help: Configure Scan Configs (Scan Configs)">
        <img src="/img/help.png"/>
      </a>
    </div>

    <div class="gb_window_part_content_no_pad">
      <div id="tasks">
        <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
          <tr class="gbntablehead2">
            <td rowspan="2">Name</td>
            <td colspan="2">Families</td>
            <td colspan="2">NVTs</td>
            <td width="100" rowspan="2">Actions</td>
          </tr>
          <tr class="gbntablehead2">
            <td width="1" style="font-size:10px;">Total</td>
            <td width="1" style="font-size:10px;">Trend</td>
            <td width="1" style="font-size:10px;">Total</td>
            <td width="1" style="font-size:10px;">Trend</td>
          </tr>
          <xsl:apply-templates select="config"/>
        </table>
      </div>
    </div>
  </div>
</xsl:template>

<!--     CREATE_CONFIG_RESPONSE -->

<xsl:template match="create_config_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Create Config</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!--     DELETE_CONFIG_RESPONSE -->

<xsl:template match="delete_config_response">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">Delete Config</xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- CONFIG -->

<xsl:template match="config">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td>
      <b><xsl:value-of select="name"/></b>
      <xsl:choose>
        <xsl:when test="comment != ''">
          <br/>(<xsl:value-of select="comment"/>)
        </xsl:when>
        <xsl:otherwise>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="family_count/text()='-1'">
          N/A
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="family_count/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td style="text-align:center;">
      <xsl:choose>
        <xsl:when test="family_count/growing='1'">
          <img src="/img/trend_more.png"
               alt="Grows"
               title="The family selection is DYNAMIC. New families will automatically be added and considered."/>
        </xsl:when>
        <xsl:when test="family_count/growing='0'">
          <img src="/img/trend_nochange.png"
               alt="Static"
               title="The family selection is STATIC. New families will NOT automatically be added or considered."/>
        </xsl:when>
        <xsl:otherwise>
          N/A
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="nvt_count/text()='-1'">
          N/A
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="nvt_count/text()"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td style="text-align:center;">
      <xsl:choose>
        <xsl:when test="nvt_count/growing='1'">
          <img src="/img/trend_more.png"
               alt="Dynamic"
               title="The NVT selection is DYNAMIC. New NVTs of selected families will automatically be added and considered."/>
        </xsl:when>
        <xsl:when test="nvt_count/growing='0'">
          <img src="/img/trend_nochange.png"
               alt="Static"
               title="The NVT selection is STATIC. New NVTs will NOT automatically be added or considered."/>
        </xsl:when>
        <xsl:otherwise>
          N/A
        </xsl:otherwise>
      </xsl:choose>
    </td>
    <td>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=delete_config&amp;name={name}"
             title="Delete Scan Config" style="margin-left:3px;">
            <img src="/img/delete.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/delete_inactive.png" border="0" alt="Delete"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
      <a href="/omp?cmd=get_config&amp;name={name}"
         title="Scan Config Details"
         style="margin-left:3px;">
        <img src="/img/details.png" border="0" alt="Details"/>
      </a>
      <xsl:choose>
        <xsl:when test="in_use='0'">
          <a href="/omp?cmd=edit_config&amp;name={name}"
             title="Edit Scan Config"
             style="margin-left:3px;">
            <img src="/img/edit.png" border="0" alt="Delete"/>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <img src="/img/edit_inactive.png" border="0" alt="Edit"
               style="margin-left:3px;"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </tr>
</xsl:template>

<!-- GET_CONFIGS_RESPONSE -->

<xsl:template match="get_configs_response">
  <xsl:call-template name="html-create-config-form"/>
  <xsl:call-template name="html-configs-table"/>
</xsl:template>

<!-- GET_CONFIG_RESPONSE -->

<xsl:template match="get_config_response">
  <xsl:call-template name="html-config-table"/>
</xsl:template>

<!-- GET_CONFIG_FAMILY_RESPONSE -->

<xsl:template match="get_config_family_response">
  <xsl:call-template name="html-config-family-table"/>
</xsl:template>

<!-- GET_CONFIG_NVT_RESPONSE -->

<xsl:template match="get_config_nvt_response">
  <xsl:call-template name="html-config-nvt-table"/>
</xsl:template>

<!-- END CONFIGS MANAGEMENT -->

<!-- BEGIN NVT DETAILS -->

<xsl:template match="nvt">
  <div id="nvtdetail">
    <table class="gbntable" cellspacing="2" cellpadding="4" border="0">
      <tr><td>Name:</td><td><xsl:value-of select="name"/></td></tr>
      <tr><td>Summary:</td><td><xsl:value-of select="summary"/></td></tr>
      <tr><td>Family:</td><td><xsl:value-of select="family"/></td></tr>
      <tr><td>OID:</td><td><xsl:value-of select="@oid"/></td></tr>
      <!-- "NOCVE" means no CVE ID, skip. -->
      <xsl:choose>
        <xsl:when test="cve_id = 'NOCVE'">
        </xsl:when>
        <xsl:otherwise>
          <tr><td>CVE:</td><td><xsl:value-of select="cve_id"/></td></tr>
        </xsl:otherwise>
      </xsl:choose>
      <!-- "NOBID" means no Bugtraq ID, skip. -->
      <xsl:choose>
        <xsl:when test="bugtraq_id = 'NOBID'">
        </xsl:when>
        <xsl:otherwise>
          <tr>
            <td>Bugtraq ID:</td><td><xsl:value-of select="bugtraq_id"/></td>
          </tr>
        </xsl:otherwise>
      </xsl:choose>
      <!-- "NOXREF" means no xrefs, skip. -->
      <xsl:choose>
        <xsl:when test="xrefs = 'NOXREF'">
        </xsl:when>
        <xsl:otherwise>
          <tr>
            <td>Other references:</td><td><xsl:value-of select="xrefs"/></td>
          </tr>
        </xsl:otherwise>
      </xsl:choose>
      <tr>
        <td colspan="2">
          <h3>Description</h3>
          <pre><xsl:value-of select="description"/></pre>
        </td>
      </tr>
    </table>
  </div>
</xsl:template>

<xsl:template match="get_nvt_details_response">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">NVT Details</div>
    <div class="gb_window_part_content_no_pad">
      <xsl:apply-templates select="nvt"/>
    </div>
  </div>
</xsl:template>

<!-- END NVT DETAILS -->

<!-- BEGIN REPORT DETAILS -->

<xsl:template match="get_report_response">
  <xsl:call-template name="html-report-details"/>
</xsl:template>

<!--     RESULT -->

<xsl:template match="result" mode="overview">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="port"/></td>
    <td><xsl:value-of select="threat"/></td>
  </tr>
</xsl:template>

<xsl:template match="result" mode="detailed">
  <xsl:variable name="style">
    <xsl:choose>
       <xsl:when test="threat='Low'">background:#539dcb</xsl:when>
       <xsl:when test="threat='Medium'">background:#f99f31</xsl:when>
       <xsl:when test="threat='High'">background:#cb1d17</xsl:when>
    </xsl:choose>
  </xsl:variable>
  <div class="issue_box_head" style="{$style}">
    <div style="float:right"><xsl:value-of select="port"/></div>
    <b><xsl:value-of select="threat"/></b>
    <div>
      NVT OID:
      <a href="?cmd=get_nvt_details&amp;oid={nvt}">
        <xsl:value-of select="nvt"/>
      </a>
    </div>
  </div>
  <div class="issue_box_box">
    <pre><xsl:value-of select="description"/></pre>
  </div>
  <br/>
</xsl:template>

<xsl:template match="get_report_response/report" mode="overview">
  <table class="gbntable" cellspacing="2" cellpadding="4">
    <tr class="gbntablehead2">
      <td>Host</td>
      <td><img src="/img/high.png" alt="High" title="High"/></td>
      <td><img src="/img/medium.png" alt="Medium" title="Medium"/></td>
      <td><img src="/img/low.png" alt="Low" title="Low"/></td>
      <td><img src="/img/log.png" alt="Log" title="Log"/></td>
      <td>Total</td>
    </tr>
    <xsl:for-each select="host_start" >
      <xsl:variable name="current_host" select="host/text()"/>
      <tr>
        <td>
          <a href="#{$current_host}"><xsl:value-of select="$current_host"/></a>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'High'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'Medium'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'Low'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host][threat/text() = 'Log'])"/>
        </td>
        <td>
          <xsl:value-of select="count(../results/result[host/text() = $current_host])"/>
        </td>
      </tr>
    </xsl:for-each>
    <tr>
      <td>Total: <xsl:value-of select="count(host_start)"/></td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'High'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'Medium'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'Low'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result[threat/text() = 'Log'])"/>
      </td>
      <td>
        <xsl:value-of select="count(results/result)"/>
      </td>
    </tr>
  </table>
</xsl:template>

<xsl:template match="port">
  <xsl:variable name="class">
    <xsl:choose>
      <xsl:when test="position() mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <tr class="{$class}">
    <td><xsl:value-of select="text()"/></td>
    <td><xsl:value-of select="threat"/></td>
  </tr>
</xsl:template>

<xsl:template match="get_report_response/report" mode="details">
  <xsl:for-each select="host_start" >
    <xsl:variable name="current_host" select="host/text()"/>
    <a name="{$current_host}"></a>
    <h2>
      Port summary for host &quot;<xsl:value-of select="$current_host"/>&quot;
    </h2>
    <table class="gbntable" cellspacing="2" cellpadding="4">
      <tr class="gbntablehead2">
        <td>Service (Port)</td>
        <td>Threat</td>
      </tr>
      <xsl:apply-templates select="../ports/port[host/text() = $current_host]"/>
    </table>
    <a name="{$current_host}"/>
    <h3>
      Security Issues reported for <xsl:value-of select="$current_host"/>
    </h3>
    <xsl:apply-templates
      select="../results/result[host/text() = $current_host]"
      mode="detailed"/>
    <a href="#summary">Back to summary</a>
  </xsl:for-each>
</xsl:template>

<!-- END REPORT DETAILS -->

<!-- GSAD_RESPONSE -->

<xsl:template match="gsad_response">
  <xsl:call-template name="error_dialog">
    <xsl:with-param name="title">
      <xsl:value-of select="title"/>
    </xsl:with-param>
    <xsl:with-param name="message">
      <xsl:value-of select="message"/>
    </xsl:with-param>
    <xsl:with-param name="backurl">
      <xsl:value-of select="backurl"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<!-- GSAD_NEWTASK -->

<xsl:template match="gsad_newtask">
  <xsl:apply-templates select="gsad_msg"/>

  <div class="gb_window_part_left"></div>
  <div class="gb_window_part_right"></div>
  <div class="gb_window_part_center">New Task
    <a href="/help/new_task.html#newtask" title="Help: New Task">
      <img src="/img/help.png"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <form action="/omp" method="post" enctype="multipart/form-data">
      <input type="hidden" name="cmd" value="create_task"/>
      <table border="0" cellspacing="0" cellpadding="3" width="100%">
        <tr>
         <td valign="top" width="125">Name</td>
         <td>
           <input type="text" name="name" value="unnamed" size="30"
                  maxlength="80"/>
         </td>
        </tr>
        <tr>
          <td valign="top">Scan Config</td>
          <td>
            <select name="scanconfig">
              <xsl:apply-templates select="get_configs_response/config"
                                   mode="newtask"/>
            </select>
          </td>
        </tr>
        <tr>
          <td>Scan Targets</td>
          <td>
            <select name="scantarget">
              <xsl:apply-templates select="get_targets_response/target"
                                   mode="newtask"/>
            </select>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align:right;">
            <input type="submit" name="submit" value="Create Task"/>
          </td>
        </tr>
      </table>
      <br/>
    </form>
  </div>
</xsl:template>

<!-- COMMANDS_RESPONSE -->

<xsl:template match="commands_response">
  <xsl:apply-templates/>
</xsl:template>

</xsl:stylesheet>
