// ==UserScript==
// @name         Confluence Floating TOC
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  在 Confluence 文章页面上浮动展示文章目录，并支持展开和折叠功能
// @author       mkdir700
// @match        https://*.atlassian.net/wiki/*
// @grant        none
// @license      MIT
// ==/UserScript==


// 递归处理已有的 TOC，重新生成新的 TOC
function genertateTOCFromExistingToc(toc) {
    if (toc.textContent === '') {
        return;
    }
    let currUl = document.createElement('ul');
    currUl.id = 'floating-toc-ul';
    for (let i = 0; i < toc.children.length; i++) {
        // li > span > a
        var a = toc.children[i].querySelector('span > a');
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
        tocLink.href = a.href;
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
    tocList.id = 'floating-toc-ul';
    // 获取所有标题
    var headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(function (header) {
        // 过滤掉 id 为空的标题
        if (header.textContent === '') {
            return;
        }
        // 检查是否有属性 data-item-title
        if (header.hasAttribute('data-item-title')) {
            return;
        }
        // 检查属性 data-testid 是否等于 title-text
        if (header.getAttribute('data-testid') === 'title-text') {
            return;
        }
        if (header.id === 'floating-toc-title') {
            return;
        }
        // class 为 'cc-te0214' 的标题不需要显示在目录中
        if (header.className === 'cc-te0214') {
            return;
        }
        

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


function buildToggleButton() {
    // 添加折叠/展开按钮
    var toggleButton = document.createElement('button');
    toggleButton.textContent = '折叠';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '200px';
    toggleButton.style.right = '0';
    toggleButton.style.backgroundColor = '#007bff';
    toggleButton.style.color = '#fff';
    toggleButton.style.border = 'none';
    toggleButton.style.padding = '5px';
    toggleButton.style.cursor = 'pointer';

    var isCollapsed = false;
    // 折叠和展开功能
    toggleButton.addEventListener('click', function () {
        var tocContainer = document.getElementById('floating-toc-container');
        if (isCollapsed) {
            tocContainer.style.visibility = 'visible';
            toggleButton.textContent = '折叠';
        } else {
            tocContainer.style.visibility = 'hidden';
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
    tocContainer.style.width = '200px';
    tocContainer.style.backgroundColor = '#fff';
    tocContainer.style.border = '1px solid #ccc';
    tocContainer.style.padding = '10px';
    tocContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    tocContainer.style.zIndex = '4';
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

    return tocContainer;
}


function generateTOC() {
    // 检查是否存在已有的 TOC
    var existingTOC = getExistingToc();

    var toc;
    if (existingTOC) {
        toc = genertateTOCFromExistingToc(existingTOC);
    }

    if (toc === undefined || !toc) {
        toc = generateTOCFormPage();
    }
    
    toc.style.position = 'relative';
    toc.style.listStyle = 'none';
    toc.style.padding = '0';

    return toc
}

function updateMaxHeight(tocContainer) {
    const viewportHeight = window.innerHeight;
    const topOffset = parseFloat(tocContainer.style.top);
    tocContainer.style.maxHeight = (viewportHeight - topOffset - 20) + 'px'; // 20px 为一些额外的间距
}


(function () {
    'use strict';
    
    var container = document.createElement('div');
    container.id = 'floating-toc-div';
    container.style.position = 'fixed';
    container.style.right = '0';
    container.style.top = '200px'; // 设置为 200px
    container.style.maxHeight = 'calc(100vh - 400px)';
    container.style.overflowY = 'auto';
    
    // 添加隐藏滚动条样式
    var style = document.createElement('style');
    style.innerHTML = `
        #floating-toc-div {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        #floating-toc-div::-webkit-scrollbar {
            display: none;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(container);
    

    var tocContainer = buildToc();
    container.appendChild(tocContainer);

    // 添加折叠/展开按钮
    const toggleButton = buildToggleButton();
    container.appendChild(toggleButton);

    function onChange() {
        var tocList;
        tocList = document.getElementById('floating-toc-ul');
        if (tocList) {
            tocList.remove();
        }

        tocList = generateTOC(tocContainer);
        tocContainer.appendChild(tocList);

        // 动态计算最大高度
        updateMaxHeight(tocContainer);
    }

    onChange();

    var latestMainContent;
    var latestEditorTextarea;

    window.addEventListener('load', function () {
        const checkMainContentExistence = setInterval(function() {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                if (latestMainContent === mainContent) {
                    return;
                }
                onChange();
            }
        }, 1000);

        // 轮询检查 ak-editor-textarea 是否存在
        const checkTextareaExistence = setInterval(function() {
            const editorTextarea = document.getElementById('ak-editor-textarea');
            if (editorTextarea) {
                if (latestEditorTextarea === editorTextarea) {
                    return;
                }
                onChange();
            }
        }, 1000);

    });

    // 确保目录在滚动时保持在视口内
    window.addEventListener('scroll', function () {
        updateMaxHeight(tocContainer);
    });
})();

