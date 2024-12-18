package com.controller.User;


import com.entity.Login;
import com.entity.UserInfo;
import com.entity.UserRole;
import com.service.LoginService;
import com.service.UserInfoService;
import com.service.UserRoleService;
import com.util.*;
import com.vo.ResultVo;
import net.sf.json.JSONObject;
import org.apache.commons.lang3.concurrent.BasicThreadFactory;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * <p>
 *  登录注册 控制器
 * </p>
 *
 * @author hlt
 * @since 2019-12-21
 */
@Controller
public class LoginController {
    @Autowired
    private LoginService loginService;
    @Autowired
    private UserInfoService userInfoService;
    @Autowired
    private UserRoleService userRoleService;
    /**手机号和注册验证码map集合*/
    private static Map<String, String> phonecodemap1 = new HashMap<>();
    /**手机号和重置密码验证码map集合*/
    private static Map<String, String> phonecodemap2 = new HashMap<>();
    /**
     *图片验证码
     * */
    @RequestMapping(value = "/images", method = {RequestMethod.GET, RequestMethod.POST})
    public void images(HttpServletResponse response) throws IOException {
        response.setContentType("image/jpeg");
        //禁止图像缓存。
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-cache");
        response.setDateHeader("Expires", 0);
        ValidateCode vCode = new ValidateCode(820, 200, 5, 80);
        vCode.write(response.getOutputStream());
    }


    /**新規登録。
     *1.フロントエンドにユーザー名(Username)、パスワード(Password)、メールボックス(Email)、携帯電話番号(Mobilephone)、検証コード(Vercode)が入力されます。
     2.アカウントが登録されているかどうかを調べる。
     *3.ユーザー名が存在するかどうかを問い合わせる。
     *4.検証コードが有効かどうかを判断する。
     *5.登録する.
     **/
    @ResponseBody
    @PostMapping("/user/register")
    public  ResultVo userReg(@RequestBody UserInfo userInfo, HttpSession session) { //ユーザー情報をしゅとくする
        String username = userInfo.getUsername();
        String password = userInfo.getPassword();
        String mobilephone = userInfo.getMobilephone();
        String vercode = userInfo.getVercode();
        Login login = new Login().setMobilephone(mobilephone);
        //アカウントが登録されているかどうかを調べる
        Login userIsExist = loginService.userLogin(login);
        if (!StringUtils.isEmpty(userIsExist)){//ユーザーアカウントはすでに存在します
            return new ResultVo(false, StatusCode.ERROR,"このユーザーはすでに登録しました");
        }
        login.setUsername(username).setMobilephone(null); //ユーザー名と携帯番号が登録されているかどうかを調べる
        Login userNameIsExist = loginService.userLogin(login);
        if (!StringUtils.isEmpty(userNameIsExist)){//ユーザー名はすでに存在します
            return new ResultVo(false, StatusCode.ERROR,"ユーザー名はすでに存在していますので、変更してください");
        }

            //Md5塩暗号化 Hashアルゴリズム
            String passwords = new Md5Hash(password, "Campus-shops").toString(); //Md5塩暗号化
            String userid = KeyUtil.genUniqueKey();//ユーザーidを取得する
            login.setId(KeyUtil.genUniqueKey()).setUserid(userid).setMobilephone(mobilephone).setPassword(passwords);
            Integer integer = loginService.loginAdd(login);
            //新規登録ユーザーが写真を保存する
            userInfo.setUserid(userid).setPassword(passwords).setUimage("/pic/WechatIMG110.jpg").
                    setSign("初めまして。どうぞよろしくお願いします").setStatus("offline");
            Integer integer1 = userInfoService.userReg(userInfo);

                /**登録が成功したらsessionにアップロードします*/
                session.setAttribute("userid",userid);
                session.setAttribute("username",username);
                /**存入ユーザー情報を保存する*/
                userRoleService.InsertUserRole(new UserRole().setUserid(userid).setRoleid(1).setIdentity("サイトユーザー"));
                UsernamePasswordToken token=new UsernamePasswordToken(mobilephone, new Md5Hash(password,"Campus-shops").toString());
                Subject subject= SecurityUtils.getSubject();

               return new ResultVo(true,StatusCode.OK,"登録に成功");

    }

    /**登録する.。
     1.入力アカウントのタイプを判断する。
     2.登録する.
     * */
    @ResponseBody
    @PostMapping("/user/login")
    public ResultVo userLogin(@RequestBody Login login, HttpSession session){
        String account=login.getUsername();
        String password=login.getPassword();
        String vercode=login.getVercode();
        UsernamePasswordToken token; //Tokenを取得して以前登録したことがあるかどうかチェックします
        if(!ValidateCode.code.equalsIgnoreCase(vercode)){
            return new ResultVo(false,StatusCode.ERROR,"正しい検証コードを入力してください");
        }
        //入力されたアカウントが携帯電話番号かどうかを判断する
        if (!JustPhone.justPhone(account)) {
            //ユーザー名を入力しました
            String username = account;
            //Md5復号化 Hashアルゴリズム
            token=new UsernamePasswordToken(username, new Md5Hash(password,"Campus-shops").toString());
        }else {
            //携帯電話番号を入力しました
            String mobilephone = account;
            login.setMobilephone(mobilephone);
            //カプセル化されたloginのusernameをnullに変更する
            login.setUsername(null);
            //Md5復号化 Hashアルゴリズム
            token=new UsernamePasswordToken(mobilephone, new Md5Hash(password,"Campus-shops").toString());
        }
        Subject subject= SecurityUtils.getSubject();
        try {
            //アカウントのパスワードが正しいかどうかを判断する
            subject.login(token);
            //Md5塩暗号化
            String passwords = new Md5Hash(password, "Campus-shops").toString();
            login.setPassword(passwords);
            Login login1 = loginService.userLogin(login);
            session.setAttribute("userid",login1.getUserid());
            session.setAttribute("username",login1.getUsername());
            return new ResultVo(true,StatusCode.OK,"ログインに成功した");
        }catch (UnknownAccountException e){
            return new ResultVo(true,StatusCode.LOGINERROR,"ユーザー名は存在しません");
        }catch (IncorrectCredentialsException e){
            return new ResultVo(true,StatusCode.LOGINERROR,"パスワードが間違っている");
        }
    }

    /**重置密码时发送短信验证码
     * 1.判断是否为重置密码类型验证码
     * 2.判断手机号格式是否正确
     * 3.查询账号是否存在
     * 4.发送验证码
     * */
    @ResponseBody
    @PostMapping("/user/sendresetpwd")
    public ResultVo sendresetpwd(HttpServletRequest request) throws IOException {
        JSONObject json = JsonReader.receivePost(request);
        final String mobilephone = json.getString("mobilephone");
        Integer type = json.getInt("type");
        Login login = new Login();
        if(type!=1){
            return new ResultVo(false,StatusCode.ACCESSERROR,"違反操作");
        }
        if (!JustPhone.justPhone(mobilephone)) {//判断输入的手机号格式是否正确
            return new ResultVo(false,StatusCode.ERROR,"正しいフォーマットの携帯電話番号を入力してください");
        }
        //查询手机号是否存在
        login.setMobilephone(mobilephone);
        Login userIsExist = loginService.userLogin(login);
        if (StringUtils.isEmpty(userIsExist)){//用户账号不存在
            return new ResultVo(false, StatusCode.LOGINERROR,"そのユーザは存在しない");
        }
        String code = GetCode.phonecode();
        Integer result = new SmsUtil().SendMsg(mobilephone, code, type);//发送验证码
        if(result == 1) {//发送成功
            phonecodemap2.put(mobilephone, code);//放入map集合进行对比

/*
            final Timer timer = new Timer();
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    phonecodemap2.remove(phoneNum);
                    timer.cancel();
                }
            }, 5 * 60 * 1000);
*/

            //执行定时任务
            ScheduledExecutorService executorService = new ScheduledThreadPoolExecutor(1,
                    new BasicThreadFactory.Builder().namingPattern("example-schedule-pool-%d").daemon(true).build());
            executorService.scheduleAtFixedRate(new Runnable() {
                @Override
                public void run() {
                    phonecodemap2.remove(mobilephone);
                    ((ScheduledThreadPoolExecutor) executorService).remove(this::run);
                }
            },5 * 60 * 1000,5 * 60 * 1000, TimeUnit.HOURS);



            return new ResultVo(true,StatusCode.SMS,"検証コードの送信に成功しました");
        }else if(result == 2){
            return new ResultVo(false,StatusCode.ERROR,"正しいフォーマットの携帯電話番号を入力してください");
        }
        return new ResultVo(false,StatusCode.REMOTEERROR,"検証コードの送信に失敗しました");
    }

    /**重置密码
     * 1.判断手机号格式是否正确
     * 2.查询手机号是否存在
     * 3.判断验证码是否有效或正确
     * 4.重置密码
     * */
    @ResponseBody
    @PostMapping("/user/resetpwd")
    public  ResultVo resetpwd(@RequestBody Login login) {
        String mobilephone=login.getMobilephone();
        String password=login.getPassword();
        Login login1 = new Login();
        UserInfo userInfo = new UserInfo();
        if (!JustPhone.justPhone(mobilephone)) {//判断输入的手机号格式是否正确
            return new ResultVo(false,StatusCode.ERROR,"正しいフォーマットの携帯電話番号を入力してください");
        }
        //查询手机号是否存在
        login1.setMobilephone(mobilephone);
        Login userIsExist = loginService.userLogin(login1);
        if (StringUtils.isEmpty(userIsExist)){//用户账号不存在
            return new ResultVo(false, StatusCode.LOGINERROR,"このアカウントは存在しません");
        }

            //盐加密
            String passwords = new Md5Hash(password, "Campus-shops").toString();
            login1.setPassword(passwords).setId(userIsExist.getId()).setMobilephone(null);
            userInfo.setMobilephone(mobilephone).setPassword(passwords).setUserid(userIsExist.getUserid());
            Integer integer = loginService.updateLogin(login1);
            Integer integer1 = userInfoService.UpdateUserInfo(userInfo);

                return new ResultVo(true,StatusCode.OK,"パスワードのリセットに成功しました");

    }

    /**退出登陆*/
    @GetMapping("/user/logout")
    public String logout(HttpServletRequest request,HttpSession session){
        String userid = (String)session.getAttribute("userid");
        String username = (String)session.getAttribute("username");
        if(StringUtils.isEmpty(userid) && StringUtils.isEmpty(username)){
            return "redirect:/";
        }
        request.getSession().removeAttribute("userid");
        request.getSession().removeAttribute("username");
        return "redirect:/";
    }




}
