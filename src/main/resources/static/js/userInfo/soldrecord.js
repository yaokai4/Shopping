layui.use(['form', 'element', 'util', 'carousel', 'laypage', 'layer','table'], function () {
    var table = layui.table;
    table.render({
        elem: '#sold'
        , url: basePath+'/soldrecord/lookuser'
        , page: {
            layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
            , groups: 3
            , limits: [20, 50, 100]
            , limit: 20
        }, cols: [[
            {field: 'id', title: '注文番号.',width:180, align:'center'}
            , {field: 'commname', title: '名前', width: 280, align:'center'}
            , {field: 'commdesc', title: '説明', width: 600, align:'center'}
            , {field: 'thinkmoney', title: '販売価格', width: 90, align:'center'}
            , {field: 'soldtime', title: '販売時間', width: 160, sort: true, align:'center'}
            , {fixed: 'right', title: '操作', toolbar: '#barDemo', width:145, align:'center'}
        ]]
        ,height: 500
    });
    //监听行工具事件
    table.on('tool(test)', function (obj) {
        var data = obj.data;
        if (obj.event === 'xiangqing') {
            window.open(basePath+"/product-detail/"+data.commid)
        }else if(obj.event === 'shanchujilu'){
            layer.confirm('この記録の削除を確認しますか？', {
                btn: ['確定','NO'], //按钮
                title:"販売記録を削除する",
                offset:"50px"
            }, function(){
                layer.closeAll();
                $.ajax({
                    url: basePath+'/soldrecord/delect/'+data.id,
                    data: "",
                    contentType: "application/json;charset=UTF-8", //发送数据的格式
                    type: "put",
                    dataType: "json", //回调
                    beforeSend: function () {
                        layer.load(1, { //icon支持传入0-2
                            content: '请稍等...',
                            success: function (layero) {
                                layero.find('.layui-layer-content').css({
                                    'padding-top': '39px',
                                    'width': '60px'
                                });
                            }
                        });
                    },
                    complete: function () {
                        layer.closeAll('loading');
                    },
                    success: function (data) {
                        console.log(data)
                        if(data.status===200){
                            layer.msg(data.message, {
                                time: 1000,
                                icon: 1,
                                offset: '50px'
                            }, function () {
                                location.reload();
                            });
                        }else {
                            layer.msg(data.message, {
                                time: 1000,
                                icon: 2,
                                offset: '50px'
                            });
                        }
                    }
                });
            }, function(){
            });
        }
    });
});