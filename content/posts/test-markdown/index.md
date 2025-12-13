---
title: Markdown 样式与功能测试
date: 2025-12-13T09:55:00+08:00
draft: true
tags:
  - Test
  - Markdown
  - PaperMod
categories:
  - 测试
summary: 这是一篇用于测试 Hugo PaperMod 主题样式的文章，包含了标题、代码高亮、图片和引用等元素。
cover:
  image: https://picsum.photos/800/400
  alt: 这是文章封面图
  caption: 这是一个来自网络的随机封面图
  relative: false
---

# 这是一级大标题 (H1)
通常文章内部从 H2 开始使用，因为 H1 是文章标题。

## 1. 文本样式测试 (H2)

这是一段普通的文本，用来展示默认的字体和行高。PaperMod 的排版非常简洁，阅读体验很好。

这里展示 **粗体文字 (Bold)**，这里是 *斜体文字 (Italic)*，还有 ~~删除线 (Strikethrough)~~。

> 这是一个引用块 (Blockquote)。
> 
> 你知道的越多，你不知道的越多。
> 
> —— 佚名

---

## 2. 列表测试 (H2)

### 无序列表 (H3)
* 苹果
* 香蕉
* 橙子
  * 这是一个嵌套的列表项

### 有序列表 (H3)
1. 安装 Git
2. 安装 Hugo
3. 部署博客

---

## 3. 代码高亮测试 (H2)

下面展示不同语言的代码高亮效果：

**Python:**
```python
def hello_world():
    name = "PaperMod"
    print(f"Hello, {name}!")
    return True
```
自行测试
```Rust
// 这是一个 Rust 示例
fn main() {
    let name = "World";
    println!("Hello, {}!", name);
    
    // 简单的模式匹配
    let number = 42;
    match number {
        1 => println!("One!"),
        _ => println!("Not one!"),
    }
}
```
## 这是图片测试
插入图片，引用assets：
![测试图片](test.jpg)