//切换js
document.querySelector('.img__btn').addEventListener('click', function() {
    document.querySelector('.dowebok').classList.toggle('s--signup')
});
//获取验证码js
function getcode() {
    var b = Math.random();
    document.getElementById("image1").src = basePath+"/images?d\x3d" + b
};
layui.use(['form','layer'], function () {
    var form=layui.form;
    var $ = layui.jquery,
        layer = layui.layer;
});
//登录js
function submitlogin() {
    var username=$("#username").val();
    if (username.length == 0) {
        layer.tips("アカウントを入力してください", '#username', {
            tips: [1, "#0FA6D8"],
            tipsMore: !1,
            time: 1300
        });
        $("#username").focus();
        return;
    }
    var password=$("#password").val();
    if (password.length == 0) {
        layer.tips("パスワードを入力してください", '#password', {
            tips: [1, "#0FA6D8"],
            tipsMore: !1,
            time: 1300
        });
        $("#password").focus();
        return;
    }
    if (password.length > 20 || password.length < 5) {
        layer.tips("合法的なパスワードを入力してください", '#password', {
            tips: [1, "#FF5722"],
            tipsMore: !1,
            time: 1300
        });
        $("#password").focus();
        return;
    }
    var vercode=$("#vercode").val();
    if (vercode.length === 0) {
        layer.tips("写真検証コードを入力してください", '#vercode', {
            tips: [1, "#0FA6D8"],
            tipsMore: !1,
            time: 1300
        });
        $("#vercode").focus();
        return;
    } else if (vercode.length != 5) {
        layer.tips("正しい検証コードを入力してください", '#vercode', {
            tips: [1, "#FF5722"],
            tipsMore: !1,
            time: 1300
        });
        $("#vercode").focus();
        return;
    }
    $("#submitlg").addClass("layui-btn-disabled");
    $("#submitlg").attr("disabled", true);
    var object = new Object(); //创建一个存放数据的对象
    object["username"] = username;
    object["password"] = password;
    object["vercode"] = vercode;
    var jsonData = JSON.stringify(object); //根据数据生成json数据
    $.ajax({
        url: basePath + "/user/login",
        data: jsonData,
        contentType: "application/json;charset=UTF-8", //发送数据的格式
        type: "post",
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
            if (data.status == 200) {
                layer.msg(data.message, {
                    time: 1000,
                    icon: 1,
                    offset: '100px'
                }, function () {
                    location.href=basePath+"/";
                });
            } else {
                layer.msg(data.message, {
                    time: 1000,
                    icon: 5,
                    offset: '100px'
                });
                $("#submitlg").removeClass("layui-btn-disabled");
                $("#submitlg").attr("disabled", false);
            }
        },error:function () {
            layer.msg("システムエラー", {
                time: 1000,
                icon: 2,
                offset: '100px'
            });
        }
    });
}
//注册部分
//var re = /^1\d{10}$/; //正则表达式验证手机号
var reemail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/; //正则表达式验证邮箱

var app = new Vue({
    el: '#registers',
    data() {
        return {
            listimages: [],
            mainimg: "",
            videourl: ""
        }
    },
    mounted: function () {
        //将vue中的函数设置成全局的
        window.jiantingphone = this.jiantingphone;
        window.jiantingemail = this.jiantingemail;
    },
    methods: {
        jiantingphone: function () {
            var phone=$("#userphone").val();
            if(phone.length==0){
                layer.tips("携帯電話番号を入力してください", '#userphone', {
                    tips: [1, "#0FA6D8"],
                    tipsMore: !1,
                    time: 1300
                });
                $("#userphone").focus();
                return 0;
            }
            return 1;
        },jiantingemail:function () {
            var email=$("#useremail").val();
            if(email.length==0){
                layer.tips("メールを入力してください", '#useremail', {
                    tips: [1, "#0FA6D8"],
                    tipsMore: !1,
                    time: 1300
                });
                $("#useremail").focus();
                return 0;
            }else if(!reemail.test(email)){
                layer.tips("合法的なメールを入力してください", '#useremail', {
                    tips: [1, "#FF5722"],
                    tipsMore: !1,
                    time: 1300
                });
                $("#useremail").focus();
                return 0;
            }
            return 1;
        }
    }
});

function submitregister() {
    var phone=$("#userphone").val();
    var nickname=$("#nickname").val();
    var password2=$("#password2").val();
    //var phonevercode=$("#phonevercode").val();
    var useremail=$("#useremail").val();
    var t=jiantingphone();
    if(t==0){
        return;
    }
    var e=jiantingemail();
    if(e==0){
        return;
    }
    if (nickname.length == 0) {
        layer.tips("ユーザー名を入力してください", '#nickname', {
            tips: [1, "#0FA6D8"],
            tipsMore: !1,
            time: 1300
        });
        $("#nickname").focus();
        return;
    }
    if (password2.length == 0) {
        layer.tips("パスワードを入力してください", '#password2', {
            tips: [1, "#0FA6D8"],
            tipsMore: !1,
            time: 1300
        });
        $("#password2").focus();
        return;
    }
    if (password2.length > 20 || password2.length < 5) {
        layer.tips("パスワードの長さは：5-20", '#password2', {
            tips: [1, "#FF5722"],
            tipsMore: !1,
            time: 1500
        });
        $("#password2").focus();
        return;
    }
  /**  if (phonevercode.length === 0) {
        layer.tips("请输入验证码", '#phonevercode', {
            tips: [1, "#0FA6D8"],
            tipsMore: !1,
            time: 1300
        });
        $("#phonevercode").focus();
        return;
    } else if (phonevercode.length != 6) {
        layer.tips("请输入正确验证码", '#phonevercode', {
            tips: [1, "#FF5722"],
            tipsMore: !1,
            time: 1300
        });
        $("#phonevercode").focus();
        return;
    }**/
    $("#submitrg").addClass("layui-btn-disabled");
    $("#submitrg").attr("disabled", true);
    var object = new Object(); //创建一个存放数据的对象
    object["username"] = nickname;
    object["mobilephone"] = phone;
    object["password"] = password2;
   // object["vercode"] = phonevercode;
    object["email"] = useremail;
    var jsonData = JSON.stringify(object); //根据数据生成json数据
    $.ajax({
        url: basePath + "/user/register",
        data: jsonData,
        contentType: "application/json;charset=UTF-8", //发送数据的格式
        type: "post",
        dataType: "json", //回调
        beforeSend: function () {
            layer.load(1, { //icon支持传入0-2
                content: '登録中...',
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
            if (data.status == 201) {
                layer.msg(data.message, {
                    time: 1000,
                    icon: 2,
                    offset: '100px'
                });
            }else if (data.status == 200) {
                layer.msg(data.message, {
                    time: 1000,
                    icon: 1,
                    offset: '100px'
                }, function () {
                    layer.open({
                        type: 2,
                        title: '情報を完備してください',
                        shadeClose: true,
                        shade: 0.8,
                        maxmin: true,
                        area: ['60%', '70%'],
                        content: basePath+'/user/perfectinfo',
                        end: function () {
                            location.href=basePath+"/";
                        }
                    });
                });
            }
            $("#submitrg").removeClass("layui-btn-disabled");
            $("#submitrg").attr("disabled", false);
        },error:function () {
            layer.msg("システムエラー", {
                time: 1000,
                icon: 2,
                offset: '100px'
            });
        }
    });
}



//获取短信验证码

//倒计时
