$(document).ready(function() {
    $('table').DataTable({
        scrollX: true,
        autoWidth: false,
        width: 100,
        serverSide: true,
        deferRender: true,
        ordering: false,
        dom: 'rtip',
        language: DataTableLanguage,
        ajax: {
            url: '/getData/viceunionplayer',
            type: 'GET'
        },
        "columns": [
            { "data": "uid" },
            { "data": "nickname" },
            { "data": "pid" },
            { "data": "pusername" },
            { "data": "card" },
            { "data": "ticket" },
            { "data": "totalmoney" },
            { "data": "totalcard" },
            { "data": "type" },
            {
                "data": "registerTime",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            },
            { "data": "remarks" },
            {
                "data": null,
                "bSortable": false,
                "title": "操作",
                "defaultContent": '<p><button type="button" class="btn btn-primary">修改玩家备注</button>&nbsp;<button type="button" class="btn btn-primary">会长</button></p>'
            }
        ]
    });
});