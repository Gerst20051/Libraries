dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.io.script");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileReadStore");

dojo.ready(function () {
    var checks = dojo.query("input[type=checkbox]").map(function (el) {
        return new dijit.form.CheckBox({ checked: true, value: el.value }, el);
    }),
        structure = [
            { field: "title", name: "Title", width: "650px" },
            { field: "creator", name: "Author", width: "auto" },
            { field: "pubDate", name: "Date", width: "auto" }
        ],
        grid = new dojox.grid.DataGrid({
            structure: structure,
            sortInfo: "-3",
            query: { title: "*" }
        }, "table");
        grid.queryOptions = { ignoreCase: true }

    filterBox.set("onChange", function () {
        grid.filter({ title: "*" + filterBox.get("value") + "*" });
    });

    update.set("onClick", function () {
        getTuts( getQuery(checks) )
            .then(function (tutsDataStore) {
                grid.setStore(tutsDataStore);
            });
    });

    getTuts( getQuery(checks) )
        .then(function (tutsDataStore) {
            grid.set("store", tutsDataStore);
            grid.startup();
        });

});

function getQuery (checks) {
    var urls = [];
    dojo.forEach(checks, function (check) {
        if ( check.get("checked") === true) {
            urls.push("'http://feeds.feedburner.com/" + check.get("value") + "'");
        }
    });

    return "select creator, pubDate, title from rss where url in (" + urls.join(", ") + ")";
}

function getTuts (query) {
    return dojo.io.script.get({
        url: "http://query.yahooapis.com/v1/public/yql",
        content: {
            q: query,
           format: "json"
        },
        callbackParamName: "callback"
    }).then(function (data) {
        var items = data.query.results.item,
            typemap = {
                "Date" : {
                    deserialize: function (value) {
                        value = new Date(value);
                        var month = value.getMonth(),
                            date  = value.getDate();
                        
                        month = (month < 10) ? "0" + month : month;
                        date  = (date  < 10) ? "0" + date  : date;

                        return value.getFullYear() + "-" + month + "-" + date; // YYYY-MM-DD
                    }
                }
            };

        dojo.forEach(items, function (item) {
            item.creator = (typeof item.creator === 'string') ? item.creator : item.creator.content;
            item.pubDate =  { _value : item.pubDate, _type: "Date" };
        });

        return new dojo.data.ItemFileReadStore({
            data: { items: items },
            typeMap: typemap
        });
    });
}
