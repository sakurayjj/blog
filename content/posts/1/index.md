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