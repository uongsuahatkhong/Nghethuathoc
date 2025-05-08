// enhancements.js - chức năng mở rộng cho ebook

// -------------------------
// 1. Ghi chú cá nhân tích hợp popup highlight
// -------------------------
document.addEventListener("DOMContentLoaded", function () {
    const highlightPopup = document.getElementById("highlightPopup");
  
    let selectedText = "";
    let selectedRange = null;
  
    document.addEventListener("mouseup", function (e) {
      const sel = window.getSelection();
      if (sel.toString().length > 0) {
        selectedText = sel.toString();
        selectedRange = sel.getRangeAt(0);
  
        // Hiển thị popup tại vị trí chuột
        highlightPopup.style.left = e.pageX + "px";
        highlightPopup.style.top = e.pageY + "px";
        highlightPopup.innerHTML = `
          <textarea id="noteArea" placeholder="Nhập ghi chú..." rows="2" style="width: 180px; font-size: 10px;"></textarea>
          <button id="saveNote">Lưu ghi chú</button>
        `;
        highlightPopup.style.display = "block";
      } else {
        // highlightPopup.style.display = "none";  // không ẩn ngay lập tức để cho phép thao tác
      }
    });
  
    document.addEventListener("mousedown", function (e) {
      if (!highlightPopup.contains(e.target) && window.getSelection().toString().length === 0) {
        highlightPopup.style.display = "none";
      }
    });
  
    document.addEventListener("click", function (e) {
      if (e.target.id === "saveNote") {
        const noteText = document.getElementById("noteArea").value;
        if (!selectedRange) return;
  
        const span = document.createElement("span");
        span.className = "note-highlight";
        span.innerText = selectedText;
        span.setAttribute("data-note", noteText);
  
        span.addEventListener("click", function (event) {
          event.stopPropagation();
          showNotePopup(span, noteText);
        });
  
        selectedRange.deleteContents();
        selectedRange.insertNode(span);
  
        localStorage.setItem("note-" + selectedText, noteText);
  
        highlightPopup.style.display = "none";
        selectedRange = null;
      }
    });
  
    // Hiển thị lại ghi chú từ localStorage khi load
    window.addEventListener("load", function () {
      document.querySelectorAll("body *").forEach(el => {
        el.childNodes.forEach(child => {
          if (child.nodeType === 3) { // text node
            const text = child.textContent;
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith("note-") && text.includes(key.slice(5))) {
                const range = document.createRange();
                const index = text.indexOf(key.slice(5));
                if (index !== -1) {
                  range.setStart(child, index);
                  range.setEnd(child, index + key.slice(5).length);
                  const span = document.createElement("span");
                  span.className = "note-highlight";
                  span.innerText = key.slice(5);
                  const note = localStorage.getItem(key);
                  span.setAttribute("data-note", note);
                  span.addEventListener("click", function (event) {
                    event.stopPropagation();
                    showNotePopup(span, note);
                  });
                  range.deleteContents();
                  range.insertNode(span);
                }
              }
            });
          }
        });
      });
    });
  
    function showNotePopup(target, noteText) {
      const noteBox = document.createElement("div");
      noteBox.className = "note-popup";
      noteBox.style.position = "absolute";
      noteBox.style.left = target.getBoundingClientRect().left + window.scrollX + "px";
      noteBox.style.top = target.getBoundingClientRect().bottom + window.scrollY + "px";
      noteBox.style.background = "#fff3cd";
      noteBox.style.border = "1px solid #ffc107";
      noteBox.style.padding = "5px";
      noteBox.style.zIndex = 1000;
      noteBox.innerHTML = `
        <div>${noteText}</div>
        <button id="deleteNote">Xóa ghi chú</button>
      `;
      document.body.appendChild(noteBox);
  
      document.getElementById("deleteNote").addEventListener("click", () => {
        localStorage.removeItem("note-" + target.innerText);
        target.replaceWith(document.createTextNode(target.innerText));
        noteBox.remove();
      });
  
      document.addEventListener("click", function handler(e) {
        if (!noteBox.contains(e.target)) {
          noteBox.remove();
          document.removeEventListener("click", handler);
        }
      });
    }
  });
  







  let zoomLevel = 1;
    const zoomWrapper = document.getElementById('zoom-wrapper');
    const content = document.getElementById('content-container');
  
    function applyZoom() {
      zoomWrapper.style.transform = `scale(${zoomLevel})`;
      zoomWrapper.style.transformOrigin = 'top left';
  
      if (zoomLevel > 1) {
        content.style.overflow = 'auto'; // Cho cuộn khi zoom
      } else {
        content.scrollTop = 0;
        content.scrollLeft = 0;
        content.style.overflow = 'hidden';
      }
    }
  
    document.getElementById('zoom-in').addEventListener('click', () => {
      if (zoomLevel < 2) {
        zoomLevel += 0.1;
        applyZoom();
      }
    });
  
    document.getElementById('zoom-out').addEventListener('click', () => {
      if (zoomLevel > 0.5) {
        zoomLevel -= 0.1;
        applyZoom();
      }
    });
  
    // 🔄 Kéo chuột để cuộn nội dung
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
  
    content.addEventListener('mousedown', (e) => {
      if (zoomLevel <= 1) return;
  
      isDragging = true;
      content.classList.add('dragging');
      startX = e.pageX - content.offsetLeft;
      startY = e.pageY - content.offsetTop;
      scrollLeft = content.scrollLeft;
      scrollTop = content.scrollTop;
    });
  
    content.addEventListener('mouseleave', () => {
      isDragging = false;
      content.classList.remove('dragging');
    });
  
    content.addEventListener('mouseup', () => {
      isDragging = false;
      content.classList.remove('dragging');
    });
  
    content.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - content.offsetLeft;
      const y = e.pageY - content.offsetTop;
      const walkX = (x - startX);
      const walkY = (y - startY);
      content.scrollLeft = scrollLeft - walkX;
      content.scrollTop = scrollTop - walkY;
    });
  
    applyZoom(); // Áp dụng lần đầu