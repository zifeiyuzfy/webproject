let db;
var modal = document.getElementById("myModal");
// 将数据库操作移到单独的函数中
function initializeUserOptions() {
  openDB("OJSystemDB", 1)
    .then(function (db1) {
      db = db1;
      readData();
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

// 使用SHA-256加密
function sha256Encrypt(password) {
  return CryptoJS.SHA256(password).toString();
}

//图片处理
// 用于存储图片的 URL
const imageUrls = [];
function allowDrop(event) {
  event.preventDefault();
  const contentImg = document.getElementById("img_here");
  contentImg.classList.add("drag-over");
}
function handleDrop(event) {
  event.preventDefault();
  const contentImg = document.getElementById("img_here");
  contentImg.classList.remove("drag-over");
  handleDropFiles(event.dataTransfer.files);
}
function handleDropFiles(files) {
  imageUrls.length = 0;
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imageUrl = event.target.result;
        // 将图片 URL 添加到数组中
        imageUrls.push(imageUrl);

        // 创建删除按钮
        const deleteBtn = document.createElement("div");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "X";
        // 创建图片元素
        const img = document.createElement("img");
        img.src = imageUrl;
        // 创建包含图片和删除按钮的容器
        const item = document.createElement("div");
        item.className = "sortable-item";
        item.appendChild(img);
        item.appendChild(deleteBtn);
        // 添加点击删除按钮的事件
        deleteBtn.addEventListener("click", function () {
          deleteImage(item);
        });
        // 添加图片容器到页面
        document.getElementById("img_here").appendChild(item);
        // 添加点击预览的事件
        img.addEventListener("click", function () {
          previewImage(imageUrl);
        });
        // 初始化拖拽排序
        initSortable();
      };
      reader.readAsDataURL(file);
    }
  }
}
function initSortable() {
  // 移除旧的 Sortable 实例
  const oldSortable = Sortable.get(document.getElementById("img_here"));
  if (oldSortable) {
    oldSortable.destroy();
  }
  // 初始化新的 Sortable 实例
  new Sortable(document.getElementById("img_here"), {
    animation: 150,
    handle: ".sortable-item",
    onUpdate: function (event) {
      // 在排序后更新数组顺序
      const fromIndex = event.oldIndex;
      const toIndex = event.newIndex;
      const movedItem = imageUrls.splice(fromIndex, 1)[0];
      imageUrls.splice(toIndex, 0, movedItem);
    },
  });
}
function deleteImage(item) {
  // 找到要删除的图片在数组中的索引
  const index = Array.from(item.parentElement.children).indexOf(item);
  // 从数组和 DOM 中移除该图片
  imageUrls.splice(index, 1);
  item.remove();
}
function previewImage(imageSrc) {
  const previewModal = document.getElementById("previewModal");
  const previewImage = document.getElementById("previewImage");
  // 设置预览图片的路径
  previewImage.src = imageSrc;
  // 显示预览模态框
  previewModal.style.display = "flex";
}
function closePreview() {
  const previewModal = document.getElementById("previewModal");
  // 隐藏预览模态框
  previewModal.style.display = "none";
}

//视频处理
// 用于存储视频的 URL
const videoUrls = [];
function allowDrop_video(event) {
  event.preventDefault();
  const contentVideo = document.getElementById("video_here");
  contentVideo.classList.add("drag-over");
}
function handleDrop_video(event) {
  event.preventDefault();
  const contentVideo = document.getElementById("video_here");
  contentVideo.classList.remove("drag-over");
  handleDropFiles_video(event.dataTransfer.files);
}
function handleDropFiles_video(files) {
  videoUrls.length = 0;
  for (const file of files) {
    if (file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const videoUrl = event.target.result;
        // 将图片 URL 添加到数组中
        videoUrls.push(videoUrl);

        // 创建删除按钮
        const deleteBtn = document.createElement("div");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "X";
        // 创建图片元素
        const video = document.createElement("video");
        video.src = videoUrl;
        // 创建包含图片和删除按钮的容器
        const item = document.createElement("div");
        item.className = "sortable-item";
        item.appendChild(video);
        item.appendChild(deleteBtn);
        // 添加点击删除按钮的事件
        deleteBtn.addEventListener("click", function () {
          deleteVideo(item);
        });
        // 添加图片容器到页面
        document.getElementById("video_here").appendChild(item);
        // 添加点击预览的事件
        video.addEventListener("click", function () {
          previewVideo(videoUrl);
        });
        // 初始化拖拽排序
        initSortable_video();
      };
      reader.readAsDataURL(file);
    }
  }
}
function initSortable_video() {
  // 移除旧的 Sortable 实例
  const oldSortable = Sortable.get(document.getElementById("video_here"));
  if (oldSortable) {
    oldSortable.destroy();
  }
  // 初始化新的 Sortable 实例
  new Sortable(document.getElementById("video_here"), {
    animation: 150,
    handle: ".sortable-item",
    onUpdate: function (event) {
      // 在排序后更新数组顺序
      const fromIndex = event.oldIndex;
      const toIndex = event.newIndex;
      const movedItem = videoUrls.splice(fromIndex, 1)[0];
      videoUrls.splice(toIndex, 0, movedItem);
    },
  });
}
function deleteVideo(item) {
  // 找到要删除的视频在数组中的索引
  const index = Array.from(item.parentElement.children).indexOf(item);
  // 从数组和 DOM 中移除该视频
  videoUrls.splice(index, 1);
  item.remove();
}
function previewVideo(videoSrc) {
  const previewModal_video = document.getElementById("previewModal_video");
  const previewVideo = document.getElementById("previewVideo");
  // 设置预览视频的路径
  previewVideo.src = videoSrc;
  // 播放视频
  previewVideo.play().catch((error) => {
    console.error("Autoplay was prevented:", error);
  });
  // 显示预览模态框
  previewModal_video.style.display = "flex";
}
function closePreview_video() {
  const previewModal_video = document.getElementById("previewModal_video");
  // 隐藏预览模态框
  previewModal_video.style.display = "none";
}

// 增加数据
function addData(event) {
  event.preventDefault(); // 阻止表单默认提交行为

  const formData = new FormData(document.getElementById("addForm")); // 表单的 id 为 addForm
  const title = formData.get("title");
  const deadline = formData.get("deadline");
  const content = formData.get("content");

  const transaction = db.transaction(["problem"], "readwrite");
  const objectStore = transaction.objectStore("problem");

  const newProblem = {
    title: title,
    deadline: deadline,
    content: content,
    imageUrls: imageUrls,
    videoUrls: videoUrls,
  };

  const request = objectStore.add(newProblem);
  request.onsuccess = () => {
    document.getElementById("addForm").reset();
    readData(); // 刷新显示
  };

  request.onerror = (error) => {
    console.error("添加数据失败:", error);
  };
}

// 创建读取数据事务，并且调用displayData进行展示
function readData() {
  const transaction = db.transaction(["problem"], "readonly");
  const objectStore = transaction.objectStore("problem");

  const request = objectStore.getAll();

  request.onsuccess = () => {
    const data = request.result;
    displayData(data);
  };
}

// 获取搜索框和搜索按钮的DOM引用
const searchInput = document.getElementById("searchContent");
const searchButton = document.getElementById("searchButton");
const questionList = document.getElementById("questionList"); // 假设这是表格的tbody元素
const selectField = document.querySelector("select.field");

// 定义一个函数来显示过滤后的数据
function displayFilteredData(filteredData) {
  // 清空当前列表
  questionList.innerHTML = "";

  // 调用displayData函数来显示过滤后的数据
  displayData(filteredData);
}

// 存储当前选中字段的变量
let currentSearchField = "title"; // 默认搜索字段为'title'

// 给下拉选项栏添加变化事件监听器
selectField.addEventListener("change", function () {
  // 根据选项的value值更新currentSearchField
  currentSearchField = this.value;
  console.log(currentSearchField);
});

// 定义一个函数来过滤数据，并接受一个回调函数作为参数
function filterData(query, callback) {
  const transaction = db.transaction(["problem"], "readonly");
  const objectStore = transaction.objectStore("problem");
  const request = objectStore.getAll();

  request.onsuccess = () => {
    const data = request.result;
    // 过滤数据，并通过回调函数返回结果
    const filteredData = data.filter((item) => {
      const searchValue =
        item[currentSearchField] && item[currentSearchField].toLowerCase();
      return searchValue && searchValue.includes(query.toLowerCase());
    });
    callback(filteredData); // 调用回调函数并传递过滤后的数据
  };
}

// 给搜索按钮添加点击事件监听器
searchButton.addEventListener("click", function () {
  const query = searchInput.value.trim();

  if (query === "") {
    const transaction = db.transaction(["problem"], "readonly");
    const objectStore = transaction.objectStore("problem");
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const data = request.result;
      displayData(data); // 显示所有数据
    };
  } else {
    // 使用filterData函数，并提供一个回调函数来处理过滤后的数据
    filterData(query, (filteredData) => {
      displayFilteredData(filteredData); // 使用回调函数中的filteredData
    });
  }
});

var isEdit = false;
var editProblemId;

// 展示数据
function displayData(data, currentPage = 1, pageSize = 8) {
  let questionList = document.getElementById("questionList");
  questionList.innerHTML = "";

  document.getElementById("img_here").innerHTML = "";
  document.getElementById("video_here").innerHTML = "";

  // 计算总页数
  let totalRows = Math.ceil(data.length / pageSize);
  let totalPages = Math.ceil(data.length / pageSize);

  // 计算当前页的数据范围
  let startRow = (currentPage - 1) * pageSize;
  let endRow = Math.min(startRow + pageSize, data.length);

  let currentIndex = 0;

  // 更新分页控件

  for (let i = startRow; i < endRow; i++) {
    let item = data[i];
    let row = document.createElement("tr");

    row.className = currentIndex % 2 === 0 ? "even" : "odd";
    currentIndex++;

    // 创建包含复选框的td单元格
    let checkboxCell = document.createElement("td");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    // 创建td单元格，分别展示题目内容、类型、标签、答案
    let titleCell = document.createElement("td"); // 创建td单元格

    // 创建h3标签并添加到td单元格
    let headerCell = document.createElement("h3");
    titleCell.appendChild(headerCell);

    // 创建a标签，设置href属性和文本内容，并添加到h3单元格
    let link = document.createElement("a");
    link.href = "#"; // 这里可以设置为实际的链接地址
    link.textContent = item.title; // 假设item.content是你想展示的文本内容
    headerCell.appendChild(link);

    // 将嵌套了h3和a标签的td单元格添加到行中
    row.appendChild(titleCell);

    let contentCell = document.createElement("td");
    contentCell.textContent = item.content;
    row.appendChild(contentCell);

    let deadlineCell = document.createElement("td");
    deadlineCell.textContent = item.deadline;
    row.appendChild(deadlineCell);

    // 创建操作列的td单元格
    let operationCell = document.createElement("td");

    // 创建Delete链接
    let deleteLink = document.createElement("button");
    deleteLink.textContent = "删除";
    deleteLink.className = "ico del";

    // 创建Edit链接
    let editLink = document.createElement("button");
    editLink.textContent = "编辑";
    editLink.className = "ico edit";
    editLink.id = "editButton";

    // 将Delete和Edit链接添加到操作列的td单元格中
    operationCell.appendChild(deleteLink);
    operationCell.appendChild(document.createTextNode(" "));
    operationCell.appendChild(editLink);

    deleteLink.addEventListener("click", () => {
      deleteData(item.problemId);
    });

    editLink.addEventListener("click", () => {
      document.getElementById("img_here").innerHTML = "";
      document.getElementById("video_here").innerHTML = "";
      //进入编辑模式
      isEdit = true;
      editProblemId = item.problemId;

      var target = document.getElementById("target");

      // 点击时滚动到target元素
      target.scrollIntoView({
        behavior: "smooth", // 平滑滚动
        block: "start", // 滚动到元素的起始位置
      });

      editData(item.problemId);
    });

    // 将操作列的td单元格添加到行中
    row.appendChild(operationCell);

    questionList.appendChild(row);
  }

  let pagination = document.getElementById("pagination");
  pagination.innerHTML = ""; // 清空现有的分页控件

  let left = document.getElementById("left");
  left.innerHTML = ""; // 清空现有的分页控件

  // 展示分页信息
  let pageInfo = document.createElement("div");
  pageInfo.className = "left"; // 可以添加一个类，用于CSS样式定制
  pageInfo.textContent = `实验列表  ${startRow + 1} ~ ${endRow}`;
  left.appendChild(pageInfo);

  // 添加首页和尾页按钮（可选）
  let firstPageButton = document.createElement("button");
  firstPageButton.textContent = "<<";
  firstPageButton.disabled = currentPage === 1;
  firstPageButton.addEventListener("click", () => {
    displayData(data, 1);
  });
  pagination.appendChild(firstPageButton);

  // 添加页码按钮
  for (let i = 1; i <= totalPages; i++) {
    let pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.disabled = currentPage === i;
    pageButton.addEventListener("click", () => {
      displayData(data, i);
    });
    pagination.appendChild(pageButton);
  }

  let lastPageButton = document.createElement("button");
  lastPageButton.textContent = ">>";
  lastPageButton.disabled = currentPage === totalPages;
  lastPageButton.addEventListener("click", () => {
    displayData(data, totalPages);
  });
  pagination.appendChild(lastPageButton);
}

// 弹出确认框，确认后才删除，删除后重新展示数据
function deleteData(problemId) {
  if (confirm("确定要删除吗？")) {
    const transaction = db.transaction(["problem"], "readwrite");
    const objectStore = transaction.objectStore("problem");

    const request = objectStore.delete(problemId);

    request.onsuccess = () => {
      // 删除成功后刷新显示
      readData();
    };
  }
}

function editData(problemId) {
  const transaction = db.transaction(["problem"], "readwrite");
  const objectStore = transaction.objectStore("problem");

  // 获取请求对象，用于从数据库中检索数据
  const getRequest = objectStore.get(problemId);

  // 监听事务的完成事件
  transaction.oncomplete = function (event) {
    console.log("Transaction completed");
  };

  // 监听事务的错误事件
  transaction.onerror = function (event) {
    console.error("Transaction error", event.target.error);
  };

  // 监听获取请求的结果
  getRequest.onsuccess = function (event) {
    if (getRequest.result) {
      // 从请求结果中获取数据
      const problemData = getRequest.result;

      // 获取HTML元素
      const titleInput = document.querySelector('input[name="title"]');
      const deadlineInput = document.querySelector('input[name="deadline"]');
      const contentTextarea = document.querySelector(
        'textarea[name="content"]'
      );

      // 将数据填充到HTML元素中
      titleInput.value = problemData.title;
      let parsedDeadline;
      if (problemData.deadline) {
        parsedDeadline = new Date(problemData.deadline).toISOString();
        if (isNaN(parsedDeadline)) {
          // 如果解析的日期无效，可以选择设置一个默认日期或显示错误
          parsedDeadline = new Date().toISOString(); // 例如，设置为当前日期
        } else {
          deadlineInput.value = new Date(problemData.deadline)
            .toISOString()
            .split("T")[0]; // 将日期转换为YYYY-MM-DD格式
        }
      } else {
        // 如果没有提供截止日期，同样可以设置默认值
        parsedDeadline = new Date().toISOString();
      }

      contentTextarea.value = problemData.content;

      // 获取图片URL数组
      const submittedImageUrls = problemData.imageUrls;

      // 获取视频URL数组
      const submittedVideoUrls = problemData.videoUrls;

      submittedImageUrls.forEach((imageUrl) => {
        // 创建删除按钮
        const deleteBtn = document.createElement("div");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "X";
        // 创建图片元素
        const img = document.createElement("img");
        img.src = imageUrl;
        // 创建包含图片和删除按钮的容器
        const item = document.createElement("div");
        item.className = "sortable-item";
        item.appendChild(img);
        item.appendChild(deleteBtn);
        // 添加点击删除按钮的事件
        deleteBtn.addEventListener("click", function () {
          deleteImage(item);
        });
        // 添加图片容器到页面
        document.getElementById("img_here").appendChild(item);
        // 添加点击预览的事件
        img.addEventListener("click", function () {
          previewImage(imageUrl);
        });
        // 初始化拖拽排序
        initSortable();
      });

      submittedVideoUrls.forEach((videoUrl) => {
        // 创建删除按钮
        const deleteBtn = document.createElement("div");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "X";
        // 创建图片元素
        const video = document.createElement("video");
        video.src = videoUrl;
        // 创建包含图片和删除按钮的容器
        const item = document.createElement("div");
        item.className = "sortable-item";
        item.appendChild(video);
        item.appendChild(deleteBtn);
        // 添加点击删除按钮的事件
        deleteBtn.addEventListener("click", function () {
          deleteVideo(item);
        });
        // 添加图片容器到页面
        document.getElementById("video_here").appendChild(item);
        // 添加点击预览的事件
        video.addEventListener("click", function () {
          previewVideo(videoUrl);
        });
        // 初始化拖拽排序
        initSortable_video();
      });
    } else {
      console.log("No data found for the given problemId");
    }
  };

  // 监听获取请求的错误事件
  getRequest.onerror = function (event) {
    console.error("Error retrieving data", event.target.error);
  };
}

document.addEventListener("DOMContentLoaded", function () {
  // 获取按钮和目标元素
  var button = document.getElementById("submitButton");
  var target = document.getElementById("container");
  // 给按钮添加点击事件监听器
  button.addEventListener("click", function () {
    // 点击时滚动到target元素
    target.scrollIntoView({
      behavior: "smooth", // 平滑滚动
      block: "start", // 滚动到元素的起始位置
    });

    if (isEdit) {
      //删除这一行的数据
      const transaction = db.transaction(["problem"], "readwrite");
      const objectStore = transaction.objectStore("problem");
      const request = objectStore.delete(editProblemId);
      request.onsuccess = () => {
        // 删除成功后刷新显示
        readData();
      };
      isEdit = false;
    }

    // imageUrls.length = 0;
    // videoUrls.length = 0;

    document.getElementById("img_here").innerHTML = "";
    document.getElementById("video_here").innerHTML = "";

    var msgContainer = document.getElementById("msgContainer");
    // 显示消息框
    msgContainer.style.display = "block";
  });
});

document.getElementById("addForm").addEventListener("submit", addData);

document.addEventListener("DOMContentLoaded", function () {
  // 获取按钮和消息框元素
  var closeButton = document.getElementById("closeButton");
  var msgDiv = document.querySelector(".msg-ok");

  // 为按钮添加点击事件监听器
  closeButton.addEventListener("click", function () {
    // 清空消息框的内容
    msgDiv.innerHTML = "";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // 获取按钮和目标元素
  var button = document.getElementById("add");
  var target = document.getElementById("target");

  // 给按钮添加点击事件监听器
  button.addEventListener("click", function () {
    // 点击时滚动到target元素
    target.scrollIntoView({
      behavior: "smooth", // 平滑滚动
      block: "start", // 滚动到元素的起始位置
    });

    document.getElementById("addForm").reset();
    document.getElementById("img_here").innerHTML = "";
    document.getElementById("video_here").innerHTML = "";
    // 滚动到目标元素的位置
  });
});

window.addEventListener("beforeunload", function (e) {
  // 标准的提示信息
  // const message = '您可能尚未保存您的更改！';

  // 存储用户输入到localStorage
  const titleInput = document.querySelector(".field.size1");
  if (titleInput) {
    localStorage.setItem("unsavedTitle", titleInput.value);
  }

  const deadlineInput = document.querySelector(".field.size2");
  if (deadlineInput) {
    localStorage.setItem("unsavedDeadline", deadlineInput.value);
  }

  const contentInput = document.querySelector(".field.size3");
  if (contentInput) {
    localStorage.setItem("unsavedContent", contentInput.value);
  }
  // 对于Chrome和Firefox，设置 returnValue
  // e.returnValue = message;

  // 对于Safari，设置 returnValue 并不起作用，您需要返回一个字符串
  // return message;
});

// 页面加载时，检查是否有未保存的标题并恢复
window.addEventListener("load", function () {
  const savedTitle = localStorage.getItem("unsavedTitle");
  const savedDeadline = localStorage.getItem("unsavedDeadline");
  const savedContent = localStorage.getItem("unsavedContent");
  if (savedTitle) {
    document.querySelector(".field.size1").value = savedTitle;
    // 可以在这里添加额外的逻辑，比如自动提交表单等
  }

  if (savedDeadline) {
    document.querySelector(".field.size2").value = savedDeadline;
    // 可以在这里添加额外的逻辑，比如自动提交表单等
  }

  if (savedContent) {
    document.querySelector(".field.size3").value = savedContent;
    // 可以在这里添加额外的逻辑，比如自动提交表单等
  }
});
