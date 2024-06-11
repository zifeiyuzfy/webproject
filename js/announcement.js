// 定义IndexedDB的数据库名称和版本号
const dbName = "OJSystemDB";
const dbVersion = 1;

// 声明一个全局变量db，用于在其他函数中访问IndexedDB数据库实例
let db;
// 定义openDB函数，用于打开IndexedDB数据库并创建对象存储
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function (e) {
      const db = request.result;
      // 创建 'user' 对象存储
      if (!db.objectStoreNames.contains("user")) {
        db.createObjectStore("user", { keyPath: "userId" });
      }
      // 创建 'problem' 对象存储
      if (!db.objectStoreNames.contains("problem")) {
        db.createObjectStore("problem", { keyPath: "problemId" });
      }
      // 创建 'announcement' 对象存储
      if (!db.objectStoreNames.contains("announcement")) {
        db.createObjectStore("announcement", { keyPath: "announcementId" });
      }
      // 创建 'submit' 对象存储，并设置复合主键
      if (!db.objectStoreNames.contains("submit")) {
        const store = db.createObjectStore("submit", {
          keyPath: ["problemId", "userId"],
          autoIncrement: false,
        });
        store.createIndex("problemId", "problemId");
        store.createIndex("userId", "userId");
      }
    };

    request.onsuccess = function (e) {
      db = e.target.result;
      console.log("数据库连接成功");
      resolve(db);
    };

    request.onerror = function (e) {
      console.error("数据库连接出错");
      reject(e);
    };
  });
}

// 获取返回按钮元素
const backButton = document.getElementById("backButton");

// 为返回按钮添加点击事件处理器
backButton.addEventListener("click", function () {
  window.location.href = "../html/index.html"; // 点击后跳转到首页
});

// 定义每页显示的公告数量
const announcementsPerPage = 10;
let currentPage = 1; // 当前页码
let allAnnouncements = []; // 存储从IndexedDB获取的所有公告

// 从IndexedDB获取所有公告并存储
function fetchAnnouncements() {
  const transaction = db.transaction(["announcement"], "readonly");
  const store = transaction.objectStore("announcement");
  const request = store.getAll();

  request.onsuccess = function () {
    allAnnouncements = request.result.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    displayAnnouncements(); // 获取公告后显示第一页的内容
  };
}

// 显示公告并进行分页
function displayAnnouncements() {
  const announcementsContainer = document.getElementById(
    "announcementsContainer"
  );
  announcementsContainer.innerHTML = ""; // 清空现有内容

  // 计算当前页的起始和结束索引
  const startIndex = (currentPage - 1) * announcementsPerPage;
  const endIndex = Math.min(
    startIndex + announcementsPerPage,
    allAnnouncements.length
  );

  // 显示当前页的公告
  for (let i = startIndex; i < endIndex; i++) {
    const announcement = allAnnouncements[i];
    const announcementEl = document.createElement("div");
    announcementEl.className = "announcement";
    announcementEl.innerHTML = `<h3>${announcement.title}</h3><p>${announcement.content}</p><p>${announcement.date}</p>`;
    announcementsContainer.appendChild(announcementEl);
  }

  // 更新分页导航
  updatePagination();
}

// 更新分页导航
function updatePagination() {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(allAnnouncements.length / announcementsPerPage);

  pagination.innerHTML = ""; // 清空现有分页按钮

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.classList.add("active");
    }
    pageButton.onclick = function () {
      currentPage = parseInt(this.textContent); // 更新当前页码
      displayAnnouncements(); // 重新显示公告
    };
    pagination.appendChild(pageButton);
  }
}

// 当页面加载完成时触发
document.addEventListener("DOMContentLoaded", function () {
  openDB()
    .then(() => {
      fetchAnnouncements(); // 获取并显示公告
    })
    .catch((error) => {
      console.error("数据库初始化失败:", error);
    });
});
