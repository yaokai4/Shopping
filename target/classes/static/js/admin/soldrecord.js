layui.use(['form', 'element', 'util', 'carousel', 'laypage', 'layer','table'], function () {
    var table = layui.table;
    table.render({
        elem: '#adminsold'
        , url: basePath+'/soldrecord/queryall'
        , page: {
            layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
            , groups: 3
            , limits: [20, 50, 100]
            , limit: 20
        }, cols: [[
            {field: 'id', title: '注文番号.',width:180, align:'center'}
            , {field: 'commname', title: '名前', width: 300, align:'center'}
            , {field: 'commdesc', title: '説明', width: 639, align:'center'}
            , {field: 'thinkmoney', title: '販売価格', width: 80, align:'center'}
            , {field: 'soldtime', title: '販売時間.', width: 160,sort: true, align:'center'}
            , {fixed: 'right', title: '操作', toolbar: '#barDemo', width:100, align:'center'}
        ]]
        ,height: 500
    });
    //监听行工具事件
    table.on('tool(test)', function (obj) {
        var data = obj.data;
        if (obj.event === 'xiangqing') {
            window.open(basePath+"/product-detail/"+data.commid)
        }
    });
});