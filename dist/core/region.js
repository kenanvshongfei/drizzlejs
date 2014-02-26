// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jquery', 'underscore', './base'], function($, _, Base) {
    var Region;
    Region = (function(_super) {
      __extends(Region, _super);

      Region.types = {};

      Region.register = function(name, clazz) {
        return this.types[name] = clazz;
      };

      Region.create = function(type, app, module, name, el) {
        var clazz;
        clazz = this.types[type] || Region;
        return new clazz(app, module, name, el);
      };

      function Region(app, module, name, el) {
        this.app = app;
        this.module = module;
        this.name = name;
        this.id = _.uniqueId('R');
        this.el = el instanceof $ ? el : $(el);
        Region.__super__.constructor.apply(this, arguments);
      }

      Region.prototype.initialize = function() {
        if (this.el.size() === 0) {
          return this.logger.warn("DOM element: " + el + " not exists");
        }
      };

      Region.prototype.getEl = function() {
        return this.el;
      };

      Region.prototype.show = function(item, options) {
        var deferred,
          _this = this;
        deferred = this.createDeferred();
        if (_.isString(item)) {
          this.app.getLoader(item).loadModule(item).done(function(module, args) {
            return _this.showItem(module, options, deferred);
          });
        } else {
          this.showItem(item, options, deferred);
        }
        return deferred;
      };

      Region.prototype.close = function() {
        if (!this.currentItem) {
          return;
        }
        return this.chain('close item:' + this.currentItem.name, function() {
          return this.currentItem.close();
        }, function() {
          this.empty();
          this.currentItem = null;
          return this;
        });
      };

      Region.prototype.delegateEvent = function(item, name, selector, fn) {
        var n;
        n = "" + name + ".events" + this.id + item.id;
        if (selector) {
          return this.el.on(n, selector, fn);
        } else {
          return this.el.on(n, fn);
        }
      };

      Region.prototype.undelegateEvents = function(item) {
        return this.el.off(".events" + this.id + item.id);
      };

      Region.prototype.$$ = function(selector) {
        return this.el.find(selector);
      };

      Region.prototype.empty = function() {
        return this.getEl().empty();
      };

      Region.prototype.showItem = function(item, options, deferred) {
        if (!(item && item.render && item.setRegion)) {
          this.logger.warn("try to show an item which is neither a view nor a module");
          return deferred.reject(item);
        }
        if (item.region && item.region.id === this.id) {
          return this.chain('show item:' + item.name, item.render(options), function() {
            return deferred.resolve(item);
          });
        }
        return this.chain('show item:' + item.name, [
          function() {
            if (item.region) {
              return item.region.close();
            }
          }, function() {
            return this.close();
          }
        ], function() {
          this.currentItem = item;
          return item.setRegion(this);
        }, function() {
          return item.render(options);
        }).done(function() {
          return deferred.resolve(item);
        });
      };

      return Region;

    })(Base);
    return Region;
  });

}).call(this);