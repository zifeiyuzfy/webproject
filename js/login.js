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