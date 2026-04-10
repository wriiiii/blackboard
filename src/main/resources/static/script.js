const canvas = document.getElementById("boardCanvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const lineWidthInput = document.getElementById("lineWidth");
const lineWidthValue = document.getElementById("lineWidthValue");
const penBtn = document.getElementById("penBtn");
const eraserBtn = document.getElementById("eraserBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const saveBtn = document.getElementById("saveBtn");
const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const historyList = document.getElementById("historyList");
const saveModal = document.getElementById("saveModal");
const artNameInput = document.getElementById("artNameInput");
const modalError = document.getElementById("modalError");
const cancelSaveBtn = document.getElementById("cancelSaveBtn");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");
const toast = document.getElementById("toast");

let isDrawing = false;
let isEraser = false;
let lastX = 0;
let lastY = 0;
let saveInProgress = false;
let toastTimer = null;

function resizeCanvas() {
  const snapshot = document.createElement("canvas");
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  snapshot.getContext("2d").drawImage(canvas, 0, 0);

  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();

  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.drawImage(snapshot, 0, 0, width, height);
}

function updateDrawingStyle() {
  ctx.lineWidth = Number(lineWidthInput.value);
  lineWidthValue.textContent = `${ctx.lineWidth}px`;
  ctx.strokeStyle = isEraser ? "#0b1220" : colorPicker.value;
}

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function startDraw(event) {
  isDrawing = true;
  const point = getPoint(event);
  lastX = point.x;
  lastY = point.y;
}

function draw(event) {
  if (!isDrawing) return;
  const point = getPoint(event);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  lastX = point.x;
  lastY = point.y;
}

function stopDraw() {
  isDrawing = false;
}

function setTool(nextEraser) {
  isEraser = nextEraser;
  penBtn.classList.toggle("active", !isEraser);
  eraserBtn.classList.toggle("active", isEraser);
  updateDrawingStyle();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  updateDrawingStyle();
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("zh-CN", { hour12: false });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function openSaveModal() {
  modalError.textContent = "";
  artNameInput.value = "";
  saveModal.classList.add("open");
  saveModal.setAttribute("aria-hidden", "false");
  setTimeout(() => artNameInput.focus(), 40);
}

function closeSaveModal() {
  if (saveInProgress) return;
  saveModal.classList.remove("open");
  saveModal.setAttribute("aria-hidden", "true");
}

async function confirmSaveArtwork() {
  if (saveInProgress) return;
  const trimmed = artNameInput.value.trim();
  if (!trimmed) {
    modalError.textContent = "作品名称不能为空";
    return;
  }

  saveInProgress = true;
  saveBtn.disabled = true;
  confirmSaveBtn.disabled = true;
  confirmSaveBtn.textContent = "保存中...";
  try {
    const response = await fetch("/api/artworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
        imageDataUrl: canvas.toDataURL("image/png"),
      }),
    });

    if (!response.ok) {
      throw new Error("保存失败");
    }

    closeSaveModal();
    showToast("你画得太棒啦，小艺术家！作品已经保存成功啦");
  } catch (error) {
    modalError.textContent = `保存失败：${error.message}`;
  } finally {
    saveInProgress = false;
    saveBtn.disabled = false;
    confirmSaveBtn.disabled = false;
    confirmSaveBtn.textContent = "保存作品";
  }
}

function renderHistory(items) {
  if (!items.length) {
    historyList.innerHTML = "<li>暂无历史画作</li>";
    return;
  }

  historyList.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <img src="${item.imageDataUrl}" alt="${item.name}" />
      <div class="history-meta">
        <strong>${item.name}</strong>
        <div>保存时间：${formatTime(item.createdAt)}</div>
      </div>
    `;
    historyList.appendChild(li);
  });
}

async function openHistory() {
  historyPanel.classList.add("open");
  historyPanel.setAttribute("aria-hidden", "false");
  historyList.innerHTML = "<li>加载中...</li>";
  try {
    const response = await fetch("/api/artworks");
    if (!response.ok) throw new Error("读取失败");
    const items = await response.json();
    renderHistory(items);
  } catch (error) {
    historyList.innerHTML = `<li>读取失败：${error.message}</li>`;
  }
}

function closeHistory() {
  historyPanel.classList.remove("open");
  historyPanel.setAttribute("aria-hidden", "true");
}

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  startDraw(event);
});
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDraw);
canvas.addEventListener("pointerleave", stopDraw);
canvas.addEventListener("pointercancel", stopDraw);

colorPicker.addEventListener("input", updateDrawingStyle);
lineWidthInput.addEventListener("input", updateDrawingStyle);
penBtn.addEventListener("click", () => setTool(false));
eraserBtn.addEventListener("click", () => setTool(true));
clearBtn.addEventListener("click", clearCanvas);

exportBtn.addEventListener("click", () => {
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = `blackboard-${Date.now()}.png`;
  link.click();
});

saveBtn.addEventListener("click", openSaveModal);
historyBtn.addEventListener("click", openHistory);
closeHistoryBtn.addEventListener("click", closeHistory);
cancelSaveBtn.addEventListener("click", closeSaveModal);
confirmSaveBtn.addEventListener("click", confirmSaveArtwork);

saveModal.addEventListener("click", (event) => {
  if (event.target === saveModal) closeSaveModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSaveModal();
    closeHistory();
  }
  if (event.key === "Enter" && saveModal.classList.contains("open")) {
    confirmSaveArtwork();
  }
});

window.addEventListener("resize", resizeCanvas);

function init() {
  resizeCanvas();
  clearCanvas();
  setTool(false);
}

init();
