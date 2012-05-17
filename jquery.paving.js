(
function($, window) {

var DEFAULT_OPTIONS = {
  selector: '.stone',
  marking: 'paved',
  callback: function () {},
  finish: function () {}
};

var MILSEC_FINISH = 13;

/**
 * short and simple way to layout block elements into neatly
 * tightly packed.
 */
$.fn.paving = function () {
  var method, opts, args;

  // determin method, opts and arguments
  if (typeof arguments[0] === 'string') {
    method = arguments[0].toLowerCase();
    opts = arguments[1];
    args = Array.prototype.slice.call(arguments, 2);
  }
  else {
    method = 'init';
    opts = arguments[0];
    args = Array.prototype.slice.call(arguments, 2);
  }

  var pave = function (parent, isAppending) {
    var i;
    var len;
    var $parent = $(parent);
    var defaults = getDefaults($parent, opts);
    var $items = $parent.find( buildSelector(defaults.selector, (isAppending ? defaults.marking : undefined)) );
    if (typeof defaults.lefts === 'undefined') {
      isAppending = false;
    }
    if ($items.length === 0) {
      // console.log('no elements to pave');
      return;
    }
    if (!isAppending) {
      $.extend(defaults, buildFundamentals($parent, $items.first()));
    }
    for(i = 0, len = $items.length; i < len; ++i) {
      defaults.callback(
        paveStone($items[i], defaults, i)
      );
    }
    $parent.height( defaults.column[findColumnIndex(defaults.column, true)] );
    setTimeout(
      function () {
        defaults.finish();
      },
      MILSEC_FINISH
    );
  };

  var paveStone = function (item, defaults, i, index) {
    var container_offset = defaults.container_offset;
    var column = defaults.column;
    var lefts = defaults.lefts;
    var marking = defaults.marking;
    var column_len = defaults.column_len;
    var $item = $(item);
    var height = $item.outerHeight(true);

    if (index !== undefined) {
      index = parseInt(index, 10);
      if (isNaN(index) || index >= column_len) {
        index = undefined;
      }
    }
    if (index === undefined) {
      if (i !== undefined && i < column_len) {
        index = i;
      }
      else {
        index = findColumnIndex(column);
      }
    }

    // marking        
    var obj =  {
      position: 'absolute',
      left: container_offset.left + lefts[index],
      top: container_offset.top + column[index]
    };
    $item.css(obj);
    $item.data('height', height);
    $item.attr('data-' + marking, 'true');
    column[index] = column[index] + height;

    return item;
  };

  // ==============================

  var getDefaults = function ($parent, opts) {
    var name;
    var defaults = $parent.data('paving-defaults');
    if (!defaults) {
      defaults = $.extend({}, DEFAULT_OPTIONS, opts || {});
      $parent.data('paving-defaults', defaults);
    }
    else {
      for (name in opts) {
        defaults[name] = opts[name];
      }
    }
    return defaults;
  };

  var findColumnIndex = function (col, isTallest) {
    var index;
    var result = 0;
    isTallest = isTallest || false;
    for (index in col) {
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
    var result = parseInt(val, 10);
    def = def || 0;
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

  var buildFundamentals = function ($parent, $firstItem) {
    var container_width = $parent.width();
    var item_width = $firstItem.outerWidth(true);    
    var container_offset = {
      left: getInt($parent.css('padding-left')),
      top: getInt($parent.css('padding-top'))
    };
    var lefts = [];
    var column = {};
    var column_len = Math.floor(container_width / item_width);
    var i;
    for (i = 0; i < column_len; ++i) {
      column[i] = 0;
      lefts[i] = item_width * i;
    }
    return {
      container_offset: container_offset,
      lefts: lefts,
      column: column,
      column_len: column_len
    };
  };

  // ==============================

  var methods = {
    init: function (i, elm) {
      pave(this);
      return this;
    },
    append: function (i, elm) {
      pave(this, true); 
      return this;
    },
    add: function (i) {
      var $this = $(this);
      var def = getDefaults($this, opts);
      var $item = $(args[0]);
      var index = args[1];
      $this.append($item);
      paveStone($item[0], def, undefined, index);
      $this.height( def.column[findColumnIndex(def.column, true)] );
      setTimeout(
        function () {
          def.finish();
        },
        MILSEC_FINISH
      );
      return this;
    }
  };

  return this.each(methods[method]);
};

})(jQuery, window);