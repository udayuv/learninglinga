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
  renderDashboard();
}

function renderDashboard() {
  const chapter = DATA.chapters.find(c => c.id === DATA.app.currentChapter) || DATA.chapters[0];
  currentChapter = chapter;

  $("courseTitle").textContent = `Telugu / Day ${chapter.id}`;
  $("streak").textContent = `🔥 ${DATA.app.streakDays} day`;

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

  // Progress is based on the selected day only in this version.
  $("progressBar").style.width = "12%";
}

function openChapter(id) {
  currentChapter = DATA.chapters.find(c => c.id === id);
  if (!currentChapter) return;

  DATA.app.currentChapter = id;
  currentWord = 0;

  $("dashboard").style.display = "none";
  $("lesson").style.display = "block";
  $("quiz").style.display = "none";
  $("finish").style.display = "none";

  $("courseTitle").textContent = `Telugu / Day ${id}`;
  $("lessonChapter").textContent = `DAY ${id} · ${currentChapter.title.toUpperCase()}`;
  $("lessonTitle").textContent = currentChapter.displayTitle;
  $("lessonInstruction").textContent =
    `आज ${currentChapter.lessonCount} शब्द/रूप सीखें और फिर recall quiz दें।`;

  renderWord();
}

function getCurrentItems() {
  return DATA.chapterContent[String(currentChapter.id)] || [];
}

function renderWord() {
  const items = getCurrentItems();
  if (!items.length) return;

  const current = items[currentWord];
  const example = current.examples?.[0] || null;

  $("wordCounter").textContent =
    `WORD ${currentWord + 1} OF ${items.length}`;

  $("word").textContent = current.telugu;
  $("translit").textContent = current.hindiTransliteration;

  $("meaning").textContent = current.hindi;

  if (example) {
    $("exampleHindi").textContent = example.hindi || "";
    $("exampleTelugu").textContent = example.telugu || "";
    $("exampleTranslit").textContent =
      example.hindiTransliteration || "";
  } else {
    $("exampleHindi").textContent = current.hindi;
    $("exampleTelugu").textContent = current.telugu;
    $("exampleTranslit").textContent =
      current.hindiTransliteration || "";
  }
  if(current.notes){
    $("notes").style.display = "block";
    $("wordNotes").textContent = current.notes;
  } else {
    $("notes").style.display = "none";
    $("wordNotes").textContent = "";
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
  $("quiz").style.display = "block";
  $("finish").style.display = "none";

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

    button.innerHTML = `
      <span>${escapeHtml(option.hindi)}</span>
      <span class="quiz-option-telugu">${escapeHtml(option.telugu)}</span>
      <span class="quiz-option-translit">${escapeHtml(option.transliteration)}</span>
    `;

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
});

$("nextQuiz").addEventListener("click", nextQuizQuestion);

$("restart").addEventListener("click", () => {
  $("finish").style.display = "none";
  $("lesson").style.display = "block";
  currentWord = 0;
  renderWord();
});

document.addEventListener("DOMContentLoaded", initApp);
