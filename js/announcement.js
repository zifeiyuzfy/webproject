var modal = document.getElementById("myModal");
// 将数据库操作移到单独的函数中
function initializeUserOptions() {
  openDB("OJSystemDB", 1)
    .then(function (db1) {
      window.db = db1;
      cursorGetData(db, "announcement").then((announcements) => {
        const announcementListUl =
          document.getElementById("announcementListUl");
        announcements.forEach((announcement) => {
          addAnnouncementToList(announcementListUl, announcement);
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
    getDataByKey(db, "user", userId).then(function (userData) {
      var nickname = document.getElementById("nickname").value;
      var password = document.getElementById("password").value;
      var signature = document.getElementById("signature").value;
      var pendingdeal = document.getElementById("todo").value;
      var fileInput = document.getElementById("avatar");
      var file = fileInput.files[0];
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
        // 只有当密码发生变化时才更新密码
        if (password != sha256Encrypt(localStorage.getItem("password"))) {
          localStorage.setItem("password", password); // 更新本地存储的密码
          updateData.password = sha256Encrypt(password);
        }
        updateDB(db, "user", updateData);
        // 将创建的URL设置为img标签的src属性
        document.getElementById("user-avatar").src = updateData.avatar;

        modal.style.display = "none"; // 隐藏模态框
      };
      reader.readAsDataURL(file);
    });
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

async function searchAnnouncements(keyword) {
  keyword = keyword.toLowerCase(); // 将搜索关键字转换为小写
  // 使用 cursorGetData 函数来获取 'announcement' 对象存储中的所有数据
  const announcements = await cursorGetData(db, "announcement");
  let results = announcements.filter(function (announcement) {
    // 检查问题标题或内容是否包含关键字
    return announcement.title.toLowerCase().includes(keyword);
  });
  return results;
}

async function onSearchInput() {
  const keyword = document.getElementById("site-search").value.trim();
  if (keyword) {
    const results = await searchAnnouncements(keyword); // 执行搜索并等待结果
    displaySearchResults(results); // 显示搜索结果
  } else {
    loadAndDisplayAllAnnouncements(); // 如果搜索框为空，显示问题列表
  }
}

// 定义 loadAndDisplayAllAnnouncements 函数，用于加载并显示所有通知
function loadAndDisplayAllAnnouncements() {
  const announcementListUl = document.getElementById("announcementListUl");
  announcementListUl.innerHTML = ""; // 清空现有列表

  cursorGetData(db, "announcement").then((announcements) => {
    const sortedAnnouncements = announcements.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // 降序排序
    });
    sortedAnnouncements.forEach((announcement) => {
      addAnnouncementToList(announcementListUl, announcement);
    });
  });
}

function resetSearch() {
  // 清空搜索框
  document.getElementById("site-search").value = "";
  const announcementListUl = document.getElementById("announcementListUl");
  announcementListUl.innerHTML = ""; // 清空现有列表
  cursorGetData(db, "announcement").then((announcements) => {
    announcements.forEach((announcement) => {
      addAnnouncementToList(announcementListUl, announcement);
    });
  });
}

// 新增displaySearchResults函数，用于显示搜索结果
function displaySearchResults(results) {
  const announcementListUl = document.getElementById("announcementListUl");
  announcementListUl.innerHTML = ""; // 清空现有列表
  results.forEach((announcement) => {
    addAnnouncementToList(announcementListUl, announcement);
  });
}

function addAnnouncementToList(announcementListUl, announcement) {
  const listItem = document.createElement("li");
  listItem.className = "announcement-item";
  listItem.dataset.expanded = "false"; // 使用data属性记录详情展开状态

  // 创建详情容器并设置样式
  const detailsContainer = document.createElement("div");
  detailsContainer.className = "announcement-details";
  detailsContainer.style.display = "none"; // 初始时不显示详情

  const titleText = document.createTextNode(announcement.title);
  listItem.appendChild(titleText);

  // 填充详情内容
  fillDetailsContent(detailsContainer, announcement);

  // 将详情容器添加到列表项
  listItem.appendChild(detailsContainer);

  // 绑定点击事件，点击时切换问题详情的显示状态
  listItem.onclick = function () {
    const isExpanded = listItem.dataset.expanded === "true";
    listItem.dataset.expanded = !isExpanded; // 切换状态
    detailsContainer.style.display = isExpanded ? "none" : "block"; // 切换显示/隐藏
  };

  // 将列表项添加到问题列表容器中
  announcementListUl.appendChild(listItem);
}

function fillDetailsContent(container, announcement) {
  // 根据实际问题对象的属性填充详情内容
  container.innerHTML = `
        <p><strong>通知详情:</strong> ${announcement.content || "暂无内容"}</p>
        <p><strong>发布日期:</strong> ${announcement.date || "刚才"}</p>
    `;
}

// 使用SHA-256加密
function sha256Encrypt(password) {
  return CryptoJS.SHA256(password).toString();
}
