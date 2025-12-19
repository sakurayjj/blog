---
categories:
- 网络安全
date: "2025-12-16"
description: CVE-2025-55182
slug: cve-2025-55182
tags:
- CVE
title: CVE-2025-55182
---

## 0x00漏洞原因
**RSC**：React 18引入了React Server Components，ServerCompoents的代码永远不会下载到浏览器，它们会在服务器执行，输出结果发送给客户端...所以在前端可以直接写后端代码，React会使用Flight协议自动处理前后端通信问题，这就是该漏洞的由来。
## 0x01如何验证漏洞是否存在
HTTP请求：
```http
POST / HTTP/2
Host: hostname
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36 Assetnote/1.0.0
Next-Action: x
X-Nextjs-Request-Id: b5dce965
Next-Router-State-Tree: %5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryx8jO2oVc6SWP3Sad
X-Nextjs-Html-Request-Id: SSTMXm7OJ_g0Ncx6jpQt9
Content-Length: 232

------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="1"

{}
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="0"

["$1:a:a"]
------WebKitFormBoundaryx8jO2oVc6SWP3Sad--
```
如果返回类似：
```http
HTTP/1.1 500 Internal Server Error
Date: Thu, 04 Dec 2025 06:16:39 GMT
Content-Type: text/x-component
Connection: keep-alive
Cache-Control: no-store, must-revalidate, no-cache, max-age=0
Vary: rsc
Content-Length: 76

0:{"a":"$@1","f":"","b":"yd-J8UfWl70zwtaAy83s7"}
1:E{"digest":"2971658870"}
```
即代表存在。
对于POC，各大POC均有不同，为了让请求流程进入Flight的解析流程中，需要满足：
1.必须是POST方法
2.包含一个不为空的Next-Action(尽管在执行前，根本不会达到验证Next-Action，但是它必须要存在)
3.Content-Type必须是multipart/form-data。

参考文章：
- https://slcyber.io/research-center/high-fidelity-detection-mechanism-for-rsc-next-js-rce-cve-2025-55182-cve-2025-66478/
- 代码审计