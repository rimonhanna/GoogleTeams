const homeButton = document.getElementById("home");
const minimizeButton = document.getElementById("minimize");
const maximizeButton = document.getElementById("maximize");
const restoreButton = document.getElementById("restore");
const closeButton = document.getElementById("close");
const meet = document.getElementById("meet-tab");
const chat = document.getElementById("chat-tab");
const currents = document.getElementById("currents-tab");

meet.addEventListener("click", () => {
  ipc.send("window.meet");
});
chat.addEventListener("click", () => {
  ipc.send("window.chat");
});
currents.addEventListener("click", () => {
  ipc.send("window.currents");
});

restoreButton.style.display = "none";
homeButton.addEventListener("click", () => {
  ipc.send("window.home");
});
minimizeButton.addEventListener("click", () => {
  ipc.send("window.minimize");
});
maximizeButton.addEventListener("click", () => {
  ipc.send("window.maximize");
});
restoreButton.addEventListener("click", () => {
  ipc.send("window.restore");
});
closeButton.addEventListener("click", () => {
  ipc.send("window.close");
});

ipc.on("window.maximized", () => {
  maximizeButton.style.display = "none";
  restoreButton.style.display = "flex";
});
ipc.on("window.restored", () => {
  maximizeButton.style.display = "flex";
  restoreButton.style.display = "none";
});