(
function($, window) {

var DEFAULT_OPTIONS = {
  selector: '.stone',
  marking: 'paved',
  callback: function () {}
};

/**
 * short and simple way to layout block elements into neatly
 * tightly packed.
 */
$.fn.paving = function () {
  var method, opts;
  if (typeof arguments[0] === 'string') {
    method = arguments[0].toLowerCase();
    opts = arguments[1];
  }
  else {
    method = 'init';
    opts = arguments[0];
  }

  var getDefaults = function ($parent, opts) {
    var defaults = $parent.data('paving-defaults');
    if (!defaults) {
      defaults = $.extend({}, DEFAULT_OPTIONS, opts || {});
      $parent.data('paving-defaults', defaults);
    }
    else {
      for (var name in opts) {
        defaults[name] = opts[name];
      }
    }
    return defaults;
  };

  var findColumnIndex = function (col, isTallest) {
    isTallest = isTallest || false;
    var result = 0;
    for (var index in col) {
      if (index === 0) {
        result = index;
      }
      else {
        if (isTallest) {
          if (col[index] > col[result]) {
            result = index;
          }
        }
        else {
          if (col[index] < col[result]) {
            result = index;
          }
        }
      }
    }
    return result;
  };

  var getInt = function (val, def) {
    def = def || 0;
    var result = parseInt(val, 10);
    if (isNaN(result)) {
      result = def;
    }
    return result;
  };

  var buildSelector = function (selector, marking) {
    var result;
    if (marking) {
      result = [selector, ':not([data-', marking, '])'].join('');
    }
    else {
      result = selector;
    }
    return result;
  };

  var pave = function (parent, isAppending) {
    var i, len; // for loop counter.
    var container_offset, lefts, column; // you always need them.
    var $parent = $(parent);
    var defaults = getDefaults($parent, opts);
    if (typeof defaults.lefts === 'undefined') {
      isAppending = false;
    }
    var selector = buildSelector(defaults.selector, (isAppending ? defaults.marking : undefined));
    var $items = $parent.find(selector);
    if ($items.length === 0) {
      // console.log('no elements to pave');
      return;
    }
    if (isAppending) {
      container_offset = defaults.container_offset;
      lefts = defaults.lefts;
      column = defaults.column;
    }
    else {
      defaults.container_offset = container_offset = {
        left: getInt($parent.css('padding-left')),
        top: getInt($parent.css('padding-top'))
      };
      defaults.lefts = lefts = [];
      defaults.column = column = {};

      var container_width = $parent.width();
      var item_width = $items.first().outerWidth(true);
      var column_len = Math.floor(container_width / item_width);

      for (i = 0, len = column_len; i < len; ++i) {
        column[i] = 0;
        lefts[i] = item_width * i;
      }
    }

    var $item, height, index;
    for(i = 0, len = $items.length; i < len; ++i) {
      $item = $($items[i]);
      height = $item.outerHeight(true);

      if (column_len && i < column_len) {
        index = i;
      }
      else {
        index = findColumnIndex(column);
      }

      // marking        
      var obj =  {
        position: 'absolute',
        left: container_offset.left + lefts[index],
        top: container_offset.top + column[index]
      };
      $item.css(obj);
      $item.data('height', height);
      $item.attr('data-' + defaults.marking, 'true');
      column[index] = column[index] + height;
      defaults.callback($item[0]);
    }
    $parent.height(column[findColumnIndex(column, true)]);
  };

  // ==============================

  var methods = {
    init: function (i) {
      pave(this);
      return this;
    },
    append: function (i) {
      pave(this, true); 
      return this;
    }
  };

  return this.each(methods[method]);
};

})(jQuery, window);