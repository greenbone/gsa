<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      extension-element-prefixes="gsa">
      <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>
<!--
Greenbone Security Assistant
$Id$
Description: Chinese Help documents for GSA.

Authors:
Winland Q. Yang <winland0704@126.com>

Copyright:
Copyright (C) 2014 Greenbone Networks GmbH

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

<xsl:include href="help.xsl"/>

<xsl:template name="availability_zh">
  <xsl:param name="command" select="GET_TASKS"/>
  <xsl:choose>
    <xsl:when test="/envelope/capabilities/help_response/schema/command[name=$command]">
    </xsl:when>
    <xsl:otherwise>
      <p>
        <b>注：</b> 当前版本 OMP 服务器连接还不支持这个特性。
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="trashcan-availability_zh">
  <xsl:choose>
    <xsl:when test="gsa:may-get-trash ()">
    </xsl:when>
    <xsl:otherwise>
      <p>
        <b>注：</b> 当前版本 OMP 服务器还不支持这个特性。
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>



<xsl:template name="list-window-line-actions_zh">
  <xsl:param name="type"/>
  <xsl:param name="used_by"/>
  <xsl:param name="noclone"/>
  <xsl:param name="noedit"/>
  <xsl:param name="noexport"/>
  <xsl:param name="notrashcan"/>
  <xsl:param name="showenable"/>
  <a name="actions"></a>
  <h3>动作</h3>

  <xsl:choose>
    <xsl:when test="$showenable">
      <h4>启用 / 禁用 <xsl:value-of select="$type"/></h4>
      <p>
      点击启用图标
      <img src="/img/enable.png" alt="启用 {$type}" title="启用 {$type}"/>
      将会设置 <xsl:value-of select="$type"/> 的活动状态为激活，
      而点击禁用图标
      <img src="/img/disable.png" alt="禁用 {$type}" title="禁用 {$type}"/>
      将会设置其为未激活状态。
      </p>
    </xsl:when>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$notrashcan">
    </xsl:when>
    <xsl:otherwise>
      <h4>移动 <xsl:value-of select="$type"/> 到回收站</h4>
      <p>
       点击回收站图标
       <img src="/img/trashcan.png" alt="移到回收站" title="移到回收站"/>
       将会移动该条目到回收站，并且当前列表会被更新。
      </p>
      <xsl:choose>
        <xsl:when test="$used_by">
          <p>
           请注意如果一个 <xsl:value-of select="$type"/> 关联到至少一个
           <xsl:value-of select="$used_by"/>， 它将不能被移到回收站。
           这种情况下按钮是显示灰色的
           <img src="/img/trashcan_inactive.png" alt="移到回收站" title="移到回收站"/>。
          </p>
        </xsl:when>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noedit">
    </xsl:when>
    <xsl:otherwise>
      <a name="edit_{gsa:type-string ($type)}"></a>
      <h4>编辑 <xsl:value-of select="$type"/></h4>
      <p>
       点击 "编辑 <xsl:value-of select="$type"/>" 图标
       <img src="/img/edit.png" alt="编辑 {$type}" title="编辑 {$type}"/>
       将会切换到这个 <xsl:value-of select="$type"/> 的配置视图并且
       允许编辑该 <xsl:value-of select="$type"/>的属性。
      </p>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noclone">
    </xsl:when>
    <xsl:otherwise>
      <h4>克隆 <xsl:value-of select="$type"/></h4>
      <p>
       点击克隆图标
       <img src="/img/clone.png" alt="克隆" title="克隆"/>
       将会创建该<xsl:value-of select="$type"/>的一个副本。
      </p>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noexport">
    </xsl:when>
    <xsl:otherwise>
      <h4>导出 <xsl:value-of select="$type"/></h4>
      <p>
        导出该 <xsl:value-of select="$type"/> 为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/>来实现。
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>



<xsl:template name="filtering_zh">
  <a name="filtering"></a>
  <h3>过滤</h3>
  <p>
    窗口的过滤部分展示所显示的列表是怎样被选择出来的。
  </p>
  <p>
    修改 “过滤器” 区域的任何值，然后点击刷新图标
    <img src="/img/refresh.png" alt="刷新"
    title="刷新"/>
    ，将会更新显示的列表。过滤器的语法在
    "<a href="/help/powerfilter.html?token={/envelope/token}">超强过滤器（Powerfilter）</a>"
    帮助页面描述。
  </p>
  <p>
    在第二个区域输入一个名字，然后点击新建图标
    <img src="/img/new.png"
         alt="新建"
         title="新建"/>
    ，将会从当前列表所应用的过滤器新建一个过滤器。
  </p>
  <p>
    当前过滤器也可以通过在最右边的下拉列表里选择来切换，点击刷新按钮
    <img src="/img/refresh.png" alt="刷新" title="刷新"/>
    切换过滤器。
  </p>
  <p>
    点击列表图标
    <img src="/img/list.png" border="0" alt="过滤器" title="过滤器"/>
    将会跳转到所有过滤器的列表，即到
    <a href="filters.html?token={/envelope/token}">过滤器（Filters）</a> 页面。
  </p>
</xsl:template>

<xsl:template name="sorting_zh">
  <a name="sorting"></a>
  <h3>排序</h3>
  <p>
    表格的排序可以通过点击一个列首（表头的任意一列）来更改。
    当前用于排序的列是作为一个关键词在超强过滤器（Powerfilter）里，例如
     "sort=name" 或 "sort-reverse=name" 。
  </p>
</xsl:template>


<xsl:template name="hosts_note_zh">
  <p>
    <b>主机</b>注释：
    <ul>
      <li>
        主机参数是一个逗号分隔的数值列表。每个数值可以是：
        <ul>
          <li>一个 IPv4 地址 (如 <tt>192.168.13.1</tt>)</li>
          <li>一个主机名 (如 <tt>myhost1.domain</tt>)</li>
          <li>一个 IPv4 地址段，长格式的
              (如 <tt>192.168.1.116-192.168.1.124</tt>)</li>
          <li>一个 IPv4 地址段，短格式的
              (如 <tt>192.168.1.116-124</tt>)</li>
          <li>一个 IPv4 地址段，无类别域间路由 CIDR 形式的
              (如 <tt>192.168.13.0/24</tt>)</li>
          <li>一个 IPv6 地址
              (如 <tt>fe80::222:64ff:fe76:4cea</tt>).</li>
          <li>一个 IPv6 地址段，长格式的
              (e.g. <tt>::12:fe5:fb50-::12:fe6:100</tt>)</li>
          <li>一个 IPv6 地址段，短格式的
              (如 <tt>::12:fe5:fb50-fb80</tt>)</li>
          <li>一个 IPv6 地址段，无类别域间路由 CIDR 形式的
              (如 <tt>fe80::222:64ff:fe76:4cea/120</tt>)</li>
        </ul>
        这些选项是可以混合的 (如
        <tt>192.168.13.1, myhost2.domain, fe80::222:64ff:fe76:4cea,
            192.168.13.0/24</tt>)。
      </li>
      <li>
        CIDR 形式的子网掩码对 IPv4 限制到 20 ，对 IPv6 限制到 116 （即 4095个主机）。        
      </li>
    </ul>
  </p>
</xsl:template>


<xsl:template mode="help" match="*">
  <div class="gb_window_part_center">帮助：网页没找到</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <h1>网页没找到（Page Not Found）</h1>

      <p>
        您请求的帮助页面未找到。如果您是遵循一个链接而看到这个页面，该帮助页面的位置可能已经被更改。
        这种情况下，请使用
        <a href="contents.html?token={/envelope/token}">内容列表</a>
        以导航到您正在寻找的页面。
      </p>

      <p>
        对给您带来的任何不便，我们表示歉意。
      </p>
    </div>
  </div>
</xsl:template>



<xsl:template mode="help" match="about.html">
  <div class="gb_window_part_center">关于 GSA</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <table><tr><td valign="top">

      <h1>Greenbone Security Assistant（绿骨安全助手）</h1>
      <h3>版本 5.0.0 </h3>

      <p>
      绿骨安全助手 GSA（ Greenbone Security Assistant）是开放漏洞评估系统 OpenVAS（Open Vulnerability Assessment System）的基于网页的用户图形界面。      
      GSA 通过 OpenVAS Management Protocol (OMP) 连接 OpenVAS Manager。
      通过实现完整的 OMP 特性集合，GSA 提供了一个直接了当的、非常强力的途径以管理网络漏洞扫描。
      </p>

      <p>
      版权 2009-2014 归属于 <a href="http://www.greenbone.net" target="_blank">Greenbone Networks GmbH</a>
      </p>

      <p>
      许可证： GNU 通用公共许可证版本 2 或以上
      (<a href="gplv2.html?token={/envelope/token}">完整的许可证文本</a>)
      </p>

      <p>
      联系方式：如需更新、提交特性建议、报告 Bug，请联系 
       <a href="http://www.greenbone.net/company/contact.html" target="_blank">
      Greenbone 团队</a> 或访问 <a href="http://www.openvas.org" target="_blank">OpenVAS 主页</a>。
      </p>

      <p>
      中文翻译：蔚蓝 （Long Live The Queen Marguerite !）
      </p>

      </td><td valign="top">
      <img border="5" src="/img/gsa_splash.png"/>
      </td>
      </tr></table>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="javascript.html">
  <div class="gb_window_part_center">帮助：JavaScript</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">
      <br/>
      <h1>JavaScript</h1>
      <p>
        JavaScript 指示图标
        <img src="/img/indicator_js.png" alt="JavaScript 已启用" title="JavaScript 已启用"/>
       在浏览器激活 JavaScript 时会显示在页面顶部。
      </p>
      <p>        
       GSA 自己仅将 JavaScript 用于一些次要的便利特性上，
       而所有其他功能运作都不需要任何 JavaScript 活跃内容。
       因此，禁用 JavaScript 对于使用 GSA 完全可行的，如果您不希望使用这些特性的话。
       您将不会失去任何必要的功能。
      </p>
      <p>        
        如果 JavaScript 是启用的，强烈建议您不要访问不受信任的网页，
        因为这些网页可能包含 尝试执行渗透或攻击您浏览器当前打开的其他网页服务 的 JavaScript 代码。
      </p>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="hosts.html">
  <div class="gb_window_part_center">帮助：主机</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=get_report&amp;type=assets&amp;overrides=1&amp;levels=hm&amp;token={/envelope/token}">跳到对话框</a></div>
    <div style="text-align:left">

      <br/>
      <h1>主机</h1>
      <p>
       本页面提供所有任务中所有主机的概览。
      </p>

      <a name="filtering"></a>
      <h2>主机过滤</h2>
      <p>
        主机过滤窗口显示扫描的主机是怎样过滤后形成概览页面。修改任意值并点击“应用”按钮将会更新概览页面。
      </p>

      <a name="overrides"></a>
      <h3>覆盖</h3>
      <p>
       默认情况下，已配置的 <a href="glossary.html?token={/envelope/token}#override">覆盖</a> 会被应用。
       这个选项允许切换到不应用覆盖的视图。
       当通过点击刷新<img src="/img/refresh.png" alt="刷新" title="刷新"/>图标来确认切换视图时，过滤后的主机列表中的主机和严重性计数可能会变化。
      </p>
      <p>
       当前页面的活跃选项通过勾号 (&#8730;) 来标记。   
      </p>

      <a name="filtered"></a>
      <h2>过滤后的主机</h2>
      <p>
        过滤后的主机窗口显示所有 根据主机过滤窗口规则过滤后的主机。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>IP</td>
          <td>
            主机的 IP 地址。
          </td>
        </tr>
        <tr>
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'High'"/>
            </xsl:call-template>
          </td>
          <td>
            最新报告的高危结果数量。
          </td>
        </tr>
        <tr class="odd">
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'Medium'"/>
            </xsl:call-template>
          </td>
          <td>
            最新报告的中危结果数量。
          </td>
        </tr>
        <tr>
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'Low'"/>
            </xsl:call-template>
          </td>
          <td>
            最新报告的低危结果数量。
          </td>
        </tr>
        <tr class="odd">
          <td>最后的报告</td>
          <td>
            链接到最新的报告。
          </td>
        </tr>
        <tr>
          <td>OS</td>
          <td>
            最新报告中检测到的操作系统的图标。
          </td>
        </tr>
        <tr class="odd">
          <td>端口</td>
          <td>
            最新报告中发现的开放端口数目。
          </td>
        </tr>
        <tr>
          <td>应用</td>
          <td>
           最新报告中检测到的应用程序数量，根据 CPE 来命名的。
          </td>
        </tr>
        <tr class="odd">
          <td>报告</td>
          <td>
            包含该主机的已完成报告的数量。
          </td>
        </tr>
        <tr>
          <td>距离</td>
          <td>
            在最新报告中，该主机到运行扫描器的服务主机的距离。
          </td>
        </tr>
        <tr>
          <td valign="top">预测</td>
          <td>
            该主机的最大严重性，根据目前对该主机的了解来预测。
            通过比较该主机上检测到的应用与存在漏洞的应用列表，来决定严重性分类。
            请注意该主机可能仅对特定的配置或应用程序组合才是脆弱的。
          </td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>动作</h3>

      <h4>预测报告</h4>
      <p>
       点击
       <a href="glossary.html?token={/envelope/token}#prognostic_report">预测报告</a>
       图标
       <img src="/img/prognosis.png" alt="预测报告" title="预测报告"/>
       将切换到该主机的一个预测报告页面。
      </p>


      <a name="host_details"></a>
      <h2>主机详情</h2>
      <p>
       提供关于该主机的详细信息。
       这包括过滤主机表格中该主机的全部信息，加上开放端口列表和应用程序列表。 
      </p>

      <a name="scap_missing"></a>
      <h2>警告：SCAP 数据库丢失</h2>
      <p>
        这个警告对话框在 OMP 服务器丢失 SCAP 数据库的时候 出现。
      </p>
      <p>
        预测报告需要 SCAP 数据。因此当该数据库丢失时，所有预测报告图标        
        <img src="/img/prognosis.png" alt="预测报告" title="预测报告"/>
        都将会变成灰色的
        <img src="/img/prognosis_inactive.png" alt="预测报告" title="预测报告"/>
      </p>
      <p>
        SCAP 数据是在 SCAP 数据订阅同步期间更新。该数据很可能在下次这样的订阅同步后出现。
        这通常由一个定期的后台进程来自动实现。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="agent_details.html">
  <div class="gb_window_part_center">帮助：代理详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_AGENTS'"/>
      </xsl:call-template>

      <h1>代理详情</h1>
      <p>
        提供关于
        <a href="glossary.html?token={/envelope/token}#agent">代理</a> 的详细信息。
        这包括名称、创建时间、修改时间、注释、安装包的信任状态和时间。
      </p>

      <h4>新建代理 </h4>
      <p>
        要新建一个代理的话，点击新建图标        
        <img src="/img/new.png" alt="新建代理" title="新建代理"/>
        ，将会跳转到 <a href="new_agent.html?token={/envelope/token}">
        新建代理</a> 的页面。
      </p>

      <h4>代理</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="代理" title="代理"/>
        将会切换到代理列表页面。
      </p>

      <h4>编辑代理</h4>
      <p>
        点击“编辑代理“图标
        <img src="/img/edit.png" alt="编辑代理" title="编辑代理"/>
        将会切换到配置这个代理的概览页面，并将允许编辑该代理的属性。
      </p>

      <h4>导出代理</h4>
      <p>
        导出该代理为 XML 文件，通过点击导出图标 
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="agents.html">
  <div class="gb_window_part_center">帮助：代理
    <a href="/omp?cmd=get_agents&amp;token={/envelope/token}"
       title="代理" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="代理"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_AGENTS'"/>
      </xsl:call-template>

      <h1>代理</h1>
      <p>
        本表格提供所有已配置的
        <a href="glossary.html?token={/envelope/token}#agent">代理</a> 的概览，
        并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示代理的名称，并且如果指定了注释，其注释会显示在名称下方的括号里。
              </td>
        </tr>
        <tr class="even">
          <td>信任</td>
          <td>
            <b>是</b>：上传的签名文件或提交给订阅的签名文件，证明该代理在上传时没被损害。
            <br/>
            <b>否</b>： 签名和代理不匹配或签名密钥不可信。
            <br/>
            <b>未知</b>：信任程度无法被恰当测试的任何情况。
          </td>
        </tr>
      </table>

      <h3>新建代理</h3>
      <p>
        要创建一个代理的话，点击新建图标
        <img src="/img/new.png" alt="新建代理" title="新建代理"/> 
        将跳转到 <a href="new_agent.html?token={/envelope/token}">新建代理</a>页面。       
      </p>

      <h3>导出</h3>
      <p>
        导出当前的代理列表为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'代理'"/>
      </xsl:call-template>

      <h4>下载安装程序包</h4>
      <p>
       点击 “下载安装程序包” 图标
       <img src="/img/agent.png" alt="下载安装程序包"
            title="下载安装程序包"/>
       将会下载一个该代理的安装程序包。
      </p>

      <h4>验证代理</h4>
      <p>
       点击 “验证代理” 图标
       <img src="/img/verify.png" alt="验证代理" title="验证代理"/>
       将会验证该代理安装程序包的信任程度。
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_agent.html">
  <div class="gb_window_part_center">帮助：新建代理
    <a href="/omp?cmd=new_agent&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
          <xsl:with-param name="command" select="'CREATE_AGENT'"/>
      </xsl:call-template>

      <h1>新建代理</h1>
      <p>
        用于创建一个新的
        <a href="glossary.html?token={/envelope/token}#agent">代理</a> ，
        该对话框提供如下这些条目。
        点击按钮 “创建代理” 将会提交新代理。创建后，代理页面将会被呈现。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>WinSLAD Base 1.0</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>Base agent for Windows SLAD family.</td>
        </tr>
        <tr class="odd">
          <td>安装程序</td>
          <td>是</td>
          <td>--</td>
          <td>文件</td>
          <td>/tmp/WinSLAD-Base-1.0.exe</td>
        </tr>
        <tr class="even">
          <td>安装程序签名</td>
          <td>否</td>
          <td>--</td>
          <td>文件 (配备了 GnuPG 独立的签名)</td>
          <td>/tmp/WinSLAD-Base-1.0.exe</td>
        </tr>
      </table>
      <p>
        当提供了签名文件时，代理文件会在上传时通过这个签名来被验证，以决定其信任程度。
      </p>
      <p>
        当没有提供签名文件时，OpenVAS 将会在 NVT 订阅里搜寻一个合适的签名。
        如果找到了，信任程度将会由这个签名文件决定。
      </p>

      <h4>代理</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="代理" title="代理"/>
       将会切换到 <a href="agents.html?token={/envelope/token}">代理</a> 页面。       
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="lsc_credentials.html">
  <div class="gb_window_part_center">帮助：证书
    <a href="/omp?cmd=get_lsc_credentials&amp;token={/envelope/token}"
       title="证书" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="证书"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_LSC_CREDENTIALS'"/>
      </xsl:call-template>

      <h1>证书</h1>
      <p>
        本表提供一个所有已配置的
        <a href="glossary.html?token={/envelope/token}#lsc_credential">证书</a> 的概览，
        并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示证书的名称</td>
        </tr>
        <tr class="even">
          <td>登录名</td>
          <td>显示提供给该证书的登录名称</td>
        </tr>
      </table>

      <h3>新建证书</h3>
      <p>
        为创建一个新的证书（lsc_credential），点击新建图标
        <img src="/img/new.png" alt="新建证书" title="新建证书"/>
        将跳转到
        <a href="new_lsc_credential.html?token={/envelope/token}">新建证书</a> 页面。
      </p>

      <h3>导出</h3>
      <p>
        导出当前证书列表为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'证书'"/>
      </xsl:call-template>

      <h4>下载 RPM 包</h4>
      <p>
       点击 RPM 图标
       <img src="/img/rpm.png" alt="下载 RPM 包" title="下咋 RPM 包"/>
       将会下载一个 ".rpm" 安装包。
      </p>
      <p>    
       通过安装这个包到基于 RPM 的系统（如 SUSE, RedHat, Fedora, CentOS），
       一个低权限的用户账户会创建到目标系统里，以允许扫描引擎访问系统，
       获取关于已安装软件和其他产品的信息。卸载该软件包就可以禁用其访问。
      </p>

      <h4>下载 Debian 包</h4>
      <p>
       点击 Debian 图标
       <img src="/img/deb.png" alt="下载 Debian 包" title="下载 Debian 包"/>
       将会下载一个 ".deb" 安装包。
      </p>
      <p>
       通过安装这个包到基于 dpkg 的系统（如 Debian, Ubuntu），
       一个低权限的用户账户会创建到目标系统里，以允许扫描引擎访问系统，
       获取关于已安装软件和其他产品的信息。卸载该软件包就可以禁用其访问。
      </p>

      <h4>下载 Exe 包</h4>
      <p>
       点击 Exe 图标
       <img src="/img/exe.png" alt="下载 Exe 包" title="下载 Exe 包"/>
       将会下载一个 ".exe" 安装包。
      </p>
      <p>
       通过安装这个包到 Windows 系统（如 XP, 2003），
       一个低权限的用户账户会创建到目标系统里，以允许扫描引擎访问系统，
       获取关于已安装软件和其他产品的信息。卸载该软件包就可以禁用其访问。
      </p>

      <h4>下载公钥</h4>
      <p>
       点击公钥图标
       <img src="/img/key.png" alt="下载公钥" title="下载公钥"/>
       将会下载一个 ASCII 形式的 SSH 公钥。
      </p>
      <p>
       这个公钥对应于 RPM 和 Debian 包使用的密钥。（这些跟 Exe 包无关。）
       这个公钥文件可用于支持专家用户，他们自己准备目标系统的本地安全检查
      （例如，不需要上面提供的 RPM/Debian 包）。
      </p>

      <p>
       请注意 根据所选的指定密码的方法（手动或自动生成），一些动作可能不可用。
       特别地，当手动提供密码时，仅有 删除、编辑、克隆和导出 动作是可用的。
      </p>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="new_lsc_credential.html">
  <div class="gb_window_part_center">帮助：新建证书
    <a href="/omp?cmd=new_lsc_credential&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
          <xsl:with-param name="command" select="'CREATE_LSC_CREDENTIAL'"/>
      </xsl:call-template>

      <p>
        为了允许 <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> 
        测试登录到目标系统以执行本地检查，如列出存在的所有供应商的安全补丁，
        用于本地安全检查的证书是必需的。
      </p>
      <h1>新建证书</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#lsc_credential">证书</a>，
        对话框提供了下面这些条目。
        点击按钮 “创建证书” 将提交新的证书（lsc_credential）。创建后，将会显示证书页面。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Security Scan Account</td>
        </tr>
        <tr class="even">
          <td>登录名</td>
          <td>否</td>
          <td>80</td>
          <td>字母数字<br/>如果不是自动生成也可用 "\@_.-"</td>
          <td>jsmith<br/>
              myDomain\jsmith<br/>
              jsmith@myDomain</td>
        </tr>
        <tr class="odd">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>For the Windows systems</td>
        </tr>
        <tr class="even">
          <td>[密码选项]</td>
          <td>是</td>
          <td>"自动生成证书" 或 一个指定的密码 (40)</td>
          <td>自由形式的文本</td>
          <td>"自动生成证书", hx7ZgI2n</td>
        </tr>
      </table>

      <p>
        用于创建一个新证书对的对话框，允许指定一个密码或生成一个安全密码。
        请注意如果选择后者，用户就不能或不允许访问密码和所谓的私有密钥。
        作为替代的，安装包将会被创建，可用于安装到目标系统。
        这些安装包的内幕由证书帮助页面的 
        <a href="lsc_credentials.html?token={/envelope/token}#actions">动作</a> 一节解释。
        这些动作在手动制定密码时是不可用的。  
      </p>
      <p>
        <b>请注意</b> 您需要将证书关联到一个或多个
        <a href="glossary.html?token={/envelope/token}#target">目标</a> ，
        并安装该证书到目标系统里。
        只有这样，最终才会允许扫描引擎应用合适的证书。
      </p>

      <p>        
        请注意：根据微软域控制器的文档，如果您的登录名使用德语变元音，
        您可以使用 "ss" 为 "ß", "a" 为 "ä" 等。
        在其他情况，使用德语变元音的登录名是无法工作的。（建议登录名不要使用特殊符号。）
      </p>

      <h4>证书</h4>
      <p>
       点击列表按钮
       <img src="/img/list.png" alt="证书" title="证书"/>
       将会切换到
       <a href="lsc_credentials.html?token={/envelope/token}"> 证书
       </a> 页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="lsc_credential_details.html">
  <div class="gb_window_part_center">帮助：证书详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_LSC_CREDENTIALS'"/>
      </xsl:call-template>

      <h1>证书详情</h1>
      <p>
        提供关于 
        <a href="glossary.html?token={/envelope/token}#lsc_credential">证书</a> 的详细信息。       
        这包括 名称、注释、登录名、ID、创建时间和修改时间。
      </p>

      <h4>新建证书 </h4>
      <p>
        为了创建一个新的证书（lsc credential），点击新建图标
        <img src="/img/new.png" alt="新建证书" title="新建证书"/>
        将会跳转到 <a href="new_lsc_credential.html?token={/envelope/token}">
        新建证书</a> 页面。
      </p>

      <h4>证书</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="证书" title="证书"/>
        将会切换到证书页面。
      </p>

      <h4>编辑证书</h4>
      <p>
        点击 “编辑证书” 的图标
        <img src="/img/edit.png" alt="编辑证书" title="编辑证书"/>
        将会切换到配置该证书的概览视图，并允许编辑证书的属性。
      </p>

      <h4>导出证书</h4>
      <p>
        导出证书为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <h3>使用该证书的目标</h3>
      <p>
        这个表格提供关联该证书的主机的概览，这些主机的详情可以通过点击详情图标      
        <img src="/img/details.png" alt="详情" title="详情"/> 来查看。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_alert.html">
  <div class="gb_window_part_center">帮助：新建警报
    <a href="/omp?cmd=new_alert&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_ALERT'"/>
      </xsl:call-template>

      <a name="newalert"></a>
      <h1>新建警报</h1>

      <p>
       警报可以添加到 <a href="glossary.html?token={/envelope/token}#task">任务</a> 里。
       警报被勾联到系统里。当一个已配置的事件发生时（如任务完成了），
       一个选定的条件会被检查（如检测到高危漏洞）。
       如果条件匹配，一个动作将会被实施（如发一封电子邮件到指定的地址）。
      </p>

      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#alert">警报</a>，
        该对话框提供了下面这些条目。       
        点击按钮 “创建警报” 就会提交新的警报。创建后会显示警报页面。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>EmailFinished</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>检测到高危漏洞就发电子邮件</td>
        </tr>
        <tr class="odd">
          <td>事件</td>
          <td>是</td>
          <td>---</td>
          <td>选择</td>
          <td>已完成</td>
        </tr>
        <tr class="even">
          <td>条件</td>
          <td>是</td>
          <td>--</td>
          <td>选择</td>
          <td>总是</td>
        </tr>
        <tr class="odd">
          <td>方式</td>
          <td>是</td>
          <td>--</td>
          <td>选择</td>
          <td>Email</td>
        </tr>
        <tr class="even">
          <td>
            报告结果过滤器
            <xsl:if test="not (gsa:may-op ('get_filters'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>--</td>
          <td>选择</td>
          <td></td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_filters'))">
        <b>*</b> 对当前 OMP 服务器连接不可用。
      </xsl:if>

      <h2>警报方式</h2>

      <h3>HTTP Get</h3>

      <p>
      URL 网址将被作为 HTTP GET 来使用。
      这可以用于例如通过一个 HTTP GET 网关自动发送 SMS 信息，或自动创建一个 bug 报告到问题追踪器里。
      </p>

      <p>
      URL 中如下替换将被会实现：
      </p>

      <ul>
      <li> $$: $ </li>
      <li> $n: 任务名称 </li>
      <li> $e: 时间描述 </li>
      <li> $c: 条件描述 </li>
      </ul>

      <h4>警报</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="警报" title="警报"/>
       将会切换到 <a href="alerts.html?token={/envelope/token}">警报</a>
       页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="alerts.html">
  <div class="gb_window_part_center">帮助：警报
    <a href="/omp?cmd=get_alerts&amp;token={/envelope/token}"
       title="警报" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="警报"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_ALERTS'"/>
      </xsl:call-template>

      <a name="alerts"></a>
      <h1>警报</h1>
      <p>
       本表提供所有已配置的
       <a href="glossary.html?token={/envelope/token}#alert">警报</a> 的概览，
       展示了警报条目的完整内容（名称、事件、条件、方式、过滤器）。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示警报的名称，如果指定了注释，其会显示在名称下方的括号里。</td>
        </tr>
        <tr class="even">
          <td>事件</td>
          <td>显示用于触发条件检查的事件。</td>
        </tr>
        <tr class="odd">
          <td>条件</td>
          <td>指定事件发生时，触发检查该条件。</td>
        </tr>
        <tr class="even">
          <td>方式</td>
          <td>条件检查满足后，发送通知的方式。</td>
        </tr>
        <tr class="even">
          <td>过滤器</td>
          <td>报告过滤器。</td>
        </tr>
      </table>

      <h3>新建警报</h3>
      <p>
        为创建一个警报，点击新建图标
        <img src="/img/new.png" alt="新建警报" title="新建警报"/>
        将跳转到 <a href="new_alert.html?token={/envelope/token}">新建警报</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出当前的警报列表为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/>来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'警报'"/>
        <xsl:with-param name="used_by" select="'任务'"/>
      </xsl:call-template>

      <h4>测试警报</h4>
      <p>
       通过点击开始图标
       <img src="/img/start.png" alt="测试警报" title="测试警报"/>，
       相应警报就会立即执行，发送一些假的数据。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="alert_details.html">
  <div class="gb_window_part_center">帮助：警报详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_ALERTS'"/>
      </xsl:call-template>

      <h1>警报详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#alert">警报</a> 的详细信息。
        这包括名称、注释、创建时间、修改时间、条件、事件、方式和过滤器。        
      </p>

      <h4>新建警报 </h4>
      <p>
      为创建一个新的警报，点击新建图标
      <img src="/img/new.png" alt="新建警报" title="新建警报"/>
      将会跳转到 <a href="new_alert.html?token={/envelope/token}">
      新建警报</a> 页面。
      </p>

      <h4>警报</h4>
      <p>
      点击列表图标
       <img src="/img/list.png" alt="警报" title="警报"/>
       将会切换到警报页面。
      </p>

      <h4>导出</h4>
      <p>
        导出该警报为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
      <h3>使用该警报的任务</h3>
      <p>
        这个表格提供 关联到该警报的任务的概览（如果有的话）。
        这些任务的详情可以通过点击详情图标
         <img src="/img/details.png" alt="详情" title="详情"/> 来查看。          
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="port_lists.html">
  <div class="gb_window_part_center">帮助：端口列表
    <a href="/omp?cmd=get_port_lists&amp;token={/envelope/token}"
       title="端口列表" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="端口列表"/>
    </a>
  </div>

  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_PORT_LISTS'"/>
      </xsl:call-template>

      <h1>端口列表</h1>
      <p>
        本表提供所有已配置的
        <a href="glossary.html?token={/envelope/token}#port_list">
           端口列表
        </a> 的一个概览，并概括了每个条目的重点。        
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示端口列表的名称，如果指定了注释，会显示在名称下方的括号里。</td>
        </tr>
        <tr class="even">
         <td>端口计数 - 总计</td>
         <td>
           端口列表中的端口总数。
         </td>
        </tr>
        <tr class="odd">
         <td>端口计数 - TCP</td>
         <td>
           端口列表中的 TCP 端口总数。
         </td>
        </tr>
        <tr class="even">
         <td>端口计数 - UDP</td>
         <td>
           端口列表中的 UDP 端口总数。
         </td>
        </tr>
      </table>

      <a name="predefined_port_lists"></a>
      <h2>预定义的端口列表</h2>
      <p>
        预定义的端口列表包括：
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>名称</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>All IANA assigned TCP 2012-02-10</td>
          <td>
            IANA（互联网号码分配局）分配的全部 TCP 端口，在2012年2月10日发布的版本。
          </td>
        </tr>
        <tr class="odd">
          <td>All IANA assigned TCP and UDP 2012-02-10</td>
          <td>
            IANA 分配的全部 TCP 和 UDP 端口，在2012年2月10日发布的版本。
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP</td>
          <td>
            所有 TCP 端口。
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP and Nmap 5.51 top 100 UDP</td>
          <td>
           所有的 TCP 端口和 Nmap 5.51 版本排名前100的 UDP 端口。
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP and Nmap 5.51 top 1000 UDP</td>
          <td>
           所有的 TCP 端口和 Nmap 5.51 版本排名前1000的 UDP 端口。
          </td>
        </tr>
        <tr class="odd">
          <td>All privileged TCP</td>
          <td>
            所有的特权 TCP 端口。（知名端口号，1024 以下的端口）
          </td>
        </tr>
        <tr class="odd">
          <td>All privileged TCP and UDP</td>
          <td>
            所有的特权 TCP 端口和特权 UDP 端口。
          </td>
        </tr>
        <tr class="odd">
          <td>Nmap 5.51 top 2000 TCP and top 100 UDP</td>
          <td>
             Nmap 5.51 版本排名前2000的 TCP 端口和前100的 UDP 端口。
          </td>
        </tr>
        <tr class="odd">
          <td>OpenVAS Default</td>
          <td>
            当传递 "default" 端口范围首选项给 OpenVAS-4 扫描器的时候，该扫描器扫描的 TCP 端口列表。
          </td>
        </tr>
      </table>

      <h3>新建端口列表</h3>
      <p>
        为创建一个新的端口列表，点击新建图标
        <img src="/img/new.png" alt="新建端口列表"
             title="新建端口列表"/>
        将会跳转到 <a href="new_port_list.html?token={/envelope/token}">新建端口列表</a> 页面。
      </p>

      <h3>导出</h3>
      <p>
        导出端口列表的当前列表为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'端口列表'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="new_port_list.html">
  <div class="gb_window_part_center">帮助：新建端口列表
    <a href="/omp?cmd=new_port_list&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
          <xsl:with-param name="command" select="'CREATE_PORT_LIST'"/>
      </xsl:call-template>

      <h1>新建端口列表</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#port_list">端口列表</a>
        该对话框提供下面这些条目。
        点击按钮 “创建端口列表” 将会提交新的端口列表。
        点击按钮 “导入端口列表” 将会导入一个新的端口列表。
        新建后会呈现端口列表页面。 
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>All privileged UDP</td>
        </tr>
        <tr class="odd">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>Every privileged UDP port.</td>
        </tr>
        <tr class="odd">
          <td>端口范围</td>
          <td>是</td>
          <td>400</td>
          <td>逗号分隔的端口范围列表，可以直接填写或从文件导入</td>
          <td>U:1-1023</td>
        </tr>
      </table>

      请注意 <b>端口范围</b> 的填写：
      <ul>
        <li>         
          端口范围参数一个逗号分隔的数值列表。列表可以直接输入或从文件导入。
          在文件中换行符和逗号都可分隔数值。列表中每个数值可以是：
          <ul>
            <li>一个单一的端口 (如 <tt>7</tt>)</li>
            <li>一个端口范围 (如 <tt>9-11</tt>)</li>
          </ul>
         这些选项可以混合 (如 <tt>1-3,7,9-11</tt>)。
        </li>
        <li>      
          列表中数值前面可以加一个协议指示符，"T:" 或 "U:" 都可以。
          这协议指示符的效果对所有后续的端口范围都管用（直到下个不同的指示符或结束）。
          例如 <tt>T:1-3,U:7,9-11</tt> 定义了 TCP 端口 1, 2, 3, 和 UDP 端口 7, 9, 10, 11。
        </li>
        <li>
          多个协议指示符会切换协议，例如
          <tt>T:1-3,U:7,T:9-11</tt> 定义了 TCP 端口 1, 2, 3, 9, 10, 11,
          和 UDP 端口 7。
        </li>
        <li>
          初始的协议是 TCP，因此例如 <tt>1-3,U:7</tt>
          定义了 TCP 端口 1, 2, 3, 和 UDP 端口 7。
        </li>
      </ul>

      <a name="import_port_list"></a>
      <h1>导入端口列表</h1>
      <p>   
        为导入一个端口列表，选择导入文件并点击 “导入端口列表” 按钮提交该端口列表。
        端口列表的列表视图将会被更新。
        请注意，如果端口列表已经存在于您的系统里，或与一个现有的端口列表重名，
        导入会失败并提示错误消息。 
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>导入端口列表</td>
          <td>是</td>
          <td>--</td>
          <td>文件</td>
          <td>/tmp/port_list.xml</td>
        </tr>
      </table>

      <h4>端口列表</h4>
      <p>
        点击列表按钮
        <img src="/img/list.png" alt="端口列表" title="端口列表"/>
        将会切换到
        <a href="port_lists.html?token={/envelope/token}">端口列表</a>
        页面
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="port_list_details.html">
  <div class="gb_window_part_center">帮助：端口列表详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_PORT_LISTS'"/>
      </xsl:call-template>

      <h1>端口列表详情</h1>
      <p>
        提供关于
        <a href="glossary.html?token={/envelope/token}#port_list">
        端口列表</a> 的详细信息。这包括名称、创建时间、修改时间、端口计数、
        TCP 端口计数、UDP 端口计数、端口范围和使用该端口列表的目标。
      </p>

      <h4>新建端口列表 </h4>
      <p>
        为创建一个新的端口列表，点击新建图标
        <img src="/img/new.png" alt="新建端口列表" title="新建端口列表"/>
        将会跳转到 <a href="new_port_list.html?token={/envelope/token}">
        新建端口列表</a> 页面。
      </p>

      <h4>端口列表</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="端口列表" title="端口列表"/>
        将会切换到端口列表页面。
      </p>

      <h4>导出端口列表</h4>
      <p>
        导出端口列表为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <h3>端口范围</h3>
      <p>
        这个表格列出该端口列表里所有的端口范围。
      </p>

      <h3>使用该端口列表的目标</h3>
      <p>
        这个表格提供关联到该端口列表的目标的概览。这些目标的详情可以通过点击详情图标      
        <img src="/img/details.png" alt="详情" title="详情"/> 来查看。
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="report_formats.html">
  <div class="gb_window_part_center">帮助：报告格式
    <a href="/omp?cmd=get_report_formats&amp;token={/envelope/token}"
       title="报告格式" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="报告格式"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_REPORT_FORMATS'"/>
      </xsl:call-template>

      <h1>报告格式</h1>
      <p>
        本表提供所有已配置的
        <a href="glossary.html?token={/envelope/token}#report_format">
            报告格式
        </a> 的概览，并概括了每个条目的重点。       
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示该报告格式的名称，如果指定了摘要，其会显示在名称下方的括号里。</td>
        </tr>
        <tr class="even">
          <td>扩展名</td>
          <td>
              结果报告格式的扩展名。
          </td>
        </tr>
        <tr class="odd">
          <td>内容类型</td>
          <td>
            结果报告格式的内容类型。
          </td>
        </tr>
        <tr class="even">
          <td>信任</td>
          <td>
            <b>是</b>：报告格式里嵌入的签名，或存在于订阅里的签名，
            证明该报告格式在上传时没被损害。
            <br/>
            <b>否</b>：签名和报告格式不匹配或签名密钥不可信。
            <br/>
            <b>未知</b>：信任程度不能恰当测试的任何情况。
            <br/>
            最后验证时间也显示在括号里。
          </td>
        </tr>
      </table>

      <a name="predefined_report_formats"></a>
      <h3>预定义的报告格式</h3>
      <p>
        预定义的报告格式包括：
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>名称</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>PDF</td>
          <td>
            从报告详情里创建的单一 PDF 文件。
          </td>
        </tr>
        <tr class="even">
          <td>HTML</td>
          <td>
            从报告详情里创建的单一 HTML 文件。
            这个类似于通过点击动作图标 “详情” 创建的页面，
            但这是一个自包含的文档，可以独立于 GSA 之外来浏览。
           </td>
        </tr>
        <tr class="odd">
          <td>XML</td>
          <td>             
            从报告详情里创建的单一 XML 文件。这可以成为您创建自己风格报告的基础，
            或方便采用其他方式对结果进行后期处理。
          </td>
        </tr>
        <tr class="even">
          <td>TXT</td>
          <td>
            A single plain text file is created from the report details.
            从报告详情里创建的单一纯文本文件。
          </td>
        </tr>
        <tr class="odd">
          <td>NBE</td>
          <td>            
            创建一个 NBE 文件。这个格式可被 OpenVAS-Client 支持，
            并在过去经常用于结果的后期处理。
            这种格式主要是出于兼容性目的来提供的。
            建议设置基于 XML 文件的后期处理，而不是基于 NBE 文件的。
          </td>
        </tr>
        <tr class="even">
          <td>ITG</td>
          <td>           
            从报告中收集 IT-Grundschutz（IT基本保障） 扫描的表格式结果，
            并组成一个单一的 CSV 文件，用于简单集成到电子表格程序或数据库中。 
          </td>
        </tr>
        <tr class="odd">
          <td>CPE</td>
          <td>
            从报告中收集 CPE 库扫描的表格式结果，
            并组成一个单一的 CSV 文件，用于简单集成到电子表格程序或数据库中。
          </td>
        </tr>
      </table>

      <h3>新建报告格式</h3>
      <p>
        为创建一个新的报告格式，点击新建图标
        <img src="/img/new.png" alt="新建报告格式"
             title="新建报告格式"/>
        将会切换到 <a href="new_report_format.html?token={/envelope/token}">新建报告格式</a> 页面。
      </p>

      <h3>导出</h3>
      <p>
        导出报告格式的当前列表为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'报告格式'"/>
      </xsl:call-template>

      <h4>验证报告格式</h4>
      <p>
       点击验证图标
       <img src="/img/verify.png" alt="验证" title="验证"/>
       将会验证报告格式文件的信任程度。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_report_format.html">
  <div class="gb_window_part_center">帮助：新建报告格式
    <a href="/omp?cmd=new_report_format&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
          <xsl:with-param name="command" select="'CREATE_REPORT_FORMAT'"/>
      </xsl:call-template>

      <h1>新建报告格式</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#report_format">报告格式</a>
        该对话框提供下面这些条目。
        点击按钮 “导入报告格式” 提交新的报告格式。
        创建后报告格式页面将会被显示。
        请注意如果该报告格式已经存在于您的系统，或者与一个现有的报告格式重名，
        那么导入会失败并提示一个错误消息。       
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>导入 XML 报告格式</td>
          <td>是</td>
          <td>--</td>
          <td>文件</td>
          <td>/tmp/custom_reporter.xml</td>
        </tr>
      </table>

      <h4>报告格式</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="报告格式" title="报告格式"/>
        将会切换到
        <a href="report_formats.html?token={/envelope/token}">报告格式</a>
        页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="report_format_details.html">
  <div class="gb_window_part_center">帮助：报告格式详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_REPORT_FORMATS'"/>
      </xsl:call-template>

      <h1>报告格式详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#report_format">
        报告格式</a> 的详细信息。
        这包括名称、创建时间、修改时间、扩展名、内容类型、信任程度、活跃状态、
        摘要、描述和参数。    
      </p>

      <h4>新建报告格式 </h4>
      <p>
        为创建一个新的报告格式，点击新建图标
        <img src="/img/new.png" alt="新建报告格式" title="新建报告格式"/>
        将会跳转到 <a href="new_report_format.html?token={/envelope/token}">
        新建报告格式</a> 页面。
      </p>

      <h4>报告格式</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="报告格式" title="报告格式"/>
        将会切换到报告格式页面。
      </p>

      <h4>编辑报告格式</h4>
      <p>
        点击 “编辑报告格式” 图标 
        <img src="/img/edit.png" alt="编辑报告格式" title="编辑报告格式"/>
        将会切换到配置该报告格式的概览视图，并允许该编辑报告格式的属性。         
      </p>

      <h4>导出报告格式</h4>
      <p>
        导出报告格式为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
      <h3>参数</h3>
      <p>
        这个表格提供一个参数列表，用于控制该格式报告的创建。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configs.html">
  <div class="gb_window_part_center">帮助：扫描配置
    <a href="/omp?cmd=get_configs&amp;token={/envelope/token}"
       title="扫描配置" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="扫描配置"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <h1>扫描配置</h1>
      <p>
        本表提供所有已配置的         
        <a href="glossary.html?token={/envelope/token}#config">扫描配置</a> 的概览。
        扫描配置条目的摘要信息如下所示。        
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>
              显示扫描配置的名称，如果指定了注释，将会显示在名称下方的括号里。</td>
        </tr>
        <tr>
          <td>家族 ： 总计</td>
          <td>当前 NVT 扫描集合所考虑的 NVT 家族数目。
              "N/A" 表示目前该数目不可用。 </td>
        </tr>
        <tr class="odd">
          <td>家族 ： 趋势</td>
          <td>这个域可以有两种状态： “增长”               
              (<img src="/img/trend_more.png"/>) 或 “静态” 
              (<img src="/img/trend_nochange.png"/>)。
              “增长” 意味着关联到该扫描配置的 NVT 选取  指定为包含任何添加到 NVT 集合里的新家族。
              “静态” 意味着，关联到该扫描配置的 NVT 选取 有一个明确的定义，决定哪些家族被考虑。
              </td>
        </tr>
        <tr>
          <td>NVTs： 总计</td>
          <td>当前 NVT 集合会考虑的 NVT 测试项的总数。 "N/A" 表示目前该数目不可用。
              </td>
        </tr>
        <tr class="odd">
          <td>NVTs： 趋势</td>
          <td>这个域可以有两种状态： “增长”
              (<img src="/img/trend_more.png"/>) 或 “静态”
              (<img src="/img/trend_nochange.png"/>)。
              “增长” 意味着关联到该扫描配置的 NVT 选取  指定为，
              至少对一个所选取的家族，包含添加到其 NVT 集合里的新 NVT 测试项。
              “静态” 意味着，关联到该扫描配置的 NVT 选取 有一个明确的定义，决定哪些 NVT 测试项被考虑。
              </td>
        </tr>
      </table>

      <h3>新建扫描配置</h3>
      <p>
        为创建一个新的扫描配置，点击新建图标
        <img src="/img/new.png" alt="新建扫描配置" title="新建扫描配置"/>
        将会跳转到 <a href="new_config.html?token={/envelope/token}">新建扫描配置</a>
        页面。
      </p>

      <a name="export"></a>
      <h3>导出</h3>
      <p>
        导出扫描配置的当前列表为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'扫描配置'"/>
        <xsl:with-param name="used_by" select="'任务'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_config.html">
  <div class="gb_window_part_center">帮助：新建扫描配置
    <a href="/omp?cmd=new_config&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
          <xsl:with-param name="command" select="'CREATE_CONFIG'"/>
      </xsl:call-template>

      <a name="new_config"></a>
      <h1>新建扫描配置</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#config">扫描配置</a>
        该对话框提供下面这些条目。
        点击按钮 “创建扫描配置” 以提交新的扫描配置。
        点击按钮 “导入扫描配置” 以导入一个新的扫描配置。
        新建后会显示扫描配置页面。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Full and deep scan</td>
        </tr>
        <tr>
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>All-inclusive scan which might consume quite some time.</td>
        </tr>
        <tr class="odd">
          <td>基于</td>
          <td>是</td>
          <td>---</td>
          <td>一个预定义的基本扫描配置</td>
          <td>Empty, static and fast<br/>
              Full and Fast</td>
        </tr>
      </table>

      <a name="import_config"></a>
      <h1>导入扫描配置</h1>
      <p>
        为导入一个扫描配置，选择配置文件并点击 “导入扫描配置” 按钮以提交该扫描配置。
        扫描配置的列表将会被更新。
        请注意如果该扫描配置的名称已经存在于您的系统，
        一个数字后缀会被添加到导入的扫描配置的名称里。
      </p>
      <p>
        为创建一个可被导入的文件（比如您有多个 GSA 运行在不同的机器上），
        参考 <a href="configs.html?token={/envelope/token}#export">导出动作</a> 。
      </p>

      <h4>扫描配置</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="扫描配置" title="扫描配置"/>
        将会切换到
        <a href="configs.html?token={/envelope/token}">扫描配置</a>
        页面。
      </p>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="schedule_details.html">
  <div class="gb_window_part_center">帮助：计划详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_SCHEDULES'"/>
      </xsl:call-template>

      <h1>计划详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#schedule">计划</a> 的详细信息。
        这包括名称、创建时间、修改时间、注释、首次运行和下次运行日期、时区、
        运行间隔和持续期。
      </p>

      <h4>新建计划 </h4>
      <p>
      为创建一个新的计划，点击新建图标      
      <img src="/img/new.png" alt="新建计划" title="新建计划"/>
      将会跳转到 <a href="new_schedule.html?token={/envelope/token}">
      新建计划</a> 页面。
      </p>

      <h4>计划</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="计划" title="计划"/>
       将会切换到计划页面。
      </p>

      <h4>编辑计划</h4>
      <p>
       点击 “编辑计划” 图标
       <img src="/img/edit.png" alt="编辑计划" title="编辑计划"/>
       将会切换到配置该计划的概览视图，并允许编辑该计划的属性。       
      </p>

      <h4>导出</h4>
      <p>
        导出该计划为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
      <h3>使用该计划的任务</h3>
      <p>
        这个表格提供关联到该计划的任务的概览（如果有的话）。
        这些任务的详情可以通过点击详情图标
        <img src="/img/details.png" alt="详情" title="详情"/> 来查看。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="schedules.html">
  <div class="gb_window_part_center">帮助：计划
    <a href="/omp?cmd=get_schedules&amp;token={/envelope/token}"
       title="计划" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="计划"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_SCHEDULES'"/>
      </xsl:call-template>

      <h1>计划</h1>
      <p>
       该表格提供所有已配置的
       <a href="glossary.html?token={/envelope/token}#schedule">计划</a> 的概览。
       显示计划条目的完整内容（名称、首次运行、下次运行、运行间隔和持续期）。       
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示该计划的名称，如果指定了注释，会显示在名称下方的括号里。    </td>
        </tr>
        <tr class="even">
          <td>首次运行</td>
          <td>
              首次运行任务的日期和时间。
          </td>
        </tr>
        <tr class="odd">
          <td>下次运行</td>
          <td>
              下次运行任务的日期和时间。
          </td>
        </tr>
        <tr class="even">
          <td>运行间隔</td>
          <td>
              经过一段时间间隔后任务会再次运行，即运行间隔。
          </td>
        </tr>
        <tr class="odd">
          <td>持续期</td>
          <td>
              任务单次运行的最大持续时间。
          </td>
        </tr>
      </table>

      <h3>新建计划</h3>
      <p>
        为创建一个新的计划，点击新建图标
        <img src="/img/new.png" alt="新建计划" title="新建计划"/> 
        将会跳转到 <a href="new_schedule.html?token={/envelope/token}">新建计划</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出计划的当前列表为 XML ，
        通过点击导出图标 <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'计划'"/>
        <xsl:with-param name="used_by" select="'任务'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_schedule.html">
  <div class="gb_window_part_center">帮助：新建计划
    <a href="/omp?cmd=new_schedule&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_SCHEDULE'"/>
      </xsl:call-template>

      <h1>新建计划</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#schedule">计划</a>
        该对话框提供下面这些条目。
        点击按钮 “创建计划” 以提交新的计划。新建后计划页面会被显示。       
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Single Targets</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>Targets with only one host</td>
        </tr>
        <tr class="odd">
          <td>首次运行</td>
          <td>是</td>
          <td>--</td>
          <td>选择</td>
          <td>05:30 10 Jan 2013</td>
        </tr>
        <tr class="even">
          <td>运行间隔</td>
          <td>否</td>
          <td>--</td>
          <td>选择</td>
          <td>5 Days</td>
        </tr>
        <tr class="odd">
          <td>持续期</td>
          <td>否</td>
          <td>--</td>
          <td>选择</td>
          <td>3 Hours</td>
        </tr>
      </table>

      <h4>计划</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="计划" title="计划"/>
       将会切换到 <a href="schedules.html?token={/envelope/token}">计划</a>
       页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="slave_details.html">
  <div class="gb_window_part_center">帮助：从属详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_SLAVES'"/>
      </xsl:call-template>

      <h1>从属详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#slave">从属</a> 的详细信息。
        这包括名称、创建时间、修改时间、注释、主机、端口、登录名。
      </p>

      <h4>新建从属 </h4>
      <p>
        为创建一个新的从属，点击新建图标
        <img src="/img/new.png" alt="新建从属" title="新建从属"/>
        将会跳转到 <a href="new_slave.html?token={/envelope/token}">
        新建从属</a> 页面。
      </p>

      <h4>从属</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="从属" title="从属"/>
        将会切换到从属页面。
      </p>

      <h4>编辑从属</h4>
      <p>
        点击 “编辑从属” 图标
        <img src="/img/edit.png" alt="编辑从属" title="编辑从属"/>
        将会切换到配置该从属的概览视图，
        并允许编辑该从属的属性。    
      </p>

      <h4>导出</h4>
      <p>
        导出该从属为 XML ，通过点击导出图标
         <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
      <h3>使用该从属的任务</h3>
      <p>
        这个表格提供关联到该从属的任务的概览（如果有的话）。
        这些任务的详情可以通过点击详情图标      
        <img src="/img/details.png" alt="详情" title="详情"/> 来查看。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="slaves.html">
  <div class="gb_window_part_center">帮助：从属
    <a href="/omp?cmd=get_slaves&amp;token={/envelope/token}"
       title="从属" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="从属"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_SLAVES'"/>
      </xsl:call-template>

      <h1>从属</h1>
      <p>
        该表格提供 所有已配置的
        <a href="glossary.html?token={/envelope/token}#slave">从属</a> 的概览。
        从属条目的完整内容如下所示（名称、主机、端口、登录名）。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示从属的名称，如果指定了注释，会显示在名称下方的括号里。
              </td>
        </tr>
        <tr class="even">
          <td>主机</td>
          <td>
              从属的主机，网络主机名或 IP 。
          </td>
        </tr>
        <tr class="odd">
          <td>端口</td>
          <td>
            从属主机的 OpenVAS-Manager 网络端口。
          </td>
        </tr>
        <tr class="even">
          <td>登录名</td>
          <td>
            从属主机的 OpenVAS 用户名。
          </td>
        </tr>
      </table>

      <h3>新建从属</h3>
      <p>
        为创建一个新的从属，点击新建图标
        <img src="/img/new.png" alt="新建从属" title="新建从属"/>  
        将会跳转到 <a href="new_slave.html?token={/envelope/token}">新建从属</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出从属的当前列表为 XML，
        通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'从属'"/>
        <xsl:with-param name="used_by" select="'任务'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_slave.html">
  <div class="gb_window_part_center">帮助：新建从属
    <a href="/omp?cmd=new_slave&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_SLAVE'"/>
      </xsl:call-template>

      <h1>新建从属</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#slave">从属</a>
        该对话框提供下面这些条目。
        点击按钮 “创建从属” 以提交新的从属。之后从属页面将会被显示。 
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>主机</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>192.168.3.200</td>
        </tr>
        <tr class="even">
          <td>端口</td>
          <td>是</td>
          <td>80</td>
          <td>整数</td>
          <td>9390</td>
        </tr>
        <tr class="odd">
          <td>登录名</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>sally</td>
        </tr>
        <tr class="odd">
          <td>密码</td>
          <td>是</td>
          <td>40</td>
          <td>字母数字</td>
          <td>Free form text</td>
        </tr>
      </table>

      <h4>从属</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="从属" title="从属"/>
       将会切换到 <a href="slaves.html?token={/envelope/token}">从属</a>
       页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="users.html">
  <div class="gb_window_part_center">帮助：用户
    <a href="/omp?cmd=get_users&amp;token={/envelope/token}"
       title="用户" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="用户"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_USERS'"/>
      </xsl:call-template>

      <a name="users"></a>
      <h1>用户</h1>

      <p>
       用户的管理只有 拥有 "Administrator" 角色的用户 才可以访问。
      </p>

      <p>
       该表格提供 所有已配置的用户的概览。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>用户的登录名。</td>
        </tr>
        <tr class="even">
          <td>Role</td>
          <td>显示用户的角色。</td>
        </tr>
        <tr class="odd">
          <td>主机访问</td>
          <td>该用户的主机访问规则。</td>
        </tr>
      </table>

      <p>
        如果配置了 per-User-LDAP 认证方式，一个带复选框的附加列（“LDAP 认证”）会被显示。
        当一个给定用户的复选框被勾选了，该用户就只能通过配置好的 LDAP 服务器来登录。
      </p>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'用户'"/>
        <xsl:with-param name="notrashcan" select="1"/>
      </xsl:call-template>

      <h4>删除用户</h4>
      <p>
       点击删除图标
       <img src="/img/delete.png" alt="删除" title="删除"/>
       将会删除该用户账户。
      </p>
      <p>
       不能删除最后一个管理员用户，因为它与当前进行删除操作所使用的账户是一样的。
       用户不能删除自己。
      </p>

      <a name="newuser"></a>
      <h2>新建用户</h2>
      <p>
       为创建一个用户，该对话框提供这些条目。点击按钮 “创建用户” 以提交新用户。之后用户列表将会更新。
      </p>
      <p>
       请注意 <b>主机访问</b>：
       如果选择了 “拒绝全部的但允许：” 或 “允许全部的但拒绝：” ，
       其文本区域应该包含 <b>主机</b> 的一个列表。

       <xsl:call-template name="hosts_note_zh"/>
      </p>



      <p>
       请注意 <b>接口访问</b>：如果选择了 “拒绝全部的但允许：” 或 “允许全部的但拒绝：” ，
       其文本区域应该包含一个逗号分隔的网络接口名列表。
      </p>
      <p>
       请注意 <b>角色</b>:
       <ul>
         <li>
           “User” 角色已经拥有足够的权限以进行日常使用。
         </li>
         <li>
           "Administrator" 角色拥有额外的管理员特权，比如添加用户 或 同步订阅。
         </li>
         <li>
           "Observer" 角色仅仅拥有足够的权限以浏览资源。就是说，监视员被禁止创建、删除、修改或使用
           所有的任务、目标、配置等等。更进一步地，监视员可能仅能浏览这些资源：
           当用户的属主添加该监视员到任务的监视员列表里时，他才能浏览。
         </li>
       </ul>
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>jsmith</td>
        </tr>
        <tr class="even">
          <td>密码</td>
          <td>是</td>
          <td>40</td>
          <td>自由格式文本</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>角色</td>
          <td>是</td>
          <td>---</td>
          <td>"User", "Administrator" 或 "Observer"</td>
          <td>User</td>
        </tr>
        <tr class="even">
          <td>主机访问</td>
          <td>是</td>
          <td>---</td>
          <td>"Allow all", 或者 "Allow all and deny:" / "Deny all and allow:" 带附加条目</td>
          <td>"Allow all", "Allow all and deny:" and "<tt>192.168.13.2/31,192.168.14.12</tt>"</td>
        </tr>
        <tr class="even">
          <td>接口访问</td>
          <td>是</td>
          <td>---</td>
          <td>"Allow all", 或者 "Allow all and deny:" / "Deny all and allow:" 带附加条目</td>
          <td>"Allow all", "Allow all and deny:" and "<tt>eth0, eth2, eth3</tt>"</td>
        </tr>
      </table>
      <p>
        如果配置了  per-User-LDAP 认证方式，一个附加的复选框会被显示（“仅允许 LDAP 认证”）。
        如果勾选了它，用户就只能通过配置好的 LDAP 服务器来登录。
      </p>

      <a name="peruserldapauthentication"></a>
      <h2>LDAP per-User 认证</h2>
      <p>      
       这些设置仅仅对于这种情况才可见，即后台被配置成支持 "per-User" LDAP 认证。
      </p>
      <p>
       更改将会在点击 “保存” 按钮确认后被保存，但是<b>仅在后台服务重启后才会生效</b>。
      </p>
      <p>       
       在 "per-User" 认证方式里，主机访问规则和角色被存储在本地。
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>描述</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>Enable（启用）</td>
          <td>是否使用 LDAP 认证方式。</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>LDAP Host（LDAP主机）</td>
          <td>运行 LDAP 服务并带可选端口的主机名或 IP。
              如果没指定端口，将使用 LDAP 服务默认的 389 端口。 
              </td>
          <td>ldap.example.com:389</td>
        </tr>
        <tr class="odd">
          <td>Auth. DN（认证识别名）</td>
          <td>认证用的识别名（Distinguishable Name，DN）。替换单一 %s 的位置为用户名。
              </td>
          <td>正规 LDAP:<br/>
              uid=%s,cn=users,o=center,d=org<br/>
              <br/>
              微软 Active Directory:<br/>
              %s@mydomain<br/>
              或<br/>
              mydomain\%s</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="user_details.html">
  <div class="gb_window_part_center">帮助：用户详情
<!--
    <a href="/omp?cmd=get_user&amp;user_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
-->
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_USERS'"/>
      </xsl:call-template>

      <h1>用户详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#user">用户</a> 的详细信息。
        这包括名称、角色和组。
      </p>

      <h4>新建用户</h4>
      <p>
        为创建一个新的用户，点击新建图标
        <img src="/img/new.png" alt="新建用户" title="新建用户"/>
        将会跳转到 <a href="new_user.html?token={/envelope/token}">新建用户</a>
        页面。
      </p>

      <h4>用户</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="用户" title="用户"/>
       将会切换到 <a href="users.html?token={/envelope/token}">用户</a>
       页面。
      </p>

      <h4>编辑用户</h4>
      <p>
       点击 “编辑用户” 图标
       <img src="/img/edit.png" alt="编辑用户" title="编辑用户"/>
       将会切换到该用户的概览视图，并运行编辑该用户的属性。       
      </p>

      <h4>导出</h4>
      <p>
        导出该用户为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="permissions.html">
  <div class="gb_window_part_center">帮助：权限
    <a href="/omp?cmd=get_permissions&amp;token={/envelope/token}"
       title="权限" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="权限"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助内容</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_PERMISSIONS'"/>
      </xsl:call-template>

      <h1>权限</h1>
      <p>
       该表格提供 所有已配置的
       <a href="glossary.html?token={/envelope/token}#permission">权限</a> 的概览。
       权限条目的完整内容会被显示（名称、注释、资源类型、资源、对象类型、对象）。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示该权限的名称，如果指定了注释，会显示在名称下方的括号里。
              </td>
        </tr>
        <tr class="even">
          <td>资源类型</td>
          <td>资源的类型，如果提供了的话。</td>
        </tr>
        <tr class="odd">
          <td>资源</td>
          <td>权限所应用的资源的名称。</td>
        </tr>
        <tr class="even">
          <td>对象类型</td>
          <td>权限所应用的对象的类型：用户、角色或组。</td>
        </tr>
        <tr class="odd">
          <td>对象</td>
          <td>权限所应用的对象。</td>
        </tr>
      </table>

      <h3>新建权限</h3>
      <p>
        为创建一个新的权限，点击新建图标
        <img src="/img/new.png" alt="新建权限" title="新建权限"/> 
        将会跳转到 <a href="new_permission.html?token={/envelope/token}">新建权限</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出权限的当前列表为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'权限'"/>
        <xsl:with-param name="used_by" select="'任务'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_permission.html">
  <div class="gb_window_part_center">帮助：新建权限
    <a href="/omp?cmd=new_permission&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_PERMISSION'"/>
      </xsl:call-template>

      <h1>新建权限</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#permission">权限</a>，
        该对话框提供下面这些条目。
        点击按钮 “创建权限” 以提交新的权限。之后权限页面会被显示。        
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>--</td>
          <td>选择</td>
          <td>create_task</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>Permissions for tier1 users</td>
        </tr>
        <tr class="odd">
          <td>对象</td>
          <td>是</td>
          <td>--</td>
          <td>选择</td>
          <td>
            用户： User1
          </td>
        </tr>
        <tr class="odd">
          <td>资源 ID</td>
          <td>否</td>
          <td>--</td>
          <td>UUID</td>
          <td>03c8aa9e-a062-4e32-bf8d-cd02d76902ec</td>
        </tr>
      </table>

      <h4>权限</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="权限" title="权限"/>
       将会切换到权限页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="permission_details.html">
  <div class="gb_window_part_center">帮助：权限详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助内容</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_PERMISSIONS'"/>
      </xsl:call-template>

      <h1>权限详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#permission">权限</a> 的详细信息。
        这包括名称、注释、资源名称和类型、对象名称和类型。        
      </p>

      <h4>新建权限</h4>
      <p>
        为创建一个新的权限，点击新建图标
        <img src="/img/new.png" alt="新建权限" title="新建权限"/>
        将会跳转到 <a href="new_permission.html?token={/envelope/token}">新建权限</a>
        页面。
      </p>

      <h4>权限</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="权限" title="权限"/>
       将会切换到权限页面。
      </p>

      <h4>编辑权限</h4>
      <p>
       点击 “编辑权限” 图标 
       <img src="/img/edit.png" alt="编辑权限" title="编辑权限"/>
       将会切换到配置该权限的概览视图，并允许编辑该权限的属性。       
      </p>

      <h4>导出</h4>
      <p>
        导出权限为 XML，通过点击导出图标
         <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="roles.html">
  <div class="gb_window_part_center">帮助：角色
    <a href="/omp?cmd=get_roles&amp;token={/envelope/token}"
       title="角色" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="角色"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_ROLES'"/>
      </xsl:call-template>

      <h1>角色</h1>
      <p>
       该表格提供所有已配置的
       <a href="glossary.html?token={/envelope/token}#role">角色</a> 的概览。
        角色条目的摘要信息如下所示。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示角色的名称，如果指定了注释，会显示在名称下方的括号里。</td>
        </tr>
      </table>

      <h3>导出</h3>
      <p>
        导出角色的当前列表为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'角色'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="role_details.html">
  <div class="gb_window_part_center">帮助：角色详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_ROLES'"/>
      </xsl:call-template>

      <h1>角色详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#role">角色</a> 的详细信息。
        这包括名称、创建时间、修改时间、注释、用户和其权限列表。
      </p>

      <h4>角色</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="角色" title="角色"/>
        将会切换到角色页面。
      </p>

      <h4>导出角色</h4>
      <p>
        导出该角色为 XML， 通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="contents.html">
  <div class="gb_window_part_center">帮助：目录</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">

      <h1>帮助目录</h1>
      <p>
       这是绿骨安全助手（Greenbone Security Assistant）的帮助系统。小问号
       <a href="/help/contents.html?token={/envelope/token}" title="帮助">
       <img src="/img/help.png"/>
       </a>图标贯穿于所有网页界面，引导您跳转到相应的帮助内容去。作为可选的，您也可以根据如下结构来浏览帮助内容。
      </p>

      <div id="list">
        <ul>
          <li> 扫描管理</li>
          <ul>
            <li> <a href="tasks.html?token={/envelope/token}">任务</a></li>
              <!-- TODO: Translate further -->
              <ul>
                <li> <a href="new_task.html?token={/envelope/token}">新建任务</a></li>
                <li> <a href="task_details.html?token={/envelope/token}">任务详情和报告</a></li>
                <li> <a href="view_report.html?token={/envelope/token}">查看报告</a></li>
                  <ul>
                    <li> <a href="result_details.html?token={/envelope/token}">结果详情</a></li>
                  </ul>
              </ul>
            <li> <a href="notes.html?token={/envelope/token}">批注</a> </li>
              <ul>
                <li> <a href="new_note.html?token={/envelope/token}">新建批注</a></li>
                <li> <a href="note_details.html?token={/envelope/token}">批注详情</a></li>
              </ul>
            <li> <a href="overrides.html?token={/envelope/token}">覆盖</a></li>
              <ul>
                <li> <a href="new_override.html?token={/envelope/token}">新建覆盖</a></li>
                <li> <a href="override_details.html?token={/envelope/token}">覆盖的详情</a></li>
              </ul>
          </ul>
          <li> 资产管理</li>
          <ul>
            <li> <a href="hosts.html?token={/envelope/token}">主机</a></li>
          </ul>
          <li> SecInfo 管理</li>
          <ul>
            <li> <a href="nvts.html?token={/envelope/token}">NVT</a></li>
              <ul>
                <li> <a href="nvt_details.html?token={/envelope/token}">NVT 详情</a></li>
              </ul>
            <li> <a href="cves.html?token={/envelope/token}">CVE</a></li>
              <ul>
                <li> <a href="cve_details.html?token={/envelope/token}">CVE 详情</a></li>
              </ul>
            <li> <a href="cpes.html?token={/envelope/token}">CPE</a></li>
              <ul>
                <li> <a href="cpe_details.html?token={/envelope/token}">CPE 详情</a></li>
              </ul>
            <li> <a href="ovaldefs.html?token={/envelope/token}">OVAL 定义</a></li>
              <ul>
                <li> <a href="ovaldef_details.html?token={/envelope/token}">OVAL 定义详情</a></li>
              </ul>
            <li> <a href="dfn_cert_advs.html?token={/envelope/token}">DFN-CERT 公告</a></li>
              <ul>
                <li> <a href="dfn_cert_adv_details.html?token={/envelope/token}">DFN-CERT 公告详情</a></li>
              </ul>
            <li> <a href="allinfo.html?token={/envelope/token}">所有的 SecInfo</a></li>
          </ul>
          <li> 配置</li>
          <ul>
            <li> <a href="configs.html?token={/envelope/token}">扫描配置</a></li>
            <ul>
              <li> <a href="new_config.html?token={/envelope/token}">新建扫描配置</a></li>
              <li> <a href="config_details.html?token={/envelope/token}">扫描配置详情</a></li>
              <li> <a href="config_family_details.html?token={/envelope/token}">扫描配置家族详情</a></li>
              <li> <a href="config_nvt_details.html?token={/envelope/token}">扫描配置 NVT 详情</a></li>
              <li> <a href="config_editor.html?token={/envelope/token}">扫描配置编辑器</a></li>
              <li> <a href="config_editor_nvt_families.html?token={/envelope/token}">扫描配置家族编辑器</a></li>
              <li> <a href="config_editor_nvt.html?token={/envelope/token}">扫描配置 NVT 编辑器</a></li>
            </ul>
            <li> <a href="targets.html?token={/envelope/token}">目标</a></li>
              <ul>
                <li> <a href="new_target.html?token={/envelope/token}">新建目标</a></li>
                <li> <a href="target_details.html?token={/envelope/token}">目标详情</a></li>
              </ul>
            <li> <a href="lsc_credentials.html?token={/envelope/token}">证书</a></li>
              <ul>
                <li> <a href="new_lsc_credential.html?token={/envelope/token}">新建证书</a></li>
                <li> <a href="lsc_credential_details.html?token={/envelope/token}">证书详情</a></li>
              </ul>
            <li> <a href="agents.html?token={/envelope/token}">代理</a></li>
              <ul>
                <li> <a href="new_agent.html?token={/envelope/token}">新建代理</a></li>
                <li> <a href="agent_details.html?token={/envelope/token}">代理详情</a></li>
              </ul>
            <li> <a href="alerts.html?token={/envelope/token}">警报</a></li>
              <ul>
                <li> <a href="new_alert.html?token={/envelope/token}">新建警报</a></li>
                <li> <a href="alert_details.html?token={/envelope/token}">警报详情</a></li>
              </ul>
            <li> <a href="tags.html?token={/envelope/token}">标签</a></li>
              <ul>
                <li> <a href="new_tag.html?token={/envelope/token}">新建标签</a></li>
                <li> <a href="tag_details.html?token={/envelope/token}">标签详情</a></li>
              </ul>
            <li> <a href="filters.html?token={/envelope/token}">过滤器</a></li>
              <ul>
                <li> <a href="new_filter.html?token={/envelope/token}">新建过滤器</a></li>
                <li> <a href="filter_details.html?token={/envelope/token}">过滤器详情</a></li>
              </ul>
            <li> <a href="schedules.html?token={/envelope/token}">计划</a></li>
              <ul>
                <li> <a href="new_schedule.html?token={/envelope/token}">新建计划</a></li>
                <li> <a href="schedule_details.html?token={/envelope/token}">计划详情</a></li>
              </ul>
            <li> <a href="permissions.html?token={/envelope/token}">权限</a></li>
              <ul>
                <li> <a href="new_permission.html?token={/envelope/token}">新建权限</a></li>
                <li> <a href="permission_details.html?token={/envelope/token}">权限详情</a></li>
              </ul>
            <li> <a href="port_lists.html?token={/envelope/token}">端口列表</a></li>
              <ul>
                <li> <a href="new_port_list.html?token={/envelope/token}">新建端口列表</a></li>
                <li> <a href="port_list_details.html?token={/envelope/token}">端口列表详情</a></li>
              </ul>
            <li> <a href="report_formats.html?token={/envelope/token}">报告格式</a></li>
              <ul>
                <li> <a href="new_report_format.html?token={/envelope/token}">新建报告格式</a></li>
                <li> <a href="report_format_details.html?token={/envelope/token}">报告格式详情</a></li>
              </ul>
            <li> <a href="slaves.html?token={/envelope/token}">从属</a></li>
              <ul>
                <li> <a href="new_slave.html?token={/envelope/token}">新建从属</a></li>
                <li> <a href="slave_details.html?token={/envelope/token}">从属详情</a></li>
              </ul>
          </ul>
          <li> 管理本软件</li>
          <ul>
            <li> <a href="users.html?token={/envelope/token}">用户</a></li>
              <ul>
                <li> <a href="user_details.html?token={/envelope/token}">用户详情</a></li>
                <li> <a href="new_user.html?token={/envelope/token}">新建用户</a></li>
              </ul>
            <li> <a href="groups.html?token={/envelope/token}">组</a></li>
              <ul>
                <li> <a href="new_group.html?token={/envelope/token}">新建组</a></li>
                <li> <a href="group_details.html?token={/envelope/token}">组的详情</a></li>
              </ul>
            <li> <a href="roles.html?token={/envelope/token}">角色</a></li>
              <ul>
                <li> <a href="new_role.html?token={/envelope/token}">新建角色</a></li>
                <li> <a href="role_details.html?token={/envelope/token}">角色详情</a></li>
              </ul>
            <li> <a href="feed_management.html?token={/envelope/token}">NVT 订阅管理</a></li>
            <li> <a href="scap_management.html?token={/envelope/token}">SCAP 订阅管理</a></li>
            <li> <a href="cert_management.html?token={/envelope/token}">CERT 订阅管理</a></li>
          </ul>
          <li> 杂项</li>
          <ul>
            <li> <a href="trashcan.html?token={/envelope/token}">回收站</a></li>
            <li> <a href="my_settings.html?token={/envelope/token}">我的设置</a></li>
            <li> <a href="performance.html?token={/envelope/token}">性能</a></li>
            <li> <a href="cvss_calculator.html?token={/envelope/token}">CVSS 计算器</a></li>
            <li> <a href="powerfilter.html?token={/envelope/token}">超强过滤器</a></li>
            <li> <a href="user-tags.html?token={/envelope/token}">用户标签列表</a></li>
            <li> <a href="nvts.html?token={/envelope/token}">NVT 详情</a></li>
            <li> 协议文档</li>
              <ul>
                <li> <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP (OpenVAS 管理协议)</a></li>
              </ul>
            <li> <a href="javascript.html?token={/envelope/token}">JavaScript</a></li>
            <li> <a href="error_messages.html?token={/envelope/token}">错误消息</a></li>
            <li> <a href="glossary.html?token={/envelope/token}">术语</a></li>
          </ul>
        </ul>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cpe_details.html">
  <div class="gb_window_part_center">帮助：CPE 详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>CPE 详情</h1>
      <p>
        该页面提供关于一个
        <a href="glossary.html?token={/envelope/token}#cpe">CPE</a> 的详细信息。
        这包括所有引用的 CVE、创建时间、修改时间、弃用状态和整体状态。
	（译者注：实际上没有显示 CPE 弃用状态。）
      </p>

      <h2>已报告的漏洞</h2>
      <p>
        这个表格提供关联到该 CPE 的
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a> 漏洞的概览（如果有的话）。
        这些 CVE 漏洞的详情可以通过点击详情图标        
        <img src="/img/details.png" alt="Details" title="Details"/> 来查看（直接点击漏洞名称就可以）。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cve_details.html">
  <div class="gb_window_part_center">帮助：CVE 详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>CVE 详情</h1>
      <p>
       该页面提供关于一个 CVE 漏洞的原始详细信息。这包括公布时间、最后修改时间、
       描述、CVSS 信息、存在漏洞的产品列表和参考信息。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="ovaldef_details.html">
  <div class="gb_window_part_center">帮助：OVAL 定义详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>OVAL 定义详情</h1>
      <p>
        该页面提供关于一个
        <a href="glossary.html?token={/envelope/token}#ovaldef">OVAL 定义</a> 的详细信息。
        这包括创建时间、修改时间、版本号、标题、定义的分类和详细的描述。
      </p>
      <h2>影响</h2>
      <p>
        一个或更多的表格描述该定义影响的系统。每个条目由一个家族和一个平台与产品的列表组成。
      </p>
      <h2>条件</h2>
      <p>
        显示该定义的条件的树。逻辑运算符是<b>粗体</b>，所带的注释是<i>斜体</i>。
        叶子节点注释是普通格式字体，其所关联的 OVAL-ID （测试项和扩展定义）是<i>斜体</i>。        
      </p>
      <h2>参考</h2>
      <p>
        这个表格包含该 OVAL 定义的参考信息，每个条目由源的类型、ID 和 URL 组成。        
      </p>
      <h2>知识库历史</h2>
      <p>
        显示当前状态（如 draft-草案, interim-过度, accepted-已采纳）和一个表格，这个表格显示该定义的历史。
        第一列描述事件的类型（如 submission-提交, change-更改 和 status changes-更改状态）。
        后续的列是日期和贡献者，如果适用的话。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="dfn_cert_adv_details.html">
  <div class="gb_window_part_center">帮助：DFN-CERT 公告详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>DFN-CERT 公告详情</h1>
      <p>
        这个页面提供关于一个
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">DFN-CERT 公告</a> 的详细信息。
        这包括创建时间、修改时间、摘要和一个引向完整公告的 URL 链接。        
      </p>
      <h3>引用的 CVE</h3>
      <p>
        这个列表提供该公告引用的
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a> 漏洞概览。
        这些 CVE 漏洞的详情，可以直接点击它们的名字来查看。        
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="error_messages.html">
  <div class="gb_window_part_center">帮助：错误消息</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=unknown_cmd&amp;token={/envelope/token}">
                   调出一个无害的内部错误 </a> (点击 <img src="/img/help.png"/> 回到这里)</div>
    <div style="text-align:left">

      <br/>
      <h1>错误消息（Error Messages）</h1>

      <h2>操作期间的问题</h2>
      <p>
       当一个操作不按预期工作的时候，“Results of last operation”（最后操作的结果）的窗口标题栏
       会变成红色。
       在这种情况下 “Status code”（状态代码）是 4xx ，
       “Status Message”（状态消息）解释发生了什么。
      </p>
      <p>
       没发生严重的错误，您可以继续使用 GSA 。您应该考虑 "Status Message" 的内容以避免该问题。       
      </p>

      <h2>内部错误对话框</h2>
      <p>
       通常，当您见到这样的错误对话框时，GSA 自己不会受到严重影响。
      </p>
      <p>
       该对话框显示一个 <em>函数名：行号</em> （这只对软件开发者有意义），
       和一段 <em>错误文本</em> （这可能给您的系统管理员带来一些有价值的提示信息）。
      </p>
      <p>
       您总是有三个选项：
      </p>

      <ol>
        <p><li>
          浏览器的 “后退” 按钮：这将回到先前的页面。
          请注意，如果导致该错误的最后动作是提交一个表单，该表单会重新发送。
          在一些情况下，一个动作如 “创建任务”，可能已经成功了，并且甚至准备好接受任何重发。
          请仔细阅读错误文本的提示信息。
        </li></p>
        <p><li>
          假定最后的是正常状态：GSA 尝试猜测一个最后正常状态。
          这个猜测可能是错的或它可能有用。不管是哪种情况下，由于不进行重新发送，
          因此不想要的动作，比如使用浏览器后退按钮发生的动作，将会被避免。

        </li></p>
        <p><li>
          注销：如果发生了严重问题，上面两种方法都不管用，您应该注销 GSA。
          只要 GSA 还在运行，您就可以进入登录对话框。
        </li></p>
      </ol>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="feed_management.html">
  <div class="gb_window_part_center">帮助：NVT 订阅管理</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=get_feed&amp;token={/envelope/token}">跳转到对话框</a></div>
    <div style="text-align:left">

      <br/>
      <h1>NVT 订阅管理</h1>
      <p>
       NVT 订阅的管理仅对拥有 "Administrator" 角色的用户才可访问。
      </p>

      <a name="feed_synchronization"></a>
      <h2>同步 NVT 订阅</h2>
      <p>
       这个对话框允许您使用一个 NVT 订阅来同步您的 NVT 集合。
       它将显示您安装配置使用的 NVT 订阅服务的名称，和一个简短的工具描述，
       该工具将利用订阅服务来同步您的 NVT 集合。
       点击 “立即同步订阅” 按钮以开始同步过程。
      </p>

      <a name="side_effects"></a>
      <h2>NVT 同步的副作用</h2>
      <p>
       利用 NVT 订阅服务的同步操作将通常需要少量时间。
       然而，某些情况下，该过程可能花费更长的时间。
       这依赖您上次同步的时间和订阅服务里的变化数目。
       当进行同步时，界面可能反应比较慢。
      </p>
      <p>
       在同步结束时，您安装的一些组件将需要重新加载，以完全利用您更新的 NVT 集合。
       这通常也需要一些时间，在某些情况下可能耗时更长。
       在这期间界面可能反应迟钝。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scap_management.html">
  <div class="gb_window_part_center">帮助：SCAP 订阅管理</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=get_scap&amp;token={/envelope/token}">跳转到对话框</a></div>
    <div style="text-align:left">

      <br/>
      <h1>SCAP 订阅管理</h1>
      <p>
       SCAP 订阅的管理仅对拥有 "Administrator" 角色的用户才可访问。
      </p>

      <a name="scap_synchronization"></a>
      <h2>同步 SCAP 订阅</h2>
      <p>
       这个对话框允许您使用一个 SCAP 订阅来同步您的 SCAP 集合。
       它将显示您安装配置使用的 SCAP 订阅服务的名称，和一个简短的工具描述，
       该工具将利用订阅服务来同步您的 SCAP 集合。
       点击 “立即同步 SCAP 订阅” 按钮以开始同步过程。
      </p>

      <a name="side_effects"></a>
      <h2>SCAP 同步的副作用</h2>
      <p>
       利用 SCAP 订阅服务的同步操作将通常需要少量时间。
       然而，某些情况下，该过程可能花费更长的时间。
       这依赖您上次同步的时间和订阅服务里的变化数目。
       当进行同步时，界面可能反应比较慢。
      </p>
      <p>
       在同步结束时，您安装的一些组件将需要重新加载，以完全利用您更新的 SCAP 集合。
       这通常也需要一些时间，在某些情况下可能耗时更长。
       在这期间界面可能反应迟钝。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cert_management.html">
  <div class="gb_window_part_center">帮助：CERT 订阅管理</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/oap?cmd=get_cert&amp;token={/envelope/token}">跳转到对话框</a></div>
    <div style="text-align:left">

      <br/>
      <h1>CERT 订阅管理</h1>
      <p>
       CERT 订阅的管理仅对拥有 "Administrator" 角色的用户才可访问。
      </p>

      <a name="scap_synchronization"></a>
      <h2>同步 CERT 订阅</h2>
      <p>
       这个对话框允许您使用一个 CERT 订阅来同步您的 CERT 公告集合。
       它将显示您安装配置使用的 CERT 订阅服务的名称，和一个简短的工具描述，
       该工具将利用订阅服务来同步您的 CERT 公告集合。
       点击 “立即同步 CERT 订阅” 按钮以开始同步过程。
      </p>

      <a name="side_effects"></a>
      <h2>CERT 订阅同步的副作用</h2>
      <p>
       利用 CERT 订阅服务的同步操作将通常需要少量时间。
       然而，某些情况下，该过程可能花费更长的时间。
       这依赖您上次同步的时间和订阅服务里的变化数目。
       当进行同步时，界面可能反应比较慢。
      </p>
      <p>
       在同步结束时，您安装的一些组件将需要重新加载，以完全利用您更新的 CERT 集合。
       这通常也需要一些时间，在某些情况下可能耗时更长。
       在这期间界面可能反应迟钝。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="filter_details.html">
  <div class="gb_window_part_center">帮助：过滤器详情
<!--
    <a href="/omp?cmd=get_filter&amp;filter_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
-->
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_FILTERS'"/>
      </xsl:call-template>

      <h1>过滤器详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#filter">过滤器</a> 的详细信息。
        这包括名称、注释、条件和类型。       
        
      </p>

      <h4>新建过滤器</h4>
      <p>
        为创建一个新的过滤器，点击新建图标
        <img src="/img/new.png" alt="新建过滤器" title="新建过滤器"/> 
        将会跳转到 <a href="new_filter.html?token={/envelope/token}">新建过滤器</a>
        页面。
      </p>

      <h4>过滤器</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="过滤器" title="过滤器"/>
       将会切换到过滤器页面。
      </p>

      <h4>编辑过滤器</h4>
      <p>
       点击 “编辑过滤器” 图标
       <img src="/img/edit.png" alt="编辑过滤器" title="编辑过滤器"/>
       将会切换到配置该过滤器的概览视图，并允许编辑该过滤器的属性。
      </p>

      <h4>导出</h4>
      <p>
        导出该过滤器为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <h3>使用该过滤器的警报</h3>
      <p>
        这个表格提供使用该过滤器的警报的概览（如果有的话）。
        这些警报的详情可以点击详情图标
        <img src="/img/details.png" alt="详情" title="详情"/> 来查看。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="filters.html">
  <div class="gb_window_part_center">帮助：过滤器
    <a href="/omp?cmd=get_filters&amp;token={/envelope/token}"
       title="过滤器" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="过滤器"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_FILTERS'"/>
      </xsl:call-template>

      <h1>过滤器</h1>
      <p>
       这个表格提供所有已配置的       
       <a href="glossary.html?token={/envelope/token}#filter">过滤器</a> 的概览。
       过滤器条目的完整内容会被显示（名称、注释、条件和类型）。       
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示过滤器的名称，如果指定了注释，会显示在名称下方的括号里。</td>
        </tr>
        <tr class="even">
          <td>条件</td>
          <td>过滤器的条件。这描述怎样进行过滤操作。</td>
        </tr>
        <tr class="odd">
          <td>类型</td>
          <td>
            过滤器的类型。一个过滤器可以应用到一个特定的资源。
            如果为空，说明过滤器可应用到所有的资源。
          </td>
        </tr>
      </table>

      <h3>新建过滤器</h3>
      <p>
        为创建一个新的过滤器，点击新建图标
        <img src="/img/new.png" alt="新建过滤器" title="新建过滤器"/> 
        将会跳转到 <a href="new_filter.html?token={/envelope/token}">新建过滤器</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出过滤器的当前列表为 XML，通过点击导出图标
         <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'过滤器'"/>
        <xsl:with-param name="used_by" select="'警报'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="glossary.html">

  <div class="gb_window_part_center">帮助：术语</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>
      <h1>术语</h1>
      <p>
       对于绿骨安全助手（Greenbone Security Assistant，GSA），有一堆术语贯穿于用户界面。
      </p>
      <p>
       大部分术语是通用的，为避免误解，本页面概括介绍 GSA 中使用的这些术语的定义。
      </p>

<!-- Missing "#permission"（Permission）
     Missing "#lsc_credential"(Credential)
-->


      <a name="cpe"></a>
      <h2>CPE</h2>
      <p>        
        通用平台枚举（Common Platform Enumeration，CPE）是一套结构化的命名机制，
        用于信息技术系统、平台、软件包的命名。
        基于统一资源标识符（Uniform Resource Identifiers，URI）的通用语法，
        CPE 包含一个正式名称格式、一个描述复杂平台的语言、
        一个检查系统名称的方法、一个用于绑定文本和测试到名称的描述格式。
      </p>

      <p>
        (源 http://cpe.mitre.org)。
      </p>

      <p>
        一个 CPE 名称从 "cpe:/" 开始，随后是最多七个用冒号分隔的部件：
        <ul>
          <li>part (h, o or a) ：归类部分，h 是硬件设备，o 是操作系统，a 是应用程序</li>
          <li>vendor  ：厂商</li>
          <li>product ：产品</li>
          <li>version ：版本</li>
          <li>update  ：更新</li>
          <li>edition ：过去的旧版本号</li>
          <li>language：语言</li>
        </ul>
        例如  <code>cpe:/o:linux:kernel:2.6.0</code>
      </p>

      <a name="cve"></a>
      <h2>CVE</h2>
      <p>
        通用漏洞披露（Common Vulnerabilities and Exposures，CVE）
        是一个公开知名的信息安全漏洞和披露的字典。
      </p>
      <p>
        (源: http://cve.mitre.org).
      </p>

      <a name="cvss"></a>
      <h2>CVSS</h2>
      <p>        
        通用漏洞评分系统（Common Vulnerability Scoring System，CVSS）
        是一个用于描述漏洞严重程度的开放评分框架。
      </p>
      <p>
        (源: http://www.first.org/cvss/cvss-guide).
      </p>

      <a name="dfn_cert_adv"></a>
      <h2>DFN-CERT 公告 (DFN_CERT_ADV)</h2>
      <p>
        DFN-CERT 发布的安全公告。更多信息请看 DFN-CERT 公告帮助页面的
        <a href="/help/dfn_cert_advs.html?token={/envelope/token}#about">
        &quot;关于 DFN-CERT&quot; </a> 小节。
        
      </p>

      <a name="ovaldef"></a>
      <h2>OVAL 定义 (OVALDEF)</h2>
      <p>        
        根据 OVAL（Open Vulnerability and Assessment Language，开放漏洞和评估语言）
        制定的定义，版本 5.10.1 。
        它可用于不同类别的安全数据，比如漏洞、补丁或合规策略。
      </p>
      <p>
        (源: http://oval.mitre.org).
      </p>

      <a name="agent"></a>
      <h2>代理</h2>
      <p>
        代理功能提供代理工具的存储。基本上它是一个带有集成签名验证的仓库。
        代理可以从这下载，以手动在目标系统上安装。
        这个代理特性与其他用户界面元素无关。
      </p>
      <p>      
        代理是安装运行在目标系统上的工具。
        它们收集或分析目标系统的信息，这些可能对关于漏洞的判断有用。
      </p>
      <p>        
        在一次漏洞扫描期间，代理被查询，获得状态或结果信息。
        这不是默认行为。只有特定的 NVT 测试才需要配置为使用一个代理。
      </p>
      <p>        
        代理可能相对于扫描是异步工作的：
        一个初次扫描启用代理的一个功能（例如搜寻弱密码，这可能需要一段很长的时间），
        一个二次扫描获取自从上次联系之后代理所识别出的信息。
      </p>
      <p>
        实际上代理只用于很特定的情况和特殊的环境。
        如今，绝大多数的功能是通过别的方式实现，
        比如经过认证的扫描方式，或通过目标系统里的标准工具
        （例如 End-Point-Security，一款软件产品）。
      </p>

      <a name="alert"></a>
      <h2>警报</h2>
      <p>
      警报是一个动作，可以在特定事件发生时被触发，
      通常这意味着发送通知，例如在发现新漏洞的情况下通过电子邮件通知。
      </p>

      <a name="filter"></a>
      <h2>过滤器</h2>
      <p>
       过滤器描述怎样从一组资源里选取特定的子集。
      </p>

      <a name="group"></a>
      <h2>组</h2>
      <p>
       一个组是用户的一个集合。
      </p>

      <a name="note"></a>
      <h2>批注</h2>
      <p>
       批注是关联了一个 <a href="#nvt">NVT</a> 的文本注释。
       批注显示在 <a href="#report">报告</a> 里，
       位于 NVT 生成结果的下方。
       一个批注可应用于一个特定的结果、任务、严重性分类、
       端口和/或主机，因此批注只会出现在特定的报告里。
      </p>

      <a name="nvt"></a>
      <h2>网络漏洞测试（Network Vulnerability Test，NVT）</h2>
      <p>
       一个网络漏洞测试是一个程序，用于检查目标系统是否存在
       一个特定的已知或潜在安全问题。
      </p>
      <p>
       NVT 按相近测试的家族编组。
       家族的选择和/或单个 NVT 的选择去是      
       <a href="#config">扫描配置</a> 的一部分。
      </p>

      <a name="override"></a>
      <h2>覆盖</h2>
      <p>
       覆盖是一个规则，以更改条目的严重性评分，可用于一个或多个
       <a href="#report">报告</a> 。
      </p>
      <p>         
       覆盖对标记报告条目的假阳性特别有用（如 一个错误的或非预期的发现条目），
       或者强调条目在监察的场景中具有更高的严重性评分。
      </p>

      <a name="port_list"></a>
      <h2>端口列表</h2>
      <p>
       一个端口列表是一堆端口的列表。每个 <a href="#target">目标</a> 关联一个端口列表。
       在对该目标的扫描期间，端口列表决定哪些端口会被扫描。
      </p>

      <a name="prognostic_report"></a>
      <h2>预测报告</h2>
      <p>        
        预测扫描允许一个关于主机潜在漏洞的前瞻性分析。
        这发生在还没有通过网络访问这些系统的时候，因此扫描持续期事实上是零。
      </p>
      <p>
        预测扫描使用之前扫描中的产品检测结果，
        并比较这个清单数据和大多数的当前安全信息（CVE），
        以匹配哪些产品（同时）是已知有漏洞的。
      </p>

      <a name="report"></a>
      <h2>报告</h2>
      <p>
       报告是一次 <a href="#scan">扫描</a> 的结果，
       并包含一份所选取的 NVT 在每个目标主机上查找到的信息摘要。
      </p>
      <p>
       报告总是关联到一个 <a href="#task">任务</a>。
       决定报告范围的 <a href="#config">扫描配置</a> 
       是所关联任务的一个部分，并且不能被修改。
       因此，对任何报告，它确保它的执行配置是保留原样并是可用的。
      </p>

      <a name="report_format"></a>
      <h2>报告格式</h2>
      <p>
       一个文件格式，一份 <a href="#report">报告</a> 可以按这种格式被下载。
      </p>
      <p>
       例如，“TXT” 格式，内容类型是 “text/plain”，意味着报告是一份普通文本文档。
      </p>

      <a name="role"></a>
      <h2>角色</h2>
      <p>
       角色定义权限的一个集合，可应用到一个用户或一个 <a href="#group">组</a>。     
      </p>

      <a name="slave"></a>
      <h2>从属</h2>
      <p>
        一个从属是另一个 OpenVAS 服务器， 
        <a href="#task">任务</a> 可以运行在它上面。
      </p>

      <a name="scan"></a>
      <h2>扫描</h2>
      <p>
       扫描是一个正在进行中 <a href="#task">任务</a> 。
       对每个任务只能有一个扫描处在活跃状态。
       扫描的结果就是 <a href="#report">报告</a> 。      
      </p>
      <p>
       所有活跃扫描的状态可以在
       <a href="/omp?cmd=get_tasks?token={/envelope/token}">任务概览</a> 页面查看。
       进度显示一个百分比，是已进行的测试占所使用测试总数的百分比。
       一个扫描的持续时间取决于 <a href="#target">目标</a> 的数量和
        <a href="#config">扫描配置</a> 的复杂程度，
       时间范围可能是1分钟到数小时，甚至数天。
      </p>
      <p>
       任务概览页面提供一个选项可用于停止一个扫描。
       那样该结果报告会变得不完整。
      </p>

      <a name="config"></a>
      <h2>扫描配置</h2>
      <p>
       一个扫描配置包括 <a href="#nvt">NVT</a> 测试集的选择，
       以及扫描服务器和某些 NVT 测试的通用和很特殊（专家）的参数设置。
      </p>
      <p>
       扫描配置不包含的是目标的选择。这些由独立的功能模块 <a href="#target">目标</a> 来设置。
      </p>

      <a name="schedule"></a>
      <h2>计划</h2>
      <p>
        计划设置当何时 <a href="#task">任务</a> 应该自动开始，
        在多长时间间隔后任务应该再次运行，以及任务每次运行时所允许的最大持续时间。
      </p>

      <a name="tag"></a>
      <h2>标签</h2>
      <p>       
       标签是一个简短的数据包，由一个名称和一个值组成，
       可以附加到一个任何类型的资源，并包含用户对这个资源定义的信息。
      </p>

      <a name="target"></a>
      <h2>目标</h2>
      <p>
       目标定义系统（所谓的“主机”）的一个集合，作为扫描对象。
       系统可以通过它们的 IP 地址、主机名或 CIDR 网络记法来标识。       
      </p>

      <a name="task"></a>
      <h2>任务</h2>
      <p>
       任务最初由一个 <a href="#target">目标</a> 和一个 <a href="#config">扫描配置</a> 组成。
       执行一个任务意味着创建一个 <a href="#scan">扫描</a> 。
       因此，任务会累积一系列的
       <a href="#report">报告</a>。
      </p>
      <p>
       目标和扫描配置是静态的。因此报告的结果序列描述了
       随着时间过去其安全状态变化。
      </p>
      <p>
       <b>容器任务</b> 的唯一功能，就是保留导入的报告。运行一个容器任务是被禁止的。       
      </p>
    </div>
  </div>
</xsl:template>


<!--
GPL v2 翻译忽略，因为只有英文原版的 GPL 才具有法律效力。
-->

<xsl:template mode="help" match="group_details.html">
  <div class="gb_window_part_center">帮助：组的详情
<!--
    <a href="/omp?cmd=get_group&amp;group_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
-->
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_GROUPS'"/>
      </xsl:call-template>

      <h1>组的详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#group">组</a> 的详细信息。
        这包括名称、注释和用户。
      </p>

      <h4>新建组</h4>
      <p>
        为创建一个新的组，点击新建图标
        <img src="/img/new.png" alt="新建组" title="新建组"/> 
        将会跳转到 <a href="new_group.html?token={/envelope/token}">新建组</a>
        页面。
      </p>

      <h4>组</h4>
      <p>
       点击列表
       <img src="/img/list.png" alt="组" title="组"/>
       将会切换到 <a href="groups.html?token={/envelope/token}">组</a>
       的页面。
      </p>

      <h4>编辑 组</h4>
      <p>
       点击 “编辑 组” 图标
       <img src="/img/edit.png" alt="编辑 组" title="编辑 组"/>
       将会切换到这个组的概览视图并允许编辑该组的属性。       
      </p>

      <h4>导出</h4>
      <p>
        导出该组为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="groups.html">
  <div class="gb_window_part_center">帮助：组
    <a href="/omp?cmd=get_groups&amp;token={/envelope/token}"
       title="组" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="组"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_GROUPS'"/>
      </xsl:call-template>

      <h1>组</h1>
      <p> 
       这个表格提供所有已配置的       
       <a href="glossary.html?token={/envelope/token}#group">组</a> 的概览。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>
              显示组的名称，如果指定了注释，会显示在名称下方的括号里。</td>
        </tr>
      </table>

      <h3>新建组</h3>
      <p>
        为创建一个新的组，点击新建图标
        <img src="/img/new.png" alt="新建组" title="新建组"/>
        将会跳转到 <a href="new_group.html?token={/envelope/token}">新建组</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出组的当前列表为 XML ，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'组'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="my_settings.html">
  <div class="gb_window_part_center">帮助：我的设置
    <a href="/omp?cmd=get_my_settings&amp;token={/envelope/token}"
       title="我的设置" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="我的设置"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>
      <h1>我的设置</h1>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_SETTINGS'"/>
      </xsl:call-template>

      <p>        
        这个页面列出当前用户的个人设置，比如用户的时区。
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>设置项的名称</td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>设置项的值。对于密码，值被替换成星号 * 序列。</td>
        </tr>
      </table>

      <a name="edit"></a>
      <h2>编辑我的设置</h2>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'MODIFY_SETTING'"/>
      </xsl:call-template>

      <p>       
        这个表格提供当前用户设置可编辑的版本。
      </p>

      <h3>时区</h3>
      <p>
        时区格式和 GNU/Linux 系统上 TZ 环境变量是一样的。
        就是说，同样的值可被 tzset C 函数接受。
        该格式有是三种版本。请注意示例中空格的缺失。        
      </p>

      <ul>
        <li>
          <b>std offset</b> （标准偏移）定义一个简单的时区。例如， 
          "FOO+2" 定义一个时区 FOO ，其 落后 UTC 两个小时。
        </li>
        <li>
          <b>std offset dst [offset],start[/time],end[/time]</b>（标准偏移含dst） 定义一个时区并包含
          日光节约时间。例如
          "NZST-12.00:00NZDT-13:00:00,M10.1.0,M3.3.0"。
        </li>
        <li>
          <b>:[filespec]</b> 引用一个预定义的时区。例如，":Africa/Johannesburg".  
          请注意冒号是可选的。特定的首字母缩略词是预定义的，比如 GB、 NZ 和 CET 。
        </li>
      </ul>

      <p>        
        在设置时区后，最好去检查一下 GSA 顶部的时间条。
        如果时区的指定是正确的，这个时间条会显示正确的时间。
      </p>

      <h3>密码</h3>
      <p>
        登录到 GSA 所需的密码。
      </p>

      <h3>用户界面语言</h3>
      <p>
        用户界面所使用的语言。如果选择了 "Browser Language" ，
        用户界面将使用浏览器所请求的语言。
      </p>

      <h3>每页行数</h3>
      <p>
        在任意列表视图里默认显示的行数。这可能被默认过滤器的设置覆盖。
      </p>

      <h3>向导行限</h3>
      <p>        
        不超过这个行数时，向导会被自动显示。
      </p>
      <p>
        列表的行数超过这个数值时，有一个关联到列表的程序，使得向导被隐藏。
      </p>

      <a name="severity_class"/>
      <h3>严重性分类</h3>
      <p>        
        严重性分类将 CVSS 评分划分成 3 个区域：高、中和低。
        这些区域用于应用不同颜色到严重性显示条，以简单标识和比较严重性的倾向。
      </p>
      <p>
        可能的值包括
        <ul>
          <li>
            <b>NVD Vulnerability Severity Ratings:</b> 
            美国国家漏洞库（National Vulnerability Database，NVD）应用这个映射到他们公布的内容里。
            请参考美国政府的国家标准技术研究所（National Institute of Standards and Technology，NIST）
            的页面： http://nvd.nist.gov/cvss.cfm              
            <ul>
              <li>高： 7.0 - 10.0 </li>
              <li>中： 4.0 - 6.9 </li>
              <li>低： 0.0 - 3.9 </li>
            </ul>
          </li>
          <li>
            <b>BSI Schwachstellenampel (Germany):</b> 
            德国联邦信息安全办公室(Bundesamt für Sicherheit in der Informationstechnik, BSI)
            应用这个映射到他们的漏洞交通红绿灯（德语 “Schwachstellenampel”）。
            参看德语的 BSI 文档：            
            https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Cyber-Sicherheit/BSI-A-CS_003.pdf
            <ul>
              <li>高： 7.0 - 10.0  ("rot"-红： 危急)</li>
              <li>中： 4.0 - 6.9 ("gelb"-黄：轻度危险)</li>
              <li>低： 0.0 - 3.9 ("grün"-绿：无危险)</li>
            </ul>
          </li>
          <li>
            <b>OpenVAS Classic:</b> 应用传统的 OpenVAS 评级：
            <ul>
              <li>高： 5.1 - 10.0 </li>
              <li>中： 2.1 - 5.0 </li>
              <li>低： 0.0 - 2.0 </li>
            </ul>
          </li>
          <li>
            <b>PCI-DSS:</b> 应用如下映射：
            <ul>
              <li>高： 4.3 - 10.0 </li>
              <li>无： 0.0 - 4.2 </li>
            </ul>
          </li>
        </ul>
      </p>

      <h3>资源过滤器</h3>
      <p>
        针对特定资源应用的默认过滤器。下拉菜单将列出与该资源同类型的
        <a href="filters.html?token={/envelope/token}">过滤器</a> 。
        '--' 意味着没有过滤器可应用，这种情况下其他的设置项数值如每页行数将会被使用。
      </p>

      <h4>代理过滤器</h4>
      <p>
        当进入 <a href="agents.html?token={/envelope/token}">代理</a> 页面时所用的默认过滤器。
      </p>
      <h4>警报过滤器</h4>
      <p>
        当进入 <a href="alerts.html?token={/envelope/token}">警报</a> 页面时所用的默认过滤器。
      </p>
      <h4>扫描配置过滤器</h4>
      <p>
        当进入 <a href="configs.html?token={/envelope/token}">扫描配置</a> 页面时所用的默认过滤器。
      </p>
      <h4>证书过滤器</h4>
      <p>
        当进入 <a href="lsc_credentials.html?token={/envelope/token}">证书</a> 页面时所用的默认过滤器。
      </p>
      <h4>过滤器的 过滤器</h4>
      <p>
        当进入 <a href="filters.html?token={/envelope/token}">过滤器</a> 页面时所用的默认过滤器。
      </p>
      <h4>批注 过滤器</h4>
      <p>
        当进入 <a href="notes.html?token={/envelope/token}">批注</a> 页面时所用的默认过滤器。
      </p>
      <h4>覆盖 过滤器</h4>
      <p>
        当进入 <a href="overrides.html?token={/envelope/token}">覆盖</a> 页面时所用的默认过滤器。
      </p>

      <h4>端口列表 过滤器</h4>
      <p>
        当进入 <a href="port_lists.html?token={/envelope/token}">端口列表</a> 页面时所用的默认过滤器。
      </p>
      <h4>报告格式 过滤器</h4>
      <p>
        当进入 <a href="report_formats.html?token={/envelope/token}">报告格式</a> 页面时所用的默认过滤器。
      </p>
      <h4>计划 过滤器</h4>
      <p>
        当进入 <a href="schedules.html?token={/envelope/token}">计划</a> 页面时所用的默认过滤器。
      </p>
      <h4>从属 过滤器</h4>
      <p>
        当进入 <a href="slaves.html?token={/envelope/token}">从属</a> 页面时所用的默认过滤器。
      </p>
      <h4>标签 过滤器</h4>
      <p>
        当进入 <a href="tags.html?token={/envelope/token}">标签</a> 页面时所用的默认过滤器。
      </p>
      <h4>目标 过滤器</h4>
      <p>
        当进入 <a href="targets.html?token={/envelope/token}">目标</a> 页面时所用的默认过滤器。
      </p>
      <h4>任务 过滤器</h4>
      <p>
        当进入 <a href="tasks.html?token={/envelope/token}">任务</a> 页面时所用的默认过滤器。
      </p>
      <h4>CPEs 过滤器</h4>
      <p>
        当进入 <a href="cpes.html?token={/envelope/token}">CPEs</a> 页面时所用的默认过滤器。
      </p>
      <h4>CVEs 过滤器</h4>
      <p>
        当进入 <a href="cves.html?token={/envelope/token}">CVEs</a> 页面时所用的默认过滤器。
      </p>
      <h4>NVTs 过滤器</h4>
      <p>
        当进入 <a href="nvts.html?token={/envelope/token}">NVTs</a> 页面时所用的默认过滤器。
      </p>
      <h4>OVAL 过滤器</h4>
      <p>
        当进入 <a href="ovaldefs.html?token={/envelope/token}">OVAL 定义</a> 页面时所用的默认过滤器。
      </p>
      <h4>DFN-CERT 过滤器</h4>
      <p>
        当进入 <a href="dfn_cert_advs.html?token={/envelope/token}">DFN-CERT 公告</a> 页面时所用的默认过滤器。
      </p>
      <h4>所有 SecInfo 过滤器</h4>
      <p>
        当进入 <a href="allinfo.html?token={/envelope/token}">所有 SecInfo</a> 页面时所用的默认过滤器。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_filter.html">
  <div class="gb_window_part_center">帮助：新建过滤器
    <a href="/omp?cmd=new_filter&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_FILTER'"/>
      </xsl:call-template>

      <h1>新建过滤器</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#filter">过滤器</a>，
        这个对话框提供下面这些条目。
        点击按钮 “创建过滤器” 以提交新过滤器。
        之后过滤器页面将会被显示。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Single Targets</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>Targets with only one host</td>
        </tr>
        <tr class="odd">
          <td>条件</td>
          <td>--</td>
          <td>200</td>
          <td><a href="/help/powerfilter.html?token={/envelope/token}">超强过滤器（Powerfilter）</a></td>
          <td><tt>ips=1 first=1 rows=-2</tt></td>
        </tr>
        <tr class="even">
          <td>类型</td>
          <td>否</td>
          <td>--</td>
          <td>类型名称</td>
          <td>target（目标）</td>
        </tr>
      </table>

      <h4>过滤器</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="过滤器" title="过滤器"/>
       将会切换到 <a href="filters.html?token={/envelope/token}">过滤器</a>
       页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_group.html">
  <div class="gb_window_part_center">帮助：新建组
    <a href="/omp?cmd=new_group&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_GROUP'"/>
      </xsl:call-template>

      <h1>新建组</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#group">组</a>，
        这个对话框提供下面这些条目。
        点击 “创建组” 以提交新的组。之后组页面将会被显示。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Testing Team</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>All testers</td>
        </tr>
        <tr class="odd">
          <td>用户</td>
          <td>--</td>
          <td>1000</td>
          <td>空格或逗号分隔的用户列表</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>组</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="组" title="组"/>
       将会切换到 <a href="groups.html?token={/envelope/token}">组</a>
       页面
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_note.html">
  <div class="gb_window_part_center">帮助：新建批注
    <a href="/omp?cmd=new_note&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_NOTE'"/>
      </xsl:call-template>

      <h1>新建批注</h1>
      <p>
       为创建一个新的批注，这个对话框提供如下这些条目。
       下面的条目是可能关联到批注的结果详情。
       点击按钮 “创建批注” 以提交新的批注。
       之前的页面将会被更新。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>主机</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>端口</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>严重性</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>任务</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>结果</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>文本</td>
          <td>是</td>
          <td>600</td>
          <td>自由格式文本</td>
          <td>This issue will go away when we switch to GNU/Hurd.</td>
        </tr>
      </table>

      <h4>批注</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="批注" title="批注"/>
       将会切换到批注页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_override.html">
  <div class="gb_window_part_center">帮助：新建覆盖
    <a href="/omp?cmd=new_override&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_OVERRIDE'"/>
      </xsl:call-template>

      <h1>新建覆盖</h1>
      <p>
       为创建一个新的覆盖，这个对话框提供如下这些条目。
       下面的条目是可能关联到覆盖的结果详情。
       点击按钮 “创建覆盖” 以提交新的覆盖。
       之前的页面将会被更新。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>主机</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>端口</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>严重性</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>新严重性</td>
          <td>是</td>
          <td>--</td>
          <td>列表预定义的值或者有效的严重性（CVSS）评分</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>任务</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>结果</td>
          <td>是</td>
          <td>--</td>
          <td>单选按钮</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>文本</td>
          <td>是</td>
          <td>600</td>
          <td>自由格式文本</td>
          <td>This issue will go away when we switch to GNU/Hurd.</td>
        </tr>
      </table>

      <h4>覆盖</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="覆盖" title="覆盖"/>
       将会切换到覆盖页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_role.html">
  <div class="gb_window_part_center">帮助：新建角色
    <a href="/omp?cmd=new_role&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助内容</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_ROLE'"/>
      </xsl:call-template>

      <h1>新建角色</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#role">角色</a>
        这个对话框提供如下这些条目。
        点击按钮 “创建角色” 以提交新的角色。
        之后角色页面将会被显示。 
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Testing Team</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>All testers</td>
        </tr>
        <tr class="odd">
          <td>用户</td>
          <td>--</td>
          <td>1000</td>
          <td>空格或逗号分隔的用户列表</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>角色</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="角色" title="角色"/>
       将会切换到 <a href="roles.html?token={/envelope/token}">角色</a>
       页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_tag.html">
  <div class="gb_window_part_center">帮助：新建标签
    <a href="/omp?cmd=new_tag&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_TAG'"/>
      </xsl:call-template>

      <h1>新建标签</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#tag">标签</a> ，
        该对话框提供如下这些条目。 
        点击按钮 “创建标签” 以提交新的标签。
        之后标签页面将会被显示。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字符数字和符号 -_,: \./</td>
          <td>geo:long</td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>否</td>
          <td>200</td>
          <td>字母数字和符号 -_, \./</td>
          <td>50.231</td>
        </tr>
        <tr class="odd">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字和符号 -_;'äüöÄÜÖß, \./</td>
          <td>Longitude of the target</td>
        </tr>
        <tr class="even">
          <td>所附加的资源类型</td>
          <td>--</td>
          <td>--</td>
          <td>任意资源类型</td>
          <td>Target（目标）</td>
        </tr>
        <tr class="odd">
          <td>所附加的资源 ID</td>
          <td>否</td>
          <td>--</td>
          <td>空着或填一个现有资源的有效 ID </td>
          <td>12508a75-e1f9-4acd-85b9-d1f3ea48db37</td>
        </tr>
        <tr class="even">
          <td>活跃的</td>
          <td>--</td>
          <td>--</td>
          <td>是或否</td>
          <td>Yes（是）</td>
        </tr>
      </table>

      <h4>标签</h4>
      <p>
       点击列表按钮
       <img src="/img/list.png" alt="标签" title="标签"/>
       将会切换到标签页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_target.html">
  <div class="gb_window_part_center">帮助：新建目标
    <a href="/omp?cmd=new_target&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_TARGET'"/>
      </xsl:call-template>

      <h1>新建目标</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#target">目标</a>，
        该对话框提供下面这些条目。
        点击按钮 “创建目标” 以提交新的目标。
        之后目标页面将会被显示。        
      </p>

      <xsl:call-template name="hosts_note_zh"/>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150"></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Staging webservers</td>
        </tr>
        <tr class="even">
          <td>主机：手动</td>
          <td>--</td>
          <td>200</td>
          <td>逗号分隔的 IP 和/或主机名列表</td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="odd">
          <td>主机：从文件</td>
          <td>--</td>
          <td>--</td>
          <td>
            包含逗号分隔的 IP 和/或主机名列表的文件，作为可选的，也可以用换行来分隔。
          </td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="even">
          <td>排除主机</td>
          <td>--</td>
          <td>200</td>
          <td>格式与主机列表一样，但扫描时会排除这些主机</td>
          <td><tt>192.168.1.23, 192.168.1.125, webbackup.mycompany.tld</tt></td>
        </tr>
        <tr class="odd">
          <td>仅逆向查询</td>
          <td>是</td>
          <td>---</td>
          <td>选择</td>
          <td>是 (仅扫描可以通过逆向查询到的主机)</td>
        </tr>
        <tr class="even">
          <td>归一逆向查询</td>
          <td>是</td>
          <td>---</td>
          <td>选择</td>
          <td>是 (将逆向查询值里的重复主机删除，留唯一的)</td>
        </tr>
        <tr class="odd">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>Covers both of our web staging systems</td>
        </tr>
        <tr class="even">
          <td>
            端口列表
            <xsl:if test="not (gsa:may-op ('get_port_lists'))">*</xsl:if>
          </td>
          <td>是</td>
          <td>--</td>
          <td>任意的 <a href="port_lists.html?token={/envelope/token}">已配置的端口列表 </a>。</td>
          <td>All privileged TCP</td>
        </tr>
        <tr class="odd">
          <td>
            SSH 证书
            <xsl:if test="not (gsa:may-op ('get_lsc_credentials'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>--</td>
          <td>任意的 <a href="lsc_credentials.html?token={/envelope/token}">已配置的证书</a>.</td>
          <td>Security Scan Account for SSH</td>
        </tr>
        <tr class="even">
          <td>
            SSH 端口
            <xsl:if test="not (gsa:may-op ('get_lsc_credentials'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>400</td>
          <td>一个端口号</td>
          <td>22</td>
        </tr>
        <tr class="odd">
          <td>
            SMB 证书
            <xsl:if test="not (gsa:may-op ('get_lsc_credentials'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>--</td>
          <td>任意的 <a href="lsc_credentials.html?token={/envelope/token}">已配置的证书</a>.</td>
          <td>Security Scan Account for SMB</td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_port_lists')) or not (gsa:may-op ('get_lsc_credentials'))">
        <b>*</b> 对当前 OMP 服务器连接不可用。
      </xsl:if>

      <p>
        如果后台被配置成支持 LDAP，主机的附加域将会显示，以允许从管理系统导入目标系统：
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="even">
          <td>主机：导入</td>
          <td>---</td>
          <td>---</td>
          <td>已配置的服务的选择</td>
          <td>UCS 2.3</td>
        </tr>
        <tr class="odd">
          <td>用户名</td>
          <td>是</td>
          <td>40</td>
          <td>所选服务的账户名。</td>
          <td>smith</td>
        </tr>
        <tr class="even">
          <td>密码</td>
          <td>是</td>
          <td>40</td>
          <td>上面用户名相应的密码。</td>
          <td></td>
        </tr>
      </table>

      <h4>目标</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="目标" title="目标"/>
       将会切换到目标页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_task.html">
  <div class="gb_window_part_center">帮助：新建任务</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=new_task&amp;overrides=1&amp;token={/envelope/token}">跳转到对话框</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_TASK'"/>
      </xsl:call-template>

      <h1>新建任务</h1>

      <p>
       为创建一个新的
       <a href="glossary.html?token={/envelope/token}#task">任务</a>，
       这个对话框提供如下这些条目。
       点击按钮 “创建任务” 以创建新的任务。
       之后任务的列表将会被显示。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>扫描配置</td>
          <td>是</td>
          <td>---</td>
          <td>选择</td>
          <td>Full and fast</td>
        </tr>
        <tr class="even">
          <td>扫描目标</td>
          <td>是</td>
          <td>---</td>
          <td>选择</td>
          <td>Localhost</td>
        </tr>
        <tr class="odd">
          <td>目标主机排序</td>
          <td>否</td>
          <td>---</td>
          <td>选择</td>
          <td>Sequential（顺序）</td>
        </tr>
        <tr class="even">
          <td>网络源接口</td>
          <td>否</td>
          <td>---</td>
          <td>字母数字</td>
          <td>eth1</td>
        </tr>
        <tr class="odd">
          <td>
            警报
            <xsl:if test="not (gsa:may-op ('get_alerts'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>---</td>
          <td>选择</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>
            计划
            <xsl:if test="not (gsa:may-op ('get_schedules'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>---</td>
          <td>选择</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>
            从属
            <xsl:if test="not (gsa:may-op ('get_slaves'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>---</td>
          <td>选择</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>监视员</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>alice bob</td>
        </tr>
        <tr class="odd">
          <td>
            监视组
            <xsl:if test="not (gsa:may-op ('get_groups'))">*</xsl:if>
          </td>
          <td>否</td>
          <td>---</td>
          <td>选择</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>添加结果到资产管理</td>
          <td>是</td>
          <td>---</td>
          <td>选择</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>扫描强度：每台主机同时执行 NVT 的最大数目</td>
          <td>否</td>
          <td>10</td>
          <td>数字</td>
          <td>2</td>
        </tr>
        <tr class="even">
          <td>扫描强度：同时扫描主机的最大数目</td>
          <td>否</td>
          <td>10</td>
          <td>数字</td>
          <td>10</td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_alerts')) or not (gsa:may-op ('get_schedules')) or not (gsa:may-op ('get_slaves')) or not (gsa:may-op ('get_groups'))">
        <b>*</b> 对当前 OMP 服务器连接不可用。
      </xsl:if>

      <h1>新建容器任务</h1>

      <p>
       为创建一个
       <a href="glossary.html?token={/envelope/token}#task">容器任务</a>，
       该对话框提供如下这些条目。
       点击按钮 “创建任务“ 以创建新的任务。
       之后任务的列表将会被显示。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>报告</td>
          <td>是</td>
          <td>--</td>
          <td>文件</td>
          <td>/tmp/report.xml</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_user.html">
  <div class="gb_window_part_center">帮助：新建用户
    <a href="/omp?cmd=new_user&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'CREATE_USER'"/>
      </xsl:call-template>

      <h1>新建用户</h1>
      <p>
        为创建一个新的
        <a href="glossary.html?token={/envelope/token}#user">用户</a>，
        该对话框提供下面这些条目。
        点击按钮 “创建用户” 以提交新的用户。
        之后用户页面将会被显示。（译者注：英文原表和下面的表格有误，待修订。）
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>必填</td>
          <td>最大长度</td>
          <td>语法</td>
          <td>示例</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>是</td>
          <td>80</td>
          <td>字母数字</td>
          <td>Testing Team</td>
        </tr>
        <tr class="even">
          <td>注释</td>
          <td>否</td>
          <td>400</td>
          <td>字母数字</td>
          <td>All testers</td>
        </tr>
        <tr class="odd">
          <td>用户</td>
          <td>--</td>
          <td>1000</td>
          <td>空格或逗号分隔的用户列表</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>用户</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="用户" title="用户"/>
       将会切换到 <a href="users.html?token={/envelope/token}">用户</a>
       页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="note_details.html">
  <div class="gb_window_part_center">帮助：批注详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability">
        <xsl:with-param name="command" select="'GET_NOTES'"/>
      </xsl:call-template>

      <h1>批注详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#note">批注</a> 的详细信息。
        这包括 NVT、创建时间、修改时间、批注所有的约束条件和批注的全部文本。
        
      </p>
      <p>
        点击 NVT 名称将会跳转到该 NVT 的详情页面。 
      </p>

      <h4>新建批注</h4>
      <p>
        为创建一个新的批注，点击新建图标
        <img src="/img/new.png" alt="新建批注" title="新建批注"/>  
        将会跳转到 <a href="new_note.html?token={/envelope/token}">新建批注</a>
        页面。
      </p>

      <h4>批注</h4>
      <p>
       点击列表按钮
       <img src="/img/list.png" alt="批注" title="批注"/>
       将会切换到批注页面。
      </p>

      <h4>编辑批注</h4>
      <p>
       点击 “编辑批注” 图标 
       <img src="/img/edit.png" alt="编辑批注" title="编辑批注"/>
       将会切换到配置该批注的概览视图，并允许编辑该批注的属性。       
      </p>

      <h4>导出</h4>
      <p>
        导出批注为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="notes.html">
  <div class="gb_window_part_center">帮助：批注
    <a href="/omp?cmd=get_notes&amp;token={/envelope/token}"
       title="批注" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="批注"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_NOTES'"/>
      </xsl:call-template>

      <a name="notes"></a>
      <h1>批注</h1>
      <p>
       这个表格提供所有
       <a href="glossary.html?token={/envelope/token}#note">批注</a> 的概览，
       并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td> 
              批注所应用到的 NVT 的名称。如果名称相对于列太长的话，显示时会被截断。
              </td>
        </tr>
        <tr>
          <td>文本</td>
          <td> 
              批注文本开始处的一份摘录。如果批注因为它应用到的任务被删除而孤立的话，
              “孤立” 两个粗体字将会显示在摘录上面。              
          </td>
        </tr>
      </table>

      <a name="newnote"></a>
      <h3>新建批注</h3>
      <p>
        为创建一个新的批注，点击新建按钮
        <img src="/img/new.png" alt="新建批注" title="新建批注"/> 
        将会跳转到 <a href="new_note.html?token={/envelope/token}">新建批注</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出批注的当前列表，通过点击导出图标
         <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>
      <h4>附加列</h4>
      <p>
        此外，批注列表可以使用特定的域来过滤，这些列显示在批注详情的页面上。
        这些域有：主机、端口、任务（task_name 和 task_uuid）和结果。
      </p>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'批注'"/>
      </xsl:call-template>

      <a name="editnote"></a>
      <h2>编辑批注</h2>
      <p>
        修改批注的页面。这些域和       
        <a href="#newnote">新建批注</a> 页面里的那些类似。
      </p>
      <p>
        点击按钮 “保存批注” 以提交修改。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="performance.html">
  <div class="gb_window_part_center">帮助：性能</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=get_system_reports&amp;duration=86400&amp;slave_id=0&amp;token={/envelope/token}">跳转到对话框</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_SYSTEM_REPORTS'"/>
      </xsl:call-template>

      <a name="performance"></a>
      <h1>性能</h1>
      <p>
        这个页面提供一个系统性能的概览。
      </p>
      <p>       
       一堆图表总结了硬件和操作系统的性能。
       最初图表是总结过去 1 天的活动。
       在对话框顶部是一些链接，可以切换时间段，比如过去 1 小时或 1 个月。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="reports.html">
  <div class="gb_window_part_center">帮助：报告
    <a href="/omp?cmd=get_reports&amp;overrides=1&amp;token={/envelope/token}"
       title="报告" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="报告"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="reports"></a>
      <h1>报告</h1>
      <p>
       这个表格提供所有已配置的
       <a href="glossary.html?token={/envelope/token}#report">报告</a> 的概览，
       并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150px">列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>日期</td>
          <td>
            显示报告的创建日期。
          </td>
        </tr>
        <tr class="even">
          <td>状态</td>
          <td>报告的状态是下面其中之一：
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="运行中">
                    <div class="progressbar_bar" style="width:42px;"></div>
                    <div class="progressbar_text">42 %</div>
                   </div>
                </td>
                <td>
                  这份报告的活跃的扫描正在运行并已经完成了 42%. 
                  百分比是看主机数目乘以所用的 NVT 数目，即已完成的测试占这个总数的百分比。 
                  因此，它可能并不与扫描的时间进度对应得很好。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="已请求">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求</div>
                  </div>
                </td>
                <td>
                   该任务刚开始，并准备委派扫描给扫描引擎。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="已请求删除">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求删除</div>
                  </div>
                </td>
                <td>                  
                  用户最近删除了该任务。目前管理服务器可能需要花一些时间以清空相关的数据库，
                  因为任何关联该任务的报告也都需要删除。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="已请求停止">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求停止</div>
                  </div>
                </td>
                <td>
                  用户最近停止了该扫描。目前管理服务已经提交了这条命令给扫描器，
                  但扫描器还没完全停止该扫描。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="已停止">
                    <div class="progressbar_bar_request" style="width:15px;"></div>
                    <div class="progressbar_text">
                      已停止在 <xsl:value-of select="15"/> %
                    </div>
                  </div>
                </td>
                <td>
                  用户已经停止该扫描。该扫描在停止时完成了15%.
                  同样地，这个状态也可能在这种情况下被设置：
                  扫描由于其它任何情况被停止，如停电了。
                  该报告将仍处在停止状态，即使扫描或管理服务器重启了，比如系统重启后。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="已请求暂停">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求暂停</div>
                  </div>
                </td>
                <td>                  
                  用户最近暂停了该扫描。管理服务器已经提交了这条命令给扫描器，
                  但扫描器还没完全暂停该扫描。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="已暂停">
                    <div class="progressbar_bar_request" style="width:82px;"></div>
                    <div class="progressbar_text">
                      已暂停在 <xsl:value-of select="82"/> %
                    </div>
                  </div>
                </td>
                <td>                  
                  用户暂停了该扫描。扫描在被暂停时已完成了 82%.
                  报告将会变成已停止状态，如果扫描或管理服务器重启的话，如系统重启了。
                  在暂停状态下，扫描服务保持随时待命的活跃态，并且不会释放任何内存。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="内部错误">
                    <div class="progressbar_bar_error" style="width:100px;"></div>
                    <div class="progressbar_text">内部错误</div>
                  </div>
                </td>
                <td>
                  该扫描导致了一个错误。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="已完成">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">已完成</div>
                  </div>
                </td>
                <td>                  
                  扫描过程成功返回，并生成了一份报告。这份报告针对其扫描目标和扫描配置是完整的。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="容器">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">容器</div>
                  </div>
                </td>
                <td>
                   这份报告是一个容器任务的一部分。
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>任务</td>
          <td>该报告的任务</td>
        </tr>
        <tr class="even">
          <td>严重性</td>
          <td>
            报告的严重性结果。显示条将根据不同的严重性级别显示不同颜色，
            严重性级别由当前的            
            <a href="/help/my_settings.html?token={/envelope/token}#severity_class">严重性分类</a> 
            来决定：
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (高)'"/>
                    <xsl:with-param name="title" select="'高'"/>
                  </xsl:call-template>
                </td>
                <td>
                  红条显示最大的严重性评分处在 “高” 危区域。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (中)'"/>
                    <xsl:with-param name="title" select="'中'"/>
                  </xsl:call-template>
                </td>
                <td>
                  黄条显示最大的严重性评分处在 “中” 危区域。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (低)'"/>
                    <xsl:with-param name="title" select="'低'"/>
                  </xsl:call-template>
                </td>
                <td>
                  蓝条显示最大的严重性评分处在 “低” 危区域。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (无)'"/>
                    <xsl:with-param name="title" select="'无'"/>
                  </xsl:call-template>
                </td>
                <td>
                  空条显示没有检测到漏洞。也许某个 NVT 创建了一条记录信息，
                  所以报告可能不是空的。
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>扫描结果：高</td>
          <td>高危结果数目</td>
        </tr>
        <tr class="even">
          <td>扫描结果：中</td>
          <td>中危结果数目</td>
        </tr>
        <tr class="odd">
          <td>扫描结果：低</td>
          <td>低危结果数目</td>
        </tr>
        <tr class="even">
          <td>扫描结果：记录</td>
          <td>记录结果数目</td>
        </tr>
        <tr class="odd">
          <td>扫描结果：假阳性</td>
          <td>假阳性结果的数目</td>
        </tr>
      </table>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <a name="overrides"></a>
      <h3>覆盖</h3>
      <p>
        默认情况下已配置的 <a href="glossary.html?token={/envelope/token}#override">覆盖</a> 
        会被应用。
      </p>
      <p>
        覆盖图标指明覆盖是已被应用
        
        <img src="/img/overrides_enabled.png" alt="覆盖已应用" title="覆盖已应用"/>
        或未被应用
        <img src="/img/overrides_disabled.png" alt="无覆盖" title="无覆盖"/> 。
        点击该图标将切换覆盖的状态。
        在表格视图，严重性分类、严重性数目和趋势可能随着覆盖的状态切换而变化。
      </p>
      <p>        
        请注意，离开这个页面后，覆盖的状态选择将会被重置成应用覆盖。
      </p>

      <a name="actions"></a>
      <h3>动作</h3>

      <h4>增量</h4>
      <p>
        点击增量图标
        <img src="/img/delta.png" alt="比较" title="比较"/> 将会选择用于比较的报告。        
      </p>

      <p>
        一旦一份报告被选择为比较对象，灰色的增量图标        
        <img src="/img/delta_inactive.png" border="0" alt="比较"/>
        指明该报告已经被选中。
        
      </p>

      <p>
        点击第二个增量图标
        <img src="/img/delta_second.png" alt="比较" title="比较"/> 
        将会在这第二个报告和之前选择的第一个报告之间产生一个比较。
      </p>

      <p>
        增量图标仅在过滤后的报告都同属于一个任务时才可用。
        对于多个任务之间的报告，增量图标会显示成灰色的。
      </p>

      <h4>删除报告</h4>
      <p>
        点击删除图标 <img src="/img/delete.png" alt="删除" title="删除"/> 将会
        立即删除该报告（是彻底删除）。报告列表将会被更新。        
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="trashcan.html">
  <div class="gb_window_part_center">帮助：回收站</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=get_trash&amp;token={/envelope/token}">跳转到对话框</a></div>
    <div style="text-align:left">

      <xsl:call-template name="trashcan-availability_zh"/>

      <br/>
      <h1>回收站</h1>
      <p>
        这个页面列出了回收站里当前所有的资源。
        列表根据资源类型分组。
        有一个概览表格在页面顶部，显示了各组的条目计数和到各组的链接。
      </p>

      <a name="actions"></a>
      <h3>动作</h3>

      <h4>删除</h4>
      <p>
       点击删除图标 <img src="/img/delete.png" alt="删除" title="删除"/> 将会
       立即从系统里完全删除该资源。
       回收站页面将会被更新。
       如果该资源被回收站里其它某个资源依赖，那么其图标会显示成灰色的
       <img src="/img/delete_inactive.png" alt="删除" title="删除"/> 。
      </p>

      <h4>还原</h4>
      <p>
       点击还原图标
       <img src="/img/restore.png" alt="还原" title="还原"/>
       将会从回收站里移出该资源并还原到原来的位置。回收站页面将会被更新。
       如果该资源依赖回收站里其它某个资源，该图标会显示成灰色的
       <img src="/img/restore_inactive.png" alt="还原" title="还原"/> 。      
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cvss_calculator.html">
  <div class="gb_window_part_center">帮助： CVSS 计算器
      <a href="/omp?cmd=cvss_calculator&amp;token={/envelope/token}">
        <img src="/img/new.png" title="CVSS 计算器" alt="CVSS 计算器"/>
      </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <a name="cvss_calculator"></a>
      <h1>CVSS 计算器</h1>
      <p>
        这个页面提供一个方便使用的
        <a href="glossary.html?token={/envelope/token}#cvss">CVSS</a>
        基准评分计算器。
      </p>
      <h3>从度量</h3>
      <p>       
        可以从下拉菜单里选择 CVSS 基准度量值。
        <ul>
          <li>
            <b>Access Vector:</b> 定义一个漏洞可能怎样被利用。
          </li>
          <li>
            <b>Access Complexity:</b> 定义利用该漏洞有多难。
          </li>
          <li>
            <b>Authentication:</b> 定义一个攻击者在利用该漏洞之前需要多少次认证。
          </li>
          <li>
            <b>Confidentiality:</b> 定义其对受害系统里存储或处理的数据的机密性影响程度。
          </li>
          <li>
            <b>Integrity:</b> 定义其对受害系统数据完整性的影响程度。
          </li>
          <li>
            <b>Availability:</b> 定义其对受害系统数据可用性的影响程度。
          </li>
        </ul>
      </p>
      <h3>从向量</h3>
      <p>
        插入基准向量 (如: <a href="/omp?cmd=cvss_calculator&amp;cvss_vector=AV:N/AC:M/Au:S/C:P/I:P/A:C&amp;token={/envelope/token}">AV:N/AC:M/Au:S/C:P/I:P/A:C</a>)
        到输入框，并点击 “计算” 按钮，实现直接从一个基准向量计算其 CVSS 基准评分。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="override_details.html">
  <div class="gb_window_part_center">帮助：覆盖的详情
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_OVERRIDES'"/>
      </xsl:call-template>

      <h1>覆盖的详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#override">覆盖</a> 的详细信息。
        这包括 NVT、创建时间、修改时间、覆盖的所有约束条件和覆盖的全部文本。
      </p>
      <p>
        点击 NVT 名称将会跳转到该 NVT 详情页面。
      </p>

      <h4>新建覆盖</h4>
      <p>
        为创建一个新的覆盖，点击新建图标
        <img src="/img/new.png" alt="新建覆盖" title="新建覆盖"/> 
        将会跳转到 <a href="new_override.html?token={/envelope/token}">新建覆盖</a>
        页面。
      </p>

      <h4>覆盖</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="覆盖" title="覆盖"/>
       将会切换到覆盖页面。
      </p>

      <h4>编辑覆盖</h4>
      <p>
       点击 “编辑覆盖” 图标
       <img src="/img/edit.png" alt="编辑覆盖" title="编辑覆盖"/>
       将会切换到配置这个覆盖的概览视图，并允许编辑覆盖的属性。
      </p>

      <h4>导出</h4>
      <p>
        导出该覆盖为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="overrides.html">
  <div class="gb_window_part_center">帮助：覆盖
    <a href="/omp?cmd=get_overrides&amp;token={/envelope/token}"
       title="覆盖" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="覆盖"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_OVERRIDES'"/>
      </xsl:call-template>

      <a name="overrides"></a>
      <h1>覆盖</h1>
      <p>
       这个表格提供所有
       <a href="glossary.html?token={/envelope/token}#override">覆盖</a> 的概览，
       并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>覆盖所应用到 NVT 名称。如果名称相对于列太长的话，名称显示时会被截断。
              </td>
        </tr>
        <tr class="even">
          <td>从</td>
          <td>覆盖应用之前的原始严重性级别。</td>
        </tr>
        <tr class="odd">
          <td>到</td>
          <td>覆盖应用后，指定到报告条目里的新严重性。 </td>
        </tr>
        <tr class="even">
          <td>文本</td>
          <td>
              覆盖文本开始处的一个摘录。如果覆盖由于其应用的任务被删除而变得孤立，
              “孤立” 这两个粗体字会显示在摘录的上方。
          </td>
        </tr>
      </table>
       
      <a name="newoverride"></a>
      <h3>新建覆盖</h3>
      <p>
        为创建一个新的覆盖，点击新建图标
        <img src="/img/new.png" alt="新建覆盖" title="新建覆盖"/> 
        将会跳转到 <a href="new_override.html?token={/envelope/token}">新建覆盖</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出覆盖的当前列表为 XML，通过点击导出图标
         <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>
      <h4>附加列</h4>
      <p>
        此外，覆盖列表可以使用特定的域来过滤，这些域出现在覆盖详情页面里。
        这些域有：主机、端口、任务（task_name 和 task_uuid）和结果。        
      </p>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'覆盖'"/>
      </xsl:call-template>

      <a name="editoverride"></a>
      <h2>编辑覆盖</h2>
      <p>
        修改覆盖的页面。这些域和       
        <a href="#newoverride">新建覆盖</a> 页面里的那些类似。
      </p>
      <p>
       点击按钮 “保存覆盖” 以提交修改。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="powerfilter.html">
  <div class="gb_window_part_center">帮助：超强过滤器
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>
      <h1>超强过滤器</h1>
      <p>
        一个超强过滤器描述怎样减少较多条目的列表为一个较小的列表。
        过滤操作类似于给一个搜索引擎提供的搜索词条。
      </p>
      <p>
        默认的超强过滤器通常是 "rows=10 first=1 sort=name"，这意味着
        包含最多 10 个条目，起始的条目是第 1 个，并且按照 "Name"（名称）列来排序。
      </p>

      <a name="examples"></a>
      <h3>示例</h3>
      <ul>
        <li>
          127.0.0.1
          <ul>
            <li>
              包含这样的条目：任意列的文本里出现 "127.0.0.1" 的任意条目。
              例如，这会匹配 127.0.0.1 和 127.0.0.13 。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          127.0.0.1 IANA
          <ul>
            <li>              
              包含这样的条目：任意列的文本里出现 "127.0.0.1" 或 "IANA" 的任意条目。
              例如，这会匹配拥有端口列表 "All IANA assigned TCP 2012-02-10" 的目标。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          127.0.0.1 and IANA
          <ul>
            <li>
              包含这样的条目：该条目任意一列的文本出现了 "127.0.0.1" ，
              并且其任意一列的文本出现了 "IANA" 。
              例如，这会匹配拥有端口列表 "All IANA assigned TCP 2012-02-10" 并且
              扫描主机是 127.0.0.1 的目标。              
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          "Darling Street Headquarters"
          <ul>
            <li>
              包含这样的条目：该条目任意一列的文本出现了短语 "Darling Street Headquarters" 。
              例如，这将匹配 注释里包含这个短语的 目标。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          regexp 10.128.[0-9]+.[0-9]+
          <ul>
            <li>
              包含这样的条目：该条目任意一列的文本里包含了一个以 "10.128." 打头的 IP 风格字符串。 
              例如，这会匹配 10.128.84.1 和 10.128.98.2。这个例子显示了如何使用正则表达式来进行过滤。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name=Localhost
          <ul>
            <li>              
              包含拥有精确名称 "Localhost" 的任意条目。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name~local
          <ul>
            <li>              
              包含 名称的任意位置出现 "local" 的任意条目。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name:^Local
          <ul>
            <li>              
              包含 名称以 "Local" 打头的任意条目。这展示怎样针对列来使用正则表达式过滤。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          port_list~TCP
          <ul>
            <li>
              包含这样的条目：该条目端口列表名称里的任意位置出现了 "TCP" 。
              这展示如何引用一个名称里有空格的列：将空格转化为下划线。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          modified&gt;2012-05-03 and modified&lt;2012-05-05
          <ul>
            <li>              
              包含这样的条目：其修改时间位于 2012-05-03 0h00 和 2012-05-05 0h00 之间。
              这个过滤器涵盖了完整的两天范围，5月3号和5月4号。
              所使用的时区是用户的当前时区。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          created&gt;2012-05-03T13h00
          <ul>
            <li>
              包含这样的条目：其创建时间是在 2012-05-03 13：00之后。
              这个例子展示长日期格式，包括小时和分钟。
              所使用的时区是用户的当前时区。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          rows=20 first=1 sort=name
          <ul>
            <li>
              包括头 20 个条目，按照 "Name"（名称）列来排序。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          created&gt;-7d
          <ul>
            <li>
              包括过去 7 天之内创建的任意条目。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          title=
          <ul>
            <li>             
              包含这样的条目：其列 "Title" 是空的或者不可用。
              当一个值不可用的时候，列里会包含 "N/A" 字样。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          =127.0.0.1
          <ul>
            <li>              
              包含这样的条目：其任意一列的文本精确地为 "127.0.0.1" 。
              例如，这样就只会匹配 127.0.0.1 ，但不会匹配 127.0.0.13 。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          tag="geo:long=52.2788"
          <ul>
            <li>
              包含这样的条目：其拥有一个名为 "geo:long" 并且值为 "52.2788" 
              的标签。
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          tag~geo
          <ul>
            <li>
              包含这样的条目：其拥有一个 名称里带有 "geo" 的标签。
            </li>
          </ul>
        </li>
      </ul>

      <a name="syntax"></a>
      <h3>语法</h3>
      <p>
        一个超强过滤器由一堆空格分隔的关键字组成。
        整个的关键字是不区分大小写的，所以 "aBc" 和 "AbC" 是一样工作的。
      </p>
      <p>
        短语可以用英文双引号引起来，"like this"，以在关键字里包含空格。
      </p>

      <h4>列关键字</h4>
      <p>       
        一个关键字可以利用下面其中之一的特殊字符，使得列作为关键字的前缀。
        <ul style="list-style: none;">
          <li><b style="margin-right: 10px"><code>=</code></b> 等于</li>
          <li><b style="margin-right: 10px"><code>~</code></b> 包含</li>
          <li><b style="margin-right: 10px"><code>&lt;</code></b> 小于</li>
          <li><b style="margin-right: 10px"><code>&gt;</code></b> 大于</li>
          <li><b style="margin-right: 10px"><code>:</code></b> 匹配正则表达式</li>
        </ul>
        例如 "name=Localhost"（name 是列，Localhost 是关键字）。        
        在使用 = 和 : 关系的情况下，关键字是大小写敏感的;
        在其他关系里关键字是大小写不敏感的，如平常一样。
        
      </p>
      <p>
        为搜索这些特殊字符的其中之一，使用双引号把这个带特殊字符的词引起来。
      </p>
      <p>
        通常情况下，列前缀就是英文列名的小写形式，并且其中的空格要转换成下划线。
        因此 port_list="OpenVAS Default" 就是按照 "Port List" （端口列表）列来过滤。
        (注：如果不知道某列的列前缀是什么，可以点击其列首的中文名称，
         然后查看列表上面过滤器编辑框里面 "sort=" 或 "sort-reverse=" 后面所衔接的关键字，
         就是该列的列前缀。)
      </p>
      <p>        
        在大多数页面，可以使用一些附加域替代列名来过滤：
        <ul>
          <li>uuid -- 条目的 UUID</li>
          <li>comment -- 条目的注释，通常显示在名称列里</li>
          <li>modified -- 条目最后修改的日期和时间</li>
          <li>created -- 条目创建的日期和时间。</li>
        </ul>
      </p>
      <p>        
        列关键字的值可能为空，比如 "name=" 。
        这会匹配列值为空的和不可用的条目。
        当一个值不可用的时候，列里会包含 "N/A" 字样。
      </p>

      <h4>特殊关键字</h4>
      <p>
        特殊关键字 "<b>and</b>" 要求前后两个关键字条件都满足。
        特殊关键字
        "<b>or</b>" 具有类似的行为，但是前后两个关键字条件只需要满足任意一个即可。
      </p>
      <p>
        特殊关键字 "<b>not</b>" 会反转其后续关键字的条件判断。
      </p>
      <p>
        特殊关键字 "<b>regexp</b>" 使得后续的关键字作为一个正则表达式来解析。
        特殊关键字 "<b>re</b>" 是 "regexp" 缩写形式。
      </p>
      <p>
        列关键字 "<b>rows</b>" 决定结果列表里的最大行数。
        例如 "rows=10" 选择最多显示 10 行。
        数值 -1 选择显示所有行，而 -2 则使用
        <a href="/help/my_settings.html?token={/envelope/token}">我的设置</a> 里的 “每页行数”。
      </p>
      <p>
        列关键字 "<b>first</b>" 决定结果列表的首行从总行数里的哪行开始。
        例如，"first=1" 就是从总行数的第 1 行开始显示，
        而 "first=5" 会跳过总行数里的前 4 行，直接从总行数的第 5 行开始显示。
      </p>
      <p>
        列关键字 "<b>sort</b>" 决定结果列表的排序方式。例如，
        "sort=name" 是按照名称列来排序。
        通常所有的列和特殊的附加域比如 UUID 都可以用于排序。
      </p>
      <p>
        列关键字 "<b>sort-reverse</b>" 类似 "sort"，但结果是按照逆序来排的。
      </p>
      <p>
        列关键字 "<b>tag</b>" 选择有附加指定标签的条目。
        可以用名称或 名称与值都用，名称和值之间用等号 (=) 分隔。
        标签名称或值要放到引号里，或者使用其他字符串界定符。
        <br/>
        当同时指定名称和值的时候，标签必须同时匹配这两个条件。
        如果只给定了名称，标签的值就可以随意，包括没有值。
        <br/>
        关键字 "tag" 支持 =, ~ 和 : 关系。 &gt; and &lt; 将当作和 = 一样。
      </p>

      <h4>日期格式</h4>
      <p>
        日期可以表示成绝对或相对的形式。
      </p>
      <p>
        绝对日期形式为 "2012-05-03T13h00"，例如搜索条目里的
        "modified&gt;2012-05-03T13h00"。
        时间是可选的，因此形式 "2012-05-03" 也是可以接受的，这意味着是当天的 00:00 。          
      </p>
      <p>
        
        相对日期形式表示成相对于当前时间的一些时间单元。例如，
        "-7d" 意味着 7 天前，而 "3m" 是指未来的 3 分钟。
        因此搜索条目 "created&gt;-2w" 包含了过去两周里创建的所有资源。
      </p>
      <p>
        用于相对时间格式的修饰字符有： <b>s</b>econd-秒,
        <b>m</b>inute-分, <b>h</b>our-小时, <b>d</b>ay-天, <b>w</b>eek-周, <b>M</b>onth-月 和
        <b>y</b>ear-年。 出于简化考虑，月就是指过去的30天，年就是指过去的365天。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="task_details.html">
  <div class="gb_window_part_center">帮助：任务详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=get_task&amp;task_id=343435d6-91b0-11de-9478-ffd71f4c6f29&amp;overrides=1&amp;token={/envelope/token}">跳转到示例内容对话框</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_TASKS'"/>
      </xsl:call-template>

      <h1>任务详情</h1>
      <p>
       这个信息对话框列出名称、状态、任务的数个报告，后续显示的报告列表都是该任务的。
       它也列出了用于报告显示的目标主机扫描顺序、网络源接口、
       <a href="glossary.html?token={/envelope/token}#config">扫描配置</a>、
       <a href="glossary.html?token={/envelope/token}#alert">警报</a>、
       <a href="glossary.html?token={/envelope/token}#schedule">计划</a> 和
       <a href="glossary.html?token={/envelope/token}#target">目标</a> ，如果选定了这些参数的话。
       关于所选的扫描配置、警报、计划或目标的信息，可以通过点击相应的条目名称来查看。
      </p>

      <a name="reports"></a>
      <h1>报告</h1>
      <p>
       这个表格提供选定任务的所有       
       <a href="glossary.html?token={/envelope/token}#report">报告</a> 的概览（参看任务摘要框）。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>报告</td>
          <td>显示报告的时间戳。这指明扫描的完成时间和最终报告的生成时间。</td>
        </tr>
        <tr>
          <td>严重性</td>
          <td>报告最高的严重性。严重性显示条会根据不同的严重性级别显示不同颜色，
              严重性级别由当前的
              <a href="/help/my_settings.html?token={/envelope/token}#severity_class">严重性分类</a> 
              来定义：
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (高)'"/>
                    <xsl:with-param name="title" select="'高'"/>
                  </xsl:call-template>
                </td>
                <td>
                  红条显示最大的严重性评分处在“高”危区域。 
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (中)'"/>
                    <xsl:with-param name="title" select="'中'"/>
                  </xsl:call-template>
                </td>
                <td>
                  黄条显示最大的严重性评分处在“中”危区域。 
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (低)'"/>
                    <xsl:with-param name="title" select="'低'"/>
                  </xsl:call-template>
                </td>
                <td>
                  蓝条显示最大的严重性评分处在“低”危区域。 
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (无)'"/>
                    <xsl:with-param name="title" select="'无'"/>
                  </xsl:call-template>
                </td>
                <td>
                 空条显示没有检测到漏洞的情况。也许某个 NVT 创建了一条记录信息，所以报告不一定是空的。 
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>扫描结果</td>
          <td>这个列罗列出每个严重性级别的事件数目。            
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-label">
                    <xsl:with-param name="level" select="'High'"/>
                  </xsl:call-template>
                </td>
                <td>
                  扫描期间发现的 “高” 危问题数目。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-label">
                    <xsl:with-param name="level" select="'Medium'"/>
                  </xsl:call-template>
                </td>
                <td>
                  扫描期间发现的 “中” 危问题数目。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-label">
                    <xsl:with-param name="level" select="'Low'"/>
                  </xsl:call-template>
                </td>
                <td>
                  扫描期间发现的 “低” 危问题数目。
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-label">
                    <xsl:with-param name="level" select="'Log'"/>
                  </xsl:call-template>
                </td>
                <td>
                  扫描期间出现的记录条目的数目。
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p> 
     （译者注：这部分原文帮助是旧版的没更新，任务详情页面报告计数有两个，第一个是包含未完成报告的总数，
       第二个是已完成报告的计数，点击其中一个就进入相应的任务报告列表。）
      </p>

      <a name="overrides"></a>
      <h3>覆盖</h3>
      <p>
       默认情况下已配置的 <a href="glossary.html?token={/envelope/token}#override">覆盖</a> 会被应用。
       覆盖的选项允许切换到不应用覆盖的视图。
       在表格视图，严重性和扫描结果数目可能随着该选项的切换而变化。
       通过点击刷新图标       
       <img src="/img/refresh.png" alt="Refresh" title="Refresh"/> 即可确认一个更改。        
      </p>
      <p>
        当前页面的活跃选项通过
        勾号 (&#8730;) 来标记。     
      </p>
      <p>      
       请注意离开该页面后，覆盖的选项将会被重置为应用覆盖。     
      </p>

      <p> 
          （译者注：这部分原文帮助是旧版的没更新，实际上的覆盖选项是严重性列首格子里右边的图标按钮
          <img src="/img/overrides_enabled.png" alt="覆盖已应用" title="覆盖已应用"/>
          或
          <img src="/img/overrides_disabled.png" alt="无覆盖" title="无覆盖"/> 。）
      </p>


      <a name="actions"></a>
      <h3>动作</h3>

      <h4>增量</h4>
      <p>
       点击增量图标
       <img src="/img/delta.png" alt="比较" title="比较"/> 
       将会选择该报告用于比较。
      </p>

      <p>
       一旦一份报告选定用于比较，灰色的增量图标       
       <img src="/img/delta_inactive.png" border="0" alt="比较"/>
       表示该报告已经为增量选中。
      </p>

      <p>
       点击第二个增量图标
       <img src="/img/delta_second.png" alt="比较" title="比较"/> 
       将会在这第二份报告和之前选择的第一份报告之前产生一个比较。
      </p>

      <h4>详情</h4>
      <p>
       点击详情图标
       <img src="/img/details.png" alt="详情" title="详情"/> 
       将会显示所有的报告详情到一个新页面
       <a href="/help/view_report.html?token={/envelope/token}">查看报告</a> 。
      </p>

      <h4>删除报告</h4>
      <p>
       点击删除图标 <img src="/img/delete.png" alt="Delete" title="Delete"/> 将会立即
       删除该报告（是彻底删除）。报告列表将会被更新。
      </p>

      <a name="notes"></a>
      <h1>批注</h1>
      <p>
       这个表格提供 应用到该任务生成的任意结果的 所有
       <a href="glossary.html?token={/envelope/token}#note">批注</a> 的概览。
       它的格式非常类似于
       <a href="notes.html?token={/envelope/token}">批注</a> 页面。
      </p>

      <a name="overrides"></a>
      <h1>覆盖</h1>
      <p>
       这个表格提供 应用到该任务生成的任意结果的 所有
       <a href="glossary.html?token={/envelope/token}#override">覆盖</a> 的概览。
       它的格式非常类似于
       <a href="overrides.html?token={/envelope/token}">覆盖</a> 页面。
      </p>

      <a name="import_report"></a>
      <h1>导入报告</h1>
      <p>
        为导入一个报告到容器里，选择报告文件并点击 “添加报告” 按钮。（仅容器任务有这个功能。）
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_details.html">
  <div class="gb_window_part_center">帮助：扫描配置详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <h1>扫描配置详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#config">扫描配置</a> 的详细信息，
        以及关联的配置参数信息。
      </p>

      <h4>新建扫描配置 </h4>
      <p>
        为创建一个新的扫描配置，点击新建按钮
        <img src="/img/new.png" alt="新建扫描配置" title="新建扫描配置"/>
        将会跳转到 <a href="new_config.html?token={/envelope/token}">
        新建扫描配置</a> 页面。
      </p>

      <h4>扫描配置</h4>
      <p>
        点击列表图标
        <img src="/img/list.png" alt="扫描配置" title="扫描配置"/>
        将会切换到扫描配置页面。
      </p>

      <h4>导出扫描配置</h4>
      <p>
        导出扫描配置为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <h2>网络漏洞测试家族</h2>
      <p>
       这个表格提供所选取的 NVT 项和 NVT 家族的概览。
       家族列首格子里右边的趋势图标指明新的家族是会被自动包含（“增长”）        
       <img src="/img/trend_more.png" alt="增长" title="增长"/>
       或不自动包含 (“静态”) <img src="/img/trend_nochange.png" alt="静态" title="静态"/>。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>家族</td>
          <td>显示 NVT 家族的名称。</td>
        </tr>
        <tr class="even">
          <td>NVT 选取</td>
          <td>
              显示当前 NVT 集合在这一家族里考虑的 NVT 项的数目，和这一家族 NVT 项的总数。 
              </td>
        </tr>
        <tr class="odd">
          <td>趋势</td>
          <td>显示趋势，用于指明该家族新的 NVT 项被会自动添加到扫描配置（“增长”）
              <img src="/img/trend_more.png" alt="增长" title="增长"/> 或 不自动添加（静态）
              <img src="/img/trend_nochange.png" alt="静态" title="静态"/>。
              </td>
        </tr>
      </table>

      <h3>动作</h3>

      <h4>扫描配置家族详情</h4>
      <p>
       点击详情图标 <img src="/img/details.png" alt="详情" title="详情"/>
       将会立即显示详细的 <a href="config_family_details.html?token={/envelope/token}">NVT 列表</a>
       和它的首选项。
      </p>

      <h2>扫描器首选项</h2>
      <p>
       这个表格显示扫描引擎自己的首选项。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示扫描器首选项的名称。</td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>显示扫描器首选项的当前值。</td>
        </tr>
      </table>

      <h2>网络漏洞测试首选项</h2>
      <p>       
       网络漏洞测试可以有多个首选项，这些会影响到测试行为。
       这个表格每行列出一个首选项和其当前值。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>显示一个 NVT 测试的名称。</td>
        </tr>
        <tr class="even">
          <td>名称</td>
          <td>显示一个 NVT 测试的一个首选项的名称。</td>
        </tr>
        <tr class="odd">
          <td>值</td>
          <td>显示一个 NVT 测试的一个首选项的当前值。</td>
        </tr>
      </table>

      <h3>动作</h3>

      <h4>扫描配置 NVT 详情</h4>
      <p>
       点击详情图标
       <img src="/img/details.png" alt="详情" title="详情"/> 将会打开
       <a href="config_nvt_details.html?token={/envelope/token}">扫描配置 NVT 详情</a> 对话框，
       显示关于一个特定 NVT 测试的详细信息和它所有的首选项。
      </p>

      <h2>使用该配置的任务</h2>
      <p>
       使用该扫描配置的任务被会列出来。
       点击详情图标 <img src="/img/details.png" alt="详情" title="详情"/> 将会打开
        <a href="task_details.html?token={/envelope/token}">任务详情</a> 页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor.html">
  <div class="gb_window_part_center">帮助：扫描配置编辑器</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <h1>扫描配置编辑器</h1>
      <p>
       扫描配置编辑器允许修改一个       
       <a href="glossary.html?token={/envelope/token}#config">扫描配置</a> 的所有参数。
       这包括
       <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> 测试项的选择，
       并可以指出选择的测试项怎样自动更新，还有 NVT 首选项、超时、高级的扫描器首选项。
      </p>
      <p>
        请注意，只有目前没被       
        <a href="glossary.html?token={/envelope/token}#task">任务</a> 所使用的扫描配置才允许修改。
      </p>

      <h1>编辑扫描配置详情</h1>
      <p>
       这个对话框显示一个给定的       
       <a href="glossary.html?token={/envelope/token}#config">扫描配置</a> 的名称和注释，
       以及该扫描配置自己所关联的配置参数。
       这个对话框允许调整该扫描配置的所有参数。
      </p>
      <p>
        请注意：为保存修改，必须点击 “保存配置” 按钮。点击该按钮后，在 NVT 家族上的编辑动作
        <img src="/img/edit.png" alt="编辑" title="编辑"/>
        将会保存各个选项。
      </p>

      <h2>编辑网络漏洞测试家族</h2>
      <p>       
       这个表格提供所选的 NVT 项和 NVT 家族的概览，并允许选择哪些家族或哪些个别的 NVT 项应该被包含。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>家族</td>
          <td>
              显示 NVT 家族的名称。在家族列首格子里的趋势图标允许指定
              新的家族是自动被包含（“增长”）
              <img src="/img/trend_more.png" alt="增长" title="增长"/> 
              或 不自动包含（“静态”）
              <img src="/img/trend_nochange.png" alt="静态" title="静态"/>。</td>
        </tr>
        <tr class="even">
          <td>NVT 选取</td>
          <td>
              显示 NVT 测试的数目，第一个数是该家族里被当前 NVT 集合考虑的 NVT 测试数目，
              第二个数是该家族的 NVT 测试总数。
              </td>
        </tr>
        <tr class="odd">
          <td>趋势</td>
          <td>
              允许修改这个家族内的趋势。如果趋势设置为 “增长” 
              <img src="/img/trend_more.png" alt="增长" title="增长"/>，
              该家族的新 NVT 测试将会被自动包含到当前扫描配置。
              如果设置为 “静态”  <img src="/img/trend_nochange.png" alt="静态" title="静态"/>，
              在该家族里选择的 NVT 测试不会自动更改。</td>
        </tr>
        <tr class="even">
          <td>选择所有的 NVT</td>
          <td>
              如果这个复选框被勾选，那么该家族里目前所有可用的 NVT 测试都会被选中。
              </td>
        </tr>
      </table>

      <h3>动作</h3>

      <h4>保存配置并编辑家族详情</h4>
      <p>
       点击编辑图标 <img src="/img/edit.png" alt="编辑" title="编辑"/>
       将会保存修改并显示       
       <a href="config_editor_nvt_families.html?token={/envelope/token}">编辑扫描配置家族详情</a>
       页面，该页面展示家族内部的 NVT 详情并允许选中或不选中个别的 NVT 。        
      </p>

      <h2>编辑扫描器首选项</h2>
      <p>
        这个表格显示扫描引擎本身的首选项，并允许修改这些首选项。
        这个特性倾向于仅让高级用户使用。
        在点击表格下方的 “保存配置” 按钮之后，修改将会被保存。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示扫描器首选项的名称</td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>显示扫描器首选项的当前值。</td>
        </tr>
      </table>

      <h2>网络漏洞测试首选项</h2>
      <p>
       网络漏洞测试可以有多个首选项，这些会影响到测试行为。
       这个表格的每一行列出一个首选项和它的当前值。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>显示一个 NVT 测试的名称</td>
        </tr>
        <tr class="even">
          <td>名称</td>
          <td>显示一个 NVT 测试的一个首选项的名称。</td>
        </tr>
        <tr class="odd">
          <td>值</td>
          <td>显示一个 NVT 测试的一个首选项的当前值。</td>
        </tr>
      </table>

      <h3>动作</h3>

     <h4>扫描配置 NVT 详情</h4>
      <p>
       点击详情图标
       <img src="/img/details.png" alt="详情" title="详情"/> 将会打开
       <a href="config_nvt_details.html?token={/envelope/token}">扫描配置 NVT 详情</a> 
       对话框，该对话框会显示关于一个特定 NVT 测试的详细信息和它所有的首选项。
      </p>

      <h4>编辑扫描配置 NVT 详情</h4>

      <p>
       点击编辑图标 <img src="/img/edit.png" alt="编辑" title="编辑"/>
       将会打开 <a href="config_editor_nvt.html?token={/envelope/token}">编辑扫描配置 NVT 详情</a>
       对话框，该对话框会显示关于一个特定 NVT 测试的详细信息和它所有的首选项。
       这个页面将提供关于这个 NVT 测试的所有的首选项和当前设定的超时时间，并允许做修改。
      </p>

      <h2>使用该配置的任务</h2>
      <p>
       使用该扫描配置的任务将会被罗列出来。
       点击详情图标 <img src="/img/details.png" alt="详情" title="详情"/> 将会打开
         <a href="task_details.html?token={/envelope/token}">任务详情</a> 页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor_nvt_families.html">
  <div class="gb_window_part_center">帮助：扫描配置编辑器-NVT 家族</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <a name="editconfigfamilydetails"></a>
      <h1>编辑扫描配置家族详情</h1>
      <p>
        这个页面展示
        在一个 <a href="glossary.html?token={/envelope/token}#config">扫描配置</a> 里的
        一个家族的 <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> 测试概览。
      </p>

      <h2>编辑网络漏洞测试</h2>
      <p>
        这个表格提供一个扫描配置里一个家族的 NVT 测试概览，
        并允许包含或排除一个 NVT 测试，并允许修改它的首选项或超时时间。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示一个 NVT 测试的名称</td>
        </tr>
        <tr class="even">
          <td>OID</td>
          <td>显示一个 NVT 测试的 OID 。</td>
        </tr>
        <tr class="even">
          <td>严重性</td>
          <td>显示一个 NVT 测试的 CVSS 评分，大多数有评分，但不是所有的 NVT 都有分值。</td>
        </tr>
        <tr class="odd">
          <td>超时</td>
          <td>显示一个 NVT 当前的超时设置，以秒为单位（或者 “默认” 就是使用默认的超时时间）</td>
        </tr>
        <tr class="even">
          <td>首选项</td>
          <td>显示一个 NVT 测试的首选项的数目。</td>
        </tr>
        <tr class="odd">
          <td>选取</td>
          <td>
              显示该条 NVT 测试是被包含在扫描配置里还是没被包含，
              并允许将它添加到选择集合或从选择集合里删除。</td>
        </tr>
      </table>

      <h3>动作</h3>

      <h4>NVT 详情</h4>
      <p>
       点击详情图标 <img src="/img/details.png" alt="详情" title="详情"/>
       将引向显示 <a href="config_nvt_details.html?token={/envelope/token}">NVT 详情</a> 的页面。
      </p>

      <h4>选择并编辑 NVT 详情</h4>
      <p>
       点击编辑图标 <img src="/img/edit.png" alt="编辑" title="编辑"/>
       将会添加该 NVT 测试到选择集合，并引向显示
       <a href="config_editor_nvt.html?token={/envelope/token}">编辑扫描配置 NVT </a> 详情的页面，
       允许修改 NVT 测试的首选项和超时时间。       
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor_nvt.html">
  <div class="gb_window_part_center">帮助：扫描配置编辑器-NVT</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <h1>编辑扫描配置 NVT 详情</h1>
      <p>
        这个对话框显示在
        <a href="glossary.html?token={/envelope/token}#config">扫描配置</a>里一个单独的
        <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>
        测试的信息和它的首选项设置。
      </p>

      <h2>编辑网络漏洞测试</h2>

      <h3>详情</h3>
      <p>
        提供信息，比如 NVT 测试的名称、摘要、OID、家族隶属关系和参考信息。      
      </p>

      <h3>描述</h3>
      <p>
        这一节提供该 NVT 测试的描述。它可能包含一个在风险因素里的分类
        和为修正 通过该 NVT 检测到的问题 而建议的解决方案。
      </p>

      <h3>首选项</h3>
      <p>
        这个表格显示超时的数值，并在每行显示一个特定的首选项。
        依据不同的首选项，使用不同的输入方式（比如复选框、文本输入框等）。
      </p>
      <p>
        请注意：在进行任何更改后，需要点击 “保存设置” 以提交更改。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示 NVT 首选项的名称。</td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>              
              在给定扫描配置里该 NVT 测试首选项的数值。对不同的首选项类型，会呈现不同的输入方式。 </td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="config_family_details.html">
  <div class="gb_window_part_center">帮助：扫描配置家族详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <a name="configfamilydetails"></a>
      <h1>扫描配置家族详情</h1>
      <p>
        这个页面展示一个
        <a href="glossary.html?token={/envelope/token}#config">扫描配置</a>里
        一个家族的 <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> 测试概览。
      </p>

      <h2>网络漏洞测试</h2>
      <p>
        这个表格提供在一个扫描配置里一个家族的 NVT 测试的概览。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示一个 NVT 测试的名称。</td>
        </tr>
        <tr class="even">
          <td>OID</td>
          <td>显示一个 NVT 测试的 OID 。</td>
        </tr>
        <tr class="even">
          <td>严重性</td>
          <td>显示一个 NVT 的 CVSS 评分。大多数有评分，但不是所有的 NVT 都有分值。</td>
        </tr>
        <tr class="odd">
          <td>超时</td>
          <td>显示一个 NVT 的当前超时设置，单位是秒（或 “默认” 就是使用默认的超时时间）。</td>
        </tr>
        <tr class="even">
          <td>首选项</td>
          <td>显示一个 NVT 测试的首选项的数目。</td>
        </tr>
      </table>

      <h3>动作</h3>

      <h4>NVT 详情</h4>
      <p>
        点击详情图标 <img src="/img/details.png" alt="详情" title="详情"/>
        将会引向显示 <a href="config_nvt_details.html?token={/envelope/token}">NVT 详情</a> 的页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_nvt_details.html">
  <div class="gb_window_part_center">帮助：扫描配置 NVT 详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <h1>扫描配置 NVT 详情</h1>
      <p>
        这个对话框显示在一个       
        <a href="glossary.html?token={/envelope/token}#config">扫描配置</a>里一个单独的
        <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> 测试的信息和它的首选项设置。
      </p>

      <h2>网络漏洞测试</h2>

      <h3>详情</h3>
      <p>
        提供信息，比如该 NVT 的名称、摘要、OID、家族隶属关系和参考信息。
        大多数 NVT 都有一个 CVSS 分值。
      </p>

      <h3>描述</h3>
      <p>
        这一节提供该 NVT 的一个描述。它包括一个风险分类和
        为修正 通过该 NVT 检测到的问题 而建议的解决方案。
      </p>

      <h3>首选项</h3>
      <p>
        这个表格显示超时的数值，并在每行显示一个特定的 NVT 首选项。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示该 NVT 测试首选项的名称。</td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>
              在给定扫描配置里，该 NVT 首选项的数值。</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tag_details.html">
  <div class="gb_window_part_center">帮助：标签详情
    <img src="/img/details.png" border="0" style="margin-left:3px;"/>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <h1>标签详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#tag">标签</a> 的详细信息。
        这包括名称、值、注释、它所附加的资源、它是否活跃，以及它是否孤立（附加到一个不存在的资源）。       
      </p>

      <h4>新建标签</h4>
      <p>
        为创建一个新的标签，点击新建图标
        <img src="/img/new.png" alt="新建标签" title="新建标签"/> 
        将会跳转到 <a href="new_tag.html?token={/envelope/token}">新建标签</a>
        页面。
      </p>

      <h4>标签</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="标签" title="标签"/>
       将会切换到标签页面。
      </p>

      <h4>编辑标签</h4>
      <p>
       点击 “编辑标签” 图标
       <img src="/img/edit.png" alt="编辑标签" title="编辑标签"/>
       将会切换到该标签的概览视图并允许编辑该标签的属性。
      </p>

      <h4>导出</h4>
      <p>
        导出该标签为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="target_details.html">
  <div class="gb_window_part_center">帮助：目标详情
    <a href="/omp?cmd=get_target&amp;target_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_TARGETS'"/>
      </xsl:call-template>

      <h1>目标详情</h1>
      <p>
        提供关于一个
        <a href="glossary.html?token={/envelope/token}#target">目标</a> 的详细信息。
        这包括名称、注释、主机、排除主机和需要扫描的最大主机数目。
        如果有证书关联到该目标，它们的名字会被显示。
        点击一个证书名称，将会显示该关联证书的更多信息。
      </p>

      <h4>新建目标</h4>
      <p>
        为创建一个新的目标，点击新建图标
        <img src="/img/new.png" alt="新建目标" title="新建目标"/> 
        将会跳转到 <a href="new_target.html?token={/envelope/token}">新建目标</a>
        页面。
      </p>

      <h4>目标</h4>
      <p>
       点击列表图标
       <img src="/img/list.png" alt="目标" title="目标"/>
       将会切换到目标页面。
      </p>

      <h4>编辑目标</h4>
      <p>
       点击 “编辑目标” 图标 
       <img src="/img/edit.png" alt="编辑目标" title="编辑目标"/>
       将会切换到配置该目标的概览视图，并允许编辑该目标的属性。
      </p>

      <h4>导出</h4>
      <p>
        导出该目标为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <h3>使用该目标的任务</h3>
      <p>
        这个表格提供关联到该目标的任务的概览（如果有的话）。
        这些任务的详情可以通过点击详情图标        
        <img src="/img/details.png" alt="详情" title="详情"/> 来查看。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tags.html">
  <div class="gb_window_part_center">帮助：标签
    <a href="/omp?cmd=get_tags&amp;token={/envelope/token}"
       title="标签" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="标签"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <h1>标签</h1>
      <p>
       这个表格提供所有       
       <a href="glossary.html?token={/envelope/token}#tag">标签</a> 的概览，
       并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示该标签的名称，如果指定了注释，会显示在名称下方的括号里。
              </td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>该标签关联的值。</td>
        </tr>
        <tr class="odd">
          <td>附加的资源类型</td>
          <td>标签所附加的资源类型。</td>
        </tr>
        <tr class="even">
          <td>附加的资源名称</td>
          <td>          
          如果标签所附加的资源有可用的名称，就显示该名称，否则显示资源 ID 。<br/>
          点击一个带链接的资源名称将会打开该资源的详情页面。          
          </td>
        </tr>
        <tr class="odd">
          <td>修改于</td>
          <td>显示标签最后修改的日期。</td>
        </tr>
      </table>

      <h3>新建标签</h3>
      <p>
        为创建一个新的标签，点击新建图标
        <img src="/img/new.png" alt="新建标签" title="新建标签"/> 
        将会跳转到 <a href="new_tag.html?token={/envelope/token}">新建标签</a>
        页面。
      </p>

      <h3>导出</h3>
      <p>
        导出标签的当前列表为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'标签'"/>
        <xsl:with-param name="showenable" select="1"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="user-tags.html">
  <div class="gb_window_part_center">帮助：用户标签列表</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <h1>用户标签</h1>
      <p>
       这个表格提供所有附加到一个资源的活跃的
       <a href="glossary.html?token={/envelope/token}#tag">标签</a> 的概览。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示该标签的名称。</td>
        </tr>
        <tr class="even">
          <td>值</td>
          <td>该标签关联的值。</td>
        </tr>
        <tr class="odd">
          <td>注释</td>
          <td>该标签的注释。</td>
        </tr>
      </table>

      <h3>新建标签</h3>
      <p>
        为给当前资源新建一个标签，点击新建图标
        <img src="/img/new.png" alt="新建标签" title="新建标签"/> 
        将会跳转到 <a href="new_tag.html?token={/envelope/token}">新建标签</a>
        页面。
      </p>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'标签'"/>
        <xsl:with-param name="showenable" select="1"/>
        <xsl:with-param name="noclone" select="1"/>
        <xsl:with-param name="noexport" select="1"/>
      </xsl:call-template>

      <h2>添加标签</h2>
      <p>
        如果当前资源存在标签，或者与该资源同类型的其他资源有标签，
         &quot;添加标签&quot; 工具条将会显示在用户标签列表上面。
        当从下拉列表里选择一个标签名称，并输入一个值到文本框里（可选的），
        拥有这些属性的新标签就可以快速添加到当前资源，
        而不需要通过点击新建图标 <img src="/img/new.png" alt="新建标签" title="新建标签"/>
        跳转到
        <a href="new_tag.html?token={/envelope/token}">新建标签</a>
        页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="targets.html">
  <div class="gb_window_part_center">帮助：目标
    <a href="/omp?cmd=get_targets&amp;token={/envelope/token}"
       title="目标" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="目标"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_TARGETS'"/>
      </xsl:call-template>

      <h1>目标</h1>
      <p>
        这个表格提供所有已配置的
        <a href="glossary.html?token={/envelope/token}#target">目标</a> 的概览。
        目标条目的完整内容会被显示（名称、注释和主机）。
        如果有证书链接到该目标，它们也会被显示。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>显示该目标的名称，如果指定了注释，会显示在名称下方的括号里。
              </td>
        </tr>
        <tr class="even">
          <td>主机</td>
          <td>
              逗号分隔的目标主机列表，通过主机名或 IP 指定均可。</td>
        </tr>
        <tr class="odd">
          <td>IPs</td>
          <td>
              在计算指定包含主机和排除主机的结果后，目标主机 IP 地址的总数。
              这是一个最大估值，因为它并没有考虑扫描运行时的特性，
              比如解析需要排除的主机名，也没考虑一些选项，比如仅逆向查询和归一逆向查询。
              </td>
        </tr>
        <tr class="even">
          <td>端口列表</td>
          <td>
              所关联的端口列表，可以点击其名称查看详情。</td>
        </tr>
        <tr class="odd">
          <td>SSH 证书</td>
          <td>所关联的 SSH 证书，可点击其名称查看详情。</td>
        </tr>
        <tr class="even">
          <td>SMB 证书</td>
          <td>所关联的 SMB 证书，可点击其名称查看详情。</td>
        </tr>
      </table>

      <xsl:call-template name="hosts_note_zh"/>

      <h3>新建目标</h3>
      <p>
        为创建一个新的目标，点击新建图标
        <img src="/img/new.png" alt="新建目标" title="新建目标"/> 
        将会跳转到 <a href="new_target.html?token={/envelope/token}">新建目标</a>
        页面
      </p>

      <h3>导出</h3>
      <p>
        导出目标的当前列表为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <xsl:call-template name="list-window-line-actions_zh">
        <xsl:with-param name="type" select="'目标'"/>
        <xsl:with-param name="used_by" select="'任务'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>


<xsl:template mode="help" match="tasks.html">
  <div class="gb_window_part_center">帮助：任务
    <a href="/omp?cmd=get_tasks&amp;token={/envelope/token}"
       title="任务" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="任务"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_TASKS'"/>
      </xsl:call-template>

      <a name="tasks"></a>
      <h1>任务</h1>
      <p>
       本表提供所有已配置的
       <a href="glossary.html?token={/envelope/token}#task">任务</a> 
       的概览，并概括了每个条目的重点。       
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>
            显示任务的名称。名称不一定要唯一，所以相同的名称可能出现多次。
            它们通过内部的 ID 来区分识别这些任务。 
            <br/>
            如果某任务有一个注释，那么注释会显示在表格中该任务名称下方的括号里。 
            <div>
              这一列内的右边可能有一些图标：
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/alterable.png"
                         border="0"
                         alt="任务是可变的"
                         title="任务是可变的"/>
                  </td>
                  <td>
                    该任务标记为可变的。这将允许一些属性可以被编辑，而这些属性在其他情况下是一旦存在任务报告就会被锁定的。
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/sensor.png"
                         border="0"
                         alt="任务被配置成在从属样机上运行"
                         title="任务被配置成在从属样机上运行"/>
                  </td>
                  <td>
                    该任务被配置成在从属机上运行。 
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/provide_view.png"
                         border="0"
                         alt="任务可见于：user1 user2"
                         title="任务可见于：user1 user2"/>
                  </td>
                  <td>
                    该任务对一个或多个其他用户可见。
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.png"
                         border="0"
                         alt="监视的任务属于 user1"
                         title="监视的任务属于 user1"/>
                  </td>
                  <td>
                    该任务仅用于监视。它属于另一个用户。
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr class="even">
          <td>状态</td>
          <td>该任务最近扫描的状态。<br/>
            点击进度条将进入当前的报告，该报告可能是未完成的，这依赖于本次扫描的状态。 <br/>
            任务的状态是如下其中之一：
            <br/>
            <table>
              <tr><td valign="top">
                  <div class="progressbar_box" title="运行中">
                    <div class="progressbar_bar" style="width:42px;"></div>
                    <div class="progressbar_text">42 %</div>
                   </div>
                </td><td>
                 该任务活跃的扫描正在运行并且已完成了 42%，
                 进度的计算是根据主机数目乘以 NVT 测试数目，因此它与扫描耗时的对应关系不一定很好。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="新建">
                    <div class="progressbar_bar_new" style="width:100px;"></div>
                    <div class="progressbar_text"><i><b>新建</b></i></div>
                  </div>
                </td><td>
                  任务在它被创建后还没开始。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="已请求">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求</div>
                  </div>
                </td><td>
                  该任务刚刚开始并准备委派扫描给扫描引擎。 
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="已请求删除">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求删除</div>
                  </div>
                </td><td>
                  用户最近已删除了该任务。目前管理服务器正清空该任务的数据库，这需要一些时间，
                  因为任何关联到该任务的报告也都需要删除。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="已请求停止">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求停止</div>
                  </div>
                </td><td>
                  用户最近停止了该任务。目前管理服务器已经提交了这个命令给扫描器，
                  但扫描器还没完全停止该扫描。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="已停止">
                    <div class="progressbar_bar_request" style="width:15px;"></div>
                    <div class="progressbar_text">
                      已停止在 <xsl:value-of select="15"/> %
                    </div>
                  </div>
                </td><td>
                  该任务最近的扫描被用户停止了。当它被停止时扫描完成了 15% ，最近的报告可能是未完成的。
                  同时，该状态也可能在这些情况下被设置的：任务因为其他任何情况被停止，如停电了。
                  该任务将仍处在停止状态，即使扫描或管理服务器重启了，比如系统重启后。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="已请求暂停">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">已请求暂停</div>
                  </div>
                </td><td>
                  用户最近暂停了扫描。管理服务器已经提交该命令给扫描器，但扫描器还没完全暂停该扫描。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="已暂停">
                    <div class="progressbar_bar_request" style="width:82px;"></div>
                    <div class="progressbar_text">
                      已暂停在 <xsl:value-of select="82"/> %
                    </div>
                  </div>
                </td><td>
                  该任务最近的扫描被用户停止。当被暂停时，扫描完成了 82% ，最新的报告可能是未完成的。
                  如果扫描或管理服务器重启了，比如系统重启了，那么该任务会变更到已停止状态。
                  只要任务是暂停状态，扫描服务就会保持在随时待命的活跃状态并且不会释放任何内存。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="内部错误">
                    <div class="progressbar_bar_error" style="width:100px;"></div>
                    <div class="progressbar_text">内部错误</div>
                  </div>
                </td><td>
                  该任务最近的扫描导致了一个错误。最新的报告可能是未完成的或完全丢失了。
                  在后一种情况下，最新可见的报告实际上是早先一次正常扫描的结果。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="已完成">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">已完成</div>
                  </div>
                </td><td>
                  任务的扫描返回成功并生成了一个报告。最新的报告对于任务的目标和扫描配置是完成好的。
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="容器">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">容器</div>
                  </div>
                </td><td>
                  该任务是一个容器任务。
              </td></tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>报告：总计</td>
          <td>运行该任务创建的报告数目。第一个数字显示任务现有已完成扫描的报告数，
              而括号里数字是同时包含未完成扫描的全部报告数。 <br/>
              点击其中一个数字将带您到相应的报告列表页面。</td>
        </tr>
        <tr class="even">
          <td>报告：最后的</td>
          <td>最后完成的报告的创建日期。您可以通过点击日期跳转到该报告。
             </td>
        </tr>
        <tr class="odd">
          <td>严重性</td>
          <td>最新报告的最高严重性。严重性的显示条将根据严重性等级设置不同颜色，严重性等级由当前的
              <a href="/help/my_settings.html?token={/envelope/token}#severity_class">
                  严重性分类</a> 定义：
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (高)'"/>
                    <xsl:with-param name="title" select="'高'"/>
                  </xsl:call-template>
                </td>
                <td>
                   红条显示最大的严重性评分处在“高”危区域。
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (中)'"/>
                    <xsl:with-param name="title" select="'中'"/>
                  </xsl:call-template>
                </td>
                <td>
                   黄条显示最大的严重性评分处在“中”危区域。
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (低)'"/>
                    <xsl:with-param name="title" select="'低'"/>
                  </xsl:call-template>
                </td>
                <td>
                    蓝条显示最大的严重性评分处在“低”危区域。
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (记录)'"/>
                    <xsl:with-param name="title" select="'记录'"/>
                  </xsl:call-template>
                </td>
                <td>
                  空条显示没有检测到漏洞的情况。也许某个 NVT 创建了一条记录信息，所以报告不一定是空的。 
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="even">
          <td>趋势</td>
          <td>描述最新报告和次新报告之间的漏洞变化：
            <br/>
            <table>
              <tr>
                <td valign="top"><img src="/img/trend_up.png"/></td>
                <td>
                  严重性增加：最新报告比之前的次新报告，在至少一个目标主机上至少一个 NVT 测试
                  报告了更高的严重性。
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_more.png"/></td>
                <td>
                  漏洞计数增加：最新报告的最大严重性和之前次新报告的最大严重性一样。
                  但是，最新报告比之前次新报告在该严重性级别上包含了更多的安全问题。
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_nochange.png"/></td>
                <td>
                  漏洞未变化：最新报告结果的最大严重性和严重性级别与之前的次新报告是一致的。
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_less.png"/></td>
                <td>
                  漏洞计数减少：最新报告的最大严重性和之前次新报告的相同。
                  但是，最新报告比之前次新报告在该严重性级别上包含了更少的安全问题。
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_down.png"/></td>
                <td>
                 严重性减少：最新报告的最高严重性评分比之前次新报告的低。
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <a name="autorefresh"></a>
      <h3>自动刷新</h3>
      <p>
       任务视图允许设置一个时间间隔用于自动刷新页面。选择其中的一个间隔（10秒，30秒或60秒）
       并通过点击刷新图标
       <img src="/img/refresh.png" alt="刷新" title="刷新"/>来确认。
      </p>
      <p>
        用于当前页面的当前选项通过对号 (&#8730;) 来标记。
      </p>
      <p>
       请注意如果离开了该页面，自动刷新间隔将会自动设置成手动刷新。
      </p>

      <a name="wizard"></a>
      <h3>任务向导</h3>
      <p>
        任务向导提供了一个简单方法，以创建和开始一个仅指定一个 IP 地址或主机名的任务。
      </p>
      <p>
       当任务列表只有少数几个任务时，任务向导会自动呈现在任务列表的下方。
       用户可以设置“向导行限”（Wizard Rows）设置一个行数限制，当任务行数超过限制时向导就会默认隐藏。
      </p>
      <p>
       向导图标 <img src="/img/wizard.png" alt="显示向导" title="显示向导"/>
       可引向一个专门的页面来提供向导。
      </p>

      <a name="overrides"></a>
      <h3>覆盖</h3>
      <p>
       严重性的列首的图标显示已配置的
       <a href="glossary.html?token={/envelope/token}#override">覆盖</a>
       是已应用
       (<img src="/img/enable.png" alt="覆盖已应用" title="覆盖已应用"/>)
       还是未应用 (<img src="/img/disable.png" alt="无覆盖" title="无覆盖"/>)。
      </p>
      <p>
       默认情况覆盖是应用的。点击该图标将允许切换到未应用覆盖的视图，当然再次点击就可以切换回来。
       在任务列表视图，当切换覆盖时，严重性分类、严重性数量和趋势可能发生变化。
      </p>
      <p>
       请注意如果您离开该页面，覆盖选项将会被自动重置成应用覆盖。
       例外的是任务详情页面和报告、报告列表页面。
      </p>

      <a name="actions"></a>
      <h3>动作</h3>

      <h4>开始任务</h4>
      <p>
       点击开始图标 <img src="/img/start.png" alt="开始" title="开始"/>
       将会开始一次新的扫描。任务列表页面将会被更新。
      </p>
      <p>
       这个动作仅在任务状态为“新建”或“已完成”时才可用，并且该任务不是一个计划任务，也不是一个容器任务。
      </p>

      <h4>计划详情</h4>
      <p>
        点击“计划详情“图标 <img src="/img/scheduled.png"
          alt="计划详情" title="计划详情"/> 将会切换到该任务的计划详情视图。
      </p>
      <p>
       该图标仅对计划任务可用。
      </p>

      <h4>继续任务</h4>
      <p>
       点击继续图标 <img src="/img/resume.png"
         alt="继续" title="继续"/> 将会继续一个先前暂停或停止的任务。
       任务列表页面将会被更新。
      </p>
      <p>
        这个动作仅在任务之前被停止/暂停后才可用，无论是手动停止的或由于它的计划时间段限制而停止的。
      </p>

      <h4>停止任务</h4>
      <p>
       点击停止图标 <img src="/img/stop.png" alt="停止"
       title="停止"/> 将会停止一个运行中的任务。任务列表页面将会被更新。
      </p>
      <p>
       这个动作仅在任务状态是运行中或暂停时才可用。
      </p>

      <h4>移动任务到回收站</h4>
      <p>
       点击回收站图标 <img src="/img/trashcan.png"
       alt="移到回收站" title="移到回收站"/> 将会移动该条目到回收站。
       任务列表页面将会被更新。请注意所有关联到该任务的报告也都会被移到回收站。
      </p>
      <p>
       该图标仅在任务状态是“新建”、“已完成”、“已停止”或“容器”时才可用。
      </p>

      <a name="edit_task"></a>
      <h4>编辑任务</h4>
      <p>
       点击“编辑任务”图标 <img src="/img/edit.png"
         alt="编辑任务" title="编辑任务"/> 
       将会切换到该任务的配置视图，并允许编辑该任务的一些属性。
      </p>
    </div>
  </div>
</xsl:template>

<!--
<xsl:template mode="help" match="trashcan.html">
与前面的第 5720 行重复，把这里多出的一行

      <xsl:call-template name="trashcan-availability"/>

添加到前面的 5727 行了。
-->

<xsl:template mode="help" match="result_details.html">
  <div class="gb_window_part_center">帮助：结果详情
    <a href="/omp?cmd=get_result&amp;result_id=cb291ec0-1b0d-11df-8aa1-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_RESULTS'"/>
      </xsl:call-template>

      <h1>结果详情</h1>
      <p>
        提供关于一个结果的详细信息。这包括漏洞、严重性、主机、位置和关联的任意批注或覆盖。
      </p>

      <h4>报告</h4>
      <p>
        点击列表按钮
        <img src="/img/list.png" alt="报告" title="报告"/>
        将会切换到报告页面。
      </p>

      <h4>导出</h4>
      <p>
        导出结果为 XML，通过点击导出图标
        <img src="/img/download.png" alt="导出" title="导出 XML"/> 来实现。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="view_report.html">
  <div class="gb_window_part_center">帮助：查看报告</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div class="float_right"><a href="/omp?cmd=get_report&amp;report_id=343435d6-91b0-11de-9478-ffd71f4c6f30&amp;token={/envelope/token}">跳转到示例内容对话框</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="viewreport"></a>
      <h1>查看报告</h1>
      <p>
         “查看” 报告页面概括了所选的       
       <a href="/help/glossary.html?token={/envelope/token}#report">报告</a> 包含的所有信息。
       这个页面是结构化的并设计成类似于方便下载的格式，如 HTML 和 PDF。
      </p>
      <p>
        这是一个单一的页面，在该页面左上角点开向下的箭头，可以看到链接到包含各个分类内容的统计报告页面。
        例如， “报告：主机” ，链接到扫描结果报告里的主机列表。
        一个例外是 “任务：详情” ，链接到       
        <a href="/help/glossary.html?token={/envelope/token}#task">任务</a> 的
        <a href="/help/reports.html?token={/envelope/token}">报告列表</a> 页面。
      </p>
      <p>
         查看报告页面也用于显示
       <a href="glossary.html?token={/envelope/token}#prognostic_report">预测报告</a>。
      </p>

      <a name="overrides"></a>
      <h2>报告摘要</h2>
      <p>
        报告摘要窗口显示报告的关键信息，比如产生该报告的任务名称，该任务的开始时间。
      </p>

      <p>
        这个窗口也包含一个完整报告里严重性计数的表格。
        为下载完整报告，可以在 “下载” 列里选择
        <a href="glossary.html?token={/envelope/token}#report_format">报告格式</a>。
        在点击下载图标        
        <img src="/img/download.png" alt="下载" title="下载"/> 后，
        下载过程很快就会开始。
        报告格式可以在        
        <a href="report_formats.html?token={/envelope/token}">报告格式</a>
        页面来配置。
      </p>

      <a name="overrides"></a>
      <h3>覆盖选项</h3>
      <p>
       默认情况下已配置的 <a href="glossary.html?token={/envelope/token}#override">覆盖</a> 都会被应用。
       这个选项允许切换到一个不应用覆盖的视图。 
       在表格视图，扫描结果数目可能会随着该选项切换而变化。
       点击刷新图标
       <img src="/img/refresh.png" alt="刷新" title="刷新"/> 会确认一个更改。
      </p>
      <p>
        当前页面的活跃选项会使用一个勾号
        (&#8730;) 来标记。
      </p>
      <p>
        请注意离开该页面后，覆盖选项会被自动重置成应用覆盖。
      </p>

      <a name="result_filtering"></a>
      <h2>结果过滤</h2>
      <p>
        结果过滤窗口显示扫描结果怎样被过滤以生成报告。
        修改过滤器窗口里任意值，并点击 “应用” 按钮将会更新该报告。
      </p>

      <h3>下载过滤后的报告</h3>
      <p>
        为下载当前显示的报告，可以选择
        <a href="glossary.html?token={/envelope/token}#report_format">报告格式</a> 。
        在点击下载图标      
        <img src="/img/download.png" alt="下载" title="下载"/>
        后，下载过程很快就会开始。
        报告格式可以在
       <a href="report_formats.html?token={/envelope/token}">报告格式</a>
        页面设置。
      </p>

      <a name="result_filtered"></a>
      <h2>过滤后的结果</h2>
      <p>
        过滤后的结果窗口 显示 根据结果过滤窗口内容过滤后的报告结果。         
      </p>

      <h3>批注</h3>
      <p>
       任何应用到一个结果的 <a href="/help/glossary.html?token={/envelope/token}#note">批注</a> 
       会显示在该结果下方。
       一个结果批注的排序是按照谁的创建时间新就谁优先的顺序。
      </p>
      <p>
        每个批注有一组动作按钮
        <img src="/img/delete.png" alt="删除" title="删除"/>
        <img src="/img/details.png" alt="详情" title="详情"/>
        <img src="/img/edit.png" alt="编辑" title="编辑"/>
        ，将同样会影响到
        <a href="notes.html?token={/envelope/token}">批注</a> 页面的批注。
      </p>
      <p>
        为添加一个批注到一个 NVT，点击在该 NVT 结果条目里的新建批注按钮
       <img src="/img/new_note.png" alt="新建批注" title="新建批注"/> 。
       
      </p>
      <p>
        如果一个结果有批注并且批注显示在过滤器里是启用的（请看下面的内容），
        那么批注图标 
        <img src="/img/note.png" alt="批注" title="批注"/>
        会显示在该条结果里。
        点击该图标会跳转到批注页面，如果该结果有一个很长的描述，该批注可能会有用。
      </p>

      <h3>覆盖</h3>
      <p>
        如果是激活的，应用到一个结果的任意
        <a href="/help/glossary.html?token={/envelope/token}#override">覆盖</a>
        都会显示在结果下方。
      </p>
      <p>
        每个覆盖都有一组动作按钮  
        <img src="/img/delete.png" alt="Delete" title="Delete"/>
        <img src="/img/details.png" alt="Details" title="Details"/>
        <img src="/img/edit.png" alt="Edit" title="Edit"/>，
        ，将同样影响到
        <a href="overrides.html?token={/envelope/token}">覆盖</a>
        页面的覆盖。  
      </p>
      <p> 
        为添加一个覆盖到一个 NVT，点击在该 NVT 结果条目里的新建覆盖按钮
       <img src="/img/new_override.png" alt="新建覆盖" title="新建覆盖"/>。       
      </p>
      <p>
        如果一个结果有覆盖，那么覆盖图标
      
        <img src="/img/override.png" alt="Overrides" title="Overrides"/>
        会显示在结果里。点击该图标会跳转到覆盖页面，
        如果该条测试结果不一定准确，那么该覆盖可能会有用。
      </p>

      <h3>结果排序</h3>
      <p>
        页面显示的结果可以按照端口号或者严重性评分排列，升序或者降序。
        排序方式可以通过点击相应列首的名称的来改变
       （例如，点击 “严重性”，会按照严重性评分的升序或降序排列）。
      </p>

      <h3>结果过滤</h3>
      <p>
        每个严重性分类（高、中、低、记录）有一个复选框，可被选中或取消选中，
        以在显示的报告里包含或排除相应严重性等级的结果。
        这个可以结合一个文本短语，把报告限制为只显示所有包含该短语的结果。
        “显示批注” 的复选框用于切换是否显示批注。
      </p>
      <p>
        为显示增量报告，“显示增量结果” 下方的复选框控制哪些增量结果被显示。
      </p>
      <p>       
         在点击 “应用” 按钮后，结果列表会被更新。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cpes.html">
  <div class="gb_window_part_center">帮助：CPE</div>
  <div class="gb_window_part_content">
    <div style="float:left;">
      <a href="/help/contents.html?token={/envelope/token}">帮助目录</a>
    </div>
    <div class="float_right">
      <a href="/omp?cmd=get_info&amp;info_type=cpe&amp;token={/envelope/token}">跳转到对话框</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>CPE</h1>
      <p>
        这个表格提供所有
        <a href="glossary.html?token={/envelope/token}#cpe">CPE</a> 
        的概览，并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>
             该 CPE 的正式名称。如果名称相对于列太长，会被拆成多行来显示，行尾会用换行符标记。
          </td>
        </tr>
        <tr>
          <td>标题</td>
          <td>
              该 CPE 的正式标题，对于非正式的 CPE ，标题显示 "Not Availabe" （不可用）。</td>
        </tr>
        <tr>
          <td>修改于</td>
          <td> 该 CPE 最后正式的修改日期，
               如果是非正式的 CPE，显示 "Not Availabe"（不可用）。
          </td>
        </tr>
        <tr>
          <td>CVEs</td>
          <td>引用该产品的 <a href="glossary.html?token={/envelope/token}#cve">CVE</a> 漏洞数目。  
          </td>
        </tr>
        <tr>
          <td>严重性</td>
          <td>
              引用该产品的 CVE 漏洞中最高的 CVSS 评分。
          </td>
        </tr>
      </table>
      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

      <a name="secinfo_missing"></a>
      <h2>警告：SecInfo Database Missing （安全信息数据库丢失）</h2>
      <p>
        当 OMP 服务器上的 SCAP 数据库 和/或 CERT 数据库丢失的时候，这个警告对话框会出现。
      </p>
      <p>
        当丢失数据库的时候， CPE 表格总是空的。
      </p>
      <p>
        SCAP 数据是在 SCAP 数据订阅同步时更新，
        CERT 数据是在 CERT 数据订阅同步时更新。
        数据很可能会在下次这样的同步更新后出现。
        这通常由一个周期运行的后台进程自动更新。

      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cves.html">
  <div class="gb_window_part_center">帮助：CVE</div>
  <div class="gb_window_part_content">
    <div style="float:left;">
      <a href="/help/contents.html?token={/envelope/token}">帮助目录</a>
    </div>
    <div class="float_right">
      <a href="/omp?cmd=get_info&amp;info_type=cve&amp;token={/envelope/token}">跳转到对话框</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>CVE</h1>

      <p>
        这个表格提供所有
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a> 的概览，
        并概括了每个条目的重点。
      </p>

      <p>
        <b>请注意：</b> 
        一个漏洞的大多数特征（Vector-访问向量、Complexity-访问复杂性、Authentication-认证方式
        Confidentiality Impact-机密性影响、Integrity Impact-完整性影响、Availability Impact-可用性影响
        ）都是从该 CVE 的
        <a href="glossary.html?token={/envelope/token}#cvss">CVSS</a> 基准向量里解析出来的。
        如果没有可用的 CVSS ，那些域就都设置成 "N/A"。
      </p>

      <p>
        为查看 CVSS 域的值的详细描述，请参看 CVSS 指南
        http://www.first.org/cvss/cvss-guide
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr>
          <td>名称</td>
          <td> CVE 标识。</td>
        </tr>
        <tr class="odd">
          <td>Vector</td>
          <td> 访问向量（Access Vector）。
               这个度量反映出漏洞怎样被利用。
               </td>
        </tr>
        <tr>
          <td>Complexity</td>
          <td> 访问复杂性（Access Complexity）。
               这个度量评估
               一旦攻击者已经获得对目标系统的访问之后，利用该漏洞所需的攻击复杂性。
              </td>
        </tr>
        <tr class="odd">
          <td>Authentication</td>
          <td> 
               认证。这个度量评估
               为利用该漏洞，攻击者必须在目标里进行认证的次数。
               </td>
        </tr>
        <tr>
          <td>Confidentiality Impact</td>
          <td>
              机密性影响。这个度量评估
              成功利用该漏洞后对机密性的影响。 
           </td>
        </tr>
        <tr class="odd">
          <td>Integrity Impact</td>
          <td>
              完整性影响。这个度量评估
              成功利用该漏洞后对完整性的影响。 
              </td>
        </tr>
        <tr>
          <td>Availability Impact</td>
          <td>
              可用性影响。这个度量评估
              成功利用该漏洞后对可用性的影响。 
             </td>
        </tr>
        <tr class="odd">
          <td>公布日期</td>
          <td>该 CVE 首次公布的日期。</td>
        </tr>
        <tr>
          <td>严重性</td>
          <td>
              根据漏洞的各个度量计算出的综合分值，范围从 0 到 10。
           </td>
        </tr>
      </table>

      <p>
        <b>提示：</b>除了上面提到的列之外，您也可以使用
            <a href="/help/powerfilter.html?token={/envelope/token}">超强过滤器</a>
            来过滤得到影响特定产品（CPE）的 CVE 漏洞。过滤器的关键字是 "products" 。           
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>


      <a name="secinfo_missing"></a>
      <h2>警告：SecInfo Database Missing （安全信息数据库丢失）</h2>
      <p>
        当 OMP 服务器上的 SCAP 数据库 和/或 CERT 数据库丢失的时候，这个警告对话框会出现。
      </p>
      <p>
        当丢失数据库的时候， CVE 表格总是空的。
      </p>
      <p>
        SCAP 数据是在 SCAP 数据订阅同步时更新，
        CERT 数据是在 CERT 数据订阅同步时更新。
        数据很可能会在下次这样的同步更新后出现。
        这通常由一个周期运行的后台进程自动更新。

      </p>


    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="nvt_details.html">
  <div class="gb_window_part_center">帮助：NVT 详情</div>
  <div class="gb_window_part_content">
    <div style="float:left;"><a href="/help/contents.html?token={/envelope/token}">帮助目录</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>NVT 详情</h1>
      <p>
         这个页面提供关于一个 NVT 测试的详细信息。
         这包括创建和修改日期、摘要、漏洞察看、解决方案，
         以及 CVSS 信息、参考信息列表（CVE、Bugtraq ID、引用相关 CVE 的 CERT 公告、其他参考等）
         和 指向该 NVT 批注和覆盖的链接。
      </p>
      <p>
         点击一个 CVE 名称可以跳转到该 CVE 的详情页面，
         点击一个 CERT 公告名称将会跳转到该 CERT 公告的详情页面。
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="nvts.html">
  <div class="gb_window_part_center">帮助：NVT</div>
  <div class="gb_window_part_content">
    <div style="float:left;">
      <a href="/help/contents.html?token={/envelope/token}">帮助目录</a>
    </div>
    <div class="float_right">
      <a href="/omp?cmd=get_info&amp;info_type=nvt&amp;token={/envelope/token}">跳转到对话框</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>NVT</h1>

      <p>
        这个表格提供所有
        <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> 的概览，
        并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr>
          <td>名称</td>
          <td> NVT 标识。</td>
        </tr>
        <tr class="odd">
          <td>家族</td>
          <td>该 NVT 隶属的家族。</td>
        </tr>
        <tr>
          <td>创建于</td>
          <td>该 NVT 的创建日期。</td>
        </tr>
        <tr class="odd">
          <td>修改于</td>
          <td>该 NVT 的最后修改日期。</td>
        </tr>
        <tr>
          <td>版本</td>
          <td>该 NVT 的版本信息。</td>
        </tr>
        <tr>
          <td>严重性</td>
          <td>
            根据漏洞的各个度量计算出来的综合评分，范围从 0 到 10 。
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

     
      <a name="secinfo_missing"></a>
      <h2>警告：SecInfo Database Missing （安全信息数据库丢失）</h2>
      <p>
        当 OMP 服务器上的 SCAP 数据库 和/或 CERT 数据库丢失的时候，这个警告对话框会出现。
      </p>
      <p>
        当丢失数据库的时候， NVT 表格总是空的。
      </p>
      <p>
        SCAP 数据是在 SCAP 数据订阅同步时更新，
        CERT 数据是在 CERT 数据订阅同步时更新。
        数据很可能会在下次这样的同步更新后出现。
        这通常由一个周期运行的后台进程自动更新。

      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="ovaldefs.html">
  <div class="gb_window_part_center">帮助：OVAL 定义</div>
  <div class="gb_window_part_content">
    <div style="float:left;">
      <a href="/help/contents.html?token={/envelope/token}">帮助目录</a>
    </div>
    <div class="float_right">
      <a href="/omp?cmd=get_info&amp;info_type=ovaldef&amp;token={/envelope/token}">跳转到对话框</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>OVAL 定义</h1>
      <p>
        这个表格提供所有
        <a href="glossary.html?token={/envelope/token}#ovaldef">OVAL 定义</a> 
        的概览，并概括了每个条目的重点。

      </p>
      <p>
        为了解详细的描述，请看 OVAL 语言说明书：        
        http://oval.mitre.org/language/version5.10.1/
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr>
          <td>名称</td>
          <td>
              该定义的 OVAL 标识。这个列也用小号灰色字体显示包含该定义的 XML 文件名。
          </td>
        </tr>
        <tr class="odd">
          <td>版本</td>
          <td>该 OVAL 定义的版本号。</td>
        </tr>
        <tr>
          <td>状态</td>
          <td>          
            该 OVAL 定义的生命周期状态。关于 为 MITRE OVAL 仓库定义的状态类型 的详细信息，请看
            http://oval.mitre.org/repository/about/stages.html 
          <br/>
            如果一个定义没有状态元素，但拥有 "deprecated" 属性设置为 true ，
            其状态就显示为 "DEPRECATED" 。       
          </td>
        </tr>
        <tr class="odd">
          <td>分类</td>
          <td>该定义所属的分类。</td>
        </tr>
        <tr>
          <td>创建于</td>
          <td>该定义的创建日期。</td>
        </tr>
        <tr class="odd">
          <td>修改于</td>
          <td>该定义的最后修改日期。</td>
        </tr>
        <tr>
          <td>CVEs</td>
          <td> 该定义引用的 <a href="glossary.html?token={/envelope/token}#cve">CVE</a> 数量。</td>
        </tr>
        <tr class="odd">
          <td>严重性</td>
          <td>该定义引用的 CVE 中最高的 CVSS 评分。</td>
        </tr>
      </table>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

  
      <a name="secinfo_missing"></a>
      <h2>警告：SecInfo Database Missing （安全信息数据库丢失）</h2>
      <p>
        当 OMP 服务器上的 SCAP 数据库 和/或 CERT 数据库丢失的时候，这个警告对话框会出现。
      </p>
      <p>
        当丢失数据库的时候， OVAL 定义表格总是空的。
      </p>
      <p>
        SCAP 数据是在 SCAP 数据订阅同步时更新，
        CERT 数据是在 CERT 数据订阅同步时更新。
        数据很可能会在下次这样的同步更新后出现。
        这通常由一个周期运行的后台进程自动更新。

      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="dfn_cert_advs.html">
  <div class="gb_window_part_center">帮助：DFN-CERT 公告</div>
  <div class="gb_window_part_content">
    <div style="float:left;">
      <a href="/help/contents.html?token={/envelope/token}">帮助目录</a>
    </div>
    <div class="float_right">
      <a href="/omp?cmd=get_info&amp;info_type=dfn_cert_adv&amp;token={/envelope/token}">跳转到对话框</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>DFN-CERT 公告</h1>
      <p>
        这个表格提供所有
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">DFN-CERT 公告</a> 的概览，
        并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr>
          <td>名称</td>
          <td>公告的 DFN-CERT ID。</td>
        </tr>
        <tr class="odd">
          <td>标题</td>
          <td>公告的标题。</td>
        </tr>
        <tr>
          <td>创建于</td>
          <td>公告的创建日期。</td>
        </tr>
        <tr class="odd">
          <td>严重性</td>
          <td>The highest CVSS  公告引用的 CVE 中最高的 CVSS 评分。</td>
        </tr>
        <tr>
          <td>CVEs</td>
          <td>公告引用的 CVE 漏洞数目。</td>
        </tr>
      </table>

      <a name="about"></a>
      <h3>关于 DFN-CERT</h3>
      <p>
        位于德国汉堡，DFN-CERT 负责为德国数百个大学和研究机构提供支持，
        并且为政府和工业界提供关键的安全服务。
        它与国际上的论坛和组织有长期的合作关系，
        这些欧洲和国家的论坛和组织致力于打击网络犯罪并帮助攻击和安全事件的受害者。
        通过专注于 IT 安全领域的研究来准备前瞻性的防护步骤，使 DFN-CERT 提升了最佳实践。
        这些通过著作和教育课程来达成。
        DFN-CERT 管理的服务业务有 DDoS 检测/转移、安全事件管理、漏洞管理
        以及对政府和工业界的关键大佬提供早期预警。
      <br/>
        更多信息请看 https://www.dfn-cert.de/ 或联系 &lt;info@dfn-cert.de&gt; 。
      </p>
      <p>
        DFN-CERT 公告服务包括公告的分类、分发和排名，这些公告是不同软件产商和发行商发布的，
        并提供公告的德语翻译。
      </p>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

 

      <a name="secinfo_missing"></a>
      <h2>警告：SecInfo Database Missing （安全信息数据库丢失）</h2>
      <p>
        当 OMP 服务器上的 SCAP 数据库 和/或 CERT 数据库丢失的时候，这个警告对话框会出现。
      </p>
      <p>
        当丢失数据库的时候， CERT 公告表格总是空的。
      </p>
      <p>
        SCAP 数据是在 SCAP 数据订阅同步时更新，
        CERT 数据是在 CERT 数据订阅同步时更新。
        数据很可能会在下次这样的同步更新后出现。
        这通常由一个周期运行的后台进程自动更新。

      </p>


    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="allinfo.html">
  <div class="gb_window_part_center">帮助：所有的 SecInfo</div>
  <div class="gb_window_part_content">
    <div style="float:left;">
      <a href="/help/contents.html?token={/envelope/token}">帮助目录</a>
    </div>
    <div class="float_right">
      <a href="/omp?cmd=get_info&amp;info_type=allinfo&amp;token={/envelope/token}">跳转到对话框</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_zh">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>所有的 SecInfo</h1>

      <p>
        这个表格提供所有安全信息相关条目
        (
        <a href="glossary.html?token={/envelope/token}#nvt">NVTs</a>,
        <a href="glossary.html?token={/envelope/token}#cve">CVEs</a>,
        <a href="glossary.html?token={/envelope/token}#cpe">CPEs</a>,
        <a href="glossary.html?token={/envelope/token}#ovaldef">OVAL 定义</a>,
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">DFN-CERT 公告</a>
        ) 
        的概览，并概括了每个条目的重点。
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>列</td>
          <td>描述</td>
        </tr>
        <tr class="odd">
          <td>名称</td>
          <td>安全信息条目的标识。</td>
        </tr>
        <tr class="even">
          <td>类型</td>
          <td>条目的类型。</td>
        </tr>
        <tr class="odd">
          <td>创建于</td>
          <td>该条目的创建日期。</td>
        </tr>
        <tr class="even">
          <td>修改于</td>
          <td>该条目的最后修改日期。</td>
        </tr>
      </table>

      <xsl:call-template name="filtering_zh"/>
      <xsl:call-template name="sorting_zh"/>

  
      <a name="secinfo_missing"></a>
      <h2>警告：SecInfo Database Missing （安全信息数据库丢失）</h2>
      <p>
        当 OMP 服务器上的 SCAP 数据库 和/或 CERT 数据库丢失的时候，这个警告对话框会出现。
      </p>
      <p>
        当丢失数据库的时候， SecInfo 表格总是空的。
      </p>
      <p>
        SCAP 数据是在 SCAP 数据订阅同步时更新，
        CERT 数据是在 CERT 数据订阅同步时更新。
        数据很可能会在下次这样的同步更新后出现。
        这通常由一个周期运行的后台进程自动更新。

      </p>

    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
