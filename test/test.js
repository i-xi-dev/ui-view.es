const TEST_ID = "test1";

function removeAttr(name) {
  document.getElementById(TEST_ID).removeAttribute(name);
}

function setAttr(name, value) {
  document.getElementById(TEST_ID).setAttribute(name, value);
}

function toggleAttr(name, value) {
  document.getElementById(TEST_ID).toggleAttribute(name, value);
}

function setProp(name, value) {
  document.getElementById(TEST_ID)[name] = value;
}

function removeDataset(name) {
  delete document.getElementById(TEST_ID).dataset[name];
}

function setDataset(name, value) {
  document.getElementById(TEST_ID).dataset[name] = value;
}

function clearSlot(slotName) {
  const slotAssignedList = document.getElementById(TEST_ID).querySelectorAll(`*[slot="${slotName}"]`);
  for (const assigned of slotAssignedList) {
    assigned.remove();
  }
}

function addToDataListSlot(formData) {
  const option = document.createElement("option");
  option.label = formData.get("lbl");
  option.value = formData.get("val");
  option.slot = "datalist";
  document.getElementById(TEST_ID).append(option);
}
