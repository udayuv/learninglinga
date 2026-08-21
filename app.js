// Telugu Daily — plain JavaScript.
// No jQuery, fetch(), AJAX, ES module import, or CORS dependency.

let DATA = window.APP_DATA;
let currentChapter = null;
let currentWord = 0;
let quizItems = [];
let quizIndex = 0;
let score = 0;

const $ = (id) => document.getElementById(id);

function initApp() {
  if (!DATA) {
    console.error("APP_DATA was not loaded. Make sure data.js is included before app.js.");
    return;
  }
  const btn = $('themeToggle');
  if (btn) btn.textContent = document.body.dataset.theme === 'dark' ? '☀️' : '🌙';
  renderDashboard();
}

function renderDashboard() {
  const chapter = DATA.chapters.find(c => c.id === DATA.app.currentChapter) || DATA.chapters[0];
  currentChapter = chapter;

  $("courseTitle").textContent = `Telugu / Day ${chapter.id}`;

  $("heroTitle").textContent = `Day ${chapter.id}: ${chapter.displayTitle}`;
  $("heroDescription").textContent = chapter.description;
  $("heroIcon").textContent = chapter.themeIcon;

  $("chapterList").innerHTML = DATA.chapters.map(ch => `
    <div class="chapter ${ch.id === DATA.app.currentChapter ? "current" : ""}"
         data-id="${ch.id}">
      <div class="chapter-num">${ch.number}</div>
      <div class="chapter-info">
        <div class="chapter-label">DAY ${ch.number}</div>
        <div class="chapter-name">${escapeHtml(ch.title)}</div>
      </div>
      <div class="chapter-arrow">›</div>
    </div>
  `).join("");

  document.querySelectorAll(".chapter").forEach(el => {
    el.addEventListener("click", () => openChapter(Number(el.dataset.id)));
  });

  $("howList").innerHTML = DATA.howItWorks.map(x => `
    <div class="how-row">
      <div class="how-num">${x.step}</div>
      <div>
        <div class="how-text">${escapeHtml(x.title)}</div>
        <div class="how-desc">${escapeHtml(x.description)}</div>
      </div>
    </div>
  `).join("");

}

function openChapter(id) {
  currentChapter = DATA.chapters.find(c => c.id === id);
  if (!currentChapter) return;

  DATA.app.currentChapter = id;
  currentWord = 0;

  $("dashboard").style.display = "none";
  $("quiz").style.display = "none";
  $("finish").style.display = "none";
  $("sectionTabs").style.display = "none";

  $("courseTitle").textContent = `Telugu / Day ${id}`;

  if (getTheoryContent()) {
    $("lesson").style.display = "none";
    $("theory").style.display = "block";
    renderTheory();
  } else {
    $("lesson").style.display = "block";
    $("theory").style.display = "none";
    if (currentChapter.viewMode === 'table') {
      switchTab('all');
    } else {
      switchTab('current');
      renderWord();
      renderAllWordsTable();
    }
  }
}

function switchTab(tab) {
  if (tab === 'current') {
    $("tabPanelCurrent").style.display = "block";
    $("tabPanelAll").style.display = "none";
    $("tabCurrentWord").classList.add("active");
    $("tabAllWords").classList.remove("active");
  } else {
    $("tabPanelCurrent").style.display = "none";
    $("tabPanelAll").style.display = "block";
    $("tabCurrentWord").classList.remove("active");
    $("tabAllWords").classList.add("active");
    renderAllWordsTable();
  }
}

function renderAllWordsTable() {
  const items = getCurrentItems();
  const tbody = $("allWordsBody");
  if (!tbody) return;
  tbody.innerHTML = items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="tbl-hindi">${escapeHtml(item.hindi)}</td>
      <td class="tbl-telugu">${escapeHtml(item.telugu)}</td>
      <td class="tbl-translit">${escapeHtml(item.hindiTransliteration)}</td>
    </tr>
  `).join("");
}

function getCurrentItems() {
  const content = DATA.chapterContent[String(currentChapter.id)];
  if (Array.isArray(content)) return content;
  if (content?.words?.length) return content.words;
  if (content?.theory?.sentences?.length) {
    return content.theory.sentences
      .filter(s => !s.sectionLabel)
      .map(s => ({
        id: s.id,
        hindi: s.hindi,
        telugu: s.telugu,
        hindiTransliteration: s.transliteration
      }));
  }
  return [];
}

function getTheoryContent() {
  const content = DATA.chapterContent[String(currentChapter.id)];
  return Array.isArray(content) ? null : (content?.theory || null);
}

function switchSectionTab(tab) {
  if (tab === "words") {
    $("lesson").style.display = "block";
    $("theory").style.display = "none";
    $("tabSectionWords").classList.add("active");
    $("tabSectionTheory").classList.remove("active");
  } else {
    $("lesson").style.display = "none";
    $("theory").style.display = "block";
    $("tabSectionWords").classList.remove("active");
    $("tabSectionTheory").classList.add("active");
    renderTheory();
  }
}

function renderTheory() {
  const theory = getTheoryContent();
  if (!theory) return;
  const view = $("theory");

  if (theory.type === 'sentences') {
    const sentHtml = theory.sentences.map(s => {
      if (s.sectionLabel) {
        return `
          <div class="sent-section">
            <div class="sent-section-title">${escapeHtml(s.sectionLabel)}</div>
            ${s.sectionSub ? `<div class="sent-section-sub">${escapeHtml(s.sectionSub)}</div>` : ""}
          </div>`;
      }
      const bd = (arr) => (arr || []).map(w =>
        `<span class="sent-chip"><span class="sent-chip-hi">${escapeHtml(w.hindi)}</span><span class="sent-chip-sep">→</span><span class="sent-chip-te">${escapeHtml(w.telugu)}</span></span>`
      ).join("");

      const altHtml = s.alt ? `
        <div class="sent-alt">
          <span class="sent-alt-label">या</span>
          ${s.alt.hindi ? `<div class="sent-alt-hindi">${escapeHtml(s.alt.hindi)}</div>` : ""}
          <div class="sent-translit">${escapeHtml(s.alt.transliteration)}</div>
          <div class="sent-telugu">${escapeHtml(s.alt.telugu)}</div>
          ${s.alt.roman ? `<div class="sent-roman">${escapeHtml(s.alt.roman)}</div>` : ""}
          ${s.alt.wordBreakdown ? `<div class="sent-breakdown">${bd(s.alt.wordBreakdown)}</div>` : ""}
        </div>` : "";

      return `
        <div class="sent-card">
          <div class="sent-num">${s.id}</div>
          <div class="sent-body">
            <div class="sent-hindi">${escapeHtml(s.hindi)}</div>
            <div class="sent-translit">${escapeHtml(s.transliteration)}</div>
            <div class="sent-telugu">${escapeHtml(s.telugu)}</div>
            ${s.roman ? `<div class="sent-roman">${escapeHtml(s.roman)}</div>` : ""}
            ${s.wordBreakdown ? `<div class="sent-breakdown">${bd(s.wordBreakdown)}</div>` : ""}
            ${altHtml}
            ${s.note ? `<div class="sent-note">💡 ${escapeHtml(s.note)}</div>` : ""}
          </div>
        </div>`;
    }).join("");

    view.innerHTML = `
      <div class="theory-inner">
        <div class="theory-intro">${escapeHtml(theory.intro)}</div>
        ${theory.teluguTitle ? `<div class="theory-telugu-title">${escapeHtml(theory.teluguTitle)}</div>` : ""}
        ${sentHtml}
        <button class="primary" onclick="startQuiz()">Recall Quiz लें →</button>
      </div>`;
    return;
  }
}

function toggleTheme() {
  const isDark = document.body.dataset.theme === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.body.dataset.theme = next;
  const btn = $('themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', next);
}

(function applyTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.dataset.theme = 'dark';
})();

function renderWord() {
  const items = getCurrentItems();
  if (!items.length) return;

  const current = items[currentWord];

  $("wordCounter").textContent =
    `WORD ${currentWord + 1} OF ${items.length}`;

  $("word").textContent = current.telugu;
  $("translit").textContent = current.hindiTransliteration;
  $("meaning").textContent = current.hindi;

  // Notes shown as info banner before examples
  if (current.notes) {
    $("notes").style.display = "flex";
    $("wordNotes").textContent = current.notes;
  } else {
    $("notes").style.display = "none";
    $("wordNotes").textContent = "";
  }

  // Render all examples — label appears once, all examples stacked below
  const examplesContainer = $("examplesContainer");
  const examples = current.examples || [];
  if (examples.length) {
    const exRows = examples.map(ex => `
      <div class="example-row">
        <div class="example-hindi">${escapeHtml(ex.hindi || "")}</div>
        <div class="example-telugu">${escapeHtml(ex.telugu || "")}</div>
        <div class="example-translit">${escapeHtml(ex.hindiTransliteration || "")}</div>
      </div>
    `).join("");
    examplesContainer.innerHTML = `
      <div class="example">
        <div class="example-label">IN A SENTENCE</div>
        ${exRows}
      </div>
    `;
  } else {
    examplesContainer.innerHTML = "";
  }

  $("lessonProgress").style.width =
    `${((currentWord + 1) / items.length) * 100}%`;
}

function nextWord() {
  const items = getCurrentItems();

  if (currentWord < items.length - 1) {
    currentWord++;
    renderWord();
  } else {
    startQuiz();
  }
}

function playAudio(event) {
  event.stopPropagation();
  const items = getCurrentItems();
  if (!items.length || !("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(items[currentWord].telugu);
  utterance.lang = "te-IN";
  utterance.rate = 0.75;

  speechSynthesis.speak(utterance);
}

function startQuiz() {
  const items = getCurrentItems();
  if (!items.length) return;

  quizItems = [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, items.length));

  quizIndex = 0;
  score = 0;

  $("lesson").style.display = "none";
  $("theory").style.display = "none";
  $("quiz").style.display = "block";
  $("finish").style.display = "none";
  $("sectionTabs").style.display = "none";

  renderQuiz();
}

function renderQuiz() {
  const current = quizItems[quizIndex];
  if (!current) return;

  const correct = current.hindi;

  $("quizCounter").textContent =
    `RECALL ${quizIndex + 1} OF ${quizItems.length}`;

  $("quizWord").textContent = current.telugu;
  $("quizTranslit").textContent = current.hindiTransliteration;

  $("result").textContent = "";
  $("nextQuiz").style.display = "none";
  $("options").innerHTML = "";

  const distractors = getCurrentItems()
    .filter(x => x.id !== current.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(x => ({
      hindi: x.hindi,
      telugu: x.telugu,
      transliteration: x.hindiTransliteration
    }));

  const options = [
    {
      hindi: correct,
      telugu: current.telugu,
      transliteration: current.hindiTransliteration
    },
    ...distractors
  ];

  const unique = [];
  const seen = new Set();

  options.sort(() => Math.random() - 0.5).forEach(option => {
    if (!seen.has(option.hindi)) {
      seen.add(option.hindi);
      unique.push(option);
    }
  });

  unique.forEach(option => {
    const button = document.createElement("button");
    button.className = "option";
    button.type = "button";

    button.innerHTML = `<span>${escapeHtml(option.hindi)}</span>`;

    button.addEventListener("click", () => {
      document.querySelectorAll(".option").forEach(x => x.disabled = true);

      if (option.hindi === correct) {
        button.classList.add("correct");
        $("result").textContent = "✓ सही!";
        score++;
      } else {
        button.classList.add("wrong");
        $("result").textContent =
          `सही उत्तर: ${correct} — ${current.telugu} (${current.hindiTransliteration})`;

        const correctButton =
          [...document.querySelectorAll(".option")]
            .find(x => x.querySelector("span")?.textContent === correct);

        if (correctButton) correctButton.classList.add("correct");
      }

      $("nextQuiz").style.display = "block";
    });

    $("options").appendChild(button);
  });
}

function nextQuizQuestion() {
  quizIndex++;

  if (quizIndex < quizItems.length) {
    renderQuiz();
    return;
  }

  $("quiz").style.display = "none";
  $("finish").style.display = "block";

  $("finishText").textContent =
    `आपने ${quizItems.length} में से ${score} सही किए।`;
}

function returnToDashboard() {
  $("dashboard").style.display = "block";
  $("lesson").style.display = "none";
  $("quiz").style.display = "none";
  $("finish").style.display = "none";
  $("theory").style.display = "none";
  $("sectionTabs").style.display = "none";
  renderDashboard();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("startLesson").addEventListener("click", () => {
  openChapter(DATA.app.currentChapter);
});

// Word-card navigation is swipe-only.
// Swipe LEFT  -> next word
// Swipe RIGHT -> previous word
// A small vertical movement is ignored so normal scrolling still works.
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let isSwiping = false;

function animateCard(direction) {
  const card = $("wordCard");
  card.classList.remove("swipe-next", "swipe-prev");
  // Force reflow so the animation can be replayed.
  void card.offsetWidth;
  card.classList.add(direction === "next" ? "swipe-next" : "swipe-prev");
}

function previousWord() {
  if (currentWord > 0) {
    currentWord--;
    animateCard("prev");
    renderWord();
  }
}

function handleSwipeEnd(endX, endY) {
  const dx = endX - touchStartX;
  const dy = endY - touchStartY;
  const elapsed = Math.max(1, Date.now() - touchStartTime);
  const velocity = Math.abs(dx) / elapsed;

  // Require a clear horizontal gesture.
  if (Math.abs(dx) < 55) return;
  if (Math.abs(dx) < Math.abs(dy) * 1.25) return;
  if (Math.abs(dx) < 55 && velocity < 0.25) return;

  isSwiping = true;

  if (dx < 0) {
    animateCard("next");
    nextWord();
  } else {
    previousWord();
  }

  setTimeout(() => {
    isSwiping = false;
  }, 120);
}

$("wordCard").addEventListener("touchstart", (event) => {
  if (!event.touches.length) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  touchStartTime = Date.now();
  isSwiping = false;
}, { passive: true });

$("wordCard").addEventListener("touchend", (event) => {
  if (!event.changedTouches.length) return;
  const touch = event.changedTouches[0];
  handleSwipeEnd(touch.clientX, touch.clientY);
}, { passive: true });

// Pointer support also makes the interaction work with a mouse/trackpad.
let pointerStartX = 0;
let pointerStartY = 0;

$("wordCard").addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  }
});

$("wordCard").addEventListener("pointerup", (event) => {
  if (event.pointerType !== "mouse") return;

  const dx = event.clientX - pointerStartX;
  const dy = event.clientY - pointerStartY;

  if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
    if (dx < 0) {
      animateCard("next");
      nextWord();
    } else {
      previousWord();
    }
  }
});

// Desktop keyboard accessibility.
document.addEventListener("keydown", (event) => {
  const lessonVisible = $("lesson").style.display !== "none";
  if (!lessonVisible || $("quiz").style.display !== "none") return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    animateCard("next");
    nextWord();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    previousWord();
  }
});

$("audioBtn").addEventListener("click", playAudio);
$("backBtn").addEventListener("click", returnToDashboard);

$("backFromQuiz").addEventListener("click", () => {
  $("quiz").style.display = "none";
  $("lesson").style.display = "block";
  if (getTheoryContent()) $("sectionTabs").style.display = "flex";
});

$("nextQuiz").addEventListener("click", nextQuizQuestion);

$("restart").addEventListener("click", () => {
  $("finish").style.display = "none";
  $("lesson").style.display = "block";
  if (getTheoryContent()) $("sectionTabs").style.display = "flex";
  currentWord = 0;
  renderWord();
});

document.addEventListener("DOMContentLoaded", initApp);
