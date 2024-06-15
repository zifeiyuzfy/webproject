let db;
var modal = document.getElementById("myModal");
// 将数据库操作移到单独的函数中
function initializeUserOptions() {
  openDB("OJSystemDB", 1)
    .then(function (db1) {
      db = db1;
      displayAnnouncements();
      // 加载并显示问题列表
      cursorGetData(db, "problem").then((problems) => {
        // 获取页面上的问题列表容器元素
        const problemListUl = document.getElementById("problemListUl");
        // 遍历所有问题数据，并使用addProblemToList函数将它们添加到问题列表中
        problems.forEach((problem) => {
          addProblemToList(problemListUl, problem);
        });
      });
      // 解析当前页面的URL
      const queryParams = new URLSearchParams(window.location.search);
      // 从查询字符串中获取userId
      const userId = queryParams.get("userId");
      console.log("获得的userId为:", userId);
      return getDataByKey(db, "user", userId.toString()); // 使用return以等待promise
    })
    .then(function (userData) {
      var userOptions = document.querySelector(".user-actions");
      var type = userData.type;
      if (type === "teacher" || type === "student") {
        userOptions.innerHTML = `<a href="#" class="user-action">个人</a><a href="../html/login.html" class="user-action">退出</a>
      `;
      } else if (type === "guest") {
        userOptions.innerHTML = `<a href="../html/register.html" class="user-action">注册</a><a href="../html/login.html" class="user-action">登录</a>`;
      }
      // 确保DOM更新后，再添加事件监听器
      var userActionPersonal = document.querySelector('.user-action[href="#"]');
      if (userActionPersonal) {
        userActionPersonal.addEventListener("click", function (event) {
          event.preventDefault();
          modal.style.display = "block";
        });
      }
    })
    .catch(function (error) {
      console.error(error);
    });
}

// 调用函数以根据用户权限初始化首页
initializeUserOptions();

// 处理文件选择和预览
document.addEventListener("DOMContentLoaded", function () {
  var saveBtn = document.getElementById("saveProfile");
  var cancelBtn = document.getElementById("cancelProfile");
  document
    .getElementById("avatar")
    .addEventListener("change", function (event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var previewImage = document.getElementById("profile-avatar-preview");
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  // 点击保存按钮后的操作
  saveBtn.addEventListener("click", function () {
    // 这里添加保存个人信息的逻辑
    // 例如：获取表单数据，发送到服务器等
    console.log("保存个人信息的逻辑");
    // 隐藏模态窗口
    modal.style.display = "none";
  });

  // 点击取消按钮或关闭按钮时隐藏模态窗口
  cancelBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // 允许点击模态窗口外部区域来关闭它
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // 添加回到顶部按钮的点击事件监听器
  window.addEventListener("scroll", function () {});
  var backToTopButton = document.querySelector(".toolkit a");

  // 为按钮添加点击事件监听器
  backToTopButton.addEventListener("click", function (event) {
    event.preventDefault(); // 阻止链接默认行为

    // 如果 main-container 存在，滚动到其顶部
    var mainContainer = document.querySelector(".main-container");
    mainContainer.scrollTop = 0; // 滚动到顶部
  });
});

// 修改displayAnnouncements函数，用于从数据库中检索并显示最新的一条课程通知
function displayAnnouncements() {
  // 获取页面上的公告列表容器元素
  const announcementsList = document.getElementById("announcementsList");

  // 调用 cursorGetData 函数，并使用 .then() 处理 Promise
  cursorGetData(db, "announcement")
    .then(function (announcements) {
      // 按日期对公告进行降序排序
      const sortedAnnouncements = announcements.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      // 仅显示最新的一条公告
      const latestAnnouncement = sortedAnnouncements[0];
      if (latestAnnouncement) {
        // 为最新的公告数据创建一个新的div元素
        const announcementEl = document.createElement("div");
        announcementEl.className = "announcement";
        // 设置新div元素的HTML内容，包括公告的标题、内容和日期
        announcementEl.innerHTML = `
          <h3>${latestAnnouncement.title}</h3>
          <p>${latestAnnouncement.content}</p>
          <p>${latestAnnouncement.date}</p>
        `;
        // 将新创建的div元素添加到公告列表容器中
        announcementsList.appendChild(announcementEl);
      }

      // 添加“查看更多”按钮
      const moreLink = document.createElement("a");
      moreLink.href = "announcement.html"; // 确保路径正确
      moreLink.textContent = "查看更多";
      moreLink.id = "more-announcements";
      announcementsList.appendChild(moreLink);
    })
    .catch(function (error) {
      // 处理错误情况
      console.error("获取公告失败:", error);
    });
}

async function searchProblems(keyword) {
  keyword = keyword.toLowerCase(); // 将搜索关键字转换为小写
  // 使用 cursorGetData 函数来获取 'problem' 对象存储中的所有数据
  const problems = await cursorGetData(db, "problem");
  let results = problems.filter(function (problem) {
    // 检查问题标题或内容是否包含关键字
    return problem.title.toLowerCase().includes(keyword);
  });
  return results;
}

async function onSearchInput() {
  const keyword = document.getElementById("site-search").value.trim();
  if (keyword) {
    const results = await searchProblems(keyword); // 执行搜索并等待结果
    displaySearchResults(results); // 显示搜索结果
  } else {
    loadAndDisplayAllProblems(); // 如果搜索框为空，显示问题列表
  }
}

// 定义 loadAndDisplayAllProblems 函数，用于加载并显示所有问题
function loadAndDisplayAllProblems() {
  const problemListUl = document.getElementById("problemListUl");
  problemListUl.innerHTML = ""; // 清空现有列表
  cursorGetData(db, "problem").then((problems) => {
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
  cursorGetData(db, "problem").then((problems) => {
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
