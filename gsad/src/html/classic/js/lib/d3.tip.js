// d3.tip
// Copyright (c) 2013 Justin Palmer
//               2016 Björn Ricks <bjoern.ricks@greenbone.net>
//
// Tooltips for d3.js SVG visualizations
//
// This is a slightly modified version of d3.tip originally developed by Justin
// Palmer under the MIT licence (https://github.com/Caged/d3-tip)

(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module with d3 as a dependency.
    define(['d3'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = function(d3) {
      d3.tip = factory(d3);
      return d3.tip;
    };
  } else {
    // Browser global.
    root.d3.tip = factory(root.d3);
  }
}(this, function(d3) {
  'use strict';

  // Public - contructs a new tooltip
  //
  // Returns a tip
  return function() {
    var direction = d3_tip_direction;
    var offset    = d3_tip_offset;
    var html      = d3_tip_html;
    var node      = initNode();
    var svg       = null;
    var point     = null;
    var target    = null;

    var direction_callbacks = d3.map({
      n:  direction_n,
      s:  direction_s,
      e:  direction_e,
      w:  direction_w,
      nw: direction_nw,
      ne: direction_ne,
      sw: direction_sw,
      se: direction_se
    });

    var directions = direction_callbacks.keys();

    function tip(vis) {
      svg = getSVGNode(vis);
      if (svg !== null) {
        point = new_point();
        document.body.appendChild(node);
      }
    }

    // Public - show the tooltip on the screen
    //
    // Returns a tip
    tip.show = function() {
      // convert array-like object arguments into a real Array
      var args = Array.prototype.slice.call(arguments);
      var lastarg = args[args.length - 1];
      var coords;

      if (lastarg instanceof SVGElement) {
        target = args.pop();
      }
      else if (typeof lastarg === 'object') {
        coords = {};
        args.pop();
      }
      else {
        // don't use last target from previous event
        target = null;
      }

      var content = html.apply(this, args);
      var poffset = offset.apply(this, args);
      var dir     = direction.apply(this, args);
      var nodel   = getNodeEl();
      var i       = directions.length;
      var scrollTop  = document.documentElement.scrollTop ||
        document.body.scrollTop;
      var scrollLeft = document.documentElement.scrollLeft ||
        document.body.scrollLeft;

      nodel.html(content)
        .style({opacity: 1, 'pointer-events': 'all'});

      if (typeof coords === 'object') {
        // use north (n) coordinates currently
        coords.top = lastarg.y - node.offsetHeight;
        coords.left = lastarg.x - node.offsetWidth / 2;
      }
      else {
        coords  = direction_callbacks.get(dir).apply(this);
      }

      while (i--) {
        nodel.classed(directions[i], false);
      }

      nodel.classed(dir, true).style({
        top: (coords.top +  poffset[0]) + scrollTop + 'px',
        left: (coords.left + poffset[1]) + scrollLeft + 'px'
      });

      return tip;
    };

    // Public - hide the tooltip
    //
    // Returns a tip
    tip.hide = function() {
      var nodel = getNodeEl();
      nodel.style({opacity: 0, 'pointer-events': 'none'});
      return tip;
    };

    // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
    //
    // n - name of the attribute
    // v - value of the attribute
    //
    // Returns tip or attribute value
    tip.attr = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().attr(n);
      } else {
        var args =  Array.prototype.slice.call(arguments);
        d3.selection.prototype.attr.apply(getNodeEl(), args);
      }

      return tip;
    };

    // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
    //
    // n - name of the property
    // v - value of the property
    //
    // Returns tip or style property value
    tip.style = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().style(n);
      } else {
        var args =  Array.prototype.slice.call(arguments);
        d3.selection.prototype.style.apply(getNodeEl(), args);
      }

      return tip;
    };

    // Public: Set or get the direction of the tooltip
    //
    // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
    //     sw(southwest), ne(northeast) or se(southeast)
    //
    // Returns tip or direction
    tip.direction = function(v) {
      if (!arguments.length) {
        return direction;
      }
      direction = v === null ? v : d3.functor(v);

      return tip;
    };

    // Public: Sets or gets the offset of the tip
    //
    // v - Array of [x, y] offset
    //
    // Returns offset or
    tip.offset = function(v) {
      if (!arguments.length) {
        return offset;
      }
      offset = v === null ? v : d3.functor(v);

      return tip;
    };

    // Public: sets or gets the html value of the tooltip
    //
    // v - String value of the tip
    //
    // Returns html value or tip
    tip.html = function(v) {
      if (!arguments.length) {
        return html;
      }
      html = v === null ? v : d3.functor(v);

      return tip;
    };

    // Public: destroys the tooltip and removes it from the DOM
    //
    // Returns a tip
    tip.destroy = function() {
      if (node) {
        getNodeEl().remove();
        node = null;
      }
      return tip;
    };

    function d3_tip_direction() { return 'n'; }
    function d3_tip_offset() { return [0, 0]; }
    function d3_tip_html() { return ' '; }

    function direction_n() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.n.y - node.offsetHeight,
        left: bbox.n.x - node.offsetWidth / 2
      };
    }

    function direction_s() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.s.y,
        left: bbox.s.x - node.offsetWidth / 2
      };
    }

    function direction_e() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.e.y - node.offsetHeight / 2,
        left: bbox.e.x
      };
    }

    function direction_w() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.w.y - node.offsetHeight / 2,
        left: bbox.w.x - node.offsetWidth
      };
    }

    function direction_nw() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.nw.y - node.offsetHeight,
        left: bbox.nw.x - node.offsetWidth
      };
    }

    function direction_ne() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.ne.y - node.offsetHeight,
        left: bbox.ne.x
      };
    }

    function direction_sw() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.sw.y,
        left: bbox.sw.x - node.offsetWidth
      };
    }

    function direction_se() {
      var bbox = getScreenBBox();
      return {
        top:  bbox.se.y,
        left: bbox.e.x
      };
    }

    function initNode() {
      var node = d3.select(document.createElement('div'));
      node.style({
        position: 'absolute',
        top: 0,
        opacity: 0,
        'pointer-events': 'none',
        'box-sizing': 'border-box'
      });

      return node.node();
    }

    function getSVGNode(el) {
      el = el.node();
      if (el.tagName.toLowerCase() === 'svg') {
        return el;
      }

      return el.ownerSVGElement;
    }

    function getNodeEl() {
      if (node === null) {
        node = initNode();
        // re-add node to DOM
        document.body.appendChild(node);
      }
      return d3.select(node);
    }

    function new_point(point) {
      var new_point = svg.createSVGPoint();
      if (point !== undefined) {
        new_point.x = point.x;
        new_point.y = point.y;
      }
      return new_point;
    }

    // Private - gets the screen coordinates of a shape
    //
    // Given a shape on the screen, will return an SVGPoint for the directions
    // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
    // sw(southwest).
    //
    //    +-+-+
    //    |   |
    //    +   +
    //    |   |
    //    +-+-+
    //
    // Returns an Object {n, s, e, w, nw, sw, ne, se}
    function getScreenBBox() {
      var targetel   = target || d3.event.target;

      while ('undefined' === typeof targetel.getScreenCTM &&
          'undefined' !== typeof targetel.parentNode) {
        targetel = targetel.parentNode;
      }

      var bbox = {};
      var tbbox;
      var width;
      var height;

      var matrix = targetel.getScreenCTM();

      try {
        tbbox = targetel.getBBox();

        var x = tbbox.x;
        var y = tbbox.y;

        width = tbbox.width;
        height = tbbox.height;

        point.x = x;
        point.y = y;
        bbox.nw = point.matrixTransform(matrix);
        point.x += width;
        bbox.ne = point.matrixTransform(matrix);
        point.y += height;
        bbox.se = point.matrixTransform(matrix);
        point.x -= width;
        bbox.sw = point.matrixTransform(matrix);
        point.y -= height / 2;
        bbox.w  = point.matrixTransform(matrix);
        point.x += width;
        bbox.e = point.matrixTransform(matrix);
        point.x -= width / 2;
        point.y -= height / 2;
        bbox.n = point.matrixTransform(matrix);
        point.y += height;
        bbox.s = point.matrixTransform(matrix);

      } catch (err) {
        /* fix getBBox not implemented issue for tspans on firefox */
        var rect = targetel.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        point.x = rect.left;
        point.y = rect.top;
        bbox.nw = new_point(point);
        point.x += width;
        bbox.ne = new_point(point);
        point.y += height;
        bbox.se = new_point(point);
        point.x -= width;
        bbox.sw = new_point(point);
        point.y -= height / 2;
        bbox.w  = new_point(point);
        point.x += width;
        bbox.e = new_point(point);
        point.x -= width / 2;
        point.y -= height / 2;
        bbox.n = new_point(point);
        point.y += height;
        bbox.s = new_point(point);
      }

      return bbox;
    }

    return tip;
  };

}));
