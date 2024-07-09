// ==UserScript==
// @name         Confluence Floating TOC with Toggle
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  在 Confluence 文章页面上浮动展示文章目录，并支持展开和折叠功能，悬浮在 content-body 内部左侧并随滚动固定，过滤掉 id 为空的标题，监听页面变化，使用已有的 TOC 如果存在
// @author       Your Name
// @match        https://*.atlassian.net/wiki/*
// @grant        none
// ==/UserScript==


// 递归处理已有的 TOC，重新生成新的 TOC
function genertateTOCFromExistingToc(toc) {
    if (!toc) {
        return;
    }
    let currUl = document.createElement('ul');
    for (let i = 0; i < toc.children.length; i++) {
        // li > span > a > span > span
        var headerTextElement = toc.children[i].querySelector('span > a > span > span');
        if (!headerTextElement) {
            continue;
        }

        var headerText = headerTextElement.textContent;

        // 创建目录项
        var tocItem = document.createElement('li');

        // 创建链接
        var tocLink = document.createElement('a');
        tocLink.textContent = headerText;

        // 使用标题的 id 作为 URL 片段
        // 标题中的空格需要替换为 -，并且转为小写
        tocLink.href = '#' + headerText.replace(/\s/g, '-');
        tocItem.appendChild(tocLink);

        // 如果有子目录，递归处理
        var childUl = toc.children[i].querySelector('ul');
        if (childUl) {
            var newUl = genertateTOCFromExistingToc(childUl);
            if (newUl) {
                tocItem.appendChild(newUl);
            }
        }
        currUl.appendChild(tocItem);
    }

    return currUl;
}


function getExistingToc() {
    return document.querySelector('[data-testid="list-style-toc-level-container"]');
}

function generateTOCFormPage() {
    // 创建目录列表
    var tocList = document.createElement('ul');
    // 获取所有标题
    var headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(function (header) {
        // 过滤掉 id 为空的标题
        if (!header.id) return;

        // 创建目录项
        var tocItem = document.createElement('li');
        tocItem.style.marginLeft = (parseInt(header.tagName[1]) - 1) * 10 + 'px'; // 根据标题级别缩进

        // 创建链接
        var tocLink = document.createElement('a');
        tocLink.textContent = header.textContent;

        // 使用标题作为 URL 片段
        tocLink.href = '#' + header.textContent.replace(/\s/g, '-');
        tocItem.appendChild(tocLink);

        // 将目录项添加到目录列表中
        tocList.appendChild(tocItem);
    });
    return tocList;
}


function buildToggleButton(tocList) {
    // 添加折叠/展开按钮
    var toggleButton = document.createElement('button');
    toggleButton.textContent = '折叠';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '5px';
    toggleButton.style.right = '5px';
    toggleButton.style.backgroundColor = '#007bff';
    toggleButton.style.color = '#fff';
    toggleButton.style.border = 'none';
    toggleButton.style.padding = '5px';
    toggleButton.style.cursor = 'pointer';

    var isCollapsed = false;
    // 折叠和展开功能
    toggleButton.addEventListener('click', function () {
        if (isCollapsed) {
            tocList.style.display = 'block';
            toggleButton.textContent = '折叠';
        } else {
            tocList.style.display = 'none';
            toggleButton.textContent = '展开';
        }
        isCollapsed = !isCollapsed;
    });
    return toggleButton;
}


function buildToc() {
    // 创建浮动目录的容器
    var tocContainer = document.createElement('div');
    tocContainer.id = 'floating-toc-container';
    tocContainer.style.position = 'fixed';
    tocContainer.style.top = '200px';
    tocContainer.style.width = '200px';
    tocContainer.style.maxHeight = '80%';
    tocContainer.style.overflowY = 'auto';
    tocContainer.style.backgroundColor = '#fff';
    tocContainer.style.border = '1px solid #ccc';
    tocContainer.style.padding = '10px';
    tocContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    tocContainer.style.zIndex = '1000';
    tocContainer.style.fontSize = '14px';

    // 添加隐藏滚动条样式
    var style = document.createElement('style');
    style.innerHTML = `
        #floating-toc-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        #floating-toc-container::-webkit-scrollbar {
            display: none;
        }
    `;
    document.head.appendChild(style);

    // 添加标题
    var tocTitle = document.createElement('h3');
    tocTitle.textContent = '目录';
    tocTitle.style.marginTop = '0';
    tocContainer.appendChild(tocTitle);

    return tocContainer;
}


function generateTOC(tocContainer) {
    // 清空现有目录
    var tocList = tocContainer.querySelector('ul');
    if (tocList) {
        tocList.remove();
    }

    // 获取 content-body 容器
    var contentBody = document.getElementById('content-body');
    if (!contentBody) {
        console.error('未找到 id 为 content-body 的元素');
        return;
    }

    // 设置浮动目录的位置
    tocContainer.style.left = contentBody.getBoundingClientRect().left + 'px';

    // 检查是否存在已有的 TOC
    var existingTOC = getExistingToc();

    var toc;
    if (existingTOC) {
        toc = genertateTOCFromExistingToc(existingTOC);
        if (!toc) {
            console.error('生成目录失败');
        }
    } else {
        toc = generateTOCFormPage();
    }
    tocContainer.appendChild(toc);

    // 添加折叠/展开按钮
    const toggleButton = buildToggleButton(toc);
    tocContainer.appendChild(toggleButton);
}


(function () {
    'use strict';

    var tocContainer = buildToc();
    document.body.appendChild(tocContainer);

    generateTOC(tocContainer);

    function onUrlChange() {
        generateTOC(tocContainer);
    }

    // 使用 history API 拦截 URL 变化
    (function (history) {
        var pushState = history.pushState;
        var replaceState = history.replaceState;

        history.pushState = function () {
            var ret = pushState.apply(history, arguments);
            onUrlChange();
            return ret;
        };

        history.replaceState = function () {
            var ret = replaceState.apply(history, arguments);
            onUrlChange();
            return ret;
        };

        window.addEventListener('popstate', onUrlChange);
    })(window.history);

    // 监听窗口大小变化，调整目录位置
    window.addEventListener('resize', function () {
        var contentBody = document.getElementById('content-body');
        if (contentBody) {
            tocContainer.style.left = contentBody.getBoundingClientRect().left + 'px';
        }
    });
})();
