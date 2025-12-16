---
title: CVE-2025-55182
date: 2025-12-16T11:00:00+08:00
draft: false
tags:
  - 
categories:
  - 网络安全
summary: 这是一篇用于记录CVE-2025-55182的文章
cover:
  image:
  alt:
  caption:
  relative: false
---

## 0x00漏洞原因
RSC：React 18引入了React Server Components，ServerCompoents的代码永远不会下载到浏览器，它们会在服务器执行，输出结果发送给客户端...所以在前端可以直接写后端代码，React会使用Flight协议自动处理前后端通信问题，这就是该漏洞的由来。