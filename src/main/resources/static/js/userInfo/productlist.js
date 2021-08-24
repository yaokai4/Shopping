layui.use(['form', 'element', 'util', 'carousel', 'laypage', 'layer', 'table'], function () {
    var element = layui.element;
    var util = layui.util;
    var form = layui.form;
    var laypage = layui.laypage
        , layer = layui.layer;
    form.on('select(types)', function (data) {
        var indexGID = data.elem.selectedIndex;
        lookallproduct(data.elem[indexGID].title);
    });
});
function lookallproduct(stuatus) {
    layui.use(['form', 'element', 'util', 'carousel', 'laypage', 'layer','table'], function () {
        var table = layui.table;
        table.render({
            elem: '#product'
            , url: basePath+'/user/commodity/'+stuatus
            , page: {
                layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
                , groups: 3
                , limits: [20, 50, 100]
                , limit: 20
            }, cols: [[
                {field: 'qid', title: 'ID',width:80, align:'center'}
                , {field: 'commname', title: '名前', width: 300, align:'center'}
                , {field: 'category', title: 'カテゴリー.', width: 100, align:'center'}
                , {field: 'commdesc', title: '説明', width: 700, align:'center'}
                , {field: 'updatetime', title: '時間', width: 160,sort: true, align:'center'}
                , {fixed: 'right', title: '操作', toolbar: '#barDemo', width:250, align:'center'}
            ]], done: function (res, curr, count) {
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
                    title: '商品を修正',
                    shadeClose: true,
                    shade: 0.8,
                    maxmin: true,
                    area: ['80%', '80%'],
                    content: basePath+'/user/editgoods/'+data.commid,
                    end: function () {
                        location.reload();
                    }
                });
            }else if(obj.event === 'shanchu'){
                layer.confirm('商品の削除を確認しますか？', {
                    btn: ['確定','NO'], //按钮
                    title:"商品を削除する",
                    offset:"50px"
                }, function(){
                    layer.closeAll();
                    $.ajax({
                        url: basePath+'/user/changecommstatus/'+data.commid+"/2",
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
            }else if (obj.event === 'yishou') {
                layer.confirm('この商品が販売されていることを確認しますか？', {
                    btn: ['確定','NO'], //按钮
                    title:"商品を販売する",
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
}
lookallproduct(100);