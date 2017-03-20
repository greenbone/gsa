<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      xmlns="http://www.w3.org/1999/xhtml"
      extension-element-prefixes="gsa">
      <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Help documents for GSA.
Russian translation

Authors:
Ilmar S. Habibulin <ilmarh@aha.ru>

Copyright:
Copyright (C) 2015-2016 Greenbone Networks GmbH

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

<xsl:include href="help.xsl"/>

<xsl:template name="availability_ru">
  <xsl:param name="command" select="GET_TASKS"/>
  <xsl:choose>
    <xsl:when test="/envelope/capabilities/help_response/schema/command[name=$command]">
    </xsl:when>
    <xsl:otherwise>
      <p>
        <b>Внимание:</b> Данная функция недоступна в рамках текущего соединения с сервером OMP.
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="trashcan-availability_ru">
  <xsl:choose>
    <xsl:when test="gsa:may-get-trash ()">
    </xsl:when>
    <xsl:otherwise>
      <p>
        <b>Внимание:</b> Данная функция недоступна в рамках текущего соединения с сервером OMP.
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="details-window-line-actions_ru">
  <xsl:param name="type"/>
  <xsl:param name="name"/>
  <xsl:param name="ultimate"/>

  <h4>Новый ресурс типа  <xsl:value-of select="$name"/></h4>
  <p>
    Для создания нового ресурса <xsl:value-of select="$name"/> нажмите на иконку
    <img src="/img/new.png" alt="New {$name}" title="Новый {$name}"/>,
    которая откроет страницу <a href="new_{$type}.html?token={/envelope/token}">
    создания нового ресурса <xsl:value-of select="$name"/></a>.
  </p>

  <h4>Копировать ресурс типа <xsl:value-of select="$name"/></h4>
  <p>
    Для копирования ресурса <xsl:value-of select="$name"/> нажмите на иконку копирования
    <img src="/img/clone.png" alt="Clone" title="Копировать"/>,
    которая откроет страницу копирования ресурса по умолчанию.
  </p>

  <h4>Список ресурсов типа <xsl:value-of select="$name"/></h4>
  <p>
    Нажав на иконку списка 
    <img src="/img/list.png" alt="{$name}s" title="{$name}s"/>,
    вы перейдёте на страницу с перечнем ресурсов типа
    <a href="{$type}s.html?token={/envelope/token}">
      <xsl:value-of select="$name"/>
    </a>.
  </p>

  <h4>Удалить ресурс типа <xsl:value-of select="$name"/></h4>
  <p>
    Нажатие на иконку "Перенести в Корзину" 
    <xsl:choose>
      <xsl:when test="$ultimate">
        <img src="/img/delete.png" alt="Delete {$name}" title="Перенести в Корзину"/>
        удалит ресурс.
      </xsl:when>
      <xsl:otherwise>
        <img src="/img/trashcan.png" alt="Delete {$name}" title="Перенести в Корзину"/>
        переместит ресурс в Корзину.
      </xsl:otherwise>
    </xsl:choose>
  </p>
  <h4>Редактировать ресурс типа <xsl:value-of select="$name"/></h4>
  <p>
    Нажав на иконку "Редактировать <xsl:value-of select="$name"/>" 
    <img src="/img/edit.png" alt="Edit {$name}" title="Редактировать {$name}"/>
    вы перейдёте к окну, в котором будут отображены параметры ресурса типа
    <xsl:value-of select="$name"/> с возможностью их изменения.
  </p>

  <h4>Экспортирование</h4>
  <p>
    Чтобы экспортировать ресурс типа <xsl:value-of select="$name"/> в виде XML, нажмите на
    иконку экспорта <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
  </p>
</xsl:template>

<xsl:template name="object-used-by_ru">
  <xsl:param name="name"/>
  <xsl:param name="used_by"/>

  <h3>Ресурсы типа <xsl:value-of select="$used_by"/>, использующие данный ресурс типа <xsl:value-of select="$name"/></h3>
  <p>
    В этой таблице представлены ресурсы типа <xsl:value-of select="$used_by"/>,
    которые связаны с этим ресурсом типа <xsl:value-of select="$name"/>.
    Подробную информацию о ресурсах типа <xsl:value-of select="$used_by"/> можно получить, нажав на
    иконку Подробности <img src="/img/details.png" alt="Details" title="Подробности"/>.
  </p>
</xsl:template>

<xsl:template name="list-window-line-actions_ru">
  <xsl:param name="type"/>
  <xsl:param name="used_by"/>
  <xsl:param name="noclone"/>
  <xsl:param name="noedit"/>
  <xsl:param name="noexport"/>
  <xsl:param name="notrashcan"/>
  <xsl:param name="showenable"/>
  <a name="actions"></a>
  <h3>Действия</h3>

  <xsl:choose>
    <xsl:when test="$showenable">
      <h4>Активировать / Деактивировать ресурс типа  <xsl:value-of select="$type"/></h4>
      <p>
      Нажав на иконку активации
      <img src="/img/enable.png" alt="Enable {$type}" title="Активировать {$type}"/>,
      вы измените статус ресурса <xsl:value-of select="$type"/> на активирован,
      а нажав на иконку
      <img src="/img/disable.png" alt="Disable {$type}" title="Деактивировать {$type}"/>,
      сделаете его неактивным.
      </p>
    </xsl:when>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$notrashcan">
    </xsl:when>
    <xsl:otherwise>
      <h4>Перемещение ресурса типа <xsl:value-of select="$type"/> в Корзину</h4>
      <p>
       Нажав на иконку Корзины
       <img src="/img/trashcan.png" alt="Move to Trashcan" title="Переместить в Корзину"/>,
       вы переместите выбраный ресурс в Корзину, после чего произойдёт обновление списка.
      </p>
      <xsl:choose>
        <xsl:when test="$used_by">
          <p>
           Обратите внимание, что в случае если ресурс типа <xsl:value-of select="$type"/> используется хотя бы одним ресурсом типа
           <xsl:value-of select="$used_by"/>, то перемещение становится невозможным. В этом случае иконка будет серой(неактивной)
           <img src="/img/trashcan_inactive.png" alt="Move to Trashcan" title="Переместить в Корзину"/>.
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
      <h4>Редактирование ресурса типа <xsl:value-of select="$type"/></h4>
      <p>
       Нажав на иконку "Редактирования ресурса типа <xsl:value-of select="$type"/>" 
       <img src="/img/edit.png" alt="Edit {$type}" title="Редактировать {$type}"/>,
       вы переключитесь на страницу с просмотром параметров ресурса типа <xsl:value-of select="$type"/> 
       с возможностью их изменения.
      </p>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noclone">
    </xsl:when>
    <xsl:otherwise>
      <h4>Копирование ресурс типа <xsl:value-of select="$type"/></h4>
      <p>
       Нажав на иконку копирования
       <img src="/img/clone.png" alt="Clone" title="Копировать"/>,
       вы создадите копию ресурса типа <xsl:value-of select="$type"/>.
      </p>
    </xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
    <xsl:when test="$noexport">
    </xsl:when>
    <xsl:otherwise>
      <h4>Экспорт ресурса типа <xsl:value-of select="$type"/></h4>
      <p>
        Экспорт ресурса типа <xsl:value-of select="$type"/> в XML осуществляется нажатием на
        иконку экспорта <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="name-column_ru">
  <xsl:param name="type" select="'task'"/>
  <xsl:param name="type-name" select="gsa:type-name ($type)"/>
  <xsl:param name="comment" select="'комментария'"/>
  <tr class="odd">
    <td>Наименование</td>
    <td>
      Наименование ресурса типа <xsl:value-of select="$type-name"/>.
      <br/>
      <xsl:if test="boolean ($comment)">
        При наличии <xsl:value-of select="$comment"/> по поводу ресурса типа
        <xsl:value-of select="$type-name"/>, он будет показан в скобках после наименования.
      </xsl:if>
      <div>
        В правой части этого столбца может находиться иконка:
        <table style="margin-left: 10px">
          <tr>
            <td valign="top">
              <img src="/img/view_other.png"
                   border="0"
                   alt="Global {$type-name}"
                   title="Глобальный ресурс {$type-name}"/>
            </td>
            <td>
              Значит этот ресурс типа <xsl:value-of select="$type-name"/> либо принадлежит другому пользователю,
              либо является глобальным. Глобальные ресурсы типа
              <xsl:value-of select="$type-name"/> доступны всем.
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>
</xsl:template>

<xsl:template name="filtering_ru">
  <a name="filtering"></a>
  <h3>Использование фильтров</h3>
  <p>
    Блок фильтрации на странице показывает, как будет отображаться выбраный список.
  </p>
  <p>
    Изменение любого значения в поле "Фильтр" и нажатие на иконку
    обновления <img src="/img/refresh.png" alt="Refresh" title="Обновить фильтр"/>
    изменит отображаемый список.  Синтаксис фильтров описан на странице
    <a href="/help/powerfilter.html?token={/envelope/token}">Фильтрация</a>.
  </p>
  <p>
    Ввод имени во втором поле и нажатие на иконку нового фильтра
    <img src="/img/new.png" alt="New" title="Новый фильтр"/>
    создаст именованный фильтр из текущих параметров фильтрации, применённых к списку.
  </p>
  <p>
    Параметры фильтрации также могут быть изменены путём
    выбора именованного фильтра из выпадающего меню справа и нажимания на иконку
    переключения <img src="/img/refresh.png" alt="Refresh" title="Переключить фильтр"/>.
  </p>
  <p>
    Нажав на иконку списка <img src="/img/list.png" border="0" alt="Фильтры"/>
    вы перейдёте на страницу <a href="filters.html?token={/envelope/token}">Фильтры</a>
    с полным списком именованных фильтров.
  </p>
</xsl:template>

<xsl:template name="sorting_ru">
  <a name="sorting"></a>
  <h3>Сортировка</h3>
  <p>
    Сортировка в таблице может быть изменена нажатием на заголовок столбца.
    Текущий столбец, по которому осуществляется сортировка, прописан в строке фильтрации,
    например, "sort=name" или "sort-reverse=name".
  </p>
</xsl:template>

<xsl:template name="hosts_note_ru">
  <p>
    Заметка по <b>Узлам</b>:
    <ul>
      <li>
        Параметр Узлы представляет из себя список значений, разделённых запятыми. 
        Каждое значение может представлять:
        <ul>
          <li>адрес IPv4 (например, <tt>192.168.13.1</tt>)</li>
          <li>имя узла (например, <tt>myhost1.domain</tt>)</li>
          <li>диапазон адресов IPv4 в длинной форме записи
              (например, <tt>192.168.1.116-192.168.1.124</tt>)</li>
          <li>диапазон адресов IPv4 в короткой форме записи
              (например, <tt>192.168.1.116-124</tt>)</li>
          <li>диапазон адресов IPv4 в нотации CIDR
              (например, <tt>192.168.13.0/24</tt>)</li>
          <li>адрес IPv6
              (например, <tt>fe80::222:64ff:fe76:4cea</tt>).</li>
          <li>диапазон адресов IPv6 в длинной форме записи
              (например, <tt>::12:fe5:fb50-::12:fe6:100</tt>)</li>
          <li>диапазон адресов IPv6 в короткой форме записи
              (например, <tt>::12:fe5:fb50-fb80</tt>)</li>
          <li>диапазон адресов IPv6 в нотации CIDR
              (например, <tt>fe80::222:64ff:fe76:4cea/120</tt>)</li>
        </ul>
        Любые эти значения могут присутствовать в списке (например,
        <tt>192.168.13.1, myhost2.domain, fe80::222:64ff:fe76:4cea,
            192.168.13.0/24</tt>).
      </li>
      <li>
        Маска сети в нотации CIDR ограничена 20 для IPv4
        и 116 для IPv6 (4095 узлов).
      </li>
    </ul>
  </p>
</xsl:template>

<xsl:template match="help">
  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <xsl:apply-templates mode="help"/>
  </div>
</xsl:template>

<xsl:template mode="help" match="*">
  <div class="gb_window_part_center">Помощь: Страница не найдена</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <h1>Страница не найдена</h1>

      <p>
        Запрашиваемая вами страница не найдена. Если вы проследовали по ссылке
        и попали на эту страницу, значит адрес оригинальной страницы изменился.
        В этом случае, пожалуйста, воспользуйтесь <a href="contents.html?token={/envelope/token}">
        Оглавлением</a> для поиска интересующей вас страницы.
      </p>

      <p>
        Извините за доставленное неудобство.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="about.html">
  <div class="gb_window_part_center">О GSA</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">
      <table><tr><td valign="top">

      <h1>Greenbone Security Assistant</h1>
      <h3>Version 6.0.3</h3>

      <p>
      Greenbone Security Assistant (GSA) это веб интерфейс к Open Vulnerability Assessment System (OpenVAS).
      GSA соединяется с OpenVAS посредством протокола управления OpenVAS (OMP).
      Полностью реализуя все возможности OMP, GSA предлагает хоть и прямолинейный,
      но достаточно мощный инструмент для управления сетевыми сканированиями на уязвимости.
      </p>

      <p>
      Copyright 2009-2017 by <a href="http://www.greenbone.net" target="_blank">Greenbone Networks GmbH</a>
      </p>

      <p>
      License: GNU General Public License version 2 or any later version
      (<a href="gplv2.html?token={/envelope/token}">full license text</a>)
      </p>

      <p>
      Контакты: По поводу обновлений, расширения функциональности и сообщений об ошибках
      свяжитесь с <a href="http://www.greenbone.net/company/contact.html" target="_blank">
      Greenbone team</a> или посетите страничку <a href="http://www.openvas.org" target="_blank">OpenVAS</a>.
      </p>

      </td><td valign="top">
      <img border="5" src="/img/gsa_splash.svg" style="height:400px;"/>
      </td>
      </tr></table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="hosts.html">
  <div class="gb_window_part_center">Помощь: Узлы</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_report&amp;type=assets&amp;overrides=1&amp;levels=hm&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Узлы</h1>
      <p>
       На этой странице представлен перечень всех узлов, которые используются во всех существующих заданиях.
      </p>

      <a name="filtering"></a>
      <h2>Фильтрование Узлов</h2>
      <p>
        В разделе Фильтрование Узлов указано, каким образом отфильтровываются узлы для показа в списке.
        Изменение параметров фильтрования и нажатие на кнопку "Применить", 
        приведёт к обновлению списка.
      </p>

      <a name="overrides"></a>
      <h3>Переопределения</h3>
      <p>
       По умолчанию применяются сконфигурированные <a href="glossary.html?token={/envelope/token}#override">переопределения</a>.
       Пункт в выпадающем меню позволяет переключиться на отображение списка без применения переопределений.
       В таблице Отфильтрованных Узлов могут поменяться количества узлов и важности результатов *? при выборе этого пункта.
       Нажав на иконку
       <img src="/img/refresh.png" alt="Refresh" title="Применить"/>, вы подтвердите внесение изменений.
      </p>
      <p>
       Текущей пункт выпадающего меню отмечен знаком &#8730;.
      </p>

      <a name="filtered"></a>
      <h2>Отфильтрованные Узлы</h2>
      <p>
        В разделе Отфильтрованные Узлы отображаются все узлы, отфильтрованные 
        в соответствии с параметрами, заданными в разделе Фильтрование Узлов.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>IP</td>
          <td>
            IP адрес узла.
          </td>
        </tr>
        <tr>
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'High'"/>
            </xsl:call-template>
          </td>
          <td>
            Количество результатов высокой важности в самом последнем отчёте.
          </td>
        </tr>
        <tr class="odd">
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'Medium'"/>
            </xsl:call-template>
          </td>
          <td>
            Количество результатов средней важности в самом последнем отчёте.
          </td>
        </tr>
        <tr>
          <td valign="top">
            <xsl:call-template name="severity-label">
              <xsl:with-param name="level" select="'Low'"/>
            </xsl:call-template>
          </td>
          <td>
            Количество результатов низкой важности в самом последнем отчёте.
          </td>
        </tr>
        <tr class="odd">
          <td>Последний Отчёт</td>
          <td>
            Ссылка на последний отчёт.
          </td>
        </tr>
        <tr>
          <td>ОС</td>
          <td>
            Иконка, означающая определённую в последнем отчёте операционную систему.
          </td>
        </tr>
        <tr class="odd">
          <td>Порты</td>
          <td>
            Количество открытых портов, определённых в последнем отчёте.
          </td>
        </tr>
        <tr>
          <td>Прил.</td>
          <td>
            Количество приложений, определённых в последнем отчёте согласно
            CPE.
          </td>
        </tr>
        <tr class="odd">
          <td>Отчёты</td>
          <td>
            Количество завершённых отчётов, включающих данный узел.
          </td>
        </tr>
        <tr>
          <td>Дистанция</td>
          <td>
            Дистанция до узла от сервера, на котором исполнялся Сканер в соответствии с последним отчётом.
          </td>
        </tr>
        <tr>
          <td valign="top">Прогноз</td>
          <td>
            Максимальная важность уязвимостей узла*?, предсказываемая на основе известной об узле информации.
            Важность уязвимостей определяется путём сравнения выявленных приложений на узле со
            списком уязвимых приложений. Обратите внимание, что узел может быть уязвим только при
            специфических настройках или комбинациях приложений.
          </td>
        </tr>
      </table>

      <a name="actions"></a>
      <h3>Действия</h3>

      <h4>Отчёт о Прогнозах</h4>
      <p>
       Нажимая на иконку 
       <a href="glossary.html?token={/envelope/token}#prognostic_report">отчёта о прогнозах</a> 
       <img src="/img/prognosis.png" alt="Prognostic Report" title="Отчёт о Прогнозах"/>, 
       вы перейдёте на страницу с отчётом о прогнозах по выбранному узлу.
      </p>

      <!--
	Этот раздел закомментирован, поэтому не переведён до конца!
      <a name="overrides"></a>
      <h3>Переопределения</h3>
      <p>
       По умолчанию применяются настроенные <a href="glossary.html?token={/envelope/token}#override">переопределения</a>.
       The selection allows to switch to a view without applying overrides.
       In the table view, severity classes, severity numbers and trend might change
       when switching this selection.
       By pressing the refresh
       <img src="/img/refresh.png" alt="Refresh" title="Refresh"/> icon a change is confirmed.
      </p>
      <p>
       The selection that is active for the present page is marked with a hook (&#8730;).
      </p>
      <p>
       Note that leaving this page will reset the overrides selection to apply overrides.
      </p>

      <a name="actions"></a>
      <h3>Действия</h3>

      <h4>Details</h4>
      <p>
       Pressing the details icon <img src="/img/details.png" alt="Details" title="Details"/> will
       switch to an overview on all reports for this task.
       It is the same action as clicking on the number of reports in the column "Reports: Total".
      </p>
      -->

      <a name="host_details"></a>
      <h2>Подробности Узла</h2>
      <p>
       Представляет подробную информацию об узле.
       Сюда попадает вся информация из таблицы Отфильтрованных Узлов, плюс перечни открытых портов и приложений.
      </p>

      <a name="scap_missing"></a>
      <h2>Предупреждение: Отсутствует база данных SCAP</h2>
      <p>
        Такое сообщение появляется в случае отсутствия базы данных SCAP на сервере OMP.
      </p>
      <p>
        Для подготовки отчётов о прогнозах требуются данные SCAP.  В случае отсутствия базы данных SCAP 
        все иконки отчётов о прогнозах 
        <img src="/img/prognosis.png" alt="Prognostic Report" title="Отчёт о Прогнозах"/>
        будут неактивными (серыми)
        <img src="/img/prognosis_inactive.png" alt="Prognostic Report" title="Отчёт о Прогнозах"/>.
      </p>
      <p>
        Данные SCAP обновляютя в процессе синхронизации Подписки SCAP.
        Скорее всего данные появятся после следующей такой синхронизации.
        Обычно эта синхронизация осуществляется автоматически периодическим фоновым процессом.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="agent_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Агента
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_AGENTS'"/>
      </xsl:call-template>

      <h1>Подробности Агента</h1>
      <p>
        Представляет подробную информацию об 
        <a href="glossary.html?token={/envelope/token}#agent">Агенте</a>.
        А конкретнее: Наименование, время создания, время изменения,
        комментарий, степень доверенности установщика и дату загрузки(*?).
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'агент'"/>
        <xsl:with-param name="name" select="'Агент'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="agents.html">
  <div class="gb_window_part_center">Помощь: Агенты
    <a href="/omp?cmd=get_agents&amp;token={/envelope/token}"
       title="Агенты" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Агенты"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_AGENTS'"/>
      </xsl:call-template>

      <h1>Агенты</h1>
      <p>
       В данной таблице приведён перечень всех настроенных в системе 
        <a href="glossary.html?token={/envelope/token}#agent">Агентов</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'agent'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Доверие</td>
          <td>
            <b>да</b>: подпись пакета установки была загружена или подтвержение того, что агент не был скомпрометирован в процессе загрузки содержится в Подписках.
            <br/>
            <b>нет</b>: подпись и пакет установки агента не совпадают или подпись не является доверенной.
            <br/>
            <b>неизвестно</b>: в случае, если отсутствует возможность проверить подпись.
          </td>
        </tr>
      </table>

      <h3>Новый Агент</h3>
      <p>
        Для создания нового агента нажмите на иконку
        <img src="/img/new.png" alt="New Agent" title="Новый Агент"/>, которая 
        переведёт вас на страницу создания <a href="new_agent.html?token={/envelope/token}">Нового Агента</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка текущих агентов в XML, нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>
      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Агент'"/>
      </xsl:call-template>

      <h4>Скачивание Установщика</h4>
      <p>
       Нажав на иконку "Скачать пакет установки" icon
       <img src="/img/agent.png" alt="Download Installer Package"
            title="Скачать пакет установки"/>, вы запустите процесс
       скачивания установщика Агента.
      </p>

      <h4>Проверка Агента</h4>
      <p>
       Нажав на иконку "Проверить Агента" 
       <img src="/img/verify.png" alt="Verify Agent" title="Проверить Агента"/>,
       вы запустите процедуру проверки доверия пакету установки Агента.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_agent.html">
  <div class="gb_window_part_center">Помощь: Новый Агент
    <a href="/omp?cmd=new_agent&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
          <xsl:with-param name="command" select="'CREATE_AGENT'"/>
      </xsl:call-template>

      <h1>Новый Агент</h1>
      <p>
        Для создания нового
        <a href="glossary.html?token={/envelope/token}#agent">Агента</a>
        необходимо заполнить ниже перечисленные поля и
        нажать кнопку "Создать Агента" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Агента.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>WinSLAD Base 1.0</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Базовый агент для Windows SLAD.</td>
        </tr>
        <tr class="odd">
          <td>Установщие</td>
          <td>да</td>
          <td>--</td>
          <td>Файл</td>
          <td>/tmp/WinSLAD-Base-1.0.exe</td>
        </tr>
        <tr class="even">
          <td>Подпись Установщика</td>
          <td>нет</td>
          <td>--</td>
          <td>Файл (подпись GnuPG в текстовом виде)</td>
          <td>/tmp/WinSLAD-Base-1.0.asc</td>
        </tr>
      </table>
      <p>
        При предоставлении файла с подписью, Установщик будет проверен на соответствие этой подписи при загрузке.
      </p>
      <p>
        При отсутствии подписи, будет произведён поиск подходящей в Подписке NVT. При обнаружении подходящей подписи, файл будет проверяться на соответствие ей.
      </p>

      <h4>Агенты</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Agents" title="Агенты"/>,
       вы перейдёте на страницу <a href="agents.html?token={/envelope/token}">Агенты</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="lsc_credentials.html">
  <div class="gb_window_part_center">Помощь: Атрибуты доступа
    <a href="/omp?cmd=get_lsc_credentials&amp;token={/envelope/token}"
       title="Атрибуты доступа" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Атрибуты доступа"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_LSC_CREDENTIALS'"/>
      </xsl:call-template>

      <h1>Атрибуты доступа</h1>
      <p>
        В таблице ниже приведён обзор всех настраеваемых
        <a href="glossary.html?token={/envelope/token}#lsc_credential">Атрибутов доступа</a>
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Строка</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'атрибуты доступа'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Имя</td>
          <td>Показывает имя пользователя, связанное с этими атрибутами доступа.</td>
        </tr>
      </table>

      <h3>Новые Атрибуты доступа</h3>
      <p>
        Чтобы создать новые атрибуты доступа для локальных проверок безопасности, нажмите на иконку
        <img src="/img/new.png" alt="New Credential" title="Новые Атрибуты доступа"/>, которая
        переведёт вас на страницу 
        <a href="new_lsc_credential.html?token={/envelope/token}">Новые Атрибуты доступа</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка Атрибутов доступа в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>
      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Атрибуты доступа'"/>
      </xsl:call-template>

      <h4>Скачать RPM-пакет</h4>
      <p>
       Нажав на иконку 
       <img src="/img/rpm.png" alt="Download RPM Package" title="Скачать RPM-пакет"/>,
       вы скачаете установочный пакет в формате ".rpm".
      </p>
      <p>
       При установке этого пакета в системе, основанной на пакетном менеджере RPM (SUSE, RedHat, Fedora, CentOS),
       в ней создаётся непривилегированная учётная запись, посредством которой сканирующий движок
       получает доступ к системе для просмотра перечня установленного ПО и получения другой информации о продуктах(?).
       Удаление пакета из системы блокирует(?) эту учётную запись.
      </p>

      <h4>Скачать Debian-пакет</h4>
      <p>
       Нажав на иконку 
       <img src="/img/deb.png" alt="Download Debian Package" title="Скачать Debian-пакет"/>,
       вы скачаете установочный пакет в формате ".deb".
      </p>
      <p>
       При установке этого пакета в системе, основанной на пакетном менеджере dpkg (Debian, Ubuntu),
       в ней создаётся непривилегированная учётная запись, посредством которой сканирующий движок
       получает доступ к системе для просмотра перечня установленного ПО и получения другой информации о продуктах(?).
       Удаление пакета из системы блокирует(?) эту учётную запись.
      </p>

      <h4>Скачать Exe-пакет</h4>
      <p>
       Нажав на иконку 
       <img src="/img/exe.png" alt="Download Exe Package" title="Скачать Exe-пакет"/>,
       вы скачаете установочный пакет в формате ".exe".
      </p>
      <p>
       При установке этого пакета в системе Windows (XP, 2003),
       в ней создаётся непривилегированная учётная запись, посредством которой сканирующий движок
       получает доступ к системе для просмотра перечня установленного ПО и получения другой информации о продуктах(?).
       Удаление пакета из системы блокирует(?) эту учётную запись.
      </p>

      <h4>Скачать Открытый Ключ</h4>
      <p>
       Нажав на иконку открытого ключа
       <img src="/img/key.png" alt="Download Public Key" title="Скачать Открытый Ключ"/>,
       вы скачаете открытый ключ SSH в формате ASCII.
      </p>
      <p>
       Этот ключ связан с RPM и Debian пакетами (не для Exe-пакетов).
       Файл с ключом предназначен для помощи квалифицированным пользователям в подготовке целевых систем
       для локальных проверок безопасности самостоятельно (например, без предоставляемых RPM/Debian пакетов).
      </p>

      <p>
       Обратите внимание, что в зависимости от выбранного метода указания пароля
       (вручную или генератором), некоторые действия могут быть недоступны.
       В частности, при указании пароля вручную, доступны только Удаление,
       Редактирование, Копирование и Экспорт.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_lsc_credential.html">
  <div class="gb_window_part_center">Помощь: Новые Атрибуты доступа
    <a href="/omp?cmd=new_lsc_credential&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
          <xsl:with-param name="command" select="'CREATE_LSC_CREDENTIAL'"/>
      </xsl:call-template>

      <p>
        Атрибуты доступа для локальных проверок безопасности необходимы 
        <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> для регистрации в целевой системе
        с целью проведения локальных тестов, например, наличия установленных исправлений безопасности всех вендоров.
      </p>
      <h1>Новые Атрибуты доступа</h1>
      <p>
        Для создания <a href="glossary.html?token={/envelope/token}#lsc_credential">Атрибутов доступа</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку 
        "Создать Атрибуты доступа" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Атрибутов доступа.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Учётная запись для сканирований</td>
        </tr>
        <tr class="even">
          <td>Имя</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры<br/>при вводе вручную также "\@_.-"</td>
          <td>jsmith<br/>
              myDomain\jsmith<br/>
              jsmith@myDomain</td>
        </tr>
        <tr class="odd">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Для систем Windows</td>
        </tr>
        <tr class="even">
          <td>[выбранная опция для паролей]</td>
          <td>да</td>
          <td>"Автоматическая генерация атрибутов доступа" или заданный пароль (40)</td>
          <td>Текст в свободной форме</td>
          <td>"Автоматическая генерация атрибутов доступа", hx7ZgI2n</td>
        </tr>
      </table>

      <p>
        Диалог для создания Атрибутов доступа позволяет либо задать пароль, либо сгенерировать
        безопасный пароль.
        Обратите внимание, что если выбрана последняя опция, пользователи не смогут получить доступ и
        использовать ни пароли, ни так называемые закрытые ключи.
        Вместо этого создаются пакеты установки, которые могут быть установлены на целевых системах.
        Содержание этих пакетов подробнее рассмотренов в подразделе
        <a href="#actions">Действия</a> данного раздела(?).
        Эти действия недоступны, если пароль задаётся вручную.
      </p>
      <p>
        <b>Также обратите внимание</b>, что вам необходимо связать одну или несколько 
        <a href="glossary.html?token={/envelope/token}#target">целей</a> с теми атрибутами доступа, которые вы на них установили.
        Только это позволит движку сканирования использовать подходящие атрибуты.
      </p>

      <p>
        На заметку: Согласно документации Микрософт по Контроллерам домена, 
        если ваше Имя использует немецкие умляуты, вы можете использовать "ss" вместо "ß", "a" вместо "ä" и т.д.
        В противном случае, Имена с немецкими умляутами не будут работать(?). 
      </p>

      <h4>Атрибуты доступа</h4>
      <p>
       Нажав на иконку списка 
       <img src="/img/list.png" alt="Атрибуты доступа" title="Атрибуты доступа"/>,
       вы перейдёте на страницу <a href="lsc_credentials.html?token={/envelope/token}">Атрибуты доступа</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="lsc_credential_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Атрибутов доступа
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_LSC_CREDENTIALS'"/>
      </xsl:call-template>

      <h1>Подробности Атрибутов доступа</h1>
      <p>
        Предоставляют подробную информацию об
        <a href="glossary.html?token={/envelope/token}#lsc_credential">Атрибутах доступа</a>.
        А именно наименование, комментарий, имя, идентификатор, время создания и изменения.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'lsc_credential'"/>
        <xsl:with-param name="name" select="'Атрибуты доступа'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Атрибуты доступа'"/>
        <xsl:with-param name="used_by" select="'Цель'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_alert.html">
  <div class="gb_window_part_center">Помощь: Новое Уведомление
    <a href="/omp?cmd=new_alert&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_ALERT'"/>
      </xsl:call-template>

      <a name="newalert"></a>
      <h1>Новое Уведомление</h1>

      <p>
       Уведомления могут быть добавлены к <a href="glossary.html?token={/envelope/token}#task">задачам</a>.
       Уведомления встроены в систему. Всякий раз, когда происходит запрограммированное событие,
       (например, завершилась задача), проверяется выбранный набор условий (например,
       найдена уязвимость высокой важности).
       Если условия совпадают, выполняется заданное действие (например, отправляется письмо по
       электронной почте на заданный адрес).
      </p>

      <h1>Новое Уведомление</h1>
      <p>
        Для создания нового <a href="glossary.html?token={/envelope/token}#alert">Уведомления</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Уведомление" для сохранения изменений.
        В результате перейдёте на страницу Подробностей Уведомления.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>EmailFinished</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Событие</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td>Завершена</td>
        </tr>
        <tr class="even">
          <td>Условие</td>
          <td>да</td>
          <td>--</td>
          <td>Выбор</td>
          <td>Всегда</td>
        </tr>
        <tr class="odd">
          <td>Метод</td>
          <td>да</td>
          <td>--</td>
          <td>Выбор</td>
          <td>Электронная почта</td>
        </tr>
        <tr class="even">
          <td>
            Фильтр Отчётов по Результатам
            <xsl:if test="not (gsa:may-op ('get_filters'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>--</td>
          <td>Выбор</td>
          <td></td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_filters'))">
        <b>*</b> not available with the current OMP Server connection.
      </xsl:if>

      <h2>Методы Уведомлений</h2>

      <h3>HTTP Get</h3>

      <p>
      Указанный URL будет запрошен посредством HTTP GET.
      Этот метод может быть использован, например, для посылки СМС
      через шлюз, отрабатывающий HTTP GET запросы, или для 
      автоматического создания задания в системе регистрации ошибок.
      </p>

      <p>
      При записи URL могут исползоваться следующие подстановки:
      </p>

      <ul>
      <li> $$: $ </li>
      <li> $n: Наименование задачи </li>
      <li> $e: описание события </li>
      <li> $c: описания условия срабатывания </li>
      </ul>

      <h4>Уведомления</h4>
      <p>
       Нажав на иконку списка
       <img src="/img/list.png" alt="Alerts" title="Уведомления"/>,
       вы перейдёте на страницу со списком <a href="alerts.html?token={/envelope/token}">Уведомлений</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="alerts.html">
  <div class="gb_window_part_center">Помощь: Уведомления
    <a href="/omp?cmd=get_alerts&amp;token={/envelope/token}"
       title="Alerts" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Уведомления"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_ALERTS'"/>
      </xsl:call-template>

      <a name="alerts"></a>
      <h1>Уведомления</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
       <a href="glossary.html?token={/envelope/token}#alert">Уведомлений</a>.
       Показаны параметры уведомлений (наименование, событие, условие, метод и фильтр).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'Уведомление'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Событие</td>
          <td>Показывает событие, для которого проверяется условие.</td>
        </tr>
        <tr class="odd">
          <td>Условие</td>
          <td>Условие, которое проверяется при наступлении события.</td>
        </tr>
        <tr class="even">
          <td>Метод</td>
          <td>Способ уведомления.</td>
        </tr>
        <tr class="even">
          <td>Фильтр</td>
          <td>Фильтр Отчётов.</td>
        </tr>
      </table>

      <h3>Новое Уведомление</h3>
      <p>
        Для создания нового уведомления нажмите на
        иконку <img src="/img/new.png" alt="New Alert" title="Новое Уведомление"/>, которая
        переведёт вас на страницу создания <a href="new_alert.html?token={/envelope/token}">Нового Уведомления</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка уведомлений в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Уведомление'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>

      <h4>Проверка Уведомления</h4>
      <p>
       Нажав на иконку запуска
       <img src="/img/start.png" alt="Test Alert" title="Проверка"/>,
       вы запустите процесс доставки уведомления с набором тестовых данных.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="alert_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Уведомления
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_ALERTS'"/>
      </xsl:call-template>

      <h1>Подробности Уведомления</h1>
      <p>
        Предоставляет подробную информацию об 
        <a href="glossary.html?token={/envelope/token}#alert">Уведомлении</a>.
        А конкретнее Наименование, комментарий, даты создания и модификации, событие, условие срабатывания, метод доставки и фильтр.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'alert'"/>
        <xsl:with-param name="name" select="'Уведомление'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Уведомление'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="port_lists.html">
  <div class="gb_window_part_center">Помощь: Списки Портов
    <a href="/omp?cmd=get_port_lists&amp;token={/envelope/token}"
       title="Списки Портов" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Списки Портов"/>
    </a>
  </div>

  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_PORT_LISTS'"/>
      </xsl:call-template>

      <h1>Списки Портов</h1>
      <p>
       В данной таблице приведён перечень всех настроенных в системе 
        <a href="glossary.html?token={/envelope/token}#port_list">Списков Портов</a>, 
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'Список Портов'"/>
        </xsl:call-template>
        <tr class="even">
         <td>Всего</td>
         <td>Общее количество портов в списке портов.
         </td>
        </tr>
        <tr class="even">
         <td>TCP</td>
         <td>Общее количество TCP портов в списке портов.
         </td>
        </tr>
        <tr class="even">
         <td>UDP</td>
         <td>Общее количество UDP портов в списке портов.
         </td>
        </tr>
      </table>

      <a name="predefined_port_lists"></a>
      <h2>Поставляемые с системой Списки Портов</h2>
      <p>
        Поставляемые с системой Списки Портов содержат:
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Наименование</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>All IANA assigned TCP 2012-02-10</td>
          <td>
            Все TCP порты, назначенные IANA, на 10 February 2012.
          </td>
        </tr>
        <tr class="odd">
          <td>All IANA assigned TCP and UDP 2012-02-10</td>
          <td>
            Все TCP и UDP порты, назначенные IANA, на 10 February 2012.
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP</td>
          <td>
            Все TCP порты.
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP and Nmap 5.51 top 100 UDP</td>
          <td>
            Все TCP порты и 100 основных UDP портов по версии Nmap 5.51.
          </td>
        </tr>
        <tr class="odd">
          <td>All TCP and Nmap 5.51 top 1000 UDP</td>
          <td>
            Все TCP порты и 1000 основных UDP портов по версии Nmap 5.51.
          </td>
        </tr>
        <tr class="odd">
          <td>All privileged TCP</td>
          <td>
            Все привилегированные TCP порты.
          </td>
        </tr>
        <tr class="odd">
          <td>All privileged TCP and UDP</td>
          <td>
            Все привилегированные TCP и UDP порты.
          </td>
        </tr>
        <tr class="odd">
          <td>Nmap 5.51 top 2000 TCP and top 100 UDP</td>
          <td>
            2000 основных TCP и 100 основных UDP портов по версии Nmap 5.51.
          </td>
        </tr>
        <tr class="odd">
          <td>OpenVAS Default</td>
          <td>
            TCP порты, сканируемые по умолчанию сканером OpenVAS-4.
          </td>
        </tr>
      </table>

      <h3>Новый Список Портов</h3>
      <p>
        Для создания нового списка портов нажмите на
        иконку <img src="/img/new.png" alt="New Port List" title="Новый Список Портов"/>, которая
        переведёт вас на страницу создания <a href="new_port_list.html?token={/envelope/token}">Нового Списка Портов</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списков Портов в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Список Портов'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_port_list.html">
  <div class="gb_window_part_center">Помощь: Новый Список Портов
    <a href="/omp?cmd=new_port_list&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
          <xsl:with-param name="command" select="'CREATE_PORT_LIST'"/>
      </xsl:call-template>

      <h1>Новый Список Портов</h1>
      <p>
        Для создания нового <a href="glossary.html?token={/envelope/token}#port_list">Списка Портов</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Агента" для сохранения изменений.
        Для импорта нового Списка Портов укажите файл и нажмите кнопку "Импортировать Список Портов".
        В результате Списки Портов будут обновлены.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>All privileged UDP</td>
        </tr>
        <tr class="odd">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Все привилегированные UDP порты</td>
        </tr>
        <tr class="odd">
          <td>Диапазон портов</td>
          <td>да</td>
          <td>400</td>
          <td>Разделённый запятыми перечень диапазонов портов, вводится вручную или из файла</td>
          <td>U:1-1023</td>
        </tr>
      </table>

      Заметка о <b>ДиапаЧасовой поясзонах Портов</b>:
      <ul>
        <li>
          Диапазон портов представляет из себя список значений, разделённых запятыми.
          Список может быть введён вручную, либо загружен из файла. В случае с файлом,
          разделителем значений служит не только запятая, но и символ новой строки.
          Каждое значение в списке может быть:
          <ul>
            <li>номером порта (например, <tt>7</tt>)</li>
            <li>диапазоном (например, <tt>9-11</tt>)</li>
          </ul>
          Эти варианты могут встречаться в любой последовательности (например, <tt>1-3,7,9-11</tt>).
        </li>
        <li>
          Значение в списке может предваряться идентификатором протокола "T:" или "U:".
          Идентификатор указывает протокол для всех последующих значений.
          Например, <tt>T:1-3,U:7,9-11</tt> определяет TCP порты 1, 2 и 3, а также 
          UDP порты 7, 9, 10 и 11.
        </li>
        <li>
          Применение нескольких идентификаторов протокола переключают привязку порта. Например,
          <tt>T:1-3,U:7,T:9-11</tt> определяет TCP порты 1, 2, 3, 9, 10 и 11,
          а также UDP порт 7.
        </li>
        <li>
          По умолчанию порты привязываются к протоколу TCP.  Таким образом <tt>1-3,U:7</tt>
          означает TCP порты 1, 2, и 3, а также UDP порт 7.
        </li>
      </ul>

      <a name="import_port_list"></a>
      <h1>Импорт Списка Портов</h1>
      <p>
        Для импорта списка портов, выберете нужный файл (кнопка "Обзор") и нажмите
        кнопку "Импортировать Список Портов" для его загрузки.
        Список портов будет обновлён.
        Обратите внимание, что в случае наличия такого списка портов в системе или же 
        списка портов с таким же именем, импорт завершится с ошибкой.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Импортирируемый Список Портов</td>
          <td>да</td>
          <td>--</td>
          <td>File</td>
          <td>/tmp/port_list.xml</td>
        </tr>
      </table>

      <h4>Списки Портов</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Port Lists" title="Списки Портов"/>
       вы перейдёте на страницу <a href="port_lists.html?token={/envelope/token}">Списки Портов</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="port_list_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Списка Портов
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_PORT_LISTS'"/>
      </xsl:call-template>

      <h1>Подробности Списка Портов</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#port_list">
        Списке Портов</a>.
        А конкретнее: Наименование, время создания, время изменения,
        общее количество портов, количество портов tcp и udp, диапазоны портов и
        цели, связанные с этим списком портов.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'port_list'"/>
        <xsl:with-param name="name" select="'Список Портов'"/>
      </xsl:call-template>

      <h3>Диапазоны Портов</h3>
      <p>
        В этой таблице перечислены все диапазоны портов, содержащиеся в списке портов.
      </p>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Список Портов'"/>
        <xsl:with-param name="used_by" select="'Цель'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="report_formats.html">
  <div class="gb_window_part_center">Помощь: Форматы Отчётов
    <a href="/omp?cmd=get_report_formats&amp;token={/envelope/token}"
       title="Форматы Отчётов" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Report Formats"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_REPORT_FORMATS'"/>
      </xsl:call-template>

      <h1>Форматы Отчётов</h1>
      <p>
       В данной таблице приведён перечень всех настроенных в системе 
        <a href="glossary.html?token={/envelope/token}#report_format">
            Форматов Отчётов
        </a>
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'Формат Отчёта'"/>
          <xsl:with-param name="comment" select="'краткого обзора'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Расширение</td>
          <td>
              Расширение конечного Формата Отчёта.
          </td>
        </tr>
        <tr class="odd">
          <td>Тип Содержимого</td>
          <td>
              Тип Содержимого конечного Формата Отчёта.
          </td>
        </tr>
        <tr class="even">
          <td>Доверенный</td>
          <td>
            <b>да</b>: подпись, содержащаяся в формате отчёта или имеющаяся в
            Подписке, подтверждает, что Формат Отчёта не был
            скомпромитирован во время загрузки<br/>
            <b>нет</b>: Подпись и Формат Отчёта не соответствуют друг другу или ключ подписи
            недостоверный.<br/>
            <b>неизвестно</b>: В случае отсутствия возможности адекватно протестировать достоверность подписи.<br/>
            В скобках указывается дата последней проверки подписи.
          </td>
        </tr>
      </table>

      <a name="predefined_report_formats"></a>
      <h3>Форматы Отчётов, поставляемые с системой</h3>
      <p>
        В состав форматов отчётов, поставляемых с системой, входят:
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Наименование</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>PDF</td>
          <td>
            Файл PDF, содержащий отчёт.
          </td>
        </tr>
        <tr class="even">
          <td>HTML</td>
          <td>
            Файл HTML, содержащий отчёт.
            Его содержимое аналогично странице, получаемой при действии "Подробности",
            но он представляет из себя отдельный документ, который может быть просмотрен
            отдельно от GSA.
          </td>
        </tr>
        <tr class="odd">
          <td>XML</td>
          <td>
            Файл XML, содержащий отчёт.
            Он может стать основой для создания вашего собственного стиля отчёта или
            использоваться для последующей обработке результатов в других системах.
          </td>
        </tr>
        <tr class="even">
          <td>TXT</td>
          <td>
            Простой текстовый файл, содержащий отчёт.
          </td>
        </tr>
        <tr class="odd">
          <td>NBE</td>
          <td>
            Файл NBE, содержащий отчёт. Этот формат поддерживается 
            клиентом OpenVAS и в прошлом часто использовался для последующей
            обработки результатов. Он предоставляется преймущественно из соображений совместимости.
            Рекомендуется использовать последующую обработку XML файлов, а не NBE.
          </td>
        </tr>
        <tr class="even">
          <td>ITG</td>
          <td>
            Любые табличные результаты сканирований в соответствии с IT-Grundschutz
            собираются из отчёта и записываются в CSV файл для 
            простой интеграции в электронную таблицу или базу данных.
          </td>
        </tr>
        <tr class="odd">
          <td>CPE</td>
          <td>
            Любые табличные результаты инвентаризационных сканирований CPE
            собираются из отчёта и записываются в CSV файл для 
            простой интеграции в электронную таблицу или базу данных.
          </td>
        </tr>
      </table>

      <h3>Новый Формат Отчёта</h3>
      <p>
        Для создания нового Формата Отчёта нажмите на иконку
        <img src="/img/new.png" alt="New Report Format" title="Новый Формат Отчёта"/>, которая
        переведёт вас на страницу создания <a href="new_report_format.html?token={/envelope/token}">Нового Формата Отчёта</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка Форматов Отчётов в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Формат Отчётов'"/>
      </xsl:call-template>

      <h4>Проверка Формата Отчёта</h4>
      <p>
       Для проверки достоверности подписи Формата Отчёта нажмите на иконку <img src="/img/verify.png" alt="Verify" title="Проверить"/>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_report_format.html">
  <div class="gb_window_part_center">Помощь: Новый Формат Отчётов
    <a href="/omp?cmd=new_report_format&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
          <xsl:with-param name="command" select="'CREATE_REPORT_FORMAT'"/>
      </xsl:call-template>

      <h1>Новый Формат Отчётов</h1>
      <p>

        Для создания нового 
        <a href="glossary.html?token={/envelope/token}#report_format">Формата Отчётов</a>
        необходимо выбрать нужный файл и нажать кнопку "Импортировать Формат Отчётов" для его загрузки. 
        В результате вы перейдёте на страницу Подробностей Формата Отчётов. 
        Обратите внимание, что импортирование формата отчётов завершится с ошибкой в случае
        наличия такого формата в системе, или совпадении наименования с существующим Форматом Отчётов.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Импортируемый формат отчётов в XML</td>
          <td>да</td>
          <td>--</td>
          <td>Файл</td>
          <td>/tmp/custom_reporter.xml</td>
        </tr>
      </table>

      <h4>Форматы Отчётов</h4>
      <p>
       Нажав на иконку списка <img src="/img/list.png" alt="Report Formats" title="Форматы Отчётов"/>,
       вы перейдёте на страницу <a href="report_formats.html?token={/envelope/token}">Форматы Отчётов</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="report_format_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Формата Отчётов
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_REPORT_FORMATS'"/>
      </xsl:call-template>

      <h1>Подробности Формата Отчётов</h1>
      <p>
        Представляет подробную информацию об 
        <a href="glossary.html?token={/envelope/token}#report_format">
        Формате Отчётов</a>.
        А конкретнее: Наименование, время создания, время изменения,
        расширение, тип содержимого, степень доверенности, состояние, краткое и полное описание, прочие параметры.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'report_format'"/>
        <xsl:with-param name="name" select="'Формат Отчётов'"/>
      </xsl:call-template>

      <h3>Параметры</h3>
      <p>
        В данной таблице приведён список параметров, которые управляют
        процессом создания отчёта в этом формате.
      </p>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Формат Отчётов'"/>
        <xsl:with-param name="used_by" select="'Уведомление'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="configs.html">
  <div class="gb_window_part_center">Помощь: Конфигурации Сканирования
    <a href="/omp?cmd=get_configs&amp;token={/envelope/token}"
       title="Scan Configs" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Scan Configs"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <h1>Конфигурации Сканирования</h1>
      <p>
       В данной таблице приведён перечень всех настроенных в системе 
        <a href="glossary.html?token={/envelope/token}#config">Конфигураций Сканирования</a>
        и указано общее количество задействованных проверок в каждой из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'Конфигурация Сканирования'"/>
        </xsl:call-template>
        <tr>
          <td>Группы: Всего</td>
          <td>Число групп NVT, входящих в текущий набор NVT.
              "Н/Д" означает, что число в настоящий момент неизвестно.</td>
        </tr>
        <tr class="odd">
          <td>Группы: Трэнд</td>
          <td>Это поле может принимать два значения: "Растёт"
              (<img src="/img/trend_more.png"/>) или
              "Не меняется" (<img src="/img/trend_nochange.png"/>). "Растёт" означает, что
              выборка NVT, связанная с Конфигурацией Сканирования, настроена на включение 
              новых групп NVT, встречающихся в наборе NVT. "Не меняется" означает, что
              выборка NVT, связанная с Конфигурацией Сканирования, имеет чёткое указание
              какие группы следует использовать.</td>
        </tr>
        <tr>
          <td>NVT: Всего</td>
          <td>Число NVT, входящих в текущий набор NVT.
              "Н/Д" означает, что число в настоящий момент неизвестно.</td>
        </tr>
        <tr class="odd">
          <td>NVT: Трэнд</td>
          <td>Это поле может принимать два значения: "Растёт"
              (<img src="/img/trend_more.png"/>) или
              "Не меняется" (<img src="/img/trend_nochange.png"/>). "Растёт" означает, что
              выборка NVT, связанная с Конфигурацией Сканирования, настроена на включение 
              новых NVT, встречающихся в наборе NVT как минимум для одной группы.
              "Не меняется" означает, что выборка NVT, связанная с Конфигурацией Сканирования,
              имеет чёткое указание какие NVT следует использовать.</td>
        </tr>
      </table>

      <h3>Новая Конфигурация Сканирования</h3>
      <p>
        Для создания новой конфигурации сканирования нажмите на
        иконку <img src="/img/new.png" alt="New Scan Config" title="Новая Конфигурация Сканирования"/>, которая
        переведёт вас на страницу создания <a href="new_alert.html?token={/envelope/token}">Новой Конфигурации Сканирования</a>.
      </p>

      <a name="export"></a>
      <h3>Экспорт</h3>
      <p>
        Для экспорта списка конфигураций сканирований в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Конфигурация Сканирования'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_config.html">
  <div class="gb_window_part_center">Помощь: Новая Конфигурация Сканирования
    <a href="/omp?cmd=new_config&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
          <xsl:with-param name="command" select="'CREATE_CONFIG'"/>
      </xsl:call-template>

      <a name="new_config"></a>
      <h1>Новая Конфигурация Сканирования</h1>
      <p>

        Для создания новой
        <a href="glossary.html?token={/envelope/token}#config">Конфигурация Сканирования</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Конфигурацию Сканирования"
        для сохранения изменений. Для импорта новой Конфигурации Сканирования нажмите кнопку "Импортировать Конфигурацию Сканирования".
        В результате на страницу Подробностей Конфигурации Сканирования. 
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Full and deep scan</td>
        </tr>
        <tr>
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Полное сканирование, которое может занять некоторое время.</td>
        </tr>
        <tr class="odd">
          <td>Базовая конфигурация</td>
          <td>да</td>
          <td>---</td>
          <td>Шаблон построения конфигурации сканирования</td>
          <td>Пустой, статичный и быстрый<br/>
              Полный и Быстрый</td>
        </tr>
      </table>

      <a name="import_config"></a>
      <h1>Импорт Конфигурации Сканирования</h1>
      <p>
        Для импортирования конфигурации сканирования, выбирете конфигурационный файл и
        нажмите кнопку "Импортировать Конфигурацию Сканирования" для её загрузки.
        Список конфигураций сканирования будет обновлён.
        Обратите внимание, что в случае, если такое наименование конфигурации уже присутствует в системе,
        то к названию импортируемой конфигурации будет добавлен цифровой суффикс.
      </p>
      <p>
        Для создания файла, который можно будет в последствии импортировать (например, у вас
        несколько GSA, работающих на разных машинах), обратитесь к
        <a href="configs.html?token={/envelope/token}#export">функции экспорта</a>.
      </p>

      <h4>Конфигурации Сканирования</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Scan Configs" title="Конфигурации Сканирования"/>
       вы перейдёте на страницу <a href="configs.html?token={/envelope/token}">Конфигурации Сканирования</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="schedule_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Расписания
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SCHEDULES'"/>
      </xsl:call-template>

      <h1>Подробности Расписания</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#schedule">Расписании</a>.
        А конкретнее: Наименование, время создания, время изменения,
        комментарий, даты первого и следующего запусков, часовой пояс, период и продолжительность.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'schedule'"/>
        <xsl:with-param name="name" select="'Расписание'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Расписание'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="schedules.html">
  <div class="gb_window_part_center">Помощь: Расписания
    <a href="/omp?cmd=get_schedules&amp;token={/envelope/token}"
       title="Schedules" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Расписания"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SCHEDULES'"/>
      </xsl:call-template>

      <h1>Расписания</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
       <a href="glossary.html?token={/envelope/token}#schedule">Расписаний</a>.
       Представлено всё содержимое настроек каждой записи
       (Наименование, даты первого и следующего запусков, период и продолжительность).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'расписание'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Первый запуск</td>
          <td>
              Дата и время первого запуска задачи.
          </td>
        </tr>
        <tr class="odd">
          <td>Следующий запуск</td>
          <td>
            Дата и время следующего запуска задачи.
          </td>
        </tr>
        <tr class="even">
          <td>Период</td>
          <td>
              Период, по прошествии которого задача должна быть запущена снова.
          </td>
        </tr>
        <tr class="odd">
          <td>Продолжительность</td>
          <td>
              Максимальное время выполнения задачи.
          </td>
        </tr>
      </table>

      <h3>Новое Расписание</h3>
      <p>
        Для создания нового расписания нажмите на
        иконку <img src="/img/new.png" alt="New Schedule" title="Новое Расписание"/>, которая
        переведёт вас на страницу создания <a href="new_schedule.html?token={/envelope/token}">Нового Расписания</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка расписаний в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Расписание'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_schedule.html">
  <div class="gb_window_part_center">Помощь: Новое Расписание
    <a href="/omp?cmd=new_schedule&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_SCHEDULE'"/>
      </xsl:call-template>

      <h1>Новое Расписание</h1>
      <p>


        Для создания нового
        <a href="glossary.html?token={/envelope/token}#schedule">Расписания</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Расписание" для сохранения изменений.
        В результате вы перейдёте на страницу со списком Расписаний.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Одиночные Цели</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Цели, содержащие только один узел</td>
        </tr>
        <tr class="odd">
          <td>Первый запуск</td>
          <td>да</td>
          <td>--</td>
          <td>Выбор</td>
          <td>05:30 10 Jan 2013</td>
        </tr>
        <tr class="even">
          <td>Часовой пояс</td>
          <td>нет</td>
          <td>80</td>
          <td>Выбор</td>
          <td>Europe/Berlin</td>
        </tr>
        <tr class="odd">
          <td>Период</td>
          <td>нет</td>
          <td>--</td>
          <td>Выбор</td>
          <td>5 дней</td>
        </tr>
        <tr class="even">
          <td>Продолжительность</td>
          <td>нет</td>
          <td>--</td>
          <td>Выбор</td>
          <td>3 часа</td>
        </tr>
      </table>

      <h4>Расписания</h4>
      <p>
       Нажав на иконку 
       <img src="/img/list.png" alt="Schedules" title="Расписания"/>,
       вы перейдёте на страницу <a href="schedules.html?token={/envelope/token}">Расписания</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template name="scanner-actions_ru">
  <h4>Поверитҗ Сканер</h4>
  <p>
    Проверить, что Сканер доступен и Менеджер к нему подключиться с использованием имеющегося сертификата.
  </p>
  <h4>Скачать Сертификат</h4>
    <p>
     Нажав на иконку "Скачать Сертификат" <img src="/img/key.png" alt="Download Certificate" title="Скачать Сертификат"/>,
     вы скачаете сертификат.
    </p>
  <h4>Скачать Сертификат УЦ</h4>
    <p>
     Нажав на иконку "Скачать Сертификат УЦ" <img src="/img/key.png" alt="Download Certificate" title="Скачать Сертификат УЦ"/>,
     вы скачаете сертификат УЦ.
    </p>
</xsl:template>

<xsl:template mode="help" match="scanners.html">
  <div class="gb_window_part_center">Помощь: Сканеры
    <a href="/omp?cmd=get_scanners&amp;token={/envelope/token}"
       title="Scanners" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Сканеры"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SCANNERS'"/>
      </xsl:call-template>

      <h1>Сканеры</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
        <a href="glossary.html?token={/envelope/token}#scanner">Сканеров</a>.
        Указаны наименование, узел, порт и тип.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'Сканер'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Узел</td>
          <td>Узел сети, на котором функционирует сканер.</td>
        </tr>
        <tr class="odd">
          <td>Порт</td>
          <td>Порт, по которому можно подключиться к сканеру.</td>
        </tr>
        <tr class="even">
          <td>Тип</td>
          <td>Тип сканера</td>
        </tr>
      </table>

      <h3>Новый Сканер</h3>
      <p>
        Для создания нового сканера нажмите на
        иконку <img src="/img/new.png" alt="New Scanner" title="Новый Сканер"/>, которая
        переведёт вас на страницу создания <a href="new_scanner.html?token={/envelope/token}">Нового Сканера</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка сканеров в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Сканер'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
      <xsl:call-template name="scanner-actions_ru"/>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scanner_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Сканера
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SCANNERS'"/>
      </xsl:call-template>

      <h1>Подробности Сканера</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#scanner">Сканере</a>.
        А конкретнее: Наименование, время создания, время изменения,
        комментарий, узел, порт и тип сканера.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'scanner'"/>
        <xsl:with-param name="name" select="'Сканеры'"/>
      </xsl:call-template>
      <xsl:call-template name="scanner-actions_ru"/>

      <h2>Интерактивный Ответ Сканера</h2>
      <p>
        Если ваш Сканер типа OSP, то существует возможность проверки подключения 
        к нему с использованием имеющихся Сертификатов и Закрытого Ключа. При этом
        получается и отображается следующая информация:
      </p>
      <p>
        Наименование Сканера: Наименование сканирующей программы, используемой OSP Сканером.
      </p>
      <p>
        Версия Сканера: Версия сканирующей программы, используемой OSP Сканером.
      </p>
      <p>
        Демон OSP: Наименование демона OSP.
      </p>
      <p>
        Протокол: Версия протокола OSP.
      </p>
      <h3>Описание</h3>
      <p>
        Подробная информация, предоставленная Сканером.
      </p>

      <h3>Параметры Сканера</h3>
      <p>
        Данная таблица предоставляет обзор параметро, полученных от
        OSP Сканера. А именно: Идентификатор, Описание, Тип и Параметры
        со значениями по умолчанию. Они будут использованы в качестве базовых
        настроек Сканера при создании новой <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a>,
        основанной на этом Сканере.
      </p>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Сканер'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="slave_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Подчинённого
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SLAVES'"/>
      </xsl:call-template>

      <h1>Подробности Подчинённого</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#slave">Подчинённом</a>.
        А конкретнее: Наименование, время создания, время изменения,
        комментарий, узел, порт и имя пользователя для авторизации у Сканера.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'slave'"/>
        <xsl:with-param name="name" select="'Подчинённый'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Подчинённый'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="slaves.html">
  <div class="gb_window_part_center">Помощь: Подчинённые
    <a href="/omp?cmd=get_slaves&amp;token={/envelope/token}"
       title="Slaves" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Подчинённые"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SLAVES'"/>
      </xsl:call-template>

      <h1>Подчинённые</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
        <a href="glossary.html?token={/envelope/token}#slave">Подчинённых</a>.
        Показаны параметры каждой записи (наименование, узел, порт и
        ползователя имя).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'подчинённый'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Узел</td>
          <td>
              Узел сети, на котором функционирует подчинённый.
          </td>
        </tr>
        <tr class="odd">
          <td>Порт</td>
          <td>
            Сетевой порт, через который можно подсоединиться к подчинённому.
          </td>
        </tr>
        <tr class="even">
          <td>Имя</td>
          <td>
              Имя пользователя для авторизации.
          </td>
        </tr>
      </table>

      <h3>Новый Подчинённый</h3>
      <p>
        Для создания нового подчинённого нажмите на
        иконку <img src="/img/new.png" alt="New Slave" title="Новый Подчинённый"/>, которая
        переведёт вас на страницу создания <a href="new_slave.html?token={/envelope/token}">Нового Подчинённого</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка подчинённых в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Подчинённый'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_slave.html">
  <div class="gb_window_part_center">Помощь: Новый Подчинённый
    <a href="/omp?cmd=new_slave&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_SLAVE'"/>
      </xsl:call-template>

      <h1>Новый Подчинённый</h1>
      <p>
        Для создания нового
        <a href="glossary.html?token={/envelope/token}#slave">Подчинённого</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Подчинённого" для сохранения изменений.
        В результате вы перейдёте на страницу со списком Подчинённых.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Узел</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>192.168.3.200</td>
        </tr>
        <tr class="even">
          <td>Порт</td>
          <td>да</td>
          <td>80</td>
          <td>целое число</td>
          <td>9390</td>
        </tr>
        <tr class="odd">
          <td>Имя</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>sally</td>
        </tr>
        <tr class="odd">
          <td>Пароль</td>
          <td>да</td>
          <td>40</td>
          <td>Буквы и цифры</td>
          <td>J87TYWn^@#jk</td>
        </tr>
      </table>

      <h4>Подчинённые</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Slaves" title="Подчинённые"/>
       вы перейдёте на страницу <a href="slaves.html?token={/envelope/token}">Подчинённые</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="users.html">
  <div class="gb_window_part_center">Помощь: Пользователи
    <a href="/omp?cmd=get_users&amp;token={/envelope/token}"
       title="Users" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Пользователи"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_USERS'"/>
      </xsl:call-template>

      <a name="users"></a>
      <h1>Пользователи</h1>

      <p>
       Управление пользователями доступно только пользователям с ролью
       "Администратор".
      </p>

      <p>
       Данная таблица содержит перечень всех заведённых в системе пользователей.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'пользователь'"/>
          <xsl:with-param name="comment" select="false ()"/>
        </xsl:call-template>
        <tr class="even">
          <td>Роль</td>
          <td>Показывает назначенную пользователю роль.</td>
        </tr>
        <tr class="odd">
          <td>Доступ к узлам</td>
          <td>Правила доступа пользователя к узлам.</td>
        </tr>
      </table>

      <p>
        В случае использования у некоторых пользователей аутентификации в LDAP, появится дополнительный столбец
        ("Аутентификация в "LDAP") с устанавливаемым флажком. Если флажок для конкретного пользователя установлен, 
        пользователь сможет аутентифицироваться только через указанный LDAP сервер.
      </p>

      <a name="newuser"></a>

      <h3>Новый Пользователь</h3>
      <p>
        Для создания нового пользователя нажмите на иконку
        <img src="/img/new.png" alt="New User" title="Новый Пользователь"/>, которая 
        переведёт вас на страницу создания <a href="new_user.html?token={/envelope/token}">Нового Пользователя</a>.
      </p>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Пользователь'"/>
        <xsl:with-param name="notrashcan" select="1"/>
      </xsl:call-template>

      <h4>Удаление Пользователя</h4>
      <p>
       Нажав на иконку удаления
       <img src="/img/delete.png" alt="Delete" title="Удаление"/>,
       вы удалите пользователя.
      </p>
      <p>
       Невозможно удалить последнего пользователя с ролью "Администратора", т.к.
       это будет эквивалентно удалению самого себя.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="user_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Пользователя
<!--
    <a href="/omp?cmd=get_user&amp;user_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
-->
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_USERS'"/>
      </xsl:call-template>

      <h1>Подробности Пользователя</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#user">Пользователе</a>.
        А конкретнее: имя, назначенные роли и группы, в которые он входит.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'user'"/>
        <xsl:with-param name="name" select="'Пользователь'"/>
        <xsl:with-param name="ultimate" select="'1'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="permissions.html">
  <div class="gb_window_part_center">Помощь: Разрешения
    <a href="/omp?cmd=get_permissions&amp;token={/envelope/token}"
       title="Permissions" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Разрешения"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_PERMISSIONS'"/>
      </xsl:call-template>

      <h1>Разрешения</h1>
      <p>
        Сравочная статья о 
        <a href="new_permission.html?token={/envelope/token}">Новом Разрешении</a>
        даёт 
        <a href="new_permission.html?token={/envelope/token}#overview">обзор</a>
        концепции разрешений.
      </p>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
        <a href="glossary.html?token={/envelope/token}#permission">Разрешений</a>.
        Показаны параметры каждой записи (наименование, комментарий, тип ресурса,
        ресурс, тип субъекта, субъект).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'разрешение'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Описание</td>
          <td>Описание разрешения.</td>
        </tr>
        <tr class="odd">
          <td>Тип Ресурса</td>
          <td>Тип ресурса, на который распространяется действие разрешения, если он предоставлен.</td>
        </tr>
        <tr class="even">
          <td>Ресурс</td>
          <td>Имя Ресурса, на который распространяется действие разрешения.</td>
        </tr>
        <tr class="odd">
          <td>Тип Субъекта</td>
          <td>Тип субъекта, которому предоставлено разрешение: Пользователь, Роль или
              Группа.</td>
        </tr>
        <tr class="even">
          <td>Субъект</td>
          <td>Имя субъекта, которому предоставлено разрешение.</td>
        </tr>
      </table>

      <h3>Новое Разрешение</h3>
      <p>
        Для создания нового разрешения нажмите на
        иконку <img src="/img/new.png" alt="New Permission" title="Новое Разрешение"/>, которая
        переведёт вас на страницу создания <a href="new_permission.html?token={/envelope/token}">Нового Разрешения</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка разрешений в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Разрешение'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_permission.html">
  <div class="gb_window_part_center">Помощь: Новое Разрешение
    <a href="/omp?cmd=new_permission&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_PERMISSION'"/>
      </xsl:call-template>

      <h1>Новое Разрешение</h1>
      <p>
        Страница Новое Разрешение предоставляе низкоуровневый интерфейс для создания
        <a href="glossary.html?token={/envelope/token}#permission">разрешений</a>.
      </p>
      <p>
        Для создания нового разрешения необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Разрешение" для сохранения изменений.
        В результате вы перейдёте на страницу с Подробностями Разрешения. 
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>--</td>
          <td>Выбор</td>
          <td>CREATE_TASK</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Разрешения для квалифицированных пользователей</td>
        </tr>
        <tr class="odd">
          <td>Subject</td>
          <td>да</td>
          <td>--</td>
          <td>Выбор</td>
          <td>
            Пользователь: User1
          </td>
        </tr>
        <tr class="even">
          <td>ID Ресурса</td>
          <td>нет</td>
          <td>--</td>
          <td>UUID</td>
          <td>03c8aa9e-a062-4e32-bf8d-cd02d76902ec</td>
        </tr>
        <tr class="odd">
          <td>Тип Ресурса</td>
          <td>нет</td>
          <td>--</td>
          <td>Тип: Пользователь, Роль или Группа</td>
          <td>Роль</td>
        </tr>
      </table>

      <a name="overview"></a>
      <h4>Концептуальный Обзор</h4>

      <p>
        Разрешения предоставляются <b>субъекту</b>. Субъектом может выступать как пользователь, так роль или группа.
        Разрешения позволяют субъекту осуществить соответствующие действия.
      </p>

      <p>
        Разрешения делятся на два типа:
      </p>
      <ul>
        <li>
          <b>Командные Разрешения</b>
          <p>
            Командные Разрешения связаны с протоколом, используемым сервером
            управления задачами, <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">Протоколом Управления OpenVAS (OMP)</a>.
            Каждое командное разрешение соответствует команде
            <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP</a>.
            Наименование разрешения определяется соответствующей командой.
          </p>
          <p>
            Командное разрешение может быть на уровне команд или ресурсов.
          </p>
          <ul>
            <li>
              <b>Уровень Команд</b>
              <p>
                Если не указывать наименование ресурса, то создаётся разрешение на командном уровне.
                Оно позволяет субъекту запускать соответствующие OMP команды.
              </p>
              <p>
                Например, у существующей по умолчанию роли "Администратор" есть
                разрешение "GET_USERS"(получить список пользователей). Это даёт Администраторам
                возможность запрашивать список пользователей системы.
              </p>
              <p>
                Разрешения уровня команд переопределяют разрешения уровня ресурсов.
              </p>
            </li>
            <li>
              <b>Уровень Ресурсов</b>
              <p>
                Разрешения уровня ресурсов позволяют субъекту исполнять команды OMP протокола
                над конкретным ресурсом. Примерами ресурсов являются задачи, цели и подчинённые.
              </p>
              <p>
                Например, к разрешению "GET_SLAVES" (получить список подчинённых) может быть добавлен
                идентификатор ресурса, соответствующий конкретному подчинёному, а субъектом назначен
                конкретный пользователь. Тогда этот пользователь сможет просматривать информацию о 
                подчинённом. Указанный подчинённый будет отображаться на странице Подчинённых пользователя.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <b>Супер-разрешения</b>
          <p>
            Каждый ресурс в системе либо является глобальным(общим), либо имеет владельца.
            Примерами ресурсов являются задачи, цели и подчинённые.
          </p>
          <p>
            Супер-разрешения практически дают субъекту право владения всеми ресурсами,
            принадлежащими пользователю, роли или группе.
          </p>
          <p>
            Например, пользователю Алисе можно выдать супер разрешения на пользователя Боб.
            Это даёт Алисе полный доступ ко всем ресурсам Боба. Алиса сможет изменять и запускать
            все задачи Боба, просматривать отчёты Боба, удалять подчинённых Боба и т.д.
          </p>
          <p>
            Супер-разрешения могут выдаваться на:
          </p>
          <ul>
            <li>
              <b>Пользователей</b>
              <p>
                Субъект получает доступ ко всем ресурсам пользователя.
              </p>
            </li>
            <li>
              <b>Роли</b>
              <p>
                Субъект получает доступ ко всем ресурсам, принадлежащим пользователю, которому назначена указанная роль.
              </p>
            </li>
            <li>
              <b>Группы</b>
              <p>
                Субъект получает доступ ко всем ресурсам, принадлежащим пользователю, входящему в указанную группу.
              </p>
            </li>
            <li>
              <b>Всё</b>
              <p>
                Субъект получает доступ ко всем ресурсам.
              </p>
              <p>
                Это разрешение выдаётся роли Супер Администратора. Невозможно задать это разрешение.
                Единственным способом его предоставить является назначение роли Супер Администратора
                пользователю. Это можно сделать только посредством утилит командной строки для сервиса
                Управления.
              </p>
            </li>
          </ul>
          <p>
            Команды, которые может исполнять пользователь, ограничены
            разрешениями уровня команд, которые разначены пользователю.
          </p>
          <p>
            В целях ограничения распространение привилегий, пользователи могут назначать Супер разрешения 
            только тем пользователям, ролям и группам, которые они создали сами.
            Исключением из этого правила является пользователь Супер Администратор, который
            может выдавать Супер-разрешения любым пользователм, ролям и группам.
          </p>
        </li>
      </ul>
      <h4>Разрешения</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Permissions" title="Разрешения"/>,
       вы перейдёте на страницу со списком разрешений.
      </p>
 
       <a name="multiple"/>
       <h2>Создать несколько Разрешений</h2>
       <p>
         Эта форма на странице Нового Разрешения позволяет создать набор заданных разрешений для конкретного ресурса.
         Если вы перешли на эту страницу со страницы подробностей ресурса, то вы сможете так же задать разрешения для связанных ресурсов.
       </p>
       <h3>Типы Разрешений</h3>
       <h4>Просматривать</h4>
       <p>
         Granting "read" permissions means granting the permission to view the
         the resource on list pages and its details page (get_[...]).
       </p>
       <h4>Представитель</h4>
       <p>
         Предоставления разрешения "представитель" означает предоставление разрешения на нормальный просмотр и управление ресурсом, за искючением его удаления.
         Для большинства типов это означает предоставление разрешений просматривать ("get_[...]") и изменять ("modify_[...]").
       </p>
       <p>
         Тем не менее, некоторые типы включают дополнительные разрешения:
         <ul>
           <li><b>Задачи</b> также включают разрешения запускать, останавливать и
           возобновлять задачу (start_task, stop_task and resume_task).</li>
           <li><b>Уведомления</b> дополнительно имеют разрешение проверять срабатывание
           (test_alert).</li>
           <li><b>Форматы Отчётов, Уведомления</b> и <b>Сканеры</b> включают разрешение проверять целостность (validate_[...]).</li>
         </ul>
       </p>
       <h3>Связанные Ресурсы</h3>
       <p>
         Для некоторых типов форма "Создать несколько Разрешений" может создать разрешения также, как описано выше, для связанных ресурсов:
       </p>
       <p>
         <ul>
           <li>Для типа <b>Задачи</b> это может включать Уведомления и их Фильтры, Цели, так же как связанные Атрибуты доступа и Список Портов, Расписание, Сканер, 
               Конфигурацию Сканирования и Подчинённого.</li>
           <li><b>Цели</b> могут включать до трёх Атрибутов доступа (SSH, SMB and ESXi) и Список Портов.</li>
           <li><b>Уведомления</b> могут включать Фильтр, используемый для Отчёта.</li>
         </ul>
       </p>
       <p>
         На выбор вы можете создать разрешения для всех вместе или только для связанных ресурсов, выбрав нужный пункт из последнего выпадающего списка формы.
         Для просмотра подробностей связанных ресурсов, вы можете воспользоваться ссылками, размещёнными ниже этого выпадающего списка.
       </p>
       <p>
         Обратите внимание, что связаные ресурсы появляются только в случае, если переход на страницу создания разрешений был совершён со страницы подробностей ресурса, такой как
         <a href="/help/task_details.html?token={/envelope/token}">Подробности Задачи</a>.<br/>
         В случае доступности связанных ресурсов для задания разрешений, вы не сможете выбрать другой тип или идентификатор ресурса.
       </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="permission_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Разрешения</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_PERMISSIONS'"/>
      </xsl:call-template>

      <h1>Подробности Разрешения</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#permission">Разрешении</a>.
        А конкретнее: Наименование, комментарий, идентификатор ресурса,
        имя субъекта и его тип, тип ресурса для Супер-разрешений.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'permission'"/>
        <xsl:with-param name="name" select="'Разрешение'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="resource_permissions.html">
  <div class="gb_window_part_center">Помощь: Разрешения Ресурса</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">
      <br/>
      <h1>Разрешения Ресурса</h1>
      <p>
        В таблице "Разрешения для Ресурса типа" приведены перечень
        <a href="glossary.html?token={/envelope/token}#permission">Разрешений</a>
        относящихся к текущему ресурсу. Формат таблицы совпадает с форматом, описанном на странице
        <a href="permissions.html?token={/envelope/token}">Помощь: Разрешения</a>.
      </p>
      <h3>Новое Разрешение</h3>
      <p>
        Для создания нового разрешения нажмите на
        иконку <img src="/img/new.png" alt="New Permission" title="Новое Разрешение"/>, которая
        переведёт вас на страницу создания <a href="new_permission.html?token={/envelope/token}">Нового Разрешения</a> с уже заполненным полем идентификатора ресурса.
      </p>
      <p>
        Перечень возможных разрешений также будет ограничен специфичными только для данного типа ресурса разрешениями. По умолчанию будет предложено разрешение "просматривать".
        <br/>
        Например, для типа Задача доступен выбор из разрешений на удаление, просмотр, изменение, по умолчанию будет предложено задать разрешение на просмотр.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="roles.html">
  <div class="gb_window_part_center">Помощь: Роли
    <a href="/omp?cmd=get_roles&amp;token={/envelope/token}"
       title="Роли" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Roles"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_ROLES'"/>
      </xsl:call-template>

      <h1>Роли</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
       <a href="glossary.html?token={/envelope/token}#role">Ролей</a>.
       Приведена краткая характеристка каждой роли.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'Роль'"/>
        </xsl:call-template>
      </table>

      <a name="predefined"></a>
      <h3>Роли, заданные в системе</h3>
      <p>
        В системе всегда присутствует определённый набор Ролей.
        Этот набор и сами Роли невозможно изменить.
      </p>

      <ul>
        <li>
          <b>Super Admin</b>
          <p>
            Высочайший уровень полномочий. Может выполнять любое действие.
            Автоматически имеет полный доступ ко всем ресурсам
            (Задачам, Целям и т.д.) всех пользователей.
          </p>
        </li>
        <li>
          <b>Admin</b>
          <p>
            Администратор. Может выполнять любое действие, включающее административные,
            такие как создание пользователей, ролей и групп.
          </p>
          <p>
            Администратор может получить доступ к ресурсам других пользователей.
            Тем не менее, Администратор должен будет предварительно осуществить настройку такого доступа,
            и он всё равно будет ограничен теми пользователями, ролями и группами, которые
            данный Администратор создал.
          </p>
        </li>
        <li>
          <b>User</b>
          <p>
            Обычный пользователь. Может исполнять рутиные операции типа создания и запуска задач.
          </p>
        </li>
        <li>
          <b>Observer</b>
          <p>
            Наблюдатель. Имеет доступ только на чтение. Наблюдатели могут только просматривать.
            Т.е. Наблюдателям запрещено создавать, удалять, изменять или использовать любые задачи,
            цели, конфигурации и т.д.
          </p>
          <p>
            Наблюдатель получает доступ только к тем ресурсам,
            к которым ему специально предоставили доступ. 
          </p>
        </li>
        <li>
          <b>Info</b>
          <p>
            Роль только для доступа к Базе Знаний. Могут изменять личные настройки, например,
            изменять свой пароль.
          </p>
        </li>
        <li>
          <b>Guest</b>
          <p>
            Гостевой доступ, позволяет получить доступ только к Базе Знаний. Аналогичен роли Info, но
            не может изменять личные настройки.
          </p>
          <p>
            Данная роль нужна для необязательной ссылки "Войти как гость"
            на странице входа в систему. Роль имеет набор разрешений, необходимых только для просмотра
            различных данных, доступных через меню Управления Базой Знаний.
          </p>
        </li>
        <li>
          <b>Monitor</b>
          <p>
            Роль для отслеживания производительности системы. Имеет доступ только к системным отчётам.
          </p>
        </li>
      </ul>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка Ролей в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Роль'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="role_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Роли
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_ROLES'"/>
      </xsl:call-template>

      <h1>Подробности Роли</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#role">Роли</a>.
        А конкретнее: Наименование, время создания, время изменения,
        комментарий и пользователей.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'role'"/>
        <xsl:with-param name="name" select="'Роль'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="contents.html">
  <div class="gb_window_part_center">Помощь: Содержание</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">

      <h1>Содержание</h1>
      <p>
       Маленькие иконки <a href="/help/contents.html?token={/envelope/token}" title="Помощь"><img src="/img/help.png"/></a>,
       используемые повсеместно в веб интерфейсе, помогут вам перейти сразу к интересующему вас содержимому. 
       Или вы можете воспользоваться доступом через нижеприведённое оглавление.
      </p>

      <div class="bullet-list">
        <ul>
          <li> Управление сканированиями</li>
          <ul>
            <li> <a href="tasks.html?token={/envelope/token}">Задачи</a></li>
              <ul>
                <li> <a href="new_task.html?token={/envelope/token}">Новая Задача</a></li>
                <li> <a href="task_details.html?token={/envelope/token}">Подробности Задачи и Отчёты</a></li>
                <li> <a href="view_report.html?token={/envelope/token}">Просмотр Отчёта</a></li>
                <li> <a href="results.html?token={/envelope/token}">Результаты</a> </li>
                  <ul>
                    <li> <a href="result_details.html?token={/envelope/token}">Подробности Результата</a></li>
                  </ul>
              </ul>
            <li> <a href="notes.html?token={/envelope/token}">Заметки</a> </li>
              <ul>
                <li> <a href="new_note.html?token={/envelope/token}">Новая Заметка</a></li>
                <li> <a href="note_details.html?token={/envelope/token}">Подробности Заметки</a></li>
              </ul>
            <li> <a href="overrides.html?token={/envelope/token}">Переопределения</a></li>
              <ul>
                <li> <a href="new_override.html?token={/envelope/token}">Новое Переопределение</a></li>
                <li> <a href="override_details.html?token={/envelope/token}">Подробности Переопределения</a></li>
              </ul>
          </ul>
          <li> Управление Активами</li>
          <ul>
            <li> <a href="hosts.html?token={/envelope/token}">Узлы</a></li>
          </ul>
          <li> Управление Базой Знаний</li>
          <ul>
            <li> <a href="nvts.html?token={/envelope/token}">NVT</a></li>
              <ul>
                <li> <a href="nvt_details.html?token={/envelope/token}">Подробности NVT</a></li>
              </ul>
            <li> <a href="cves.html?token={/envelope/token}">CVE</a></li>
              <ul>
                <li> <a href="cve_details.html?token={/envelope/token}">Подробности CVE</a></li>
              </ul>
            <li> <a href="cpes.html?token={/envelope/token}">CPE</a></li>
              <ul>
                <li> <a href="cpe_details.html?token={/envelope/token}">Подробности CPE</a></li>
              </ul>
            <li> <a href="ovaldefs.html?token={/envelope/token}">Определения OVAL</a></li>
              <ul>
                <li> <a href="ovaldef_details.html?token={/envelope/token}">Подробности Определений OVAL</a></li>
              </ul>
            <li> <a href="cert_bund_advs.html?token={/envelope/token}">Предупреждения CERT-Bund</a></li>
              <ul>
                <li> <a href="cert_bund_adv_details.html?token={/envelope/token}">Подробности Предупреждений CERT-Bund</a></li>
              </ul>
            <li> <a href="dfn_cert_advs.html?token={/envelope/token}">Предупреждения DFN-CERT</a></li>
              <ul>
                <li> <a href="dfn_cert_adv_details.html?token={/envelope/token}">Подробности Предупреждений DFN-CERT</a></li>
              </ul>
            <li> <a href="allinfo.html?token={/envelope/token}">Вся База Знаний</a></li>
          </ul>
          <li> Конфигурация</li>
          <ul>
            <li> <a href="configs.html?token={/envelope/token}">Конфигурации Сканирования</a></li>
            <ul>
              <li> <a href="new_config.html?token={/envelope/token}">Новая Конфигурация Сканирования</a></li>
              <li> <a href="config_details.html?token={/envelope/token}">Подробности Конфигурации Сканирования</a></li>
              <li> <a href="config_family_details.html?token={/envelope/token}">Подробности Группы Конфигураций Сканирования</a></li>
              <li> <a href="config_nvt_details.html?token={/envelope/token}">Подробности NVT Конфигурации Сканирования</a></li>
              <li> <a href="config_editor.html?token={/envelope/token}">Редактор Конфигурации Сканирования</a></li>
              <li> <a href="config_editor_nvt_families.html?token={/envelope/token}">Редактор Группы Конфигураций Сканирования</a></li>
              <li> <a href="config_editor_nvt.html?token={/envelope/token}">Редактор NVT Конфигурации Сканирования</a></li>
            </ul>
            <li> <a href="targets.html?token={/envelope/token}">Цели</a></li>
              <ul>
                <li> <a href="new_target.html?token={/envelope/token}">Новая Цель</a></li>
                <li> <a href="target_details.html?token={/envelope/token}">Подробности Цели</a></li>
              </ul>
            <li> <a href="lsc_credentials.html?token={/envelope/token}">Атрибуты Доступа</a></li>
              <ul>
                <li> <a href="new_lsc_credential.html?token={/envelope/token}">Новые Атрибуты Доступа</a></li>
                <li> <a href="lsc_credential_details.html?token={/envelope/token}">Подробности Атрибутов Доступа</a></li>
              </ul>
            <li> <a href="agents.html?token={/envelope/token}">Агенты</a></li>
              <ul>
                <li> <a href="new_agent.html?token={/envelope/token}">Новый Агент</a></li>
                <li> <a href="agent_details.html?token={/envelope/token}">Подробности Агента</a></li>
              </ul>
            <li> <a href="alerts.html?token={/envelope/token}">Уведомления</a></li>
              <ul>
                <li> <a href="new_alert.html?token={/envelope/token}">Новое Уведомление</a></li>
                <li> <a href="alert_details.html?token={/envelope/token}">Подробности Уведомления</a></li>
              </ul>
            <li> <a href="tags.html?token={/envelope/token}">Тэги</a></li>
              <ul>
                <li> <a href="new_tag.html?token={/envelope/token}">Новый Тэг</a></li>
                <li> <a href="tag_details.html?token={/envelope/token}">Подробности Тэга</a></li>
              </ul>
            <li> <a href="filters.html?token={/envelope/token}">Фильтры</a></li>
              <ul>
                <li> <a href="new_filter.html?token={/envelope/token}">Новый Фильтр</a></li>
                <li> <a href="filter_details.html?token={/envelope/token}">Подробности Фильтра</a></li>
              </ul>
            <li> <a href="schedules.html?token={/envelope/token}">Расписания</a></li>
              <ul>
                <li> <a href="new_schedule.html?token={/envelope/token}">Новое расписание</a></li>
                <li> <a href="schedule_details.html?token={/envelope/token}">Подробности Расписания</a></li>
              </ul>
            <li> <a href="permissions.html?token={/envelope/token}">Права</a></li>
              <ul>
                <li> <a href="new_permission.html?token={/envelope/token}">Новые Права</a></li>
                <li> <a href="permission_details.html?token={/envelope/token}">Подробности Прав</a></li>
              </ul>
            <li> <a href="port_lists.html?token={/envelope/token}">Списки Портов</a></li>
              <ul>
                <li> <a href="new_port_list.html?token={/envelope/token}">Новый Список Портов</a></li>
                <li> <a href="port_list_details.html?token={/envelope/token}">Подробности Списка Портов</a></li>
              </ul>
            <li> <a href="report_formats.html?token={/envelope/token}">Форматы Отчётов</a></li>
              <ul>
                <li> <a href="new_report_format.html?token={/envelope/token}">Новый Форма Отчётов</a></li>
                <li> <a href="report_format_details.html?token={/envelope/token}">Подробности Формата Отчётов</a></li>
              </ul>
            <li> <a href="slaves.html?token={/envelope/token}">Подчинённые</a></li>
              <ul>
                <li> <a href="new_slave.html?token={/envelope/token}">Новый Подчинённый</a></li>
                <li> <a href="slave_details.html?token={/envelope/token}">Подробности Подчинённого</a></li>
              </ul>
            <li> <a href="scanners.html?token={/envelope/token}">Сканеры</a></li>
              <ul>
                <li> <a href="new_scanner.html?token={/envelope/token}">Новый Сканер</a></li>
                <li> <a href="scanner_details.html?token={/envelope/token}">Подробности Сканера</a></li>
              </ul>
          </ul>
          <li> Администрирование</li>
          <ul>
            <li> <a href="users.html?token={/envelope/token}">Пользователи</a></li>
              <ul>
                <li> <a href="new_user.html?token={/envelope/token}">Новый Пользователь</a></li>
                <li> <a href="user_details.html?token={/envelope/token}">Подробности Пользователя</a></li>
              </ul>
            <li> <a href="groups.html?token={/envelope/token}">Группы</a></li>
              <ul>
                <li> <a href="new_group.html?token={/envelope/token}">Новая Группа</a></li>
                <li> <a href="group_details.html?token={/envelope/token}">Подробности Группы</a></li>
              </ul>
            <li> <a href="roles.html?token={/envelope/token}">Роли</a></li>
              <ul>
                <li> <a href="new_role.html?token={/envelope/token}">Новая Роль</a></li>
                <li> <a href="role_details.html?token={/envelope/token}">Подробности Роли</a></li>
              </ul>
            <li> <a href="feed_management.html?token={/envelope/token}">Подписка NVT</a></li>
            <li> <a href="scap_management.html?token={/envelope/token}">Подписка SCAP</a></li>
            <li> <a href="cert_management.html?token={/envelope/token}">Подписка CERT</a></li>
          </ul>
          <li> Дополнительно</li>
          <ul>
            <li> <a href="trashcan.html?token={/envelope/token}">Корзина</a></li>
            <li> <a href="my_settings.html?token={/envelope/token}">Мои Настройки</a></li>
            <li> <a href="performance.html?token={/envelope/token}">Производительность</a></li>
            <li> <a href="cvss_calculator.html?token={/envelope/token}">Калькулятор CVSS</a></li>
            <li> <a href="powerfilter.html?token={/envelope/token}">Фильтрация</a></li>
            <li> <a href="user-tags.html?token={/envelope/token}">Список Тэгов Пользователя</a></li>
            <li> <a href="nvts.html?token={/envelope/token}">Подробности NVT</a></li>
            <li> <a href="qod.html?token={/envelope/token}">Точность обнаружения (QoD)</a></li>
            <li> Protocol Documentation</li>
              <ul>
                <li> <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP (Протокол Управления OpenVAS)</a></li>
              </ul>
            <li> <a href="error_messages.html?token={/envelope/token}">Сообщения об Ошибках</a></li>
            <li> <a href="glossary.html?token={/envelope/token}">Глоссарий</a></li>
          </ul>
        </ul>
      </div>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cpe_details.html">
  <div class="gb_window_part_center">Помощь: Подробности CPE</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Подробности CPE</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#cpe">CPE</a>.
        А конкретнее: все связанные CVE, время создания, время изменения,
        действительный статус и степень важности.
      </p>

      <h2>Известные Уязвимости</h2>
      <p>
        В этой таблице приведён перечень
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a>,
        связанных с данным CPE (если есть).
        Подробности CVE могут быть получены, если нажать на название интересующего вас CVE.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cve_details.html">
  <div class="gb_window_part_center">Помощь: Подробности CVE</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Подробности CVE</h1>
      <p>
        Представляет оригинальную подробную информацию о CVE (обычно на английском языке).
        В неё входит даты публикации, последнего изменения, подробное описание уязвимости,
        информация CVSS, перечень уязвимых продуктов и ссылки.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="ovaldef_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Определения OVAL</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Подробности Определения OVAL</h1>
      <p>
        Представляет подробную информацию об 
        <a href="glossary.html?token={/envelope/token}#ovaldef">Определении OVAL</a>.
        В неё входит даты создания, последнего изменения, номер версии, название,
        класс определения и подробное описание.
      </p>
      <h2>Затронуто</h2>
      <p>
        Одна или более таблиц, в которых перечислены системы, указанные в определении.
        Каждая запись состоит из одной группы и списка платформ или продуктов.
      </p>
      <h2>Критерий соответствия</h2>
      <p>
        Показывает условия соответствия анализируемой системы определению в виде дерева.
        Логические операторы выделены <b>жирным</b>, комментарии <i>курсивом</i>.
        Комментарии конечных узлов отображаются стандартным шрифтом с указанием
        соответствующих идентификаторов OVAL (проверки и дополнительные определения) <i>курсивом</i>.
      </p>
      <h2>Ссылки</h2>
      <p>
        В таблице указаны справочные ссылки, использованные для создания определения OVAL.
        Каждая запись содержит тип источника информаөии, идентификатор и URL.
      </p>
      <h2>История изменений</h2>
      <p>
        Показывает текущий статус определения (например, проект, промежуточный, принят) и таблицу,
        отображающую историю внесения изменений в определение. В первом столбце указывается тип изменения
        (например, представление документа, изменение документа, изменение статуса). В следующих
        столбцах указывается дата и автор(ы) изменения, если эта информация доступна.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cert_bund_adv_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Предупреждения CERT-Bund</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Подробности Предупреждения CERT-Bund</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#cert_bund_adv">Предупреждении CERT-Bund</a>.
        В неё входит даты создания, последнего изменения, название, затронутое ПО или платформы, последствия атаки,
        возможна ли удалённая атака, рейтинг риска CERT-Bund и основные ссылки.
      </p>
      <h3>Категории</h3>
      <p>
        В этом списке перечислены категории, к которым относится предупреждение.
      </p>
      <h3>Описание</h3>
      <p>
        В этом разделе описана уязвимость и подверженные ей продукты.
      </p>
      <h3>Используемые CVE</h3>
      <p>
        В этом списке приведены
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a>,
        на которые ссылается предупреждение. 
        Подробности CVE могут быть получены, если нажать на название интересующего вас CVE.
      </p>
      <h3>Другие ссылки</h3>
      <p>
        Этот список содержит ссылки на различные источники с дополнительной информацией об уязвимости.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="dfn_cert_adv_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Предупреждения DFN-CERT</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Подробности Предупреждения DFN-CERT</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">Предупреждении DFN-CERT</a>.
        В неё входит даты создания, последнего изменения, резюме и URL-ссылка на развёрнутое предупреждение.
      </p>
      <h3>Используемые CVE</h3>
      <p>
        В этом списке приведены
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a>,
        на которые ссылается предупреждение. 
        Подробности CVE могут быть получены, если нажать на название интересующего вас CVE.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="error_messages.html">
  <div class="gb_window_part_center">Помощь: Сообщения об Ошибках</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=unknown_cmd&amp;token={/envelope/token}">Вызвать безобидную внутреннюю ошибку</a> (воспользуйтесь <img src="/img/help.png"/>, чтобы вернуться сюда)</div>
    <div style="text-align:left">

      <br/>
      <h1>Сообщения об Ошибках</h1>

      <h2>Проблемы исполнения команд</h2>
      <p>
       В случае, если команда отработала не так, как ожидалось,
       появится дополнительное окошко "Results of last operation" красного цвета.
       В нём будет указан код ошибки ("Status code" равный 4xx) и сообщение об ошибке
       ("Status Message"), объясняющая её причину. Пока на английском языке.
      </p>
      <p>
       Вы можете продолжить пользоваться GSA, т.к. сбой не является критичным.
       Чтобы избежать таких ошибок в дальнейшем, обзнакомтесь с содержимым "Status Message".
      </p>

      <h2>Сообщение о внутренней ошибке</h2>
      <p>
       Обычно, в случае появления таких окошек с ошибкой, GSA так же продолжает функционировать.
      </p>
      <p>
       В окошке отображается <em>имя функции:номер строки</em> (что обычно
       имеет смысл только для разработчиков) и <em>сообщение об ошибке</em>
       (что может подсказать вашему системному администратору, как её исправить).
      </p>
      <p>
       У вас всегда есть три варианта действий:
      </p>

      <ol>
        <p><li>
          'Back' button of browser(Нажать кнопку "Назад" в браузере): В результате вы перейдёте на предыдущую страницу.
          Обратите внимание, что если предыдущим действием, вызвавшим ошибку, была отправка формы,
          то это приведёт к её повторной отсылке. В некоторых случаях, например, при создании задачи,
          команда успешно завершилась и также успешно завершиться последующая. Пожалуйста,
          внимательно прочитатйте сообщение об ошибке для определения своих дальнейших действий.
        </li></p>
        <p><li>
          Assumed sane state: GSA попробует угадать последнее рабочее состояние.
          Это не всегда помогает, но в любом случае при этом не будет производится повторная отправка форм,
          поэтому нежелательные действия, которые могут возникнуть при нажатии на кнопку "Назад" браузера
          не происходят.
        </li></p>
        <p><li>
          Logout: В случае серьёзных проблем или если ни одна из двух предыдущих 
          опций не помогает, вам придётся выйти из GSA. Если GSA всё ещё может функционировать,
          то вы окажитесь на странице входа в систему.
        </li></p>
      </ol>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="feed_management.html">
  <div class="gb_window_part_center">Помощь: Управление Подпиской NVT</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_feed&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Управление Подпиской NVT</h1>
      <p>
       Управление Подпиской NVT доступно только пользователям с ролью Администратор.
      </p>

      <a name="feed_synchronization"></a>
      <h2>Синхронизация Подписки NVT</h2>
      <p>
       В этом окне у вас появляется возможность синхронизировать вашу колекцию NVT с подпиской NVT.
       Здесь указан Сервис Подписки NVT, на взаимодействие с которым у вас была настроена система при установке
       и краткое поисание средств, используемых для синхронизации вашей коллекции с Подпиской NVT.
       Нажмите кнопку "Синхронизировать Подписку сейчас" для запуска процесса синхронизации.
      </p>

      <a name="side_effects"></a>
      <h2>Побочные эффекты синхронизации Подписки NVT</h2>
      <p>
       Обычно синхронизация с Сервисом Подписки NVT занимает непродолжительный отрезок времени.
       Тем не менее, в некоторых случаях этот процесс может растянуться.
       Это зависит от даты последней синхронизации, и от количества изменений, поступающих от
       Сервиса Подписки. Во время синхронизации интерфейс может слекга притормаживать.
      </p>
      <p>
       В конце синхронизации некоторым компонентам системы может потребоваться перезагрузка, чтобы
       воспользоваться всеми возможностями обновлённой коллекции NVT. Это также занимает небольшой
       промежуток времени, но в некоторых случаях может затянуться.
       Во время этого процесса интерфейс может вообще перестать откликаться.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="scap_management.html">
  <div class="gb_window_part_center">Помощь: Управление Подпиской SCAP</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_scap&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Управление Подпиской SCAP</h1>
      <p>
       Управление Подпиской SCAP доступно только пользователям с ролью Администратор.
      </p>

      <a name="scap_synchronization"></a>
      <h2>Синхронизация Подписки SCAP</h2>
      <p>
       В этом окне у вас появляется возможность синхронизировать вашу колекцию SCAP с подпиской SCAP.
       Здесь указан Сервис Подписки SCAP, на взаимодействие с которым у вас была настроена система при установке
       и краткое поисание средств, используемых для синхронизации вашей коллекции с Подпиской SCAP.
       Нажмите кнопку "Синхронизировать Подписку SCAP сейчас" для запуска процесса синхронизации.
      </p>

      <a name="side_effects"></a>
      <h2>Побочные эффекты синхронизации Подписки SCAP</h2>
      <p>
       Обычно синхронизация с Сервисом Подписки SCAP занимает непродолжительный отрезок времени.
       Тем не менее, в некоторых случаях этот процесс может растянуться.
       Это зависит от даты последней синхронизации, и от количества изменений, поступающих от
       Сервиса Подписки. Во время синхронизации интерфейс может слекга притормаживать.
      </p>
      <p>
       В конце синхронизации некоторым компонентам системы может потребоваться перезагрузка, чтобы
       воспользоваться всеми возможностями обновлённой коллекции SCAP. Это также занимает небольшой
       промежуток времени, но в некоторых случаях может затянуться.
       Во время этого процесса интерфейс может вообще перестать откликаться.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cert_management.html">
  <div class="gb_window_part_center">Помощь: Управление Подпиской CERT</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/oap?cmd=get_cert&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Управление Подпиской CERT</h1>
      <p>
       Управление Подпиской CERT доступно только пользователям с ролью Администратор.
      </p>

      <a name="scap_synchronization"></a>
      <h2>Синхронизация Подписки CERT</h2>
      <p>
       В этом окне у вас появляется возможность синхронизировать вашу колекцию уведомлений CERT с подпиской CERT.
       Здесь указан Сервис Подписки CERT, на взаимодействие с которым у вас была настроена система при установке
       и краткое поисание средств, используемых для синхронизации вашей коллекции с Подпиской CERT.
       Нажмите кнопку "Синхронизировать Подписку CERT сейчас" для запуска процесса синхронизации.
      </p>

      <a name="side_effects"></a>
      <h2>Побочные эффекты синхронизации Подписки CERT</h2>
      <p>
       Обычно синхронизация с Сервисом Подписки CERT занимает непродолжительный отрезок времени.
       Тем не менее, в некоторых случаях этот процесс может растянуться.
       Это зависит от даты последней синхронизации, и от количества изменений, поступающих от
       Сервиса Подписки. Во время синхронизации интерфейс может слекга притормаживать.
      </p>
      <p>
       В конце синхронизации некоторым компонентам системы может потребоваться перезагрузка, чтобы
       воспользоваться всеми возможностями обновлённой коллекции CERT. Это также занимает небольшой
       промежуток времени, но в некоторых случаях может затянуться.
       Во время этого процесса интерфейс может вообще перестать откликаться.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="filter_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Фильтра
<!--
    <a href="/omp?cmd=get_filter&amp;filter_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
-->
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_FILTERS'"/>
      </xsl:call-template>

      <h1>Подробности Фильтра</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#filter">Фильтре</a>.
        А конкретнее: Наименование, комментарий, шаблон и тип.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'filter'"/>
        <xsl:with-param name="name" select="'Фильтр'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Фильтр'"/>
        <xsl:with-param name="used_by" select="'Уведомление'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="filters.html">
  <div class="gb_window_part_center">Помощь: Фильтры
    <a href="/omp?cmd=get_filters&amp;token={/envelope/token}"
       title="Фильтры" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Filters"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_FILTERS'"/>
      </xsl:call-template>

      <h1>Фильтры</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
       <a href="glossary.html?token={/envelope/token}#filter">Фильтров</a>.
       Показано полное содержание записи о фильтре
       (Наименование, комментарий, шаблон и тип).
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'фильтр'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Шаблон</td>
          <td>Шаблон фильтра. Описывает, что и как будет фильтроваться.</td>
        </tr>
        <tr class="odd">
          <td>Тип</td>
          <td>
            Тип фильтра. Фильтр может применяться к какому-нибудь конкретному ресурсу. Если тип не указан,
            то фильтр может использоваться со всеми ресурсами.
          </td>
        </tr>
      </table>

      <h3>Новый Фильтр</h3>
      <p>
        Для создания нового фильтра нажмите на
        иконку <img src="/img/new.png" alt="New Filter" title="Новый Фильтр"/>, которая
        переведёт вас на страницу создания <a href="new_filter.html?token={/envelope/token}">Нового Фильтра</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка фильтров в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Фильтр'"/>
        <xsl:with-param name="used_by" select="'Уведомление'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="glossary.html">

  <div class="gb_window_part_center">Помощь: Глоссарий</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Глоссарий</h1>
      <p>
       В интерфейсе Greenbone Security Assistant (GSA) используется
       определённый набор терминов. 
      </p>
      <p>
       Большинство из них являются общими, поэтому во избежании
       неверной интерпретации, на этой странице приведены определени
       этих терминов в том смысле, в каком они используются в GSA.
      </p>

      <a name="cpe"></a>
      <h2>CPE</h2>
      <p>Отсебятина: MITRE передал все права и разработку CPE NISTу. Поэтому ссылки поставлю на NIST. Текущая версия спецификации в GSA 2.2.</p>
      <p>
        Common Platform Enumeration (Общее Перечисление Платформ, CPE) это стандартизованный метод описания и идентификации классов приложений, операционных систем и устройств,
        присутствующих в корпоративных вычислительных активах. Основываясь на общем синтаксисе Uniform Resource Identifiers (Универсальных Идентификаторов Ресурсов, URI), CPE добавляет 
        формат формального наименования, метод проверки наименований в системах, а также формат описания привязки текстов и тестов к наименованию.
        CPE не идентифицирует отдельную уникальную установку какого-либо продукта или системы, такие как установка
        XYZ Visualizer Enterprise Suite 4.2.3 с серийным номером Q472B987P113. Вместо этого CPE определяет абстрактный класс продуктов, таких как XYZ Visualizer Enterprise Suite 4.2.3,
        XYZ Visualizer Enterprise Suite (все версии) или XYZ Visualizer (все варианты поставки).
      <p>
      </p>
        Системы управления ИТ инфраструктурой могут собрать информацию об установленных продуктах, идентифицируя их в соответствии с CPE наименованием, а затем использовать 
        нормализованные таким образом данные для автоматических или полуавтоматических действий в отношении этих активов. Например, идентификация наличия в системе
        XYZ Visualizer Enterprise Suite может вызвать проверку системой управления уязвимостями на предмет выявления известных для данного ПО уязвимостей, а также вызвать систему
        управления конфигурациями, которая проверит, что ПО настроено в соответствии с корпоративными политиками безопасности.
      </p>

      <p>
        (Источники https://nvd.nist.gov/cpe.cfm, http://scap.nist.gov/specifications/cpe/).
      </p>

      <p>
        Наименование CPE начинается с "cpe:/", после чего через двоеточие перечисляются следующие семь компонентов:
        <ul>
          <li>тип (h-устройство, o-ОС или a-приложение)</li>
          <li>Наименование производителя</li>
          <li>Наименование продукта</li>
          <li>Версия</li>
          <li>Обновление</li>
          <li>Издание</li>
          <li>Язык</li>
        </ul>
        Например, <code>cpe:/o:linux:kernel:2.6.0</code> или <code>cpe:/a:quizzler_project:quizzler:7.x-1.15::~~~drupal~~</code>
      </p>

      <a name="cve"></a>
      <h2>CVE</h2>
      <p>
        Common Vulnerabilities and Exposures (Общие Уязвимости и Подверженности воздействию, CVE) это словарь общедоступной информации об уязвимостях и
        возможностях воздействия на системы.
      </p>
      <p>
        (Источник: http://cve.mitre.org).
      </p>

      <a name="cvss"></a>
      <h2>CVSS</h2>
      <p>
        Common Vulnerability Scoring System (CVSS) это Общая Система Скоринга Уязвимостей, разработанная для предоставления общедоступного и стандартизованного метода оценки
        ИТ уязвимостей. CVSS состоит из 3 групп: Базовой, Временной и Среды. В рамках каждой группы вычисляется рейтинг от 0 до 10 и Вектор, сжатое текстовое представление, которое
        отображает значения, использованные для подсчёта рейтинга. Базовая группа представляет общие свойства, присущие уязвимости. Временная группа представляет характеристики уязвимости,
        которые меняются с течением времени. Группа Среды представляет характеристики уязвимости, которые являются уникальными для пользовательского окружения. 
      </p>
      <p>
        (Источник: http://www.first.org/cvss/cvss-guide). Отсебятина: Слегка расширил глоссарий из источника.
      </p>

      <a name="cert_bund_adv"></a>
      <h2>Предупреждения CERT-Bund (CERT_BUND_ADV)</h2>
      <p>
        Предупреждения, публикуемые CERT-Bund. Подробнее см. <a href="/help/cert_bund_advs.html?token={/envelope/token}#about">
        раздел о Предупреждениях в статье &quot;Помощь: CERT-Bund&quot;</a>.
      </p>

      <a name="dfn_cert_adv"></a>
      <h2>Предупреждения DFN-CERT (DFN_CERT_ADV)</h2>
      <p>
        Предупреждения, публикуемые DFN-CERT. Подробнее см. <a href="/help/dfn_cert_advs.html?token={/envelope/token}#about">
        раздел о Предупреждениях в статье &quot;Помощь: DFN-CERT&quot;</a>.
      </p>

      <a name="ovaldef"></a>
      <h2>Определение OVAL (OVALDEF)</h2>
      <p>
        Определение в соответствии со спецификацией OVAL (Open Vulnerability and Assessment
        Language, Открытый Язык описания Уязвимостей и Проверок), версии 5.10.1 (Отсебятина: последняя версия 5.11.1). Оно может быть использовано для различных классов
        данных о безопасности, таких как уязвимости, заплатки или политики соответствия.
      </p>
      <p>
        (Источник: http://oval.mitre.org).
      </p>

      <a name="agent"></a>
      <h2>Агент</h2>
      <p>
        Подсистема агентов предоставляет хранилище для утилит агентов. В общем
        это хранилище с интегрированной  проверкой цифровой подписи. Агенты
        могут скачиваться для ручной установки на целевых системах.
        Это свойство агентов не имеет отношения к элементам пользовательского интерфейса.
      </p>
      <p>
        Агенты представляют из себя утилиты, устанавливаемые и запускаемые на целевых системах.
        Они собирают и анализируеют информацию о целевой системе, которая может помочь
        определить наличие уязвимости.
      </p>
      <p>
        В процессе сканирования на уязвимости, производится запрос этой информации у агентов.
        Однако это не является поведением по умолчанию. Для использования данной функции
        необходимо осуществить настройку специальных NVT.
      </p>
      <p>
        Агенты могут работать асинхронно относительно сканирований: первое сканирование
        инициирует требуемую функцию агента (например, выявление слабых паролей, что может занять довольно много времени),
        а второе сканироание запрашивает результаты работы агента с момента последнего взаимодействия.
      </p>
      <p>
        На практике агенты используются в очень специфических случаях и особых обстоятельствах.
        В настоящий момент большая часть функциональности доступна посредством аутентифицированное сканирование
        или через стандартные средства (такие как средства защиты конечных узлов) на целевых системах.
      </p>

      <a name="alert"></a>
      <h2>Уведомление</h2>
      <p>
       Уведомление это действие, которое осуществляется при наступлении заранее заданного события.
       Обычно под этим понимают уведомление, присылаемое по электронной почте в случае обнаружения
       новой уязвимости.
      </p>

      <a name="filter"></a>
      <h2>Фильтр</h2>
      <p>
       Фильтр описывает, как выбрать определённое подможество из группы ресурсов.
      </p>

      <a name="group"></a>
      <h2>Группа</h2>
      <p>
       Группа является множеством пользователей.
      </p>

      <a name="note"></a>
      <h2>Заметка</h2>
      <p>
       Заметка является текстовым комментарием к ассоциированному с ней <a href="#nvt">NVT</a>.
       Заметки отображаются в <a href="#report">отчётах</a> после результатов работы NVT. 
       Заметка может быть связана с конкретным результатом, задачей, классом важности, портом и/или узлом,
       таким образом заметки отображаются только в некоторых отчётах.
      </p>

      <a name="nvt"></a>
      <h2>Network Vulnerability Test (NVT)</h2>
      <p>
       A Network Vulnerability Test (Сетевой Тест на Уязвимости, NVT) это программа, которая
       проверяет целевую систему на наличие специфических известных или потенциальных проблем с безопасностью.
      </p>
      <p>
       NVT объединяются в группы схожих тестов.
       Выбор групп и/или одиночного NVT производтися в <a href="#config">Конфигурации Сканирования</a>.
      </p>

      <a name="override"></a>
      <h2>Переопределение</h2>
      <p>
       Переопределение это правило изменения важности сообщений в одном или более <a href="#report">отчёте</a>.
      </p>
      <p>
       Переопределения особенно полезны, когда надо отметить ложные срабатывания в отчёте
       (например, неверная или ожидаемая находка), или наоборот подчеркнуть повышенную уязвимость целей
       в рассматриваемом сценарии атаки.
      </p>

      <a name="permission"></a>
      <h2>Разрешение</h2>
      <p>
        Разрешение предоставляет <a href="#user">пользователю</a>, <a href="#role">роли</a>
        или <a href="#group">группе</a> право выполнять конкретные действия.
      </p>

      <a name="port_list"></a>
      <h2>Список Портов</h2>
      <p>
       Список портов это перечень сетевых портов. 
       Каждая <a href="#target">Цель</a> связана со Списком Портов.
       Он определяет, какие порты будут проверяться во время сканирования Цели.
      </p>

      <a name="prognostic_report"></a>
      <h2>Отчёт о Прогнозах</h2>
      <p>
        Прогностические сканирования позволяют провести предварительный анализ потенциальных уязвимостей узла.
        Он производится без доступа к исследуемым системам по сети, и поэтому длительность сканирования
        стремиться к нулю.
      </p>
      <p>
        Прогностические сканирования используют инвентаризационную информацию об установленных продуктах из прошлых сканирований и
        сравнивает её с наиболее актуальной информацией об уязвимостях (CVE) с целью выявления установленных и всё ещё уязвимых продуктов.
      </p>

      <a name="qod"></a>
      <h2>Точность Обнаружения (QoD)</h2>
      <p>
        QoD представляет собой значение от 0% до 100%, описывающее
        надёжность выполненного определения наличия уязвимости или наименования установленного продукта.
      </p>
      <p>
        За более подробной информацией обратитесь к статье <a href="qod.html?token={/envelope/token}">Помощь: Точность обнаружения (QoD)</a>.
      </p>

      <a name="report"></a>
      <h2>Отчёт</h2>
      <p>
       Отчёт является результатом <a href="#scan">Сканирования</a> и содержит резюме найденного на целевых узлах посредством выбранных NVT.
      </p>
      <p>
       Отчёт всегда связан с <a href="#task">задачей</a>. <a href="#config">Конфигурация Сканирования</a>, которая определяет конечный объём отчёта, является частью связаной задачи и
       не может быть изменена. Таким образом достигается неизменность и доступность конфигурации, в которой осуществлялся запуск задачи, для любого отчёта.
      </p>

      <a name="report_format"></a>
      <h2>Формат Отчёта</h2>
      <p>
       Формат, в котором можно скачать <a href="#report">отчёт</a>.
      </p>
      <p>
       Примером может служить формат "TXT", с типом содержимого "text/plain", означающий, что отчёт представляет из себя простой текстовый файл.
      </p>

      <a name="result"></a>
      <h2>Результат</h2>
      <p>
       Единичное сообщение, генерируемое сканером, являющееся составной частью <a href="#report">отчёта</a>,
       например, предупреждение об обнаружении уязвимости или сообщение в журнале регистрации.
      </p>

      <a name="role"></a>
      <h2>Роль</h2>
      <p>
       Роль определяет набор <a href="#permission">разрешений</a>, которые могут передаваться пользователю или <a href="#group">группе</a>.
      </p>

      <a name="slave"></a>
      <h2>Подчинённый</h2>
      <p>
        Подчинённый это другой менеджер OpenVAS, на котором может быть исполнена <a href="#task">задача</a>.
      </p>

      <a name="scan"></a>
      <h2>Сканирование</h2>
      <p>
       Сканирование это исполняющаяся в настоящий момент <a href="#task">задача</a>.
       Для каждой задачи может исполняться только одно сканирование.
       Результатом сканирования является <a href="#report">отчёт</a>.
      </p>
      <p>
       Статус всех активных сканирований доступен в
       <a href="/omp?cmd=get_tasks?token={/envelope/token}">обзоре задач</a>.
       Полоска прогресса показывает процент завершённых от общего числа тестов, которые будут выполняться.
       Продолжительность сканирования определяется количеством <a href="#target">целей</a> и сложностью
       <a href="#config">Конфигурации Сканирования</a> и может длиться от 1 минуты до нескольких часов и даже дней.
      </p>
      <p>
       В окне Задачи вы можете остановить выполнение сканирования.
       Но получившийся при этом отчёт будет неполным.
      </p>

      <a name="scanner"></a>
      <h2>Сканер</h2>
      <p>
        Сканер это демон сканирования OpenVAS или совместимый OSP демон, который будет выполнять <a href="#scan">сканирование</a>.
      </p>

      <a name="config"></a>
      <h2>Конфигурация Сканирования</h2>
      <p>
       В конфигурацию сканирования входит выбор <a href="#nvt">NVT</a>, а также обычные и расширенные настройки для сканирующего демона и некоторых NVT.
      </p>
      <p>
       В Конфигурацию Сканирования не входит выбор целей. <a href="#target">Цели</a> указываются отдельно.
      </p>

      <a name="schedule"></a>
      <h2>Расписание</h2>
      <p>
        Расписние задаёт время автоматического запуска <a href="#task">задачи</a>, периодичность запуска и максимальное время исполнения, после которого задача прерывается.
      </p>

      <a name="tag"></a>
      <h2>Тэг</h2>
      <p>
       Тэг представляет из себя небольшой набор данных, состоящий из имени и значения, которое связано с любым ресурсом, и содержит какое-либо пользовательское описание этого ресурса.
      </p>

      <a name="target"></a>
      <h2>Цель</h2>
      <p>
       Цель определяет набор систем (называемых "узлами"), подлежащих сканированию.
       Системы определяются либо по их именам, либо по IP-адресам включая адрес подсети в CIDR нотации.
      </p>

      <a name="task"></a>
      <h2>Задача</h2>
      <p>
       Задача изначально формируется <a href="#target">целями</a> и <a href="#config">конфигурацией сканирования</a>.
       Запуск задачи инициирует <a href="#scan">сканирование</a>. Каждое сканирование порождает <a href="#report">отчёт</a>.
       В результате задача может содержать несколько отчётов.
      </p>
      <p>
       Цели и конфигурация сканирования у задачи всегда неизменны.
       Таким образом получаемый в результате набор последовательных отчётов описывает изменения в уровне безопасности в течение времени.
       Тем не менее, задача может быть отмечена как <b>изменяемая</b> в случае отсутствия связанных с ней отчётов.
       Для таких задач набор целей и конфигурация сканирования могут быть изменены в любой момент, что иногда может быть удобно.
      </p>
      <p>
       <b>Контейнерная задача</b> это задача, основной целью которой является хранить в себе импортированные отчёты. 
       Запуск контейнерных задач запрещён.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="gplv2.html">
  <div class="gb_window_part_center">GNU General Public License Version 2</div>
  <div class="gb_window_part_content">
    <div style="text-align:left">

<pre>
		    GNU GENERAL PUBLIC LICENSE
		       Version 2, June 1991

 Copyright (C) 1989, 1991 Free Software Foundation, Inc.
     51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

			    Preamble

  The licenses for most software are designed to take away your
freedom to share and change it.  By contrast, the GNU General Public
License is intended to guarantee your freedom to share and change free
software--to make sure the software is free for all its users.  This
General Public License applies to most of the Free Software
Foundation's software and to any other program whose authors commit to
using it.  (Some other Free Software Foundation software is covered by
the GNU Library General Public License instead.)  You can apply it to
your programs, too.

  When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
this service if you wish), that you receive source code or can get it
if you want it, that you can change the software or use pieces of it
in new free programs; and that you know you can do these things.

  To protect your rights, we need to make restrictions that forbid
anyone to deny you these rights or to ask you to surrender the rights.
These restrictions translate to certain responsibilities for you if you
distribute copies of the software, or if you modify it.

  For example, if you distribute copies of such a program, whether
gratis or for a fee, you must give the recipients all the rights that
you have.  You must make sure that they, too, receive or can get the
source code.  And you must show them these terms so they know their
rights.

  We protect your rights with two steps: (1) copyright the software, and
(2) offer you this license which gives you legal permission to copy,
distribute and/or modify the software.

  Also, for each author's protection and ours, we want to make certain
that everyone understands that there is no warranty for this free
software.  If the software is modified by someone else and passed on, we
want its recipients to know that what they have is not the original, so
that any problems introduced by others will not reflect on the original
authors' reputations.

  Finally, any free program is threatened constantly by software
patents.  We wish to avoid the danger that redistributors of a free
program will individually obtain patent licenses, in effect making the
program proprietary.  To prevent this, we have made it clear that any
patent must be licensed for everyone's free use or not licensed at all.

  The precise terms and conditions for copying, distribution and
modification follow.

		    GNU GENERAL PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. This License applies to any program or other work which contains
a notice placed by the copyright holder saying it may be distributed
under the terms of this General Public License.  The "Program", below,
refers to any such program or work, and a "work based on the Program"
means either the Program or any derivative work under copyright law:
that is to say, a work containing the Program or a portion of it,
either verbatim or with modifications and/or translated into another
language.  (Hereinafter, translation is included without limitation in
the term "modification".)  Each licensee is addressed as "you".

Activities other than copying, distribution and modification are not
covered by this License; they are outside its scope.  The act of
running the Program is not restricted, and the output from the Program
is covered only if its contents constitute a work based on the
Program (independent of having been made by running the Program).
Whether that is true depends on what the Program does.

  1. You may copy and distribute verbatim copies of the Program's
source code as you receive it, in any medium, provided that you
conspicuously and appropriately publish on each copy an appropriate
copyright notice and disclaimer of warranty; keep intact all the
notices that refer to this License and to the absence of any warranty;
and give any other recipients of the Program a copy of this License
along with the Program.

You may charge a fee for the physical act of transferring a copy, and
you may at your option offer warranty protection in exchange for a fee.

  2. You may modify your copy or copies of the Program or any portion
of it, thus forming a work based on the Program, and copy and
distribute such modifications or work under the terms of Section 1
above, provided that you also meet all of these conditions:

    a) You must cause the modified files to carry prominent notices
    stating that you changed the files and the date of any change.

    b) You must cause any work that you distribute or publish, that in
    whole or in part contains or is derived from the Program or any
    part thereof, to be licensed as a whole at no charge to all third
    parties under the terms of this License.

    c) If the modified program normally reads commands interactively
    when run, you must cause it, when started running for such
    interactive use in the most ordinary way, to print or display an
    announcement including an appropriate copyright notice and a
    notice that there is no warranty (or else, saying that you provide
    a warranty) and that users may redistribute the program under
    these conditions, and telling the user how to view a copy of this
    License.  (Exception: if the Program itself is interactive but
    does not normally print such an announcement, your work based on
    the Program is not required to print an announcement.)

These requirements apply to the modified work as a whole.  If
identifiable sections of that work are not derived from the Program,
and can be reasonably considered independent and separate works in
themselves, then this License, and its terms, do not apply to those
sections when you distribute them as separate works.  But when you
distribute the same sections as part of a whole which is a work based
on the Program, the distribution of the whole must be on the terms of
this License, whose permissions for other licensees extend to the
entire whole, and thus to each and every part regardless of who wrote it.

Thus, it is not the intent of this section to claim rights or contest
your rights to work written entirely by you; rather, the intent is to
exercise the right to control the distribution of derivative or
collective works based on the Program.

In addition, mere aggregation of another work not based on the Program
with the Program (or with a work based on the Program) on a volume of
a storage or distribution medium does not bring the other work under
the scope of this License.

  3. You may copy and distribute the Program (or a work based on it,
under Section 2) in object code or executable form under the terms of
Sections 1 and 2 above provided that you also do one of the following:

    a) Accompany it with the complete corresponding machine-readable
    source code, which must be distributed under the terms of Sections
    1 and 2 above on a medium customarily used for software interchange; or,

    b) Accompany it with a written offer, valid for at least three
    years, to give any third party, for a charge no more than your
    cost of physically performing source distribution, a complete
    machine-readable copy of the corresponding source code, to be
    distributed under the terms of Sections 1 and 2 above on a medium
    customarily used for software interchange; or,

    c) Accompany it with the information you received as to the offer
    to distribute corresponding source code.  (This alternative is
    allowed only for noncommercial distribution and only if you
    received the program in object code or executable form with such
    an offer, in accord with Subsection b above.)

The source code for a work means the preferred form of the work for
making modifications to it.  For an executable work, complete source
code means all the source code for all modules it contains, plus any
associated interface definition files, plus the scripts used to
control compilation and installation of the executable.  However, as a
special exception, the source code distributed need not include
anything that is normally distributed (in either source or binary
form) with the major components (compiler, kernel, and so on) of the
operating system on which the executable runs, unless that component
itself accompanies the executable.

If distribution of executable or object code is made by offering
access to copy from a designated place, then offering equivalent
access to copy the source code from the same place counts as
distribution of the source code, even though third parties are not
compelled to copy the source along with the object code.

  4. You may not copy, modify, sublicense, or distribute the Program
except as expressly provided under this License.  Any attempt
otherwise to copy, modify, sublicense or distribute the Program is
void, and will automatically terminate your rights under this License.
However, parties who have received copies, or rights, from you under
this License will not have their licenses terminated so long as such
parties remain in full compliance.

  5. You are not required to accept this License, since you have not
signed it.  However, nothing else grants you permission to modify or
distribute the Program or its derivative works.  These actions are
prohibited by law if you do not accept this License.  Therefore, by
modifying or distributing the Program (or any work based on the
Program), you indicate your acceptance of this License to do so, and
all its terms and conditions for copying, distributing or modifying
the Program or works based on it.

  6. Each time you redistribute the Program (or any work based on the
Program), the recipient automatically receives a license from the
original licensor to copy, distribute or modify the Program subject to
these terms and conditions.  You may not impose any further
restrictions on the recipients' exercise of the rights granted herein.
You are not responsible for enforcing compliance by third parties to
this License.

  7. If, as a consequence of a court judgment or allegation of patent
infringement or for any other reason (not limited to patent issues),
conditions are imposed on you (whether by court order, agreement or
otherwise) that contradict the conditions of this License, they do not
excuse you from the conditions of this License.  If you cannot
distribute so as to satisfy simultaneously your obligations under this
License and any other pertinent obligations, then as a consequence you
may not distribute the Program at all.  For example, if a patent
license would not permit royalty-free redistribution of the Program by
all those who receive copies directly or indirectly through you, then
the only way you could satisfy both it and this License would be to
refrain entirely from distribution of the Program.

If any portion of this section is held invalid or unenforceable under
any particular circumstance, the balance of the section is intended to
apply and the section as a whole is intended to apply in other
circumstances.

It is not the purpose of this section to induce you to infringe any
patents or other property right claims or to contest validity of any
such claims; this section has the sole purpose of protecting the
integrity of the free software distribution system, which is
implemented by public license practices.  Many people have made
generous contributions to the wide range of software distributed
through that system in reliance on consistent application of that
system; it is up to the author/donor to decide if he or she is willing
to distribute software through any other system and a licensee cannot
impose that choice.

This section is intended to make thoroughly clear what is believed to
be a consequence of the rest of this License.

  8. If the distribution and/or use of the Program is restricted in
certain countries either by patents or by copyrighted interfaces, the
original copyright holder who places the Program under this License
may add an explicit geographical distribution limitation excluding
those countries, so that distribution is permitted only in or among
countries not thus excluded.  In such case, this License incorporates
the limitation as if written in the body of this License.

  9. The Free Software Foundation may publish revised and/or new versions
of the General Public License from time to time.  Such new versions will
be similar in spirit to the present version, but may differ in detail to
address new problems or concerns.

Each version is given a distinguishing version number.  If the Program
specifies a version number of this License which applies to it and "any
later version", you have the option of following the terms and conditions
either of that version or of any later version published by the Free
Software Foundation.  If the Program does not specify a version number of
this License, you may choose any version ever published by the Free Software
Foundation.

  10. If you wish to incorporate parts of the Program into other free
programs whose distribution conditions are different, write to the author
to ask for permission.  For software which is copyrighted by the Free
Software Foundation, write to the Free Software Foundation; we sometimes
make exceptions for this.  Our decision will be guided by the two goals
of preserving the free status of all derivatives of our free software and
of promoting the sharing and reuse of software generally.

			    NO WARRANTY

  11. BECAUSE THE PROGRAM IS LICENSED FREE OF CHARGE, THERE IS NO WARRANTY
FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW.  EXCEPT WHEN
OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES
PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED
OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.  THE ENTIRE RISK AS
TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.  SHOULD THE
PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING,
REPAIR OR CORRECTION.

  12. IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MAY MODIFY AND/OR
REDISTRIBUTE THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES,
INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING
OUT OF THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED
TO LOSS OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY
YOU OR THIRD PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER
PROGRAMS), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE
POSSIBILITY OF SUCH DAMAGES.

		     END OF TERMS AND CONDITIONS

	    How to Apply These Terms to Your New Programs

  If you develop a new program, and you want it to be of the greatest
possible use to the public, the best way to achieve this is to make it
free software which everyone can redistribute and change under these terms.

  To do so, attach the following notices to the program.  It is safest
to attach them to the start of each source file to most effectively
convey the exclusion of warranty; and each file should have at least
the "copyright" line and a pointer to where the full notice is found.

    &lt;one line to give the program's name and a brief idea of what it does.&gt;
    Copyright (C) &lt;year&gt;  &lt;name of author&gt;

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA


Also add information on how to contact you by electronic and paper mail.

If the program is interactive, make it output a short notice like this
when it starts in an interactive mode:

    Gnomovision version 69, Copyright (C) year  name of author
    Gnomovision comes with ABSOLUTELY NO WARRANTY; for details type `show w'.
    This is free software, and you are welcome to redistribute it
    under certain conditions; type `show c' for details.

The hypothetical commands `show w' and `show c' should show the appropriate
parts of the General Public License.  Of course, the commands you use may
be called something other than `show w' and `show c'; they could even be
mouse-clicks or menu items--whatever suits your program.

You should also get your employer (if you work as a programmer) or your
school, if any, to sign a "copyright disclaimer" for the program, if
necessary.  Here is a sample; alter the names:

  Yoyodyne, Inc., hereby disclaims all copyright interest in the program
  `Gnomovision' (which makes passes at compilers) written by James Hacker.

  &lt;signature of Ty Coon&gt;, 1 April 1989
  Ty Coon, President of Vice

This General Public License does not permit incorporating your program into
proprietary programs.  If your program is a subroutine library, you may
consider it more useful to permit linking proprietary applications with the
library.  If this is what you want to do, use the GNU Library General
Public License instead of this License.
</pre>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="group_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Группы
<!--
    <a href="/omp?cmd=get_group&amp;group_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
-->
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_GROUPS'"/>
      </xsl:call-template>

      <h1>Подробности Группы</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#group">Группе</a>.
        А конкретнее: Наименование, комментарий и входяәие в неһ полҗзователи.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'group'"/>
        <xsl:with-param name="name" select="'Группа'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="groups.html">
  <div class="gb_window_part_center">Помощь: Группы
    <a href="/omp?cmd=get_groups&amp;token={/envelope/token}"
       title="Группы" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Groups"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_GROUPS'"/>
      </xsl:call-template>

      <h1>Группы</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе 
       <a href="glossary.html?token={/envelope/token}#group">Групп</a>.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'группа'"/>
        </xsl:call-template>
      </table>

      <h3>Новая Группа</h3>
      <p>
        Для создания новой группы нажмите на
        иконку <img src="/img/new.png" alt="New Group" title="Новая Группа"/>, которая
        переведёт вас на страницу создания <a href="new_group.html?token={/envelope/token}">Новой Группы</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка групп в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Группа'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="my_settings.html">
  <div class="gb_window_part_center">Помощь: Мои Настройки
    <a href="/omp?cmd=get_my_settings&amp;token={/envelope/token}"
       title="Мои Настройки" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="My Settings"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Мои Настройки</h1>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SETTINGS'"/>
      </xsl:call-template>

      <p>
        На этой странице перечислены личные настройки текущего пользователя, такие как часовой пояс.
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Наименование параметра.</td>
        </tr>
        <tr class="even">
          <td>Значение</td>
          <td>Значение параметра. Для пароля значение заменяется последовательностью знаков '*'.</td>
        </tr>
      </table>

      <a name="edit"></a>
      <h2>Редактировать Мои Настройки</h2>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'MODIFY_SETTING'"/>
      </xsl:call-template>

      <p>
        В этой таблице представлены изменяемые настройки текущего пользователя.
      </p>

      <a name="timezone"></a>
      <h3>Часовой пояс</h3>
      <p>
        Часовой пояс, используемый текущим пользователем. Он используется в интерфейсе повсеместно, а также является часовым поясом, применяемым в отчётак по умолчанию.
      </p>
      <p>
        После указания часового пояса, проверьте время в заголовке окна GSA. Если часовой пояс указан верно, то там должно отображаться текущее время.
      </p>

      <h3>Пароль</h3>
      <p>
        Пароль для входа в GSA.
      </p>

      <h3>Язык Интерфейса Пользователя</h3>
      <p>
        Язык, используемый в интерфейсе пользователя. Если выбран пункт "Browser Language", то будет использован язык, выбранный в браузере по умолчанию.
      </p>

      <h3>Строк на Страницу</h3>
      <p>
        Количество отображаемых на странице строк по умолчанию. Может быть переопределено настройками фильтров по умолчанию.
      </p>

      <h3>Количество Строк для автоотключения Мастера</h3>
      <p>
        Число строк, после превышения которого Мастер перестанет показываться.
      </p>
      <p>
        Если число строк в списке больше указанного значения, и со списком связан Мастер,
        то он больше не будет отображаться.
      </p>

      <h3>Шаблон имени файла при экспорте Подробностей/Списков/Отчётов</h3>
      <p>
        Шаблон используется для формирования имени файла по умолчанию для экспортирования списков ресурсов, подробностей ресурсов и отчётов соответственно.
        Строка шаблона может содержать буквы, цифры, дефис, прочерк и специальные метки, которые будут замещаться следующим образом:
      </p>
      <ul>
        <li><b>%C</b> - Дата создания в виде ГГГГММДД.<br/>
        Если дата создания отсутствует, то будет вставлена текущая дата, такое
        происходит при экспорти списков ресурсов.</li>
        <li><b>%c</b> - Время создания в виде ЧЧММСС.<br/>
        Так же как и в случае с <b>%C</b>, использует текущее время.
        </li>
        <li><b>%D</b> - Текущая дата в виде ГГГГММДД.</li>
        <li><b>%F</b> - Наименование используемого формата вывода (XML для списков и типов, отличных от отчётов).</li>
        <li><b>%M</b> - Дата изменения в виде ГГГГММДД.<br/>
        Если дата изменения отсутствует, то будет вставлена дата создания или текущая дата, если дата создания так же отсутствует.
        Происходит при экспорти списков ресурсов.</li>
        <li><b>%m</b> - Время изменения в виде ЧЧММСС.<br/>
        Если время изменения отсутствует, то будет вставлена дата создания или текущая дата, так же как в <b>%M</b>.</li>
        <li><b>%N</b> - Наименование ресурса или всязанной задачи для отчёта. Если у списков и типов отсутствует наименование,
        то будет использовано наименование типа (см. <b>%T</b>).</li>
        <li><b>%T</b> - Тип ресурса, например, "task" (задача), "port_list" (список портов).
        При экспорте списков преобразуется во множественное число.</li>
        <li><b>%t</b> - Текущее время в виде ЧЧММСС.</li>
        <li><b>%U</b> - Уникальный идентификатор ресурса или "list" для списков с несколькими ресурсами.</li>
        <li><b>%u</b> - Имя текущего пользователя.</li>
        <li><b>%%</b> - Знак процента (%)</li>
      </ul>
      <a name="severity_class"/>
      <h3>Класс Важности</h3>
      <p>
        Класс важности разбивает диапазон CVSS на три группы: Высокая, Средняя и Низкая Важность.
        Такая группировка используется для окрашивания панели важности в целях облегчения идентификации
        и сравнения важности интересующих пользователя ресурсов.
      </p>
      <p>
        Возможные значения включают:
        <ul>
          <li>
            <b>Рейтинг Важности Уязвимостей NVD:</b> Национальная База Данных Уязвимостей (National Vulnerability Database, NVD)
            применяет следующую цветовую схему в своих публикуемых документах. См. также <a href="http://nvd.nist.gov/cvss.cfm">про CVSS</a> на сайте
            Национального Института Стандартов и Технологий (National Institute of Standards and Technology, NIST) правительства США.
            <ul>
              <li>Высокий: 7.0 - 10.0 </li>
              <li>Средний: 4.0 - 6.9 </li>
              <li>Низкий: 0.0 - 3.9 </li>
            </ul>
          </li>
          <li>
            <b>BSI Schwachstellenampel (Германия):</b> Немецкий Федеральный Офис Информационной Безопасности
            (Bundesamt für Sicherheit in der Informationstechnik, BSI) применяет следующую цветовую схему.
            См. также <a href="https://www.allianz-fuer-cybersicherheit.de/ACS/DE/_downloads/cybersicherheitslage/schwachstellenampel/BSI-CS_028.pdf">документ</a> BSI на немецком.
            <ul>
              <li>Высокий: 7.0 - 10.0  ("rot": kritisch)</li>
              <li>Средний: 4.0 - 6.9 ("gelb": geringfügig-kritisch)</li>
              <li>Низкий: 0.0 - 3.9 ("grün": nicht kritisch)</li>
            </ul>
          </li>
          <li>
            <b>OpenVAS Классический:</b> Применяется классическая цветовая схема OpenVAS:
            <ul>
              <li>Высокий: 5.1 - 10.0 </li>
              <li>Средний: 2.1 - 5.0 </li>
              <li>Низкий: 0.0 - 2.0 </li>
            </ul>
          </li>
          <li>
            <b>PCI-DSS:</b> Применяется следующая цветовая схема:
            <ul>
              <li>Высокий: 4.3 - 10.0 </li>
              <li>Отсутствует: 0.0 - 4.2 </li>
            </ul>
          </li>
        </ul>
      </p>

      <h3>Значения по Умолчанию для Ресурсов</h3>
      <p>
        Значения, применяемые по умолчанию, при создании различных ресурсов, таких как
        <a href="new_task.html?token={/envelope/token}">Новая Задача</a> или 
        <a href="new_target.html?token={/envelope/token}">Новая Цель</a>,
        а также в Мастерах.
      </p>
      <p>
        <b>Важное Замечание:</b> Данные значения будут влиять только на действия, осуществляемые посредством
        Greenbone Security Assistant. При использовании прямых команд 
        <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}">OMP</a>
        протокола будут использованы встроенные значения по умолчанию.
        Например, создание новой Цели через OMP без указания Списка Портов
        по умолчанию всегда будет использовать Список Портов "OpenVAS Default" вне зависимости от указанного здесь списка.
      </p>
      <h4>Уведомление по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#alert">Уведомление</a>, используемое по умолчанию.
      </p>
      <h4>Конфигурация Сканирования OpenVAS по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#config">Конфигурация Сканирования</a>, используемая при создании новых Задач со сканером OpenVAS.
      </p>
      <h4>Конфигурация Сканирования OSP по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#config">Конфигурация Сканирования</a>, используемая при создании новых Задач со сканером OSP.
      </p>
      <h4>Атрибуты доступа к SSH по умолчанию</h4>
      <p>
        Атрибуты доступа, используемые по умолчанию для доступа к системе через SSH.
      </p>
      <h4>Атрибуты доступа к SMB по умолчанию</h4>
      <p>
        Атрибуты доступа, используемые по умолчанию для доступа к системе через SMB.
      </p>
      <h4>Атрибуты доступа к ESXi по умолчанию</h4>
      <p>
        Атрибуты доступа, используемые по умолчанию для доступа к ESXi.
      </p>
      <h4>Список Портов по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#port_list">Список Портов</a>, используемый по умолчанию для новых Целей.
      </p>
      <h4>Сканер OpenVAS по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#scanner">Сканер</a> OpenVAS, используемый для новых Задач.
      </p>
      <h4>Сканер OSP по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#scanner">Сканер</a> OSP, используемый для новых Задач.
      </p>
      <h4>Расписание по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#schedule">Расписание</a>, используемое по умолчаниюдля новых Задач.
      </p>
      <h4>Подчинённый по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#slave">Подчинённый</a>, используемый по умолчанию для новых Задач.
      </p>
      <h4>Цель по умолчанию</h4>
      <p>
        <a href="glossary.html?token={/envelope/token}#target">Цель</a>, используемая по умолчанию для новых Задач.
      </p>

      <h3>Фильтры Ресурсов</h3>
      <p>
        Фильтр по умолчанию, используемый при просмотре конкретного ресурса.
        Выпадающее меню отобразит список <a href="filters.html?token={/envelope/token}">Фильтров</a>,
        совпадающих с типом ресурса. '--' означает, что никакого фильтра не будет применено.
        В этом случае будут использоваться другие настройки, такие как Строки на Страницу.
      </p>

      <h4>Фильтр Агентов</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="agents.html?token={/envelope/token}">Агентов</a>.
      </p>
      <h4>Фильтр Уведомлений</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="alerts.html?token={/envelope/token}">Уведомлений</a>.
      </p>
      <h4>Фильтр Конфигураций Сканирования</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="configs.html?token={/envelope/token}">Конфигураций Сканирования</a>.
      </p>
      <h4>Фильтр Атрибутов доступа</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="lsc_credentials.html?token={/envelope/token}">Атрибутов доступа</a>.
      </p>
      <h4>Фильтр Фильтров</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="filters.html?token={/envelope/token}">Фильтров</a>.
      </p>
      <h4>Фильтр Заметок</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="notes.html?token={/envelope/token}">Заметок</a>.
      </p>
      <h4>Фильтр Переопределений</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="overrides.html?token={/envelope/token}">Переопределений</a>.
      </p>

      <h4>Фильтр Списков Портов</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="port_lists.html?token={/envelope/token}">Списков Портов</a>.
      </p>
      <h4>Фильтр Форматов Отчётов</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="report_formats.html?token={/envelope/token}">Форматов Отчётов</a>.
      </p>
      <h4>Фильтр Расписаний</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="schedules.html?token={/envelope/token}">Расписаний</a>.
      </p>
      <h4>Фильтр Подчинённых</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="slaves.html?token={/envelope/token}">Подчинённых</a>.
      </p>
      <h4>Фильтр Тэгов</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="tags.html?token={/envelope/token}">Тэгов</a>.
      </p>
      <h4>Фильтр Целей</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="targets.html?token={/envelope/token}">Целей</a>.
      </p>
      <h4>Фильтр Задач</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="tasks.html?token={/envelope/token}">Задач</a>.
      </p>
      <h4>Фильтр CPE</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="cpes.html?token={/envelope/token}">CPE</a>.
      </p>
      <h4>Фильтр CVE</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="cves.html?token={/envelope/token}">CVE</a>.
      </p>
      <h4>Фильтр NVT</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="nvts.html?token={/envelope/token}">NVT</a>.
      </p>
      <h4>Фильтр OVAL</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="ovaldefs.html?token={/envelope/token}">Определений OVAL</a>.
      </p>
      <h4>Фильтр CERT-Bund</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="cert_bund_advs.html?token={/envelope/token}">Предупреждений CERT-Bund</a>.
      </p>
      <h4>Фильтр DFN-CERT</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении страницы <a href="dfn_cert_advs.html?token={/envelope/token}">Предупреждений DFN-CERT</a>.
      </p>
      <h4>Фильтр всей Базы Знаний</h4>
      <p>
        Фильтр, используемый по умолчанию при отображении <a href="allinfo.html?token={/envelope/token}">всей Базы Знаний</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_filter.html">
  <div class="gb_window_part_center">Помощь: Новый Фильтр
    <a href="/omp?cmd=new_filter&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_FILTER'"/>
      </xsl:call-template>

      <h1>Новый Фильтр</h1>
      <p>
        Для создания нового
        <a href="glossary.html?token={/envelope/token}#filter">Фильтра</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Фильтр" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Фильтра.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Одиночные цели</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Цели, содержащие только один узел</td>
        </tr>
        <tr class="odd">
          <td>Term</td>
          <td>--</td>
          <td>200</td>
          <td>см. <a href="/help/powerfilter.html?token={/envelope/token}">Фильтрация</a></td>
          <td><tt>ips=1 first=1 rows=-2</tt></td>
        </tr>
        <tr class="even">
          <td>Type</td>
          <td>нет</td>
          <td>--</td>
          <td>Наименование типа</td>
          <td>Цель</td>
        </tr>
      </table>

      <h4>Фильтры</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Filters" title="Фильтры"/>
       вы перейдёте на страницу <a href="filters.html?token={/envelope/token}">Фильтров</a>
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_group.html">
  <div class="gb_window_part_center">Помощь: Новая Группа
    <a href="/omp?cmd=new_group&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_GROUP'"/>
      </xsl:call-template>

      <h1>Новая Группа</h1>
      <p>
        Для создания новой
        <a href="glossary.html?token={/envelope/token}#group">Группы</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Группу" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Группы.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Группа тестирования</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Все тестировщики</td>
        </tr>
        <tr class="odd">
          <td>Пользователи</td>
          <td>--</td>
          <td>1000</td>
          <td>Перечень входящих в группу пользователей, разделённых пробелом или запятой</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>Группы</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Groups" title="Группы"/>
       вы перейдёте на страницу <a href="groups.html?token={/envelope/token}">"Группы"</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_note.html">
  <div class="gb_window_part_center">Помощь: Новая Заметка
    <a href="/omp?cmd=new_note&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_NOTE'"/>
      </xsl:call-template>

      <h1>Новая Заметка</h1>
      <p>
       Для создания новой заметки необходимо заполнить ниже перечисленные поля.
       Внизу, после полей, приведены подробности результата, который может быть ассоциирован с этой заметкой.
       Нажмите кнопку "Создать Заметку" для сохранения изменений.
       В результате вы перейдёте на страницу Подробностей Заметки.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>NVT OID</td>
          <td>да</td>
          <td>--</td>
          <td>OID</td>
          <td>1.3.6.1.4.1.25623.1.0.10263</td>
        </tr>
        <tr class="even">
          <td>Активно</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + Число (вторая селективная опция)</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Узлы</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + указание Перечня Узлов (вторая селективная опция)</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Порт</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + указание Порта (вторая селективная опция)</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Важность</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Задача</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + выбор Задачи</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Результат</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + указание UUID</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Текст</td>
          <td>да</td>
          <td>600</td>
          <td>Собственно заметка в свободной форме</td>
          <td>Этот вопрос будет снят как только мы перейдём на GNU/Hurd.</td>
        </tr>
      </table>

      <h4>Заметки</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Notes" title="Заметки"/>
       вы перейдёте на страницу Заметки.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_override.html">
  <div class="gb_window_part_center">Помощь: Новое Переопределение
    <a href="/omp?cmd=new_override&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_OVERRIDE'"/>
      </xsl:call-template>

      <h1>Новое Переопределение</h1>
      <p>
       Для создания нового переопределения необходимо заполнить ниже перечисленные поля.
       Внизу, после полей, приведены подробности результата, который может быть ассоциирован с этим переопределением.
       Нажмите кнопку "Создать Переопределение" для сохранения изменений.
       В результате вы перейдёте на страницу Подробностей Переопределения.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>NVT OID</td>
          <td>да</td>
          <td>--</td>
          <td>OID</td>
          <td>1.3.6.1.4.1.25623.1.0.10263</td>
        </tr>
        <tr class="even">
          <td>Активно</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + Число (вторая селективная опция)</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Узлы</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + указание Перечня Узлов (вторая селективная опция)</td>
          <td>192.168.0.123</td>
        </tr>
        <tr class="even">
          <td>Порт</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + указание Порта (вторая селективная опция)</td>
          <td>22/tcp</td>
        </tr>
        <tr class="odd">
          <td>Важность</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Новая Важность</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + Выбор (вторая селективная опция) или указание важности в числовом (CVSS) виде (третья селективная опция)</td>
          <td>7.5</td>
        </tr>
        <tr class="odd">
          <td>Задача</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + Выбор (вторая селективная опция)</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Результат</td>
          <td>да</td>
          <td>--</td>
          <td>Селективная кнопка + UUID (вторая селективная опция)</td>
          <td>bb062bc9-4a61-45c2-af26-135e74be2f66</td>
        </tr>
        <tr class="odd">
          <td>Текст</td>
          <td>да</td>
          <td>600</td>
          <td>Комментарий в свободной форме отностительно этого переопределения, добавляется в отчёт</td>
          <td>Этот вопрос будет снят как только мы перейдём на GNU/Hurd.</td>
        </tr>
      </table>

      <h4>Переопределения</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Overrides" title="Переопределения"/>
       вы перейдёте на страницу Переопределений.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_role.html">
  <div class="gb_window_part_center">Помощь: Новая Роль
    <a href="/omp?cmd=new_role&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_ROLE'"/>
      </xsl:call-template>

      <h1>Новая Роль</h1>
      <p>
        Для создания новой
        <a href="glossary.html?token={/envelope/token}#role">Роли</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Роль" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Роли.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Группа Тестирования</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Все тестеры</td>
        </tr>
        <tr class="odd">
          <td>Users</td>
          <td>--</td>
          <td>1000</td>
          <td>Перечень входящих в группу пользователей, разделённых пробелом или запятой</td>
          <td>alice bob</td>
        </tr>
      </table>

      <h4>Роли</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Roles" title="Роли"/>
       вы перейдёте на страницу <a href="roles.html?token={/envelope/token}">Ролей</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_scanner.html">
  <div class="gb_window_part_center">Помощь: Новый Сканер
    <a href="/omp?cmd=new_scanner&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_SCANNER'"/>
      </xsl:call-template>

      <h1>Новый Сканер</h1>
      <p>
        Для создания нового
        <a href="glossary.html?token={/envelope/token}#scanner">Сканера</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Сканер" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Сканера.
      </p>
      <p>
        Сертификат УЦ: Сертификат УЦ это сертификат удостоверяющего центра, которым подписан сертификат, предоставленый Сканером.
        Он используется Менеджером для проверки аутентичности удалённого узла.
      </p>
      <p>
        Сертификат: Сертификат, используемый для аутентификации Сканера. Должен быть подписан Сертификатом УЦ, чтобы Сканер смог удостовериться, что
        устанавливаемое Менеджером соединение является авторизованным клиентским соединением.
      </p>
      <p>
        Закрытый Ключ: Закрытый Ключ от Сертификата, который будет использован в процессе аутентификации у Сканера.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150"></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Сканер OSP w3af</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Запись для взаимодействия со сканером OSP w3af</td>
        </tr>
        <tr class="odd">
          <td>Узел</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>192.168.3.200</td>
        </tr>
        <tr class="even">
          <td>Порт</td>
          <td>да</td>
          <td>80</td>
          <td>Integer</td>
          <td>1234</td>
        </tr>
        <tr class="odd">
          <td>Тип</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td>OSP Scanner</td>
        </tr>
        <tr class="even">
          <td>Сертификат УЦ</td>
          <td>да</td>
          <td>--</td>
          <td>Файл</td>
          <td>/usr/var/lib/openvas/CA/cacert.pem</td>
        </tr>
        <tr class="odd">
          <td>Сертификат</td>
          <td>да</td>
          <td>--</td>
          <td>Файл</td>
          <td>/usr/var/lib/openvas/CA/clientcert.pem</td>
        </tr>
        <tr class="even">
          <td>Закрытый Ключ</td>
          <td>да</td>
          <td>--</td>
          <td>Файл</td>
          <td>/usr/var/lib/openvas/private/CA/clientkey.pem</td>
        </tr>
      </table>

      <h4>Сканеры</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Scanners" title="Сканеры"/>
       вы перейдёте на страницу Сканеров.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_tag.html">
  <div class="gb_window_part_center">Помощь: Новый Тэг
    <a href="/omp?cmd=new_tag&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_TAG'"/>
      </xsl:call-template>

      <h1>Новый Тэг</h1>
      <p>
Для создания нового Агента необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Агента" для сохранения изменений. В результате вы перейдёте на страницу со списком Агентов. 
        Для создания нового 
        <a href="glossary.html?token={/envelope/token}#tag">Тэга</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Тэг" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Тэга.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы, цифры и -_,: \./</td>
          <td>geo:long</td>
        </tr>
        <tr class="even">
          <td>Значение</td>
          <td>нет</td>
          <td>200</td>
          <td>Буквы, цифры и -_, \./</td>
          <td>50.231</td>
        </tr>
        <tr class="odd">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы, цифры и -_;'äüöÄÜÖß, \./</td>
          <td>Долгота целей</td>
        </tr>
        <tr class="even">
          <td>Связано с Типом</td>
          <td>--</td>
          <td>--</td>
          <td>Тип ресурса</td>
          <td>Цель</td>
        </tr>
        <tr class="odd">
          <td>Связано с ID</td>
          <td>нет</td>
          <td>--</td>
          <td>Либо пустое, либо действительный идентификатор существующего ресурса</td>
          <td>12508a75-e1f9-4acd-85b9-d1f3ea48db37</td>
        </tr>
        <tr class="even">
          <td>Активно</td>
          <td>--</td>
          <td>--</td>
          <td>Да или Нет.</td>
          <td>Да</td>
        </tr>
      </table>

      <h4>Тэги</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Tags" title="Тэги"/>
       вы перейдёте на страницу Тэгов.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_target.html">
  <div class="gb_window_part_center">Помощь: Новая Цель
    <a href="/omp?cmd=new_target&amp;max=-2&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_TARGET'"/>
      </xsl:call-template>

      <h1>Новая Цель</h1>
      <p>
        Для создания новой
        <a href="glossary.html?token={/envelope/token}#target">Цели</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Цель" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Цели.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150"></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Промежуточные web серверы</td>
        </tr>
        <tr class="even">
          <td>Узлы: Указаные</td>
          <td>--</td>
          <td>200</td>
          <td>Перечень наименований и/или IP адресов узлов сети, разделённых запятыми.</td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="odd">
          <td>Узлы: Из файла</td>
          <td>--</td>
          <td>--</td>
          <td>
            Файл, содержащий перечень наименований и/или IP адресов узлов сети, разделённых запятыми, может содержать несколько строк.
          </td>
          <td><tt>192.168.1.23,192.168.1.2/31, webserv1.mycompany.tld</tt></td>
        </tr>
        <tr class="even">
          <td>Исключить Узлы</td>
          <td>--</td>
          <td>200</td>
          <td>Заполняется так же, как в Узлах.</td>
          <td><tt>192.168.1.23, 192.168.1.125, webbackup.mycompany.tld</tt></td>
        </tr>
        <tr class="odd">
          <td>Только адреса, отвечающие на обратный запрос DNS</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td>Да (Сканировать только узлы, адрес которых преобразуется в имя DNS.)</td>
        </tr>
        <tr class="even">
          <td>Объединить данные обратных запросов DNS</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td>да (Избавиться от дубликатов узлов на основе имён, полученных обратными запросами DNS.)</td>
        </tr>
        <tr class="odd">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td>Включает обе наши промежуточные веб системы</td>
        </tr>
        <tr class="even">
          <td>
            Список Портов
            <xsl:if test="not (gsa:may-op ('get_port_lists'))">*</xsl:if>
          </td>
          <td>да</td>
          <td>--</td>
          <td>Любой из <a href="port_lists.html?token={/envelope/token}">настрокенных списков портов</a>.</td>
          <td>All privileged TCP</td>
        </tr>
        <tr class="odd">
          <td>
            Атрибуты доступа SSH
            <xsl:if test="not (gsa:may-op ('get_lsc_credentials'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>--</td>
          <td>Любые из <a href="lsc_credentials.html?token={/envelope/token}">настроенных атрибутов доступа</a>.</td>
          <td>Security Scan Account for SSH</td>
        </tr>
        <tr class="even">
          <td>
            Порт SSH
            <xsl:if test="not (gsa:may-op ('get_lsc_credentials'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>400</td>
          <td>Номер порта.</td>
          <td>22</td>
        </tr>
        <tr class="odd">
          <td>
            Атрибуты доступа SMB
            <xsl:if test="not (gsa:may-op ('get_lsc_credentials'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>--</td>
          <td>Любые из <a href="lsc_credentials.html?token={/envelope/token}">настроенных атрибутов доступа</a>.</td>
          <td>Security Scan Account for SMB</td>
        </tr>
        <tr class="even">
          <td>
            Атрибуты доступа ESXi
            <xsl:if test="not (gsa:may-op ('get_lsc_credentials'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>--</td>
          <td>Любые из <a href="lsc_credentials.html?token={/envelope/token}">настроенных атрибутов доступа</a>.</td>
          <td>Security Scan Account for ESXi</td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_port_lists')) or not (gsa:may-op ('get_lsc_credentials'))">
        <b>*</b> недоступны в текущем сеансе связи с Сервером OMP.
      </xsl:if>

      <xsl:call-template name="hosts_note_ru"/>

      <h4>Цели</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Targets" title="Цели"/>
       вы перейдёте на страницу Целей.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_task.html">
  <div class="gb_window_part_center">Помощь: Новая Задача</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=new_task&amp;overrides=1&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_TASK'"/>
      </xsl:call-template>

      <h1>Новая Задача</h1>

      <p>
        Для создания 
        <a href="glossary.html?token={/envelope/token}#task">задачи</a>,
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Задачу" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Задачи
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Цели Сканирования</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td>Localhost</td>
        </tr>
        <tr class="even">
          <td>
            Уведомления
            <xsl:if test="not (gsa:may-op ('get_alerts'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>---</td>
          <td>Выбор</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>
            Расписание
            <xsl:if test="not (gsa:may-op ('get_schedules'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>---</td>
          <td>Выбор</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Добавить результаты в Управление Активами</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Изменяемая Задача</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Scanner: OpenVAS Scanner</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Конфигурация Сканирования</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td>Full and fast</td>
        </tr>
        <tr class="even">
          <td>
            Подчинённый
            <xsl:if test="not (gsa:may-op ('get_slaves'))">*</xsl:if>
          </td>
          <td>нет</td>
          <td>---</td>
          <td>Выбор</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Исходящий Сетевой Интерфейс</td>
          <td>нет</td>
          <td>---</td>
          <td>Буквы и цифры</td>
          <td>eth1</td>
        </tr>
        <tr class="even">
          <td>Порядок целевых узлов</td>
          <td>нет</td>
          <td>---</td>
          <td>Выбор</td>
          <td>Последовательный</td>
        </tr>
        <tr class="odd">
          <td>Максимальное количество одновременно исполняемых NVT на узел</td>
          <td>нет</td>
          <td>10</td>
          <td>Число</td>
          <td>2</td>
        </tr>
        <tr class="even">
          <td>Максимальное количество одновременно сканируемых узлов</td>
          <td>нет</td>
          <td>10</td>
          <td>Число</td>
          <td>10</td>
        </tr>
        <tr class="odd">
          <td>Scanner: OSP Scanner</td>
          <td>да</td>
          <td>---</td>
          <td>Выбор</td>
          <td></td>
        </tr>
      </table>
      <xsl:if test="not (gsa:may-op ('get_alerts')) or not (gsa:may-op ('get_schedules')) or not (gsa:may-op ('get_slaves')) or not (gsa:may-op ('get_groups'))">
        <b>*</b> недоступны в текущем сеансе связи с Сервером OMP.
      </xsl:if>

      <h1>Новая Задача-Контейнер</h1>

      <p>
       Для создания новой <a href="glossary.html?token={/envelope/token}#task">Задачи-Контейнера</a>
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Задачу" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Задачи.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>Rome</td>
        </tr>
        <tr class="even">
          <td>Комментарий</td>
          <td>нет</td>
          <td>400</td>
          <td>Буквы и цифры</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Отчёт</td>
          <td>да</td>
          <td>--</td>
          <td>Файл</td>
          <td>/tmp/report.xml</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="new_user.html">
  <div class="gb_window_part_center">Помощь: Новый Пользователь
    <a href="/omp?cmd=new_user&amp;token={/envelope/token}">
      <img src="/img/new.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'CREATE_USER'"/>
      </xsl:call-template>

      <h1>Новый Пользователь</h1>
      <p>
        Для создания нового пользователя
        необходимо заполнить ниже перечисленные поля и нажать кнопку "Создать Пользователя" для сохранения изменений.
        В результате вы перейдёте на страницу Подробностей Пользователя.
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Обязательно заполнить</td>
          <td>Максимальная длина поля</td>
          <td>Синтакс</td>
          <td>Пример заполнения</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>да</td>
          <td>80</td>
          <td>Буквы и цифры</td>
          <td>jsmith</td>
        </tr>
        <tr class="even">
          <td>пароль</td>
          <td>да *</td>
          <td>40</td>
          <td>Jskl#@#2jlasjf</td>
          <td></td>
        </tr>
        <tr class="odd">
          <td>Роли</td>
          <td>нет</td>
          <td>---</td>
          <td>Выбор</td>
          <td>User</td>
        </tr>
        <tr class="even">
          <td>Доступ к Узлам</td>
          <td>да</td>
          <td>---</td>
          <td>"Разрешить всё и запретить:" или "Запретить всё и разрешить:" с дополнительным заполнением поля</td>
          <td>"Запретить всё и разрешить:"  "<tt>192.168.13.2/31,192.168.14.12</tt>"</td>
        </tr>
        <tr class="even">
          <td>Доступ к Интерфейсам</td>
          <td>да</td>
          <td>---</td>
          <td>"Разрешить всё и запретить:" или "Запретить всё и разрешить:" с дополнительным заполнением поля</td>
          <td>"Разрешить всё и запретить:"  "<tt>eth0,eth2,eth3</tt>"</td>
        </tr>
      </table>
      <p>
        Если настроена аутентификации в LDAP отдельных пользователей, появится дополнительный столбец
        ("Разрешить только LDAP-Аутентификацию") с устанавливаемым флажком. Если флажок для конкретного пользователя установлен, 
        пользователь сможет аутентифицироваться только через указанный LDAP сервер.
      </p>
      <p>
        * При использовании LDAP-Аутентификации заполнение поля пароля не является обязательным.
      </p>
      <p>
       Касательно <b>Доступа к Узлам</b>: Вы можете выбрать правило "Разрешить всё и запретить:" или "Запретить всё и разрешить:", а в текстовом поле указать
       перечень <b>Узлов</b> для него.
       <xsl:call-template name="hosts_note_ru"/>
      </p>
      <p>
       Касательно <b>Доступа к Интерфейсам</b>: Вы можете выбрать правило "Разрешить всё и запретить:" или "Запретить всё и разрешить:", а в текстовом поле указать
       перечень сетевых интерфейсов через запятую.
      </p>
      <p>
       Касательно <b>Ролей</b>:
      </p>
      <p>
       Вы можете выбрать любую Роль из списка <a href="roles.html?token={/envelope/token}">Ролей</a>
       за исключением Супер Администратора. Состав системы входит 
       <a href="roles.html?token={/envelope/token}#predefined">набор Ролей, поставляемых по умолчанию</a>.
      </p>
      <p>
       Одному пользователю можно назначить несколько Ролей, таким образом его права
       будут суммой всех прав назначенных ему Ролей. Например, если Пользователю назначены Роли
       "Info" и "Monitor", то он сможет просматривать и Базу Знаний, и системные отчёты.
      </p>


      <a name="peruserldapauthentication"></a>
      <h2>Аутентификация в LDAP отдельных Пользователей</h2>
      <p>
       Эта настройка появляется только если система
       поддерживает аутентификацию в LDAP отдельных Пользователей.
      </p>
      <p>
       Изменения будут сохранены при нажатии на кнопку "Сохранить",
       но <b>вступят в силу только после</b> перезапуска системы.
      </p>
      <p>
       Даже в случае аутентификации в LDAP, правила доступа к узлам и интерфейсам задаются и хранятся локально.
      </p>
      <table class="gbntable">
        <tr class="gbntablehead2">
          <td></td>
          <td>Описание</td>
          <td>Пример</td>
        </tr>
        <tr class="odd">
          <td>Задействовать</td>
          <td>Использовать или нет аутентификацию в LDAP.</td>
          <td></td>
        </tr>
        <tr class="even">
          <td>Сервер LDAP</td>
          <td>Имя или IP адрес с необязательным указанием порта сервера LDAP.
              Если порт не указан, будет использован порт LDAP сервиса по умолчанию 389.</td>
          <td>ldap.example.com:389</td>
        </tr>
        <tr class="odd">
          <td>Аутентификационный DN</td>
          <td>Уникальное имя (DN) в дереве LDAP для аутентификации пользователей.
              В месте подстановки имени пользователя используйте %s.</td>
          <td>Обычный LDAP:<br/>
              uid=%s,cn=users,o=center,d=org<br/>
              <br/>
              Active Directory:<br/>
              %s@mydomain<br/>
              или<br/>
              mydomain\%s</td>
        </tr>
      </table>

      <h4>Пользователи</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Users" title="Пользователи"/>,
       вы перейдёте на страницу <a href="users.html?token={/envelope/token}">Пользователи</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="note_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Заметки
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_NOTES'"/>
      </xsl:call-template>

      <h1>Подробности Заметки</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#note">Заметке</a>.
        Сюда входят: NVT, время создания, время изменения, условия применения заметки и полный текст.
      </p>
      <p>
       Если нажать на имя NVT, то вы перейдёте на страницу подробностей NVT.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'note'"/>
        <xsl:with-param name="name" select="'Заметка'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="notes.html">
  <div class="gb_window_part_center">Помощь: Заметки
    <a href="/omp?cmd=get_notes&amp;token={/envelope/token}"
       title="Заметки" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Notes"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_NOTES'"/>
      </xsl:call-template>

      <a name="notes"></a>
      <h1>Заметки</h1>
      <p>
       В данной таблице приведён перечень всех 
       <a href="glossary.html?token={/envelope/token}#note">заметок</a>
        и отмечены важные особенности каждой из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>
            Имя NVT, к которому относится заметка. Если оно слишком длинное и не влезает в отведённую ширину колонки, то оно будет обрезано.
            <br/>
            <div>
              Справа в это колонке может появиться значёк:
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.png"
                         border="0"
                         alt="Note owned by Sally"
                         title="Заметка принадлежит Sally"/>
                  </td>
                  <td>
                    Заметка принадлежит другому пользователю.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr>
          <td>Текст</td>
          <td>Отрывок из начала заметки. Если заметка стала "бесхозной", т.к. задача, с которой она была связана, удалена, тогда появляется надпись <b>Бесхозный</b> перед отрывком.
          </td>
        </tr>
      </table>

      <h3>Новая Заметка</h3>
      <p>
        Для создания новой заметки нажмите на
        иконку <img src="/img/new.png" alt="New Note" title="Новая Заметка"/>, которая
        переведёт вас на страницу создания <a href="new_note.html?token={/envelope/token}">Новой Заметки</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка заметок в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>
      <h4>Дополнительные Столбцы</h4>
      <p>
        Дополнительно Заметки могут быть отфильтрованы посредством конкретных полей, отображаемых на странице Подробностей Заметки. К ним относятся Узлы, Порт, Задача
        (task_name и task_uuid) и Результат.
      </p>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Заметка'"/>
      </xsl:call-template>

      <a name="editnote"></a>
      <h2>Редактирование Заметки</h2>
      <p>
       На этой странице вы можете изменить заметку. Поля такие же, как на странице создания 
       <a href="#newnote">Новой Заметки</a>.
      </p>
      <p>
       Нажмите на кнопку "Сохранить Заметку" для сохранения изменений.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="performance.html">
  <div class="gb_window_part_center">Помощь: Производительность</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_system_reports&amp;duration=86400&amp;slave_id=0&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_SYSTEM_REPORTS'"/>
      </xsl:call-template>

      <a name="performance"></a>
      <h1>Производительность</h1>
      <p>
       На этой странице представлен отчёт о производительности системы.
      </p>
      <p>
       В оригинале упоминаются какие то графики, но по факту есть отображение средней загрузки и cat /proc/meminfo.
       Сверху страницы предоставлена возможность выбора временного преиода отчёта (час, день, неделя и т.д.),
       а также возможность получить отчёт по производительности Подчинённого.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="reports.html">
  <div class="gb_window_part_center">Помощь: Отчёты
    <a href="/omp?cmd=get_reports&amp;overrides=1&amp;token={/envelope/token}"
       title="Отчёты" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Reports"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="reports"></a>
      <h1>Отчёты</h1>
      <p>
       В данной таблице приведён перечень всех созданных в системе 
       <a href="glossary.html?token={/envelope/token}#report">отчётов</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150px">Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Дата</td>
          <td>
            Показывает дату создания отчёта.
          </td>
        </tr>
        <tr class="even">
          <td>Статус</td>
          <td>Статус у отчёта может быть следующий:
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Исполняется">
                    <div class="progressbar_bar" style="width:42px;"></div>
                    <div class="progressbar_text">42 %</div>
                   </div>
                </td>
                <td>
                  В настоящий момент производится сканирование для наполнения данного отчёта, которое отработано уже на 42%.
                  Процент высчитывается от количества узлов, помноженных на количество NVT.
                  Поэтому он полностью не коррелирует с длительностью сканирования.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Запускается">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Запускается</div>
                  </div>
                </td>
                <td>
                  Задача только что запущена и готовится передать параметры сканирования в сканирующий движок.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Запрошено Удал.">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Запрошено Удал.</div>
                  </div>
                </td>
                <td>
                  Пользователь недавно удалил задачу, поэтому в настоящий момент менеджер подчищает базу данных, что занимает некоторое время, потому что удалению подлежат все отчёты,
                  связанные с удалённой задачей.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Запрошен Останов">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Запрошен Останов</div>
                  </div>
                </td>
                <td>
                  Пользователь недавно остановил задачу, поэтому в настоящий момент менеджер передал данную команду сканеру, но сканер ещё полностью не остановил сканирование.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Остановл.">
                    <div class="progressbar_bar_request" style="width:15px;"></div>
                    <div class="progressbar_text">
                      Остановл. на <xsl:value-of select="15"/> %
                    </div>
                  </div>
                </td>
                <td>
                  Пользователь остановил сканирование, которое было выполнено только на 15% в момент останова.
                  Также данный статус устанавливается, если сканирование было прервано по каким либо другим причинам, таким как внезапное отключение питания.
                  Отчёт будет находиться в таком состоянии даже если сканер и менеджер будут перезапущены, например, после перезапуска ОС.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Вн. Ошибка">
                    <div class="progressbar_bar_error" style="width:100px;"></div>
                    <div class="progressbar_text">Вн. Ошибка</div>
                  </div>
                </td>
                <td>
                  В процессе сканирования возникла ошибка.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Завершена">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Завершена</div>
                  </div>
                </td>
                <td>
                  Сканирование успешно завершено и создан отчёт. Отчёт был составлен в соответствии с целями и конфигурацией сканирования.
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <div class="progressbar_box" title="Контейнер">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Контейнер</div>
                  </div>
                </td>
                <td>
                  Отчёт является частью задачи-контейнера.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Задача</td>
          <td>Задача, по которой составляется отчёт.</td>
        </tr>
        <tr class="even">
          <td>Важность</td>
          <td>
            Интегрированная важность отчёта. Эта полоска будет окрашена в соответствии с уровнем важности, определяемым текущим 
            <a href="/help/my_settings.html?token={/envelope/token}#severity_class">Классом Важности</a>:
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (Высокий)'"/>
                    <xsl:with-param name="title" select="'High'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Красная полоска будет показана в случае, если максимальная важность попадает в диапазон "Высокой важности".
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (Средний)'"/>
                    <xsl:with-param name="title" select="'Medium'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Жёлтая полоска будет показана в случае, если максимальная важность попадает в диапазон "Средней важности".
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (Низкий)'"/>
                    <xsl:with-param name="title" select="'Low'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Голубая полоска будет показана в случае, если максимальная важность попадает в диапазон "Низкой важности".
                </td>
              </tr>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (Рег.)'"/>
                    <xsl:with-param name="title" select="'None'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Пустая полоска будет показана в случае, если не обнаружено ни одной уязвимости.
                  Возможно, какие-то NVT выдали справочную информацию, поэтому отчёт не обязательно будет пустым.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Результаты сканирования: Высокая</td>
          <td>Количество результатов с Высокой важностью.</td>
        </tr>
        <tr class="even">
          <td>Результаты сканирования: Средняя</td>
          <td>Количество результатов со Средней важностью.</td>
        </tr>
        <tr class="odd">
          <td>Результаты сканирования: Низкая</td>
          <td>Количество результатов с Низкой важностью.</td>
        </tr>
        <tr class="even">
          <td>Результаты сканирования: Рег.</td>
          <td>Количество Информационных результатов.</td>
        </tr>
        <tr class="odd">
          <td>Результаты сканирования: Ложная</td>
          <td>Количество Ложных Срабатываний.</td>
        </tr>
      </table>

      <xsl:call-template name="filtering_ru"/>

      <xsl:call-template name="sorting_ru"/>

      <a name="overrides"></a>
      <h3>Переопределения</h3>
      <p>
        По умолчанию к отчётам применяются настроенные <a href="glossary.html?token={/envelope/token}#override">переопределения</a>.
      </p>
      <p>
        Иконка переопределения указывает, применялось ли переопределение
        <img src="/img/overrides_enabled.png" alt="Overrides are Applied" title="Переопределения включены"/>
        или нет
        <img src="/img/overrides_disabled.png" alt="No Overrides" title="Отсутствуют Переопределения"/>.
        Для переключения этих режимов нажмите на иконку.
        При переключении режимов классы важности, значения важности и тренды в таблице  должны меняться.
      </p>
      <p>
        Обратите внимание, что уход с этой страницы заново включит переопределения.
      </p>

      <a name="actions"></a>
      <h3>Действия</h3>

      <h4>Delta</h4>
      <p>
        Нажав на иконку 
        <img src="/img/delta.png" alt="Compare" title="Сравнить"/>, вы пометите отчёт для сравнения.
      </p>

      <p>
        Серая(неактивная) иконка сравнения
        <img src="/img/delta_inactive.png" border="0" alt="Compare"/>
        покажет, что отчёт отобран для сравнения.
      </p>

      <p>
        Нажав на другую иконку 
        <img src="/img/delta_second.png" alt="Compare" title="Сравнить"/>, вы запустите
        процесс сравнения между выбранным и только что указанным отчётами.
      </p>

      <p>
        Операции сравнения доступны только в случае отображения отчётов, принадлежащих одной задаче.
        В противном случае иконка сравнения остаётся серой (неактивной).
      </p>

      <h4>Удалить Отчёт</h4>
      <p>
        Нажав на иконку удаления <img src="/img/delete.png" alt="Delete" title="Delete"/>, вы удалите отчёт, а перечень отчётов будет обновлён.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template name="solution-types_ru">
  <p>
    <b><img src="/img/st_workaround.png"/> Workaround:</b> Существует описание конфигурации или сценария специальной установки, которое может быть использовано для
       прикрытия уязвимости. Временное решение может отсутствовать, либо иметь один и более вариантов. Обычно это является "первой линией обороны" от новой уязвимости, до тех пор, пока
       не обнаружат способ снижения значимости уязвимости или производитель не выпустит исправление продукта.
  </p>
  <p>
    <b><img src="/img/st_mitigate.png"/> Mitigation:</b> Существует описание конфигурации или сценария специальной установки, которое может быть использовано для
       снижения риска от эксплуатации уязвимости, но полностью не решает проблему с уязвимостью в затронутых продуктах. Снижение значимости может обеспечиваеться установкой устройств или контроля доступа, являющихся внешними по отношению к затронутому продукту. Не всегда информация о снижении значимости выпускается производителем затронутого продукта, так же как и не всегда оэта информация официально утверждается производителем.
  </p>
  <p>
    <b><img src="/img/st_vendorfix.png"/> VendorFix:</b> Существует официальное исправление от производителя затронутого продукта. Если не указано отдельно, подразумевается, что исправление полностью устраняет уязвимость.
  </p>
  <p>
    <b><img src="/img/st_nonavailable.png"/> NoneAvailable:</b> В настоящий момент решение проблемы отсутствует. В сообщении должно содержаться объяснение отсутствия решения проблемы.
  </p>
  <p>
    <b><img src="/img/st_willnotfix.png"/> WillNotFix:</b> Исправления для этой уязвимости нет и не предвидится. Это обычно происходит в случае заброшенных продуктов, старых версий с оконценным жизненным циклом и другими в той или иной мере не поддерживаемыми продуктами. В сообщении должно содержаться объяснение отсутствия решения проблемы.
  </p>
</xsl:template>

<xsl:template mode="help" match="results.html">
  <div class="gb_window_part_center">Помощь: Результаты
    <a href="/omp?cmd=get_results&amp;overrides=1&amp;token={/envelope/token}"
       title="Results" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Results"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="results"></a>
      <h1>Результаты</h1>
      <p>
       В данной таблице приведён перечень всех полученных
       <a href="glossary.html?token={/envelope/token}#result">результатов</a>,
       и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td width="150px">Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Уязвимость</td>
          <td>
            Наименование NVT, от которого получен этот результат.
            Нажав на него, вы перейдёте на страницу с <a href="result_details.html?token={/envelope/token}">Подробностями Результата</a>.
          </td>
        </tr>
        <tr class="even">
          <td>Тип Решения (<img src="/img/solution_type.png" alt="Solution type" title="Тип Решения"/>)</td>
          <td>
            Какой вариант решения проблемы с данной уязвимостью существует.<br/><br/>
            <xsl:call-template name="solution-types_ru"/>
          </td>
        </tr>
        <tr class="odd">
          <td>Важность</td>
          <td>
            CVSS рейтинг важности результата.
          </td>
        </tr>
        <tr class="even">
          <td>QoD</td>
          <td>
            Выраженная в процентах точность обнаружения (QoD) результата.
            За более подробной информацией обратитесь к статье
            <a href="qod.html?token={/envelope/token}">Помощь: Точность обнаружения (QoD)</a>.
          </td>
        </tr>
        <tr class="odd">
          <td>Узел</td>
          <td>
            IP адрес узла, с которым связан результат.
          </td>
        </tr>
        <tr class="even">
          <td>Где обнаружено</td>
          <td>
            Сетевой порт, с которым связан результат, или подсистема.
          </td>
        </tr>
        <tr class="odd">
          <td>Создано</td>
          <td>
            Дата и время получения результата.
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="overrides"></a>
      <h3>Переопределения</h3>
      <p>
        По умолчанию применяются настроенные в системе <a href="glossary.html?token={/envelope/token}#override">переопределения</a>.
      </p>
      <p>
        Иконка переопределения указывает, применялось ли переопределение
        <img src="/img/overrides_enabled.png" alt="Overrides are Applied" title="Переопределения включены"/>
        или нет
        <img src="/img/overrides_disabled.png" alt="No Overrides" title="Отсутствуют Переопределения"/>.
        Для переключения этих режимов нажмите на иконку.
        При переключении режимов классы важности, значения важности и тренды в таблице  должны меняться.
      </p>
      <p>
        Обратите внимание, что уход с этой страницы заново включит переопределения.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="trashcan.html">
  <div class="gb_window_part_center">Помощь: Корзина</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_trash&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

<!--
Не переведено, потому что отображается другой блок с тем же содержимым
-->
      <br/>
      <h1>Корзина</h1>
      <p>
        This page lists all resources that are currently in the trashcan.
        The listing is grouped by resource type.
        There is a summary table at the top of the page with item counts
        and links into the groups.
      </p>

      <a name="actions"></a>
      <h3>Действия</h3>

      <h4>Удалить</h4>
      <p>
       Pressing the delete icon <img src="/img/delete.png" alt="Delete" title="Delete"/> will
       remove the resource entirely from the system, immediately.  The
       trashcan will be updated.  The icon will be greyed out
       <img src="/img/delete_inactive.png" alt="Delete" title="Delete"/>
       when some other resource in the trashcan depends on the resource.
      </p>

      <h4>Восстановить</h4>
      <p>
       Pressing the restore icon
       <img src="/img/restore.png" alt="Restore" title="Restore"/>
       will move the resource out of the trashcan and back into normal
       operation.  The trashcan will be updated.  The icon will be greyed out
       <img src="/img/restore_inactive.png" alt="Restore" title="Restore"/>
       when the resource depends on some other resource that
       is in the trashcan.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cvss_calculator.html">
  <div class="gb_window_part_center">Помощь: Калькулятор CVSS
      <a href="/omp?cmd=cvss_calculator&amp;token={/envelope/token}">
        <img src="/img/new.png" title="CVSS Calculator" alt="Калькулятор CVSS"/>
      </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <a name="cvss_calculator"></a>
      <h1>Калькулятор CVSS</h1>
      <p>
        На этой странице представлен лёгкий в использовании калькулятор базового
        рейтинга <a href="glossary.html?token={/envelope/token}#cvss">CVSS</a>.
      </p>
      <h3>Расчёт Из Метрик</h3>
      <p>
        Вы можете выбрать значения Базовых Метрик CVSS из выпадающих меню.
        <ul>
          <li>
            <b>Access Vector (Вектор Доступа):</b> Определяет способ эксплуатации уязвимости.
          </li>
          <li>
            <b>Access Complexity (Сложность Доступа):</b> Определяет сложность эксплуатации уязвимости.
          </li>
          <li>
            <b>Authentication (Аутентификация):</b> Определяет, сколько раз атакующий должен аутентифицироваться, прежде чем проведёт эксплуатацию уязвимости.
          </li>
          <li>
            <b>Confidentiality (Конфиденциальность):</b> Определяет степень урона конфиденциальности информации в системе или обрабатываемой системой.
          </li>
          <li>
            <b>Integrity (Целостность):</b> Определеяет степень урона целостности атакуемой системы.
          </li>
          <li>
            <b>Availability (Доступность):</b> Определяет степень урона доступности системы.
          </li>
        </ul>
      </p>
      <h3>Расчёт из Вектора</h3>
      <p>
        Введите Базовый Вектор (например: <a href="/omp?cmd=cvss_calculator&amp;cvss_vector=AV:N/AC:M/Au:S/C:P/I:P/A:C&amp;token={/envelope/token}">AV:N/AC:M/Au:S/C:P/I:P/A:C</a>)
        в поле ввода и нажмите кнопку расчитать для расчёта Базовый Рейтинг прямо из Базового Вектора.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="override_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Переопределения
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_OVERRIDES'"/>
      </xsl:call-template>

      <h1>Подробности Переопределения</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#override">Переопределении</a>.
        А конкретнее: NVT, время создания, время изменения,
        все условия применения переопределения и полный текст переопределения. 
      </p>
      <p>
       Нажатие на имя NVT переведёт вас на страницу Подробностей NVT.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'override'"/>
        <xsl:with-param name="name" select="'Переопределение'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="overrides.html">
  <div class="gb_window_part_center">Помощь: Переопределения
    <a href="/omp?cmd=get_overrides&amp;token={/envelope/token}"
       title="Переопределения" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Overrides"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_OVERRIDES'"/>
      </xsl:call-template>

      <a name="overrides"></a>
      <h1>Переопределения</h1>
      <p>
       В данной таблице приведён перечень всех 
       <a href="glossary.html?token={/envelope/token}#override">переопределений</a>
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>
            Имя NVT, с которым связано переопределение. Если имя слишком длиное, то оно обрезается по ширине столбца.
            <br/>
            <div>
              Справа в ячейке может отображаться:
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.png"
                         border="0"
                         alt="Переопределение принадлежит Sally"
                         title=" Sally"/>
                  </td>
                  <td>
                    Переопределение принадлежит другому пользователю.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr class="even">
          <td>От</td>
          <td>Оригинальный уровень важности, к которому применяется переопределение.</td>
        </tr>
        <tr class="odd">
          <td>До</td>
          <td>Новый уровень важности, которая присваивается разделу отчёта в случае использования переопределения.</td>
        </tr>
        <tr class="even">
          <td>Текс</td>
          <td>Выдержка из начала текста, содержащегося в переопределении. Если переопределение стало бесхозным в результате удаления связанной с ним задачи,
              тогда над текстом появляется жирная надпись <b>"Бесхозный"</b>.
          </td>
        </tr>
      </table>

      <h3>Новое Переопределение</h3>
      <p>
        Для создания нового переопределения нажмите на
        иконку <img src="/img/new.png" alt="New Override" title="Новое Переопределение"/>, которая
        переведёт вас на страницу создания <a href="new_override.html?token={/envelope/token}">Нового Переопределения</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка переопределений в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>
      <h4>Дополнительные Столбцы</h4>
      <p>
        Доплнительно, таблицу Переопределений можно отфильтровать по полям, отображающимся на странице Подробностей Переопределения.
        К этим полям относятся: Узлы, Порт, Задача (task_name and task_uuid) и Результат.
      </p>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Переопределение'"/>
      </xsl:call-template>

      <a name="editoverride"></a>
      <h2>Редактирование Переопределения</h2>
      <p>
       На этой странице можно изменить переопределение. Изменяемые поля аналогичны полям на странице 
       <a href="#newoverride">Нового Переопределения</a>.
      </p>
      <p>
       Нажмите на кнопку "Сохранить Переопределение" для сохранения изменений.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="powerfilter.html">
  <div class="gb_window_part_center">Помощь: Фильтрация
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>
      <h1>Фильтрация</h1>
      <p>
        Фильтрация описывает как сократить список записей
        до меньшего числа элементов.  Фильтрация подобна поисковому запросу,
        который вы направляете в поисковый движок.
      </p>
      <p>
        По умолчанию используется фильтрация "rows=10 first=1 sort=name", что означает 
        отображать по 10 элементов на страницу, начиная с первого найденного,
        сортируя результат по колонке "Наименование".
      </p>

      <a name="examples"></a>
      <h3>Примеры</h3>
      <ul>
        <li>
          127.0.0.1
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет строка "127.0.0.1" в тексте любого столбца. К примеру, будет выведено не только 127.0.0.1, но и 127.0.0.13.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          127.0.0.1 IANA
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет строка "127.0.0.1" или "IANA" в тексте любого столбца. К примеру, будут выведены цели,
              к которым применяется список портов "All IANA assigned TCP 2012-02-10".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          127.0.0.1 and IANA
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет строка "127.0.0.1" и "IANA" в тексте любого столбца. К примеру, будут выведены цели,
              к которым применяется список портов "All IANA assigned TCP 2012-02-10" и они сканируют узел 127.0.0.1.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          "Darling Street Headquarters"
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет строка "Darling Street Headquarters" в тексте любого столбца. К примеру, будут выведены цели,
              у которых данная строка содержится в комментарии.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          regexp 10.128.[0-9]+.[0-9]+
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет строка типа IP адреса, начинающаяся с "10.128." в тексте любого столбца. К примеру, будет выведено 
              10.128.84.1 и 10.128.98.2. Таким образом используются регулярные выражения при фильтрации. 
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name=Localhost
          <ul>
            <li>
              Включит в выдачу любую запись, у которой наименование в точности совпадает с "Localhost".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name~local
          <ul>
            <li>
              Включит в выдачу любую запись, у которой наименование включает подстроку "local".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          name:^Local
          <ul>
            <li>
              Включит в выдачу любую запись, у которой наименование начинается с подстроки "Local".
              Таким образом используются регулярные выражения при фильтрации столбцов.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          port_list~TCP
          <ul>
            <li>
              Включит в выдачу любую запись, у которой список портов включает "TCP".
              Здесь показано, как ссылаться на столбец, у которого есть пробел в наименовании: заменить пробел на нижнее подчёркивание.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          modified&gt;2012-05-03 and modified&lt;2012-05-05
          <ul>
            <li>
              Включит в выдачу любую запись, которая была изменена между 2012-05-03 00:00 и 2012-05-05 00:00.
              Этот фильтр охватывает диапазон целых двух дней с третьего по четвёртое мая. При привязке времени используется текущий часовой пояс пользователя.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          created&gt;2012-05-03T13h00
          <ul>
            <li>
              Включит в выдачу любую запись, которая была создана 2012-05-03 после 13:00. Данный пример показывает длинный формат времени, включающий часы и минуты.
              При привязке времени используется текущий часовой пояс пользователя.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          rows=20 first=1 sort=name
          <ul>
            <li>
              Отобразит первые 20 записей, отсортированных по столбцу "Наименование".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          created&gt;-7d
          <ul>
            <li>
              Включит в выдачу любую запись, которая была создана в последние семь дней.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          title=
          <ul>
            <li>
              Включит в выдачу любую запись, у которой столбец "Название" пуст или отсутствует.
              Если значение недоступно, то в столбце будет стоять "Н/Д".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          =127.0.0.1
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет строка "127.0.0.1" в тексте любого столбца. К примеру, будет выведено 127.0.0.1, но не 127.0.0.13.
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          tag="geo:long=52.2788"
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет тэг "geo:long" со значением "52.2788".
            </li>
          </ul>
        </li>
      </ul>
      <ul>
        <li>
          tag~geo
          <ul>
            <li>
              Включит в выдачу любую запись, в которой будет тэг с наименованием, содержащим подстроку "geo".
              Include any item that has a tag with a name containing "geo".
            </li>
          </ul>
        </li>
      </ul>

      <a name="syntax"></a>
      <h3>Синтакс</h3>
      <p>
        Фильтрация может содержать любое количество выражений, состоящих из ключевых слов, разделённых пробелом.
        Ключевые слова нечувствительны к регистру, так что "aBc" работает так же, как "AbC".
      </p>
      <p>
        Выражения, содержащие фразы с пробелами, можно заключать в двойные кавычки "например так".
      </p>

      <h4>Ключевые слова для Столбцов</h4>
      <p>
        Ключевые слова для поиска по столбцам могут предваряться одним из следующих специальных символов:
        <ul style="list-style: none;">
          <li><b style="margin-right: 10px"><code>=</code></b> точное соответствие</li>
          <li><b style="margin-right: 10px"><code>~</code></b> содержит как подстроку</li>
          <li><b style="margin-right: 10px"><code>&lt;</code></b> меньше чем</li>
          <li><b style="margin-right: 10px"><code>&gt;</code></b> больше чем</li>
          <li><b style="margin-right: 10px"><code>:</code></b> соответствует регулярному выражению</li>
        </ul>
        Рассмотрим запрос "name=Localhost". В случае = и : ключевые слова чувствительны к регистру; во всех остальных случаях нет (как обычно).
      </p>
      <p>
        Для поиска этих спец.символов в записях, заключите шаблон поиска, содержащий их, их в двойные кавычки.
      </p>
      <p>
        Вообще, этот префикс для поиска по столбцам соответствует наименованию столбца в нижнем регистре, пробелы при этом преобразуются в символы нижнего подчёркивания.
        Таким образом шаблон поиска port_list="OpenVAS Default" осуществит фильтрацию по содержимому столбца "Список Портов".
        Обратите внимание, что подразумеваются английские наименования столбцов. В случае с русской локализацией потребуется дополнительное изучение английских наименований.
      </p>
      <p>
        На многих страницах может применяться фильтрация не только по столбцам, но и по дополнительным полям:
        <ul>
          <li>uuid -- UUID идентификатор ресурса</li>
          <li>comment -- комментарий у ресурса, обычно отображается в столбце Комментарий</li>
          <li>modified -- время последнего изменения ресурса</li>
          <li>created -- время создания ресурса.</li>
        </ul>
      </p>
      <p>
        Значение ключевого слова для столбца может быть пустым, типа "name=". Это соответствует пустым и отсутствующим значениям.
        Когда значение отсутствует, в солбце значится "Н/Д".
      </p>

      <h4>Специальные Ключевые слова</h4>
      <p>
        При употреблении ключевого слова "<b>and</b>" (и) требуется наличие двух выражений, разделяемых данным словом.
        Таким же поведением обладает ключевое слово "<b>or</b>" (или), но его применение не обязательно, так как выражения шаблона обрабатываются таким образом по умолчанию.
      </p>
      <p>
        Применение ключевого слова "<b>not</b>" (не) меняет смысл следующего ключевого слова на противоположный.
      </p>
      <p>
        При применении ключевого слова "<b>regexp</b>", следующее за ним выражение считается регулярным.
        У этого ключевого слова есть сокращённая форма "<b>re</b>".
      </p>
      <p>
        Ключевое слово "<b>rows</b>" определяет максимальное количество строк таблиц на страницах отображения ресурсов. Например, "rows=10" приведёт к оторбражению максимум 10 строк.
        Значение -1 отобразит все строки, в то время как значение -2 отобразит количество строк в соответствии со значанием из
        <a href="/help/my_settings.html?token={/envelope/token}">настроек</a> "Строк на Страницу".
      </p>
      <p>
        Ключевое слово "<b>first</b>" определяет, какая из строк таблицы будет отображена как первая.
        Например, "first=1" отобразит таблицу начиная с первой строки, а "first=5" пропустит первые 4 строки и начнёт отображение начиная с пятой.
      </p>
      <p>
        Ключевое слово "<b>sort</b>" определяет порядок сортировки при выводе таблицы.
        Например, "sort=name" будет сортировать вывод таблице по столбцу наименование.
        Обычно все столбцы и дополнительные поля типа идентификаторов UUID доступны для указания при задании сортировки.
      </p>
      <p>
        Ключевое слово "<b>sort-reverse</b>" работает также как "sort", но осуществляет сортировку в обратном порядке.
      </p>
      <p>
        Ключевое слово "<b>tag</b>" отбирает только ресурсы, имеющие тэг. Для этого нужно указать либо само слово, либо слово и значение, разделённые знаком равенства (=).
        Ни имя тэга, ни значение не должны заключаться в кавычки или разделяться каким-либо иным символом.<br/>
        Если задано и имя и значение, тогда будут отобраны только те записи, в которых оба значения совпадают с заданными.
        Если задано только имя, то будут выведены тэги с любым значением, включая тэги с отстутствующим значением.<br/>
        Ключевое слово "tag" также поддерживает отношения равенства(=), включения(~) и регулярные выражения(:). &gt; и &lt; работают аналогично отношению равенства (=).
      </p>
      <p>
        Ключевое слово "<b>owner</b>" отбирает только те ресурсы, владельцем которых является пользователь с заданным именем.
        Например, "owner=user123" отобразит записи, владельцем которых является пользователь с именем "user123".<br/>
        Если ключевое слово "owner" не задано или в качестве имени пользователя задано "any" (любой), то будут отобраны все ресурсы,
        и глобальные и принадлежащие различным пользователям.<br/>
        Чтобы отобразить только глобальные ресурсы и ресурсы, принадлежащие текущему пользователю, используйте шаблон "owner=".
      </p>
      <p>
        Ключевое слово "<b>permission</b>" отбирает только те ресурсы, к которым у пользователя есть определённые разрешения.
        Например, шаблон "permission=modify_task" на странице отображения задач выведет только те задачи, которые пользователь может изменять.<br/>
        Если ключевое слово "permission"  не задано или в качестве разрешения задано "any" (любое), то будут отобраны все ресурсы с любыми разрешениями.
      </p>

      <h4>Формат даты</h4>
      <p>
        Дата может задаваться в абсолютном или относительном выражении.
      </p>
      <p>
        Абсолютная форма выглядит как "2012-05-03T13h00", в поисковом шаблоне соответственно "modified&gt;2012-05-03T13h00".
        Указание времени является необязательным, так что можно указать и просто "2012-05-03", что будет означать 00:00 часов заданных суток.
      </p>
      <p>
        Относительные даты выражаются в виде числа квантов времени относительно текущего. Например, "-7d" означает 7 дней назад, а "3m" означает 3 минуты в будущем.
        Таким образом поисковый шаблон "created&gt;-2w" выведет все ресурсы, созданные не позднее 2х недель назад.
      </p>
      <p>
        Символы модификаторы квантов следующие:  <b>s</b> - секунда, <b>m</b> - минута, <b>h</b> - час, <b>d</b> - день, <b>w</b> - неделя, <b>M</b> - месяц и <b>y</b> - год.
        Для простоты, под месяцем подразумевается 30 дней, а за год считается 365 дней.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="task_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Задачи</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_task&amp;task_id=343435d6-91b0-11de-9478-ffd71f4c6f29&amp;overrides=1&amp;token={/envelope/token}">Отобразить страницу с примером</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_TASKS'"/>
      </xsl:call-template>

      <h1>Подробности Задачи</h1>
      <p>
      На этой странице отображаются Подробности Задачи.
      </p>
      <p>
       Показаны наименование, статус, количество отчётов, количество заметок и переопределений.
       Также указаны текущие настройки порядка сканирования узлов, исходящий сетевой интерфейс, 
       <a href="glossary.html?token={/envelope/token}#config">Конфигурация Сканирования</a>,
       <a href="glossary.html?token={/envelope/token}#target">Цель</a>,
       <a href="glossary.html?token={/envelope/token}#alert">Уведомление</a>,
       <a href="glossary.html?token={/envelope/token}#schedule">Расписание</a> и
       <a href="glossary.html?token={/envelope/token}#slave">Подчинённый</a>.
      </p>
      <p>
        Более подробная информация будет об отдельных элементах доступна, если нажать на соответствующие наименования.
        Например, нажав на количество заметок, вы перейдёте на сраницу с перечнем этих заметок.
      </p>
      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'task'"/>
        <xsl:with-param name="name" select="'Задача'"/>
      </xsl:call-template>
      <h4>Запуск Задачи</h4>
      <p>
        Для запуска задачи нажмите на иконку запуска
        <img src="/img/start.png" alt="Start Task" title="Запустить"/>.
      </p>
      <h4>Остановить Задачу</h4>
      <p>
        Для останова задачи нажмите на иконку останова
        <img src="/img/stop.png" alt="Stop Task" title="Остановить"/>. Эта иконка доступна только если задача уже запущена.
      </p>
      <h4>Продолжить Задачу</h4>
      <p>
        Для продолжения исполнения задачи после её останова, нажмите на иконку продолжения
        <img src="/img/resume.png" alt="Resume Task" title="Продолжить"/>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Конфигурации Сканирования</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <h1>Подробности Конфигурации Сканирования</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a> вместе с соответствующими параметрами настроек.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'config'"/>
        <xsl:with-param name="name" select="'Конфигурация Сканирования'"/>
      </xsl:call-template>

      <h2>Группы Проверок Сетевых Уязвимостей</h2>
      <p>
       Данная таблица содержит перечень всех выбранных NVT и Групп Проверок Сетевых Уязвимостей (NVT).
       Иконка трэнда прямо рядом с наименованием столбца Группы показывает, будут в конфигурацию автоматически включаться новые группы NVT
       ("Растёт") <img src="/img/trend_more.png" alt="Grow" title="Растёт"/> или не будут ("СТАТИЧНЫЙ") <img src="/img/trend_nochange.png" alt="Static" title="СТАТИЧНЫЙ"/>.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Группа</td>
          <td>Отображает наименование групп NVT и общее количество включённых в конфигурацию групп.</td>
        </tr>
        <tr class="even">
          <td>выбраны NVT</td>
          <td>Отображает количество NVT, включённых в текущую конфигурацию, по каждой из групп и от общего числа NVT.</td>
        </tr>
        <tr class="odd">
          <td>Трэнд</td>
          <td>Отображает Трэнд, который показывает, будут ли новые NVT из этой группы включаться в конфигурацию 
              ("Растёт") <img src="/img/trend_more.png" alt="Grow" title="Растёт"/> или нет
              ("СТАТИЧНЫЙ") <img src="/img/trend_nochange.png" alt="Static" title="СТАТИЧНЫЙ"/>.</td>
        </tr>
      </table>

      <h3>Действия</h3>

      <h4>Подробности Группы Конфигурации Сканирования</h4>
      <p>
       Нажмите на иконку подробностей <img src="/img/details.png" alt="Details" title="Подробности"/>,
       чтобы перейти на страницу с промежуточным подробным <a href="config_family_details.html?token={/envelope/token}">перечнем NVT</a> и их предпочтений.
      </p>

      <h2>Предпочтения Сканера</h2>
      <p>
       Данная таблица содержит перечень настроек сканирующего движка.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Отображает наименование Предпочтения Сканера.</td>
        </tr>
        <tr class="even">
          <td>Значение</td>
          <td>Отображает текущее значение указанного Предпочтения Сканера.</td>
        </tr>
      </table>

      <h2>Предпочтения Проверок Сетевых Уязвимостей</h2>
      <p>
       Проверки Сетевых Уязвимостей (NVT) могут обладать множеством различных настроек, которые будут влиять на проведения проверок.
       Данная таблица содержит перечень настроек в формате наименование/значение в каждой строке.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>Отображает наименование NVT.</td>
        </tr>
        <tr class="even">
          <td>Наименование</td>
          <td>Отображает наименование предпочтения для данного NVT.</td>
        </tr>
        <tr class="odd">
          <td>Значение</td>
          <td>Отображает текущее значение указанного предпочтения для данного NVT.</td>
        </tr>
      </table>

      <h3>Действия</h3>

      <h4>Подробности NVT Конфигурации Сканирования</h4>
      <p>
       Нажмите на иконку подробностей <img src="/img/details.png" alt="Details" title="Подробности"/>,
       чтобы перейти на страницу <a href="config_nvt_details.html?token={/envelope/token}">Подробности NVT Конфигурации Сканирования</a>
       с подробным описанием конкретного NVT и его предпочтений.
      </p>

      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Конфигурация Сканирования'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor.html">
  <div class="gb_window_part_center">Помощь: Редактор Конфигурации Сканирования</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <h1>Редактор Конфигурации Сканирования</h1>
      <p>
       Редактор Конфигурации Сканирования позволяет изменять все параметры <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a>.
       Сюда входит выбор перечня <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> и способа его изменения, настроек NVT, дополнительных настроек Сканера. 
      </p>
      <p>
       Обратите внимание, что изменить можно только ту Конфигурацию Сканирования, которая в текущий момент не используется какой-либо
       <a href="glossary.html?token={/envelope/token}#task">Задачей</a>.
      </p>

      <h1>Редактирование Подробностей Конфигурации Сканирования</h1>
      <p>
       На этой странице приведены наименование и комментарий для выбранной
       <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a> вместе с соответствующими конфигурационными параметрами.
       Здесь вы можете изменить любые настройки и конфигурационые параметры Конфигурации Сканирования.
      </p>
      <p>
       Обратите внимание: Для сохранения изменений необходимо нажать на кнопку "Сохранить Конфигурацию". Нажав на иконку редактирования Групп NVT
       <img src="/img/edit.png" alt="Edit" title="Редактировать"/> также приведёт к сохранению сделанных изменений.
      </p>

      <h2>Редактировать Группы Проверок Сетевых Уязвимостей</h2>
      <p>
       Данная таблица содержит перечень всех выбранных NVT и Групп NVT, а также предоставляет возможность указать, какие отдельные NVT или Группы NVT следует выбрать.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Группа</td>
          <td>Отображает наименование Группы NVT. Иконка трэнда в заголовке столбца Группы позволяет выбрать, будут в конфигурацию автоматически включаться новые группы NVT
             ("Растёт") <img src="/img/trend_more.png" alt="Grow" title="Растёт"/> или не будут ("СТАТИЧНЫЙ") <img src="/img/trend_nochange.png" alt="Static" title="СТАТИЧНЫЙ"/>.
          </td>
        </tr>
        <tr class="even">
          <td>выбраны NVT</td>
          <td>Отображает количество NVT, отобранных для запуска, к общему количеству NVT в группе.</td>
        </tr>
        <tr class="odd">
          <td>Трэнд</td>
          <td>Позволяет изменить трэнд конкретной группы. Если трэнд ("Растёт") <img src="/img/trend_more.png" alt="Grow" title="Растёт"/>, то новые NVT из группы будут
              добавляться в конфигурацию. Если он ("СТАТИЧНЫЙ") <img src="/img/trend_nochange.png" alt="Static" title="СТАТИЧНЫЙ"/>, то выбор не будет расширен автоматически.</td>
        </tr>
        <tr class="even">
          <td>Выбрать все NVT</td>
          <td>Если поставить галку в этом поле, то произойдёт выбор всех NVT в группе.</td>
        </tr>
      </table>

      <h3>Действия</h3>

      <h4>Сохранение Конфигурации и редактирование Подробностей Группы</h4>
      <p>
       Нажав на иконку редактирования <img src="/img/edit.png" alt="Edit" title="Редактировать"/>, вы сохраните внесённые изменения и перейдёте на страницу 
       <a href="config_editor_nvt_families.html?token={/envelope/token}">Редактирования Группы Конфигурации Сканирования</a>, на которой перечислены все NVT, входящие в группу и
       можно выбрать те или иные NVT для применения в тестах.
      </p>

      <h2>Редактировать Предпочтения Сканера</h2>
      <p>
       Данная таблица содержит перечень всех настроек сканирующего движка и позволяет изменять их.
       Эта опция предназначена только для опытных пользователей. Для сохранения изменений нажмите на кнопку "Сохранить Конфигурацию" после таблицы.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Отображает наименование параметра настройки Сканера.</td>
        </tr>
        <tr class="even">
          <td>Значение</td>
          <td>Отображает текущее значение указанного параметра настройки Сканера.</td>
        </tr>
      </table>

      <h2>Предпочтения Проверок Сетевых Уязвимостей</h2>
      <p>
       Проверки Сетевых Уязвимостей (NVT) могут обладать множеством различных настроек, которые будут влиять на проведения проверок.
       Данная таблица содержит перечень настроек в формате наименование/значение в каждой строке.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>NVT</td>
          <td>Отображает наименование NVT.</td>
        </tr>
        <tr class="even">
          <td>Наименование</td>
          <td>Отображает наименование предпочтения для данного NVT.</td>
        </tr>
        <tr class="odd">
          <td>Значение</td>
          <td>Отображает текущее значение указанного предпочтения для данного NVT.</td>
        </tr>
      </table>

      <h3>Действия</h3>

     <h4>Подробности NVT Конфигурации Сканирования</h4>
      <p>
       Нажмите на иконку подробностей <img src="/img/details.png" alt="Details" title="Подробности"/>,
       чтобы перейти на страницу <a href="config_nvt_details.html?token={/envelope/token}">Подробности NVT Конфигурации Сканирования</a>
       с подробным описанием конкретного NVT и его предпочтений.
      </p>

      <h4>Редактировать Подробности NVT Конфигурации Сканирования</h4>

      <p>
       Нажав на иконку редактирования <img src="/img/edit.png" alt="Edit" title="Редактировать"/>, вы перейдёте на страницу 
       <a href="config_editor_nvt.html?token={/envelope/token}">Редактировать NVT Конфигурации Сканирования</a>,
       на которой приведены Подробности NVT и его предпочтения. Здесь вы сможете поменять значения таймаута теста и другие предпочтения NVT.
      </p>

      <h2>Задачи, связанные с данной Конфигурацией</h2>
      <p>
       Перечислены задача, которые используют данную конфигурацию. Нажмите на иконку подробностей <img src="/img/details.png" alt="Details" title="Подробности"/>,
       чтобы перейти на страницу <a href="task_details.html?token={/envelope/token}">Подробности Задачи</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor_nvt_families.html">
  <div class="gb_window_part_center">Помощь: Редактор Групп NVT Конфигурации Сканирования</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <a name="editconfigfamilydetails"></a>
      <h1>Редактирование Подробностей Группы Конфигурации Сканирования</h1>
      <p>
       На этой странице представлен перечень <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>, входящих в одну группу в 
       <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a>.
      </p>

      <h2>Редактировать Проверки Сетевых Уязвимостей</h2>
      <p>
       Данная таблица содержит перечень NVT, входящих в одну группу в Конфигурации Сканирования и позволяет включать или исключать NVT, а также изменять их предпочтения и таймаут.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Отображает наименование NVT.</td>
        </tr>
        <tr class="even">
          <td>OID</td>
          <td>Отображает OID NVT.</td>
        </tr>
        <tr class="even">
          <td>Важность</td>
          <td>Отображает CVSS NVT. Большинству NVT присвоено значение важности.</td>
        </tr>
        <tr class="odd">
          <td>Таймаут</td>
          <td>Отображает текущее значение таймаута в секундах выбранного NVT (или "по умолчанию", если используется значение по умолчанию).</td>
        </tr>
        <tr class="even">
          <td>Предпочтения</td>
          <td>Отображает количество предпочтений у данного NVT.</td>
        </tr>
        <tr class="odd">
          <td>Выбранные</td>
          <td>Показывает, включен ли данный NVT в Конфигурацию Сканирования или нет и позволяет добавить или исключить его из конфигурации.</td>
        </tr>
      </table>

      <h3>Действия</h3>

      <h4>Подробности NVT</h4>
      <p>
       Нажмите на иконку подробностей <img src="/img/details.png" alt="Details" title="Подробности"/>,
       чтобы перейти на страницу <a href="config_nvt_details.html?token={/envelope/token}">Подробности NVT</a>.
      </p>

      <h4>Выбор и Редактирование NVT</h4>
      <p>
       Нажав на иконку редактирования <img src="/img/edit.png" alt="Edit" title="Редактировать"/>, вы включите NVT в Конфигурацию Сканирования и перейдёте на страницу 
       <a href="config_editor_nvt.html?token={/envelope/token}">Редактировать NVT Конфигурации Сканирования</a>, на которой вы сможете изменять предпочтения и таймаут.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_editor_nvt.html">
  <div class="gb_window_part_center">Помощь: Редактор NVT Конфигурации Сканирования</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>
      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'MODIFY_CONFIG'"/>
      </xsl:call-template>

      <h1>Редактировать NVT Конфигурации Сканирования</h1>
      <p>
       Эта страница отображает информацио об одном <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>, его предпочтительных параметрах
       в рамках <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a>.
      </p>

      <h2>Редактирование Проверки Сетевой Уязвимости</h2>

      <h3>Подробности</h3>
      <p>
       Отображает информацию, такую как наименование NVT, резюме, идентификатор OID, связь с Группой NVT и справочные ссылки.
      </p>

      <h3>Описание</h3>
      <p>
       В этом разделе предоставляется описание NVT. Оно может содержать классификацию в соответствии с Фактором Риска и предлагать решения для исправления проблем, которые могут быть
       обнаружены данным NVT.
      </p>

      <h3>Предпочтения</h3>
      <p>
       Данная таблица содержит перечень различных предпочтений и таймаута, характерных для конкретного NVT. В зависимости от типа предпочтения отображаются различные способы его указания
       (например, флажки, кнопки переключатели, текстовые поля и т.д.).
      </p>
      <p>
       Обратите внимание: После произведения любых изменений необходимо нажимать кнопку "Сохранить Конфигурацию".
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Отображает наименование предпочтения NVT.</td>
        </tr>
        <tr class="even">
          <td>Значение</td>
          <td>
            Значение предпочтения NVT в текущей Конфигурации Сканирования Scan Configuration.
            В зависимости от Типа Предпочтения отображаются соответствующие методы ввода данных.
            <br/><br/>
            Обратите внимание, что данные типа файл должны быть в кодировке UTF-8.
          </td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_family_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Группы Конфигурации Сканирования</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <a name="configfamilydetails"></a>
      <h1>Подробности Группы Конфигурации Сканирования</h1>
      <p>
       На данной странице представлен перечень <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>, входящих в одну группу в
       <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a>.
      </p>

      <h2>Network Vulnerability Tests</h2>
      <p>
       Данная таблица представляет перечент NVT, входящих в одну группу в Конфигурации Сканирования.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Отображает наименование NVT.</td>
        </tr>
        <tr class="even">
          <td>OID</td>
          <td>Отображает OID NVT.</td>
        </tr>
        <tr class="even">
          <td>Важность</td>
          <td>Отображает CVSS NVT. Большинству NVT присвоено значение важности.</td>
        </tr>
        <tr class="odd">
          <td>Таймаут</td>
          <td>Отображает текущее значение таймаута в секундах выбранного NVT (или "по умолчанию", если используется значение по умолчанию).</td>
        </tr>
        <tr class="even">
          <td>Предпочтения</td>
          <td>Отображает количество предпочтений у данного NVT.</td>
        </tr>
      </table>

      <h3>Действия</h3>

      <h4>Подробности NVT</h4>
      <p>
       Нажмите на иконку подробностей <img src="/img/details.png" alt="Details" title="Подробности"/>,
       чтобы перейти на страницу <a href="config_nvt_details.html?token={/envelope/token}">Подробности NVT</a>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="config_nvt_details.html">
  <div class="gb_window_part_center">Помощь: Подробности NVT Конфигурации Сканирования</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_CONFIGS'"/>
      </xsl:call-template>

      <h1>Подробности NVT Конфигурации Сканирования</h1>
      <p>
       На этой странице представлена информацио об одном <a href="glossary.html?token={/envelope/token}#nvt">NVT</a> и его предпочтениях в рамках 
       <a href="glossary.html?token={/envelope/token}#config">Конфигурации Сканирования</a>.
      </p>

      <h2>Проверка Сетевой Уязвимости</h2>

      <h3>Подробности</h3>
      <p>
       Отображает информацию, такую как наименование NVT, резюме, идентификатор OID, связь с Группой NVT и справочные ссылки.
       Большинству NVT присвоен рейтинг CVSS.
      </p>

      <h3>Описание</h3>
      <p>
       В этом разделе приводится описание NVT. Оно состоит из классификации риска и предложения решений проблем, которые данный NVT может обнаружить.
      </p>

      <h3>Предпочтения</h3>
      <p>
       В данной таблице приведены значения таймаута и другие специфичные для данного NVT предпочтения по одному на строку.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Отображает наименование Предпочтения NVT.</td>
        </tr>
        <tr class="even">
          <td>Значение</td>
          <td>Отображает значнеие Предпочтения NVT в заданной Конфигурации Сканирования.</td>
        </tr>
      </table>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tag_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Тэга
    <img src="/img/details.png" border="0" style="margin-left:3px;"/>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <h1>Подробности Тэга</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#tag">Тэге</a>.
        А конкретнее: Наименование, значение, комментарий, связанный с ним ресурс, активен тэг или нет, является ли он бесхозным (связан с удалённым ресурсом).
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'tag'"/>
        <xsl:with-param name="name" select="'Тэг'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="target_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Цели
    <a href="/omp?cmd=get_target&amp;target_id=b493b7a8-7489-11df-a3ec-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_TARGETS'"/>
      </xsl:call-template>

      <h1>Подробности Цели</h1>
      <p>
        Представляет подробную информацию о 
        <a href="glossary.html?token={/envelope/token}#target">Цели</a>.
        А конкретнее: Наименование, комментарий, узлы, исключаемые узлы и максимальное число одновременно сканируемых узлов.
        Если с целью ассоциированы какие-либо атрибуты доступа, они также будут отображаться. Если вы нажмёте на наименование атрибута доступа,
        то перейдёте на страницу с более подробной информацией по данным атрибутам доступа.
      </p>

      <xsl:call-template name="details-window-line-actions_ru">
        <xsl:with-param name="type" select="'target'"/>
        <xsl:with-param name="name" select="'Цель'"/>
      </xsl:call-template>
      <xsl:call-template name="object-used-by_ru">
        <xsl:with-param name="name" select="'Цель'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tags.html">
  <div class="gb_window_part_center">Помощь: Тэги
    <a href="/omp?cmd=get_tags&amp;token={/envelope/token}"
       title="Тэги" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Tags"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <h1>Тэги</h1>
      <p>
       В данной таблице приведён перечень всех 
       <a href="glossary.html?token={/envelope/token}#tag">тегов</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'тэг'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Значение</td>
          <td>Значение связанное с тэгом.</td>
        </tr>
        <tr class="odd">
          <td>Тип Ресурса</td>
          <td>Тип ресурса, с которым связан тэг.</td>
        </tr>
        <tr class="even">
          <td>Имя Ресурса</td>
          <td>Имя ресурса, с которым связан тэг, если оно есть, или идентификатор в противном случае.<br/>
          При нажатии на имя ресурса вы перейдёте на страницу с подробностями данного ресурса.
          </td>
        </tr>
        <tr class="odd">
          <td>Изменено</td>
          <td>Время, когда данный тэг был последний раз изменён.</td>
        </tr>
      </table>

      <h3>Новый Тэг</h3>
      <p>
        Для создания нового тэга нажмите на
        иконку <img src="/img/new.png" alt="New Tag" title="Новый Тэг"/>, которая
        переведёт вас на страницу создания <a href="new_tag.html?token={/envelope/token}">Нового Тэга</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка Тэгов в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Тэг'"/>
        <xsl:with-param name="showenable" select="1"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="user-tags.html">
  <div class="gb_window_part_center">Помощь: Пользовательские Тэги</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_TAGS'"/>
      </xsl:call-template>

      <h1>Пользовательские Тэги</h1>
      <p>
       Данная таблица содержит перечень всех активированных 
       <a href="glossary.html?token={/envelope/token}#tag">тэгов</a>, связанных с текущим ресурсом.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Отображает наименование тега.</td>
        </tr>
        <tr class="even">
          <td>Значение</td>
          <td>Отображает значение, связанное с тэгом.</td>
        </tr>
        <tr class="odd">
          <td>Комментарий</td>
          <td>Комментарий к тэгу.</td>
        </tr>
      </table>

      <h3>Новый Тэг</h3>
      <p>
        Для создания нового тэга, связанного с текущим ресурсом, нажмите на
        иконку <img src="/img/new.png" alt="New Tag" title="Новый Тэг"/>, которая
        переведёт вас на страницу создания <a href="new_tag.html?token={/envelope/token}">Нового Тэга</a>.
      </p>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Тэг'"/>
        <xsl:with-param name="showenable" select="1"/>
        <xsl:with-param name="noclone" select="1"/>
        <xsl:with-param name="noexport" select="1"/>
      </xsl:call-template>

      <h2>Добавить Тэг</h2>
      <p>
        При наличии Тэгов для данного ресурса или ресурса такого же типа, появится выпадающее меню &quot;Добавить Тэг&quot; над Пользовательскими Тэгами.
        После выбора тэга и ввода его значения (необязательно), новый тэг может быть слёгкостью связан с текущим ресурсом без перехода на страницу создания
        <a href="new_tag.html?token={/envelope/token}">Нового Тэга</a>, просто нажатием на иконку <img src="/img/new.png" alt="New Tag" title="Новый Тэг"/>.
        (переводчик не смог повторить)
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="targets.html">
  <div class="gb_window_part_center">Помощь: Цели
    <a href="/omp?cmd=get_targets&amp;token={/envelope/token}"
       title="Цели" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Targets"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_TARGETS'"/>
      </xsl:call-template>

      <h1>Цели</h1>
      <p>
       Данная таблица содержит перечень всех настроенных в системе <a href="glossary.html?token={/envelope/token}#target">Целей</a>.
       Каждая запись отображает набор параметров целей (Найменование, комментарий и узел).
       Если с целью ассоциированы какие-либо атрибуты доступа, то они также отображаются.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <xsl:call-template name="name-column_ru">
          <xsl:with-param name="type" select="'цель'"/>
        </xsl:call-template>
        <tr class="even">
          <td>Узлы</td>
          <td>Перечень узлов, разделённых запятой, указанных либов как наименование узла, либо как
              IP адрес.</td>
        </tr>
        <tr class="odd">
          <td>IP</td>
          <td>Количество IP адресов, получаемых после обработки перечня Узлов и исключаемых узлов.
              Это максиально возможное количество, т.к. не учтены такие особенности выполнения сканирования, 
              как сканироание только узлов с обратной зоной и объединение узлов с обратной зоной.</td>
        </tr>
        <tr class="even">
          <td>Список Портов</td>
          <td>Связанный с целью список портов, нажав на который, можно перейти на страницу с подробным описанием данного списка.</td>
        </tr>
        <tr class="odd">
          <td>Атрибуты доступа: SSH</td>
          <td>Связанные атрибуты доступа SSH, нажав на которые, можно перейти на страницу с подробным описанием данных атрибутов.</td>
        </tr>
        <tr class="even">
          <td>Атрибуты доступа: SMB</td>
          <td>Связанные атрибуты доступа SMB, нажав на которые, можно перейти на страницу с подробным описанием данных атрибутов.</td>
        </tr>
        <tr class="odd">
          <td>Атрибуты доступа: ESXi</td>
          <td>Связанные атрибуты доступа ESXi, нажав на которые, можно перейти на страницу с подробным описанием данных атрибутов.</td>
        </tr>
      </table>

      <xsl:call-template name="hosts_note_ru"/>

      <h3>Новая Цель</h3>
      <p>
        Для создания новой цели нажмите на
        иконку <img src="/img/new.png" alt="New Target" title="Новая Цель"/>, которая
        переведёт вас на страницу создания <a href="new_target.html?token={/envelope/token}">Новой Цели</a>.
      </p>

      <h3>Экспорт</h3>
      <p>
        Для экспорта списка Целей в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <xsl:call-template name="list-window-line-actions_ru">
        <xsl:with-param name="type" select="'Цель'"/>
        <xsl:with-param name="used_by" select="'Задача'"/>
      </xsl:call-template>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="tasks.html">
  <div class="gb_window_part_center">Помощь: Задачи
    <a href="/omp?cmd=get_tasks&amp;token={/envelope/token}"
       title="Задачи" style="margin-left:3px;">
      <img src="/img/list.png" border="0" alt="Tasks"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_TASKS'"/>
      </xsl:call-template>

      <a name="tasks"></a>
      <h1>Задачи</h1>
      <p>
       В данной таблице приведён перечень всех настроенных в системе 
       <a href="glossary.html?token={/envelope/token}#task">задач</a>,
        и отмечены важные особенности каждой из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>
            Отображает наименование задачи. Наименование не обязательно должно быть уникальным, так что одно наименование может встречаться несколько раз.
            Задачи различаются по внутреннему идентификатору.
            <br/>
            Если у задачи заполнено поле комментария, то он отображается в скобках под наименованием.
            <div>
              В правом углу ячейки с наименованием задачи могут встречаться следующие иконки:
              <table style="margin-left: 10px">
                <tr>
                  <td valign="top">
                    <img src="/img/alterable.png"
                         border="0"
                         alt="Task is alterable"
                         title="Задача изменяема"/>
                  </td>
                  <td>
                    Задача отмечена как изменяемая. Это означет возможность изменения отдельных настроек задачи, которые в противном случае не могут быть изменены в случае
                    наличия у задачи хотя бы одного отчёта.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/sensor.png"
                         border="0"
                         alt="Task is configured to run on slave Example Slave"
                         title="Task is configured to run on slave Example Slave"/>
                  </td>
                  <td>
                    Задача настроена на запаск на подчинённом.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/provide_view.png"
                         border="0"
                         alt="Task made visible for: user1 user2"
                         title="Задача видна: user1 user2"/>
                  </td>
                  <td>
                    Задача доступна для просмотра одному или нескольким пользователям.
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <img src="/img/view_other.png"
                         border="0"
                         alt="Observing task owned by user1"
                         title="Просматриваемая задача принадлежит user1"/>
                  </td>
                  <td>
                    Задача принадлежит другому пользователю.
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr class="even">
          <td>Статус</td>
          <td>The status of the most recent scan by the task.<br/>
              Clicking the progress bar will bring you to the current report,
              which may be incomplete depending on the status of the scan.<br/>
              The status of a task is one of these:
            <br/>
            <table>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Исполняется">
                    <div class="progressbar_bar" style="width:42px;"></div>
                    <div class="progressbar_text">42 %</div>
                   </div>
                </td>
                <td>
                  В настоящий момент производится сканирование в рамках данной задачи, которое отработано уже на 42%.
                  Процент высчитывается от количества узлов, помноженных на количество NVT.
                  Поэтому он полностью не коррелирует с длительностью сканирования.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Новая">
                    <div class="progressbar_bar_new" style="width:100px;"></div>
                    <div class="progressbar_text"><i><b>Новая</b></i></div>
                  </div>
                </td><td>
                  Только что созданная задача, которая ни разу ещё не была запущена.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Запускается">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Запускается</div>
                  </div>
                </td><td>
                  Задача только что запущена и готовится передать параметры сканирования в сканирующий движок.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Запрошено Удал.">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Запрошено Удал.</div>
                  </div>
                </td><td>
                  Пользователь недавно удалил задачу, поэтому в настоящий момент менеджер подчищает базу данных, что занимает некоторое время, потому что удалению подлежат все отчёты,
                  связанные с удалённой задачей.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Запрошен Останов">
                    <div class="progressbar_bar_request" style="width:100px;"></div>
                    <div class="progressbar_text">Запрошен Останов</div>
                  </div>
                </td><td>
                  Пользователь недавно остановил задачу, поэтому в настоящий момент менеджер передал данную команду сканеру, но сканер ещё полностью не остановил сканирование.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Остановл.">
                    <div class="progressbar_bar_request" style="width:15px;"></div>
                    <div class="progressbar_text">
                      Остановл. на <xsl:value-of select="15"/> %
                    </div>
                  </div>
                </td><td>
                  Пользователь остановил сканирование, которое было выполнено только на 15% в момент останова.
                  Также данный статус устанавливается, если сканирование было прервано по каким либо другим причинам, таким как внезапное отключение питания.
                  Отчёт будет находиться в таком состоянии даже если сканер и менеджер будут перезапущены, например, после перезапуска ОС.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Вн. Ошибка">
                    <div class="progressbar_bar_error" style="width:100px;"></div>
                    <div class="progressbar_text">Вн. Ошибка</div>
                  </div>
                </td><td>
                  В процессе сканирования при выполнении задачи возникла ошибка. Последний отчёт может быть неполным или вообще отсутствовать. В последнем случае новейший отчёт,
                  который можно просматривать, будет на самом деле от предыдущего сканирования.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Завершена">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Завершена</div>
                  </div>
                </td><td>
                  Сканирование успешно завершено и создан отчёт. Отчёт был составлен в соответствии с целями и конфигурацией сканирования.
              </td></tr>
              <tr><td valign="top">
                  <div class="progressbar_box" title="Контейнер">
                    <div class="progressbar_bar_done" style="width:100px;"></div>
                    <div class="progressbar_text">Контейнер</div>
                  </div>
                </td>
                <td>
                  Задача является задачей-контейнером.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr class="odd">
          <td>Отчёты: Всего</td>
          <td>Общее количество отчётов, которое было создано за время запусков данной задачи. Первое число показывает количество завершённых отчётов, в скобках указано общее число
              отчётов, включая незавершённые.<br/>
              Нажав на одно из чисел, вы перейдёте к соответствующему списку отчётов.</td>
        </tr>
        <tr class="even">
          <td>Отчёты: Последний</td>
          <td>Дата, когда был создан последний завершённый отчёт у текущей задачи. Вы можете перейти к отчёту, нажав на дату.</td>
        </tr>
        <tr class="odd">
          <td>Важность</td>
          <td>
            Интегрированная важность последнего отчёта. Эта полоска будет окрашена в соответствии с уровнем важности, определяемым текущим 
            <a href="/help/my_settings.html?token={/envelope/token}#severity_class">Классом Важности</a>:
            <br/>
            <table>
              <tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'8.0'"/>
                    <xsl:with-param name="extra_text" select="' (Высокий)'"/>
                    <xsl:with-param name="title" select="'High'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Красная полоска будет показана в случае, если максимальная важность попадает в диапазон "Высокой важности".
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'5.0'"/>
                    <xsl:with-param name="extra_text" select="' (Средний)'"/>
                    <xsl:with-param name="title" select="'Medium'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Жёлтая полоска будет показана в случае, если максимальная важность попадает в диапазон "Средней важности".
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'2.0'"/>
                    <xsl:with-param name="extra_text" select="' (Низкий)'"/>
                    <xsl:with-param name="title" select="'Low'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Голубая полоска будет показана в случае, если максимальная важность попадает в диапазон "Низкой важности".
                </td>
              </tr><tr>
                <td valign="top">
                  <xsl:call-template name="severity-bar">
                    <xsl:with-param name="cvss" select="'0.0'"/>
                    <xsl:with-param name="extra_text" select="' (Рег.)'"/>
                    <xsl:with-param name="title" select="'Log'"/>
                  </xsl:call-template>
                </td>
                <td>
                  Пустая полоска будет показана в случае, если не обнаружено ни одной уязвимости.
                  Возможно, какие-то NVT выдали справочную информацию, поэтому отчёт не обязательно будет пустым.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="even">
          <td>Тренд</td>
          <td>Описывает изменение уязвимостей между последним и предпоследним отчётами:
            <br/>
            <table>
              <tr>
                <td valign="top"><img src="/img/trend_up.png"/></td>
                <td>
                  Важность повысилась: В последнем отчёте как минимум у одного NVT как минимум для одного из целевых узлов рейтинг важности оказался выше, чем в предыдущем отчёте.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_more.png"/></td>
                <td>
                  Число уязвимостей увеличилось: Максимальный рейтинг важности в текущем и предыдущем отчётах совпадают. Но в последнем отчёте содержится больше обнаруженных проблем
                  такого уровня важности, чем в предыдущем.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_nochange.png"/></td>
                <td>
                  Уязвимости не изменились: Максимальный рейтинг важности и количество найденных проблем в текущем и предыдущем отчётах совпадают.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_less.png"/></td>
                <td>
                  Число уязвимостей уменьшилось: Максимальный рейтинг важности в текущем и предыдущем отчётах совпадают. Но в последнем отчёте содержится меньше обнаруженных проблем
                  такого уровня важности, чем в предыдущем.
                </td>
              </tr><tr>
                <td valign="top"><img src="/img/trend_down.png"/></td>
                <td>
                  Важность понизилась: В последнем отчёте максимальный рейтинг важности ниже чем в предыдущем.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>
      <h3>Дополнительные параметры фильтрации и сортировки</h3>
      <p>
        Для задач можно применять дополнительные шаблоны фильтрации с ключевыми словами "schedule" и "next_due".
      </p>
      <p>
        Ключевое слово "schedule" позволяет отфильтровывать и сортировать задачи по наименованию расписания, связанного с задачей.
        Чтобы вывести только те задачи, для которых задано расписание, воспрользуйтесь шаблоном "not schedule=".
      </p>
      <p>
        Ключевое слово "next_due" позволяет отфильтровывать и сортировать задачи по времени, когда задача должна быть запущена в следующий раз.
        Например, шаблон "next_due>2d" отобразит задачи с расписанием, которые должны запуститься не ранее, чем через 2 дня.
      </p>

      <a name="autorefresh"></a>
      <h3>Авто-обновление</h3>
      <p>
       На странице с перечнем задач можно задать интервал авто-обновления страницы. Выберите один из интервалов (30, 60 секунд, 2, 5 минут) и подтвердите свой выбор нажатием на иконку
       <img src="/img/refresh.png" alt="Refresh" title="Применить выбранное значение"/>.
      </p>
      <p>
       Текущее значение авто-обнавления помечено галкой (&#8730;).
      </p>
      <p>
       Обратите внимание, что данный интервал авто-обновления устанавливается для всех страниц, содержащих изменяемые по времени данные.
      </p>

      <a name="wizard"></a>
      <h3>Мастер Задач</h3>
      <p>
       Мастер Задач позволяет просто создать и запустить на исполнение задачу, указав лишь IP адрес или наименование узла.
      </p>
      <p>
       Когда в перечне задач их число не превышает заданного в настройках значения "Количество Строк для автоотключения Мастера", он отображается после этого перечня.
      </p>
      <p>
       Нажав на иконку <img src="/img/wizard.png" alt="Show Wizard" title="Мастер"/>, вы попадёте на отдельную страницу с мастером задач.
      </p>

      <a name="overrides"></a>
      <h3>Переопределения</h3>
      <p>
       Иконка в названии столбца важности показывает, применяются ли (<img src="/img/enabled.png" alt="Overrides are applied" title="Переопределения включены"/>) настроенные 
       <a href="glossary.html?token={/envelope/token}#override">переопределения</a>
       или нет (<img src="/img/disabled.png" alt="No Overrides" title="Отсутствуют Переопределения"/>).
      </p>
      <p>
       По умолчанию, переопределения включены. Нажимая на иконку, вы можете переключать режимы применения переопределений.
       При переключении режимов, значения классов важности, рейтингов важности и трэнды могут изменяться.
      </p>
      <p>
       Обратите внимание, что переход на другую страницу приведёт к переключению установленного режима в режим по умолчанию (переопределения включены).
       Исключением из этого правила является просмотр подробностей задачи, а также отчётов и перечня отчётов по задаче.
      </p>

      <a name="actions"></a>
      <h3>Действия</h3>

      <h4>Запустить Задачу</h4>
      <p>
       Чтобы запустить задачу на исполнение, нажмите на иконку запуска <img src="/img/start.png" alt="Start" title="Запустить"/>. Перечень задач будет обновлён.
      </p>
      <p>
       Выполнить это действие можно только над задачами, находящимися в статусе "Новая" или "Завершена", которые не являются задачами с заданным расписанием или задачами-контейнерами.
      </p>

      <h4>Подробности Расписания</h4>
      <p>
        Нажав на иконку "Подробностей Расписания" <img src="/img/scheduled.png" alt="Schedule Details" title="Расписание"/>,
        вы перейдёте на страницу с подробностями расписания, назанченного данной задаче.
      </p>
      <p>
        Данное действие доступно только для задач, которым назанчено расписание.
      </p>

      <h4>Возобновить Задачу</h4>
      <p>
       Чтобы продолжить выполнение ранее остановленной задачи, нажмите на  иконку <img src="/img/resume.png" alt="Resume" title="Продолжить"/>. Перечень задач будет обновлён.
      </p>
      <p>
        Выполнить это действие можно только над задачами, которые ранее были остановлены либо вручную, либо по превышении заданного в расписании времени работы.
      </p>

      <h4>Остановить Задачу</h4>
      <p>
       Чтобы остановить выполнение ранее запущеной задачи, нажмите на  иконку <img src="/img/stop.png" alt="Stop" title="Остановить"/>. Перечень задач будет обновлён.
      </p>
      <p>
       Данное действие доступно только для задач, которые в данный момент исполняются.
      </p>

      <h4>Переместить Задачу в Корзину</h4>
      <p>
       Чтобы переместить Задачу в Корзину, нажмите на иконку <img src="/img/trashcan.png" alt="Move to Trashcan" title="Перенести в Корзину"/>. Перечень задач будет обновлён.
       Обратите внимание, что вместе с задачей в корзину будут перемещены все отчёты, связанные с данной задачей.
      </p>
      <p>
       Данное действие доступно только для задач, находящихся в статусе "Новая", "Завершена", "Остановл. на .." или "Контейнер".
      </p>

      <a name="edit_task"></a>
      <h4>Редактирование Задачи</h4>
      <p>
       Нажав на иконку "Редактирования задачи" <img src="/img/edit.png" alt="Edit Task" title="Изменить Задачу"/>, вы перейдёте на страницу с перечнем настроек данной задачи и
       возможностью изменить некоторые из них.
      </p>
      <p>
        Обратите внимание, что поле "Изменяемая Задача" доступно только в случае, если у задачи отсутствуют отчёты. Такое поведение позволяет быть уверенным в том, что показаниям 
        трэндов неизменяемых задач с существующими несколькими отчётами можно доверять, так как все сканирования производились с неизменными целями и конфигурацией сканирования.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="trashcan.html">
  <div class="gb_window_part_center">Помощь: Корзина</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_trash&amp;token={/envelope/token}">Отобразить страницу</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="trashcan-availability_ru"/>

      <h1>Корзина</h1>
      <p>
        На этой странице перечислены все перенесённые в Корзину ресурсы.
        Перечень сгруппирован по типам ресурсов.
        Сверху идёт таблица с указанием количества ресурсов в зависимости от типа и ссылками на более подробную информацию ниже.
      </p>

      <a name="actions"></a>
      <h3>Действия</h3>

      <h4>Delete</h4>
      <p>
       При нажатии на иконку удаления <img src="/img/delete.png" alt="Delete" title="Удалить"/> произойдёт немедленное полное удаление ресурса из системы.
       Перечень ресурсов в корзине будет обновлён. Иконка будет неактивна (серая)
       <img src="/img/delete_inactive.png" alt="Delete" title="Удалить"/>,
       если от данного ресурса зависит какой-то другой ресурс в корзине.
      </p>

      <h4>Восстановление</h4>
      <p>
       При нажатии на иконку восстановления <img src="/img/restore.png" alt="Restore" title="Восстановить"/>, произойдёт
       перемещение ресурса из корзины обратно в систему ион станет доступен через соответсвующий пункт меню.
       Перечень ресурсов в корзине будет обновлён. Иконка будет неактивна (серая)
       <img src="/img/restore_inactive.png" alt="Restore" title="Восстановить"/>,
       если от данного ресурса зависит какой-то другой ресурс в корзине.
      </p>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="result_details.html">
  <div class="gb_window_part_center">Помощь: Подробности Результата
    <a href="/omp?cmd=get_result&amp;result_id=cb291ec0-1b0d-11df-8aa1-002264764cea&amp;token={/envelope/token}">
      <img src="/img/details.png" border="0" style="margin-left:3px;"/>
    </a>
  </div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_RESULTS'"/>
      </xsl:call-template>

      <h1>Подробности Результата</h1>
      <p>
        Представляет подробную информацию о Результате, включая уязвимость, важность, узел, место обнаружения и любые заметки или переопределения. 
      </p>

      <h4>Отчёт</h4>
      <p>
       Нажав на иконку <img src="/img/list.png" alt="Report" title="Отчёт"/>
       вы перейдёте на страницу Отчёта, в котором содержится данный результат.
      </p>

      <h4>Экспорт</h4>
      <p>
        Для экспорта результата в XML нажмите на иконку
        <img src="/img/download.png" alt="Export" title="Экспорт в XML"/>.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="view_report.html">
  <div class="gb_window_part_center">Помощь: Просмотр Отчёта</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div class="pull-right"><a href="/omp?cmd=get_report&amp;report_id=343435d6-91b0-11de-9478-ffd71f4c6f30&amp;token={/envelope/token}">Отобразить страницу с примером</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_REPORTS'"/>
      </xsl:call-template>

      <a name="viewreport"></a>
      <h1>Просмотр Отчёта</h1>
      <p>
       Раздел "Просмотр Отчёта" объединяет всю информацию, которую содержит выбранный <a href="/help/glossary.html?token={/envelope/token}#report">отчёт</a>.
      (Данный раздел является частичным переводом с дополнением, т.к. на взгляд переводчика, изложенное расходилось с наблюдаемым)
      </p>
      <p>
       В Левом верхнем углу заголовка окна "Отчёт" есть стрелочка, при наведении на которую выпадает меню. В данном меню можно выбрать для просмотра различные подразделы отчёта.
       Исключение составляют лишь пункты меню "Задача", выбор которого приведёт к переходу на страницу подробностей <a href="/help/glossary.html?token={/envelope/token}#task">задачи</a>,
       и "Обзор результатов", выбор которого приведёт к переходу на страницу <a href="/help/glossary.html?token={/envelope/token}#result">результатов</a>, связанных с данным отчётом.
       Пункты меню схожи с оглавлением в скачиваемых форматах отчётов типа HTML и PDF.
      </p>
      <p>
        В данном разделе так же можно получить <a href="glossary.html?token={/envelope/token}#prognostic_report">отчёт о прогнозах</a>.
      </p>

      <a name="overrides"></a>
      <h2>Обобщение Отчёта</h2>
      <p>
        В подразделе "Обобщение и Скачивание" приведена основная информация о данном отчёте, такая как наименование и время запуска задачи, в рамках которой создан отчёт.
      </p>

      <p>
        Здесь так же представлена таблица с количеством проблем различной важности для полного отчёта.
        Что бы скачать полный отчёт, выберите <a href="glossary.html?token={/envelope/token}#report_format">формат</a> в столбце "Скачать" и нажмите на иконку скачивания
        <img src="/img/download.png" alt="Download" title="Скачать"/>. Форматы отчётов можно настроить на странице
        <a href="report_formats.html?token={/envelope/token}">Форматов отчётов</a>.
      </p>

      <a name="overrides"></a>
      <h3>Выбор Переопределений</h3>
      <p>
       Настроенные <a href="glossary.html?token={/envelope/token}#override">переопределения</a> по умолчанию всегда применяются.
       Нажимая на иконку включения/отключения переопределений, вы можете заметить, как меняются классы и рейтинг важности результатов сканирования.
      </p>
      <p>
       Текущее значение активности переопределений отмечено галкой (&#8730;). (нет такого, о чём идёт речь?)
      </p>
      <p>
       Обратите внимание, что переход с этой страницы вернёт значение активности переопределений в значение по умолчанию.
      </p>

      <h3>Скачать отфильтрованный отчёт</h3>
      <p>
        Что бы скачать отфильтрованный отчёт, выберите <a href="glossary.html?token={/envelope/token}#report_format">формат</a> в столбце "Скачать" и нажмите на иконку скачивания
       <img src="/img/download.png" alt="Download" title="Скачать"/>. Форматы отчётов можно настроить на странице
        <a href="report_formats.html?token={/envelope/token}">Форматов отчётов</a>.
      </p>

      <h3>Заметки</h3>
      <p>
       Любая <a href="/help/glossary.html?token={/envelope/token}#note">заметка</a>, связанная с отчётом, отображается в результатах. При выводе они сортируются времени создания.
      </p>
      <p>
       В поле заметки отображается так же группа иконок:
       <img src="/img/delete.png" alt="Delete" title="Перенести в Корзину"/>
       <img src="/img/details.png" alt="Details" title="Подробности"/>
       <img src="/img/edit.png" alt="Edit" title="Редактировать"/>, позволяющих производить над заметкой такие же действия, как на странице 
       <a href="notes.html?token={/envelope/token}">Заметки</a>.
      </p>
      <p>
       Чтобы добавить заметку к NVT, нажмите кнопку создания новой заметки <img src="/img/new_note.png" alt="New Note" title="Добавить Заметку"/> в результатах NVT.
      </p>
      <p>
       Если в результате есть заметки, и заметки включены в фильтр (см. ниже), то тогда иконка заметки <img src="/img/note.png" alt="Note" title="Заметки"/>
       отображается при выводе результата. Если нажать на эту иконку, то вы перейдёте к содержимому заметки, отображаемому внизу страницы, что бывает полезно, если описание
       результата достаточно длинное.
      </p>

      <h3>Переопределения</h3>
      <p>
       Если <a href="/help/glossary.html?token={/envelope/token}#override">переопределения</a> активированы, то связанные с отчётом переопределения также отображаются в результатах.
      </p>
      <p>
       В поле переопределения отображается так же группа иконок:
       <img src="/img/delete.png" alt="Delete" title="Перенести в Корзину"/>
       <img src="/img/details.png" alt="Details" title="Подробности"/>
       <img src="/img/edit.png" alt="Edit" title="Редактировать"/>, позволяющих производить над переопределением такие же действия, как на странице 
       <a href="overrides.html?token={/envelope/token}">Переопределения</a>.
      </p>
      <p>
       Чтобы добавить переопределение к NVT, нажмите кнопку создания нового переопределения <img src="/img/new_override.png" alt="New Override" title="Добавить Переопределение"/>
       в результатах NVT.
      </p>
      <p>
       Если в результате есть переопределение, то тогда иконка переопределения <img src="/img/override.png" alt="Overrides" title="Переопределения"/> отображается 
       при выводе результата. Если нажать на эту иконку, то вы перейдёте к содержимому переопределения, отображаемому внизу страницы, что бывает полезно, если описание
       результата достаточно длинное.
      </p>

      <xsl:call-template name="filtering_ru"/>

      <p>
      Дополнительным шаблоном для фильтрования результатов является ключевое слово 'timezone=', которое осуществит преобразование любых временных отметок в отчёте в соответствии с
      заданным посредством данного ключевого слова временным поясом. Например, 'timezone="Europe/Berlin"' приведёт все временные метки к берлинскому времени.
      </p>

      <xsl:call-template name="sorting_ru"/>

    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cpes.html">
  <div class="gb_window_part_center">Помощь: CPE</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=cpe&amp;token={/envelope/token}">Отобразить страницу</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>CPE</h1>
      <p>
       В данной таблице приведён перечень всех имеющихся в базе знаний 
        <a href="glossary.html?token={/envelope/token}#cpe">CPE</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Формальное наименование CPE. Наименование может быть разбито на несколько строк, в таких случаях конец каждой строки отмечается специальным маркером.
          </td>
        </tr>
        <tr>
          <td>Название</td>
          <td>Официальное название CPE, для неофициальных CPE там стоит "Н/Д".</td>
        </tr>
        <tr>
          <td>Изменено</td>
          <td>Время последней официальной модификации CPE, для неофициальных CPE там стоит "Н/Д".
          </td>
        </tr>
        <tr>
          <td>CVE</td>
          <td>Число <a href="glossary.html?token={/envelope/token}#cve">CVE</a>, связанных с этим продуктом.
          </td>
        </tr>
        <tr>
          <td>Важность</td>
          <td>Наивысший из рейтингов CVSS по всем CVE, связанным с этим продуктом.
          </td>
        </tr>
      </table>
      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="secinfo_missing"></a>
      <h2>Внимание: База Знаний отсутствует</h2>
      <p>
        Данное окно-предупреждение появляется в случае, если OMP сервер не может обнаружить базы данных SCAP и/или CERT.
      </p>
      <p>
        В случае отсутствия базы знаний таблица CPE всегда пуста.
      </p>
      <p>
        База данных SCAP обновляется в процессе обновления подписки SCAP, а база данных CERT обновляется в процессе обновления подписки CERT.
        Возможно, база знаний появятся при следующем подобном обновлении.
        Обычно обновлением занимается периодический процесс, работающий в фоне.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cves.html">
  <div class="gb_window_part_center">Помощь: CVE</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=cve&amp;token={/envelope/token}">Отобразить страницу</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>CVE</h1>

      <p>
       В данной таблице приведён перечень всех имеющихся в базе знаний 
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <p>
        <b>Обратите внимание:</b> Большинство характеристик уязвимости (вектор, сложность, необходимость аутентификации, влияние на конфиденциальность, целостность и доступность)
        извлекаются из значения <a href="glossary.html?token={/envelope/token}#cvss">CVSS</a> в CVE. 
        В случае отсутствия CVSS, в этих полях стоит "Н/Д".
      </p>

      <p>
        Подробное описание значений полей CVSS см. в CVSS Guide http://www.first.org/cvss/cvss-guide.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr>
          <td>Наименование</td>
          <td>Идентификатор CVE.</td>
        </tr>
        <tr class="odd">
          <td>Vector</td>
          <td>Вектор Доступа. Это значение отражает способ получения достпа для эксплуатации уязвимости.</td>
        </tr>
        <tr>
          <td>Complexity</td>
          <td>Сложность Доступа. Это значение отражает сложность атаки, необходимой для эксплуатации уязвимости, как только атакующий получил доступ к системе.</td>
        </tr>
        <tr class="odd">
          <td>Authentication</td>
          <td>Это значение отражает сколько раз атакующий должен аутентифицироваться в целевой системе для эксплуатации уязвимости.</td>
        </tr>
        <tr>
          <td>Confidentiality Impact</td>
          <td>Это значение отражает воздействие на конфиденциальность после эксплуатации уязвимости.</td>
        </tr>
        <tr class="odd">
          <td>Integrity Impact</td>
          <td>Это значение отражает воздействие на целостность после эксплуатации уязвимости.</td>
        </tr>
        <tr>
          <td>Availability Impact</td>
          <td>Это значение отражает воздействие на доступность после эксплуатации уязвимости.</td>
        </tr>
        <tr class="odd">
          <td>Опубликовано</td>
          <td>Дата первой публикации CVE.</td>
        </tr>
        <tr>
          <td>Важность</td>
          <td>Интегрированный рейтинг, вычисляемый из значений уязвимости. Лежит в диапазоне от 0 до 10. </td>
        </tr>
      </table>

      <p>
        <b>На заметку:</b> В дополнение к перечисленным столбцам, вы также можете использовать <a href="/help/powerfilter.html?token={/envelope/token}">Фильтрацию</a>,
        чтобы отобразить CVE, влияющие на конкретные продукты (CPE). Используйте для этого шаблон с ключевым словом "products".
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="secinfo_missing"></a>
      <h2>Внимание: База Знаний отсутствует</h2>
      <p>
        Данное окно-предупреждение появляется в случае, если OMP сервер не может обнаружить базы данных SCAP и/или CERT.
      </p>
      <p>
        В случае отсутствия базы знаний таблица CPE всегда пуста.
      </p>
      <p>
        База данных SCAP обновляется в процессе обновления подписки SCAP, а база данных CERT обновляется в процессе обновления подписки CERT.
        Возможно, база знаний появятся при следующем подобном обновлении.
        Обычно обновлением занимается периодический процесс, работающий в фоне.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="nvt_details.html">
  <div class="gb_window_part_center">Помощь: Подробности NVT</div>
  <div class="gb_window_part_content">
    <div class="pull-left"><a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a></div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Подробности NVT</h1>
      <p>
        Представляет подробную информацию о NVT.
        А конкретнее: Наименование, время создания, время изменения, резюме, метод определения уязвимости, решение проблемы, данные CVSS, список справочных ссылок (CVE, Bugtraq ID,
        уведомления CERT и т.д.), а также ссылки на заметки и переопределения, связанные с данным NVT.
      </p>
      <p>
        Если нажать на наименование CVE, то вы перейдёте на страницу Подробностей CVE, а нажав на наименование уведомления CERT, перейдёте на страницу подробностей уведомления CERT.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="nvts.html">
  <div class="gb_window_part_center">Помощь: NVT</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=nvt&amp;token={/envelope/token}">Отобразить страницу</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>NVT</h1>

      <p>
       В данной таблице приведён перечень всех имеющихся в базе знаний 
        <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr>
          <td>Наименование</td>
          <td>Идентификатор NVT.</td>
        </tr>
        <tr class="odd">
          <td>Группа</td>
          <td>Группа проверок, к которой принадлежит NVT.</td>
        </tr>
        <tr>
          <td>Создано</td>
          <td>Дата создания NVT.</td>
        </tr>
        <tr class="odd">
          <td>Изменено</td>
          <td>Дата последнего изменения NVT.</td>
        </tr>
        <tr class="even">
          <td>Версия</td>
          <td>Версия NVT.</td>
        </tr>
        <tr class="odd">
          <td>Тип Решения (<img src="/img/solution_type.png" alt="Solution type" title="Тип решения"/>)</td>
          <td>
            Тип решения проблемы с наличием уязвимости.<br/><br/>
            <xsl:call-template name="solution-types_ru"/>
          </td>
        </tr>
        <tr class="even">
          <td>Важность</td>
          <td>
            Интегрированный рейтинг, вычисляемый из значений уязвимости. Лежит в диапазоне от 0 до 10.
          </td>
        </tr>
      </table>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="secinfo_missing"></a>
      <h2>Внимание: База Знаний отсутствует</h2>
      <p>
        Данное окно-предупреждение появляется в случае, если OMP сервер не может обнаружить базы данных SCAP и/или CERT.
      </p>
      <p>
        В случае отсутствия базы знаний таблица CPE всегда пуста.
      </p>
      <p>
        База данных SCAP обновляется в процессе обновления подписки SCAP, а база данных CERT обновляется в процессе обновления подписки CERT.
        Возможно, база знаний появятся при следующем подобном обновлении.
        Обычно обновлением занимается периодический процесс, работающий в фоне.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="ovaldefs.html">
  <div class="gb_window_part_center">Помощь: Определения OVAL</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=ovaldef&amp;token={/envelope/token}">Отобразить страницу</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Определения OVAL</h1>
      <p>
       В данной таблице приведён перечень всех имеющихся в базе знаний 
        <a href="glossary.html?token={/envelope/token}#ovaldef">Определений OVAL</a>,
        и отмечены важные особенности каждого из них.
      </p>
      <p>
        Подробное описание языка спецификации OVAL см. http://oval.mitre.org/language/version5.10.1/
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr>
          <td>Наименование</td>
          <td>OVAL идентификатор данного определения. В этом же столбце серым меньшим шрифтом указан XML файл, в котором содержится данное определение.
          </td>
        </tr>
        <tr class="odd">
          <td>Версия</td>
          <td>Номер версии определения OVAL.</td>
        </tr>
        <tr>
          <td>Статус</td>
          <td>Этап жизненного цикла, на котором в данный момент находится определение OVAL. См. http://oval.mitre.org/repository/about/stages.html за более подробной информацией
          о типах статусов, определённых для содержимого репозитария MITRE OVAL.<br/>
          Если у определения нет указания статуса, но атрибут "deprecated" (устарело) установлен, тогда статус определения устанавливается в "DEPRECATED".
          </td>
        </tr>
        <tr class="odd">
          <td>Класс</td>
          <td>Класс, к которому относится определение.</td>
        </tr>
        <tr>
          <td>Создано</td>
          <td>Дата создания определения.</td>
        </tr>
        <tr class="odd">
          <td>Изменено</td>
          <td>Дата последнего изменения определения.</td>
        </tr>
        <tr>
          <td>CVE</td>
          <td>Количество of <a href="glossary.html?token={/envelope/token}#cve">CVE</a>, связанных с этим определением.</td>
        </tr>
        <tr class="odd">
          <td>Важность</td>
          <td>Наивысший из рейтингов CVSS по всем CVE, связанным с этим определением.</td>
        </tr>
      </table>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="secinfo_missing"></a>
      <h2>Внимание: База Знаний отсутствует</h2>
      <p>
        Данное окно-предупреждение появляется в случае, если OMP сервер не может обнаружить базы данных SCAP и/или CERT.
      </p>
      <p>
        В случае отсутствия базы знаний таблица CPE всегда пуста.
      </p>
      <p>
        База данных SCAP обновляется в процессе обновления подписки SCAP, а база данных CERT обновляется в процессе обновления подписки CERT.
        Возможно, база знаний появятся при следующем подобном обновлении.
        Обычно обновлением занимается периодический процесс, работающий в фоне.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="cert_bund_advs.html">
  <div class="gb_window_part_center">Помощь: Предупреждения CERT-Bund</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=cert_bund_adv&amp;token={/envelope/token}">Отобразить страницу</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Предупреждения CERT-Bund</h1>
      <p>
       В данной таблице приведён перечень всех 
        <a href="glossary.html?token={/envelope/token}#cert_bund_adv">Предупреждений CERT-Bund</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr>
          <td>Наименование</td>
          <td>Идентификатор предупреждения CERT-Bund.</td>
        </tr>
        <tr class="odd">
          <td>Название</td>
          <td>Название предупреждения.</td>
        </tr>
        <tr>
          <td>Создано</td>
          <td>Дата создания предупреждения.</td>
        </tr>
        <tr class="odd">
          <td>Важность</td>
          <td>Наивысший из рейтингов CVSS по всем CVE, связанным с этим предупреждением.</td>
        </tr>
        <tr>
          <td>CVE</td>
          <td>Число CVE, на которое ссылается предупреждение.</td>
        </tr>
      </table>

      <a name="about"></a>
      <h3>О CERT-Bund</h3>
      <p>
        CERT-Bund (Computer Emergency Response Team for federal agencies,
        https://www.cert-bund.de/) основное место для получения информации о превентивных и реактивных мерах касательно инцидентов с компьютерной безопасностью.
      </p>

      <p>
        В целях ограничения потенциального ущерба и избегания создания проблем с безопасностью, CERT-Bund
      </p>
      <ul>
        <li>разрабатывает и публикует рекомендации с превентивными мерами</li>
        <li>указывает на уязвимости в программном и аппаратном обеспечении</li>
        <li>предлагает варианты защиты от эксплуатации известных уязвимостей</li>
        <li>поддерживает усилия государственных институтов по реагированию на инциденты безопасности ИТ</li>
        <li>предлагает различные меры по снижению рисков</li>
      </ul>

      <p>Также, CERT-Bund управляет Немецким Государственным ситуационным центром ИТ.</p>

      <p>
        Услуги CERT-Bund предоставляются в основном федеральным организациям и включают
      </p>

      <ul>
        <li>круглосуточное дежурство на телефоне в связи с ситуационным центром ИТ</li>
        <li>анализ поступающих отчётов об инцидентах</li>
        <li>создание рекомендаций на основе анализа инцидентов</li>
        <li>поддержка в процессе работ по инциденту безопасности ИТ</li>
        <li>поддержка информационного и предупреждающего сервисов</li>
        <li>активное уведомление Федеральной Администрации в случае надвигающейся угрозы.</li>
      </ul>

      <p>
        В довершении, CERT-Bund предлагает всеобъемлющую информацию заинтересованным лицам путём предоставления сервиса справок и уведомлений для граждан 
        (http://www.buerger-cert.de/), доступном онлайн.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="secinfo_missing"></a>
      <h2>Внимание: База Знаний отсутствует</h2>
      <p>
        Данное окно-предупреждение появляется в случае, если OMP сервер не может обнаружить базы данных SCAP и/или CERT.
      </p>
      <p>
        В случае отсутствия базы знаний таблица CPE всегда пуста.
      </p>
      <p>
        База данных SCAP обновляется в процессе обновления подписки SCAP, а база данных CERT обновляется в процессе обновления подписки CERT.
        Возможно, база знаний появятся при следующем подобном обновлении.
        Обычно обновлением занимается периодический процесс, работающий в фоне.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="dfn_cert_advs.html">
  <div class="gb_window_part_center">Помощь: Предупреждения DFN-CERT</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=dfn_cert_adv&amp;token={/envelope/token}">Отобразить страницу</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Предупреждения DFN-CERT</h1>
      <p>
       В данной таблице приведён перечень всех 
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">Предупреждений DFN-CERT</a>,
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr>
          <td>Наименование</td>
          <td>Идентификатор предупреждений DFN-CERT.</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Наименование предупреждений.</td>
        </tr>
        <tr>
          <td>Создано</td>
          <td>Дата создания предупреждения.</td>
        </tr>
        <tr class="odd">
          <td>Важность</td>
          <td>Наивысший из рейтингов CVSS по всем CVE, связанным с этим предупреждением.</td>
        </tr>
        <tr>
          <td>CVE</td>
          <td>Число CVE, на которое ссылается предупреждение.</td>
        </tr>
      </table>

      <a name="about"></a>
      <h3>О DFN-CERT</h3>
      <p>
        DFN-CERT расположен в Гамбурге и обслуживает несколько сотен университетов и исследовательских институтов по всей Германии, а также предоставляет основные сервисы безопасности для
        правительства и промышленности. Он имеет опыт продолжительного сотрудничества с международными, Европейскими и национальными форумами и группами, занимающимися борьбой с
        киберпреступностью и помогающими жертвам атак и инцидентов. Осуществление проактивных шагов посредством узконаправленных исследований в области безопасности ИТ позволяет DFN-CERT
        предлагать лучшие решения. Это осуществляется как посредством издательствой, так и образовательной деятельности. DFN-CERT предоставляет такие сервисы как обнаружение и отражение
        DDoS, управление инцидентами, управление уязвимостями, а также рассылка предупреждений ключевым игрокам в правительстве и промышленности.<br/>
        За дополнительной информацией обращайтесь на https://www.dfn-cert.de/ или напишите письмо по адресу &lt;info@dfn-cert.de&gt;.
      </p>
      <p>
        Сервис предупреждений DFN-CERT включает категоризацию, распространение и ранжирование предупреждений, распространяемых производителями ПО и другими организациями, также
        осуществляя перевод на немецкий язык.
      </p>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="secinfo_missing"></a>
      <h2>Внимание: База Знаний отсутствует</h2>
      <p>
        Данное окно-предупреждение появляется в случае, если OMP сервер не может обнаружить базы данных SCAP и/или CERT.
      </p>
      <p>
        В случае отсутствия базы знаний таблица CPE всегда пуста.
      </p>
      <p>
        База данных SCAP обновляется в процессе обновления подписки SCAP, а база данных CERT обновляется в процессе обновления подписки CERT.
        Возможно, база знаний появятся при следующем подобном обновлении.
        Обычно обновлением занимается периодический процесс, работающий в фоне.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="allinfo.html">
  <div class="gb_window_part_center">Помощь: Вся База Знаний</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div class="pull-right">
      <a href="/omp?cmd=get_info&amp;info_type=allinfo&amp;token={/envelope/token}">Отобразить страницу</a>
    </div>
    <div style="text-align:left">

      <br/>

      <xsl:call-template name="availability_ru">
        <xsl:with-param name="command" select="'GET_INFO'"/>
      </xsl:call-template>

      <h1>Вся База Знаний</h1>

      <p>
       В данной таблице приведён перечень всех записей из Базы Знаний
        <a href="glossary.html?token={/envelope/token}#nvt">NVT</a>,
        <a href="glossary.html?token={/envelope/token}#cve">CVE</a>,
        <a href="glossary.html?token={/envelope/token}#cpe">CPE</a>,
        <a href="glossary.html?token={/envelope/token}#ovaldef">OVAL Definitions</a>,
        <a href="glossary.html?token={/envelope/token}#dfn_cert_adv">Предупреждения DFN-CERT Advisories</a>
        ),
        и отмечены важные особенности каждого из них.
      </p>

      <table class="gbntable">
        <tr class="gbntablehead2">
          <td>Столбец</td>
          <td>Описание</td>
        </tr>
        <tr class="odd">
          <td>Наименование</td>
          <td>Идентификатор записи Базы Знаний.</td>
        </tr>
        <tr class="even">
          <td>Тип</td>
          <td>Тип записи.</td>
        </tr>
        <tr class="odd">
          <td>Создано</td>
          <td>Дата создания записи.</td>
        </tr>
        <tr class="even">
          <td>Изменено</td>
          <td>Дата изменения записи.</td>
        </tr>
      </table>

      <xsl:call-template name="filtering_ru"/>
      <xsl:call-template name="sorting_ru"/>

      <a name="secinfo_missing"></a>
      <h2>Внимание: База Знаний отсутствует</h2>
      <p>
        Данное окно-предупреждение появляется в случае, если OMP сервер не может обнаружить базы данных SCAP и/или CERT.
      </p>
      <p>
        В случае отсутствия базы знаний таблица CPE всегда пуста.
      </p>
      <p>
        База данных SCAP обновляется в процессе обновления подписки SCAP, а база данных CERT обновляется в процессе обновления подписки CERT.
        Возможно, база знаний появятся при следующем подобном обновлении.
        Обычно обновлением занимается периодический процесс, работающий в фоне.
      </p>
    </div>
  </div>
</xsl:template>

<xsl:template mode="help" match="qod.html">
  <div class="gb_window_part_center">Помощь: Точность обнаружения (QoD)</div>
  <div class="gb_window_part_content">
    <div class="pull-left">
      <a href="/help/contents.html?token={/envelope/token}">К Оглавлению</a>
    </div>
    <div style="text-align:left">

      <br/>

      <h1>Точность обнаружения (QoD)</h1>

      <p>
      QoD является значением из диапазона от 0% до 100%, описывающим надёжность осуществлённого обнаружения уязвимости или продукта.
      </p>

      <p>
      Одной из основных причин появления данной концепции стала проблема правильной обработки потенциальных уязвимостей.
      Смысл состоял в том, чтобы хранить полученные результаты в базе данных, но показывать их только по запросу.
      </p>

      <p>
      В то время как диапазон QoD позволяет отображать точность довольно детально,
      на деле большинство проверок используют стандартную методологию.
      Поэтому были введены  <b>Типы QoD</b>, каждый из которых связан с определённым значением QoD.
      Текущий перечень типов может быть со временем расширен.
      </p>

      <h2>Обзор типов QoD и связанных с ними значений</h2>

      <table>

      <tr>
        <th align="left">QoD</th>
        <th align="left">Тип(ы) QoD</th>
        <th align="left">Описание</th>
      </tr>

      <tr>
        <td valign="top" align="right">100%</td>
        <td valign="top">exploit</td>
        <td valign="top">Обнаружение произошло посредством применения эксплоита, поэтому полностью подтверждено.</td>
      </tr>

      <tr>
        <td valign="top" align="right">99%</td>
        <td valign="top">remote_vul</td>
        <td valign="top">
          Обнаружение произошло входе активных удалённых проверок (исполнение кода, атака обхода дерева каталогов, sql-инъекция и т.д.),
          ответ на которые ясно показывает наличие уязвимости.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">98%</td>
        <td valign="top">remote_app</td>
        <td valign="top">
          Обнаружение произошло входе активных удалённых проверок (исполнение кода, атака обхода дерева каталогов, sql-инъекция и т.д.),
          ответ на которые ясно показывает наличие уязвимого приложения.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">97%</td>
        <td valign="top">
          package
        </td>
        <td valign="top">
          Проверки Linux(oid) систем основанные на аутентификации в системе и анализе установленных пакетов.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">97%</td>
        <td valign="top">
          registry
        </td>
        <td valign="top">
          Проверки Windows систем основанные на аутентификации в системе и анализе информации из регистра.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">95%</td>
        <td valign="top">remote_active</td>
        <td valign="top">
          Обнаружение произошло входе активных удалённых проверок (исполнение кода, атака обхода дерева каталогов, sql-инъекция и т.д.),
          ответ на которые скорее всего свидетельствует о наличии уязвимости или уязвимого приложения.
          "Скорее всего" означает, что в отдельных редких случаях возможна ошибка.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">80%</td>
        <td valign="top">
          remote_banner
        </td>
        <td valign="top">
          Приветственное сообщение удалённой системы содержит номер версии. Продукты многих вендоров так себя и ведут.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">80%</td>
        <td valign="top">
          executable_version
        </td>
        <td valign="top">
          Проверки Linux(oid) и Windows систем основанные на аутентификации в системе и анализе версий исполняемых файлов, выводимых приложениями при запуске.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">75%</td>
        <td valign="top"></td>
        <td valign="top">
          Это значение присваивается любым результатам, не поддерживающим пока точность обнаружения, в процессе миграции на платформу OpenVAS-8, а также результатам выполнения NVT,
          у которых отсутствует точности обнаружения. Однако, некоторые NVT могут её иметь по какой-нибудь причине.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">70%</td>
        <td valign="top">remote_analysis</td>
        <td valign="top">
          Удалённые проверки, осуществляющие определённый анализ, которому не всегда можно в полной мере доверять.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">50%</td>
        <td valign="top">remote_probe</td>
        <td valign="top">
          Удалённые проверки, в которых промежуточная система, такая как межсетевой экран, может препятствовать корректному определению, так что не понятно, ответило ли само
          приложение. Такое возможно в случае не-TLS (незащищённых) соединений.</td>
      </tr>

      <tr>
        <td valign="top" align="right">30%</td>
        <td valign="top">
          remote_banner_unreliable
        </td>
        <td valign="top">
          Приветственное сообщение удалённой системы не содержит номер версии. Например, это распространено в продуктах с открытыми исходными кодами из-за практики портирования
          новых функций в старые версии.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">30%</td>
        <td valign="top">
          executable_version_unreliable
        </td>
        <td valign="top">
          Проверки Linux(oid) систем основанные на аутентификации в системе и анализе версий исполняемых файлов, когда приложениями при запуске не выводят версию.
        </td>
      </tr>

      <tr>
        <td valign="top" align="right">1%</td>
        <td valign="top">general_note</td>
        <td valign="top">
          Общая заметка о потенциальной уязвимости в отсутствии нахождения таковой в текущих приложениях.
        </td>
      </tr>

      </table>

      <h2>Переходная фаза для NVT и результатов</h2>

      <p>
      По умолчанию для отображения отчёта применяется шаблон фильтрации, выводящий результаты с точностью определения большей или равной 70%.
      </p>

      <p>
      QoD был введён в OpenVAS-8. Любым результатам, созданным с помощью предыдущих версий, в процессе миграции присваивается значение 75%.
      </p>

      <p>
      Перевод всех NVT на новую платформу это длительный процесс. Для всех NVT, которым ещё не присвоено значение QoD, автоматически присваивается значение 75%.
      </p>

      <p>
      Значение 75% позволяет отображать в отчёте эти результаты по умолчанию. Тем не менее, какие-нибудь новые результаты могут получить точность обнаружения 75%, поэтому не
      надо воспринимать это значение только как ярлык для результатов, которым не присвоена точность обнаружения.
      </p>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
