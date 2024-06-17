let db;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('OJSystemDB', 1);

        request.onupgradeneeded = function (e) {
            // 假设数据库和对象存储在第一次打开数据库时创建
            const db = e.target.result;
            const store = db.createObjectStore('submit', {
                keyPath: ['problemId', 'userId'] // 复合主键
            });
        };

        request.onsuccess = function (e) {
            db = e.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onerror = function (e) {
            console.error('Database open error:', e.target.error);
            reject('Database open error');
        };
    });
}

function loadSubmit(db, userId, problemId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['submit'], 'readonly');
        const store = transaction.objectStore('submit');
        const request = store.get([problemId, userId]);

        request.onsuccess = function (event) {
            const submit = event.target.result;
            if (submit) {
                console.log('Submit record loaded:', submit);
                resolve(submit);
            } else {
                console.log('No submit record found for the given userId and problemId');
                reject('No submit record found');
            }
        };

        request.onerror = function (event) {
            console.error('Load submit error:', event.target.error);
            reject('Load submit error');
        };
    });
}



function displaySubmit(submit) {
    console.log('Displaying submit:', submit);
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = ''; // 清空历史容器

    const displayNameMap = {
        'userId': '用户ID',
        'problemId': '问题ID',
        'text': '提交内容',
        'count': '提交次数',
        'isCorrect': '是否正确',
        'updated': '最近更新日期'
    };

    // 创建并添加文本信息元素
    const textElements = [
        'userId', 'problemId', 'text', 'count', 'isCorrect', 'updated'
    ];
    textElements.forEach(key => {
        const displayName = displayNameMap[key] || key; // 使用映射名称或默认使用键
        const elem = document.createElement('p');
        elem.textContent = `${displayName}: ${submit[key]}`;
        historyContainer.appendChild(elem);
    });

    // 检查filesrc是否存在，并且是一个数组
    if (submit.filesrc && submit.filesrc.length > 0 && Array.isArray(submit.filesrc)) {
        submit.filesrc.forEach((src, index) => {
            // 为每张图片创建一个img元素并添加到页面
            const imgElement = document.createElement('img');
            imgElement.src = src; // 设置图片的src属性
            imgElement.alt = `Image ${index + 1} for submission by user ${submit.userId} on problem ${submit.problemId}`;
            imgElement.style.width = '300px'; // 根据需要调整样式
            imgElement.onload = function () {
                console.log(`Image ${index + 1} loaded successfully.`);
            };
            imgElement.onerror = function () {
                console.error(`Image ${index + 1} failed to load.`);
            };
            historyContainer.appendChild(imgElement);
        });
    }
    // 如果filesrc为空或者不是数组，不展示任何图片
}

document.addEventListener('DOMContentLoaded', function () {
    // 解析 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const problemId = urlParams.get('problemId');
    const userId = urlParams.get('userId');
    console.log(`User ID: ${userId}, Problem ID: ${problemId}`);

    // 假设 openDB 和 loadSubmit 函数在这里或在外部脚本文件中定义
    openDB().then(db => {
        return loadSubmit(db, userId, problemId);
    }).then(submit => {
        displaySubmit(submit);
    }).catch(error => {
        console.error('Error processing request:', error);
        const historyContainer = document.getElementById('historyContainer');
        historyContainer.textContent = 'Error loading data.';
    });

    // 获取按钮元素并添加点击事件监听器
    const redirectButton = document.getElementById('returnButton');
    redirectButton.addEventListener('click', function () {
        // 点击按钮时，跳转到 submit.html
        window.location.href = 'submit.html';
    });
});