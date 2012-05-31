(function($) {

var DEFAULT_OPTIONS = {
  selector: '.stone',
  marking: 'paved',
  callback: null,
  finish: null
};

var MILSEC_FINISH = 13;

/**
 * jQuery.paving
 * (c) 2012, Takashi Mizohata
 * http://beatak.github.com/jquery-paving/
 * MIT LICENSE
 */
$.fn.paving = function () {
  var method, opts, args;

  // determine method, opts and arguments
  if (typeof arguments[0] === 'string') {
    method = arguments[0].toLowerCase();

    if (!arguments[1] || (typeof arguments[1] === 'object' && !isDOM(arguments[1]))) {
      opts = arguments[1];
      args = Array.prototype.slice.call(arguments, 2);
    }
    else {
      opts = undefined;
      args = Array.prototype.slice.call(arguments, 1);
    }
  }
  else {
    method = 'init';
    opts = arguments[0];
    args = Array.prototype.slice.call(arguments, 2);
  }

  // ==============================

  var methods = {
    init: function (i, elm) {
      pave(this, opts);
      return this;
    },
    append: function (i, elm) {
      pave(this, opts, true); 
      return this;
    },
    add: function (i, elm) {
      var $this = $(this);
      var def = getDefaults($this, opts, true);
      var $item = $(args[0]);
      if ($item.length === 0) {
        // console.log('nothing is to pave.');
        return this;
      }
      if (typeof def.lefts === 'undefined') {
        $.extend(def, buildFundamentals($this, $item.first()));
      }
      $this.append($item);
      paveStone($item[0], def, args[1]);
      if (typeof def.callback === 'function') {
        def.callback($item[0], def.column);
      }
      finishPaving($this, def.finish, def.column);
      return this;
    },
    clear: function (i, elm) {
      clear(this, opts);
      return this;
    },
    refresh: function (i, elm) {
      clear(this, opts);
      pave(this, opts);
      return this;
    }
  };

  return this.each(methods[method]);
};

// ==============================

var pave = function (parent, opts, isAppending) {
  var i;
  var len;
  var elm;
  var $items;
  var $parent = $(parent);
  var defaults = getDefaults($parent, opts);
  if (typeof defaults.lefts === 'undefined') {
    isAppending = false;
  }
  $items = $parent.find( buildSelector(defaults.selector, (isAppending ? defaults.marking : undefined)) );
  if ($items.length === 0) {
    // console.log('no elements to pave');
    return;
  }
  if (!isAppending) {
    // it looks a bit confusing, since all options are stored in defaults,
    // but buildFundamentals() won't change things like selector nor callback/finish
    $.extend(defaults, buildFundamentals($parent, $items.first()));
  }
  for (i = 0, len = $items.length; i < len; ++i) {
    elm = paveStone($items[i], defaults);
    if (typeof defaults.callback === 'function') {
      defaults.callback(elm, defaults.column);
    }
  }
  finishPaving($parent, defaults.finish, defaults.column);
};

var paveStone = function (item, defaults, index) {
  var obj;
  var container_offset = defaults.container_offset;
  var column = defaults.column;
  var lefts = defaults.lefts;
  var marking = defaults.marking;
  var column_len = defaults.column_len;
  var count = defaults.count;
  var $item = $(item);
  var height = $item.outerHeight(true);

  if (index !== undefined) {
    index = parseInt(index, 10);
    if (isNaN(index) || index >= column_len) {
      index = undefined;
    }
  }
  if (index === undefined) {
    index = findColumnIndex(column);
  }

  // marking        
  obj =  {
    position: 'absolute',
    left: container_offset.left + lefts[index],
    top: container_offset.top + column[index]
  };
  $item.css(obj);
  $item.data('height', height);
  $item.attr('data-' + marking, 'true');
  column[index] = column[index] + height;
  ++defaults.count;

  return item;
};

var finishPaving = function ($parent, finish, column) {
  $parent.height( column[findColumnIndex(column, true)] );

  if (typeof finish !== 'function') {
    return;
  }
  setTimeout(
    function () {
      finish(column);
    },
    MILSEC_FINISH
  );
};

var getDefaults = function ($parent, opts, isNotModifying) {
  var name;
  var defaults = $parent.data('paving-defaults');
  isNotModifying = isNotModifying || false;
  if (!defaults) {
    defaults = $.extend({}, DEFAULT_OPTIONS, opts || {});
    $parent.data('paving-defaults', defaults);
  }
  else {
    if (isNotModifying) {
      defaults = $.extend({}, defaults);
    }
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
  loop:for (index in col) {
    index = parseInt(index, 10);
    if (index === 0) {
      result = index;
      if (isTallest) {
        continue loop;
      }
    }
    if (isTallest) {
      if (col[index] > col[result]) {
        result = index;
      }
    }
    else {
      if (col[index] === 0) {
        result = index;
        break loop;
      }
      if (col[index] < col[result]) {
        result = index;
      }
    }
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
    column_len: column_len,
    count: 0
  };
};

var getInt = function (val, def) {
  var result = parseInt(val, 10);
  def = def || 0;
  if (isNaN(result)) {
    result = def;
  }
  return result;
};

var isDOM = function (element) {
  var result = false;
  if (element.nodeType && element.nodeType === 1) {
    result = true;
  }
  return result;
};

var clear = function (parent, opts) {
  var $parent = $(parent);
  var def = getDefaults($parent, opts, true);
  $parent.find(def.selector)
    .removeAttr('style')
    .each(
      function (i, elm) {
        var data = $(elm).data();
        delete data[def.marking];
      }
    );
};

})(jQuery);