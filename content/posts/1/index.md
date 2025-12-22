---
categories:
- 网络安全
- 靶场
date: "2025-12-19"
description: 通过DVWA靶场学习代码审计。
slug: dvwabruteforce
tags:
- DVWA
title: 从DVWA开始学习漏洞原理-Brute Force
---

## 0x00Brute Force
暴力破解
## 0x01Low级别
**代码审计**：
整体逻辑：接收账号密码 -> 查询数据库 -> 匹配则登录成功，否则登陆失败。
**危害点1**：存在暴力破解：
```php
if( isset( $_GET[ 'Login' ] ) )
```
这个 **if** 只是判断了用户是否提交表单，也就是是否登录。没有进行任何校验，也就是存在以下安全问题：
-  没有验证码 (CAPTCHA)。（例如：人机验证）
-  没有请求速率限制 (Rate Limiting)。（这样爆破速度非常快）
-  没有账号锁定机制 (例如：输错3次锁定15分钟)。
攻击者可以通过信息收集构造一个字典，通过工具进行无限次尝试，直到得到账号密码。
**危害点2**：使用GET型方式提交账号密码，造成敏感信息泄露：
```php
$user = $_GET[ 'username' ];
$pass = $_GET[ 'password' ];
```
- 账号密码会直接出现在url当中。
- 浏览器会保存历史纪录。
- Web服务器的access log 记录。
- 同一网络下会被抓包，如果是HTTP明文传输，会直接暴露账号密码。
- 代理 / CDN / 防火墙日志记录。
示例：
浏览器地址会显示：
```http
/vulnerabilities/brute/?username=admin&password=123456&Login=Login#
```
危害点3：弱加密算法：MD5
```php
$pass = md5( $pass );
```
虽然这里的 MD5 主要用于数据库比对`AND password = '$pass';";`，但如果数据库被脱库，可以极快地将数据库中的 MD5 哈希值还原为明文密码。更关键的一点是，MD5没有salt，可以被彩虹表秒破、GPU并行爆破。
**危害点3**：SQL注入，尽管这个模块叫暴力破解，但登录框存在严重的sql注入，甚至不需要密码就可以登录管理员：
```php
$query = "SELECT * FROM `users` WHERE user = '$user' AND password = '$pass';";
```
让代码明了一点：
```php
$query = "SELECT * FROM `users`
          WHERE user = '$user'
          AND password = '$pass'";
```
程序把用户输入当成了sql语句的一部分，也就是说，`$user`、`$pass`都来自用户，但程序默认相信他们是安全字符串。变量 `$user` 直接拼接进了 SQL 语句中，没有使用 `mysqli_real_escape_string` 进行转义，也没有使用预编译语句 (Prepared Statements)。
攻击构造举例：
1.万能密码，绕过密码登录
构造payload：在 Username 输入框填入 `admin' #`
后端实际执行的SQL：
```sql
SELECT * FROM `users` WHERE user = 'admin' #' AND password = '...';
```
结果：只要admin用户存在，SQL语句就成立，数据库返回该用户信息，攻击者成功登录，根本不需要知道密码。
2.利用SQL注入联合查询
构造 Payload： 在 Username 输入框填入 `' UNION SELECT 1, user(), database(), 4, 5 #`
后端实际执行的SQL：
```sql
SELECT * FROM `users` WHERE user = '' UNION SELECT 1, user(), database(), 4, 5 #' AND password = '...';
```
## 0x02Medium级别
**不同点1**：引入了 `mysqli_real_escape_string` 函数。这个函数会对传入的`$user`变量中的特殊字符进行转义处理，比如单引号 `'`、双引号 `"`、反斜杠 `\` 等。修复了SQL注入。
```php
$user = mysqli_real_escape_string($GLOBALS["___mysqli_ston"], $_GET[ 'username' ] );
```
**不同点2**：增加了延时机制。
```php
if( $result && mysqli_num_rows( $result ) == 1 ) {
    // 登录成功逻辑...
}
else {
    // Login failed
    sleep( 2 ); // <--- 关键新增代码
    echo "<pre><br />Username and/or password incorrect.</pre>";
}
```
不过只能缓解暴力破解的速度。
综合来看：
```php
<?php

  

if( isset( $_GET[ 'Login' ] ) ) {   //依然使用了GET型传递参数。

    // Sanitise username input

    $user = $_GET[ 'username' ];    //username和password都进行了保护，引入了 mysqli_real_escape_string 函数，该函数能对一些特殊字符进行转义当作正常字符，修复了Low级SQL注入的问题。

    $user = ((isset($GLOBALS["___mysqli_ston"]) && is_object($GLOBALS["___mysqli_ston"])) ? mysqli_real_escape_string($GLOBALS["___mysqli_ston"],  $user ) : ((trigger_error("[MySQLConverterToo] Fix the mysql_escape_string() call! This code does not work.", E_USER_ERROR)) ? "" : ""));

  

    // Sanitise password input

    $pass = $_GET[ 'password' ];

    $pass = ((isset($GLOBALS["___mysqli_ston"]) && is_object($GLOBALS["___mysqli_ston"])) ? mysqli_real_escape_string($GLOBALS["___mysqli_ston"],  $pass ) : ((trigger_error("[MySQLConverterToo] Fix the mysql_escape_string() call! This code does not work.", E_USER_ERROR)) ? "" : ""));

    $pass = md5( $pass );   //仍然存在md5。

  

    // Check the database

    $query  = "SELECT * FROM `users` WHERE user = '$user' AND password = '$pass';";

    $result = mysqli_query($GLOBALS["___mysqli_ston"],  $query ) or die( '<pre>' . ((is_object($GLOBALS["___mysqli_ston"])) ? mysqli_error($GLOBALS["___mysqli_ston"]) : (($___mysqli_res = mysqli_connect_error()) ? $___mysqli_res : false)) . '</pre>' );

  

    if( $result && mysqli_num_rows( $result ) == 1 ) {

        // Get users details

        $row    = mysqli_fetch_assoc( $result );

        $avatar = $row["avatar"];

  

        // Login successful

        $html .= "<p>Welcome to the password protected area {$user}</p>";

        $html .= "<img src=\"{$avatar}\" />";

    }

    else {

        // Login failed

        sleep( 2 ); //防止爆破而做的延时机制，如果账号密码错误，服务器会强制暂停处理脚本 2 秒钟，然后才返回错误信息。增加了爆破的时间成本，仍然可以爆破。

        $html .= "<pre><br />Username and/or password incorrect.</pre>";

    }

  

    ((is_null($___mysqli_res = mysqli_close($GLOBALS["___mysqli_ston"]))) ? false : $___mysqli_res);

}

  

?>
```
问题仍然存在：
- 延时过短，没有从逻辑上阻断攻击。
- 依然使用GET传输请求。
- 依然使用MD5。
## 0x03High

