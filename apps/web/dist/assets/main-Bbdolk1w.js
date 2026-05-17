(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=s(a);fetch(a.href,i)}})();let ee="",N=null,L={};function $e(e,t){N=t,L=e,window.addEventListener("hashchange",W),W()}function M(e){e!==ee&&(window.location.hash=e)}function W(){const e=window.location.hash.slice(1)||"home",[t,...s]=e.split("/"),n={};s.length>0&&(n.id=s.join("/")),ee=e,N&&N(t,n);let a;L[t]?a=L[t]:L["chapter/:id"]&&t==="chapter"&&(a=L["chapter/:id"]),a?a(n):(console.warn(`Route not found: ${e}`),M("home"))}const te="nypd_theme";function Ee(){const e=localStorage.getItem(te),t=window.matchMedia("(prefers-color-scheme: dark)").matches;(e==="dark"||!e&&t)&&document.documentElement.classList.add("dark");const s=document.getElementById("theme-toggle");s&&s.addEventListener("click",xe)}function xe(){const e=document.documentElement.classList.toggle("dark");localStorage.setItem(te,e?"dark":"light")}const se="nypd_font_scale",ne=.8,ae=1.4,G=.1;function Ie(){const e=localStorage.getItem(se);let t=e?parseFloat(e):1;t=Math.max(ne,Math.min(ae,t)),ie(t);const s=document.getElementById("font-decrease"),n=document.getElementById("font-increase");s&&s.addEventListener("click",()=>Y(-G)),n&&n.addEventListener("click",()=>Y(G))}function ie(e){document.documentElement.style.setProperty("--font-scale",e.toString()),localStorage.setItem(se,e.toString())}function Y(e){const t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale"))||1,s=Math.max(ne,Math.min(ae,t+e));ie(s)}const re="nypd_progress";function T(){const e=localStorage.getItem(re);if(e)try{return JSON.parse(e)}catch{}return{chapters:[],streak:0,totalStudyTimeSeconds:0}}function ce(e){localStorage.setItem(re,JSON.stringify(e))}function oe(e){const t=T();if(!(!t||!Array.isArray(t.chapters)))return t.chapters.find(s=>s.chapterId===e)}function le(e){const t=T();if(!t||!Array.isArray(t.chapters))return;let s=t.chapters.find(n=>n.chapterId===e);s?(s.status="completed",s.completedAt=new Date().toISOString()):(s={chapterId:e,status:"completed",questionsAnswered:0,timeSpentSeconds:0,completedAt:new Date().toISOString()},t.chapters.push(s)),ce(t)}function Se(e,t,s){const n=T();if(!n||!Array.isArray(n.chapters))return;let a=n.chapters.find(r=>r.chapterId===e);const i=Math.round(t/100*s);a?(a.quizScore=t,a.status=t>=80?"completed":"review",a.quizHistory=a.quizHistory||[],a.quizHistory.push({correctAnswers:i,totalQuestions:s,timestamp:new Date().toISOString()})):(a={chapterId:e,status:t>=80?"completed":"review",quizScore:t,quizHistory:[{correctAnswers:i,totalQuestions:s,timestamp:new Date().toISOString()}],questionsAnswered:0,timeSpentSeconds:0},n.chapters.push(a)),ce(n)}function ke(){const e=T();return(e==null?void 0:e.streak)||0}function qe(){const e=T();return(e==null?void 0:e.totalStudyTimeSeconds)||0}function Ae(){const e=T();return!e||!Array.isArray(e.chapters)?0:e.chapters.filter(t=>t.status==="completed").length}const de="nypd_flashcards",Te={1:0,2:1440*60*1e3,3:4320*60*1e3,4:10080*60*1e3,5:720*60*60*1e3};function ue(){const e=localStorage.getItem(de);if(e)try{return JSON.parse(e)}catch{}return{cards:{}}}function Ce(e){localStorage.setItem(de,JSON.stringify(e))}function Le(e){return ue().cards[e]||{stage:1,correctCount:0,totalAttempts:0}}function K(e,t){const s=ue(),n=s.cards[e]||{stage:1,correctCount:0,totalAttempts:0},a=Math.max(1,Math.min(5,t)),i=Te[a];s.cards[e]={stage:a,nextReview:i>0?Date.now()+i:void 0,lastReview:Date.now(),correctCount:n.correctCount+(a>n.stage?1:0),totalAttempts:n.totalAttempts+1},Ce(s)}function Me(e){if(!e||e.length===0){console.error("initSidebar: No chapters provided");return}ze(e),Be(),He()}function ze(e){const t=document.getElementById("nav-chapters");if(!t)return;const s=`
    <div class="nav-section-title">Chapters</div>
    ${e.map(n=>{var o;const a=oe(n.id),i=(a==null?void 0:a.status)==="completed",r=((o=n.questions)==null?void 0:o.length)||0;return`
        <div class="nav-item" data-chapter="${n.id}">
          <span class="ch-check ${i?"done":""}">${i?"✓":"○"}</span>
          <span class="nav-num">${n.sectionNum}</span>
          <span class="nav-title">${n.title}</span>
          <span class="q-badge">${r}q</span>
        </div>
      `}).join("")}
  `;t.innerHTML=s,t.querySelectorAll(".nav-item").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-chapter");a&&(M(`chapter/${a}`),le(a),he(a))})})}function Be(){const e=document.getElementById("nav-tools");if(!e)return;const t=[{id:"home",label:"Home",icon:"🏠"},{id:"cheatsheet",label:"Cheat Sheet",icon:"📋"},{id:"sergeant",label:"Sergeant Focus",icon:"👮"},{id:"flashcards",label:"Flashcards",icon:"🃏"},{id:"quiz",label:"Quick Quiz",icon:"⚡"},{id:"exam",label:"Practice Exam",icon:"📝"},{id:"weak",label:"Weak Areas",icon:"📊"}];e.innerHTML=`
    <div class="nav-section-title">Tools</div>
    ${t.map(s=>`
      <div class="nav-item" data-tool="${s.id}">
        <span class="nav-num">${s.icon}</span>
        <span class="nav-title">${s.label}</span>
      </div>
    `).join("")}
  `,e.querySelectorAll(".nav-item").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-tool");n&&(M(n),he(n))})})}function he(e){document.querySelectorAll(".nav-item").forEach(t=>{const s=t.getAttribute("data-chapter"),n=t.getAttribute("data-tool");s===e||n===e?t.classList.add("active"):t.classList.remove("active")})}function He(){const e=document.getElementById("menu-toggle"),t=document.getElementById("sidebar");e&&t&&(e.addEventListener("click",()=>{t.classList.toggle("open")}),document.addEventListener("click",s=>{if(window.innerWidth<=768){const n=t.contains(s.target),a=e.contains(s.target);!n&&!a&&t.classList.remove("open")}}))}function Re(){const e=document.getElementById("breadcrumbs");e&&e.addEventListener("click",t=>{const s=t.target;if(s.tagName==="SPAN"){const n=s.getAttribute("data-route");n&&M(n)}})}function q(e){const t=document.getElementById("breadcrumbs");t&&(t.innerHTML=e.map((s,n)=>s.route?`<span data-route="${s.route}">${s.label}</span>`:`<span>${s.label}</span>`).join(" / "))}function Ne(){q([{label:"Home"}]);const e=document.getElementById("content");if(!e)return;const t=ke(),s=qe(),n=Ae(),a=28,i=Math.floor(s/3600),r=Math.floor(s%3600/60);e.innerHTML=`
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">🔥 ${t}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">📚 ${n}/${a}</div>
        <div class="stat-label">Chapters Done</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">⏱️ ${i}h ${r}m</div>
        <div class="stat-label">Study Time</div>
      </div>
    </div>

    <div class="card search-quick-card" style="cursor: pointer;" data-navigate="search">
      <div class="card-header">🔍 Search</div>
      <div class="card-body">Find chapters, key terms, and questions</div>
      <div class="search-shortcut-hint">Press Ctrl+K</div>
    </div>

    <h2>Quick Actions</h2>
    <div class="card" style="cursor: pointer;" data-navigate="quiz">
      <div class="card-header">⚡ Quick Quiz</div>
      <div class="card-body">10 random questions for fast practice</div>
    </div>

    <div class="card" style="cursor: pointer;" data-navigate="exam">
      <div class="card-header">📝 Practice Exam</div>
      <div class="card-body">Full 140-question timed exam</div>
    </div>

    <div class="card" style="cursor: pointer;" data-navigate="weak">
      <div class="card-header">📊 Weak Areas</div>
      <div class="card-body">Review chapters where you scored lowest</div>
    </div>

    <h2>Recent Activity</h2>
    <p style="opacity: 0.6; font-style: italic;">Start studying to see your activity here.</p>
  `,e.querySelectorAll(".card[data-navigate]").forEach(o=>{o.addEventListener("click",()=>{const m=o.getAttribute("data-navigate");m&&(window.location.hash=m)})})}function F(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,a=[],i=!1,r=[],o=!1,m=1;function p(){if(a.length>0){const y=a.some(d=>d.includes("|---")),h=d=>d.includes("|---"),g=a.filter(d=>!h(d));if(g.length>0){let d='<table class="cheatsheet-table">';if(y&&g.length>1){const v=g[0].split("|").filter(b=>b.trim()).map(b=>`<th>${$(b.trim())}</th>`).join("");d+=`<thead><tr>${v}</tr></thead><tbody>`;for(let b=1;b<g.length;b++){const E=g[b].split("|").filter(I=>I.trim()).map(I=>`<td>${$(I.trim())}</td>`).join("");d+=`<tr>${E}</tr>`}d+="</tbody></table>"}else{for(const v of g){const b=v.split("|").filter(E=>E.trim()).map(E=>`<td>${$(E.trim())}</td>`).join("");d+=`<tr>${b}</tr>`}d+="</table>"}s.push(d)}}a=[],n=!1}function u(){r.length>0&&(o?s.push(`<ol class="cheatsheet-list" start="${m}">${r.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${r.join("")}</ul>`)),r=[],i=!1,o=!1,m=1}for(const y of t){const h=y.trim();if(h===""){p(),u();continue}if(h.startsWith("|")&&h.endsWith("|")){n||(u(),n=!0),a.push(h);continue}if(h.startsWith("- ")||h.startsWith("* ")){p(),(!i||o)&&(u(),i=!0,o=!1),r.push(`<li class="cheatsheet-list-item">${$(h.slice(2))}</li>`);continue}const g=h.match(/^(\d+)\.\s+(.+)$/);if(g){p(),(!i||!o)&&(u(),i=!0,o=!0,m=parseInt(g[1],10)),r.push(`<li class="cheatsheet-list-item">${$(g[2])}</li>`);continue}if(h.startsWith(">")){p(),u();const x=h.slice(1).trim();if(x.includes("**Exam Alert")){const S=x.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${$(S)}</p></div>`)}else if(x.includes("**Memory Aid")){const S=x.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${$(S)}</p></div>`)}else if(x.includes("**Prior Test")){const S=x.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${$(S)}</p></div>`)}else if(x.includes("**PG Conflict")){const S=x.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${$(S)}</p></div>`)}else if(x.includes("**See Also")){const S=x.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${$(S)}</p></div>`)}else if(x.includes("**Sergeant Focus")){const S=x.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${$(S)}</p></div>`)}else if(x.includes("**NOTE:**")){const S=x.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${$(S)}</p></div>`)}else if(x.startsWith("**Memory Aid")){const S=x.replace(/\*\*[^*]+\*\*/g,we=>`<strong>${we.replace(/\*\*/g,"")}</strong>`);s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${$(S)}</p></div>`)}else s.push(`<blockquote class="cheatsheet-blockquote">${$(x)}</blockquote>`);continue}if(h==="---"||h==="***"||h==="___"){p(),u();continue}const d=h.match(/^# (.+)$/),v=h.match(/^## (.+)$/),b=h.match(/^### (.+)$/),E=h.match(/^#### (.+)$/),I=h.match(/^##### (.+)$/),_=h.match(/^###### (.+)$/);if(d){p(),u(),s.push(`<h1 class="cheatsheet-h1">${$(d[1])}</h1>`);continue}if(v){p(),u(),s.push(`<h2 class="cheatsheet-h2">${$(v[1])}</h2>`);continue}if(b){p(),u(),s.push(`<h3 class="cheatsheet-h3">${$(b[1])}</h3>`);continue}if(E){p(),u(),s.push(`<h4 class="cheatsheet-h4">${$(E[1])}</h4>`);continue}if(I||_){p(),u(),s.push(`<p class="cheatsheet-paragraph"><strong>${$(I?I[1]:_[1])}</strong></p>`);continue}p(),u(),s.push(`<p class="cheatsheet-paragraph">${$(h)}</p>`)}return p(),u(),s.join("")}function $(e){if(!e)return"";let t=e;return t=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}let C="study";function pe(e){const t=e==null?void 0:e.id;if(!t||!w.data){window.location.hash="home";return}const s=w.data.chapters.find(i=>i.id===t);if(!s){window.location.hash="home";return}q([{label:"Home",route:"home"},{label:`${s.sectionNum} — ${s.title}`}]);const n=document.getElementById("content");if(!n)return;n.innerHTML=`
    <h1>${s.sectionNum} — ${s.title}</h1>

    <div class="tab-bar">
      <div class="tab ${C==="study"?"active":""}" data-tab="study">Study</div>
      <div class="tab ${C==="quiz"?"active":""}" data-tab="quiz">Quiz</div>
      <div class="tab ${C==="terms"?"active":""}" data-tab="terms">Key Terms</div>
    </div>

    <div id="chapter-body" style="margin-top: 1.5rem;"></div>
  `,n.querySelectorAll(".tab").forEach(i=>{i.addEventListener("click",()=>{C=i.getAttribute("data-tab")||"study",pe(e)})});const a=document.getElementById("chapter-body");if(a)switch(C){case"study":Fe(s,a);break;case"quiz":De(s,a);break;case"terms":Pe(s,a);break}}function Fe(e,t){t.innerHTML=F(e.readme);const s=e.sections.map(n=>F(n.content)).join('<hr style="margin: 2rem 0; border: none; border-top: var(--rule);">');t.innerHTML+=s}function De(e,t){if(!e.questions||e.questions.length===0){t.innerHTML="<p>No practice questions available for this chapter.</p>";return}t.innerHTML=`
    <h2>Chapter Quiz</h2>
    <p style="opacity: 0.6; margin-bottom: 1rem;">${e.questions.length} questions</p>
    <div id="quiz-container"></div>
  `;const s=document.getElementById("quiz-container");s&&(s.innerHTML="<p>Quiz functionality coming soon...</p>")}function Pe(e,t){t.innerHTML=`
    <h2>Key Terms</h2>
    ${F(e.keyTerms||"_No key terms for this chapter._")}
  `}let f=null;function me(){q([{label:"Home",route:"home"},{label:"Quick Quiz"}]);const e=document.getElementById("content");!e||!w.data||(f={questions:Qe(10),currentIndex:0,answers:[],selectedAnswer:null,showResults:!1,score:0},e.innerHTML=`
    <div class="quiz-container">
      <div class="quiz-header">
        <h1>Quick Quiz</h1>
        <p class="quiz-subtitle">10 random questions for fast practice</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: 10%"></div>
        </div>
        <span class="quiz-progress-text">Question 1 of 10</span>
      </div>

      <div id="quiz-body"></div>
    </div>
  `,Q())}function Qe(e){if(!w.data)return[];const t=[];return w.data.chapters.forEach(n=>{var a;(a=n.questions)==null||a.forEach(i=>{t.push({...i,chapterId:n.id})})}),t.sort(()=>Math.random()-.5).slice(0,e)}function Q(){const e=document.getElementById("quiz-body");if(!e||!f)return;const t=f.questions[f.currentIndex],s=(f.currentIndex+1)/f.questions.length*100,n=document.querySelector(".quiz-progress-fill"),a=document.querySelector(".quiz-progress-text");n&&(n.style.width=`${s}%`),a&&(a.textContent=`Question ${f.currentIndex+1} of ${f.questions.length}`),e.innerHTML=`
    <div class="quiz-question-card">
      <div class="question-number">Question ${f.currentIndex+1}</div>
      <p class="question-text">${t.text}</p>

      <div class="quiz-options">
        ${t.options.map((r,o)=>`
          <button
            class="quiz-option ${f.selectedAnswer===o?"selected":""}"
            data-index="${o}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65+o)}</span>
            <span class="quiz-option-text">${r}</span>
          </button>
        `).join("")}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${f.selectedAnswer===null?"disabled":""}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `,e.querySelectorAll(".quiz-option").forEach(r=>{r.addEventListener("click",()=>{const o=parseInt(r.getAttribute("data-index")||"0");f.selectedAnswer=o,Q()})});const i=document.getElementById("submit-answer");i==null||i.addEventListener("click",je)}function je(){if(!f||f.selectedAnswer===null)return;const e=f.questions[f.currentIndex],t=e.answer?e.answer.charCodeAt(0)-65:-1,s=f.selectedAnswer===t;f.answers.push(f.selectedAnswer),s&&f.score++,s&&e.chapterId&&le(e.chapterId),f.currentIndex++,f.selectedAnswer=null,f.currentIndex>=f.questions.length?Oe():Q()}function Oe(){var a,i;const e=document.getElementById("quiz-body");if(!e||!f)return;const t=Math.round(f.score/f.questions.length*100),s=t>=70;e.innerHTML=`
    <div class="quiz-results-card">
      <div class="results-header ${s?"passed":"failed"}">
        <div class="results-icon">${s?"✓":"!"}</div>
        <h2>${s?"Great Job!":"Keep Studying"}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${f.score}/${f.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${t}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${f.questions.map((r,o)=>{const m=f.answers[o],p=r.answer?r.answer.charCodeAt(0)-65:-1,u=m===p;return`
            <div class="review-item ${u?"correct":"incorrect"}">
              <div class="review-indicator">${u?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${r.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${m!==null?r.options[m]:"No answer"}</strong>
                  ${u?"":`<br>Correct answer: <strong>${r.options[p]}</strong>`}
                </p>
              </div>
            </div>
          `}).join("")}
      </div>

      <div class="quiz-actions">
        <button class="quiz-btn quiz-btn-primary" id="retry-quiz">
          Retry Quiz
        </button>
        <button class="quiz-btn" id="back-home">
          Back to Home
        </button>
      </div>
    </div>
  `,new Set(f.questions.filter(r=>r.chapterId).map(r=>r.chapterId)).forEach(r=>{Se(r,t,f.questions.length)}),(a=document.getElementById("retry-quiz"))==null||a.addEventListener("click",()=>{me()}),(i=document.getElementById("back-home"))==null||i.addEventListener("click",()=>{window.location.hash="home"})}let l=null,H=null;const _e=10800*1e3;function fe(){q([{label:"Home",route:"home"},{label:"Practice Exam"}]);const e=document.getElementById("content");!e||!w.data||(l={questions:We(),answers:[],currentIndex:0,startTime:null,endTime:null,showResults:!1,flagged:[]},e.innerHTML=`
    <div class="exam-container">
      <div class="exam-header">
        <h1>Practice Exam</h1>
        <div class="exam-timer" id="exam-timer">
          <span class="timer-label">Time Remaining:</span>
          <span class="timer-value" id="timer-display">3:00:00</span>
        </div>
      </div>

      <div class="exam-info">
        <span class="exam-question-count">Question <span id="current-q-num">1</span> of ${l.questions.length}</span>
        <span class="exam-answered">Answered: <span id="answered-count">0</span></span>
        <span class="exam-flagged">Flagged: <span id="flagged-count">0</span></span>
      </div>

      <div id="exam-body"></div>

      <div class="exam-navigation">
        <button class="exam-btn" id="prev-question" disabled>← Previous</button>
        <button class="exam-btn exam-btn-flag" id="flag-question">⚑ Flag</button>
        <button class="exam-btn exam-btn-primary" id="next-question">Next →</button>
      </div>

      <div class="exam-question-palette">
        <h3>Question Map</h3>
        <div class="palette-grid" id="question-palette"></div>
      </div>

      <div class="exam-actions">
        <button class="exam-btn exam-btn-submit" id="submit-exam">Submit Exam</button>
      </div>
    </div>
  `,Ge(),z(),j(),Ye())}function We(){var t;if(!w.data)return[];const e=[];return w.data.chapters.forEach(s=>{var n;(n=s.questions)==null||n.forEach(a=>{e.push({...a,chapterId:s.id})})}),(t=w.data.examQuestions)==null||t.forEach(s=>{e.push({...s,number:e.length+1})}),e.sort(()=>Math.random()-.5)}function Ge(){const e=document.getElementById("prev-question"),t=document.getElementById("next-question"),s=document.getElementById("flag-question"),n=document.getElementById("submit-exam");e==null||e.addEventListener("click",()=>B(-1)),t==null||t.addEventListener("click",()=>B(1)),s==null||s.addEventListener("click",()=>{if(!l)return;const a=l.currentIndex,i=l.flagged.indexOf(a);i===-1?l.flagged.push(a):l.flagged.splice(i,1),z(),j(),ye()}),n==null||n.addEventListener("click",Je),document.addEventListener("keydown",a=>{a.target instanceof HTMLInputElement||a.target instanceof HTMLTextAreaElement||(a.key==="ArrowLeft"?B(-1):a.key==="ArrowRight"?B(1):a.key==="f"?s==null||s.click():a.key>="1"&&a.key<="4"&&ge(parseInt(a.key)-1))})}function Ye(){l&&(l.startTime=Date.now(),H=window.setInterval(()=>{if(!l||!l.startTime)return;const e=Date.now()-l.startTime,t=_e-e;if(t<=0){ve(),Ve();return}Ke(t)},1e3))}function ve(){H!==null&&(clearInterval(H),H=null)}function Ke(e){const t=document.getElementById("timer-display");if(!t)return;const s=Math.floor(e/1e3),n=Math.floor(s/3600),a=Math.floor(s%3600/60),i=s%60;t.textContent=`${n}:${a.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`,e<300*1e3?t.style.color="var(--error)":e<900*1e3&&(t.style.color="var(--warning)")}function z(){const e=document.getElementById("exam-body");if(!e||!l)return;const t=l.questions[l.currentIndex],s=l.answers[l.currentIndex]??null,n=l.flagged.includes(l.currentIndex);e.innerHTML=`
    <div class="exam-question-card">
      <div class="question-header">
        <span class="question-number">Question ${l.currentIndex+1}</span>
        ${n?'<span class="flag-badge">⚑ Flagged</span>':""}
      </div>
      <p class="question-text">${t.text}</p>

      <div class="exam-options">
        ${t.options.map((a,i)=>`
          <button
            class="exam-option ${s===i?"selected":""}"
            data-index="${i}"
          >
            <span class="option-letter">${String.fromCharCode(65+i)}</span>
            <span class="option-text">${a}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `,e.querySelectorAll(".exam-option").forEach(a=>{a.addEventListener("click",()=>{const i=parseInt(a.getAttribute("data-index")||"0");ge(i)})}),Ue(),ye()}function ge(e){l&&(l.answers[l.currentIndex]=e,z(),j())}function B(e){if(!l)return;const t=l.currentIndex+e;t>=0&&t<l.questions.length&&(l.currentIndex=t,z())}function Ue(){if(!l)return;const e=document.getElementById("prev-question"),t=document.getElementById("next-question");if(e&&(e.disabled=l.currentIndex===0),t){const s=l.currentIndex===l.questions.length-1;t.textContent=s?"Finish →":"Next →"}}function ye(){if(!l)return;const e=document.getElementById("current-q-num"),t=document.getElementById("answered-count"),s=document.getElementById("flagged-count");e&&(e.textContent=(l.currentIndex+1).toString()),t&&(t.textContent=l.answers.filter(n=>n!=null).length.toString()),s&&(s.textContent=l.flagged.length.toString())}function j(){const e=document.getElementById("question-palette");!e||!l||(e.innerHTML=l.questions.map((t,s)=>{const n=l.answers[s]!==null&&l.answers[s]!==void 0,a=l.flagged.includes(s),i=s===l.currentIndex;let r="palette-item";return i&&(r+=" current"),n&&(r+=" answered"),a&&(r+=" flagged"),`<button class="${r}" data-index="${s}">${s+1}</button>`}).join(""),e.querySelectorAll(".palette-item").forEach(t=>{t.addEventListener("click",()=>{const s=parseInt(t.getAttribute("data-index")||"0");l&&(l.currentIndex=s,z())})}))}function Je(){if(!l)return;const e=l.answers.filter(n=>n!=null).length,t=l.questions.length,s=t-e;if(s>0){if(!confirm(`You have ${s} unanswered question(s).

Score: ${e}/${t} (${Math.round(e/t*100)}%)

Are you sure you want to submit?`))return}else if(!confirm(`Submit exam with all ${t} questions answered?`))return;be()}function Ve(){alert("Time is up! Submitting your exam..."),be()}function be(){if(!l)return;ve(),l.endTime=Date.now(),l.showResults=!0;let e=0;const t=[];l.questions.forEach((s,n)=>{const a=l.answers[n]??null,i=s.answer?s.answer.charCodeAt(0)-65:-1,r=a===i;r&&e++,t.push({question:s,userAnswer:a,correct:r})}),Xe(e,t)}function Xe(e,t){var m,p;const s=document.getElementById("exam-body");if(!s||!l)return;const n=Math.round(e/l.questions.length*100),a=n>=70,i=l.endTime&&l.startTime?Math.floor((l.endTime-l.startTime)/1e3):0,r=Math.floor(i/3600),o=Math.floor(i%3600/60);s.innerHTML=`
    <div class="exam-results-card">
      <div class="results-header ${a?"passed":"failed"}">
        <div class="results-icon">${a?"✓":"!"}</div>
        <h2>${a?"Congratulations!":"Keep Studying"}</h2>
        <p class="results-subtitle">${a?"You passed the practice exam":"You need 70% to pass"}</p>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${e}/${l.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${n}%</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${r}h ${o}m</div>
          <div class="stat-label">Time Taken</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${t.map((u,y)=>{const h=u.userAnswer!==null?u.question.options[u.userAnswer]:"No answer",g=u.question.answer?u.question.answer.charCodeAt(0)-65:-1,d=u.question.options[g];return`
            <div class="review-item ${u.correct?"correct":"incorrect"}">
              <div class="review-indicator">${u.correct?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${y+1}. ${u.question.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${h}</strong>
                  ${u.correct?"":`<br>Correct answer: <strong>${d}</strong>`}
                </p>
              </div>
            </div>
          `}).join("")}
      </div>

      <div class="exam-actions">
        <button class="exam-btn exam-btn-primary" id="retry-exam">
          Retry Exam
        </button>
        <button class="exam-btn" id="back-home-exam">
          Back to Home
        </button>
      </div>
    </div>
  `,(m=document.getElementById("retry-exam"))==null||m.addEventListener("click",()=>{fe()}),(p=document.getElementById("back-home-exam"))==null||p.addEventListener("click",()=>{window.location.hash="home"})}let c=null;function O(){q([{label:"Home",route:"home"},{label:"Flashcards"}]);const e=document.getElementById("content");if(!e||!w.data)return;const t=[];if(w.data.chapters.forEach(u=>{u.keyTerms&&Ze(u.keyTerms).forEach((h,g)=>{const d=`${u.id}-${g}`,v=Le(d);t.push({id:d,term:h.name,definition:h.definition,chapterId:u.id,chapterTitle:u.title,stage:v.stage,nextReview:v.nextReview})})}),t.length===0){e.innerHTML=`
      <div class="empty-state">
        <h1>No Flashcards Available</h1>
        <p>Flashcards will be generated from key terms in your chapters.</p>
      </div>
    `;return}const s=Date.now(),a=((u="all")=>t.map((y,h)=>({card:y,idx:h})).filter(({card:y})=>u==="pg"&&!y.chapterId.startsWith("2")||u==="ag"&&!y.chapterId.startsWith("3")?!1:!y.nextReview||y.nextReview<=s).map(({idx:y})=>y))("all"),i=a.length>0?a:t.map((u,y)=>y),r=t.filter(u=>u.chapterId.startsWith("2")).length,o=t.filter(u=>u.chapterId.startsWith("3")).length;c={cards:t,sessionCards:i,currentIndex:0,flipped:!1,known:[],learning:[],sessionStart:i.length,sessionCorrect:0,filter:"all"};const m=t.length,p=i.length;e.innerHTML=`
    <div class="flashcards-container">
      <div class="flashcards-header">
        <h1>Flashcards</h1>
        <p class="flashcards-subtitle">Leitner spaced repetition system</p>
      </div>

      <div class="flashcards-filter">
        <button class="fc-filter-btn ${c.filter==="all"?"active":""}" data-filter="all">
          All (${m})
        </button>
        <button class="fc-filter-btn ${c.filter==="pg"?"active":""}" data-filter="pg">
          P.G. Procedures (${r})
        </button>
        <button class="fc-filter-btn ${c.filter==="ag"?"active":""}" data-filter="ag">
          A.G. Procedures (${o})
        </button>
      </div>

      <div class="flashcards-stats">
        <div class="fc-stat">
          <div class="fc-stat-value">${m}</div>
          <div class="fc-stat-label">Total Cards</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="due-count">${p}</div>
          <div class="fc-stat-label">Due Now</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="mastered-count">0</div>
          <div class="fc-stat-label">Mastered (Stage 5)</div>
        </div>
      </div>

      <div class="flashcards-session" ${p===0?'style="opacity:0.5"':""}>
        <p class="session-info">
          ${p>0?`📚 ${p} cards due for review`:"✓ All cards reviewed! Showing full deck."}
        </p>
      </div>

      <div class="flashcard-wrapper">
        <div class="flashcard" id="flashcard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-chapter" id="card-chapter"></div>
              <div class="flashcard-term" id="card-term"></div>
              <div class="flashcard-stage" id="card-stage"></div>
              <div class="flashcard-hint">Tap or press Space to flip</div>
            </div>
            <div class="flashcard-back">
              <div class="flashcard-label">Definition</div>
              <div class="flashcard-definition" id="card-definition"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flashcard-controls">
        <button class="fc-btn" id="prev-card">← Previous</button>
        <button class="fc-btn fc-btn-primary" id="flip-card">Flip</button>
        <button class="fc-btn" id="next-card">Next →</button>
      </div>

      <div class="flashcard-actions">
        <button class="fc-btn fc-btn-outline" id="know-btn" title="Move to next stage">
          ✓ Know It
        </button>
        <button class="fc-btn fc-btn-outline" id="learning-btn" title="Reset to stage 1">
          ⏳ Learning
        </button>
      </div>

      <div class="flashcard-progress">
        <span id="card-counter">1 / ${i.length}</span>
        <span id="session-progress">Session: 0 correct</span>
      </div>
    </div>
  `,et(),tt(),A()}function Ze(e){const t=[],s=e.split(`
`);for(const n of s){const a=n.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/);a&&t.push({name:a[1].trim(),definition:a[2].trim()})}return t}function et(){const e=document.getElementById("flashcard"),t=document.getElementById("flip-card"),s=document.getElementById("prev-card"),n=document.getElementById("next-card"),a=document.getElementById("know-btn"),i=document.getElementById("learning-btn");e==null||e.addEventListener("click",()=>{c.flipped=!c.flipped,R()}),t==null||t.addEventListener("click",()=>{c.flipped=!c.flipped,R()}),s==null||s.addEventListener("click",()=>{c&&c.currentIndex>0&&(c.currentIndex--,c.flipped=!1,A())}),n==null||n.addEventListener("click",()=>{c&&c.currentIndex<c.sessionCards.length-1&&(c.currentIndex++,c.flipped=!1,A())}),a==null||a.addEventListener("click",()=>{if(!c)return;const r=c.sessionCards[c.currentIndex],o=c.cards[r],m=Math.min(o.stage+1,5);K(o.id,m),c.sessionCorrect++,c.known.push(c.currentIndex),D(),U()}),i==null||i.addEventListener("click",()=>{if(!c)return;const r=c.sessionCards[c.currentIndex],o=c.cards[r];K(o.id,1),c.learning.push(c.currentIndex),D(),U()}),document.addEventListener("keydown",r=>{if(!(r.target instanceof HTMLInputElement))switch(r.key){case" ":case"Enter":r.preventDefault(),c.flipped=!c.flipped,R();break;case"ArrowLeft":c&&c.currentIndex>0&&(c.currentIndex--,c.flipped=!1,A());break;case"ArrowRight":c&&c.currentIndex<c.sessionCards.length-1&&(c.currentIndex++,c.flipped=!1,A());break;case"k":a==null||a.click();break;case"l":i==null||i.click();break}})}function tt(){document.querySelectorAll(".fc-filter-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-filter");if(!c||!t)return;c.filter=t,document.querySelectorAll(".fc-filter-btn").forEach(a=>a.classList.remove("active")),e.classList.add("active");const s=Date.now(),n=c.cards.map((a,i)=>({card:a,idx:i})).filter(({card:a})=>t==="pg"&&!a.chapterId.startsWith("2")||t==="ag"&&!a.chapterId.startsWith("3")?!1:!a.nextReview||a.nextReview<=s).map(({idx:a})=>a);c.sessionCards=n.length>0?n:c.cards.map((a,i)=>i).filter(a=>{const i=c.cards[a];return!(t==="pg"&&!i.chapterId.startsWith("2")||t==="ag"&&!i.chapterId.startsWith("3"))}),c.currentIndex=0,c.flipped=!1,O()})})}function A(){if(!c)return;const e=c.sessionCards[c.currentIndex],t=c.cards[e],s=document.getElementById("card-chapter"),n=document.getElementById("card-term"),a=document.getElementById("card-definition"),i=document.getElementById("card-stage"),r=document.getElementById("card-counter"),o=document.getElementById("session-progress");s&&(s.textContent=t.chapterTitle),n&&(n.textContent=t.term),a&&(a.textContent=t.definition),i&&(i.textContent=`Stage ${t.stage}/5`),r&&(r.textContent=`${c.currentIndex+1} / ${c.sessionCards.length}`),o&&(o.textContent=`Session: ${c.sessionCorrect} correct`),R(),D()}function R(){const e=document.getElementById("flashcard");!e||!c||(c.flipped?e.classList.add("flipped"):e.classList.remove("flipped"))}function D(){if(!c)return;const e=document.getElementById("mastered-count"),t=document.getElementById("due-count"),s=c.cards.filter(i=>i.stage>=5).length,n=Date.now(),a=c.cards.filter(i=>!i.nextReview||i.nextReview<=n).length;e&&(e.textContent=s.toString()),t&&(t.textContent=a.toString())}function U(){c&&(c.currentIndex<c.sessionCards.length-1?(c.currentIndex++,c.flipped=!1,A()):st())}function st(){var i,r;const e=document.getElementById("content");if(!e||!c)return;const t=c.sessionCards.length,s=c.sessionCorrect,n=t>0?Math.round(s/t*100):0;e.innerHTML=`
    <div class="flashcards-summary">
      <h1>Session Complete!</h1>
      <p class="summary-subtitle">Great practice session</p>

      <div class="summary-stats">
        <div class="summary-stat">
          <div class="summary-value">${s}/${t}</div>
          <div class="summary-label">Cards Reviewed</div>
        </div>
        <div class="summary-stat">
          <div class="summary-value">${n}%</div>
          <div class="summary-label">Accuracy</div>
        </div>
        <div class="summary-stat">
          <div class="summary-value" id="summary-mastered">0</div>
          <div class="summary-label">Total Mastered</div>
        </div>
      </div>

      <div class="summary-actions">
        <button class="fc-btn fc-btn-primary" id="restart-cards">
          Study Again
        </button>
        <button class="fc-btn" id="back-home-fc">
          Back to Home
        </button>
      </div>
    </div>
  `;const a=document.getElementById("summary-mastered");a&&(a.textContent=c.cards.filter(o=>o.stage>=5).length.toString()),(i=document.getElementById("restart-cards"))==null||i.addEventListener("click",O),(r=document.getElementById("back-home-fc"))==null||r.addEventListener("click",()=>{window.location.hash="home"})}function nt(){var n;q([{label:"Home",route:"home"},{label:"Cheat Sheet"}]);const e=document.getElementById("content");if(!e)return;const t=((n=w.data)==null?void 0:n.cheatSheet)||"",s=at(t);e.innerHTML=`
    <div class="cheatsheet-container">
      <div class="cheatsheet-header">
        <h1>Quick Reference Cheat Sheet</h1>
        <p class="cheatsheet-subtitle">Essential tables, timeframes, and memory aids for the Sergeant Exam</p>
      </div>

      <nav class="cheatsheet-nav">
        <details class="cheatsheet-toc">
          <summary>📑 Jump to Section</summary>
          <div class="cheatsheet-toc-list">
            ${s.map((a,i)=>`
              <a href="#section-${i}" class="cheatsheet-toc-link">${a.title}</a>
            `).join("")}
          </div>
        </details>
      </nav>

      <div class="cheatsheet-content">
        ${s.map((a,i)=>it(a,i)).join("")}
      </div>
    </div>
  `,document.querySelectorAll(".cheatsheet-toc-link").forEach(a=>{a.addEventListener("click",i=>{var m;i.preventDefault();const r=(m=a.getAttribute("href"))==null?void 0:m.slice(1),o=document.getElementById(r||"");o==null||o.scrollIntoView({behavior:"smooth",block:"start"})})})}function at(e){const t=[],s=e.split(`
`);let n=null;for(const a of s){const i=a.match(/^## (.+)$/);i?(n&&t.push(n),n={title:i[1],content:""}):n&&(n.content+=a+`
`)}return n&&t.push(n),t}function it(e,t){const s=rt(e.content);return`
    <section id="section-${t}" class="cheatsheet-section">
      <h2 class="cheatsheet-section-title">
        <span class="cheatsheet-section-number">${String(t+1).padStart(2,"0")}</span>
        ${e.title}
      </h2>
      <div class="cheatsheet-section-content">
        ${s}
      </div>
    </section>
  `}function rt(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,a=[],i=!1,r=[],o=!1,m=1;function p(){if(a.length>0){const y=a.some(d=>d.includes("|---")),h=d=>d.includes("|---"),g=a.filter(d=>!h(d));if(g.length>0){let d='<table class="cheatsheet-table">';if(y&&g.length>1){const v=g[0].split("|").filter(b=>b.trim()).map(b=>`<th>${k(b.trim())}</th>`).join("");d+=`<thead><tr>${v}</tr></thead><tbody>`;for(let b=1;b<g.length;b++){const E=g[b].split("|").filter(I=>I.trim()).map(I=>`<td>${k(I.trim())}</td>`).join("");d+=`<tr>${E}</tr>`}d+="</tbody></table>"}else{for(const v of g){const b=v.split("|").filter(E=>E.trim()).map(E=>`<td>${k(E.trim())}</td>`).join("");d+=`<tr>${b}</tr>`}d+="</table>"}s.push(d)}}a=[],n=!1}function u(){r.length>0&&(o?s.push(`<ol class="cheatsheet-list" start="${m}">${r.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${r.join("")}</ul>`)),r=[],i=!1,o=!1,m=1}for(const y of t){const h=y.trim();if(h===""){p(),u();continue}if(h.startsWith("|")&&h.endsWith("|")){n||(u(),n=!0),a.push(h);continue}if(h.startsWith("- ")||h.startsWith("* ")){p(),(!i||o)&&(u(),i=!0,o=!1),r.push(`<li class="cheatsheet-list-item">${k(h.slice(2))}</li>`);continue}const g=h.match(/^(\d+)\.\s+(.+)$/);if(g){p(),(!i||!o)&&(u(),i=!0,o=!0,m=parseInt(g[1],10)),r.push(`<li class="cheatsheet-list-item">${k(g[2])}</li>`);continue}if(h.startsWith(">")){p(),u();const d=h.slice(1).trim();if(d.includes("**Exam Alert")){const v=d.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${k(v)}</p></div>`)}else if(d.includes("**Memory Aid")){const v=d.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${k(v)}</p></div>`)}else if(d.includes("**Prior Test")){const v=d.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${k(v)}</p></div>`)}else if(d.includes("**PG Conflict")){const v=d.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${k(v)}</p></div>`)}else if(d.includes("**See Also")){const v=d.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${k(v)}</p></div>`)}else if(d.includes("**Sergeant Focus")){const v=d.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${k(v)}</p></div>`)}else if(d.includes("**NOTE:**")){const v=d.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${k(v)}</p></div>`)}else d.startsWith("**Memory Aid")?s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${k(d)}</p></div>`):s.push(`<blockquote class="cheatsheet-blockquote">${k(d)}</blockquote>`);continue}if(h==="---"||h==="***"||h==="___"){p(),u();continue}p(),u(),s.push(`<p class="cheatsheet-paragraph">${k(h)}</p>`)}return p(),u(),s.join("")}function k(e){if(!e)return"";let t=e;return t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}function ct(){q([{label:"Home",route:"home"},{label:"Sergeant Focus"}]);const e=document.getElementById("content");if(!e||!w.data)return;const t=w.data.chapters.filter(a=>a.sergeantFocus&&a.sergeantFocus.length>0);e.innerHTML=`
    <div class="sergeant-focus-container">
      <div class="sergeant-focus-header">
        <h1>Sergeant Focus</h1>
        <p class="sergeant-focus-subtitle">Supervisor-specific responsibilities and key considerations across all chapters</p>
      </div>

      <div class="sergeant-focus-stats">
        <div class="stat-card">
          <div class="stat-value">${t.length}</div>
          <div class="stat-label">Chapters</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${t.reduce((a,i)=>a+i.sergeantFocus.length,0)}</div>
          <div class="stat-label">Callouts</div>
        </div>
      </div>

      <div class="sergeant-focus-controls">
        <button class="expand-collapse-btn" id="expand-all">Expand All</button>
        <button class="expand-collapse-btn" id="collapse-all">Collapse All</button>
      </div>

      <div class="sergeant-focus-content">
        ${t.map((a,i)=>lt(a,i)).join("")}
      </div>
    </div>
  `;const s=document.getElementById("expand-all"),n=document.getElementById("collapse-all");s==null||s.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!0})}),n==null||n.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!1})})}function ot(e,t){const s=e.match(/section-(\d{3})-(?:0?(\d+)|([a-z0-9-]+))\.md/);if(!s)return{displayName:`P.G. ${t}`,sourceType:"PG"};const n=s[1],a=s[2]||s[3],i=n.startsWith("2")?"PG":"AG";return{displayName:`${i==="PG"?"P.G.":"A.G."} ${n}-${a}`,sourceType:i}}function lt(e,t){return`
    <section class="sergeant-focus-chapter">
      <details class="sergeant-focus-details" ${t<3?"open":""}>
        <summary class="sergeant-focus-summary">
          <span class="chapter-num">${e.sectionNum}</span>
          <span class="chapter-title">${e.title}</span>
          <span class="callout-count">${e.sergeantFocus.length} callout${e.sergeantFocus.length!==1?"s":""}</span>
          <span class="expand-icon">+</span>
        </summary>
        <div class="sergeant-focus-callouts">
          ${e.sergeantFocus.map(n=>{const a=ot(n.filename,e.sectionNum);return`
              <div class="callout callout-sergeant">
                <div class="sergeant-focus-header-row">
                  <div class="callout-title">Sergeant Focus</div>
                  <span class="source-badge source-${a.sourceType.toLowerCase()}">${a.displayName}</span>
                </div>
                <p>${n.text}</p>
              </div>
            `}).join("")}
        </div>
      </details>
    </section>
  `}function dt(){q([{label:"Home",route:"home"},{label:"Weak Areas"}]);const e=document.getElementById("content");if(!e||!w.data)return;const s=ut().sort((n,a)=>n.percentage-a.percentage);e.innerHTML=`
    <div class="weak-areas-container">
      <div class="weak-areas-header">
        <h1>Weak Areas</h1>
        <p class="weak-areas-subtitle">Focus on chapters where you need more practice</p>
      </div>

      ${s.length===0?`
        <div class="empty-state">
          <h2>No Quiz Data Yet</h2>
          <p>Take some quizzes to see your weak areas highlighted here.</p>
          <button class="fc-btn fc-btn-primary" onclick="window.location.hash='quiz'">
            Take a Quiz
          </button>
        </div>
      `:`
        <div class="weak-areas-stats">
          <div class="wa-stat">
            <div class="wa-stat-value">${s.filter(n=>n.percentage>=70).length}</div>
            <div class="wa-stat-label">Mastered (≥70%)</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-value">${s.filter(n=>n.percentage<70&&n.percentage>=50).length}</div>
            <div class="wa-stat-label">Needs Review</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-value">${s.filter(n=>n.percentage<50).length}</div>
            <div class="wa-stat-label">Critical (<50%)</div>
          </div>
        </div>

        <div class="weak-areas-list">
          ${s.map(n=>`
            <div class="wa-chapter-card ${n.percentage<50?"critical":n.percentage<70?"warning":"good"}">
              <div class="wa-chapter-header">
                <div class="wa-chapter-info">
                  <span class="wa-chapter-num">${n.sectionNum}</span>
                  <span class="wa-chapter-title">${n.chapterTitle}</span>
                </div>
                <div class="wa-chapter-score">
                  <span class="wa-score-value">${n.percentage}%</span>
                  <span class="wa-score-label">${ht(n.percentage)}</span>
                </div>
              </div>
              <div class="wa-progress-bar">
                <div class="wa-progress-fill" style="width: ${n.percentage}%"></div>
              </div>
              <div class="wa-chapter-stats">
                <span class="wa-stat-item">${n.correctAnswers}/${n.totalQuestions} correct</span>
                <span class="wa-stat-item">${n.quizAttempts} quiz${n.quizAttempts!==1?"zes":"z"} taken</span>
              </div>
              <div class="wa-chapter-actions">
                <button class="wa-btn" data-chapter="${n.chapterId}">
                  Study Chapter
                </button>
                <button class="wa-btn wa-btn-outline" data-chapter-quiz="${n.chapterId}">
                  Practice Quiz
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `,e.querySelectorAll("[data-chapter]").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-chapter");window.location.hash=`chapter/${a}`})}),e.querySelectorAll("[data-chapter-quiz]").forEach(n=>{n.addEventListener("click",()=>{window.location.hash="quiz"})})}function ut(){if(!w.data)return[];const e=[];return w.data.chapters.forEach(t=>{var m;const s=oe(t.id),n=(s==null?void 0:s.quizHistory)||[];let a=0,i=0,r=n.length;r>0?n.forEach(p=>{a+=p.correctAnswers,i+=p.totalQuestions}):(i=((m=t.questions)==null?void 0:m.length)||0,a=0,r=0);const o=i>0?Math.round(a/i*100):0;e.push({chapterId:t.id,chapterTitle:t.title,sectionNum:t.sectionNum,correctAnswers:a,totalQuestions:i,percentage:o,quizAttempts:r})}),e.filter(t=>t.quizAttempts>0||t.totalQuestions>0)}function ht(e){return e>=90?"Excellent":e>=80?"Good":e>=70?"Passing":e>=50?"Review":"Critical"}function pt(){q([{label:"Home",route:"home"},{label:"Search"}]);const e=document.getElementById("content");!e||!w.data||(e.innerHTML=`
    <div class="search-container">
      <div class="search-header">
        <h1>Search</h1>
        <p class="search-subtitle">Search across all chapters, sections, and key terms</p>
      </div>

      <div class="search-box-wrapper">
        <div class="search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.5 14.5L19 19M17 8.5C17 12.6421 13.6421 16 9.5 16C5.35786 16 2 12.6421 2 8.5C2 4.35786 5.35786 1 9.5 1C13.6421 1 17 4.35786 17 8.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            id="search-input"
            placeholder="Search chapters, key terms, questions..."
            autocomplete="off"
          />
          <kbd>Esc</kbd>
        </div>
      </div>

      <div class="search-stats" id="search-stats" style="display: none;">
        <span id="results-count">0 results</span>
      </div>

      <div id="search-results" class="search-results"></div>
    </div>
  `,mt())}function mt(){const e=document.getElementById("search-input");e&&(e.addEventListener("input",t=>{const s=t.target.value.trim();if(s.length<2){V();return}ft(s)}),document.addEventListener("keydown",t=>{if(t.key==="Escape"){const s=document.getElementById("search-input");s&&(s.value="",V(),s.blur())}}))}function ft(e){if(!w.data)return;const t=[],s=e.toLowerCase();w.data.chapters.forEach(n=>{var a,i;n.title.toLowerCase().includes(s)&&t.push({type:"chapter",title:n.title,chapterId:n.id,chapterTitle:n.title,matchCount:1}),(a=n.sections)==null||a.forEach(r=>{if(r.content.toLowerCase().includes(s)){const o=vt(r.content,s);t.push({type:"section",title:`${n.title} - ${r.filename}`,chapterId:n.id,chapterTitle:n.title,snippet:o,matchCount:gt(r.content,s)})}}),n.keyTerms&&yt(n.keyTerms).forEach(o=>{(o.name.toLowerCase().includes(s)||o.definition.toLowerCase().includes(s))&&t.push({type:"keyterm",title:o.name,chapterId:n.id,chapterTitle:n.title,snippet:o.definition,matchCount:1})}),(i=n.questions)==null||i.forEach(r=>{r.text.toLowerCase().includes(s)&&t.push({type:"question",title:`Question ${r.number}`,chapterId:n.id,chapterTitle:n.title,snippet:r.text,matchCount:1})})}),t.sort((n,a)=>a.matchCount-n.matchCount),bt(t.slice(0,50))}function vt(e,t,s=150){const a=e.toLowerCase().indexOf(t);if(a===-1)return e.slice(0,s)+"...";const i=Math.max(0,a-50),r=Math.min(e.length,a+s),o=i>0?"...":"",m=r<e.length?"...":"";return o+e.slice(i,r).trim()+m}function gt(e,t){const s=new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),n=e.match(s);return n?n.length:0}function yt(e){const t=[],s=e.split(`
`);for(const n of s){const a=n.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/);a&&t.push({name:a[1].trim(),definition:a[2].trim()})}return t}function bt(e){const t=document.getElementById("search-results"),s=document.getElementById("search-stats"),n=document.getElementById("results-count");if(!(!t||!s||!n)){if(s.style.display="block",n.textContent=`${e.length} result${e.length!==1?"s":""}`,e.length===0){t.innerHTML=`
      <div class="empty-state">
        <h2>No Results Found</h2>
        <p>Try different keywords or check your spelling.</p>
      </div>
    `;return}t.innerHTML=e.map(a=>`
    <div class="search-result-item ${a.type}" data-chapter="${a.chapterId}">
      <div class="result-header">
        <span class="result-type-badge">${a.type}</span>
        <span class="result-chapter">${a.chapterTitle}</span>
      </div>
      <h3 class="result-title">${J(a.title)}</h3>
      ${a.snippet?`<p class="result-snippet">${J(wt(a.snippet))}</p>`:""}
    </div>
  `).join(""),t.querySelectorAll(".search-result-item").forEach(a=>{a.addEventListener("click",()=>{const i=a.getAttribute("data-chapter");window.location.hash=`chapter/${i}`})})}}function J(e){const t=document.getElementById("search-input");if(!t||!t.value)return e;const s=t.value.trim(),n=new RegExp(`(${$t(s)})`,"gi");return e.replace(n,"<mark>$1</mark>")}function wt(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function $t(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function V(){const e=document.getElementById("search-results"),t=document.getElementById("search-stats");e&&(e.innerHTML=""),t&&(t.style.display="none")}async function Et(e={}){var i;const{maxRetries:t=3,retryDelayMs:s=1e3,onProgress:n}=e;if(n==null||n("Loading study data..."),typeof window.STUDY_DATA<"u"&&((i=window.STUDY_DATA)!=null&&i.chapters))return n==null||n("Data loaded successfully"),window.STUDY_DATA;let a=null;for(let r=1;r<=t;r++)try{n==null||n(`Loading data (attempt ${r}/${t})...`);const o=await fetch("./data.js",{cache:"force-cache"});if(!o.ok)throw new Error(`HTTP ${o.status}: ${o.statusText}`);const m=await o.text(),p="window.STUDY_DATA = ",u=m.indexOf(p);if(u===-1)throw new Error("Invalid data.js format: missing window.STUDY_DATA");let y=m.substring(u+p.length).trim(),h=0,g=!1,d=!1,v=-1;for(let E=0;E<y.length;E++){const I=y[E];if(d){d=!1;continue}if(I==="\\"){d=!0;continue}if(I==='"'&&!d){g=!g;continue}if(!g&&(I==="{"&&h++,I==="}"&&(h--,h===0))){v=E+1;break}}if(v===-1)throw new Error("Invalid data.js format: malformed JSON");y=y.substring(0,v);const b=JSON.parse(y);return window.STUDY_DATA=b,n==null||n("Data loaded successfully"),b}catch(o){a=o,console.warn(`Data load attempt ${r} failed:`,o),r<t&&await xt(s)}throw new Error(`Failed to load study data after ${t} attempts: ${a==null?void 0:a.message}`)}function xt(e){return new Promise(t=>setTimeout(t,e))}const X={network:{title:"Failed to Load Study Data",suggestion:"Check your internet connection and try again."},parse:{title:"Invalid Data Format",suggestion:"The study data file appears to be corrupted."},storage:{title:"Storage Error",suggestion:"Unable to access local storage. Clear browser data and try again."},unknown:{title:"Unexpected Error",suggestion:"Something went wrong. Try refreshing the page."}};function It(e,t){const s=X[e.type]||X.unknown;return`
    <div class="error-recovery-container">
      <div class="error-card">
        <div class="error-icon">⚠️</div>

        <h1 class="error-title">${s.title}</h1>

        <p class="error-message">${s.suggestion}</p>

        ${e.details?`<pre class="error-details">${Z(e.details)}</pre>`:""}

        <div class="error-actions">
          <button class="error-btn error-btn-primary" id="error-retry">
            ↻ Try Again
          </button>
          <button class="error-btn" id="error-clear-cache">
            🗑 Clear Cache & Reload
          </button>
          <button class="error-btn" id="error-home">
            🏠 Home
          </button>
        </div>

        <details class="error-tech-details">
          <summary>Technical Details</summary>
          <div class="tech-details-content">
            <p><strong>Error Type:</strong> ${e.type}</p>
            <p><strong>Message:</strong> ${Z(e.message)}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
          </div>
        </details>
      </div>
    </div>
  `}function Z(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function St(e){const t=document.getElementById("error-retry"),s=document.getElementById("error-clear-cache"),n=document.getElementById("error-home");t==null||t.addEventListener("click",()=>{e()}),s==null||s.addEventListener("click",()=>{localStorage.clear(),sessionStorage.clear(),"caches"in window&&caches.keys().then(a=>{a.forEach(i=>caches.delete(i))}),window.location.reload()}),n==null||n.addEventListener("click",()=>{window.location.hash="home",e()})}function kt(){if(!navigator.onLine){const e=document.createElement("div");e.className="offline-indicator",e.innerHTML="⚠️ You are offline. Some features may be unavailable.";const t=document.getElementById("topbar");t&&t.appendChild(e)}}function qt(){window.addEventListener("online",()=>{const e=document.querySelector(".offline-indicator");e&&e.remove()}),window.addEventListener("offline",()=>{kt()})}const At={home:Ne,"chapter/:id":pe,quiz:me,exam:fe,flashcards:O,cheatsheet:nt,sergeant:ct,weak:dt,search:pt},w={currentRoute:"home",currentChapter:null,data:null};async function P(){const e=document.getElementById("content");e&&(e.innerHTML=`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text" id="loading-status">Loading study data...</p>
      </div>
    `);try{w.data=await Et({maxRetries:3,retryDelayMs:1e3,onProgress:s=>{const n=document.getElementById("loading-status");n&&(n.textContent=s)}}),Ee(),Ie(),Me(w.data.chapters),Re(),qt(),$e(At,(s,n)=>{w.currentRoute=s,w.currentChapter=(n==null?void 0:n.id)||null}),Lt();const t=window.location.hash.slice(1)||"home";M(t)}catch(t){const n=Tt(t);Ct(n)}}function Tt(e){const t=e.message.toLowerCase();return t.includes("fetch")||t.includes("network")||t.includes("http")?{type:"network",message:e.message}:t.includes("parse")||t.includes("json")||t.includes("invalid")?{type:"parse",message:e.message}:t.includes("storage")||t.includes("quota")?{type:"storage",message:e.message}:{type:"unknown",message:e.message}}function Ct(e){const t=document.getElementById("content");t&&(t.innerHTML=It(e),St(()=>P()))}function Lt(){document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault(),window.location.hash="search";return}if(e.target.tagName!=="INPUT"&&/^[1-4]$/.test(e.key)){const t=new CustomEvent("quiz-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}if(e.target.tagName!=="INPUT"&&(e.key==="n"||e.key==="p")){const t=new CustomEvent("nav-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}if(e.target.tagName!=="INPUT"&&window.location.hash==="#flashcards"){if(e.key==="ArrowLeft"){const t=document.getElementById("prev-card");t==null||t.click()}else if(e.key==="ArrowRight"){const t=document.getElementById("next-card");t==null||t.click()}}if(e.key==="Escape"){const t=document.getElementById("sidebar");t!=null&&t.classList.contains("open")&&t.classList.remove("open")}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P):P();
