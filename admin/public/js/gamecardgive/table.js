var tableRecord = null;
$(document).ready(function() {
    $("#datetime-date").setFormData({
        from: moment().subtract(1, "d").subtract(7, "d").format("YYYY-MM-DD"),
        to: moment().subtract(1, "d").format("YYYY-MM-DD")
    });
    tableRecord = $('#table-record').DataTable({
        scrollX: true,
        serverSide: true,
        dom: 'rtip',
        autoWidth: true,
        deferRender: false,
        ordering: true,
        language: DataTableLanguage,
        order: [
            [0, "desc"]
        ],
        ajax: {
            url: '/getData/mysql/gamecardgive',
            type: 'POST',
            data: function(v) {
                var cond = $("#query-cond").getFormData();
                v.where = {
                    "$and": [
                        { "date": { "$gte": moment(cond.from).format("YYYY-MM-DD") } },
                        { "date": { "$lte": moment(cond.to).format("YYYY-MM-DD") } }
                    ]
                };
            }
        },
        "columns": [{
                "data": "date"
            },
            {
                "data": "acount"
            },
            {
                "data": "fcount"
            },
            {
                "data": "rcount",
            },
            {
                "data": "scount"
            },
            {
                "data": "dcount"
            }
        ]
    });

    $('#table-record tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#table-record tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 
});

function getSelectData() {
    return tableRecord.row('.selected').data();
}

function loadData() {
    tableRecord.ajax.reload();
}