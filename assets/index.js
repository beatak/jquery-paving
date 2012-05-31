Array.prototype.shuffle = function () {
  var tmp, current, top = this.length;
  if (top) {
    while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = this[current];
      this[current] = this[top];
      this[top] = tmp;
    }
  }
  return this;
};

// ===================================

(
function () {
  var images = ["assets/cities/w278/aep.jpg", "assets/cities/w278/bog.jpg", "assets/cities/w278/bom.jpg", "assets/cities/w278/cai.jpg", "assets/cities/w278/can.jpg", "assets/cities/w278/ccu.jpg", "assets/cities/w278/cgk.jpg", "assets/cities/w278/dac.jpg", "assets/cities/w278/del.jpg", "assets/cities/w278/hkg.jpg", "assets/cities/w278/ist.jpg", "assets/cities/w278/khi.jpg", "assets/cities/w278/lax.jpg", "assets/cities/w278/lcy.jpg", "assets/cities/w278/lim.jpg", "assets/cities/w278/los.jpg", "assets/cities/w278/mex.jpg", "assets/cities/w278/mnl.jpg", "assets/cities/w278/mow.jpg", "assets/cities/w278/nyc.jpg", "assets/cities/w278/osa.jpg", "assets/cities/w278/pek.jpg", "assets/cities/w278/rio.jpg", "assets/cities/w278/sha.jpg", "assets/cities/w278/thr.jpg", "assets/cities/w278/tyo.jpg"];
  var template = {};
  var tmpkeys = ['stone'];



  var init = function () {
    var key;
    for (var i = 0, len = tmpkeys.length; i < len; ++i) {
      key = tmpkeys[i];
      template[ key ] = $.trim( $('#tmpl-' + key).html() );
    }

    addFive();

    $('#add-five').click(addFive);
    $('#add-one').click(addOne);
    $('#add-by-index').click(addByIndex);
    $(window).resize(onWindowResize);
  };

  // ===================================

  var pave_callback = function (elm) {
    $(elm).hide().css('visibility', 'visible').fadeIn();
  };

  var pave_finish = function (column) {
    $('html:not(:animated),body:not(:animated)').animate(
      {
        scrollTop: $('#container').height()
      },
      500
    );
  };

  var adding = function (len, cb) {
    images.shuffle();
    var $container = $('#container');
    for (var i = 0; i < len; ++i) {
      $container.append(Mustache.render(template.stone, {src: images[i]}));
    }
    $container.imageloader(
      {
        selector: '.lazy-img',
        callback: function () {
          $container.paving(
            'append', 
            {
              callback: pave_callback, 
              finish: function () {
                pave_finish();
                if (cb && typeof cb === 'function') {
                  cb();
                }
              }
            }
          );
        }
      }
    );
  }

  var getInt = function (val) {
    var result = parseInt(val, 10);
    if (isNaN(result)) {
      result = 0;
    }
    return result;
  };

  var changeCss = function () {
    var x = document.styleSheets[0];
    x.insertRule('#container > .stone {width: 200px;}',x.cssRules.length);
    x.insertRule('#container > .stone > img {width: 200px;}',x.cssRules.length);
  };

  var disableButton = function () {
    $('.adding-button').prop('disabled', true);
  };

  var enableButton = function () {
    $('.adding-button').prop('disabled', false);
  };

  var addOne = function (ev) {
    disableButton();
    adding(1, enableButton);
  };

  var addFive = function (ev) {
    disableButton();
    adding(5, enableButton);
  };

  var addByIndex = function (ev) {
    disableButton();
    images.shuffle();
    var index = getInt( $('#add-index').val() );
    $('#add-index').val(index);
    var $container = $('#container');
    var html = Mustache.render(template.stone, {src: images[0]});
    $('#bullpen').append(html);
    $('#bullpen').imageloader(
      {
        selector: '.lazy-img',
        callback: function (elm) {
          $container.paving(
            'add', 
            {
              callback: pave_callback, 
              finish: function () {
                pave_finish();
                enableButton();
              }
            },
            $(elm).find('.stone')[0],
            index
          );
        }
      }
    );
  };

  var int_timeout_resize = null;
  var onWindowResize = function (ev) {
    if (int_timeout_resize) {
      clerTimeout(int_timeout_resize);
    }
    int_timeout_resize = setTimeout(onWindowResizeImpl, 17);
  };

  var onWindowResizeImpl = function (ev) {
    int_timeout_resize = null;
    var $container = $('#container');
    $container.paving('clear');
    var width = $(window).width();
    var $body = $(document.body);
    var bpleft = getInt( $body.css('padding-left') );
    var bpright = getInt( $body.css('padding-right') );
    var smleft = getInt( $('.stone').css('margin-right') );
    var imgw = Math.round( (width - bpleft - bpright) / 5 - 6);
    var x = document.styleSheets[0];
    x.insertRule( '#container > .stone {width: ' + imgw + 'px;}', x.cssRules.length);
    x.insertRule( '#container > .stone > img {width: ' + imgw + 'px;}', x.cssRules.length);
    $container.paving();
  };

  $(init);

})();