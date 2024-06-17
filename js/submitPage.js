const dbName = 'OJSystemDB';
const dbVersion = 1;
const objectStoreName = 'problem';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = function (e) {
            // 假设数据库和对象存储已经创建好
        };

        request.onsuccess = function (e) {
            const db = e.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onerror = function (e) {
            reject('Database open error: ' + e.target.error);
        };
    });
}

function loadProblem(db, problemId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([objectStoreName], 'readonly');
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.get(problemId);

        request.onsuccess = function (event) {
            const problem = event.target.result;
            if (problem) {
                resolve(problem);
            } else {
                reject('No problem record found for the given problemId');
            }
        };

        request.onerror = function (event) {
            reject('Load problem error: ' + event.target.error);
        };
    });
}

function displayProblem(problem) {
    const displayArea = document.getElementById('displayArea');
    displayArea.innerHTML = ''; // 清空之前的展示内容

    const titleElem = document.createElement('h2');
    titleElem.textContent = problem.title;
    displayArea.appendChild(titleElem);

    const contentElem = document.createElement('p');
    contentElem.textContent = problem.content;
    displayArea.appendChild(contentElem);

    // 检查是否存在imageUrls属性
    if (problem.imageUrls && Array.isArray(problem.imageUrls)) {
        // 遍历imageUrls数组
        problem.imageUrls.forEach(imageUrl => {
            const imgElem = document.createElement('img');
            imgElem.src = imageUrl; // 设置图片的src属性为imageUrl
            imgElem.alt = 'Problem Image'; // 可以设置一个默认的alt属性
            displayArea.appendChild(imgElem);
        });
    }
}

function getCurrentDateFormatted() {
    const date = new Date();
    return date.toISOString().split('T')[0]; // 格式化日期
}


// 将problemId和userId定义在全局作用域内
let problemId, userId;

document.addEventListener('DOMContentLoaded', function () {
    // 从页面URL中解析problemId和userId
    const urlParams = new URLSearchParams(window.location.search);
    problemId = urlParams.get('problemId');
    userId = urlParams.get('userId');

    // 获取返回按钮元素
    const returnButton = document.getElementById('returnButton');
    returnButton.addEventListener('click', function () {
        window.location.href = 'submit.html'; // 点击后跳转到submit.html
    });

    // 获取提交按钮元素
    const confirmSubmit = document.getElementById('confirmSubmit');
    confirmSubmit.addEventListener('click', handleSubmission);

    // 打开数据库并加载问题，然后展示问题详情
    openDB()
        .then(db => loadProblem(db, problemId))
        .then(problem => {
            displayProblem(problem);
        })
        .catch(error => {
            console.error('Error:', error);
            const displayArea = document.getElementById('displayArea');
            displayArea.textContent = 'Error loading problem data.';
        });
});

function handleSubmission() {
    const userInput = document.getElementById('userInput').value;
    // 获取所有选中的文件
    const userFiles = document.getElementById('userFile').files;
    const currentDate = getCurrentDateFormatted();

    let fileDataURLs = []; // 存储所有文件的DataURLs

    // 检查是否有文件被选中，并且读取它们作为DataURLs
    if (userFiles.length > 0) {
        // 使用Promise.all来处理所有文件的读取操作
        const readPromises = Array.from(userFiles).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    resolve(e.target.result);
                };
                reader.onerror = function (e) {
                    reject(e);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readPromises)
            .then(results => {
                fileDataURLs = results; // 所有文件的DataURLs
                performDatabaseOperations(fileDataURLs);
            })
            .catch(error => {
                console.error('Error reading files:', error);
                alert('An error occurred while reading the files.');
            });
    } else {
        // 如果没有文件被选中，直接执行数据库操作
        performDatabaseOperations(fileDataURLs);
    }

    function performDatabaseOperations(fileDataURLs) {
        openDB().then(db => {
            const transaction = db.transaction(['submit'], 'readwrite');
            const objectStore = transaction.objectStore('submit');

            const request = objectStore.index('problemId').openCursor(IDBKeyRange.only(problemId));
            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.userId === userId) {
                        const record = cursor.value;
                        record.count += 1;
                        record.isCorrect = 'unknown';
                        record.text = userInput;
                        record.updated = currentDate;
                        // 更新filesrc字段为包含所有文件的DataURLs的数组
                        record.filesrc = fileDataURLs;
                        cursor.update(record);
                    } else {
                        cursor.continue();
                    }
                } else {
                    // 创建新记录
                    const newRecord = {
                        userId: userId,
                        problemId: problemId,
                        count: 1,
                        isCorrect: false,
                        text: userInput,
                        updated: currentDate,
                        filesrc: fileDataURLs.length ? fileDataURLs : null
                    };
                    objectStore.add(newRecord);
                }
            };
            request.onerror = function (event) {
                console.error('Database error:', event.target.error);
            };
        }).then(() => {
            alert('Submission processed successfully.');
        }).catch(error => {
            console.error('Error processing submission:', error);
            alert('An error occurred during submission.');
        });
    }
}
