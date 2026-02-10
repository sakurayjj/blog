---
categories:
  - 网络安全
date: 2026-01-26
description: kali系统更新以及共享文件夹挂载
slug: kali-update-share-mount
tags:
  - 
title: kali系统更新以及共享文件夹挂载
cover:
  image: 1.jpg
  relative: true
---

# kali系统更新
**标准流程**：
1、为防止更新出错最好在VMware中创建一个快照。

2、执行以下命令：
```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt autoremove -y
sudo reboot
```

# kali共享文件夹
1、查看是否存在磁盘文件夹：
```bash
ls /mnt/
```
2、共享文件夹在 Kali 里的位置：
```bash
/mnt/hgfs/
```
3、如果 /mnt/hgfs 不存在（手动挂载）
```bash
sudo mkdir -p /mnt/hgfs
sudo mount -t fuse.vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other
```
4、再看：
```bash
ls /mnt/hgfs
```
