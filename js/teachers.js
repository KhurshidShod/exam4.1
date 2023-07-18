const teacherCards = document.querySelector(".teachers__wrapper-cards");
const searchInp = document.getElementById("teachersSearch");
const pagination = document.querySelector(".teachers__wrapper-pagination");
const marriedFilter = document.getElementById("marriedFilter");
const sortLastName = document.getElementById("sortLastName");
const browseBtn = document.querySelector(".dropArea p span");
const dropArea = document.querySelector(".dropArea");

let search = "";
let order = "asc";
let page = 1;
let pages;
let married;
let userImage = "";
let selected = null;

const phoneInput = document.getElementById("phoneNumber");
phoneInput.addEventListener("keyup", (e) => {
  if (phoneInput.value.length == 4) {
    phoneInput.value = `${phoneInput.value.slice(0, 4)}-`;
  }
  if (phoneInput.value.length == 7) {
    phoneInput.value = `${phoneInput.value.slice(
      0,
      4
    )}-(${phoneInput.value.slice(5, 7)})-`;
  }
  if (phoneInput.value.length == 13) {
    phoneInput.value = `${phoneInput.value.slice(
      0,
      4
    )}-${phoneInput.value.slice(5, 10)}${phoneInput.value.slice(10, 13)}-`;
  }
  if (phoneInput.value.length == 16) {
    phoneInput.value = `${phoneInput.value.slice(
      0,
      4
    )}-${phoneInput.value.slice(5, 13)}-${phoneInput.value.slice(
      14,
      16
    )}-${phoneInput.value.slice(17, 19)}`;
  }
});

document.querySelector(".closeModal").addEventListener("click", () => {
  document.querySelector(".modalWrapper").style.display = "none";
});
document.querySelector('.openModal').addEventListener("click", () => {
  document
  .getElementById("postForm").reset()
  document.querySelector('.dropArea').style.backgroundImage = 'none'
  selected = null;
  document.querySelector('.modalWrapper').style.display = 'flex'
  if(selected === null){
    document.getElementById('addEditBtn').textContent = 'Add teacher';
  } else {
    document.getElementById('addEditBtn').textContent = 'Save teacher';
  }
})
document
  .getElementById("postForm")
  .addEventListener("submit", async function(e) {
    e.preventDefault();
    const teacher = {
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      avatar: userImage,
      isMarried: this.isMarried.checked,
      phoneNumber: this.phoneNumber.value,
      email: this.email.value,
    };
    try {
      if(selected === null){
        await request.post("teachers", teacher);
        document.querySelector(".modalWrapper").style.display = "none";
        document
    .getElementById("postForm").reset()
        getTeachersData();
      } else {
        document.getElementById('addEditBtn').textContent = 'Save teacher';
        await request.put(`teachers/${selected}`, teacher);
        document.querySelector(".modalWrapper").style.display = "none";
        document.getElementById("postForm").reset()
        getTeachersData();
        selected = null;
      }
    } catch (err) {
      alert(err.response);
      console.log(teacher);
    }
  });

browseBtn.onclick = () => {
  document.getElementById("avatar").click();
};
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.boxShadow = "var(--box-shadow-inset)";
});
dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropArea.style.boxShadow = "var(--box-shadow)";
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "pentagol");
  data.append("cloud_name", "dz5tunz0r");
  axios
    .post("https://api.cloudinary.com/v1_1/dz5tunz0r/image/upload", data)
    .then((res) => {
      userImage = res.data.secure_url;
      document.querySelector(".dropArea").style.backgroundImage = `url(${
        res.data.secure_url
      })`;
      document.querySelector(".dropArea").style.backgroundPosition = `center`;
      document.querySelector(".dropArea").style.backgroundRepeat = `no-repeat`;
      document.querySelector(".dropArea").style.backgroundSize = `cover`;
    });
});
const getTeachersCard = (teacher) => {
  return `
    <div class="teachers__wrapper-cards-card">
    <div class="teachers__wrapper-cards-card-img">
      <img src="${teacher.avatar}" alt="" />
    </div>
    <div class="teachers__wrapper-cards-card-text">
      <h2>${teacher.firstName + " " + teacher.lastName}</h2>
      <div>
        <p>${teacher.email}</p>
        <p>${teacher.isMarried ? "Married" : "Single"}</p>
        <p>${teacher.phoneNumber}</p>
      </div>
    <div class="buttons">
    <ul class="wrapper">
    <li class="icon edit" onclick="editTeacher(${teacher.id})">
        <span class="tooltip">Edit</span>
        <span>
          <i class="fa-solid fa-pen-to-square"></i>
        </span>
    </li>
    <li class="icon students" onclick="openStudents(${teacher.id})">
        <span class="tooltip">Students</span>
        <span><i class="fa-solid fa-user-group"></i></span>
    </li>
    <li class="icon delete" onclick="deleteTeacher(${teacher.id})">
        <span class="tooltip">Delete</span>
        <span><i class="fa-solid fa-trash"></i></span>
    </li>
</ul>
</div>
  </div>
    </div>
  </div>
    `;
};

const getPagination = () => {
  if (pages > 1) {
    pagination.innerHTML += `
    <li onclick="getPage('-')" class="${
      page === 1 ? "disabled" : ""
    }"><button ${page === 1 ? "disabled" : ""}>Previous</button></li>
    `;
    for (let i = 1; i <= pages; i++) {
      pagination.innerHTML += `
        <li onclick="getPage(${i})" class="page-link ${
        page === i ? "active-link" : ""
      }"><button>${i}</button></li>
        `;
    }
    pagination.innerHTML += `
    <li onclick="getPage('+')" ${page === pages ? "disabled" : ""}><button ${
      page === pages ? "disabled" : ""
    }>Next</button></li>
    `;
    pagination.style.padding = "0.8rem 1rem !important";
  } else {
    pagination.innerHTML = "";
    pagination.style.padding = "0";
  }
};

const getTeachersData = async () => {
  teacherCards.innerHTML = `
  <div class="newtons-cradle">
<div class="newtons-cradle__dot"></div>
<div class="newtons-cradle__dot"></div>
<div class="newtons-cradle__dot"></div>
<div class="newtons-cradle__dot"></div>
</div>`;
  let params = {
    isMarried: married,
    firstName: search,
    page,
    limit: LIMIT,
    orderBy: "lastName",
    order,
  };
  let { data: teachersData } = await request.get("teachers", { params });
  let { data: totalData } = await request.get("teachers", {
    params: { isMarried: married, firstName: search },
  });
  pagination.innerHTML = "";
  pages = Math.ceil(totalData.length / 8);
  getPagination();
  teacherCards.innerHTML = "";
  if (pages === 0) {
    teacherCards.innerHTML = `
    <div class="teachers__wrapper-cards-notFound">
    <div class="teachers__wrapper-cards-notFound-text">
      <h3>User not found...</h3>
      <h1>Oops!</h1>
      <h5>We're sorry but we cannot find such user 😔</h5>
      <button onclick="window.location.reload()">Go back</button>
  </div>
  <div class="teachers__wrapper-cards-notFound-img">
    <img src="./images/notFound.png" alt="">
  </div>
  </div>
    `;
  }
  teachersData.map((teacher) => {
    teacherCards.innerHTML += getTeachersCard(teacher);
  });
};
getTeachersData();

const getPage = (pg) => {
  if (pg === "-") {
    page--;
  } else if (pg === "+") {
    page++;
  } else {
    page = pg;
  }
  getTeachersData();
};

const deleteTeacher = async (id) => {
  const askDelete = confirm("Do you really want to remove this teacher?");
  if (askDelete) {
    await request.delete(`teachers/${id}`);
    getTeachersData();
    if (pages !== page) {
      page = 1;
    }
  }
};

searchInp.addEventListener("keyup", function () {
  search = this.value;
  page = 1;
  getTeachersData();
});

marriedFilter.addEventListener("change", function () {
  married = this.value;
  getTeachersData();
});

sortLastName.addEventListener("change", function () {
  order = this.value;
  getTeachersData();
});

const editTeacher = async(id) => {
  selected = id;
  if(selected === null){
    document.getElementById('addEditBtn').textContent = 'Add teacher';
  } else {
    document.getElementById('addEditBtn').textContent = 'Save teacher';
  }
  document.querySelector(".modalWrapper").style.display = "flex";
  let teacherID = await request.get(`teachers/${id}`);
  console.log(teacherID)
  document.getElementById('firstName').value = teacherID.data.firstName;
  document.getElementById('lastName').value = teacherID.data.lastName;
  document.getElementById('isMarried').checked = teacherID.data.isMarried;
  document.getElementById('phoneNumber').value = teacherID.data.phoneNumber;
  document.getElementById('email').value = teacherID.data.email;
  userImage = teacherID.data.avatar;
  document.querySelector(".dropArea").style.backgroundImage = `url(${
    teacherID.data.avatar
  })`;
  document.querySelector(".dropArea").style.backgroundPosition = `center`;
  document.querySelector(".dropArea").style.backgroundRepeat = `no-repeat`;
  document.querySelector(".dropArea").style.backgroundSize = `cover`;
}
const openStudents = (id) => {
  window.location = `students.html?teacher=${id}`
}