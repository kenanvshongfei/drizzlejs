D.Loader = class Loader extends D.Base
    @TemplateCache = {}

    @analyse: (name) ->
        return loader: null, name: name unless D.isString name

        [loaderName, name, args...] = name.split ':'
        if not name
            name = loaderName
            loaderName = null
        loader: loaderName, name: name, args: args

    constructor: (@app) ->
        @name = 'default'
        @fileNames = @app.options.fileNames
        super

    loadResource: (path, plugin) ->
        path = D.joinPath @app.options.scriptRoot, path
        path = plugin + '!' + path if plugin
        deferred = @createDeferred()

        error = (e) ->
            if e.requireModules?[0] is path
                define path, null
                require.undef path
                require [path], ->
                deferred.resolve null
            else
                deferred.reject null
                throw e

        require [path], (obj) =>
            obj = obj(@app) if D.isFunction obj
            deferred.resolve obj
        , error

        deferred.promise()

    loadModuleResource: (module, path, plugin) ->
        @loadResource D.joinPath(module.name, path), plugin

    loadModule: (path, parentModule) ->
        {name} = Loader.analyse path
        @chain @loadResource(D.joinPath name, @fileNames.module), (options) =>
            new D.Module name, @app, @, options

    loadView: (name, module, options) ->
        {name} = Loader.analyse name
        @chain @loadModuleResource(module, @fileNames.view + name), (options) =>
            new D.View name, module, @, options

    loadLayout: (module, name, layout = {}) ->
        {name} = Loader.analyse name
        @chain(
            if layout.templateOnly is false then @loadModuleResource(module, name) else {}
            (options) => new D.Module.Layout name, module, @, D.extend(layout, options)
        )

    innerLoadTemplate: (module, p) ->
        path = p + @fileNames.templateSuffix
        template = Loader.TemplateCache[module.name + path]
        template = Loader.TemplateCache[module.name + path] = @loadModuleResource module, path, 'text' unless template

        @chain template, (t) ->
            if D.isString t
                t = Loader.TemplateCache[path] = Handlebars.compile t
            t

    #load template for module
    loadTemplate: (module) ->
        path = @fileNames.templates
        @innerLoadTemplate module, path

    #load template for view
    loadSeparatedTemplate: (view, name) ->
        path = @fileNames.template + name
        @innerLoadTemplate view.module, path

    loadModel: (name = '', module) ->
        return name if name instanceof D.Model
        name = url: name if D.isString name
        new D.Model(@app, module, name)

    loadHandlers: (view, name) ->
        view.options.handlers or {}

    loadRouter: (path) ->
        {name} = Loader.analyse path
        path = D.joinPath name, @fileNames.router
        path = path.slice(1) if path.charAt(0) is '/'
        @loadResource(path)

D.SimpleLoader = class SimpleLoader extends D.Loader
    constructor: ->
        super
        @name = 'simple'

    loadModule: (path, parentModule) ->
        {name} = Loader.analyse path
        @deferred new D.Module(name, @app, @, separatedTemplate: true)

    loadView: (name, module, item) ->
        {name} = Loader.analyse name
        @deferred new D.View(name, module, @, {})
