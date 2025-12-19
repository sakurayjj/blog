---
categories:
- Debug
date: "2025-12-12"
description: 记录GitHub本地上传的一些命令。
slug: githublocalshell
tags:
- GitHub
title: Github本地上传笔记
---

## 0x00本地初始化 Git 仓库
在你本地 `test/` 目录中执行：
```bash
git init
```
如果你之前已经 `git init` 过，可以跳过这步。
## 0x01关联远程 GitHub 仓库
把下面的 URL 换成你自己的：
```bash
git remote add origin https://github.com/你的用户名/你创建的仓库名.git
```
确认是否添加成功:
```bash
git remote -v
```
## 0x02把本地文件加入 Git 并提交
1.查看当前状态:
```bash
git status
```
2.添加所有需要提交的文件:
```bash
git add .
```
3.提交一次（写清楚提交信息）:
```bash
git commit -m "init new"
```
## 0x03推送到 GitHub
如果是新仓库：
```bash
git branch -M main
git push -u origin main
```
如果 GitHub 默认分支是 `master`
```bash
git push -u origin master
```
> -u 的意思是：以后你只需要 git push 就行。

关于配置SSH，可以参考 [# Github配置ssh key的步骤（大白话+包含原理解释）](https://blog.csdn.net/weixin_42310154/article/details/118340458)
## 0x04后续操作
```bash
git add .
git commit -m "update"
git push
```