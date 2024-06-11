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

// 定义storeDefaultData函数，用于在数据库中存储默认数据
function storeDefaultData() {
  if (
    db.objectStoreNames.contains("user") &&
    db.objectStoreNames.contains("problem") &&
    db.objectStoreNames.contains("announcement") &&
    db.objectStoreNames.contains("submit")
  ) {
    const users = [
      {
        userId: "0",
        password: "0",
        type: "guest",
        name: "Guest",
        submittedlist: [],
        unsubmittedlist: [],
        disable: false,
      },
      {
        userId: "1",
        password: "1",
        type: "teacher",
        name: "Teacher",
        submittedlist: [],
        unsubmittedlist: [],
        disable: false,
      },
      {
        userId: "2",
        password: "2",
        type: "student",
        name: "Guest",
        submittedlist: [],
        unsubmittedlist: [],
        disable: false,
      },
    ];

    const defaultAnnouncements = [
      {
        announcementId: "1",
        title: "公告1",
        content: "这是公告1的内容",
        date: "2024-06-10",
        isvisited: false,
      },
      {
        announcementId: "2",
        title: "公告2",
        content: "这是公告2的内容",
        date: "2024-06-11",
        isvisited: false,
      },
      {
        announcementId: "3",
        title: "公告3",
        content: "这是公告3的内容",
        date: "2024-06-12",
        isvisited: false,
      },
      {
        announcementId: "4",
        title: "公告4",
        content: "这是公告4的内容",
        date: "2024-06-10",
        isvisited: false,
      },
      {
        announcementId: "5",
        title: "公告5",
        content: "这是公告5的内容",
        date: "2024-06-11",
        isvisited: false,
      },
      {
        announcementId: "6",
        title: "公告6",
        content: "这是公告6的内容",
        date: "2024-06-12",
        isvisited: false,
      },
      {
        announcementId: "7",
        title: "公告7",
        content: "这是公告7的内容",
        date: "2024-06-10",
        isvisited: false,
      },
      {
        announcementId: "8",
        title: "公告8",
        content: "这是公告8的内容",
        date: "2024-06-11",
        isvisited: false,
      },
      {
        announcementId: "9",
        title: "公告9",
        content: "这是公告9的内容",
        date: "2024-06-12",
        isvisited: false,
      },
      {
        announcementId: "10",
        title: "公告10",
        content: "这是公告10的内容",
        date: "2024-06-10",
        isvisited: false,
      },
      {
        announcementId: "11",
        title: "公告11",
        content: "这是公告11的内容",
        date: "2024-06-11",
        isvisited: false,
      },
      {
        announcementId: "12",
        title: "公告12",
        content: "这是公告12的内容",
        date: "2024-06-12",
        isvisited: false,
      },
    ];

    const defaultProblems = [
      {
        problemId: "1",
        title: "问题1",
        content: "这是问题1的内容",
      },
      {
        problemId: "2",
        title: "问题2",
        content: "这是问题2的内容",
      },
      {
        problemId: "3",
        title: "问题3",
        content: "这是问题3的内容",
      },
      {
        problemId: "4",
        title: "问题4",
        content: "这是问题4的内容",
      },
      {
        problemId: "5",
        title: "问题5",
        content: "这是问题5的内容",
      },
    ];

    const defaultSubmits = [
      {
        problemId: "1",
        userId: "1",
        text: "这是用户1对问题1的提交",
        count: 1,
        isCorrect: false,
        updated: "2024-06-10",
      },
      {
        problemId: "2",
        userId: "1",
        text: "这是用户1对问题2的提交",
        count: 2,
        isCorrect: false,
        updated: "2024-06-10",
      },
      {
        problemId: "1",
        userId: "2",
        text: "这是用户2对问题1的提交",
        count: 1,
        isCorrect: true,
        updated: "2024-06-10",
      },
      {
        problemId: "2",
        userId: "2",
        text: "这是用户2对问题2的提交",
        count: 2,
        isCorrect: true,
        updated: "2024-06-10",
      },
    ];

    const transaction = db.transaction(
      ["user", "problem", "announcement", "submit"],
      "readwrite"
    );
    const usersStore = transaction.objectStore("user");
    const announcementsStore = transaction.objectStore("announcement");
    const problemsStore = transaction.objectStore("problem");
    const submitStore = transaction.objectStore("submit");

    users.forEach((user) => usersStore.add(user));
    defaultAnnouncements.forEach((announcement) =>
      announcementsStore.add(announcement)
    );
    defaultProblems.forEach((problem) => problemsStore.add(problem));
    defaultSubmits.forEach((submit) => submitStore.add(submit));
  }
}

// 修改displayAnnouncements函数，用于从数据库中检索并显示最新的一条课程通知
function displayAnnouncements() {
  // 获取页面上的公告列表容器元素
  const announcementsList = document.getElementById("announcementsList");
  // 创建一个只读事务，用于从'announcement'对象存储中读取数据
  const transaction = db.transaction(["announcement"], "readonly");
  // 获取'announcement'对象存储
  const store = transaction.objectStore("announcement");
  // 创建一个读取所有公告的请求
  const request = store.getAll();

  // 当读取所有公告的请求成功时触发onsuccess事件
  request.onsuccess = function () {
    // 获取请求结果，即所有公告的数据
    const announcements = request.result.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    // 仅显示最新的一条公告
    const latestAnnouncement = announcements[0];
    if (latestAnnouncement) {
      // 为最新的公告数据创建一个新的div元素
      const announcementEl = document.createElement("div");
      // 设置新div元素的类名为'announcement'
      announcementEl.className = "announcement";
      // 设置新div元素的HTML内容，包括公告的内容、标题和日期
      announcementEl.innerHTML = `<h3>${latestAnnouncement.title}</h3><p>${latestAnnouncement.content}</p><p>${latestAnnouncement.date}</p>`;
      // 将新创建的div元素添加到公告列表容器中
      announcementsList.appendChild(announcementEl);
    }

    // 添加“查看更多”按钮
    const moreLink = document.createElement("a");
    moreLink.href = "../html/announcement.html";
    moreLink.textContent = "查看更多";
    moreLink.id = "more-announcements";
    announcementsList.appendChild(moreLink);
  };
}

// 定义loadProblemsFromStorage函数，用于从数据库中加载所有问题
function loadProblemsFromStorage() {
  // 确保这里使用的是正确的对象存储名称，并且它是存在的
  const transaction = db.transaction(["problem"], "readonly"); // 确保对象存储名称是 'problems'
  const store = transaction.objectStore("problem"); // 确保这里使用的名称与创建时一致
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (e) {
      reject(request.error);
    };
  });
}

// 新增searchProblems函数，用于搜索问题
function searchProblems(keyword) {
  keyword = keyword.toLowerCase(); // 将搜索关键字转换为小写
  const transaction = db.transaction(["problem"], "readonly");
  const store = transaction.objectStore("problem");

  // 使用游标遍历对象存储中的所有记录
  const request = store.openCursor();
  let results = []; // 初始化结果数组

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const problem = cursor.value;
      // 检查问题标题或内容是否包含关键字
      if (
        problem.title.toLowerCase().includes(keyword) ||
        problem.content.toLowerCase().includes(keyword)
      ) {
        results.push(problem); // 如果包含，添加到结果数组
      }
      cursor.continue(); // 继续遍历
    } else {
      // 搜索完成，显示结果
      displaySearchResults(results);
    }
  };

  request.onerror = function (event) {
    console.error("搜索失败:", event.target.error);
  };
}

// 修改 onSearchInput 函数，用于处理搜索框的输入事件
function onSearchInput() {
  const keyword = document.getElementById("site-search").value.trim();
  if (keyword) {
    searchProblems(keyword); // 执行搜索
  } else {
    // 如果搜索框为空，显示问题列表
    loadAndDisplayAllProblems();
  }
}

// 定义 loadAndDisplayAllProblems 函数，用于加载并显示所有问题
function loadAndDisplayAllProblems() {
  const problemListUl = document.getElementById("problemListUl");
  problemListUl.innerHTML = ""; // 清空现有列表
  loadProblemsFromStorage().then((problems) => {
    problems.forEach((problem) => {
      addProblemToList(problemListUl, problem);
    });
  });
}

function resetSearch() {
  // 清空搜索框
  document.getElementById("site-search").value = "";
  const problemListUl = document.getElementById("problemListUl");
  problemListUl.innerHTML = ""; // 清空现有列表
  loadProblemsFromStorage().then((problems) => {
    problems.forEach((problem) => {
      addProblemToList(problemListUl, problem);
    });
  });
}

// 新增displaySearchResults函数，用于显示搜索结果
function displaySearchResults(results) {
  const problemListUl = document.getElementById("problemListUl");
  problemListUl.innerHTML = ""; // 清空现有列表
  results.forEach((problem) => {
    addProblemToList(problemListUl, problem);
  });
}

// 定义addProblemToList函数，用于将问题数据添加到问题列表中
function addProblemToList(problemListUl, problem) {
  // 为每个问题创建一个列表项
  const listItem = document.createElement("li");
  listItem.className = "problem-item";
  listItem.dataset.expanded = "false"; // 使用data属性记录详情展开状态

  // 创建详情容器并设置样式
  const detailsContainer = document.createElement("div");
  detailsContainer.className = "problem-details";
  detailsContainer.style.display = "none"; // 初始时不显示详情

  // 设置问题的标题为列表项的文本
  const titleText = document.createTextNode(problem.title);
  listItem.appendChild(titleText);

  // 填充详情内容
  fillDetailsContent(detailsContainer, problem);

  // 将详情容器添加到列表项
  listItem.appendChild(detailsContainer);

  // 绑定点击事件，点击时切换问题详情的显示状态
  listItem.onclick = function () {
    const isExpanded = listItem.dataset.expanded === "true";
    listItem.dataset.expanded = !isExpanded; // 切换状态
    detailsContainer.style.display = isExpanded ? "none" : "block"; // 切换显示/隐藏
  };

  // 将列表项添加到问题列表容器中
  problemListUl.appendChild(listItem);
}

function fillDetailsContent(container, problem) {
  // 根据实际问题对象的属性填充详情内容
  container.innerHTML = `
        <p><strong>实验详情:</strong> ${problem.content || "暂无内容"}</p>
        <p><strong>最近提交时间:</strong> ${
          problem.lastSubmissionTime || "N/A"
        }</p>
        <p><strong>校验次数:</strong> ${problem.verificationCount || 0}</p>
        <p><strong>校验情况:</strong> ${problem.verificationStatus || "N/A"}</p>
        <p><strong>校验更新时间:</strong> ${
          problem.verificationUpdateTime || "N/A"
        }</p>
        <p><strong>答案点评:</strong> ${problem.evaluation || "暂无点评"}</p>
    `;
}

// 当页面加载完成时触发DOMContentLoaded事件
document.addEventListener("DOMContentLoaded", function () {
  // 调用openDB函数打开数据库，并使用then处理数据库成功打开的情况
  openDB()
    .then(() => {
      // 存储默认数据
      storeDefaultData();
      // 显示课程通知
      displayAnnouncements();
      // 加载并显示问题列表
      loadProblemsFromStorage().then((problems) => {
        // 获取页面上的问题列表容器元素
        const problemListUl = document.getElementById("problemListUl");
        // 遍历所有问题数据，并使用addProblemToList函数将它们添加到问题列表中
        problems.forEach((problem) => {
          addProblemToList(problemListUl, problem);
        });
      });
    })
    .catch((error) => {
      // 处理数据库初始化失败的情况
      console.error("数据库初始化失败:", error);
    });
});
