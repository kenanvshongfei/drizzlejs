Factory = D.Factory = {

    types: {},

    register: function(name, type) { this.types[name] = type; },

    create: function(type) {
        var args = slice.call(arguments, 1),
            result, child, Ctor = function() {};

        type = this.types[type] || this;
        Ctor.prototype = type.prototype;
        child = new Ctor();
        result = type.apply(child, args);

        return Object(result) === result ? result : child;
    }

};
