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
        objectStore.createIndex("disable", "disable", { unique: false });
        objectStore.createIndex("isAllowRegister", "isAllowRegister", {
          unique: false,
        });
        objectStore.createIndex("pendingdeal", "pendingdeal", {
          unique: false,
        });
        objectStore.createIndex("avatar", "avatar", {
          unique: false,
        });
      }
      // 创建 'problem' 对象存储
      if (!db.objectStoreNames.contains("problem")) {
        db.createObjectStore("problem", {
          keyPath: "problemId",
          autoIncrement: true,
        });
      }
      // 创建 'announcement' 对象存储
      if (!db.objectStoreNames.contains("announcement")) {
        db.createObjectStore("announcement", {
          keyPath: "announcementId",
          autoIncrement: true,
        });
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
        password: sha256Encrypt("0"),
        type: "guest",
        name: "Guest",
        disable: false,
        isAllowRegister: false,
        autograph: "欢迎光临！",
        pendingdeal: "暂无待办事项",
        avatar: "",
      },
      {
        userId: "1",
        password: sha256Encrypt("1"),
        type: "teacher",
        name: "Teacher",
        disable: false,
        isAllowRegister: false,
        autograph: "知识的传播者",
        pendingdeal: "准备下周的课程计划",
        avatar: "",
      },
      {
        userId: "2",
        password: sha256Encrypt("2"),
        type: "student",
        name: "Guest",
        disable: false,
        isAllowRegister: false,
        autograph: "努力学习，天天向上",
        pendingdeal: "完成今天的作业",
        avatar: "",
      },
      {
        userId: "3",
        password: sha256Encrypt("3"),
        type: "teacher",
        name: "admin",
        disable: false,
        isAllowRegister: false,
        autograph: "系统管理员",
        pendingdeal: "检查系统安全设置",
        avatar: "",
      },
      {
        userId: "4",
        password: "4",
        type: "student",
        name: "Student3",
        disable: false,
        isAllowRegister: false,
        autograph: "未来科学家",
        pendingdeal: "复习物理考试内容",
        avatar: "",
      },
      {
        userId: "5",
        password: sha256Encrypt("5"),
        type: "student",
        name: "Student4",
        disable: false,
        isAllowRegister: false,
        autograph: "热爱篮球",
        pendingdeal: "参加下午的篮球训练",
        avatar: "",
      },
      {
        userId: "6",
        password: sha256Encrypt("6"),
        type: "student",
        name: "Student5",
        disable: false,
        isAllowRegister: false,
        autograph: "音乐爱好者",
        pendingdeal: "练习钢琴曲目",
        avatar: "",
      },
      {
        userId: "7",
        password: sha256Encrypt("7"),
        type: "student",
        name: "Student6",
        disable: false,
        isAllowRegister: false,
        autograph: "编程小能手",
        pendingdeal: "完成编程项目作业",
        avatar: "",
      },
      {
        userId: "2021150154",
        password: sha256Encrypt("2021150154"),
        type: "student",
        name: "余泽锋",
        disable: false,
        isAllowRegister: false,
        autograph: "文学爱好者",
        pendingdeal: "阅读并完成读书笔记",
        avatar: "",
      },
      {
        userId: "2021150066",
        password: sha256Encrypt("2021150066"),
        type: "student",
        name: "吴意隆",
        disable: false,
        isAllowRegister: false,
        autograph: "旅行达人",
        pendingdeal: "计划暑假旅行路线",
        avatar: "",
      },
      {
        userId: "2021150079",
        password: sha256Encrypt("2021150079"),
        type: "student",
        name: "王智辉",
        disable: false,
        isAllowRegister: false,
        autograph: "环保卫士",
        pendingdeal: "组织校园环保活动",
        avatar: "",
      },
      {
        userId: "2021150090",
        password: sha256Encrypt("2021150090"),
        type: "student",
        name: "陈其财",
        disable: false,
        isAllowRegister: false,
        autograph: "环保卫士",
        pendingdeal: "组织校园环保活动",
        avatar: "",
      },
    ];

    const defaultAnnouncements = [
      {
        announcementId: "1",
        title: "注意事项",
        content:
          "本周6.17实验校验时间较久，请不要短时间内多次重复提交。实验检查项在实验提交中查看。校验次数达8次后展示具体错误，8次前仅展示错误类型。",
        date: "2024-06-17 10:00:00",
        isvisited: "0,1,2",
      },
      {
        announcementId: "2",
        title: "重要通知",
        content: "初始密码为大家各自的学号，登录后请及时修改密码",
        date: "2024-06-11 10:00:01",
        isvisited: "0,1,2",
      },
      {
        announcementId: "3",
        title: "课程变动",
        content: "由于某些原因，课程安排发生了变动，请留意。",
        date: "2024-06-12 10:00:00",
        isvisited: "0,1",
      },
      {
        announcementId: "4",
        title: "作业通知",
        content: "作业提交时间延长至下周一，请大家注意。",
        date: "2024-06-13 10:00:00",
        isvisited: "0,2",
      },
      {
        announcementId: "5",
        title: "考试安排",
        content: "期末考试时间地点已发布，请查看通知。",
        date: "2024-06-14 10:00:00",
        isvisited: "0,1",
      },
      {
        announcementId: "6",
        title: "实习机会",
        content: "腾讯提供暑期实习机会，有意向的同学请尽快报名。",
        date: "2024-06-15 10:00:00",
        isvisited: "0",
      },
      {
        announcementId: "7",
        title: "讲座通知",
        content: "本周五将有教授进行讲座，请有兴趣的同学准时参加。",
        date: "2024-06-15  10:01:00",
        isvisited: "0",
      },
      {
        announcementId: "8",
        title: "学术交流",
        content: "学校将举办国际学术交流会议，欢迎踊跃报名参加。",
        date: "2024-06-15 11:01:20",
        isvisited: "0",
      },
      {
        announcementId: "9",
        title: "实验室关闭",
        content: "实验室将于本周日进行例行维护，关闭一天。",
        date: "2024-06-15 11:01:30",
        isvisited: "0,1",
      },
      {
        announcementId: "10",
        title: "讲师换班",
        content: "本周三的基于web的编程课程将由另一位老师代课，请知悉。",
        date: "2024-06-15 11:01:40",
        isvisited: "0,2",
      },
      {
        announcementId: "11",
        title: "实践机会",
        content: "'闲购'项目组招募实践成员，有意向的同学请尽快报名。",
        date: "2024-06-14 10:00:00",
        isvisited: "0,1,2",
      },
      {
        announcementId: "12",
        title: "学术研讨",
        content: "本周末将有学术研讨会举行，对相关领域感兴趣的同学可参加。",
        date: "2024-06-17 09:17:26",
        isvisited: "0",
      },
    ];

    const defaultProblems = [
      {
        problemId: "1",
        title: "实验1.1 求知家园",
        content:
          "标题为“求知家园”，窗口文字为“欢迎来到我们的求知家园！”，文字颜色为blue背景颜色为#99FFFF，水平分隔线粗细为5，颜色为#FF3333",
        deadline: "2024-06-05",
      },
      {
        problemId: "2",
        title: "实验1.2 Google搜索",
        content:
          "标题为“Google搜索”；窗口首行文字为“欢迎使用Google搜索！”；文字下方为图片，图片地址为“http://172.31.73.236/resource/img/exp1_1.jpg”；背景颜色为#FFFF33；水平分隔线粗细为5、颜色为#0033FF",
        deadline: "2024-06-06",
      },
      {
        problemId: "3",
        title: "实验2.1 自荐信",
        content:
          "页面标题为“自荐信”；窗口第一行文字是居中的“自荐信”；上方水平分隔线粗细为1px，颜色为#000FFF；下方水平分隔线粗细为1px，颜色为#00FFFF；自荐信正文，包括标点符号无差错（全部中文全角标点）：从“尊敬的领导……敬礼！”；自荐信正文中“您好”、“感谢”、“我是”和“此致”4个段首有缩进（1个或多个空格），“敬礼”不能有段首缩进。；底部的联系信息内容准确，并且是斜体",
        deadline: "2024-06-07",
      },
      {
        problemId: "4",
        title: "实验2.2 数学方程式",
        content:
          "页面标题为数学方程式；窗口第一行文字是数学方程式；宽度为80%，大小为2px，蓝色的水平线；方程式1：2x^2 + 3x = 9；方程式2：x1 + x2 = 10；内容准确，上下标准确",
        deadline: "2024-06-08",
      },
      {
        problemId: "5",
        title: "实验2.3 windows不同版本",
        content:
          "页面标题为windows不同版本；列表1-8，列表项的编序和内容准确，包括字母大小写；列表项3、4的子项采用黑圆点编序，内容准确，包括字母大小写",
        deadline: "2024-06-09",
      },
      {
        problemId: "6",
        title: "实验2.4 图书奖公示",
        content:
          "页面标题为第四届中国大学出版社图书奖公示；窗口第一行文字是2号标题的第四届中国大学出版社图书奖公示；页面背景色是#ccffcc；文字内容展示正确，繁体的音韻學不可写为中文的音韵学；中文数字的一、二、三等和阿拉伯数字的1、2、3等互不通用；两个一半省略号……不能遗漏",
        deadline: "2024-06-10",
      },
      {
        problemId: "7",
        title: "实验2.5 桂林山水风景图片",
        content: "这是问题7的内容",
        deadline: "2024-06-11",
      },
      {
        problemId: "8",
        title: "实验2.6 apple网站",
        content: "这是问题8的内容",
        deadline: "2024-06-12",
      },
      {
        problemId: "9",
        title: "实验2.7 图像对齐方式的应用",
        content: "这是问题9的内容",
        deadline: "2024-06-13",
      },
      {
        problemId: "10",
        title: "实验3.1 个人简历",
        content: "这是问题10的内容",
        deadline: "2024-06-14",
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
