const query = new URLSearchParams(location.search);
let teacher = query.get("teacher");
const studentCards = document.querySelector(".students__wrapper-cards");
const pagination = document.querySelector(".students__wrapper-pagination");
const dropArea = document.querySelector(".dropArea");

let userImage;
let selected = null;
let pages;
let page = 1;

const getStudentsData = async () => {
  studentCards.innerHTML = "";
  let {data: teacherName} = await request.get(`teachers/${teacher}`);
  let {data: teachers} = await request.get('teachers')
  const params = { page, LIMIT };
  let { data } = await request.get(`teachers/${teacher}/students`, { params });
  pages = Math.ceil(data.length / 8);
  data.map((st) => {
    studentCards.innerHTML += getStudentsCard(st, teacherName);
  });
  teachers.map()
  getPagination();
};
getStudentsData();

const getStudentsCard = (st, tchN) => {
  return `
    <div class="students__wrapper-cards-card">
    <div class="students__wrapper-cards-card-img">
      <img src="${st.avatar}" alt="" />
    </div>
    <div class="students__wrapper-cards-card-text">
      <h2>${st.firstName + " " + st.lastName}</h2>
      <div>
        <p>${st.email}</p>
        <p>Teacher: <b>${tchN.firstName} ${tchN.lastName}</b></p>
        <p>${new Date(st.birthday).toLocaleDateString()}</p>
        <p>${st.isWork ? "Employed" : "Unemployed"}</p>
        <p>${st.phoneNumber}</p>
      </div>
    <div class="buttons">
    <ul class="wrapper">
    <li class="icon edit" onclick="editStudent(${st.id})">
        <span class="tooltip">Edit</span>
        <span>
          <i class="fa-solid fa-pen-to-square"></i>
        </span>
    </li>
    <li class="icon delete" onclick="deleteStudent(${st.id})">
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
const deleteStudent = async (id) => {
    let confirmDel = confirm('Do you really want to delete this student?')
    if(confirmDel){
        await request.delete(`teachers/${teacher}/students/${id}`);
        getStudentsData();
    }
};
const editStudent = async (id) => {
  selected = id;
  if (selected === null) {
    document.getElementById("addEditBtn").textContent = "Add student";
  } else {
    document.getElementById("addEditBtn").textContent = "Save student";
  }
  document.querySelector(".modalWrapper").style.display = "flex";
  let studentID = await request.get(`teachers/${teacher}/students/${id}`);
  console.log(studentID);
  document.getElementById("firstName").value = studentID.data.firstName;
  document.getElementById("lastName").value = studentID.data.lastName;
  document.getElementById("birthday").value = studentID.data.birthday;
  document.getElementById("isWork").checked = studentID.data.isWork;
  document.getElementById("phoneNumber").value = studentID.data.phoneNumber;
  document.getElementById("email").value = studentID.data.email;
  userImage = studentID.data.avatar;
  document.querySelector(
    ".dropArea"
  ).style.backgroundImage = `url(${studentID.data.avatar})`;
  document.querySelector(".dropArea").style.backgroundPosition = `center`;
  document.querySelector(".dropArea").style.backgroundRepeat = `no-repeat`;
  document.querySelector(".dropArea").style.backgroundSize = `cover`;
};

document.querySelector(".openModal").addEventListener("click", () => {
  selected = null;
  document.getElementById("postForm").reset();
  document.querySelector('.dropArea').style.backgroundImage = 'none'
  document.querySelector(".modalWrapper").style.display = "flex";
  if (selected === null) {
    document.getElementById("addEditBtn").textContent = "Add student";
  } else {
    document.getElementById("addEditBtn").textContent = "Save student";
  }
});

document.querySelector(".closeModal").addEventListener("click", () => {
  document.querySelector(".modalWrapper").style.display = "none";
});

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
      document.querySelector(
        ".dropArea"
      ).style.backgroundImage = `url(${res.data.secure_url})`;
      document.querySelector(".dropArea").style.backgroundPosition = `center`;
      document.querySelector(".dropArea").style.backgroundRepeat = `no-repeat`;
      document.querySelector(".dropArea").style.backgroundSize = `cover`;
    });
});

document
  .getElementById("postForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const student = {
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      avatar: userImage,
      isWork: this.isWork.checked,
      phoneNumber: this.phoneNumber.value,
      email: this.email.value,
      birthday: this.birthday.value,
    };
    try {
      console.log(student);
      if (selected === null) {
        await request.post(`teachers/${teacher}/students`, student);
        document.querySelector(".modalWrapper").style.display = "none";
        document.getElementById("postForm").reset();
        document.querySelector(".dropArea").style.backgroundImage = "none";
        getStudentsData();
      } else {
        document.getElementById("addEditBtn").textContent = "Save teacher";
        await request.put(`teachers/${teacher}/students/${selected}`, student);
        document.querySelector(".modalWrapper").style.display = "none";
        document.getElementById("postForm").reset();
        getStudentsData();
        selected = null;
      }
    } catch (err) {
      alert(err.response);
      console.log(teacher);
    }
  });
