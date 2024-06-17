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
      const userId = localStorage.getItem("userId");
      return getDataByKey(db, "user", userId ? userId.toString() : "0"); // 使用return以等待promise
    })
    .then(function (userData) {
      var userOptions = document.querySelector(".user-actions");
      var type = userData.type;
      updateUserTypeNav(type);
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
          getDataByKey(db, "user", userData.userId).then(function (userData) {
            if (userData) {
              // 设置昵称、密码、签名档、个人待办事项的默认值
              document.getElementById("nickname").value = userData.name;
              document.getElementById("password").value = userData.password;
              document.getElementById("signature").value = userData.autograph;
              document.getElementById("todo").value = userData.pendingdeal;
            }
          });

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

// 根据用户类型显示或隐藏导航栏项目
function updateUserTypeNav(type) {
  const navItems = document.querySelectorAll(".navbar ul li:not(:first-child)"); // 获取所有导航项，除了第一个

  // 根据用户类型隐藏或显示导航项
  navItems.forEach((navItem) => {
    const link = navItem.querySelector("a");
    if (link) {
      const href = link.getAttribute("href");
      // 根据 href 来判断应该显示还是隐藏
      switch (type) {
        case "teacher":
          // 教师显示所有链接
          navItem.style.display = "block";
          break;
        case "student":
          // 学生隐藏发布问题和用户管理
          if (
            href.includes("publish.html") ||
            href.includes("usermanagementpage.html")
          ) {
            navItem.style.display = "none";
          }
          break;
        case "guest":
          // 访客只显示首页
          if (!href.includes("index.html")) {
            navItem.style.display = "none";
          }
          break;
        default:
          // 默认隐藏所有链接
          navItem.style.display = "none";
      }
    }
  });
}

// 头像文件输入逻辑，用于更新预览
document.getElementById("avatar").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // 更新头像预览
      const userAvatarImage = document.getElementById("user-avatar");
      userAvatarImage.src = e.target.result;
      document.getElementById("profile-avatar-preview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// 处理文件选择和预览
document.addEventListener("DOMContentLoaded", function () {
  var saveBtn = document.getElementById("saveProfile");
  var cancelBtn = document.getElementById("cancelProfile");
  const userId = localStorage.getItem("userId");

  //获取用户信息并设置头像
  openDB("OJSystemDB", 1).then(function (db) {
    getDataByKey(db, "user", userId)
      .then(function (userData) {
        if (userData && userData.avatar) {
          // 如果用户信息中有 avatar 字段，显示头像
          const userAvatarImage = document.getElementById("user-avatar");
          const profileAvatarPreview = document.getElementById(
            "profile-avatar-preview"
          );
          userAvatarImage.src = `${userData.avatar}`;
          profileAvatarPreview.src = `${userData.avatar}`;
        } else {
          // 如果没有 avatar 字段，设置为默认头像
          const userAvatarImage = document.getElementById("user-avatar");
          userAvatarImage.src = "../static/user.jpg";
        }
      })
      .catch(function (error) {
        console.error("Error fetching user data:", error);
        // 处理错误，例如设置默认头像等
      });
  });

  // 点击保存按钮后的操作
  saveBtn.addEventListener("click", function () {
    modal.style.display = "none"; // 隐藏模态框
    getDataByKey(db, "user", userId).then(function (userData) {
      var nickname = document.getElementById("nickname").value;
      var password = document.getElementById("password").value;
      var signature = document.getElementById("signature").value;
      var pendingdeal = document.getElementById("todo").value;
      var fileInput = document.getElementById("avatar");
      var file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          // 构造更新后的用户数据对象
          let updateData = {
            userId: localStorage.getItem("userId"),
            password: password, // 确保使用加密后的密码
            type: userData.type,
            name: nickname,
            disable: userData.disable,
            isAllowRegister: userData.isAllowRegister,
            autograph: signature,
            pendingdeal: pendingdeal,
            avatar: e.target.result, // 使用新上传的头像或现有的头像
          };
          console.log("updateData =:" + updateData);
          // 只有当密码发生变化时才更新密码
          if (password != sha256Encrypt(localStorage.getItem("password"))) {
            localStorage.setItem("password", password); // 更新本地存储的密码
            updateData.password = sha256Encrypt(password);
          }
          updateDB(db, "user", updateData);
          // 将创建的URL设置为img标签的src属性
          document.getElementById("user-avatar").src = updateData.avatar;
        };
        reader.readAsDataURL(file);
      } else {
        // 构造更新后的用户数据对象
        let updateData = {
          userId: localStorage.getItem("userId"),
          password: password, // 确保使用加密后的密码
          type: userData.type,
          name: nickname,
          disable: userData.disable,
          isAllowRegister: userData.isAllowRegister,
          autograph: signature,
          pendingdeal: pendingdeal,
          avatar: "",
        };
        // 只有当密码发生变化时才更新密码
        if (password != sha256Encrypt(localStorage.getItem("password"))) {
          localStorage.setItem("password", password); // 更新本地存储的密码
          updateData.password = sha256Encrypt(password);
        }
        updateDB(db, "user", updateData);
        // 将创建的URL设置为img标签的src属性
        document.getElementById("user-avatar").src = updateData.avatar;
      }
    });
    swal("保存成功");
    window.location.reload();
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
    var mainContainer = document.querySelector(".main-container");
    mainContainer.scrollTop = 0; // 滚动到顶部
  });

  // 获取复选框和主容器元素
  const checkbox = document.getElementById("checkbox");
  const mainContainer = document.querySelector(".main-container");

  // 为复选框添加点击事件监听器
  checkbox.addEventListener("change", function () {
    // 根据复选框的选中状态来设置 margin-left
    if (this.checked) {
      // 如果复选框被选中，设置较小的 margin-left
      mainContainer.style.marginLeft = "200px";
    } else {
      // 如果复选框未被选中，设置较大的 margin-left
      mainContainer.style.marginLeft = "100px";
    }
  });
});

// displayAnnouncements函数，用于从数据库中检索并显示最新的一条课程通知
function displayAnnouncements() {
  // 获取页面上的公告列表容器元素
  const announcementsList = document.getElementById("announcementsList");

  // 调用 cursorGetData 函数，并使用 .then() 处理 Promise
  cursorGetData(db, "announcement")
    .then(function (announcements) {
      // 检查未读通知
      let unvisitedCount = 0;
      announcements.forEach((announcement) => {
        if (
          !announcement.isvisited
            .split(",")
            .includes(localStorage.getItem("userId"))
        ) {
          unvisitedCount++;
        }
      });

      // 更新未读通知计数器
      const notificationBadge = document.getElementById("notificationBadge");
      if (unvisitedCount > 0) {
        notificationBadge.textContent = unvisitedCount;
        notificationBadge.removeAttribute("hidden"); // 显示通知
      } else {
        notificationBadge.setAttribute("hidden", ""); // 隐藏通知
      }

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

      // 添加“查看更多”按钮，并绑定点击事件
      const moreLink = document.createElement("a");
      moreLink.href = "#"; // 绑定点击事件，不直接跳转
      moreLink.textContent = "查看更多";
      moreLink.id = "more-announcements";
      moreLink.style = "text-decoration: none;"; // 防止链接默认的下划线
      moreLink.addEventListener("click", function (event) {
        event.preventDefault(); // 阻止链接默认的跳转行为
        markAsReadAndShowMore(); // 标记为已读并显示更多通知
      });
      announcementsList.appendChild(moreLink);

      getDataByKey(db, "user", localStorage.getItem("userId")).then(function (
        userData
      ) {
        if (userData.type === "teacher") {
          // 添加“新增公告”按钮
          const newAnnouncementLink = document.createElement("a");
          newAnnouncementLink.href = "#";
          newAnnouncementLink.textContent = "新增公告";
          newAnnouncementLink.id = "new-announcement";
          newAnnouncementLink.style =
            "text-decoration: none; margin-left: 10px;"; // 添加样式
          newAnnouncementLink.addEventListener("click", function (event) {
            event.preventDefault();
            showModalToAddAnnouncement();
          });
          announcementsList.appendChild(newAnnouncementLink);
        }
      });
    })
    .catch(function (error) {
      // 处理错误情况
      console.error("获取公告失败:", error);
    });
}

// 新增函数 showModalToAddAnnouncement 用于显示模态窗口
function showModalToAddAnnouncement() {
  // 创建模态窗口的HTML结构
  const modalHTML = `
    <div id="addAnnouncementModal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <div class="modal-header">
          <h2>新增公告</h2>
        </div>
        <input type="text" id="announcementTitle" placeholder="输入标题">
        <textarea id="announcementContent" placeholder="输入内容"></textarea>
        <div class="modal-footer">
          <button id="saveAnnouncement">保存</button>
          <button id="cancelAnnouncement">取消</button>
        </div>
      </div>
    </div>
  `;

  // 将模态窗口添加到body中
  const body = document.body;
  body.insertAdjacentHTML("beforeend", modalHTML);

  // 获取模态窗口元素
  const modal = document.getElementById("addAnnouncementModal");
  const span = document.getElementsByClassName("close")[0];

  // 显示模态窗口
  modal.style.display = "block";

  // 点击<span> (x), 关闭模态框
  span.onclick = function () {
    modal.style.display = "none";
  };
  // 点击取消按钮或关闭按钮时隐藏模态窗口
  cancelAnnouncement.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // 点击保存按钮，保存公告并关闭模态框
  document.getElementById("saveAnnouncement").onclick = function () {
    // 获取输入的标题和内容
    const title = document.getElementById("announcementTitle").value;
    const content = document.getElementById("announcementContent").value;

    let announcementData = {
      title: title,
      content: content,
      // date: new Date().toISOString().split("T")[0], // 获取当前日期并格式化为 "YYYY-MM-DD"
      date:
        new Date().toLocaleDateString("en-CA") +
        " " +
        new Date().toLocaleTimeString("en-CA", { hour12: false }),
      isvisited: "0",
    };
    addData(db, "announcement", announcementData);

    // 隐藏模态窗口
    modal.style.display = "none";

    // 清除输入框内容
    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementContent").value = "";
    window.location.reload();
  };
}

// 标记为已读并显示更多的函数
function markAsReadAndShowMore() {
  const userId = localStorage.getItem("userId");
  cursorGetData(db, "announcement").then((announcements) => {
    announcements.forEach((announcement) => {
      if (!announcement.isvisited.includes(userId)) {
        // 更新isvisited字段
        let updatedIsvisited = announcement.isvisited + "," + userId;
        var announcementData = {
          announcementId: announcement.announcementId,
          title: announcement.title,
          content: announcement.content,
          date: announcement.date,
          isvisited: updatedIsvisited,
        };
        updateDB(db, "announcement", announcementData);
      }
    });
    // 重定向到通知页面或加载通知数据
    window.location.href = "../html/announcement.html"; // 或者使用其他逻辑加载通知
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
    console.log("problems");
    // 按日期对问题进行降序排序
    const sortedProblems = problems.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateB - dateA; // 降序排序
    });

    // 遍历排序后的问题并添加到列表
    sortedProblems.forEach((problem) => {
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
        <p><strong>截止日期:</strong> ${problem.deadline || "未定"}</p>
    `;
}

// 使用SHA-256加密
function sha256Encrypt(password) {
  return CryptoJS.SHA256(password).toString();
}
