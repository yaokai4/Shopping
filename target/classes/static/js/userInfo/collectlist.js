layui.use(['form', 'element', 'util', 'carousel', 'laypage', 'layer','table'], function () {
    var table = layui.table;
    table.render({
        elem: '#collect'
        , url: basePath+'/user/collect/queryall'
        , page: {
            layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
            , groups: 3
            , limits: [20, 50, 100]
            , limit: 20
        }, cols: [[
            {field: 'qid', title: 'ID',width:60, align:'center'}
            , {field: 'commname', title: '名前', width: 250, align:'center'}
            , {field: 'commdesc', title: '説明', width: 600, align:'center'}
            , {field: 'username', title: '投稿者', width: 110, align:'center'}
            , {field: 'school', title: '学校', width: 130, align:'center'}
            , {field: 'soldtime', title: 'コレクション時間.', width: 160, align:'center'}
            , {fixed: 'right', title: '操作', toolbar: '#barDemo', width:140, align:'center'}
        ]]
        ,height: 500
        , done: function (res, curr, count) {
            var i=1;
            $("[data-field='qid']").children().each(function () {
                if($(this).text() == 'ID') {
                    $(this).text("ID")
                }else{
                    $(this).text(i++)
                }
            });
        }
    });
    //监听行工具事件
    table.on('tool(test)', function (obj) {
        var data = obj.data;
        if (obj.event === 'xiangqing') {
            window.open(basePath+"/product-detail/"+data.commid)
        }else if (obj.event === 'bianji') {
            layer.open({
                type: 2,
                title: '商品を修正する',
                shadeClose: true,
                shade: 0.8,
                maxmin: true,
                area: ['80%', '80%'],
                content: basePath+'/user/editgoods/'+data.commid
            });
        }else if(obj.event === 'quxiaoshoucang'){
            layer.confirm('この商品の収蔵をキャンセルすることを確認しますか？', {
                btn: ['確定','ダメ'], //按钮
                title:"コレクションのキャンセル",
                offset:"50px"
            }, function(){
                layer.closeAll();
                $.ajax({
                    url: basePath+'/collect/delete/'+data.id,
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
        }else if (obj.event === 'yishou') {
            layer.confirm('この商品が販売されていることを確認しますか？', {
                btn: ['確定','だめ'], //按钮
                title:"商品を販売",
                offset:"50px"
            }, function(){
                layer.closeAll();
                $.ajax({
                    url: basePath+'/user/changecommstatus/'+data.commid+"/4",
                    data: "",
                    contentType: "application/json;charset=UTF-8", //发送数据的格式
                    type: "get",
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