package com.controller.admin;

import com.entity.*;
import com.service.*;
import com.util.JustPhone;
import com.util.KeyUtil;
import com.util.StatusCode;
import com.util.ValidateCode;
import com.vo.LayuiPageVo;
import com.vo.ResultVo;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * @Author: hlt
 * @Description: 管理员控制器
 * @Date: 2020/3/10 16:54
 */
@Controller
public class AdminController {
    @Autowired
    private UserRoleService userRoleService;
    @Autowired
    private LoginService loginService;
    @Autowired
    private UserInfoService userInfoService;
    @Autowired
    private CommodityService commodityService;
    @Autowired
    private NoticesService noticesService;

    /**
     * 管理员跳转登录
     */
    @GetMapping("/admin")
    public String admintologin() {
        return "admin/login/login";
    }

    /**
     * 管理员登录
     * 1.判断输入账号的类型
     * 2.判断是否为管理员或者超级管理员
     * 3.登录
     * */
    @ResponseBody
    @PostMapping("/admin/login")
    public ResultVo adminlogin(@RequestBody Login login, HttpSession session){
        System.out.println("测试是否进入！！！");
        String account=login.getUsername();
        String password=login.getPassword();
        String vercode=login.getVercode();
        UsernamePasswordToken token;
        if(!ValidateCode.code.equalsIgnoreCase(vercode)){
            return new ResultVo(false,StatusCode.ERROR,"正しい検証コードを入力してください");
        }
        //判断输入的账号是否手机号
        if (!JustPhone.justPhone(account)) {
            //输入的是用户名
            String username = account;
            //盐加密
            token=new UsernamePasswordToken(username, new Md5Hash(password,"Campus-shops").toString());
        }else {
            //输入的是手机号
            String mobilephone = account;
            login.setMobilephone(mobilephone);
            //将封装的login中username变为null
            login.setUsername(null);
            //盐加密
            token=new UsernamePasswordToken(mobilephone, new Md5Hash(password,"Campus-shops").toString());
        }
        Subject subject= SecurityUtils.getSubject();
        try {
            subject.login(token);
            //盐加密
            String passwords = new Md5Hash(password, "Campus-shops").toString();
            login.setPassword(passwords);
            Login login1 = loginService.userLogin(login);
            //查询登录者的权限
            Integer roleId = userRoleService.LookUserRoleId(login1.getUserid());
            if (roleId == 2 || roleId == 3){
                session.setAttribute("admin",login1.getUsername());
                session.setAttribute("username",login1.getUsername());
                return new ResultVo(true,StatusCode.OK,"ログインシステム成功");
            }
            return new ResultVo(true,StatusCode.ACCESSERROR,"権限が足りない");
        }catch (UnknownAccountException e){
            return new ResultVo(true,StatusCode.LOGINERROR,"ユーザー名は存在しません");
        }catch (IncorrectCredentialsException e){
            return new ResultVo(true,StatusCode.LOGINERROR,"パスワードが間違っている");
        }
    }

    /**
     * 用户列表
     * */
    @GetMapping("/admin/userlist")
    public String userlist(){
        return "/admin/user/userlist";
    }

    /**
     * 管理员列表
     * */
    @RequiresPermissions("admin:set")
    @GetMapping("/admin/adminlist")
    public String adminlist(){
        return "/admin/user/adminlist";
    }

    /**
     * 分页查询不同角色用户信息
     * roleid：1普通成员 2管理员
     * userstatus：1正常 0封号
     */
    @GetMapping("/admin/userlist/{roleid}/{userstatus}")
    @ResponseBody
    public LayuiPageVo userlist(int limit, int page,@PathVariable("roleid") Integer roleid,@PathVariable("userstatus") Integer userstatus) {
        List<UserInfo> userInfoList = userInfoService.queryAllUserInfo((page - 1) * limit, limit,roleid,userstatus);
        Integer dataNumber = userInfoService.queryAllUserCount(roleid);
        return new LayuiPageVo("",0,dataNumber,userInfoList);
    }

    /**
     * 设置为管理员或普通成员（roleid）
     * 1：普通成员   2：管理员
     */
    @PutMapping("/admin/set/administrator/{userid}/{roleid}")
    @ResponseBody
    public ResultVo setadmin(@PathVariable("userid") String userid,@PathVariable("roleid") Integer roleid) {
        if (roleid == 2){
            Integer i = loginService.updateLogin(new Login().setUserid(userid).setRoleid(roleid));
            if (i == 1){
                userRoleService.UpdateUserRole(new UserRole().setUserid(userid).setRoleid(2).setIdentity("サイト管理者"));
                /**发出设置为管理员的系统通知*/
                Notices notices = new Notices().setId(KeyUtil.genUniqueKey()).setUserid(userid).setTpname("システムの通知")
                        .setWhys("サイト管理者として設定されて、サイトの良い雰囲気を維持しようと努力してくれておめでとうございます。");
                noticesService.insertNotices(notices);
                return new ResultVo(true, StatusCode.OK, "管理者の設定に成功しました");
            }
            return new ResultVo(true, StatusCode.ERROR, "管理者の設定に失敗しました");
        }else if (roleid == 1){
            Integer i = loginService.updateLogin(new Login().setUserid(userid).setRoleid(roleid));
            if (i == 1){
                userRoleService.UpdateUserRole(new UserRole().setUserid(userid).setRoleid(1).setIdentity("ウェブサイトユーザー"));
                /**发出设置为网站用户的系统通知*/
                Notices notices = new Notices().setId(KeyUtil.genUniqueKey()).setUserid(userid).setTpname("システムの通知")
                        .setWhys("あなたはウェブサイトユーザーとして設定されていますので、もっと頑張ってください。");
                noticesService.insertNotices(notices);
                return new ResultVo(true, StatusCode.OK, "メンバーを設定することに成功した");
            }
            return new ResultVo(true, StatusCode.ERROR, "メンバーの設定に失敗しました");
        }
        return new ResultVo(false,StatusCode.ACCESSERROR,"違反操作");
    }

    /**
     * 将用户封号或解封（userstatus）
     * 0：封号  1：解封
     */
    @PutMapping("/admin/user/forbid/{userid}/{userstatus}")
    @ResponseBody
    public ResultVo adminuserlist(@PathVariable("userid") String userid,@PathVariable("userstatus") Integer userstatus) {
        if (userstatus == 0){
            Integer i = loginService.updateLogin(new Login().setUserid(userid).setUserstatus(userstatus));
            Integer j = userInfoService.UpdateUserInfo(new UserInfo().setUserid(userid).setUserstatus(userstatus));
            if (i ==1 && j == 1){
                /**发出封号的系统通知*/
                Notices notices = new Notices().setId(KeyUtil.genUniqueKey()).setUserid(userid).setTpname("システムの通知")
                        .setWhys("あなたの不良行為のため、あなたのサイトのアカウントは封印されています。");
                noticesService.insertNotices(notices);
                return new ResultVo(true, StatusCode.OK, "アカウントを封鎖して成功した");
            }
            return new ResultVo(true, StatusCode.ERROR, "アカウント封鎖に失敗した");
        }else if (userstatus == 1){
            Integer i = loginService.updateLogin(new Login().setUserid(userid).setUserstatus(userstatus));
            Integer j = userInfoService.UpdateUserInfo(new UserInfo().setUserid(userid).setUserstatus(userstatus));
            if (i ==1 && j == 1){
                /**发出解封的系统通知*/
                Notices notices = new Notices().setId(KeyUtil.genUniqueKey()).setUserid(userid).setTpname("システムの通知")
                        .setWhys("あなたのこのサイトのアカウントは解除されましたので、良い行動を維持してください。");
                noticesService.insertNotices(notices);
                return new ResultVo(true, StatusCode.OK, "解除成功した");
            }
            return new ResultVo(true, StatusCode.ERROR, "解封失敗した");
        }
        return new ResultVo(false,StatusCode.ACCESSERROR,"違反操作.");
    }

    /**
     * 管理员商品列表
     * */
    @GetMapping("/admin/product")
    public String adminproduct(){
        return "/admin/product/productlist";
    }

    /**
     * 分页管理员查看各类商品信息
     *前端传入页码、分页数量
     *前端传入商品信息状态码（commstatus）-->全部:100，违规:0，已审核:1，待审核:3 已完成:4
     * 因为是管理员查询，将userid设置为空
     */
    @GetMapping("/admin/commodity/{commstatus}")
    @ResponseBody
    public LayuiPageVo userCommodity(@PathVariable("commstatus") Integer commstatus, int limit, int page) {
        if(commstatus==100){
            List<Commodity> commodityList = commodityService.queryAllCommodity((page - 1) * limit, limit, null, null);
            Integer dataNumber = commodityService.queryCommodityCount(null, null);
            return new LayuiPageVo("",0,dataNumber,commodityList);
        }else{
            List<Commodity> commodityList = commodityService.queryAllCommodity((page - 1) * limit, limit, null, commstatus);
            Integer dataNumber = commodityService.queryCommodityCount(null, commstatus);
            return new LayuiPageVo("",0,dataNumber,commodityList);
        }
    }

    /**
     * 管理员对商品的操作
     * 前端传入商品id（commid）
     * 前端传入操作的商品状态（commstatus）-->违规:0  通过审核:1
     * */
    @ResponseBody
    @PutMapping("/admin/changecommstatus/{commid}/{commstatus}")
    public ResultVo ChangeCommstatus(@PathVariable("commid") String commid, @PathVariable("commstatus") Integer commstatus) {
        Integer i = commodityService.ChangeCommstatus(commid, commstatus);
        if (i == 1){
            /**发出商品审核结果的系统通知*/
            Commodity commodity = commodityService.LookCommodity(new Commodity().setCommid(commid));
            if (commstatus == 0){
                Notices notices = new Notices().setId(KeyUtil.genUniqueKey()).setUserid(commodity.getUserid()).setTpname("商品審査")
                        .setWhys("あなたの商品 <a href=/product-detail/"+commodity.getCommid()+" style=\"color:#08bf91\" target=\"_blank\" >"+commodity.getCommname()+"</a> 審査を通過しておらず、現在公開はサポートされていません。");
                noticesService.insertNotices(notices);
            }else if (commstatus == 1){
                Notices notices = new Notices().setId(KeyUtil.genUniqueKey()).setUserid(commodity.getUserid()).setTpname("商品審査")
                        .setWhys("あなたの商品 <a href=/product-detail/"+commodity.getCommid()+" style=\"color:#08bf91\" target=\"_blank\" >"+commodity.getCommname()+"</a> 審査に合格しましたので、早く行ってみてください。");
                noticesService.insertNotices(notices);
            }
            return new ResultVo(true,StatusCode.OK,"操作が成功する");
        }
        return new ResultVo(false,StatusCode.ERROR,"操作に失敗する");
    }

}
