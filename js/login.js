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
        var objectStore;
        // 创建存储库
        objectStore = db.createObjectStore("user", { keyPath: "userId" });
        // 创建索引，在后面查询数据的时候可以根据索引查
        objectStore.createIndex("userId", "userId", { unique: true }); 
        objectStore.createIndex("password", "password", { unique: false });
        objectStore.createIndex("type", "type", { unique: false });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("submittedlist", "submittedlist", { unique: false });
        objectStore.createIndex("unsubmittedlist", "unsubmittedlist", { unique: false });
        objectStore.createIndex("disable", "disable", { unique: false });
        objectStore.createIndex("isAllowRegister", "isAllowRegister", { unique: false });
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
        isAllowRegister: false,
      },
      {
        userId: "1",
        password: "1",
        type: "teacher",
        name: "Teacher",
        submittedlist: [],
        unsubmittedlist: [],
        disable: false,
        isAllowRegister: false,
      },
      {
        userId: "2",
        password: "2",
        type: "student",
        name: "Guest",
        submittedlist: [],
        unsubmittedlist: [],
        disable: false,
        isAllowRegister: false,
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
// 当页面加载完成时触发DOMContentLoaded事件
document.addEventListener("DOMContentLoaded", function () {
    // 调用openDB函数打开数据库，并使用then处理数据库成功打开的情况
    openDB()
      .then(() => {
        // 存储默认数据
        storeDefaultData();        
      })
      .catch((error) => {
        // 处理数据库初始化失败的情况
        console.error("数据库初始化失败:", error);
      });
  });
  