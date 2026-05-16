(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function s(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=s(a);fetch(a.href,i)}})();let K="",F=null,M={};function me(e,t){F=t,M=e,window.addEventListener("hashchange",_),_()}function C(e){e!==K&&(window.location.hash=e)}function _(){const e=window.location.hash.slice(1)||"home",[t,...s]=e.split("/"),n={};s.length>0&&(n.id=s.join("/")),K=e,F&&F(t,n);let a;M[t]?a=M[t]:M["chapter/:id"]&&t==="chapter"&&(a=M["chapter/:id"]),a?a(n):(console.warn(`Route not found: ${e}`),C("home"))}const U="nypd_theme";function fe(){const e=localStorage.getItem(U),t=window.matchMedia("(prefers-color-scheme: dark)").matches;(e==="dark"||!e&&t)&&document.documentElement.classList.add("dark");const s=document.getElementById("theme-toggle");s&&s.addEventListener("click",ve)}function ve(){const e=document.documentElement.classList.toggle("dark");localStorage.setItem(U,e?"dark":"light")}const J="nypd_font_scale",V=.8,X=1.4,W=.1;function ge(){const e=localStorage.getItem(J);let t=e?parseFloat(e):1;t=Math.max(V,Math.min(X,t)),Z(t);const s=document.getElementById("font-decrease"),n=document.getElementById("font-increase");s&&s.addEventListener("click",()=>G(-W)),n&&n.addEventListener("click",()=>G(W))}function Z(e){document.documentElement.style.setProperty("--font-scale",e.toString()),localStorage.setItem(J,e.toString())}function G(e){const t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale"))||1,s=Math.max(V,Math.min(X,t+e));Z(s)}const ee="nypd_progress";function T(){const e=localStorage.getItem(ee);if(e)try{return JSON.parse(e)}catch{}return{chapters:[],streak:0,totalStudyTimeSeconds:0}}function te(e){localStorage.setItem(ee,JSON.stringify(e))}function se(e){const t=T();if(!(!t||!Array.isArray(t.chapters)))return t.chapters.find(s=>s.chapterId===e)}function ne(e){const t=T();if(!t||!Array.isArray(t.chapters))return;let s=t.chapters.find(n=>n.chapterId===e);s?(s.status="completed",s.completedAt=new Date().toISOString()):(s={chapterId:e,status:"completed",questionsAnswered:0,timeSpentSeconds:0,completedAt:new Date().toISOString()},t.chapters.push(s)),te(t)}function ye(e,t,s){const n=T();if(!n||!Array.isArray(n.chapters))return;let a=n.chapters.find(c=>c.chapterId===e);const i=Math.round(t/100*s);a?(a.quizScore=t,a.status=t>=80?"completed":"review",a.quizHistory=a.quizHistory||[],a.quizHistory.push({correctAnswers:i,totalQuestions:s,timestamp:new Date().toISOString()})):(a={chapterId:e,status:t>=80?"completed":"review",quizScore:t,quizHistory:[{correctAnswers:i,totalQuestions:s,timestamp:new Date().toISOString()}],questionsAnswered:0,timeSpentSeconds:0},n.chapters.push(a)),te(n)}function be(){const e=T();return(e==null?void 0:e.streak)||0}function we(){const e=T();return(e==null?void 0:e.totalStudyTimeSeconds)||0}function $e(){const e=T();return!e||!Array.isArray(e.chapters)?0:e.chapters.filter(t=>t.status==="completed").length}function Ee(e){if(!e||e.length===0){console.error("initSidebar: No chapters provided");return}xe(e),Ie(),Se()}function xe(e){const t=document.getElementById("nav-chapters");if(!t)return;const s=`
    <div class="nav-section-title">Chapters</div>
    ${e.map(n=>{var u;const a=se(n.id),i=(a==null?void 0:a.status)==="completed",c=((u=n.questions)==null?void 0:u.length)||0;return`
        <div class="nav-item" data-chapter="${n.id}">
          <span class="ch-check ${i?"done":""}">${i?"✓":"○"}</span>
          <span class="nav-num">${n.sectionNum}</span>
          <span class="nav-title">${n.title}</span>
          <span class="q-badge">${c}q</span>
        </div>
      `}).join("")}
  `;t.innerHTML=s,t.querySelectorAll(".nav-item").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-chapter");a&&(C(`chapter/${a}`),ne(a),ae(a))})})}function Ie(){const e=document.getElementById("nav-tools");if(!e)return;const t=[{id:"home",label:"Home",icon:"🏠"},{id:"cheatsheet",label:"Cheat Sheet",icon:"📋"},{id:"sergeant",label:"Sergeant Focus",icon:"👮"},{id:"flashcards",label:"Flashcards",icon:"🃏"},{id:"quiz",label:"Quick Quiz",icon:"⚡"},{id:"exam",label:"Practice Exam",icon:"📝"},{id:"weak",label:"Weak Areas",icon:"📊"}];e.innerHTML=`
    <div class="nav-section-title">Tools</div>
    ${t.map(s=>`
      <div class="nav-item" data-tool="${s.id}">
        <span class="nav-num">${s.icon}</span>
        <span class="nav-title">${s.label}</span>
      </div>
    `).join("")}
  `,e.querySelectorAll(".nav-item").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-tool");n&&(C(n),ae(n))})})}function ae(e){document.querySelectorAll(".nav-item").forEach(t=>{const s=t.getAttribute("data-chapter"),n=t.getAttribute("data-tool");s===e||n===e?t.classList.add("active"):t.classList.remove("active")})}function Se(){const e=document.getElementById("menu-toggle"),t=document.getElementById("sidebar");e&&t&&(e.addEventListener("click",()=>{t.classList.toggle("open")}),document.addEventListener("click",s=>{if(window.innerWidth<=768){const n=t.contains(s.target),a=e.contains(s.target);!n&&!a&&t.classList.remove("open")}}))}function qe(){const e=document.getElementById("breadcrumbs");e&&e.addEventListener("click",t=>{const s=t.target;if(s.tagName==="SPAN"){const n=s.getAttribute("data-route");n&&C(n)}})}function k(e){const t=document.getElementById("breadcrumbs");t&&(t.innerHTML=e.map((s,n)=>s.route?`<span data-route="${s.route}">${s.label}</span>`:`<span>${s.label}</span>`).join(" / "))}function ke(){k([{label:"Home"}]);const e=document.getElementById("content");if(!e)return;const t=be(),s=we(),n=$e(),a=28,i=Math.floor(s/3600),c=Math.floor(s%3600/60);e.innerHTML=`
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
        <div class="stat-value">⏱️ ${i}h ${c}m</div>
        <div class="stat-label">Study Time</div>
      </div>
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
  `,e.querySelectorAll(".card[data-navigate]").forEach(u=>{u.addEventListener("click",()=>{const g=u.getAttribute("data-navigate");g&&(window.location.hash=g)})})}function D(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,a=[],i=!1,c=[],u=!1,g=1;function p(){if(a.length>0){const I=a.some(l=>l.includes("|---")),d=l=>l.includes("|---"),v=a.filter(l=>!d(l));if(v.length>0){let l='<table class="cheatsheet-table">';if(I&&v.length>1){const f=v[0].split("|").filter(y=>y.trim()).map(y=>`<th>${w(y.trim())}</th>`).join("");l+=`<thead><tr>${f}</tr></thead><tbody>`;for(let y=1;y<v.length;y++){const $=v[y].split("|").filter(x=>x.trim()).map(x=>`<td>${w(x.trim())}</td>`).join("");l+=`<tr>${$}</tr>`}l+="</tbody></table>"}else{for(const f of v){const y=f.split("|").filter($=>$.trim()).map($=>`<td>${w($.trim())}</td>`).join("");l+=`<tr>${y}</tr>`}l+="</table>"}s.push(l)}}a=[],n=!1}function h(){c.length>0&&(u?s.push(`<ol class="cheatsheet-list" start="${g}">${c.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${c.join("")}</ul>`)),c=[],i=!1,u=!1,g=1}for(const I of t){const d=I.trim();if(d===""){p(),h();continue}if(d.startsWith("|")&&d.endsWith("|")){n||(h(),n=!0),a.push(d);continue}if(d.startsWith("- ")||d.startsWith("* ")){p(),(!i||u)&&(h(),i=!0,u=!1),c.push(`<li class="cheatsheet-list-item">${w(d.slice(2))}</li>`);continue}const v=d.match(/^(\d+)\.\s+(.+)$/);if(v){p(),(!i||!u)&&(h(),i=!0,u=!0,g=parseInt(v[1],10)),c.push(`<li class="cheatsheet-list-item">${w(v[2])}</li>`);continue}if(d.startsWith(">")){p(),h();const E=d.slice(1).trim();if(E.includes("**Exam Alert")){const S=E.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${w(S)}</p></div>`)}else if(E.includes("**Memory Aid")){const S=E.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${w(S)}</p></div>`)}else if(E.includes("**Prior Test")){const S=E.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${w(S)}</p></div>`)}else if(E.includes("**PG Conflict")){const S=E.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${w(S)}</p></div>`)}else if(E.includes("**See Also")){const S=E.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${w(S)}</p></div>`)}else if(E.includes("**Sergeant Focus")){const S=E.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${w(S)}</p></div>`)}else if(E.includes("**NOTE:**")){const S=E.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${w(S)}</p></div>`)}else if(E.startsWith("**Memory Aid")){const S=E.replace(/\*\*[^*]+\*\*/g,pe=>`<strong>${pe.replace(/\*\*/g,"")}</strong>`);s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${w(S)}</p></div>`)}else s.push(`<blockquote class="cheatsheet-blockquote">${w(E)}</blockquote>`);continue}if(d==="---"||d==="***"||d==="___"){p(),h();continue}const l=d.match(/^# (.+)$/),f=d.match(/^## (.+)$/),y=d.match(/^### (.+)$/),$=d.match(/^#### (.+)$/),x=d.match(/^##### (.+)$/),O=d.match(/^###### (.+)$/);if(l){p(),h(),s.push(`<h1 class="cheatsheet-h1">${w(l[1])}</h1>`);continue}if(f){p(),h(),s.push(`<h2 class="cheatsheet-h2">${w(f[1])}</h2>`);continue}if(y){p(),h(),s.push(`<h3 class="cheatsheet-h3">${w(y[1])}</h3>`);continue}if($){p(),h(),s.push(`<h4 class="cheatsheet-h4">${w($[1])}</h4>`);continue}if(x||O){p(),h(),s.push(`<p class="cheatsheet-paragraph"><strong>${w(x?x[1]:O[1])}</strong></p>`);continue}p(),h(),s.push(`<p class="cheatsheet-paragraph">${w(d)}</p>`)}return p(),h(),s.join("")}function w(e){if(!e)return"";let t=e;return t=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}let L="study";function ie(e){const t=e==null?void 0:e.id;if(!t||!b.data){window.location.hash="home";return}const s=b.data.chapters.find(i=>i.id===t);if(!s){window.location.hash="home";return}k([{label:"Home",route:"home"},{label:`${s.sectionNum} — ${s.title}`}]);const n=document.getElementById("content");if(!n)return;n.innerHTML=`
    <h1>${s.sectionNum} — ${s.title}</h1>

    <div class="tab-bar">
      <div class="tab ${L==="study"?"active":""}" data-tab="study">Study</div>
      <div class="tab ${L==="quiz"?"active":""}" data-tab="quiz">Quiz</div>
      <div class="tab ${L==="terms"?"active":""}" data-tab="terms">Key Terms</div>
    </div>

    <div id="chapter-body" style="margin-top: 1.5rem;"></div>
  `,n.querySelectorAll(".tab").forEach(i=>{i.addEventListener("click",()=>{L=i.getAttribute("data-tab")||"study",ie(e)})});const a=document.getElementById("chapter-body");if(a)switch(L){case"study":Ae(s,a);break;case"quiz":Te(s,a);break;case"terms":Le(s,a);break}}function Ae(e,t){t.innerHTML=D(e.readme);const s=e.sections.map(n=>D(n.content)).join('<hr style="margin: 2rem 0; border: none; border-top: var(--rule);">');t.innerHTML+=s}function Te(e,t){if(!e.questions||e.questions.length===0){t.innerHTML="<p>No practice questions available for this chapter.</p>";return}t.innerHTML=`
    <h2>Chapter Quiz</h2>
    <p style="opacity: 0.6; margin-bottom: 1rem;">${e.questions.length} questions</p>
    <div id="quiz-container"></div>
  `;const s=document.getElementById("quiz-container");s&&(s.innerHTML="<p>Quiz functionality coming soon...</p>")}function Le(e,t){t.innerHTML=`
    <h2>Key Terms</h2>
    ${D(e.keyTerms||"_No key terms for this chapter._")}
  `}let m=null;function ce(){k([{label:"Home",route:"home"},{label:"Quick Quiz"}]);const e=document.getElementById("content");!e||!b.data||(m={questions:Me(10),currentIndex:0,answers:[],selectedAnswer:null,showResults:!1,score:0},e.innerHTML=`
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
  `,R())}function Me(e){if(!b.data)return[];const t=[];return b.data.chapters.forEach(n=>{var a;(a=n.questions)==null||a.forEach(i=>{t.push({...i,chapterId:n.id})})}),t.sort(()=>Math.random()-.5).slice(0,e)}function R(){const e=document.getElementById("quiz-body");if(!e||!m)return;const t=m.questions[m.currentIndex],s=(m.currentIndex+1)/m.questions.length*100,n=document.querySelector(".quiz-progress-fill"),a=document.querySelector(".quiz-progress-text");n&&(n.style.width=`${s}%`),a&&(a.textContent=`Question ${m.currentIndex+1} of ${m.questions.length}`),e.innerHTML=`
    <div class="quiz-question-card">
      <div class="question-number">Question ${m.currentIndex+1}</div>
      <p class="question-text">${t.text}</p>

      <div class="quiz-options">
        ${t.options.map((c,u)=>`
          <button
            class="quiz-option ${m.selectedAnswer===u?"selected":""}"
            data-index="${u}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65+u)}</span>
            <span class="quiz-option-text">${c}</span>
          </button>
        `).join("")}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${m.selectedAnswer===null?"disabled":""}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `,e.querySelectorAll(".quiz-option").forEach(c=>{c.addEventListener("click",()=>{const u=parseInt(c.getAttribute("data-index")||"0");m.selectedAnswer=u,R()})});const i=document.getElementById("submit-answer");i==null||i.addEventListener("click",Ce)}function Ce(){if(!m||m.selectedAnswer===null)return;const e=m.questions[m.currentIndex],t=m.selectedAnswer===e.correctAnswer;m.answers.push(m.selectedAnswer),t&&m.score++,t&&e.chapterId&&ne(e.chapterId),m.currentIndex++,m.selectedAnswer=null,m.currentIndex>=m.questions.length?ze():R()}function ze(){var a,i;const e=document.getElementById("quiz-body");if(!e||!m)return;const t=Math.round(m.score/m.questions.length*100),s=t>=70;e.innerHTML=`
    <div class="quiz-results-card">
      <div class="results-header ${s?"passed":"failed"}">
        <div class="results-icon">${s?"✓":"!"}</div>
        <h2>${s?"Great Job!":"Keep Studying"}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${m.score}/${m.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${t}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${m.questions.map((c,u)=>{const g=m.answers[u],p=g===c.correctAnswer;return`
            <div class="review-item ${p?"correct":"incorrect"}">
              <div class="review-indicator">${p?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${c.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${g!==null?c.options[g]:"No answer"}</strong>
                  ${p?"":`<br>Correct answer: <strong>${c.options[c.correctAnswer]}</strong>`}
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
  `,new Set(m.questions.filter(c=>c.chapterId).map(c=>c.chapterId)).forEach(c=>{ye(c,t,m.questions.length)}),(a=document.getElementById("retry-quiz"))==null||a.addEventListener("click",()=>{ce()}),(i=document.getElementById("back-home"))==null||i.addEventListener("click",()=>{window.location.hash="home"})}let r=null,H=null;const Be=10800*1e3;function re(){k([{label:"Home",route:"home"},{label:"Practice Exam"}]);const e=document.getElementById("content");!e||!b.data||(r={questions:He(),answers:[],currentIndex:0,startTime:null,endTime:null,showResults:!1,flagged:[]},e.innerHTML=`
    <div class="exam-container">
      <div class="exam-header">
        <h1>Practice Exam</h1>
        <div class="exam-timer" id="exam-timer">
          <span class="timer-label">Time Remaining:</span>
          <span class="timer-value" id="timer-display">3:00:00</span>
        </div>
      </div>

      <div class="exam-info">
        <span class="exam-question-count">Question <span id="current-q-num">1</span> of ${r.questions.length}</span>
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
  `,Ne(),z(),j(),Fe())}function He(){var t;if(!b.data)return[];const e=[];return b.data.chapters.forEach(s=>{var n;(n=s.questions)==null||n.forEach(a=>{e.push({...a,chapterId:s.id})})}),(t=b.data.examQuestions)==null||t.forEach(s=>{e.push({...s,number:e.length+1})}),e.sort(()=>Math.random()-.5)}function Ne(){const e=document.getElementById("prev-question"),t=document.getElementById("next-question"),s=document.getElementById("flag-question"),n=document.getElementById("submit-exam");e==null||e.addEventListener("click",()=>B(-1)),t==null||t.addEventListener("click",()=>B(1)),s==null||s.addEventListener("click",()=>{if(!r)return;const a=r.currentIndex,i=r.flagged.indexOf(a);i===-1?r.flagged.push(a):r.flagged.splice(i,1),z(),j(),de()}),n==null||n.addEventListener("click",Qe),document.addEventListener("keydown",a=>{a.target instanceof HTMLInputElement||a.target instanceof HTMLTextAreaElement||(a.key==="ArrowLeft"?B(-1):a.key==="ArrowRight"?B(1):a.key==="f"?s==null||s.click():a.key>="1"&&a.key<="4"&&le(parseInt(a.key)-1))})}function Fe(){r&&(r.startTime=Date.now(),H=window.setInterval(()=>{if(!r||!r.startTime)return;const e=Date.now()-r.startTime,t=Be-e;if(t<=0){oe(),Re();return}De(t)},1e3))}function oe(){H!==null&&(clearInterval(H),H=null)}function De(e){const t=document.getElementById("timer-display");if(!t)return;const s=Math.floor(e/1e3),n=Math.floor(s/3600),a=Math.floor(s%3600/60),i=s%60;t.textContent=`${n}:${a.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`,e<300*1e3?t.style.color="var(--error)":e<900*1e3&&(t.style.color="var(--warning)")}function z(){const e=document.getElementById("exam-body");if(!e||!r)return;const t=r.questions[r.currentIndex],s=r.answers[r.currentIndex]??null,n=r.flagged.includes(r.currentIndex);e.innerHTML=`
    <div class="exam-question-card">
      <div class="question-header">
        <span class="question-number">Question ${r.currentIndex+1}</span>
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
  `,e.querySelectorAll(".exam-option").forEach(a=>{a.addEventListener("click",()=>{const i=parseInt(a.getAttribute("data-index")||"0");le(i)})}),Pe(),de()}function le(e){r&&(r.answers[r.currentIndex]=e,z(),j())}function B(e){if(!r)return;const t=r.currentIndex+e;t>=0&&t<r.questions.length&&(r.currentIndex=t,z())}function Pe(){if(!r)return;const e=document.getElementById("prev-question"),t=document.getElementById("next-question");if(e&&(e.disabled=r.currentIndex===0),t){const s=r.currentIndex===r.questions.length-1;t.textContent=s?"Finish →":"Next →"}}function de(){if(!r)return;const e=document.getElementById("current-q-num"),t=document.getElementById("answered-count"),s=document.getElementById("flagged-count");e&&(e.textContent=(r.currentIndex+1).toString()),t&&(t.textContent=r.answers.filter(n=>n!=null).length.toString()),s&&(s.textContent=r.flagged.length.toString())}function j(){const e=document.getElementById("question-palette");!e||!r||(e.innerHTML=r.questions.map((t,s)=>{const n=r.answers[s]!==null&&r.answers[s]!==void 0,a=r.flagged.includes(s),i=s===r.currentIndex;let c="palette-item";return i&&(c+=" current"),n&&(c+=" answered"),a&&(c+=" flagged"),`<button class="${c}" data-index="${s}">${s+1}</button>`}).join(""),e.querySelectorAll(".palette-item").forEach(t=>{t.addEventListener("click",()=>{const s=parseInt(t.getAttribute("data-index")||"0");r&&(r.currentIndex=s,z())})}))}function Qe(){if(!r)return;const e=r.answers.filter(n=>n!=null).length,t=r.questions.length,s=t-e;if(s>0){if(!confirm(`You have ${s} unanswered question(s).

Score: ${e}/${t} (${Math.round(e/t*100)}%)

Are you sure you want to submit?`))return}else if(!confirm(`Submit exam with all ${t} questions answered?`))return;ue()}function Re(){alert("Time is up! Submitting your exam..."),ue()}function ue(){if(!r)return;oe(),r.endTime=Date.now(),r.showResults=!0;let e=0;const t=[];r.questions.forEach((s,n)=>{const a=r.answers[n]??null,i=a===s.correctAnswer;i&&e++,t.push({question:s,userAnswer:a,correct:i})}),je(e,t)}function je(e,t){var g,p;const s=document.getElementById("exam-body");if(!s||!r)return;const n=Math.round(e/r.questions.length*100),a=n>=70,i=r.endTime&&r.startTime?Math.floor((r.endTime-r.startTime)/1e3):0,c=Math.floor(i/3600),u=Math.floor(i%3600/60);s.innerHTML=`
    <div class="exam-results-card">
      <div class="results-header ${a?"passed":"failed"}">
        <div class="results-icon">${a?"✓":"!"}</div>
        <h2>${a?"Congratulations!":"Keep Studying"}</h2>
        <p class="results-subtitle">${a?"You passed the practice exam":"You need 70% to pass"}</p>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${e}/${r.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${n}%</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${c}h ${u}m</div>
          <div class="stat-label">Time Taken</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${t.map((h,I)=>{const d=h.userAnswer!==null?h.question.options[h.userAnswer]:"No answer",v=h.question.options[h.question.correctAnswer];return`
            <div class="review-item ${h.correct?"correct":"incorrect"}">
              <div class="review-indicator">${h.correct?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${I+1}. ${h.question.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${d}</strong>
                  ${h.correct?"":`<br>Correct answer: <strong>${v}</strong>`}
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
  `,(g=document.getElementById("retry-exam"))==null||g.addEventListener("click",()=>{re()}),(p=document.getElementById("back-home-exam"))==null||p.addEventListener("click",()=>{window.location.hash="home"})}let o=null;function he(){k([{label:"Home",route:"home"},{label:"Flashcards"}]);const e=document.getElementById("content");if(!e||!b.data)return;const t=[];if(b.data.chapters.forEach(s=>{s.keyTerms&&Oe(s.keyTerms).forEach(a=>{t.push({term:a.name,definition:a.definition,chapterId:s.id,chapterTitle:s.title})})}),t.length===0){e.innerHTML=`
      <div class="empty-state">
        <h1>No Flashcards Available</h1>
        <p>Flashcards will be generated from key terms in your chapters.</p>
      </div>
    `;return}o={cards:t,currentIndex:0,flipped:!1,known:[],learning:[]},e.innerHTML=`
    <div class="flashcards-container">
      <div class="flashcards-header">
        <h1>Flashcards</h1>
        <p class="flashcards-subtitle">Leitner-style spaced repetition learning</p>
      </div>

      <div class="flashcards-stats">
        <div class="fc-stat">
          <div class="fc-stat-value">${t.length}</div>
          <div class="fc-stat-label">Total Cards</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="known-count">0</div>
          <div class="fc-stat-label">Mastered</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="learning-count">0</div>
          <div class="fc-stat-label">Learning</div>
        </div>
      </div>

      <div class="flashcard-wrapper">
        <div class="flashcard" id="flashcard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-chapter" id="card-chapter"></div>
              <div class="flashcard-term" id="card-term"></div>
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
        <button class="fc-btn fc-btn-outline" id="know-btn">
          ✓ I Know This
        </button>
        <button class="fc-btn fc-btn-outline" id="learning-btn">
          ⏳ Still Learning
        </button>
      </div>

      <div class="flashcard-progress">
        <span id="card-counter">1 / ${t.length}</span>
      </div>
    </div>
  `,_e(),A()}function Oe(e){const t=[],s=e.split(`
`);for(const n of s){const a=n.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/);a&&t.push({name:a[1].trim(),definition:a[2].trim()})}return t}function _e(){const e=document.getElementById("flashcard"),t=document.getElementById("flip-card"),s=document.getElementById("prev-card"),n=document.getElementById("next-card"),a=document.getElementById("know-btn"),i=document.getElementById("learning-btn");e==null||e.addEventListener("click",()=>{o.flipped=!o.flipped,N()}),t==null||t.addEventListener("click",()=>{o.flipped=!o.flipped,N()}),s==null||s.addEventListener("click",()=>{o&&o.currentIndex>0&&(o.currentIndex--,o.flipped=!1,A())}),n==null||n.addEventListener("click",()=>{o&&o.currentIndex<o.cards.length-1&&(o.currentIndex++,o.flipped=!1,A())}),a==null||a.addEventListener("click",()=>{o&&!o.known.includes(o.currentIndex)&&(o.known.push(o.currentIndex),P(),Y())}),i==null||i.addEventListener("click",()=>{o&&!o.learning.includes(o.currentIndex)&&(o.learning.push(o.currentIndex),P(),Y())}),document.addEventListener("keydown",c=>{if(!(c.target instanceof HTMLInputElement))switch(c.key){case" ":case"Enter":c.preventDefault(),o.flipped=!o.flipped,N();break;case"ArrowLeft":o&&o.currentIndex>0&&(o.currentIndex--,o.flipped=!1,A());break;case"ArrowRight":o&&o.currentIndex<o.cards.length-1&&(o.currentIndex++,o.flipped=!1,A());break;case"k":a==null||a.click();break;case"l":i==null||i.click();break}})}function A(){if(!o)return;const e=o.cards[o.currentIndex],t=document.getElementById("card-chapter"),s=document.getElementById("card-term"),n=document.getElementById("card-definition"),a=document.getElementById("card-counter");t&&(t.textContent=e.chapterTitle),s&&(s.textContent=e.term),n&&(n.textContent=e.definition),a&&(a.textContent=`${o.currentIndex+1} / ${o.cards.length}`),N(),P()}function N(){const e=document.getElementById("flashcard");!e||!o||(o.flipped?e.classList.add("flipped"):e.classList.remove("flipped"))}function P(){if(!o)return;const e=document.getElementById("known-count"),t=document.getElementById("learning-count");e&&(e.textContent=o.known.length.toString()),t&&(t.textContent=o.learning.length.toString())}function Y(){o&&(o.currentIndex<o.cards.length-1?(o.currentIndex++,o.flipped=!1,A()):We())}function We(){var a,i;const e=document.getElementById("content");if(!e||!o)return;const t=o.cards.length,s=o.known.length,n=Math.round(s/t*100);e.innerHTML=`
    <div class="flashcards-summary">
      <h1>Session Complete!</h1>
      <p class="summary-subtitle">Great practice session</p>

      <div class="summary-stats">
        <div class="summary-stat">
          <div class="summary-value">${s}/${t}</div>
          <div class="summary-label">Cards Mastered</div>
        </div>
        <div class="summary-stat">
          <div class="summary-value">${n}%</div>
          <div class="summary-label">Mastery Rate</div>
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
  `,(a=document.getElementById("restart-cards"))==null||a.addEventListener("click",he),(i=document.getElementById("back-home-fc"))==null||i.addEventListener("click",()=>{window.location.hash="home"})}function Ge(){var n;k([{label:"Home",route:"home"},{label:"Cheat Sheet"}]);const e=document.getElementById("content");if(!e)return;const t=((n=b.data)==null?void 0:n.cheatSheet)||"",s=Ye(t);e.innerHTML=`
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
        ${s.map((a,i)=>Ke(a,i)).join("")}
      </div>
    </div>
  `,document.querySelectorAll(".cheatsheet-toc-link").forEach(a=>{a.addEventListener("click",i=>{var g;i.preventDefault();const c=(g=a.getAttribute("href"))==null?void 0:g.slice(1),u=document.getElementById(c||"");u==null||u.scrollIntoView({behavior:"smooth",block:"start"})})})}function Ye(e){const t=[],s=e.split(`
`);let n=null;for(const a of s){const i=a.match(/^## (.+)$/);i?(n&&t.push(n),n={title:i[1],content:""}):n&&(n.content+=a+`
`)}return n&&t.push(n),t}function Ke(e,t){const s=Ue(e.content);return`
    <section id="section-${t}" class="cheatsheet-section">
      <h2 class="cheatsheet-section-title">
        <span class="cheatsheet-section-number">${String(t+1).padStart(2,"0")}</span>
        ${e.title}
      </h2>
      <div class="cheatsheet-section-content">
        ${s}
      </div>
    </section>
  `}function Ue(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,a=[],i=!1,c=[],u=!1,g=1;function p(){if(a.length>0){const I=a.some(l=>l.includes("|---")),d=l=>l.includes("|---"),v=a.filter(l=>!d(l));if(v.length>0){let l='<table class="cheatsheet-table">';if(I&&v.length>1){const f=v[0].split("|").filter(y=>y.trim()).map(y=>`<th>${q(y.trim())}</th>`).join("");l+=`<thead><tr>${f}</tr></thead><tbody>`;for(let y=1;y<v.length;y++){const $=v[y].split("|").filter(x=>x.trim()).map(x=>`<td>${q(x.trim())}</td>`).join("");l+=`<tr>${$}</tr>`}l+="</tbody></table>"}else{for(const f of v){const y=f.split("|").filter($=>$.trim()).map($=>`<td>${q($.trim())}</td>`).join("");l+=`<tr>${y}</tr>`}l+="</table>"}s.push(l)}}a=[],n=!1}function h(){c.length>0&&(u?s.push(`<ol class="cheatsheet-list" start="${g}">${c.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${c.join("")}</ul>`)),c=[],i=!1,u=!1,g=1}for(const I of t){const d=I.trim();if(d===""){p(),h();continue}if(d.startsWith("|")&&d.endsWith("|")){n||(h(),n=!0),a.push(d);continue}if(d.startsWith("- ")||d.startsWith("* ")){p(),(!i||u)&&(h(),i=!0,u=!1),c.push(`<li class="cheatsheet-list-item">${q(d.slice(2))}</li>`);continue}const v=d.match(/^(\d+)\.\s+(.+)$/);if(v){p(),(!i||!u)&&(h(),i=!0,u=!0,g=parseInt(v[1],10)),c.push(`<li class="cheatsheet-list-item">${q(v[2])}</li>`);continue}if(d.startsWith(">")){p(),h();const l=d.slice(1).trim();if(l.includes("**Exam Alert")){const f=l.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${q(f)}</p></div>`)}else if(l.includes("**Memory Aid")){const f=l.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${q(f)}</p></div>`)}else if(l.includes("**Prior Test")){const f=l.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${q(f)}</p></div>`)}else if(l.includes("**PG Conflict")){const f=l.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${q(f)}</p></div>`)}else if(l.includes("**See Also")){const f=l.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${q(f)}</p></div>`)}else if(l.includes("**Sergeant Focus")){const f=l.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${q(f)}</p></div>`)}else if(l.includes("**NOTE:**")){const f=l.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${q(f)}</p></div>`)}else l.startsWith("**Memory Aid")?s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${q(l)}</p></div>`):s.push(`<blockquote class="cheatsheet-blockquote">${q(l)}</blockquote>`);continue}if(d==="---"||d==="***"||d==="___"){p(),h();continue}p(),h(),s.push(`<p class="cheatsheet-paragraph">${q(d)}</p>`)}return p(),h(),s.join("")}function q(e){if(!e)return"";let t=e;return t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}function Je(){k([{label:"Home",route:"home"},{label:"Sergeant Focus"}]);const e=document.getElementById("content");if(!e||!b.data)return;const t=b.data.chapters.filter(a=>a.sergeantFocus&&a.sergeantFocus.length>0);e.innerHTML=`
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
        ${t.map((a,i)=>Xe(a,i)).join("")}
      </div>
    </div>
  `;const s=document.getElementById("expand-all"),n=document.getElementById("collapse-all");s==null||s.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!0})}),n==null||n.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!1})})}function Ve(e,t){const s=e.match(/section-(\d{3})-(?:0?(\d+)|([a-z0-9-]+))\.md/);if(!s)return{displayName:`P.G. ${t}`,sourceType:"PG"};const n=s[1],a=s[2]||s[3],i=n.startsWith("2")?"PG":"AG";return{displayName:`${i==="PG"?"P.G.":"A.G."} ${n}-${a}`,sourceType:i}}function Xe(e,t){return`
    <section class="sergeant-focus-chapter">
      <details class="sergeant-focus-details" ${t<3?"open":""}>
        <summary class="sergeant-focus-summary">
          <span class="chapter-num">${e.sectionNum}</span>
          <span class="chapter-title">${e.title}</span>
          <span class="callout-count">${e.sergeantFocus.length} callout${e.sergeantFocus.length!==1?"s":""}</span>
          <span class="expand-icon">+</span>
        </summary>
        <div class="sergeant-focus-callouts">
          ${e.sergeantFocus.map(n=>{const a=Ve(n.filename,e.sectionNum);return`
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
  `}function Ze(){k([{label:"Home",route:"home"},{label:"Weak Areas"}]);const e=document.getElementById("content");if(!e||!b.data)return;const s=et().sort((n,a)=>n.percentage-a.percentage);e.innerHTML=`
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
                  <span class="wa-score-label">${tt(n.percentage)}</span>
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
  `,e.querySelectorAll("[data-chapter]").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-chapter");window.location.hash=`chapter/${a}`})}),e.querySelectorAll("[data-chapter-quiz]").forEach(n=>{n.addEventListener("click",()=>{window.location.hash="quiz"})})}function et(){if(!b.data)return[];const e=[];return b.data.chapters.forEach(t=>{var g;const s=se(t.id),n=(s==null?void 0:s.quizHistory)||[];let a=0,i=0,c=n.length;c>0?n.forEach(p=>{a+=p.correctAnswers,i+=p.totalQuestions}):(i=((g=t.questions)==null?void 0:g.length)||0,a=0,c=0);const u=i>0?Math.round(a/i*100):0;e.push({chapterId:t.id,chapterTitle:t.title,sectionNum:t.sectionNum,correctAnswers:a,totalQuestions:i,percentage:u,quizAttempts:c})}),e.filter(t=>t.quizAttempts>0||t.totalQuestions>0)}function tt(e){return e>=90?"Excellent":e>=80?"Good":e>=70?"Passing":e>=50?"Review":"Critical"}async function st(e={}){var i;const{maxRetries:t=3,retryDelayMs:s=1e3,onProgress:n}=e;if(n==null||n("Loading study data..."),typeof window.STUDY_DATA<"u"&&((i=window.STUDY_DATA)!=null&&i.chapters))return n==null||n("Data loaded successfully"),window.STUDY_DATA;let a=null;for(let c=1;c<=t;c++)try{n==null||n(`Loading data (attempt ${c}/${t})...`);const u=await fetch("./data.js",{cache:"force-cache"});if(!u.ok)throw new Error(`HTTP ${u.status}: ${u.statusText}`);const g=await u.text(),p="window.STUDY_DATA = ",h=g.indexOf(p);if(h===-1)throw new Error("Invalid data.js format: missing window.STUDY_DATA");let I=g.substring(h+p.length).trim(),d=0,v=!1,l=!1,f=-1;for(let $=0;$<I.length;$++){const x=I[$];if(l){l=!1;continue}if(x==="\\"){l=!0;continue}if(x==='"'&&!l){v=!v;continue}if(!v&&(x==="{"&&d++,x==="}"&&(d--,d===0))){f=$+1;break}}if(f===-1)throw new Error("Invalid data.js format: malformed JSON");I=I.substring(0,f);const y=JSON.parse(I);return window.STUDY_DATA=y,n==null||n("Data loaded successfully"),y}catch(u){a=u,console.warn(`Data load attempt ${c} failed:`,u),c<t&&await nt(s)}throw new Error(`Failed to load study data after ${t} attempts: ${a==null?void 0:a.message}`)}function nt(e){return new Promise(t=>setTimeout(t,e))}const at={home:ke,"chapter/:id":ie,quiz:ce,exam:re,flashcards:he,cheatsheet:Ge,sergeant:Je,weak:Ze},b={currentRoute:"home",currentChapter:null,data:null};async function Q(){const e=document.getElementById("content");e&&(e.innerHTML=`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text" id="loading-status">Loading study data...</p>
        <button class="retry-btn" id="retry-btn" style="display:none;">Retry</button>
      </div>
    `);const t=document.getElementById("retry-btn");t==null||t.addEventListener("click",()=>Q());try{b.data=await st({maxRetries:3,retryDelayMs:1e3,onProgress:n=>{const a=document.getElementById("loading-status");a&&(a.textContent=n)}}),fe(),ge(),Ee(b.data.chapters),qe(),me(at,(n,a)=>{b.currentRoute=n,b.currentChapter=(a==null?void 0:a.id)||null}),it();const s=window.location.hash.slice(1)||"home";C(s)}catch(s){const n=document.getElementById("loading-status");n&&(n.textContent="Failed to load study data"),t&&(t.style.display="inline-block"),console.error("Failed to initialize app:",s)}}function it(){document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();return}if(e.target.tagName!=="INPUT"&&/^[1-4]$/.test(e.key)){const t=new CustomEvent("quiz-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}if(e.target.tagName!=="INPUT"&&(e.key==="n"||e.key==="p")){const t=new CustomEvent("nav-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Q):Q();
