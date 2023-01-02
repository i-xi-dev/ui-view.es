const TEST_ID = "test1";

function removeAttr(name) {
  document.getElementById(TEST_ID).removeAttribute(name);
}

function setAttr(name, value) {
  document.getElementById(TEST_ID).setAttribute(name, value);
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
