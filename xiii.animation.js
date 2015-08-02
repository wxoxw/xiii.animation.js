(function(window) {

  "use strict";

  var document = window.document,
    animation = {},
    vendorPrefix = {},
    inherit;

  (function() {

    var elem = document.createElement("div");

    if ( "transform" in elem.style ) {

      vendorPrefix.transform = "transform";

    } else if ( "webkitTransform" in elem.style ) {

      vendorPrefix.transform = "webkitTransform";

    }

    if ( "transition" in elem.style ) {

      vendorPrefix.transition = "transition";
      vendorPrefix.transitionend = "transitionend";

    } else if ( "webkitTransition" in elem.style ) {

      vendorPrefix.transition = "webkitTransition";
      vendorPrefix.transitionend = "webkitTransitionEnd";

    }

  })();

  if ( !window.addEventListener || !vendorPrefix.transform || !vendorPrefix.transition ) { return; }

  // JavaScript Ninjaの極意 (John Resig & Bear Bibeault著) を参考に
  inherit = (function() {

    var superPattern = /\b_super\b/;

    return function(_super, properties) {

      var _super = _super.prototype, prototype;

      prototype = Object.create(_super);

      for ( var name in properties ) {

        if ( typeof properties[name] === "function" && typeof _super[name] === "function" && superPattern.test(properties[name]) ) {

          prototype[name] = (function(name, fn) {

            return function() {

              this._super = _super[name];

              var result = fn.apply(this, arguments);

              delete this._super;

              return result;
            };

          })(name, properties[name]);

        } else {

          prototype[name] = properties[name];

        }

      }

      function AnimationClass() { typeof this.init === "function" && this.init.apply(this, arguments); }

      AnimationClass.prototype = prototype;

      AnimationClass.constructor = AnimationClass;

      return AnimationClass;

    };

  })();

  animation.Core = inherit(Object, {

    init: function() {

      this.state = 0;

    },

    dispose: function() {

      delete this.state;

    },

    start: function() {

      if ( this.state === 1 ) { return this; }

      this.state = 1;

      var _this = this;

      if ( this.parent ) {

        typeof this.onStart === "function" && this.onStart();

      } else {

        setTimeout(function() {

          typeof _this.onStart === "function" && _this.onStart();

        }, 1);

      }

      return this;

    },

    stop: function() {

      if ( this.state === 0 ) { return this; }

      this.state = 0;

      typeof this.onStop === "function" && this.onStop();

      return this;

    },

    toggle: function() {

      this.state ? this.stop() : this.start();

    },

    complete: function() {

      this.state = 0;

      typeof this.onComplete === "function" && this.onComplete();

      this.parent && this.parent.notifyCompletion();

    }

  });

  animation.To = inherit(animation.Core, {

    init: function(target, properties, time, ease, delay) {

      if ( !( target instanceof Element ) || typeof properties !== "object" ) { throw new TypeError; }

      this._super();

      var _this = this;

      this.target = target;
      this.properties = properties;
      this.time = typeof time === "number" ? time : 1;
      this.ease = typeof ease === "string" ? ease : "ease";
      this.delay = typeof delay === "number" ? delay : 0;
      this.timeoutId = 0;
      this.transitionEndListener = function() { _this.complete(); };

    },

    dispose: function() {

      delete this.target;
      delete this.properties;
      delete this.time;
      delete this.ease;
      delete this.delay;
      delete this.timeoutId;
      delete this.transitionEndListener;

      this._super();

    },

    onStart: function() {

      var _this = this;

      for ( var name in this.properties ) {

        if ( vendorPrefix[name] ) {

          this.target.style[vendorPrefix[name]] = this.properties[name];

        } else {

          this.target.style[name] = this.properties[name];

        }

      }

      // Google Chrome 対策
      this.target.style.webkitPaddingAfter = Math.random() / 10 + "px";

      this.timeoutId = window.setTimeout(function() {

        _this.target.addEventListener(vendorPrefix.transitionend, _this.transitionEndListener, false);

      }, this.time * 500);

      this.target.style[vendorPrefix.transition] = "all " + this.time + "s " + this.ease + " " + this.delay + "s";

    },

    onStop: function() {

      window.clearTimeout(this.timeoutId);

      this.target.removeEventListener(vendorPrefix.transitionend, this.transitionEndListener, false);

      var computedStyle = document.defaultView.getComputedStyle(this.target, "");

      for ( var i = 0, l = this.target.style.length; i < l; i++ ) {

        this.target.style[this.target.style[i]] = computedStyle[this.target.style[i]];

      }

      this.target.style.removeProperty(vendorPrefix.transition);
      this.target.style.webkitPaddingAfter = null;

    },

    onComplete: function() {

      this.target.removeEventListener(vendorPrefix.transitionend, this.transitionEndListener, false);

      this.target.style.removeProperty(vendorPrefix.transition);
      this.target.style.webkitPaddingAfter = null;

    }

  });

  animation.Log = inherit(animation.Core, {

    init: function(message) {

      this._super();

      this.message = message;

    },

    dispose: function() {

      delete this.message;

      this._super();

    },

    onStart: function() {

      window.console.log(this.message);

      this.complete();

    }

  });

  animation.Wait = inherit(animation.Core, {

    init: function(time) {

      this._super();

      this.time = time;
      this.timeoutId = 0;

    },

    dispose: function() {

      delete this.time;
      delete this.timeoutId;

      this._super();

    },

    onStart: function() {

      var _this = this;

      this.timeoutId = window.setTimeout(function() { _this.complete(); }, this.time * 1000);

    },

    onStop: function() {

      window.clearTimeout(this.timeoutId);

    }

  });

  animation.Function = inherit(animation.Core, {

    init: function(fn) {

      this._super();

      this.fn = typeof fn === "function" ? fn : function() {};

    },

    dispose: function() {

      delete this.fn;

      this._super();

    },

    onStart: function() {

      this.fn();

      this.complete();

    }

  });

  animation.Group = inherit(animation.Core, {

    init: function() {

      this._super();

      this.children = [];
      this.index = 0;

    },

    dispose: function() {

      for ( var i = 0, l = this.children.length; i < l; i++ ) { this.children[i].dispose(); }

      this.removeChild();

      delete this.children;
      delete this.index;

      this._super();

    },

    addChild: function(child) {

      var _this = this;

      for ( var i = 0, l = arguments.length; i < l; i++ ) {

        child = _convert(arguments[i]);

        if ( child === this || child.parent === this || !( child instanceof animation.Core ) ) { continue; }

        child.parent && child.parent.removeChild(child);

        this.children.push(child);

        child.parent = this;

      }

      function _convert(obj) {

        if ( obj instanceof animation.Core ) { return obj; }
        if ( typeof obj === "number" ) { return new animation.Wait(obj); }
        if ( typeof obj === "string" ) { return new animation.Log(obj); }
        if ( typeof obj === "function" ) { return new animation.Function(obj); }

        if ( Array.isArray(obj) ) {

          if ( _this instanceof animation.Serial ) {

            var parallel = new animation.Parallel;

            parallel.addChild.apply(parallel, obj);

            return parallel;

          } else {

            var serial = new animation.Serial;

            serial.addChild.apply(serial, obj);

            return serial;

          }
        }
      }

    },

    removeChild: function(a) {

      var _this = this;

      if ( !arguments.length ) { return _removeAllChildren(); }
      return _removeChild(a);

      function _removeChild(child) {

        var l = _this.children.length, i;

        for ( i = 0; i < l; i++ ) {

          if ( child === _this.children[i] ) {

            _this.children.splice(i, 1);

            delete child.parent;

            return;
          }
        }
      }

      function _removeAllChildren() {

        for ( var i = 0, l = _this.children.length; i < l; i++ ) { delete _this.children[i].parent; }

        this.children = [];

      }

    },

    getChild: function(index) { return this.children[index]; }

  });

  animation.Serial = inherit(animation.Group, {

    onStart: function() {

      this.index = 0;

      this.children.length && this.getChild(0).start();

    },

    onStop: function() {

      this.getChild(this.index).stop();

    },

    notifyCompletion: function() {

      var child = this.getChild(++this.index);

      child ? child.start() : this.complete();

    }

  });

  animation.Parallel = inherit(animation.Group, {

    onStart: function() {

      this.index = 0;

      for ( var i = 0, numChildren = this.children.length; i < numChildren; i++ ) { this.getChild(i).start(); }

    },

    onStop: function() {

      for ( var i = 0, numChildren = this.children.length; i < numChildren; i++ ) { this.getChild(i).stop(); }

    },

    notifyCompletion: function() {

      this.children.length === ++this.index && this.complete();

    }

  });

  animation.Loop = inherit(animation.Serial, {

    notifyCompletion: function() {

      ( this.getChild(++this.index) || this.getChild(this.index = 0) ).start();

    }

  });

  window.XIII || ( window.XIII = {} );

  window.XIII.animation = {

    to: function(target, properties, time, ease, delay) {

      return new animation.To(target, properties, time, ease, delay);

    },

    serial: function() {

      var serial = new animation.Serial;

      serial.addChild.apply(serial, arguments);

      return serial;

    },

    parallel: function() {

      var parallel = new animation.Parallel;

      parallel.addChild.apply(parallel, arguments);

      return parallel;

    },

    loop: function() {

      var loop = new animation.Loop;

      loop.addChild.apply(loop, arguments);

      return loop;

    }

  };

})(window);