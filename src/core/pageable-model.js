PageableModel = D.PageableModel = function() {
    var defaults;
    parent(PageableModel).apply(this, arguments);
    defaults = this.app.options.pagination;

    this.pagination = {
        page: this.options.page || 1,
        pageCount: 0,
        pageSize: this.options.pageSize || defaults.pageSize,
        pageKey: this.options.pageKey || defaults.pageKey,
        pageSizeKey: this.options.pageSizeKey || defaults.pageSizeKey,
        recordCountKey: this.options.recordCountKey || defaults.recordCountKey
    };
};

extend(PageableModel, Model, {
    initialize: function() {
        this.data = this.options.data || [];
    },

    set: function(data, trigger) {
        var p = this.pagination;
        data || (data = {});
        p.recordCount = data[p.recordCountKey] || 0;
        p.pageCount = Math.ceil(p.recordCount / p.pageSize);
        PageableModel.__super__.set.call(this, data, trigger);
    },

    getParams: function() {
        var params = PageableModel.__super__.getParams.call(this) || {},
            p = this.pagination;
        params[p.pageKey] = p.page;
        params[p.pageSizeKey] = p.pageSize;
        if (this.app.options.pagination.params) {
            params = this.app.options.pagination.params(params);
        }
        return params;
    },

    clear: function() {
        this.pagination.page = 1;
        this.pagination.recordCount = 0;
        this.pagination.pageCount = 0;
        PageableModel.__super__.clear.call(this);
    },

    turnToPage: function(page) {
        if (page <= this.pagination.pageCount && page >= 1) this.pagination.page = page;
        return this;
    },

    firstPage: function() { return this.turnToPage(1); },
    lastPage: function() { this.turnToPage(this.pagination.pageCount); },
    nextPage: function() { this.turnToPage(this.pagination.page + 1); },
    prevPage: function() { this.turnToPage(this.pagination.page - 1); },

    getPageInfo: function() {
        var p = this.pagination, d;
        if (this.data.length > 0) {
            d = {
                page: p.page, start: (p.page - 1) * p.pageSize + 1,
                end: p.page * p.pageSize, total: p.recordCount
            };
        } else {
            d = { page: p.page, start: 0, end: 0, total: 0 };
        }

        if (d.end > d.total) d.end = d.total;
        return d;
    }
});

Model.register('pageable', PageableModel);
