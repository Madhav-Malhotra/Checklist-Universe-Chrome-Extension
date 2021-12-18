// ================= Fetch DOM objects =====================
const save = document.getElementById('save');
const add = document.getElementById('add');
const link = document.getElementById('url');
const list = document.getElementById('list-container');
const check = document.getElementById('checklist-container');
const del = document.getElementById('delete');
let i = 1;


// ================= Get checklist steps on initial extension load =====================
async function init() {
  //Get current tab url
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  link.value = tab.url;

  //Fetch list of steps for current url
  await chrome.storage.sync.get(tab.url, (res) => {
    let data = res[`${tab.url}`];
    if (!data) data = {list: []};
    else save.dataset.url = tab.url;

    //For each datastep, add step todo
    for (let step of data.list) {
      const stepElement = getStepElement(step, i);
      list.appendChild(stepElement);
      numState(1)
    }
    
    //Add event listeners for buttons
    add.onclick = () => addStep(numState(0))
    save.onclick = saveData
    del.onclick = deleteData
  })
}
init();


// ================ HELPER FUNCTIONS - STEPS ====================
function getStepElement(step, i) {
  //Create DOM elements
  const container = document.createElement("div");
  const li = document.createElement('input');
  const trash = document.createElement("button");
  const checkbox = document.createElement('input');

  //Modify DOM elements
  li.type = 'text';
  step.startsWith(`${i}. `) ? li.value = `${step}` : li.value = `${i}. ${step}`;
  if (!step) li.value = ""; li.placeholder = `${i}. Add new step`
  li.className = 'step-item';

  checkbox.type = 'checkbox';
  checkbox.addEventListener('click', () => toggleCheck(i));

  trash.innerText = "❌";
  trash.className = 'delete-step';
  trash.addEventListener('click', () => deleteStep(i));
  container.id = `step-id-${i}`;

  //Return step component
  container.appendChild(checkbox);
  container.appendChild(li);
  container.appendChild(trash);
  return container;
}

function addStep(i) {
  const newStep = getStepElement("", i);
  list.appendChild(newStep);
  numState(1);

}

function deleteStep(i) {
  const step = document.getElementById(`step-id-${i}`);
  numState(-1);
  step.remove();
}

function toggleCheck(i) {
  const step = document.getElementById(`step-id-${i}`);
  step.hasAttribute('checked') ? step.removeAttribute('checked') : step.setAttribute('checked', true);
}

function numState(change) {
  i += change;
  return i;
}



// ================ HELPER FUNCTIONS - DATA ====================
async function saveData(e) {
  //Get checklist steps and if they have value, save them
  const steps = document.querySelectorAll('.step-item');
  let data = {list: []};
  steps.forEach(step => {
    if (step.value) data.list.push(step.value);
  })
  const saveObj = {};
  saveObj[`${link.value}`] = data;

  //Remove old checklist data, save updated data.
  let url = e.target.dataset.url;
  if (url) await chrome.storage.sync.remove(url);
  chrome.storage.sync.set(saveObj, () => {
    save.innerText = 'Saved';
    setTimeout(() => save.innerText = 'Save', 3000);
  });
}

async function deleteData() {
  let url = save.dataset.url;
  await chrome.storage.sync.remove(url, () => {
    del.innerText = 'Deleted';
  });
}