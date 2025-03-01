# Confluence 浮动目录

## 描述
Confluence 浮动目录插件是一个使用 Tampermonkey 实现的用户脚本。它通过提供一个随页面滚动而保持可见的浮动目录（TOC），增强了 Confluence 文档的浏览体验。

## 演示

![image](https://github.com/user-attachments/assets/75e17794-4e9a-40d1-bede-5dd879945491)

## 功能特点
- **浮动目录**：插件为 Confluence 页面添加了一个浮动目录，使用户能够轻松浏览文档。
- **自动生成**：目录根据文档中的标题自动生成，使目录保持最新状态变得简单。
- **平滑滚动**：点击目录条目会平滑滚动到相应的章节。
- **暗色模式支持**：插件会自动检测 Confluence 的颜色模式（亮色/暗色），并相应地调整其样式。

## 安装

### 通过 Greasy Fork 安装

通过 Greasy Fork 安装 Confluence 浮动目录插件，请按照以下步骤操作：
1. 访问 [Confluence 浮动目录](https://greasyfork.org/zh-CN/scripts/500070-confluence-floating-toc) 网站。
2. 点击"安装此脚本"按钮。
3. 在提示时确认安装。
4. 刷新任何已打开的 Confluence 页面以激活插件。

### 手动安装

要使用 Confluence 浮动目录插件，请按照以下步骤操作：
1. 在浏览器中安装用户脚本管理器扩展，如 [Tampermonkey](https://chromewebstore.google.com/detail/%E7%AF%A1%E6%94%B9%E7%8C%B4/dhdgffkkebhmkfjojejmpbldmpobfkfo)。
2. 打开脚本管理器并创建一个新脚本。
3. 复制此仓库中 `main.js` 文件的内容。
4. 将复制的内容粘贴到脚本编辑器中。
5. 保存脚本并刷新任何已打开的 Confluence 页面。

## 使用方法
安装插件后，您需要刷新已打开的 Confluence 页面才能激活插件功能。刷新后，浮动目录将自动出现在 Confluence 页面上。您可以点击目录条目导航到文档的相应部分。

## 贡献
欢迎贡献！如果您有任何建议、错误报告或功能请求，请在 GitHub 仓库上开一个 issue 或提交一个 pull request。

## 许可证
该插件使用 MIT 许可证授权。有关更多信息，请参阅 [LICENSE](LICENSE) 文件。
