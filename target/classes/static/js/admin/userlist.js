layui.use(['form', 'element', 'util', 'carousel', 'laypage', 'layer','table'], function () {
    let form = layui.form;
    form.on('select(types)', function (data) {
        let indexGID = data.elem.selectedIndex;
        lookalluser(data.elem[indexGID].title);
    });
});
function lookalluser(stuatus) {
    layui.use(['form', 'element', 'util', 'carousel', 'laypage', 'layer','table'], function () {
        let form = layui.form;
        let table = layui.table;
        table.render({
            elem: '#userlist'
            , url: basePath+'/admin/userlist/1/' + stuatus
            , page: {
                layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
                , groups: 3
                , limits: [20, 50, 100]
                , limit: 20
            }, cols: [[
                {field: 'uimage', title: '写真', templet: '<div><img src="{{d.uimage}}" class="layui-nav-img"></div>',width:70}
                , {field: 'username', title: '名前', width: 120, align:'center'}
                , {field: 'mobilephone', title: '携帯電話番号', width: 160, align:'center'}
                , {field: 'email', title: 'メールアカウント', width: 200, align:'center'}
                , {field: 'sex', title: '性別', width: 80, align:'center'}
                , {field: 'school', title: '大学', width: 200, align:'center'}
                , {field: 'faculty', title: '学部', width: 160, align:'center'}
                , {field: 'roleid', title: '身分', width: 100, align:'center'}
                , {fixed: 'right', title: '操作', toolbar: '#barDemo', width:180, align:'center'}
            ]], done: function (res, curr, count) {
                $("[data-field='roleid']").children().each(function () {
                    if($(this).text() == '身分') {
                        $(this).text("身分")
                    }else if($(this).text()==1){
                        $(this).text("一般ユーザー.")
                    }else if($(this).text()==2){
                        $(this).text("管理")
                    }
                });
            }
            ,height: 500
        });
        //监听行工具事件
        table.on('tool(test)', function (obj) {
            var data = obj.data;
            if (obj.event === 'gerenzhuye') {
                //window.open(basePath+"/product-detail/"+data.commid)
            }else if(obj.event === 'fengjin'){
                layer.confirm('ユーザーを封鎖することを確認しますか？', {
                    btn: ['確定','まぁいい。'], //按钮
                    title:"ユーザー封鎖",
                    offset:"50px"
                }, function(){
                    layer.closeAll();
                    $.ajax({
                        url: basePath+'/admin/user/forbid/'+data.userid+"/0",
                        data: "",
                        contentType: "application/json;charset=UTF-8", //发送数据的格式
                        type: "put",
                        dataType: "json", //回调
                        beforeSend: function () {
                            layer.load(1, { //icon支持传入0-2
                                content: '少々お待ちください...',
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
            }else if (obj.event === 'jiefeng') {
                layer.confirm('ユーザーを封鎖解除することを確認しますか？', {
                    btn: ['確定','まぁいい。'], //按钮
                    title:"ユーザーの封鎖を解除する",
                    offset:"50px"
                }, function(){
                    layer.closeAll();
                    $.ajax({
                        url: basePath+'/admin/user/forbid/'+data.userid+"/1",
                        data: "",
                        contentType: "application/json;charset=UTF-8", //发送数据的格式
                        type: "put",
                        dataType: "json", //回调
                        beforeSend: function () {
                            layer.load(1, { //icon支持传入0-2
                                content: '少々お待ちください...',
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
            }else if (obj.event === 'setadmin') {
                layer.confirm('管理者に設定を確認しますか？', {
                    btn: ['確定','まぁいい。'], //按钮
                    title:"管理者を設定する",
                    offset:"50px"
                }, function(){
                    layer.closeAll();
                    $.ajax({
                        url: basePath+'/admin/set/administrator/'+data.userid+"/2",
                        data: "",
                        contentType: "application/json;charset=UTF-8", //发送数据的格式
                        type: "put",
                        dataType: "json", //回调
                        beforeSend: function () {
                            layer.load(1, { //icon支持传入0-2
                                content: '少々お待ちください...',
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
lookalluser(1);