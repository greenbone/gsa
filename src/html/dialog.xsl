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
Description: Non-OMP dialog pages for GSA.

Authors:
Henri Doreau <henri.doreau@greenbone.net>

Copyright:
Copyright (C) 2011 Greenbone Networks GmbH

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

<xsl:template match="dialog">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
       <xsl:apply-templates mode="dialog"/>
  </div>
</xsl:template>

<xsl:template mode="dialog" match="*">
  <div class="gb_window_part_center">Page Not Found</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <h1>Page Not Found</h1>

      <p>
        We apologize for any inconvenience.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="dialog" match="browse_infosec.html">
  <div class="gb_window_part_center">
    Lookup
    <a href="/help/browse_infosec.html?token={/envelope/token}"
        title="Help: InfoSec browser">
      <img src="/img/help.png" border="0"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <table>
        <tr>
          <td>
            <h1>NVT Lookup</h1>
          </td>
        </tr>
        <tr>
          <td>
            <form name="input"
                  action="/omp"
                  method="get">
              <input style="width: 240px" type="text" name="info_name" value="1.3.6.1.4.1.25623.1.0."/>
              <input type="hidden" name="cmd" value="get_info"/>
              <input type="hidden" name="info_type" value="NVT"/>
              <input type="hidden" name="token" value="{/envelope/token}"/>
              <input type="submit" value="Search"/>
            </form>
          </td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
