(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function s(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=s(a);fetch(a.href,i)}})();let D="",x=null,k={};function G(e,t){x=t,k=e,window.addEventListener("hashchange",q),q()}function L(e){e!==D&&(window.location.hash=e)}function q(){const e=window.location.hash.slice(1)||"home",[t,...s]=e.split("/"),n={};s.length>0&&(n.id=s.join("/")),D=e,x&&x(t,n);let a;k[t]?a=k[t]:k["chapter/:id"]&&t==="chapter"&&(a=k["chapter/:id"]),a?a(n):(console.warn(`Route not found: ${e}`),L("home"))}const F="nypd_theme";function Y(){const e=localStorage.getItem(F),t=window.matchMedia("(prefers-color-scheme: dark)").matches;(e==="dark"||!e&&t)&&document.documentElement.classList.add("dark");const s=document.getElementById("theme-toggle");s&&s.addEventListener("click",U)}function U(){const e=document.documentElement.classList.toggle("dark");localStorage.setItem(F,e?"dark":"light")}const _="nypd_font_scale",B=.8,j=1.4,P=.1;function K(){const e=localStorage.getItem(_);let t=e?parseFloat(e):1;t=Math.max(B,Math.min(j,t)),z(t);const s=document.getElementById("font-decrease"),n=document.getElementById("font-increase");s&&s.addEventListener("click",()=>N(-P)),n&&n.addEventListener("click",()=>N(P))}function z(e){document.documentElement.style.setProperty("--font-scale",e.toString()),localStorage.setItem(_,e.toString())}function N(e){const t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale"))||1,s=Math.max(B,Math.min(j,t+e));z(s)}const O="nypd_progress";function I(){const e=localStorage.getItem(O);if(e)try{return JSON.parse(e)}catch{}return{chapters:[],streak:0,totalStudyTimeSeconds:0}}function J(e){localStorage.setItem(O,JSON.stringify(e))}function V(e){const t=I();if(!(!t||!Array.isArray(t.chapters)))return t.chapters.find(s=>s.chapterId===e)}function X(e){const t=I();if(!t||!Array.isArray(t.chapters))return;let s=t.chapters.find(n=>n.chapterId===e);s?(s.status="completed",s.completedAt=new Date().toISOString()):(s={chapterId:e,status:"completed",questionsAnswered:0,timeSpentSeconds:0,completedAt:new Date().toISOString()},t.chapters.push(s)),J(t)}function Z(){const e=I();return(e==null?void 0:e.streak)||0}function ee(){const e=I();return(e==null?void 0:e.totalStudyTimeSeconds)||0}function te(){const e=I();return!e||!Array.isArray(e.chapters)?0:e.chapters.filter(t=>t.status==="completed").length}function se(e){if(!e||e.length===0){console.error("initSidebar: No chapters provided");return}ae(e),ne(),ie()}function ae(e){const t=document.getElementById("nav-chapters");if(!t)return;const s=`
    <div class="nav-section-title">Chapters</div>
    ${e.map(n=>{var r;const a=V(n.id),i=(a==null?void 0:a.status)==="completed",l=((r=n.questions)==null?void 0:r.length)||0;return`
        <div class="nav-item" data-chapter="${n.id}">
          <span class="ch-check ${i?"done":""}">${i?"✓":"○"}</span>
          <span class="nav-num">${n.sectionNum}</span>
          <span class="nav-title">${n.title}</span>
          <span class="q-badge">${l}q</span>
        </div>
      `}).join("")}
  `;t.innerHTML=s,t.querySelectorAll(".nav-item").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-chapter");a&&(L(`chapter/${a}`),X(a),W(a))})})}function ne(){const e=document.getElementById("nav-tools");if(!e)return;const t=[{id:"home",label:"Home",icon:"🏠"},{id:"cheatsheet",label:"Cheat Sheet",icon:"📋"},{id:"sergeant",label:"Sergeant Focus",icon:"👮"},{id:"flashcards",label:"Flashcards",icon:"🃏"},{id:"quiz",label:"Quick Quiz",icon:"⚡"},{id:"exam",label:"Practice Exam",icon:"📝"},{id:"weak",label:"Weak Areas",icon:"📊"}];e.innerHTML=`
    <div class="nav-section-title">Tools</div>
    ${t.map(s=>`
      <div class="nav-item" data-tool="${s.id}">
        <span class="nav-num">${s.icon}</span>
        <span class="nav-title">${s.label}</span>
      </div>
    `).join("")}
  `,e.querySelectorAll(".nav-item").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-tool");n&&(L(n),W(n))})})}function W(e){document.querySelectorAll(".nav-item").forEach(t=>{const s=t.getAttribute("data-chapter"),n=t.getAttribute("data-tool");s===e||n===e?t.classList.add("active"):t.classList.remove("active")})}function ie(){const e=document.getElementById("menu-toggle"),t=document.getElementById("sidebar");e&&t&&(e.addEventListener("click",()=>{t.classList.toggle("open")}),document.addEventListener("click",s=>{if(window.innerWidth<=768){const n=t.contains(s.target),a=e.contains(s.target);!n&&!a&&t.classList.remove("open")}}))}function ce(){const e=document.getElementById("breadcrumbs");e&&e.addEventListener("click",t=>{const s=t.target;if(s.tagName==="SPAN"){const n=s.getAttribute("data-route");n&&L(n)}})}function T(e){const t=document.getElementById("breadcrumbs");t&&(t.innerHTML=e.map((s,n)=>s.route?`<span data-route="${s.route}">${s.label}</span>`:`<span>${s.label}</span>`).join(" / "))}function oe(){T([{label:"Home"}]);const e=document.getElementById("content");if(!e)return;const t=Z(),s=ee(),n=te(),a=28,i=Math.floor(s/3600),l=Math.floor(s%3600/60);e.innerHTML=`
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
        <div class="stat-value">⏱️ ${i}h ${l}m</div>
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
  `,e.querySelectorAll(".card[data-navigate]").forEach(r=>{r.addEventListener("click",()=>{const v=r.getAttribute("data-navigate");v&&(window.location.hash=v)})})}function M(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,a=[],i=!1,l=[],r=!1,v=1;function u(){if(a.length>0){const S=a.some(c=>c.includes("|---")),o=c=>c.includes("|---"),f=a.filter(c=>!o(c));if(f.length>0){let c='<table class="cheatsheet-table">';if(S&&f.length>1){const h=f[0].split("|").filter(p=>p.trim()).map(p=>`<th>${m(p.trim())}</th>`).join("");c+=`<thead><tr>${h}</tr></thead><tbody>`;for(let p=1;p<f.length;p++){const $=f[p].split("|").filter(A=>A.trim()).map(A=>`<td>${m(A.trim())}</td>`).join("");c+=`<tr>${$}</tr>`}c+="</tbody></table>"}else{for(const h of f){const p=h.split("|").filter($=>$.trim()).map($=>`<td>${m($.trim())}</td>`).join("");c+=`<tr>${p}</tr>`}c+="</table>"}s.push(c)}}a=[],n=!1}function d(){l.length>0&&(r?s.push(`<ol class="cheatsheet-list" start="${v}">${l.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${l.join("")}</ul>`)),l=[],i=!1,r=!1,v=1}for(const S of t){const o=S.trim();if(o===""){u(),d();continue}if(o.startsWith("|")&&o.endsWith("|")){n||(d(),n=!0),a.push(o);continue}if(o.startsWith("- ")||o.startsWith("* ")){u(),(!i||r)&&(d(),i=!0,r=!1),l.push(`<li class="cheatsheet-list-item">${m(o.slice(2))}</li>`);continue}const f=o.match(/^(\d+)\.\s+(.+)$/);if(f){u(),(!i||!r)&&(d(),i=!0,r=!0,v=parseInt(f[1],10)),l.push(`<li class="cheatsheet-list-item">${m(f[2])}</li>`);continue}if(o.startsWith(">")){u(),d();const g=o.slice(1).trim();if(g.includes("**Exam Alert")){const y=g.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${m(y)}</p></div>`)}else if(g.includes("**Memory Aid")){const y=g.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${m(y)}</p></div>`)}else if(g.includes("**Prior Test")){const y=g.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${m(y)}</p></div>`)}else if(g.includes("**PG Conflict")){const y=g.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${m(y)}</p></div>`)}else if(g.includes("**See Also")){const y=g.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${m(y)}</p></div>`)}else if(g.includes("**Sergeant Focus")){const y=g.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${m(y)}</p></div>`)}else if(g.includes("**NOTE:**")){const y=g.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${m(y)}</p></div>`)}else if(g.startsWith("**Memory Aid")){const y=g.replace(/\*\*[^*]+\*\*/g,Q=>`<strong>${Q.replace(/\*\*/g,"")}</strong>`);s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${m(y)}</p></div>`)}else s.push(`<blockquote class="cheatsheet-blockquote">${m(g)}</blockquote>`);continue}if(o==="---"||o==="***"||o==="___"){u(),d();continue}const c=o.match(/^# (.+)$/),h=o.match(/^## (.+)$/),p=o.match(/^### (.+)$/),$=o.match(/^#### (.+)$/),A=o.match(/^##### (.+)$/),C=o.match(/^###### (.+)$/);if(c){u(),d(),s.push(`<h1 class="cheatsheet-h1">${m(c[1])}</h1>`);continue}if(h){u(),d(),s.push(`<h2 class="cheatsheet-h2">${m(h[1])}</h2>`);continue}if(p){u(),d(),s.push(`<h3 class="cheatsheet-h3">${m(p[1])}</h3>`);continue}if($){u(),d(),s.push(`<h4 class="cheatsheet-h4">${m($[1])}</h4>`);continue}if(A||C){u(),d(),s.push(`<p class="cheatsheet-paragraph"><strong>${m(A?A[1]:C[1])}</strong></p>`);continue}u(),d(),s.push(`<p class="cheatsheet-paragraph">${m(o)}</p>`)}return u(),d(),s.join("")}function m(e){if(!e)return"";let t=e;return t=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}let w="study";function R(e){const t=e==null?void 0:e.id;if(!t||!E.data){window.location.hash="home";return}const s=E.data.chapters.find(i=>i.id===t);if(!s){window.location.hash="home";return}T([{label:"Home",route:"home"},{label:`${s.sectionNum} — ${s.title}`}]);const n=document.getElementById("content");if(!n)return;n.innerHTML=`
    <h1>${s.sectionNum} — ${s.title}</h1>

    <div class="tab-bar">
      <div class="tab ${w==="study"?"active":""}" data-tab="study">Study</div>
      <div class="tab ${w==="quiz"?"active":""}" data-tab="quiz">Quiz</div>
      <div class="tab ${w==="terms"?"active":""}" data-tab="terms">Key Terms</div>
    </div>

    <div id="chapter-body" style="margin-top: 1.5rem;"></div>
  `,n.querySelectorAll(".tab").forEach(i=>{i.addEventListener("click",()=>{w=i.getAttribute("data-tab")||"study",R(e)})});const a=document.getElementById("chapter-body");if(a)switch(w){case"study":le(s,a);break;case"quiz":re(s,a);break;case"terms":de(s,a);break}}function le(e,t){t.innerHTML=M(e.readme);const s=e.sections.map(n=>M(n.content)).join('<hr style="margin: 2rem 0; border: none; border-top: var(--rule);">');t.innerHTML+=s}function re(e,t){if(!e.questions||e.questions.length===0){t.innerHTML="<p>No practice questions available for this chapter.</p>";return}t.innerHTML=`
    <h2>Chapter Quiz</h2>
    <p style="opacity: 0.6; margin-bottom: 1rem;">${e.questions.length} questions</p>
    <div id="quiz-container"></div>
  `;const s=document.getElementById("quiz-container");s&&(s.innerHTML="<p>Quiz functionality coming soon...</p>")}function de(e,t){t.innerHTML=`
    <h2>Key Terms</h2>
    ${M(e.keyTerms||"_No key terms for this chapter._")}
  `}function ue(){T([{label:"Home",route:"home"},{label:"Quick Quiz"}]);const e=document.getElementById("content");e&&(e.innerHTML=`
    <h1>Quick Quiz</h1>
    <p>10 random questions for fast practice drill.</p>
    <div id="quiz-container">
      <p>Quiz functionality coming soon...</p>
    </div>
  `)}function he(){T([{label:"Home",route:"home"},{label:"Practice Exam"}]);const e=document.getElementById("content");e&&(e.innerHTML=`
    <h1>Practice Exam</h1>
    <p>Full 140-question timed exam simulating test conditions.</p>
    <div id="exam-container">
      <p>Exam functionality coming soon...</p>
    </div>
  `)}function pe(){T([{label:"Home",route:"home"},{label:"Flashcards"}]);const e=document.getElementById("content");if(!e)return;e.innerHTML=`
    <h1>Flashcards</h1>
    <p>Leitner-style flashcards for spaced repetition learning.</p>
    <div class="flashcard">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="flashcard-label">Key Term</div>
          <div class="flashcard-text">Category I Vehicle</div>
        </div>
        <div class="flashcard-back">
          <div class="flashcard-label">Definition</div>
          <div class="flashcard-text">A vehicle owned or leased by the NYPD.</div>
        </div>
      </div>
    </div>
    <p style="text-align: center; opacity: 0.6; margin-top: 1rem;">Tap card to flip</p>
  `;const t=e.querySelector(".flashcard");t&&t.addEventListener("click",()=>{t.classList.toggle("flipped")})}function fe(){var n;T([{label:"Home",route:"home"},{label:"Cheat Sheet"}]);const e=document.getElementById("content");if(!e)return;const t=((n=E.data)==null?void 0:n.cheatSheet)||"",s=me(t);e.innerHTML=`
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
        ${s.map((a,i)=>ve(a,i)).join("")}
      </div>
    </div>
  `,document.querySelectorAll(".cheatsheet-toc-link").forEach(a=>{a.addEventListener("click",i=>{var v;i.preventDefault();const l=(v=a.getAttribute("href"))==null?void 0:v.slice(1),r=document.getElementById(l||"");r==null||r.scrollIntoView({behavior:"smooth",block:"start"})})})}function me(e){const t=[],s=e.split(`
`);let n=null;for(const a of s){const i=a.match(/^## (.+)$/);i?(n&&t.push(n),n={title:i[1],content:""}):n&&(n.content+=a+`
`)}return n&&t.push(n),t}function ve(e,t){const s=ge(e.content);return`
    <section id="section-${t}" class="cheatsheet-section">
      <h2 class="cheatsheet-section-title">
        <span class="cheatsheet-section-number">${String(t+1).padStart(2,"0")}</span>
        ${e.title}
      </h2>
      <div class="cheatsheet-section-content">
        ${s}
      </div>
    </section>
  `}function ge(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,a=[],i=!1,l=[],r=!1,v=1;function u(){if(a.length>0){const S=a.some(c=>c.includes("|---")),o=c=>c.includes("|---"),f=a.filter(c=>!o(c));if(f.length>0){let c='<table class="cheatsheet-table">';if(S&&f.length>1){const h=f[0].split("|").filter(p=>p.trim()).map(p=>`<th>${b(p.trim())}</th>`).join("");c+=`<thead><tr>${h}</tr></thead><tbody>`;for(let p=1;p<f.length;p++){const $=f[p].split("|").filter(A=>A.trim()).map(A=>`<td>${b(A.trim())}</td>`).join("");c+=`<tr>${$}</tr>`}c+="</tbody></table>"}else{for(const h of f){const p=h.split("|").filter($=>$.trim()).map($=>`<td>${b($.trim())}</td>`).join("");c+=`<tr>${p}</tr>`}c+="</table>"}s.push(c)}}a=[],n=!1}function d(){l.length>0&&(r?s.push(`<ol class="cheatsheet-list" start="${v}">${l.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${l.join("")}</ul>`)),l=[],i=!1,r=!1,v=1}for(const S of t){const o=S.trim();if(o===""){u(),d();continue}if(o.startsWith("|")&&o.endsWith("|")){n||(d(),n=!0),a.push(o);continue}if(o.startsWith("- ")||o.startsWith("* ")){u(),(!i||r)&&(d(),i=!0,r=!1),l.push(`<li class="cheatsheet-list-item">${b(o.slice(2))}</li>`);continue}const f=o.match(/^(\d+)\.\s+(.+)$/);if(f){u(),(!i||!r)&&(d(),i=!0,r=!0,v=parseInt(f[1],10)),l.push(`<li class="cheatsheet-list-item">${b(f[2])}</li>`);continue}if(o.startsWith(">")){u(),d();const c=o.slice(1).trim();if(c.includes("**Exam Alert")){const h=c.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${b(h)}</p></div>`)}else if(c.includes("**Memory Aid")){const h=c.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${b(h)}</p></div>`)}else if(c.includes("**Prior Test")){const h=c.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${b(h)}</p></div>`)}else if(c.includes("**PG Conflict")){const h=c.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${b(h)}</p></div>`)}else if(c.includes("**See Also")){const h=c.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${b(h)}</p></div>`)}else if(c.includes("**Sergeant Focus")){const h=c.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${b(h)}</p></div>`)}else if(c.includes("**NOTE:**")){const h=c.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${b(h)}</p></div>`)}else c.startsWith("**Memory Aid")?s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${b(c)}</p></div>`):s.push(`<blockquote class="cheatsheet-blockquote">${b(c)}</blockquote>`);continue}if(o==="---"||o==="***"||o==="___"){u(),d();continue}u(),d(),s.push(`<p class="cheatsheet-paragraph">${b(o)}</p>`)}return u(),d(),s.join("")}function b(e){if(!e)return"";let t=e;return t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}function ye(){T([{label:"Home",route:"home"},{label:"Sergeant Focus"}]);const e=document.getElementById("content");if(!e||!E.data)return;const t=E.data.chapters.filter(a=>a.sergeantFocus&&a.sergeantFocus.length>0);e.innerHTML=`
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
        ${t.map((a,i)=>$e(a,i)).join("")}
      </div>
    </div>
  `;const s=document.getElementById("expand-all"),n=document.getElementById("collapse-all");s==null||s.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!0})}),n==null||n.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!1})})}function be(e,t){const s=e.match(/section-(\d{3})-(?:0?(\d+)|([a-z0-9-]+))\.md/);if(!s)return{displayName:`P.G. ${t}`,sourceType:"PG"};const n=s[1],a=s[2]||s[3],i=n.startsWith("2")?"PG":"AG";return{displayName:`${i==="PG"?"P.G.":"A.G."} ${n}-${a}`,sourceType:i}}function $e(e,t){return`
    <section class="sergeant-focus-chapter">
      <details class="sergeant-focus-details" ${t<3?"open":""}>
        <summary class="sergeant-focus-summary">
          <span class="chapter-num">${e.sectionNum}</span>
          <span class="chapter-title">${e.title}</span>
          <span class="callout-count">${e.sergeantFocus.length} callout${e.sergeantFocus.length!==1?"s":""}</span>
          <span class="expand-icon">+</span>
        </summary>
        <div class="sergeant-focus-callouts">
          ${e.sergeantFocus.map(n=>{const a=be(n.filename,e.sectionNum);return`
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
  `}function Se(){T([{label:"Home",route:"home"},{label:"Weak Areas"}]);const e=document.getElementById("content");e&&(e.innerHTML=`
    <h1>Weak Areas</h1>
    <p>Review chapters where you scored lowest.</p>
    <div id="weak-areas-container">
      <p>Weak areas analysis coming soon...</p>
    </div>
  `)}const Ee={home:oe,"chapter/:id":R,quiz:ue,exam:he,flashcards:pe,cheatsheet:fe,sergeant:ye,weak:Se},E={currentRoute:"home",currentChapter:null,data:null};async function H(){if(await new Promise(t=>{if(typeof window.STUDY_DATA<"u"&&window.STUDY_DATA&&window.STUDY_DATA.chapters)E.data=window.STUDY_DATA,t();else{let s=0;const n=setInterval(()=>{typeof window.STUDY_DATA<"u"&&window.STUDY_DATA&&window.STUDY_DATA.chapters?(E.data=window.STUDY_DATA,clearInterval(n),t()):s++>50&&(clearInterval(n),t())},100)}}),!E.data)try{const s=await(await fetch("./data.js")).text(),n="window.STUDY_DATA = ",a=s.indexOf(n);if(a===-1)throw new Error("Could not find window.STUDY_DATA prefix");let i=s.substring(a+n.length).trim(),l=0,r=!1,v=!1,u=-1;for(let d=0;d<i.length;d++){const S=i[d];if(v){v=!1;continue}if(S==="\\"){v=!0;continue}if(S==='"'&&!v){r=!r;continue}if(!r&&(S==="{"&&l++,S==="}"&&(l--,l===0))){u=d+1;break}}if(u===-1)throw new Error("Could not find matching closing brace");i=i.substring(0,u),E.data=JSON.parse(i)}catch(t){console.error("Failed to load study data:",t),document.getElementById("content").innerHTML=`<div class="error" style="padding:20px;color:red;">Failed to load study data: ${t}. Please refresh.</div>`;return}Y(),K(),se(E.data.chapters),ce(),G(Ee,(t,s)=>{E.currentRoute=t,E.currentChapter=(s==null?void 0:s.id)||null}),Ae();const e=window.location.hash.slice(1)||"home";L(e)}function Ae(){document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();return}if(e.target.tagName!=="INPUT"&&/^[1-4]$/.test(e.key)){const t=new CustomEvent("quiz-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}if(e.target.tagName!=="INPUT"&&(e.key==="n"||e.key==="p")){const t=new CustomEvent("nav-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",H):H();
