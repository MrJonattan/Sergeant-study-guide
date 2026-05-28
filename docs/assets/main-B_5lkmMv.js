(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function s(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=s(i);fetch(i.href,a)}})();let ft="",ge=null,U={};function ss(e,t){ge=t,U=e,window.addEventListener("hashchange",et),et()}function Q(e){e!==ft&&(window.location.hash=e)}function et(){const e=window.location.hash.slice(1)||"home",[t,...s]=e.split("/"),n={};s.length>0&&(n.id=s.join("/")),ft=e,ge&&ge(t,n);let i;U[t]?i=U[t]:U["chapter/:id"]&&t==="chapter"&&(i=U["chapter/:id"]),i?i(n):(console.warn(`Route not found: ${e}`),Q("home"))}const gt="nypd_theme";function ns(){const e=localStorage.getItem(gt),t=window.matchMedia("(prefers-color-scheme: dark)").matches;(e==="dark"||!e&&t)&&document.documentElement.classList.add("dark");const s=document.getElementById("theme-toggle");s&&s.addEventListener("click",Se)}function Se(){const e=document.documentElement.classList.toggle("dark");localStorage.setItem(gt,e?"dark":"light")}function ve(){return document.documentElement.classList.contains("dark")?"dark":"light"}const Ie="nypd_font_scale",qe=.8,Te=1.4,tt=.1;function is(){const e=localStorage.getItem(Ie);let t=e?parseFloat(e):1;t=Math.max(qe,Math.min(Te,t)),Ae(t);const s=document.getElementById("font-decrease"),n=document.getElementById("font-increase");s&&s.addEventListener("click",()=>st(-tt)),n&&n.addEventListener("click",()=>st(tt))}function Ae(e){document.documentElement.style.setProperty("--font-scale",e.toString()),localStorage.setItem(Ie,e.toString())}function st(e){const t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale"))||1,s=Math.max(qe,Math.min(Te,t+e));Ae(s)}function J(){const e=localStorage.getItem(Ie);return e?parseFloat(e):1}function re(e){const t=Math.max(qe,Math.min(Te,e));Ae(t)}const vt="nypd_progress";function M(){const e=localStorage.getItem(vt);if(e)try{return JSON.parse(e)}catch{}return{chapters:[],streak:0,totalStudyTimeSeconds:0}}function le(e){localStorage.setItem(vt,JSON.stringify(e))}function Ce(){return M()}function yt(e){le(e)}function de(e){const t=M();if(!(!t||!Array.isArray(t.chapters)))return t.chapters.find(s=>s.chapterId===e)}function Le(e){const t=M();if(!t||!Array.isArray(t.chapters))return;let s=t.chapters.find(n=>n.chapterId===e);s?(s.status="completed",s.completedAt=new Date().toISOString()):(s={chapterId:e,status:"completed",questionsAnswered:0,timeSpentSeconds:0,completedAt:new Date().toISOString()},t.chapters.push(s)),le(t)}function ue(e,t,s,n){const i=M();if(!i||!Array.isArray(i.chapters))return;let a=i.chapters.find(r=>r.chapterId===e);const o=Math.round(t/100*s);a?(a.quizScore=t,a.status=t>=80?"completed":"review",a.quizHistory=a.quizHistory||[],a.quizHistory.push({correctAnswers:o,totalQuestions:s,timestamp:new Date().toISOString(),attemptType:n})):(a={chapterId:e,status:t>=80?"completed":"review",quizScore:t,quizHistory:[{correctAnswers:o,totalQuestions:s,timestamp:new Date().toISOString(),attemptType:n}],questionsAnswered:0,timeSpentSeconds:0},i.chapters.push(a)),le(i)}function bt(){const e=M();return(e==null?void 0:e.streak)||0}function wt(){const e=M();return(e==null?void 0:e.totalStudyTimeSeconds)||0}function kt(){const e=M();return!e||!Array.isArray(e.chapters)?0:e.chapters.filter(t=>t.status==="completed").length}function ne(e,t,s){const n=M();if(!n||!Array.isArray(n.chapters))return;let i=n.chapters.find(a=>a.chapterId===e);i?(t&&(i.lastSectionId=t),s!==void 0&&(i.lastScrollPosition=s),i.lastStudiedAt=new Date().toISOString()):(i={chapterId:e,status:"in_progress",questionsAnswered:0,timeSpentSeconds:0,lastStudiedAt:new Date().toISOString(),lastSectionId:t,lastScrollPosition:s},n.chapters.push(i)),le(n)}function $t(){const e=M();if(!e||!Array.isArray(e.chapters))return null;const t=Date.now()-720*60*60*1e3,s=e.chapters.filter(n=>n.lastSectionId&&n.lastStudiedAt&&new Date(n.lastStudiedAt).getTime()>t);return s.length===0?null:(s.sort((n,i)=>{const a=n.lastStudiedAt?new Date(n.lastStudiedAt).getTime():0;return(i.lastStudiedAt?new Date(i.lastStudiedAt).getTime():0)-a}),s[0])}const Et="nypd_flashcards",xt={1:0,2:1440*60*1e3,3:4320*60*1e3,4:10080*60*1e3,5:720*60*60*1e3};function pe(){const e=localStorage.getItem(Et);if(e)try{return JSON.parse(e)}catch{}return{cards:{}}}function ze(e){localStorage.setItem(Et,JSON.stringify(e))}function De(){return pe()}function St(e){ze(e)}function It(e){return pe().cards[e]||{stage:1,correctCount:0,totalAttempts:0}}function ye(e,t){const s=pe(),n=s.cards[e]||{stage:1,correctCount:0,totalAttempts:0},i=Math.max(1,Math.min(5,t)),a=xt[i];s.cards[e]={stage:i,nextReview:a>0?Date.now()+a:void 0,lastReview:Date.now(),correctCount:n.correctCount+(i>n.stage?1:0),totalAttempts:n.totalAttempts+1},ze(s)}const Me="nypd_diagnostic_completed_at";function qt(){return!!localStorage.getItem(Me)}function Tt(){localStorage.setItem(Me,new Date().toISOString())}function as(){localStorage.setItem(Me,new Date().toISOString())}function At(e,t){const s=pe(),n=s.cards[e]||{correctCount:0,totalAttempts:0},i=t?2:1,a=xt[i];s.cards[e]={stage:i,nextReview:a>0?Date.now()+a:void 0,lastReview:Date.now(),correctCount:n.correctCount+(t?1:0),totalAttempts:n.totalAttempts+1},ze(s)}const he=Object.freeze(Object.defineProperty({__proto__:null,getCompletedChapters:kt,getFlashcardProgress:It,getProgress:de,getRecentResumeChapter:$t,getStreak:bt,getTotalStudyTime:wt,hasCompletedDiagnostic:qt,loadFlashcardProgressForExport:De,loadProgressForExport:Ce,markChapterComplete:Le,placeFlashcardFromDiagnostic:At,saveFlashcardProgressForImport:St,saveProgressForImport:yt,setDiagnosticCompleted:Tt,skipDiagnostic:as,updateChapterPosition:ne,updateFlashcardProgress:ye,updateQuizScore:ue},Symbol.toStringTag,{value:"Module"}));function os(e){if(!e||e.length===0){console.error("initSidebar: No chapters provided");return}rs(e),cs(),ds()}function rs(e){const t=document.getElementById("nav-chapters");if(!t)return;const s=`
    <div class="nav-section-title">Chapters</div>
    ${e.map(n=>{var r;const i=de(n.id),a=(i==null?void 0:i.status)==="completed",o=((r=n.questions)==null?void 0:r.length)||0;return`
        <div class="nav-item" data-chapter="${n.id}">
          <span class="ch-check ${a?"done":""}">${a?"✓":"○"}</span>
          <span class="nav-num">${n.sectionNum}</span>
          <span class="nav-title">${n.title}</span>
          <span class="q-badge">${o}q</span>
        </div>
      `}).join("")}
  `;t.innerHTML=s,t.querySelectorAll(".nav-item").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-chapter");i&&(Q(`chapter/${i}`),Le(i),Ct(i))})})}function cs(){const e=document.getElementById("nav-tools");if(!e)return;const t=[{id:"home",label:"Home",icon:"🏠"},{id:"schedule",label:"Study Schedule",icon:"📅"},{id:"bookmarks",label:"Bookmarks",icon:"⭐"},{id:"highlights",label:"Highlights",icon:"🖍️"},{id:"cheatsheet",label:"Cheat Sheet",icon:"📋"},{id:"sergeant",label:"Sergeant Focus",icon:"👮"},{id:"diagnostic",label:"Diagnostic",icon:"📈"},{id:"flashcards",label:"Flashcards",icon:"🃏"},{id:"quiz",label:"Quick Quiz",icon:"⚡"},{id:"exam",label:"Practice Exam",icon:"📝"},{id:"weak",label:"Weak Areas",icon:"📊"}];e.innerHTML=`
    <div class="nav-section-title">Tools</div>
    ${t.map(s=>`
      <div class="nav-item" data-tool="${s.id}">
        <span class="nav-num">${s.icon}</span>
        <span class="nav-title">${s.label}</span>
      </div>
    `).join("")}
  `,e.querySelectorAll(".nav-item").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-tool");n&&(Q(n),Ct(n))})}),ls()}function ls(){const e=document.getElementById("nav-tools");if(!e)return;const t=document.createElement("div");t.className="nav-section display-section",t.innerHTML=`
    <div class="nav-section-title">Display</div>
    <div class="nav-item display-controls">
      <button class="icon-btn" id="sidebar-font-decrease" aria-label="Decrease font">A-</button>
      <button class="icon-btn" id="sidebar-font-increase" aria-label="Increase font">A+</button>
      <button class="icon-btn" id="sidebar-theme-toggle" aria-label="Toggle dark mode">◑</button>
    </div>
  `,e.appendChild(t);const s=document.getElementById("sidebar-font-decrease"),n=document.getElementById("sidebar-font-increase"),i=document.getElementById("sidebar-theme-toggle");s&&s.addEventListener("click",()=>{const a=J(),o=Math.max(.8,a-.1);re(o)}),n&&n.addEventListener("click",()=>{const a=J(),o=Math.min(1.4,a+.1);re(o)}),i&&i.addEventListener("click",()=>{Se()})}function Ct(e){document.querySelectorAll(".nav-item").forEach(t=>{const s=t.getAttribute("data-chapter"),n=t.getAttribute("data-tool");s===e||n===e?t.classList.add("active"):t.classList.remove("active")})}function ds(){const e=document.getElementById("menu-toggle"),t=document.getElementById("sidebar");e&&t&&(e.addEventListener("click",()=>{t.classList.toggle("open")}),document.addEventListener("click",s=>{if(window.innerWidth<=768){const n=t.contains(s.target),i=e.contains(s.target);!n&&!i&&t.classList.remove("open")}}))}const us=768;function ps(){return window.innerWidth<us}function nt(){const e=document.querySelector(".topbar-controls");if(!e)return;if(ps())e.innerHTML=`
      <button class="icon-btn" id="settings-toggle" aria-label="Settings">⚙</button>
    `;else{e.innerHTML=`
      <button class="icon-btn" id="font-decrease" aria-label="Decrease font">A-</button>
      <button class="icon-btn" id="font-increase" aria-label="Increase font">A+</button>
      <button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode">◑</button>
      <button class="icon-btn" id="settings-toggle" aria-label="Settings">⚙</button>
    `;const s=document.getElementById("font-decrease"),n=document.getElementById("font-increase"),i=document.getElementById("theme-toggle");s&&s.addEventListener("click",()=>{const a=J(),o=Math.max(.8,a-.1);re(o)}),n&&n.addEventListener("click",()=>{const a=J(),o=Math.min(1.4,a+.1);re(o)}),i&&i.addEventListener("click",()=>{Se()})}}function hs(){const e=document.getElementById("breadcrumbs");e&&e.addEventListener("click",s=>{const n=s.target;if(n.tagName==="SPAN"){const i=n.getAttribute("data-route");i&&Q(i)}}),nt();let t;window.addEventListener("resize",()=>{clearTimeout(t),t=setTimeout(nt,150)})}function z(e){const t=document.getElementById("breadcrumbs");t&&(t.innerHTML=e.map(s=>s.route?`<span data-route="${s.route}">${s.label}</span>`:`<span>${s.label}</span>`).join(" / "))}const ms="modulepreload",fs=function(e){return"/Sergeant-study-guide/"+e},it={},V=function(t,s,n){let i=Promise.resolve();if(s&&s.length>0){let o=function(c){return Promise.all(c.map(d=>Promise.resolve(d).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),l=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));i=o(s.map(c=>{if(c=fs(c),c in it)return;it[c]=!0;const d=c.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${p}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":ms,d||(u.as="script"),u.crossOrigin="",u.href=c,l&&u.setAttribute("nonce",l),document.head.appendChild(u),d)return new Promise((v,h)=>{u.addEventListener("load",v),u.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${c}`)))})}))}function a(o){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=o,window.dispatchEvent(r),!r.defaultPrevented)throw o}return i.then(o=>{for(const r of o||[])r.status==="rejected"&&a(r.reason);return t().catch(a)})},Lt=[{id:"200-general",priority:"high",estHours:2},{id:"202-duties-responsibilities",priority:"high",estHours:2},{id:"207-complaints",priority:"high",estHours:2.5},{id:"208-arrests",priority:"high",estHours:3},{id:"209-summonses",priority:"medium",estHours:1.5},{id:"210-prisoners",priority:"high",estHours:3},{id:"211-court-appearances",priority:"medium",estHours:2},{id:"212-command-operations",priority:"high",estHours:2.5},{id:"213-mobilization-emergency",priority:"high",estHours:2.5},{id:"214-quality-of-life",priority:"medium",estHours:2},{id:"215-juvenile-matters",priority:"high",estHours:2.5},{id:"216-aided-cases",priority:"high",estHours:3},{id:"217-vehicle-collisions",priority:"medium",estHours:2},{id:"218-property-general",priority:"medium",estHours:1.5},{id:"219-department-property",priority:"low",estHours:1.5},{id:"220-citywide-incident-mgmt",priority:"high",estHours:2},{id:"221-tactical-operations",priority:"medium",estHours:2.5},{id:"303-duties-responsibilities",priority:"high",estHours:2},{id:"304-general-regulations",priority:"high",estHours:2.5},{id:"305-uniforms-equipment",priority:"low",estHours:1},{id:"318-disciplinary-matters",priority:"high",estHours:3},{id:"319-civilian-personnel",priority:"low",estHours:1.5},{id:"320-personnel-matters",priority:"medium",estHours:2},{id:"324-leave-payroll-timekeeping",priority:"medium",estHours:2},{id:"329-career-development",priority:"low",estHours:1.5},{id:"330-medical-health-wellness",priority:"medium",estHours:2.5},{id:"331-evaluations",priority:"medium",estHours:2},{id:"332-employee-rights",priority:"high",estHours:2.5}],at={high:0,medium:1,low:2},gs=14;function vs(){return[...Lt].sort((e,t)=>{const s=at[e.priority]-at[t.priority];return s!==0?s:t.estHours-e.estHours})}function ys(e){const t=Date.now();return Math.ceil((e-t)/(1e3*60*60*24))<=gs}function bs(e){const t=Date.now();return Math.ceil((e-t)/(1e3*60*60*24))}function zt(e){const t=new Date,s=new Date(e),n=Math.ceil((e-t.getTime())/(1e3*60*60*24)),i=Math.ceil(n/7),a=Math.max(1,Math.floor(i*.2)),o=i-a,r=vs(),l=[];let c=1,d=0;for(;c<=o&&d<r.length;){const p=new Date(t);p.setDate(p.getDate()+(c-1)*7);const u=new Date(p);u.setDate(u.getDate()+6);const v=[],h=[],f=Math.ceil((r.length-d)/((o-c+1)*7));for(let x=0;x<7;x++){const T=new Date(p);T.setDate(p.getDate()+x);const B=T.toISOString().split("T")[0],I=T.getDay()===0,q=[];if(!I&&d<r.length){const fe=Math.min(f,r.length-d);for(let Ze=0;Ze<fe;Ze++)d<r.length&&(q.push(r[d].id),h.push(r[d]),d++)}I?v.push({date:B,newChapters:[],dueFlashcardCount:0,isSundayReview:!0,isReviewWeek:!1,focus:"Weekly Review"}):v.push({date:B,newChapters:q,dueFlashcardCount:0,reviewQuiz:q.length>0?{chapterId:q[0],questionCount:10}:void 0,isSundayReview:!1,isReviewWeek:!1,focus:q.length>0?ks(h):"Catch-up"})}const w=h.filter(x=>x.priority==="high").length;l.push({weekNumber:c,startDate:p.toISOString().split("T")[0],endDate:u.toISOString().split("T")[0],dailyPlans:v,focus:w>1?"HIGH PRIORITY":"Standard",isReviewWeek:!1}),c++}for(let p=0;p<a;p++){const u=new Date(s);u.setDate(s.getDate()-(a-p)*7);const v=new Date(u);v.setDate(u.getDate()+6);const h=[];for(let f=0;f<7;f++){const w=new Date(u);w.setDate(u.getDate()+f);const x=w.toISOString().split("T")[0];h.push({date:x,newChapters:[],dueFlashcardCount:0,isSundayReview:w.getDay()===0,isReviewWeek:!0,focus:p===a-1?"FULL PRACTICE EXAM":"WEAK AREAS REVIEW"})}l.push({weekNumber:c,startDate:u.toISOString().split("T")[0],endDate:v.toISOString().split("T")[0],dailyPlans:h,focus:p===a-1?"FULL PRACTICE EXAM":"WEAK AREAS REVIEW",isReviewWeek:!0}),c++}return{examDate:e,createdAt:Date.now(),weeklyPlans:l,totalWeeks:i,reviewWeeks:a}}function ws(e,t){const s=t||new Date().toISOString().split("T")[0];for(const n of e.weeklyPlans)for(const i of n.dailyPlans)if(i.date===s)return i;return null}function ks(e){return e.filter(s=>s.priority==="high").length>1?"HIGH PRIORITY":"Standard"}function Be(e){return Lt.find(t=>t.id===e)}const Dt="nypd_exam_date",Mt="nypd_schedule",Bt="nypd_daily_plan_completion";function He(){const e=localStorage.getItem(Dt);return e?Number(e):null}function Ht(e){localStorage.setItem(Dt,e.toString());const t=zt(e);Re(t)}function _e(){const e=localStorage.getItem(Mt);if(e)try{return JSON.parse(e)}catch{return null}return null}function Re(e){localStorage.setItem(Mt,JSON.stringify(e))}function _t(){const e=He();if(!e)return null;let t=_e();return(!t||t.examDate!==e)&&(t=zt(e),Re(t)),t}function Rt(e){const t=_t();return t?ws(t,e):null}function Ne(){const e=new Date().toISOString().split("T")[0];return Rt(e)}function Nt(e){const t=Oe();t.includes(e)||(t.push(e),localStorage.setItem(Bt,JSON.stringify(t)))}function Pe(e){return Oe().includes(e)}function Oe(){const e=localStorage.getItem(Bt);if(e)try{return JSON.parse(e)}catch{return[]}return[]}const $s=Object.freeze(Object.defineProperty({__proto__:null,getDailyPlan:Rt,getDailyPlanCompletions:Oe,getExamDate:He,getOrCreateSchedule:_t,getSchedule:_e,getTodayPlan:Ne,isDailyPlanComplete:Pe,markDailyPlanComplete:Nt,saveSchedule:Re,setExamDate:Ht},Symbol.toStringTag,{value:"Module"})),Es=()=>window.matchMedia("(pointer: coarse)").matches;function be(){z([{label:"Home"}]);const e=document.getElementById("content");if(!e)return;const t=bt(),s=wt(),n=kt(),i=28,a=Math.floor(s/3600),o=Math.floor(s%3600/60),r=$t(),l=r?qs(r):"",c=Ne(),d=new Date().toISOString().split("T")[0],p=Pe(d),u=c?As(c,p):"",v=!l&&!qt()?Ts():"",h=!l&&!v&&t===0&&n===0&&s===0;e.innerHTML=`
    ${u}
    ${l}
    ${v}
    ${h?xs():Ss(t,n,i,a,o)}

    <div class="card search-quick-card" style="cursor: pointer;" data-navigate="search">
      <div class="card-header">🔍 Search</div>
      <div class="card-body">Find chapters, key terms, and questions</div>
      ${Is()}
    </div>

    <h2>Quick Actions</h2>
    <div class="quick-actions-grid">
      <div class="card" style="cursor: pointer;" data-navigate="quiz">
        <div class="card-header">⚡ Quick Quiz</div>
        <div class="card-body">10 random questions for fast practice</div>
      </div>

      <div class="card" style="cursor: pointer;" data-navigate="exam">
        <div class="card-header">📝 Practice Exam</div>
        <div class="card-body">Full 200-question timed exam</div>
      </div>

      <div class="card" style="cursor: pointer;" data-navigate="weak">
        <div class="card-header">📊 Weak Areas</div>
        <div class="card-body">Review chapters where you scored lowest</div>
      </div>
    </div>

    <h2>Recent Activity</h2>
    <p style="opacity: 0.6; font-style: italic;">Start studying to see your activity here.</p>
  `,e.querySelectorAll(".card[data-navigate]").forEach(I=>{I.addEventListener("click",()=>{const q=I.getAttribute("data-navigate");q&&(window.location.hash=q)})});const f=e.querySelector("#start-chapter-cta");f&&f.addEventListener("click",()=>{window.location.hash="chapter/200-general"});const w=e.querySelector("#resume-chapter-btn");w&&w.addEventListener("click",()=>{r&&(window.location.hash=`chapter/${r.chapterId}`)});const x=e.querySelector("#diagnostic-take-btn");x&&x.addEventListener("click",()=>{window.location.hash="diagnostic"});const T=e.querySelector("#diagnostic-skip-btn");T&&T.addEventListener("click",()=>{V(async()=>{const{skipDiagnostic:I}=await Promise.resolve().then(()=>he);return{skipDiagnostic:I}},void 0).then(({skipDiagnostic:I})=>{I(),be()})});const B=e.querySelector(".plan-complete-btn");B&&B.addEventListener("click",()=>{V(async()=>{const{markDailyPlanComplete:I}=await Promise.resolve().then(()=>$s);return{markDailyPlanComplete:I}},void 0).then(({markDailyPlanComplete:I})=>{const q=new Date().toISOString().split("T")[0];I(q),be()})})}function xs(){return`
    <div class="empty-state-card" style="text-align: center; padding: 3rem 1.5rem; border: var(--rule); border-radius: 12px; background: var(--bg); margin: 1.5rem 0;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
      <h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem;">Welcome to Your Study Guide</h2>
      <p style="font-family: var(--font-body); font-size: 1rem; opacity: 0.8; margin-bottom: 1.5rem; line-height: 1.6;">
        Start your preparation with Chapter 200 — General Principles. Build your knowledge step by step.
      </p>
      <button id="start-chapter-cta" class="cta-primary-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: var(--fg); color: var(--bg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px;">
        Start Chapter 200
      </button>
    </div>
  `}function Ss(e,t,s,n,i){return`
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">🔥 ${e}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">📚 ${t}/${s}</div>
        <div class="stat-label">Chapters Done</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">⏱️ ${n} hr ${i} min</div>
        <div class="stat-label">Study Time</div>
      </div>
    </div>
  `}function Is(){return Es()?"":'<div class="search-shortcut-hint">Press Ctrl+K</div>'}function qs(e){var i;if(!e||!e.lastSectionId)return"";const t=(i=E.data)==null?void 0:i.chapters.find(a=>a.id===e.chapterId);if(!t)return"";const s=t.sectionNum||e.chapterId.replace(/\D/g,"").slice(0,3),n=e.lastSectionId?`§${e.lastSectionId.slice(-2)}`:"";return`
    <div class="resume-card" style="border: 2px solid var(--fg); border-radius: 12px; padding: 1.5rem 2rem; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-muted) 100%); margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 0.5rem;">Continue Where You Left Off</div>
          <h2 style="font-family: var(--font-display); font-size: 1.25rem; margin: 0 0 0.25rem 0;">Resume: Ch ${s} ${n} — ${t.title}</h2>
          <p style="font-family: var(--font-body); font-size: 0.9rem; opacity: 0.8; margin: 0;">Pick up from your last study session</p>
        </div>
        <button id="resume-chapter-btn" class="resume-continue-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: var(--fg); color: var(--bg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px; white-space: nowrap;">
          Continue
        </button>
      </div>
    </div>
  `}function Ts(){return`
    <div class="diagnostic-prompt-card" style="border: 2px solid var(--fg); border-radius: 12px; padding: 1.5rem 2rem; background: var(--bg-muted); margin: 1.5rem 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 0.5rem;">Baseline Assessment</div>
          <h2 style="font-family: var(--font-display); font-size: 1.25rem; margin: 0 0 0.25rem 0;">Take Diagnostic Test</h2>
          <p style="font-family: var(--font-body); font-size: 0.9rem; opacity: 0.8; margin: 0;">30 questions to identify your strengths and weaknesses</p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button id="diagnostic-take-btn" class="cta-primary-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: var(--fg); color: var(--bg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px;">
            Take Test
          </button>
          <button id="diagnostic-skip-btn" class="cta-secondary-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: transparent; color: var(--fg); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px;">
            Skip
          </button>
        </div>
      </div>
    </div>
  `}function As(e,t){const s=e==null?void 0:e.newChapters.map(i=>{const a=Be(i);return a?{id:i,displayName:i.replace(/-/g," ").toUpperCase(),estHours:a.estHours}:null}).filter(Boolean),n=(s==null?void 0:s.reduce((i,a)=>i+a.estHours,0))||0;return`
    <div class="daily-plan-card ${t?"complete":""}" style="border: 2px solid ${t?"var(--callout-memory-border)":"var(--fg)"}; border-radius: 12px; padding: 1.5rem 2rem; background: ${t?"var(--callout-memory-bg)":"var(--bg-muted)"}; margin: 1.5rem 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <div style="font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 0.5rem;">
            ${t?"✓ Completed":"Today's Plan"} — ${new Date().toLocaleDateString(void 0,{weekday:"long",month:"short",day:"numeric"})}
          </div>
          <h2 style="font-family: var(--font-display); font-size: 1.25rem; margin: 0 0 0.25rem 0;">
            ${(e==null?void 0:e.focus)||"Study Day"}
          </h2>
          <p style="font-family: var(--font-body); font-size: 0.9rem; opacity: 0.8; margin: 0.5rem 0;">
            ${(s==null?void 0:s.length)>0?`📖 ${s.map(i=>i.displayName).join(", ")} • ⏱️ ${n}h estimated`:e!=null&&e.isSundayReview?"🔄 Weekly review and catch-up day":"📝 Review quiz and flashcards"}
          </p>
        </div>
        ${t?"":`
          <button class="plan-complete-btn" style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; padding: 0.875rem 2rem; border: var(--rule-thin); border-radius: 8px; background: var(--callout-memory-bg); color: var(--callout-memory-border); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; min-height: 48px; white-space: nowrap;">
            ✓ Mark Complete
          </button>
        `}
      </div>
    </div>
  `}function we(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,i=[],a=!1,o=[],r=!1,l=1;function c(){if(i.length>0){const p=i.some(h=>h.includes("|---")),u=h=>h.includes("|---"),v=i.filter(h=>!u(h));if(v.length>0){let h='<table class="cheatsheet-table">';if(p&&v.length>1){const f=v[0].split("|").filter(w=>w.trim()).map(w=>`<th>${A(w.trim())}</th>`).join("");h+=`<thead><tr>${f}</tr></thead><tbody>`;for(let w=1;w<v.length;w++){const x=v[w].split("|").filter(T=>T.trim()).map(T=>`<td>${A(T.trim())}</td>`).join("");h+=`<tr>${x}</tr>`}h+="</tbody></table>"}else{for(const f of v){const w=f.split("|").filter(x=>x.trim()).map(x=>`<td>${A(x.trim())}</td>`).join("");h+=`<tr>${w}</tr>`}h+="</table>"}s.push(h)}}i=[],n=!1}function d(){o.length>0&&(r?s.push(`<ol class="cheatsheet-list" start="${l}">${o.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${o.join("")}</ul>`)),o=[],a=!1,r=!1,l=1}for(const p of t){const u=p.trim();if(u===""){c(),d();continue}if(u.startsWith("|")&&u.endsWith("|")){n||(d(),n=!0),i.push(u);continue}if(u.startsWith("- ")||u.startsWith("* ")){c(),(!a||r)&&(d(),a=!0,r=!1),o.push(`<li class="cheatsheet-list-item">${A(u.slice(2))}</li>`);continue}const v=u.match(/^(\d+)\.\s+(.+)$/);if(v){c(),(!a||!r)&&(d(),a=!0,r=!0,l=parseInt(v[1],10)),o.push(`<li class="cheatsheet-list-item">${A(v[2])}</li>`);continue}if(u.startsWith(">")){c(),d();const I=u.slice(1).trim();if(I.includes("**Exam Alert")){const q=I.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${A(q)}</p></div>`)}else if(I.includes("**Memory Aid")){const q=I.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${A(q)}</p></div>`)}else if(I.includes("**Prior Test")){const q=I.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${A(q)}</p></div>`)}else if(I.includes("**PG Conflict")){const q=I.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${A(q)}</p></div>`)}else if(I.includes("**See Also")){const q=I.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${A(q)}</p></div>`)}else if(I.includes("**Sergeant Focus")){const q=I.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${A(q)}</p></div>`)}else if(I.includes("**NOTE:**")){const q=I.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${A(q)}</p></div>`)}else if(I.startsWith("**Memory Aid")){const q=I.replace(/\*\*[^*]+\*\*/g,fe=>`<strong>${fe.replace(/\*\*/g,"")}</strong>`);s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${A(q)}</p></div>`)}else s.push(`<blockquote class="cheatsheet-blockquote">${A(I)}</blockquote>`);continue}if(u==="---"||u==="***"||u==="___"){c(),d();continue}const h=u.match(/^# (.+)$/),f=u.match(/^## (.+)$/),w=u.match(/^### (.+)$/),x=u.match(/^#### (.+)$/),T=u.match(/^##### (.+)$/),B=u.match(/^###### (.+)$/);if(h){c(),d(),s.push(`<h1 class="cheatsheet-h1">${A(h[1])}</h1>`);continue}if(f){c(),d(),s.push(`<h2 class="cheatsheet-h2">${A(f[1])}</h2>`);continue}if(w){c(),d(),s.push(`<h3 class="cheatsheet-h3">${A(w[1])}</h3>`);continue}if(x){c(),d(),s.push(`<h4 class="cheatsheet-h4">${A(x[1])}</h4>`);continue}if(T||B){c(),d(),s.push(`<p class="cheatsheet-paragraph"><strong>${A(T?T[1]:B[1])}</strong></p>`);continue}c(),d(),s.push(`<p class="cheatsheet-paragraph">${A(u)}</p>`)}return c(),d(),s.join("")}function A(e){if(!e)return"";let t=e;return t=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}const Pt="nypd_bookmarks";function Z(){const e=localStorage.getItem(Pt);if(e)try{const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{}return[]}function Fe(e){localStorage.setItem(Pt,JSON.stringify(e))}function Cs(){return Z()}function Ls(e){const t=Z();if(t.some(n=>n.id===e.id))return null;const s={...e,addedAt:new Date().toISOString()};return t.push(s),Fe(t),s}function Ot(e){const t=Z(),s=t.filter(n=>n.id!==e);return s.length===t.length?!1:(Fe(s),!0)}function ot(e){return Z().some(s=>s.id===e)}function zs(){return Z()}function Ds(e){Fe(e)}const Ft="nypd_highlights";function ee(){const e=localStorage.getItem(Ft);if(e)try{const t=JSON.parse(e);return Array.isArray(t)?t:[]}catch{}return[]}function Qe(e){localStorage.setItem(Ft,JSON.stringify(e))}function Ms(){return ee()}function Bs(e){return ee().filter(s=>s.chapterId===e)}function Hs(e){const t=ee(),s={...e,createdAt:new Date().toISOString()};return t.push(s),Qe(t),s}function Qt(e){const t=ee(),s=t.filter(n=>n.id!==e);return s.length===t.length?!1:(Qe(s),!0)}function _s(){return ee()}function Rs(e){Qe(e)}let _="study",W=null;function me(e){const t=e==null?void 0:e.id;if(!t||!E.data){window.location.hash="home";return}const s=E.data.chapters.find(a=>a.id===t);if(!s){window.location.hash="home";return}R=!1,X="",L&&(clearTimeout(L),L=null),K(),z([{label:"Home",route:"home"},{label:`${s.sectionNum} — ${s.title}`}]);const n=document.getElementById("content");if(!n)return;n.innerHTML=`
    <h1>${s.sectionNum} — ${s.title}</h1>

    <div class="tab-bar">
      <div class="tab ${_==="study"?"active":""}" data-tab="study">Study</div>
      <div class="tab ${_==="quick-quiz"?"active":""}" data-tab="quick-quiz">Quick Quiz</div>
      <div class="tab ${_==="quiz"?"active":""}" data-tab="quiz">Quiz</div>
      <div class="tab ${_==="terms"?"active":""}" data-tab="terms">Key Terms</div>
    </div>

    <div id="chapter-body" style="margin-top: 1.5rem;"></div>
  `,n.querySelectorAll(".tab").forEach(a=>{a.addEventListener("click",()=>{_=a.getAttribute("data-tab")||"study",me(e)})});const i=document.getElementById("chapter-body");if(i)switch(_){case"study":Ns(s,i);break;case"quick-quiz":Wt(s,i);break;case"quiz":jt(s,i);break;case"terms":Vs(s,i);break}}function Ns(e,t){t.innerHTML=we(e.readme);const s=e.sections.map(i=>we(i.content)).join('<hr style="margin: 2rem 0; border: none; border-top: var(--rule);">');t.innerHTML+=s,Ps(e,t);const n=de(e.id);n!=null&&n.lastScrollPosition&&n.lastScrollPosition>0&&(window.addEventListener("load",()=>{window.scrollTo({top:n.lastScrollPosition,behavior:"auto"})},{once:!0}),setTimeout(()=>{window.scrollTo({top:n.lastScrollPosition,behavior:"auto"})},200)),Os(e.id,t)}function Ps(e,t){t.querySelectorAll("h2, h3").forEach(i=>{var d;if(i.querySelector(".bookmark-btn"))return;const a=((d=i.textContent)==null?void 0:d.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""))||"",o=ke(e,i.textContent||""),r=`${e.id}-${o}-${a}`,l=ot(r),c=document.createElement("button");c.className=`bookmark-btn ${l?"bookmarked":""}`,c.innerHTML=l?"★":"☆",c.setAttribute("aria-label",l?"Remove bookmark":"Add bookmark"),c.dataset.bookmarkId=r,c.dataset.chapterId=e.id,c.dataset.chapterTitle=e.title,c.dataset.sectionFilename=o,c.dataset.sectionTitle=i.textContent||"",i.style.position="relative",i.appendChild(c),c.addEventListener("click",p=>{p.stopPropagation(),rt(c)})}),Fs(e,t),je(e,t),t.querySelectorAll(".callout").forEach(i=>{if(i.querySelector(".bookmark-btn"))return;const a=i.querySelector(".callout-title"),o=(a==null?void 0:a.textContent)||"callout";let r=i;for(;r&&!r.matches("h2, h3");)r=r.previousElementSibling;const l=(r==null?void 0:r.textContent)||"Unknown Section",c=ke(e,l),d=`${o.toLowerCase().replace(/\s+/g,"-")}`,p=`${e.id}-${c}-${d}`,u=ot(p),v=i.querySelector("p"),h=(v==null?void 0:v.textContent)||"",f=document.createElement("button");f.className=`bookmark-btn callout-bookmark-btn ${u?"bookmarked":""}`,f.innerHTML=u?"★":"☆",f.setAttribute("aria-label",u?"Remove bookmark":"Add bookmark"),f.dataset.bookmarkId=p,f.dataset.chapterId=e.id,f.dataset.chapterTitle=e.title,f.dataset.sectionFilename=c,f.dataset.sectionTitle=l,f.dataset.calloutText=h,i.appendChild(f),f.addEventListener("click",w=>{w.stopPropagation(),rt(f)})})}function ke(e,t){var n;const s=t.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");for(const i of e.sections){const a=i.filename.replace("section-","").replace(".md","");if(a.includes(s)||s.includes(a))return i.filename}return((n=e.sections[0])==null?void 0:n.filename)||`${e.id}.md`}function rt(e){const t=e.dataset.bookmarkId,s=e.dataset.chapterId,n=e.dataset.chapterTitle,i=e.dataset.sectionFilename,a=e.dataset.sectionTitle,o=e.dataset.calloutText;if(!t||!s||!n||!i||!a)return;e.classList.contains("bookmarked")?(Ot(t),e.classList.remove("bookmarked"),e.innerHTML="☆",e.setAttribute("aria-label","Add bookmark")):(Ls({id:t,chapterId:s,chapterTitle:n,sectionFilename:i,sectionTitle:a,calloutText:o||void 0}),e.classList.add("bookmarked"),e.innerHTML="★",e.setAttribute("aria-label","Remove bookmark"))}function Os(e,t){t.querySelectorAll("h1, h2").forEach(i=>{i.addEventListener("click",()=>{var o;const a=i.id||((o=i.textContent)==null?void 0:o.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""));a&&ne(e,a,window.scrollY)})});const n=()=>{W&&clearTimeout(W),W=setTimeout(()=>{ne(e,void 0,window.scrollY)},250)};window.addEventListener("scroll",n,{passive:!0}),window.addEventListener("beforeunload",()=>{W&&clearTimeout(W),ne(e,void 0,window.scrollY)})}let D=null,$e=null,R=!1,ce=!1,X="",P=null,L=null,O=null,F=null,H=!1;typeof window<"u"&&(window.__resetHighlightState=()=>{if(R=!1,ce=!1,X="",H=!1,L&&(clearTimeout(L),L=null),P&&(document.removeEventListener("selectionchange",P),P=null),O){const e=document.getElementById("chapter-body");e&&e.removeEventListener("mouseup",O),O=null}F&&(document.removeEventListener("click",F,!0),F=null),D&&D()});function Fs(e,t){const s=document.getElementById("chapter-body");if(!s)return;$e=t,P&&document.removeEventListener("selectionchange",P),O&&document.removeEventListener("mouseup",O,!0),F&&document.removeEventListener("click",F,!0),L&&(clearTimeout(L),L=null),R=!1,X="",P=()=>{L&&clearTimeout(L),L=setTimeout(()=>{if(H)return;H=!0;const i=document.getSelection();if(!(i==null?void 0:i.toString().trim()))R=!1,H=!1;else if(R)H=!1;else if(i!=null&&i.rangeCount&&i.rangeCount>0){const o=i.getRangeAt(0);s.contains(o.commonAncestorContainer)?ct(e):H=!1}else H=!1},100)},document.addEventListener("selectionchange",P),O=i=>{s.contains(i.target)&&!R&&!H&&ct(e)},s.addEventListener("mouseup",O),F=i=>{if(!ce)return;const a=i.target;!a.closest(".highlight-toolbar")&&!a.closest(".highlight-popover")&&!a.closest(".hl-yellow")&&K()},document.addEventListener("click",F,!0);const n=D;D=()=>{ce=!1,n&&n()}}function ct(e){var h,f;const t=window.getSelection();if(!t||t.rangeCount===0)return;const s=t.getRangeAt(0),n=document.getElementById("chapter-body");if(!n||!n.contains(s.commonAncestorContainer)){K();return}let i=s.startContainer;if(i.nodeType!==Node.TEXT_NODE)for(;i&&i.nodeType!==Node.TEXT_NODE;)i=i.firstChild;if(!i)return;const a=((f=(h=i.textContent)==null?void 0:h.substring(s.startOffset,s.endOffset))==null?void 0:f.trim())||"";if(!a){K();return}let o=s.startContainer;for(;o&&o.nodeType!==Node.ELEMENT_NODE;)o=o.parentNode;if(!o)return;let r="unknown",l=o;for(;l&&!l.matches("h1, h2");)l=l.previousElementSibling;l&&(r=ke(e,l.textContent||""));const c=i.textContent||"",d=s.startOffset,p=s.endOffset,u=c.substring(Math.max(0,d-40),d),v=c.substring(p,Math.min(c.length,p+40));X=a,Qs(s,()=>{try{const w=Hs({id:Ws(),chapterId:e.id,sectionFilename:r,text:X,contextBefore:u,contextAfter:v,color:"yellow"});K(),t.removeAllRanges(),je(e,$e);const x=$e.querySelector(`[data-highlight-id="${w.id}"]`);x&&x.scrollIntoView({behavior:"smooth",block:"center"})}catch(w){console.error("[handleTextSelection] error in callback:",w)}})}function Qs(e,t){D&&D();const s=document.createElement("div");s.className="highlight-toolbar";const n=document.createElement("button");n.className="highlight-toolbar-btn",n.innerHTML='<span class="highlight-color-swatch"></span>Highlight',D=()=>{s&&s.parentNode&&s.remove(),D=null},n.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),t()}),s.appendChild(n);const i=e.getBoundingClientRect();s.style.left=`${i.left+i.width/2-50}px`,s.style.top=`${i.top-45}px`,document.body.appendChild(s),R=!0,setTimeout(()=>{ce=!0},100)}function K(){D&&D(),R=!1}function je(e,t){const s=Bs(e.id);if(s.length===0)return;const n=[];function i(a,o){if(a.nodeType===Node.TEXT_NODE){const r=a.textContent||"";r.trim()&&n.push({node:a,text:r,parent:o})}else if(a.nodeType===Node.ELEMENT_NODE){const r=a;if(r.matches("mark, .bookmark-btn, .highlight-toolbar, .highlight-popover"))return;for(const l of r.childNodes)i(l,r)}}i(t,t);for(const a of s)js(n,a)}function js(e,t){var n,i,a,o;const s=t.contextBefore+t.text+t.contextAfter;for(const{node:r,text:l}of e){const c=l.indexOf(s);if(c===-1)continue;const d=c+t.contextBefore.length,p=d+t.text.length;if(d<0||p>l.length||d>=p)continue;const u=((n=r.textContent)==null?void 0:n.length)||0;if(p>u)continue;const v=document.createRange();if(v.setStart(r,d),v.setEnd(r,p),(i=r.parentNode)!=null&&i.matches("mark.hl-yellow"))return;const h=document.createElement("mark");h.className="hl-yellow",h.dataset.highlightId=t.id;try{v.surroundContents(h),h.addEventListener("click",f=>{f.stopPropagation(),lt(h,t)});return}catch(f){console.warn("Failed to wrap highlight (context match):",f)}}for(const{node:r,text:l}of e){const c=l.indexOf(t.text);if(c===-1||c<0||c+t.text.length>l.length)continue;const d=((a=r.textContent)==null?void 0:a.length)||0;if(c+t.text.length>d)continue;if((o=r.parentNode)!=null&&o.matches("mark.hl-yellow"))return;const p=document.createRange();try{p.setStart(r,c),p.setEnd(r,c+t.text.length);const u=document.createElement("mark");u.className="hl-yellow",u.dataset.highlightId=t.id,p.surroundContents(u),u.addEventListener("click",v=>{v.stopPropagation(),lt(u,t)});return}catch(u){console.warn("Failed to wrap highlight (text match):",u)}}}function lt(e,t){var o;const s=document.querySelector(".highlight-popover");s&&s.remove();const n=document.createElement("div");n.className="highlight-popover",n.innerHTML=`
    <button class="highlight-popover-btn">Remove highlight</button>
  `;const i=e.getBoundingClientRect();n.style.left=`${i.left}px`,n.style.top=`${i.bottom+5}px`,document.body.appendChild(n),(o=n.querySelector(".highlight-popover-btn"))==null||o.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),Qt(t.id),e.replaceWith(e.textContent),n.remove();const l=document.getElementById("chapter-body");if(l&&E.data){const c=E.data.chapters.find(d=>d.id===t.chapterId);c&&je(c,l)}});const a=r=>{const l=r.target;!n.contains(l)&&l!==e&&(n.remove(),document.removeEventListener("click",a))};setTimeout(()=>{document.addEventListener("click",a)},0)}function Ws(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}let k=null;function jt(e,t){if(!e.questions||e.questions.length===0){t.innerHTML="<p>No practice questions available for this chapter.</p>";return}k={questions:e.questions,currentIndex:0,answers:[],selectedAnswer:null,showResults:!1,score:0,chapterId:e.id,chapterTitle:e.title},t.innerHTML=`
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>${e.title} - Quiz</h2>
        <p class="quiz-subtitle">${e.questions.length} questions</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${100/e.questions.length}%"></div>
        </div>
        <span class="quiz-progress-text">Question 1 of ${e.questions.length}</span>
      </div>

      <div id="chapter-quiz-body"></div>
    </div>
  `,We()}function Ys(e,t){const s=e.questions.filter(a=>a.type==="mc"&&a.options&&a.options.length>0&&a.answer),n=Math.min(t,s.length);return s.sort(()=>Math.random()-.5).slice(0,n)}let y=null;function Wt(e,t){if(!e.questions||e.questions.length===0){t.innerHTML="<p>No practice questions available for this chapter.</p>";return}if(e.questions.filter(a=>a.type==="mc"&&a.options&&a.options.length>0&&a.answer).length===0){t.innerHTML="<p>No multiple-choice questions available for this chapter.</p>";return}y||(y={questions:Ys(e,10),currentIndex:0,answers:[],selectedAnswer:null,showResults:!1,score:0,chapterId:e.id,chapterTitle:e.title});const n=y.questions.length,i=n<10?`${n} questions (all available MC questions)`:`${n} questions`;t.innerHTML=`
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>${e.title} - Quick Quiz</h2>
        <p class="quiz-subtitle">${i}</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${100/n}%"></div>
        </div>
        <span class="quiz-progress-text">Question 1 of ${n}</span>
      </div>

      <div id="chapter-quick-quiz-body"></div>
    </div>
  `,Ye()}function We(){var o;const e=document.getElementById("chapter-quiz-body");if(!e||!k)return;const t=k.questions[k.currentIndex],s=(k.currentIndex+1)/k.questions.length*100,n=document.querySelector(".quiz-progress-fill"),i=document.querySelector(".quiz-progress-text");n&&(n.style.width=`${s}%`),i&&(i.textContent=`Question ${k.currentIndex+1} of ${k.questions.length}`),e.innerHTML=`
    <div class="quiz-question-card">
      <div class="question-number">Question ${k.currentIndex+1}</div>
      <p class="question-text">${t.text}</p>

      <div class="quiz-options">
        ${((o=t.options)==null?void 0:o.map((r,l)=>`
          <button
            class="quiz-option ${k.selectedAnswer===l?"selected":""}"
            data-index="${l}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65+l)}</span>
            <span class="quiz-option-text">${r}</span>
          </button>
        `).join(""))||"<p>No options available</p>"}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${k.selectedAnswer===null?"disabled":""}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `,e.querySelectorAll(".quiz-option").forEach(r=>{r.addEventListener("click",()=>{const l=parseInt(r.getAttribute("data-index")||"0");k.selectedAnswer=l,We()})});const a=document.getElementById("submit-answer");a==null||a.addEventListener("click",Us)}function Us(){if(!k||k.selectedAnswer===null)return;const e=k.questions[k.currentIndex],t=e.answer?e.answer.charCodeAt(0)-65:-1,s=k.selectedAnswer===t;k.answers.push(k.selectedAnswer),s&&k.score++,s&&V(async()=>{const{markChapterComplete:n}=await Promise.resolve().then(()=>he);return{markChapterComplete:n}},void 0).then(({markChapterComplete:n})=>{n(k.chapterId)}),k.currentIndex++,k.selectedAnswer=null,k.currentIndex>=k.questions.length?Gs():We()}function Gs(){var n,i;const e=document.getElementById("chapter-quiz-body");if(!e||!k)return;const t=Math.round(k.score/k.questions.length*100),s=t>=70;e.innerHTML=`
    <div class="quiz-results-card">
      <div class="results-header ${s?"passed":"failed"}">
        <div class="results-icon">${s?"✓":"!"}</div>
        <h2>${s?"Great Job!":"Keep Studying"}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${k.score}/${k.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${t}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${k.questions.map((a,o)=>{const r=k.answers[o],l=a.answer?a.answer.charCodeAt(0)-65:-1,c=r===l;return`
            <div class="review-item ${c?"correct":"incorrect"}">
              <div class="review-indicator">${c?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${a.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${r!==null&&a.options?a.options[r]:"No answer"}</strong>
                  ${c?"":`<br>Correct answer: <strong>${a.options?a.options[l]:"N/A"}</strong>`}
                </p>
              </div>
            </div>
          `}).join("")}
      </div>

      <div class="quiz-actions">
        <button class="quiz-btn quiz-btn-primary" id="retry-quiz">
          Retry Quiz
        </button>
        <button class="quiz-btn" id="back-study">
          Back to Study
        </button>
      </div>
    </div>
  `,V(async()=>{const{updateQuizScore:a}=await Promise.resolve().then(()=>he);return{updateQuizScore:a}},void 0).then(({updateQuizScore:a})=>{a(k.chapterId,t,k.questions.length)}),(n=document.getElementById("retry-quiz"))==null||n.addEventListener("click",()=>{k=null,jt({...k,questions:k.questions},document.getElementById("chapter-body"))}),(i=document.getElementById("back-study"))==null||i.addEventListener("click",()=>{var o;_="study";const a=(o=E.data)==null?void 0:o.chapters.find(r=>r.id===(k==null?void 0:k.chapterId));a&&me({id:a.id})})}function Ye(){var o;const e=document.getElementById("chapter-quick-quiz-body");if(!e||!y)return;const t=y.questions[y.currentIndex],s=(y.currentIndex+1)/y.questions.length*100,n=document.querySelector(".quiz-progress-fill"),i=document.querySelector(".quiz-progress-text");n&&(n.style.width=`${s}%`),i&&(i.textContent=`Question ${y.currentIndex+1} of ${y.questions.length}`),e.innerHTML=`
    <div class="quiz-question-card">
      <div class="question-number">Question ${y.currentIndex+1}</div>
      <p class="question-text">${t.text}</p>

      <div class="quiz-options">
        ${((o=t.options)==null?void 0:o.map((r,l)=>`
          <button
            class="quiz-option ${y.selectedAnswer===l?"selected":""}"
            data-index="${l}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65+l)}</span>
            <span class="quiz-option-text">${r}</span>
          </button>
        `).join(""))||"<p>No options available</p>"}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-quick-quiz-answer"
          ${y.selectedAnswer===null?"disabled":""}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `,e.querySelectorAll(".quiz-option").forEach(r=>{r.addEventListener("click",()=>{const l=parseInt(r.getAttribute("data-index")||"0");y.selectedAnswer=l,Ye()})});const a=document.getElementById("submit-quick-quiz-answer");a==null||a.addEventListener("click",Ks)}function Ks(){if(!y||y.selectedAnswer===null)return;const e=y.questions[y.currentIndex],t=e.answer?e.answer.charCodeAt(0)-65:-1,s=y.selectedAnswer===t;y.answers.push(y.selectedAnswer),s&&y.score++,y.currentIndex++,y.selectedAnswer=null,y.currentIndex>=y.questions.length?Js():Ye()}function Js(){var n,i;const e=document.getElementById("chapter-quick-quiz-body");if(!e||!y)return;const t=Math.round(y.score/y.questions.length*100),s=t>=70;e.innerHTML=`
    <div class="quiz-results-card">
      <div class="results-header ${s?"passed":"failed"}">
        <div class="results-icon">${s?"✓":"!"}</div>
        <h2>${s?"Great Job!":"Keep Studying"}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${y.score}/${y.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${t}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${y.questions.map((a,o)=>{const r=y.answers[o],l=a.answer?a.answer.charCodeAt(0)-65:-1,c=r===l;return`
            <div class="review-item ${c?"correct":"incorrect"}">
              <div class="review-indicator">${c?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${a.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${r!==null&&a.options?a.options[r]:"No answer"}</strong>
                  ${c?"":`<br>Correct answer: <strong>${a.options?a.options[l]:"N/A"}</strong>`}
                </p>
              </div>
            </div>
          `}).join("")}
      </div>

      <div class="quiz-actions">
        <button class="quiz-btn quiz-btn-primary" id="retry-quick-quiz">
          Take Again
        </button>
        <button class="quiz-btn" id="back-study-quick">
          Back to Study
        </button>
      </div>
    </div>
  `,V(async()=>{const{updateQuizScore:a}=await Promise.resolve().then(()=>he);return{updateQuizScore:a}},void 0).then(({updateQuizScore:a})=>{a(y.chapterId,t,y.questions.length,"quick-quiz-chapter")}),(n=document.getElementById("retry-quick-quiz"))==null||n.addEventListener("click",()=>{var r;const a=y==null?void 0:y.chapterId;y=null;const o=(r=E.data)==null?void 0:r.chapters.find(l=>l.id===a);o&&Wt(o,document.getElementById("chapter-body"))}),(i=document.getElementById("back-study-quick"))==null||i.addEventListener("click",()=>{var o;_="study";const a=(o=E.data)==null?void 0:o.chapters.find(r=>r.id===(y==null?void 0:y.chapterId));a&&me({id:a.id})})}function Vs(e,t){t.innerHTML=`
    <h2>Key Terms</h2>
    ${we(e.keyTerms||"_No key terms for this chapter._")}
  `}let S=null;function Yt(){z([{label:"Home",route:"home"},{label:"Quick Quiz"}]);const e=document.getElementById("content");!e||!E.data||(S={questions:Xs(10),currentIndex:0,answers:[],selectedAnswer:null,showResults:!1,score:0},e.innerHTML=`
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
  `,Ue())}function Xs(e){if(!E.data)return[];const t=[];return E.data.chapters.forEach(n=>{var i;(i=n.questions)==null||i.forEach(a=>{t.push({...a,chapterId:n.id})})}),t.sort(()=>Math.random()-.5).slice(0,e)}function Ue(){const e=document.getElementById("quiz-body");if(!e||!S)return;const t=S.questions[S.currentIndex],s=(S.currentIndex+1)/S.questions.length*100,n=document.querySelector(".quiz-progress-fill"),i=document.querySelector(".quiz-progress-text");n&&(n.style.width=`${s}%`),i&&(i.textContent=`Question ${S.currentIndex+1} of ${S.questions.length}`),e.innerHTML=`
    <div class="quiz-question-card">
      <div class="question-number">Question ${S.currentIndex+1}</div>
      <p class="question-text">${t.text}</p>

      <div class="quiz-options">
        ${t.options.map((o,r)=>`
          <button
            class="quiz-option ${S.selectedAnswer===r?"selected":""}"
            data-index="${r}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65+r)}</span>
            <span class="quiz-option-text">${o}</span>
          </button>
        `).join("")}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${S.selectedAnswer===null?"disabled":""}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `,e.querySelectorAll(".quiz-option").forEach(o=>{o.addEventListener("click",()=>{const r=parseInt(o.getAttribute("data-index")||"0");S.selectedAnswer=r,Ue()})});const a=document.getElementById("submit-answer");a==null||a.addEventListener("click",Zs)}function Zs(){if(!S||S.selectedAnswer===null)return;const e=S.questions[S.currentIndex],t=e.answer?e.answer.charCodeAt(0)-65:-1,s=S.selectedAnswer===t;S.answers.push(S.selectedAnswer),s&&S.score++,s&&e.chapterId&&Le(e.chapterId),S.currentIndex++,S.selectedAnswer=null,S.currentIndex>=S.questions.length?en():Ue()}function en(){var i,a;const e=document.getElementById("quiz-body");if(!e||!S)return;const t=Math.round(S.score/S.questions.length*100),s=t>=70;e.innerHTML=`
    <div class="quiz-results-card">
      <div class="results-header ${s?"passed":"failed"}">
        <div class="results-icon">${s?"✓":"!"}</div>
        <h2>${s?"Great Job!":"Keep Studying"}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${S.score}/${S.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${t}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${S.questions.map((o,r)=>{const l=S.answers[r],c=o.answer?o.answer.charCodeAt(0)-65:-1,d=l===c;return`
            <div class="review-item ${d?"correct":"incorrect"}">
              <div class="review-indicator">${d?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${o.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${l!==null?o.options[l]:"No answer"}</strong>
                  ${d?"":`<br>Correct answer: <strong>${o.options[c]}</strong>`}
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
  `,new Set(S.questions.filter(o=>o.chapterId).map(o=>o.chapterId)).forEach(o=>{ue(o,t,S.questions.length)}),(i=document.getElementById("retry-quiz"))==null||i.addEventListener("click",()=>{Yt()}),(a=document.getElementById("back-home"))==null||a.addEventListener("click",()=>{window.location.hash="home"})}let g=null,ie=null;const tn=10800*1e3;function Ut(){z([{label:"Home",route:"home"},{label:"Practice Exam"}]);const e=document.getElementById("content");!e||!E.data||(g={questions:sn(),answers:[],currentIndex:0,startTime:null,endTime:null,showResults:!1,flagged:[]},e.innerHTML=`
    <div class="exam-container">
      <div class="exam-header">
        <h1>Practice Exam</h1>
        <div class="exam-timer" id="exam-timer">
          <span class="timer-label">Time Remaining:</span>
          <span class="timer-value" id="timer-display">3:00:00</span>
        </div>
      </div>

      <div class="exam-info">
        <span class="exam-question-count">Question <span id="current-q-num">1</span> of ${g.questions.length}</span>
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
  `,nn(),te(),Ge(),an())}function sn(){var t;if(!E.data)return[];const e=[];return E.data.chapters.forEach(s=>{var n;(n=s.questions)==null||n.forEach(i=>{e.push({...i,chapterId:s.id})})}),(t=E.data.examQuestions)==null||t.forEach(s=>{e.push({...s,number:e.length+1})}),e.sort(()=>Math.random()-.5)}function nn(){const e=document.getElementById("prev-question"),t=document.getElementById("next-question"),s=document.getElementById("flag-question"),n=document.getElementById("submit-exam");e==null||e.addEventListener("click",()=>se(-1)),t==null||t.addEventListener("click",()=>se(1)),s==null||s.addEventListener("click",()=>{if(!g)return;const i=g.currentIndex,a=g.flagged.indexOf(i);a===-1?g.flagged.push(i):g.flagged.splice(a,1),te(),Ge(),Jt()}),n==null||n.addEventListener("click",cn),document.addEventListener("keydown",i=>{i.target instanceof HTMLInputElement||i.target instanceof HTMLTextAreaElement||(i.key==="ArrowLeft"?se(-1):i.key==="ArrowRight"?se(1):i.key==="f"?s==null||s.click():i.key>="1"&&i.key<="4"&&Kt(parseInt(i.key)-1))})}function an(){g&&(g.startTime=Date.now(),ie=window.setInterval(()=>{if(!g||!g.startTime)return;const e=Date.now()-g.startTime,t=tn-e;if(t<=0){Gt(),ln();return}on(t)},1e3))}function Gt(){ie!==null&&(clearInterval(ie),ie=null)}function on(e){const t=document.getElementById("timer-display");if(!t)return;const s=Math.floor(e/1e3),n=Math.floor(s/3600),i=Math.floor(s%3600/60),a=s%60;t.textContent=`${n}:${i.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}`,e<300*1e3?t.style.color="var(--error)":e<900*1e3&&(t.style.color="var(--warning)")}function te(){const e=document.getElementById("exam-body");if(!e||!g)return;const t=g.questions[g.currentIndex],s=g.answers[g.currentIndex]??null,n=g.flagged.includes(g.currentIndex);e.innerHTML=`
    <div class="exam-question-card">
      <div class="question-header">
        <span class="question-number">Question ${g.currentIndex+1}</span>
        ${n?'<span class="flag-badge">⚑ Flagged</span>':""}
      </div>
      <p class="question-text">${t.text}</p>

      <div class="exam-options">
        ${t.options.map((i,a)=>`
          <button
            class="exam-option ${s===a?"selected":""}"
            data-index="${a}"
          >
            <span class="option-letter">${String.fromCharCode(65+a)}</span>
            <span class="option-text">${i}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `,e.querySelectorAll(".exam-option").forEach(i=>{i.addEventListener("click",()=>{const a=parseInt(i.getAttribute("data-index")||"0");Kt(a)})}),rn(),Jt()}function Kt(e){g&&(g.answers[g.currentIndex]=e,te(),Ge())}function se(e){if(!g)return;const t=g.currentIndex+e;t>=0&&t<g.questions.length&&(g.currentIndex=t,te())}function rn(){if(!g)return;const e=document.getElementById("prev-question"),t=document.getElementById("next-question");if(e&&(e.disabled=g.currentIndex===0),t){const s=g.currentIndex===g.questions.length-1;t.textContent=s?"Finish →":"Next →"}}function Jt(){if(!g)return;const e=document.getElementById("current-q-num"),t=document.getElementById("answered-count"),s=document.getElementById("flagged-count");e&&(e.textContent=(g.currentIndex+1).toString()),t&&(t.textContent=g.answers.filter(n=>n!=null).length.toString()),s&&(s.textContent=g.flagged.length.toString())}function Ge(){const e=document.getElementById("question-palette");!e||!g||(e.innerHTML=g.questions.map((t,s)=>{const n=g.answers[s]!==null&&g.answers[s]!==void 0,i=g.flagged.includes(s),a=s===g.currentIndex;let o="palette-item";return a&&(o+=" current"),n&&(o+=" answered"),i&&(o+=" flagged"),`<button class="${o}" data-index="${s}">${s+1}</button>`}).join(""),e.querySelectorAll(".palette-item").forEach(t=>{t.addEventListener("click",()=>{const s=parseInt(t.getAttribute("data-index")||"0");g&&(g.currentIndex=s,te())})}))}function cn(){if(!g)return;const e=g.answers.filter(n=>n!=null).length,t=g.questions.length,s=t-e;if(s>0){if(!confirm(`You have ${s} unanswered question(s).

Score: ${e}/${t} (${Math.round(e/t*100)}%)

Are you sure you want to submit?`))return}else if(!confirm(`Submit exam with all ${t} questions answered?`))return;Vt()}function ln(){alert("Time is up! Submitting your exam..."),Vt()}function Vt(){if(!g)return;Gt(),g.endTime=Date.now(),g.showResults=!0;let e=0;const t=[];g.questions.forEach((s,n)=>{const i=g.answers[n]??null,a=s.answer?s.answer.charCodeAt(0)-65:-1,o=i===a;o&&e++,t.push({question:s,userAnswer:i,correct:o})}),dn(e,t)}function dn(e,t){var l,c;const s=document.getElementById("exam-body");if(!s||!g)return;const n=Math.round(e/g.questions.length*100),i=n>=70,a=g.endTime&&g.startTime?Math.floor((g.endTime-g.startTime)/1e3):0,o=Math.floor(a/3600),r=Math.floor(a%3600/60);s.innerHTML=`
    <div class="exam-results-card">
      <div class="results-header ${i?"passed":"failed"}">
        <div class="results-icon">${i?"✓":"!"}</div>
        <h2>${i?"Congratulations!":"Keep Studying"}</h2>
        <p class="results-subtitle">${i?"You passed the practice exam":"You need 70% to pass"}</p>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${e}/${g.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${n}%</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${o}h ${r}m</div>
          <div class="stat-label">Time Taken</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${t.map((d,p)=>{const u=d.userAnswer!==null?d.question.options[d.userAnswer]:"No answer",v=d.question.answer?d.question.answer.charCodeAt(0)-65:-1,h=d.question.options[v];return`
            <div class="review-item ${d.correct?"correct":"incorrect"}">
              <div class="review-indicator">${d.correct?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${p+1}. ${d.question.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${u}</strong>
                  ${d.correct?"":`<br>Correct answer: <strong>${h}</strong>`}
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
  `,(l=document.getElementById("retry-exam"))==null||l.addEventListener("click",()=>{Ut()}),(c=document.getElementById("back-home-exam"))==null||c.addEventListener("click",()=>{window.location.hash="home"})}let m=null;function Ke(){z([{label:"Home",route:"home"},{label:"Flashcards"}]);const e=document.getElementById("content");if(!e||!E.data)return;const t=[];if(E.data.chapters.forEach(d=>{d.keyTerms&&un(d.keyTerms).forEach((u,v)=>{const h=`${d.id}-${v}`,f=It(h);t.push({id:h,term:u.name,definition:u.definition,chapterId:d.id,chapterTitle:d.title,stage:f.stage,nextReview:f.nextReview})})}),t.length===0){e.innerHTML=`
      <div class="empty-state">
        <h1>No Flashcards Available</h1>
        <p>Flashcards will be generated from key terms in your chapters.</p>
      </div>
    `;return}const s=Date.now(),i=((d="all")=>t.map((p,u)=>({card:p,idx:u})).filter(({card:p})=>d==="pg"&&!p.chapterId.startsWith("2")||d==="ag"&&!p.chapterId.startsWith("3")?!1:!p.nextReview||p.nextReview<=s).map(({idx:p})=>p))("all"),a=i.length>0?i:t.map((d,p)=>p),o=t.filter(d=>d.chapterId.startsWith("2")).length,r=t.filter(d=>d.chapterId.startsWith("3")).length;m={cards:t,sessionCards:a,currentIndex:0,flipped:!1,known:[],learning:[],sessionStart:a.length,sessionCorrect:0,filter:"all"};const l=t.length,c=a.length;e.innerHTML=`
    <div class="flashcards-container">
      <div class="flashcards-header">
        <h1>Flashcards</h1>
        <p class="flashcards-subtitle">Leitner spaced repetition system</p>
      </div>

      <div class="flashcards-filter">
        <button class="fc-filter-btn ${m.filter==="all"?"active":""}" data-filter="all">
          All (${l})
        </button>
        <button class="fc-filter-btn ${m.filter==="pg"?"active":""}" data-filter="pg">
          P.G. Procedures (${o})
        </button>
        <button class="fc-filter-btn ${m.filter==="ag"?"active":""}" data-filter="ag">
          A.G. Procedures (${r})
        </button>
      </div>

      <div class="flashcards-stats">
        <div class="fc-stat">
          <div class="fc-stat-value">${l}</div>
          <div class="fc-stat-label">Total Cards</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="due-count">${c}</div>
          <div class="fc-stat-label">Due Now</div>
        </div>
        <div class="fc-stat">
          <div class="fc-stat-value" id="mastered-count">0</div>
          <div class="fc-stat-label">Mastered (Stage 5)</div>
        </div>
      </div>

      <div class="flashcards-session" ${c===0?'style="opacity:0.5"':""}>
        <p class="session-info">
          ${c>0?`📚 ${c} cards due for review`:"✓ All cards reviewed! Showing full deck."}
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
        <span id="card-counter">1 / ${a.length}</span>
        <span id="session-progress">Session: 0 correct</span>
      </div>
    </div>
  `,pn(),hn(),j()}function un(e){const t=[],s=e.split(`
`);for(const n of s){const i=n.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/);i&&t.push({name:i[1].trim(),definition:i[2].trim()})}return t}function pn(){const e=document.getElementById("flashcard"),t=document.getElementById("flip-card"),s=document.getElementById("prev-card"),n=document.getElementById("next-card"),i=document.getElementById("know-btn"),a=document.getElementById("learning-btn");e==null||e.addEventListener("click",()=>{m.flipped=!m.flipped,ae()}),t==null||t.addEventListener("click",()=>{m.flipped=!m.flipped,ae()}),s==null||s.addEventListener("click",()=>{m&&m.currentIndex>0&&(m.currentIndex--,m.flipped=!1,j())}),n==null||n.addEventListener("click",()=>{m&&m.currentIndex<m.sessionCards.length-1&&(m.currentIndex++,m.flipped=!1,j())}),i==null||i.addEventListener("click",()=>{if(!m)return;const o=m.sessionCards[m.currentIndex],r=m.cards[o],l=Math.min(r.stage+1,5);ye(r.id,l),m.sessionCorrect++,m.known.push(m.currentIndex),Ee(),dt()}),a==null||a.addEventListener("click",()=>{if(!m)return;const o=m.sessionCards[m.currentIndex],r=m.cards[o];ye(r.id,1),m.learning.push(m.currentIndex),Ee(),dt()}),document.addEventListener("keydown",o=>{if(!(o.target instanceof HTMLInputElement))switch(o.key){case" ":case"Enter":o.preventDefault(),m.flipped=!m.flipped,ae();break;case"ArrowLeft":m&&m.currentIndex>0&&(m.currentIndex--,m.flipped=!1,j());break;case"ArrowRight":m&&m.currentIndex<m.sessionCards.length-1&&(m.currentIndex++,m.flipped=!1,j());break;case"k":i==null||i.click();break;case"l":a==null||a.click();break}})}function hn(){document.querySelectorAll(".fc-filter-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-filter");if(!m||!t)return;m.filter=t,document.querySelectorAll(".fc-filter-btn").forEach(i=>i.classList.remove("active")),e.classList.add("active");const s=Date.now(),n=m.cards.map((i,a)=>({card:i,idx:a})).filter(({card:i})=>t==="pg"&&!i.chapterId.startsWith("2")||t==="ag"&&!i.chapterId.startsWith("3")?!1:!i.nextReview||i.nextReview<=s).map(({idx:i})=>i);m.sessionCards=n.length>0?n:m.cards.map((i,a)=>a).filter(i=>{const a=m.cards[i];return!(t==="pg"&&!a.chapterId.startsWith("2")||t==="ag"&&!a.chapterId.startsWith("3"))}),m.currentIndex=0,m.flipped=!1,Ke()})})}function j(){if(!m)return;const e=m.sessionCards[m.currentIndex],t=m.cards[e],s=document.getElementById("card-chapter"),n=document.getElementById("card-term"),i=document.getElementById("card-definition"),a=document.getElementById("card-stage"),o=document.getElementById("card-counter"),r=document.getElementById("session-progress");s&&(s.textContent=t.chapterTitle),n&&(n.textContent=t.term),i&&(i.textContent=t.definition),a&&(a.textContent=`Stage ${t.stage}/5`),o&&(o.textContent=`${m.currentIndex+1} / ${m.sessionCards.length}`),r&&(r.textContent=`Session: ${m.sessionCorrect} correct`),ae(),Ee()}function ae(){const e=document.getElementById("flashcard");!e||!m||(m.flipped?e.classList.add("flipped"):e.classList.remove("flipped"))}function Ee(){if(!m)return;const e=document.getElementById("mastered-count"),t=document.getElementById("due-count"),s=m.cards.filter(a=>a.stage>=5).length,n=Date.now(),i=m.cards.filter(a=>!a.nextReview||a.nextReview<=n).length;e&&(e.textContent=s.toString()),t&&(t.textContent=i.toString())}function dt(){m&&(m.currentIndex<m.sessionCards.length-1?(m.currentIndex++,m.flipped=!1,j()):mn())}function mn(){var a,o;const e=document.getElementById("content");if(!e||!m)return;const t=m.sessionCards.length,s=m.sessionCorrect,n=t>0?Math.round(s/t*100):0;e.innerHTML=`
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
  `;const i=document.getElementById("summary-mastered");i&&(i.textContent=m.cards.filter(r=>r.stage>=5).length.toString()),(a=document.getElementById("restart-cards"))==null||a.addEventListener("click",Ke),(o=document.getElementById("back-home-fc"))==null||o.addEventListener("click",()=>{window.location.hash="home"})}function fn(){var n;z([{label:"Home",route:"home"},{label:"Cheat Sheet"}]);const e=document.getElementById("content");if(!e)return;const t=((n=E.data)==null?void 0:n.cheatSheet)||"",s=gn(t);e.innerHTML=`
    <div class="cheatsheet-container">
      <div class="cheatsheet-header">
        <h1>Quick Reference Cheat Sheet</h1>
        <p class="cheatsheet-subtitle">Essential tables, timeframes, and memory aids for the Sergeant Exam</p>
      </div>

      <nav class="cheatsheet-nav">
        <details class="cheatsheet-toc">
          <summary>📑 Jump to Section</summary>
          <div class="cheatsheet-toc-list">
            ${s.map((i,a)=>`
              <a href="#section-${a}" class="cheatsheet-toc-link">${i.title}</a>
            `).join("")}
          </div>
        </details>
      </nav>

      <div class="cheatsheet-content">
        ${s.map((i,a)=>vn(i,a)).join("")}
      </div>
    </div>
  `,document.querySelectorAll(".cheatsheet-toc-link").forEach(i=>{i.addEventListener("click",a=>{var l;a.preventDefault();const o=(l=i.getAttribute("href"))==null?void 0:l.slice(1),r=document.getElementById(o||"");r==null||r.scrollIntoView({behavior:"smooth",block:"start"})})})}function gn(e){const t=[],s=e.split(`
`);let n=null;for(const i of s){const a=i.match(/^## (.+)$/);a?(n&&t.push(n),n={title:a[1],content:""}):n&&(n.content+=i+`
`)}return n&&t.push(n),t}function vn(e,t){const s=yn(e.content);return`
    <section id="section-${t}" class="cheatsheet-section">
      <h2 class="cheatsheet-section-title">
        <span class="cheatsheet-section-number">${String(t+1).padStart(2,"0")}</span>
        ${e.title}
      </h2>
      <div class="cheatsheet-section-content">
        ${s}
      </div>
    </section>
  `}function yn(e){if(!e)return"";const t=e.split(`
`),s=[];let n=!1,i=[],a=!1,o=[],r=!1,l=1;function c(){if(i.length>0){const p=i.some(h=>h.includes("|---")),u=h=>h.includes("|---"),v=i.filter(h=>!u(h));if(v.length>0){let h='<table class="cheatsheet-table">';if(p&&v.length>1){const f=v[0].split("|").filter(w=>w.trim()).map(w=>`<th>${C(w.trim())}</th>`).join("");h+=`<thead><tr>${f}</tr></thead><tbody>`;for(let w=1;w<v.length;w++){const x=v[w].split("|").filter(T=>T.trim()).map(T=>`<td>${C(T.trim())}</td>`).join("");h+=`<tr>${x}</tr>`}h+="</tbody></table>"}else{for(const f of v){const w=f.split("|").filter(x=>x.trim()).map(x=>`<td>${C(x.trim())}</td>`).join("");h+=`<tr>${w}</tr>`}h+="</table>"}s.push(h)}}i=[],n=!1}function d(){o.length>0&&(r?s.push(`<ol class="cheatsheet-list" start="${l}">${o.join("")}</ol>`):s.push(`<ul class="cheatsheet-list">${o.join("")}</ul>`)),o=[],a=!1,r=!1,l=1}for(const p of t){const u=p.trim();if(u===""){c(),d();continue}if(u.startsWith("|")&&u.endsWith("|")){n||(d(),n=!0),i.push(u);continue}if(u.startsWith("- ")||u.startsWith("* ")){c(),(!a||r)&&(d(),a=!0,r=!1),o.push(`<li class="cheatsheet-list-item">${C(u.slice(2))}</li>`);continue}const v=u.match(/^(\d+)\.\s+(.+)$/);if(v){c(),(!a||!r)&&(d(),a=!0,r=!0,l=parseInt(v[1],10)),o.push(`<li class="cheatsheet-list-item">${C(v[2])}</li>`);continue}if(u.startsWith(">")){c(),d();const h=u.slice(1).trim();if(h.includes("**Exam Alert")){const f=h.replace(/\*\*Exam Alert[^*]*\*\*/g,"");s.push(`<div class="callout callout-exam"><div class="callout-title">Exam Alert</div><p>${C(f)}</p></div>`)}else if(h.includes("**Memory Aid")){const f=h.replace(/\*\*Memory Aid[^*]*\*\*/g,"");s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${C(f)}</p></div>`)}else if(h.includes("**Prior Test")){const f=h.replace(/\*\*Prior Test[^*]*\*\*/g,"");s.push(`<div class="callout callout-prior"><div class="callout-title">Prior Test</div><p>${C(f)}</p></div>`)}else if(h.includes("**PG Conflict")){const f=h.replace(/\*\*PG Conflict[^*]*\*\*/g,"");s.push(`<div class="callout callout-conflict"><div class="callout-title">PG Conflict</div><p>${C(f)}</p></div>`)}else if(h.includes("**See Also")){const f=h.replace(/\*\*See Also[^*]*\*\*/g,"");s.push(`<div class="callout callout-seealso"><div class="callout-title">See Also</div><p>${C(f)}</p></div>`)}else if(h.includes("**Sergeant Focus")){const f=h.replace(/\*\*Sergeant Focus[^*]*\*\*/g,"");s.push(`<div class="callout callout-sergeant"><div class="callout-title">Sergeant Focus</div><p>${C(f)}</p></div>`)}else if(h.includes("**NOTE:**")){const f=h.replace(/\*\*NOTE:\*\*/g,"");s.push(`<div class="callout callout-note"><div class="callout-title">Note</div><p>${C(f)}</p></div>`)}else h.startsWith("**Memory Aid")?s.push(`<div class="callout callout-memory"><div class="callout-title">Memory Aid</div><p>${C(h)}</p></div>`):s.push(`<blockquote class="cheatsheet-blockquote">${C(h)}</blockquote>`);continue}if(u==="---"||u==="***"||u==="___"){c(),d();continue}c(),d(),s.push(`<p class="cheatsheet-paragraph">${C(u)}</p>`)}return c(),d(),s.join("")}function C(e){if(!e)return"";let t=e;return t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>"),t=t.replace(/`([^`]+)`/g,"<code>$1</code>"),t}let G="browse",b=null;function Je(){z([{label:"Home",route:"home"},{label:"Sergeant Focus"}]);const e=document.getElementById("content");if(!e||!E.data)return;const t=E.data.chapters.filter(i=>i.sergeantFocus&&i.sergeantFocus.length>0),s=t.reduce((i,a)=>i+a.sergeantFocus.length,0);e.innerHTML=`
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
          <div class="stat-value">${s}</div>
          <div class="stat-label">Callouts</div>
        </div>
      </div>

      <div class="tab-bar">
        <div class="tab ${G==="browse"?"active":""}" data-tab="browse">Browse</div>
        <div class="tab ${G==="quiz"?"active":""}" data-tab="quiz">Quiz</div>
      </div>

      <div id="sergeant-body" style="margin-top: 1.5rem;"></div>
    </div>
  `,e.querySelectorAll(".tab").forEach(i=>{i.addEventListener("click",()=>{G=i.getAttribute("data-tab")||"browse",Je()})});const n=document.getElementById("sergeant-body");n&&(G==="quiz"?Xt(n):wn(n,t))}function bn(e,t){const s=e.match(/section-(\d{3})-(?:0?(\d+)|([a-z0-9-]+))\.md/);if(!s)return{displayName:`P.G. ${t}`,sourceType:"PG"};const n=s[1],i=s[2]||s[3],a=n.startsWith("2")?"PG":"AG";return{displayName:`${a==="PG"?"P.G.":"A.G."} ${n}-${i}`,sourceType:a}}function wn(e,t){const s=`
    <div class="sergeant-focus-controls">
      <button class="expand-collapse-btn" id="expand-all">Expand All</button>
      <button class="expand-collapse-btn" id="collapse-all">Collapse All</button>
    </div>

    <div class="sergeant-focus-content">
      ${t.map((a,o)=>Sn(a,o)).join("")}
    </div>
  `;e.innerHTML=s;const n=document.getElementById("expand-all"),i=document.getElementById("collapse-all");n==null||n.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!0})}),i==null||i.addEventListener("click",()=>{document.querySelectorAll(".sergeant-focus-details").forEach(a=>{a.open=!1})})}function kn(){return E.data?E.data.chapters.filter(e=>e.sergeantFocus&&e.sergeantFocus.length>0):[]}function $n(e){const t=kn(),s=[];return t.forEach(i=>{var a;(a=i.questions)==null||a.forEach(o=>{o.type==="mc"&&o.options&&o.options.length>0&&o.answer&&s.push({...o,chapterId:i.id})})}),s.sort(()=>Math.random()-.5).slice(0,e)}function Xt(e){if(b||(b={questions:$n(15),currentIndex:0,answers:[],selectedAnswer:null,showResults:!1,score:0}),b.questions.length===0){e.innerHTML="<p>No questions available for Sergeant Focus chapters.</p>";return}const t=(b.currentIndex+1)/b.questions.length*100;e.innerHTML=`
    <div class="quiz-container">
      <div class="quiz-header">
        <h2>Sergeant Focus Quiz</h2>
        <p class="quiz-subtitle">${b.questions.length} questions from supervisor callout chapters</p>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${t}%"></div>
        </div>
        <span class="quiz-progress-text">Question ${b.currentIndex+1} of ${b.questions.length}</span>
      </div>

      <div id="sergeant-quiz-body"></div>
    </div>
  `,Ve()}function Ve(){var o;const e=document.getElementById("sergeant-quiz-body");if(!e||!b)return;const t=b.questions[b.currentIndex],s=(b.currentIndex+1)/b.questions.length*100,n=document.querySelector(".quiz-progress-fill"),i=document.querySelector(".quiz-progress-text");n&&(n.style.width=`${s}%`),i&&(i.textContent=`Question ${b.currentIndex+1} of ${b.questions.length}`),e.innerHTML=`
    <div class="quiz-question-card">
      <div class="question-number">Question ${b.currentIndex+1}</div>
      <p class="question-text">${t.text}</p>

      <div class="quiz-options">
        ${((o=t.options)==null?void 0:o.map((r,l)=>`
          <button
            class="quiz-option ${b.selectedAnswer===l?"selected":""}"
            data-index="${l}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65+l)}</span>
            <span class="quiz-option-text">${r}</span>
          </button>
        `).join(""))||"<p>No options available</p>"}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${b.selectedAnswer===null?"disabled":""}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `,e.querySelectorAll(".quiz-option").forEach(r=>{r.addEventListener("click",()=>{const l=parseInt(r.getAttribute("data-index")||"0");b.selectedAnswer=l,Ve()})});const a=document.getElementById("submit-answer");a==null||a.addEventListener("click",En)}function En(){if(!b||b.selectedAnswer===null)return;const e=b.questions[b.currentIndex],t=e.answer?e.answer.charCodeAt(0)-65:-1,s=b.selectedAnswer===t;b.answers.push(b.selectedAnswer),s&&b.score++,b.currentIndex++,b.selectedAnswer=null,b.currentIndex>=b.questions.length?xn():Ve()}function xn(){var i,a;const e=document.getElementById("sergeant-quiz-body");if(!e||!b)return;const t=Math.round(b.score/b.questions.length*100),s=t>=70;e.innerHTML=`
    <div class="quiz-results-card">
      <div class="results-header ${s?"passed":"failed"}">
        <div class="results-icon">${s?"✓":"!"}</div>
        <h2>${s?"Great Job!":"Keep Studying"}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${b.score}/${b.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${t}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${b.questions.map((o,r)=>{const l=b.answers[r],c=o.answer?o.answer.charCodeAt(0)-65:-1,d=l===c;return`
            <div class="review-item ${d?"correct":"incorrect"}">
              <div class="review-indicator">${d?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${o.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${l!==null&&o.options?o.options[l]:"No answer"}</strong>
                  ${d?"":`<br>Correct answer: <strong>${o.options[c]}</strong>`}
                </p>
              </div>
            </div>
          `}).join("")}
      </div>

      <div class="quiz-actions">
        <button class="quiz-btn quiz-btn-primary" id="retry-quiz">
          Take Again
        </button>
        <button class="quiz-btn" id="back-browse">
          Back to Browse
        </button>
      </div>
    </div>
  `,new Set(b.questions.filter(o=>o.chapterId).map(o=>o.chapterId)).forEach(o=>{ue(o,t,b.questions.length,"sergeant-focus")}),(i=document.getElementById("retry-quiz"))==null||i.addEventListener("click",()=>{b=null,Xt(document.getElementById("sergeant-body"))}),(a=document.getElementById("back-browse"))==null||a.addEventListener("click",()=>{G="browse",Je()})}function Sn(e,t){return`
    <section class="sergeant-focus-chapter">
      <details class="sergeant-focus-details" ${t<3?"open":""}>
        <summary class="sergeant-focus-summary">
          <span class="chapter-num">${e.sectionNum}</span>
          <span class="chapter-title">${e.title}</span>
          <span class="callout-count">${e.sergeantFocus.length} callout${e.sergeantFocus.length!==1?"s":""}</span>
          <span class="expand-icon">+</span>
        </summary>
        <div class="sergeant-focus-callouts">
          ${e.sergeantFocus.map(n=>{const i=bn(n.filename,e.sectionNum);return`
              <div class="callout callout-sergeant">
                <div class="sergeant-focus-header-row">
                  <div class="callout-title">Sergeant Focus</div>
                  <span class="source-badge source-${i.sourceType.toLowerCase()}">${i.displayName}</span>
                </div>
                <p>${n.text}</p>
              </div>
            `}).join("")}
        </div>
      </details>
    </section>
  `}function In(){z([{label:"Home",route:"home"},{label:"Weak Areas"}]);const e=document.getElementById("content");if(!e||!E.data)return;const s=qn().sort((n,i)=>n.percentage-i.percentage);e.innerHTML=`
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
                  <span class="wa-score-label">${Tn(n.percentage)}</span>
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
  `,e.querySelectorAll("[data-chapter]").forEach(n=>{n.addEventListener("click",()=>{const i=n.getAttribute("data-chapter");window.location.hash=`chapter/${i}`})}),e.querySelectorAll("[data-chapter-quiz]").forEach(n=>{n.addEventListener("click",()=>{window.location.hash="quiz"})})}function qn(){if(!E.data)return[];const e=[];return E.data.chapters.forEach(t=>{var l;const s=de(t.id),n=(s==null?void 0:s.quizHistory)||[];let i=0,a=0,o=n.length;o>0?n.forEach(c=>{i+=c.correctAnswers,a+=c.totalQuestions}):(a=((l=t.questions)==null?void 0:l.length)||0,i=0,o=0);const r=a>0?Math.round(i/a*100):0;e.push({chapterId:t.id,chapterTitle:t.title,sectionNum:t.sectionNum,correctAnswers:i,totalQuestions:a,percentage:r,quizAttempts:o})}),e.filter(t=>t.quizAttempts>0||t.totalQuestions>0)}function Tn(e){return e>=90?"Excellent":e>=80?"Good":e>=70?"Passing":e>=50?"Review":"Critical"}function An(){z([{label:"Home",route:"home"},{label:"Search"}]);const e=document.getElementById("content");!e||!E.data||(e.innerHTML=`
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
  `,Cn())}function Cn(){const e=document.getElementById("search-input");e&&(e.addEventListener("input",t=>{const s=t.target.value.trim();if(s.length<2){pt();return}Ln(s)}),document.addEventListener("keydown",t=>{if(t.key==="Escape"){const s=document.getElementById("search-input");s&&(s.value="",pt(),s.blur())}}))}function Ln(e){if(!E.data)return;const t=[],s=e.toLowerCase();E.data.chapters.forEach(n=>{var i,a;n.title.toLowerCase().includes(s)&&t.push({type:"chapter",title:n.title,chapterId:n.id,chapterTitle:n.title,matchCount:1}),(i=n.sections)==null||i.forEach(o=>{if(o.content.toLowerCase().includes(s)){const r=zn(o.content,s);t.push({type:"section",title:`${n.title} - ${o.filename}`,chapterId:n.id,chapterTitle:n.title,snippet:r,matchCount:Dn(o.content,s)})}}),n.keyTerms&&Mn(n.keyTerms).forEach(r=>{(r.name.toLowerCase().includes(s)||r.definition.toLowerCase().includes(s))&&t.push({type:"keyterm",title:r.name,chapterId:n.id,chapterTitle:n.title,snippet:r.definition,matchCount:1})}),(a=n.questions)==null||a.forEach(o=>{o.text.toLowerCase().includes(s)&&t.push({type:"question",title:`Question ${o.number}`,chapterId:n.id,chapterTitle:n.title,snippet:o.text,matchCount:1})})}),t.sort((n,i)=>i.matchCount-n.matchCount),Bn(t.slice(0,50))}function zn(e,t,s=150){const i=e.toLowerCase().indexOf(t);if(i===-1)return e.slice(0,s)+"...";const a=Math.max(0,i-50),o=Math.min(e.length,i+s),r=a>0?"...":"",l=o<e.length?"...":"";return r+e.slice(a,o).trim()+l}function Dn(e,t){const s=new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),n=e.match(s);return n?n.length:0}function Mn(e){const t=[],s=e.split(`
`);for(const n of s){const i=n.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/);i&&t.push({name:i[1].trim(),definition:i[2].trim()})}return t}function Bn(e){const t=document.getElementById("search-results"),s=document.getElementById("search-stats"),n=document.getElementById("results-count");if(!(!t||!s||!n)){if(s.style.display="block",n.textContent=`${e.length} result${e.length!==1?"s":""}`,e.length===0){t.innerHTML=`
      <div class="empty-state">
        <h2>No Results Found</h2>
        <p>Try different keywords or check your spelling.</p>
      </div>
    `;return}t.innerHTML=e.map(i=>`
    <div class="search-result-item ${i.type}" data-chapter="${i.chapterId}">
      <div class="result-header">
        <span class="result-type-badge">${i.type}</span>
        <span class="result-chapter">${i.chapterTitle}</span>
      </div>
      <h3 class="result-title">${ut(i.title)}</h3>
      ${i.snippet?`<p class="result-snippet">${ut(Hn(i.snippet))}</p>`:""}
    </div>
  `).join(""),t.querySelectorAll(".search-result-item").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-chapter");window.location.hash=`chapter/${a}`})})}}function ut(e){const t=document.getElementById("search-input");if(!t||!t.value)return e;const s=t.value.trim(),n=new RegExp(`(${_n(s)})`,"gi");return e.replace(n,"<mark>$1</mark>")}function Hn(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function _n(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function pt(){const e=document.getElementById("search-results"),t=document.getElementById("search-stats");e&&(e.innerHTML=""),t&&(t.style.display="none")}let $=null;function Rn(){z([{label:"Home",route:"home"},{label:"Diagnostic Test"}]);const e=document.getElementById("content");if(!(!e||!E.data)){if(e.innerHTML=`
    <div class="diagnostic-container">
      <div class="diagnostic-header">
        <h1>Diagnostic Test</h1>
        <p class="diagnostic-subtitle">30-question baseline assessment to identify your strengths and weaknesses</p>
      </div>

      <div class="diagnostic-info">
        <p>This test covers all 29 chapters. Your results will:</p>
        <ul>
          <li>Identify areas where you need more study</li>
          <li>Set up your flashcard review schedule</li>
          <li>Establish a baseline for tracking progress</li>
        </ul>
      </div>

      <div id="diagnostic-body"></div>
    </div>
  `,$={questions:Nn(30),currentIndex:0,answers:[],selectedAnswer:null,showResults:!1,score:0},$.questions.length===0){const t=document.getElementById("diagnostic-body");t&&(t.innerHTML="<p>No questions available for diagnostic test.</p>");return}Pn()}}function Nn(e){if(!E.data)return[];const t=[];E.data.chapters.forEach(c=>{var d;(d=c.questions)==null||d.forEach(p=>{p.type==="mc"&&p.options&&p.options.length>0&&p.answer&&t.push({...p,chapterId:c.id})})});const s=t.length,n=[],i=[...t],a=new Map;t.forEach(c=>{c.chapterId&&a.set(c.chapterId,(a.get(c.chapterId)||0)+1)});const o=new Map;let r=0;a.forEach((c,d)=>{const p=Math.round(c/s*e);o.set(d,p),r+=p});const l=e-r;if(l!==0){const c=Array.from(a.keys());for(let d=0;d<Math.abs(l);d++){const p=d%c.length,u=o.get(c[p])||0;o.set(c[p],l>0?u+1:Math.max(0,u-1))}}if(a.forEach((c,d)=>{const p=i.filter(f=>f.chapterId===d),u=o.get(d)||0,v=p.sort(()=>Math.random()-.5);n.push(...v.slice(0,u));const h=i.findIndex(f=>f.chapterId===d);h>=0&&i.splice(h,u)}),n.length<e){const c=i.sort(()=>Math.random()-.5).slice(0,e-n.length);n.push(...c)}return n.sort(()=>Math.random()-.5)}function Pn(){const e=document.getElementById("diagnostic-body");if(!e||!$)return;const t=($.currentIndex+1)/$.questions.length*100;e.innerHTML=`
    <div class="quiz-container">
      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${t}%"></div>
        </div>
        <span class="quiz-progress-text">Question ${$.currentIndex+1} of ${$.questions.length}</span>
      </div>

      <div id="diagnostic-quiz-body"></div>
    </div>
  `,Xe()}function Xe(){var o;const e=document.getElementById("diagnostic-quiz-body");if(!e||!$)return;const t=$.questions[$.currentIndex],s=($.currentIndex+1)/$.questions.length*100,n=document.querySelector(".quiz-progress-fill"),i=document.querySelector(".quiz-progress-text");n&&(n.style.width=`${s}%`),i&&(i.textContent=`Question ${$.currentIndex+1} of ${$.questions.length}`),e.innerHTML=`
    <div class="quiz-question-card">
      <div class="question-number">Question ${$.currentIndex+1}</div>
      <p class="question-text">${t.text}</p>

      <div class="quiz-options">
        ${((o=t.options)==null?void 0:o.map((r,l)=>`
          <button
            class="quiz-option ${$.selectedAnswer===l?"selected":""}"
            data-index="${l}"
          >
            <span class="quiz-option-letter">${String.fromCharCode(65+l)}</span>
            <span class="quiz-option-text">${r}</span>
          </button>
        `).join(""))||"<p>No options available</p>"}
      </div>

      <div class="quiz-actions">
        <button
          class="quiz-btn quiz-btn-submit"
          id="submit-answer"
          ${$.selectedAnswer===null?"disabled":""}
        >
          Submit Answer
        </button>
      </div>
    </div>
  `,e.querySelectorAll(".quiz-option").forEach(r=>{r.addEventListener("click",()=>{const l=parseInt(r.getAttribute("data-index")||"0");$.selectedAnswer=l,Xe()})});const a=document.getElementById("submit-answer");a==null||a.addEventListener("click",On)}function On(){if(!$||$.selectedAnswer===null)return;const e=$.questions[$.currentIndex],t=e.answer?e.answer.charCodeAt(0)-65:-1,s=$.selectedAnswer===t;if($.answers.push($.selectedAnswer),s&&$.score++,e.chapterId){const n=`diagnostic-${e.chapterId}-${e.number}`;At(n,s)}$.currentIndex++,$.selectedAnswer=null,$.currentIndex>=$.questions.length?Fn():Xe()}function Fn(){var i;const e=document.getElementById("diagnostic-quiz-body");if(!e||!$)return;const t=Math.round($.score/$.questions.length*100),s=t>=70;e.innerHTML=`
    <div class="quiz-results-card">
      <div class="results-header ${s?"passed":"failed"}">
        <div class="results-icon">${s?"✓":"!"}</div>
        <h2>${s?"Good Start!":"Baseline Established"}</h2>
      </div>

      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${$.score}/${$.questions.length}</div>
          <div class="stat-label">Correct Answers</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${t}%</div>
          <div class="stat-label">Score</div>
        </div>
      </div>

      <div class="results-review">
        <h3>Review Answers</h3>
        ${$.questions.map((a,o)=>{const r=$.answers[o],l=a.answer?a.answer.charCodeAt(0)-65:-1,c=r===l;return`
            <div class="review-item ${c?"correct":"incorrect"}">
              <div class="review-indicator">${c?"✓":"✗"}</div>
              <div class="review-content">
                <p class="review-question">${a.text}</p>
                <p class="review-answer">
                  Your answer: <strong>${r!==null&&a.options?a.options[r]:"No answer"}</strong>
                  ${c?"":`<br>Correct answer: <strong>${a.options[l]}</strong>`}
                </p>
              </div>
            </div>
          `}).join("")}
      </div>

      <div class="quiz-actions">
        <button class="quiz-btn quiz-btn-primary" id="back-home">
          Back to Home
        </button>
      </div>
    </div>
  `,new Set($.questions.filter(a=>a.chapterId).map(a=>a.chapterId)).forEach(a=>{ue(a,t,$.questions.length,"diagnostic")}),Tt(),(i=document.getElementById("back-home"))==null||i.addEventListener("click",()=>{window.location.hash="home"})}function oe(){z([{label:"Home",route:"home"},{label:"Study Schedule"}]);const e=document.getElementById("content");if(!e)return;const t=He(),s=_e();e.innerHTML=`
    <div class="schedule-container">
      <div class="schedule-header">
        <h1>Study Schedule</h1>
        <p class="schedule-subtitle">
          ${t?"Your personalized study plan based on exam date":"Set your exam date to generate a study plan"}
        </p>
      </div>

      ${t?jn(t,s):Qn()}
    </div>
  `,Gn()}function Qn(){const e=new Date().toISOString().split("T")[0],t=new Date;return t.setDate(t.getDate()+84),`
    <div class="schedule-setup-card">
      <h2>Set Your Exam Date</h2>
      <p>
        Enter your expected exam date to generate a personalized study schedule.
        The plan will adjust based on how much time you have available.
      </p>

      <div class="date-input-group">
        <label for="exam-date-input">Exam Date</label>
        <input
          type="date"
          id="exam-date-input"
          value="${t.toISOString().split("T")[0]}"
          min="${e}"
        />
        <button class="schedule-btn schedule-btn-primary" id="save-exam-date">
          Generate Schedule
        </button>
      </div>

      <div class="schedule-info-cards">
        <div class="info-card">
          <h3>📅 Daily Plans</h3>
          <p>Each day shows which chapters to study, flashcards to review, and practice questions.</p>
        </div>
        <div class="info-card">
          <h3>🔥 Streak Tracking</h3>
          <p>Complete your daily plan to build and maintain your study streak.</p>
        </div>
        <div class="info-card">
          <h3>📚 Smart Pacing</h3>
          <p>High-priority chapters scheduled first. Review weeks built in before exam.</p>
        </div>
      </div>
    </div>
  `}function jn(e,t){if(!t)return"";const s=bs(e),n=ys(e),i=Ne(),a=new Date().toISOString().split("T")[0],o=Pe(a);return`
    <div class="schedule-status-bar">
      <div class="status-item">
        <span class="status-label">Exam Date</span>
        <span class="status-value">${new Date(e).toLocaleDateString()}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Days Until Exam</span>
        <span class="status-value ${n?"cram-mode":""}">${s}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Mode</span>
        <span class="status-value mode-badge ${n?"cram":"normal"}">
          ${n?"🔥 CRAM":"📚 STANDARD"}
        </span>
      </div>
      <button class="schedule-btn schedule-btn-outline" id="change-exam-date">
        Change Date
      </button>
    </div>

    ${i?Wn(i,o):""}

    <div class="schedule-weeks-container">
      <h2>Weekly Schedule</h2>
      ${t.weeklyPlans.map(r=>Yn(r)).join("")}
    </div>
  `}function Wn(e,t){const s=(e==null?void 0:e.newChapters.map(n=>Be(n)).filter(Boolean))||[];return`
    <div class="daily-plan-card ${t?"complete":""}">
      <div class="plan-header">
        <div>
          <h3>📋 Today's Plan — ${new Date().toLocaleDateString(void 0,{weekday:"long",month:"short",day:"numeric"})}</h3>
          <p class="plan-focus">${(e==null?void 0:e.focus)||"Study Day"}</p>
        </div>
        ${t?'<span class="plan-complete-badge">✓ Complete</span>':""}
      </div>

      <div class="plan-tasks">
        ${s.length>0?`
          <div class="plan-task">
            <span class="task-icon">📖</span>
            <div class="task-content">
              <strong>New Chapters</strong>
              <p>${s.map(n=>n.id.replace("-"," ").toUpperCase()).join(", ")}</p>
              <span class="task-time">${s.reduce((n,i)=>n+i.estHours,0)} hours estimated</span>
            </div>
          </div>
        `:""}

        ${e!=null&&e.reviewQuiz?`
          <div class="plan-task">
            <span class="task-icon">📝</span>
            <div class="task-content">
              <strong>Review Quiz</strong>
              <p>${e.reviewQuiz.questionCount} questions on ${e.reviewQuiz.chapterId.replace("-"," ").toUpperCase()}</p>
            </div>
          </div>
        `:""}

        ${e!=null&&e.isSundayReview?`
          <div class="plan-task">
            <span class="task-icon">🔄</span>
            <div class="task-content">
              <strong>Weekly Review</strong>
              <p>Catch up on missed material and review weak areas</p>
            </div>
          </div>
        `:""}

        ${!(e!=null&&e.newChapters.length)&&!(e!=null&&e.reviewQuiz)&&!(e!=null&&e.isSundayReview)?`
          <div class="plan-task">
            <span class="task-icon">⏸</span>
            <div class="task-content">
              <strong>Rest Day</strong>
              <p>Use this time to rest or catch up if needed</p>
            </div>
          </div>
        `:""}
      </div>

      ${t?"":`
        <button class="schedule-btn schedule-btn-primary plan-complete-btn" data-today="${new Date().toISOString().split("T")[0]}">
          ✓ Mark Today's Plan Complete
        </button>
      `}
    </div>
  `}function Yn(e){return`
    <div class="schedule-week ${e.isReviewWeek?"review-week":""}">
      <div class="week-header">
        <div>
          <h3>Week ${e.weekNumber}: ${e.focus}</h3>
          <p class="week-dates">
            ${new Date(e.startDate).toLocaleDateString()} — ${new Date(e.endDate).toLocaleDateString()}
          </p>
        </div>
        <span class="week-badge">${e.isReviewWeek?"REVIEW":"CONTENT"}</span>
      </div>

      <div class="week-days">
        ${e.dailyPlans.map(t=>Un(t)).join("")}
      </div>
    </div>
  `}function Un(e){const t=e.date===new Date().toISOString().split("T")[0],s=e.newChapters.map(a=>Be(a)).filter(Boolean),i=new Date(e.date).toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"});return`
    <div class="schedule-day ${t?"today":""}">
      <div class="day-header">
        <span class="day-date">${i}</span>
        ${t?'<span class="today-badge">Today</span>':""}
      </div>
      <div class="day-content">
        ${s.length>0?s.map(a=>`<span class="chapter-tag">${a.id.split("-")[0]}</span>`).join(""):e.isSundayReview?'<span class="review-tag">🔄 Review</span>':'<span class="free-tag">Free</span>'}
      </div>
    </div>
  `}function Gn(){const e=document.getElementById("save-exam-date");e&&e.addEventListener("click",()=>{const n=document.getElementById("exam-date-input");if(n!=null&&n.value){const i=new Date(n.value).getTime();Ht(i),oe()}});const t=document.getElementById("change-exam-date");t&&t.addEventListener("click",()=>{oe()});const s=document.querySelector(".plan-complete-btn");s&&s.addEventListener("click",()=>{const n=new Date().toISOString().split("T")[0];Nt(n),oe()})}function Zt(){const e=document.getElementById("content");if(!e)return;const t=Cs(),s=new Map;for(const n of t){const i=s.get(n.chapterId)||[];i.push(n),s.set(n.chapterId,i)}for(const[n,i]of s)i.sort((a,o)=>new Date(o.addedAt).getTime()-new Date(a.addedAt).getTime()),s.set(n,i);e.innerHTML=`
    <h1>Bookmarks</h1>
    <p class="bookmarks-intro">
      Bookmark sections and callouts while studying to quickly return to them later.
    </p>
    ${Kn(s)}
  `,Xn()}function Kn(e){var s,n,i;if(e.size===0)return`
      <div class="bookmarks-empty">
        <div class="empty-icon">☆</div>
        <h2>No bookmarks yet</h2>
        <p>
          While reading a chapter, click the star icon (☆) next to section headings
          or callout blocks to bookmark them for quick access later.
        </p>
      </div>
    `;let t='<div class="bookmarks-list">';for(const[,a]of e){const o=((s=a[0])==null?void 0:s.chapterTitle)||"Unknown Chapter",r=((i=(n=a[0])==null?void 0:n.chapterId.split("-").pop())==null?void 0:i.toUpperCase())||"";t+=`
      <div class="bookmarks-chapter-group">
        <h2 class="bookmarks-chapter-title">${r} — ${o}</h2>
        <ul class="bookmarks-items">
          ${a.map(l=>Jn(l)).join("")}
        </ul>
      </div>
    `}return t+="</div>",t}function Jn(e){const t=Vn(e.addedAt),s=e.calloutText?`<p class="bookmark-callout-snippet">${Y(e.calloutText)}</p>`:"";return`
    <li class="bookmark-item" data-bookmark-id="${Y(e.id)}">
      <div class="bookmark-content" data-chapter-id="${Y(e.chapterId)}">
        <div class="bookmark-header">
          <span class="bookmark-section-title">${Y(e.sectionTitle)}</span>
          <span class="bookmark-time">${t}</span>
        </div>
        ${s}
      </div>
      <button class="bookmark-remove-btn" data-bookmark-id="${Y(e.id)}" aria-label="Remove bookmark">
        ✕
      </button>
    </li>
  `}function Vn(e){const t=Date.now(),s=new Date(e).getTime(),n=t-s,i=Math.floor(n/1e3),a=Math.floor(i/60),o=Math.floor(a/60),r=Math.floor(o/24);return i<60?"Just now":a<60?`${a}m ago`:o<24?`${o}h ago`:r<7?`${r}d ago`:new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function Y(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Xn(){document.querySelectorAll(".bookmark-remove-btn").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const s=e.getAttribute("data-bookmark-id");s&&(Ot(s),Zt())})}),document.querySelectorAll(".bookmark-content").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-chapter-id");t&&Q(`chapter/${t}`)})})}function es(){const e=document.getElementById("content");if(!e)return;const t=Ms(),s=new Map;for(const n of t){const i=s.get(n.chapterId)||[];i.push(n),s.set(n.chapterId,i)}for(const[n,i]of s)i.sort((a,o)=>new Date(o.createdAt).getTime()-new Date(a.createdAt).getTime()),s.set(n,i);e.innerHTML=`
    <h1>Highlights</h1>
    <p class="highlights-intro">
      Highlight text while reading to mark important passages. Click on any highlight to remove it.
    </p>
    ${Zn(s)}
  `,si()}function Zn(e){var s,n,i,a;if(e.size===0)return`
      <div class="highlights-empty">
        <div class="empty-icon">🖍️</div>
        <h2>No highlights yet</h2>
        <p>
          While reading a chapter, select any text to show the highlight toolbar.
          Tap the yellow highlight button to mark the text.
        </p>
      </div>
    `;let t='<div class="highlights-list">';for(const[,o]of e){const r=((n=(s=o[0])==null?void 0:s.chapterId.split("-").pop())==null?void 0:n.toUpperCase())||"",l=((a=(i=o[0])==null?void 0:i.chapterId.split("-").pop())==null?void 0:a.toUpperCase())||"";t+=`
      <div class="highlights-chapter-group">
        <h2 class="highlights-chapter-title">${l} — ${r}</h2>
        <ul class="highlights-items">
          ${o.map(c=>ei(c)).join("")}
        </ul>
      </div>
    `}return t+="</div>",t}function ei(e){const t=ti(e.createdAt);return`
    <li class="highlight-item" data-highlight-id="${N(e.id)}">
      <div class="highlight-content" data-chapter-id="${N(e.chapterId)}">
        <div class="highlight-header">
          <span class="highlight-section-title">${N(e.sectionFilename.replace("section-","").replace(".md",""))}</span>
          <span class="highlight-time">${t}</span>
        </div>
        <blockquote class="highlight-text">
          ${e.contextBefore&&e.contextBefore.length>0?`<span class="highlight-context-before">…${N(e.contextBefore)}</span>`:""}
          <mark class="hl-yellow">${N(e.text)}</mark>
          ${e.contextAfter&&e.contextAfter.length>0?`<span class="highlight-context-after">${N(e.contextAfter)}…</span>`:""}
        </blockquote>
      </div>
      <button class="highlight-remove-btn" data-highlight-id="${N(e.id)}" aria-label="Remove highlight">
        ✕
      </button>
    </li>
  `}function ti(e){const t=Date.now(),s=new Date(e).getTime(),n=t-s,i=Math.floor(n/1e3),a=Math.floor(i/60),o=Math.floor(a/60),r=Math.floor(o/24);return i<60?"Just now":a<60?`${a}m ago`:o<24?`${o}h ago`:r<7?`${r}d ago`:new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function N(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function si(){document.querySelectorAll(".highlight-remove-btn").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const s=e.getAttribute("data-highlight-id");s&&(Qt(s),es())})}),document.querySelectorAll(".highlight-content").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-chapter-id");t&&(Q(`chapter/${t}`),setTimeout(()=>{const s=e.getAttribute("data-highlight-id");if(s){const n=document.querySelector(`[data-highlight-id="${s}"]`);n&&n.scrollIntoView({behavior:"smooth",block:"center"})}},500))})})}async function ni(e={}){var a;const{maxRetries:t=3,retryDelayMs:s=1e3,onProgress:n}=e;if(n==null||n("Loading study data..."),typeof window.STUDY_DATA<"u"&&((a=window.STUDY_DATA)!=null&&a.chapters))return n==null||n("Data loaded successfully"),window.STUDY_DATA;let i=null;for(let o=1;o<=t;o++)try{n==null||n(`Loading data (attempt ${o}/${t})...`);const r=await fetch("./data.js",{cache:"force-cache"});if(!r.ok)throw new Error(`HTTP ${r.status}: ${r.statusText}`);const l=await r.text(),c="window.STUDY_DATA = ",d=l.indexOf(c);if(d===-1)throw new Error("Invalid data.js format: missing window.STUDY_DATA");let p=l.substring(d+c.length).trim(),u=0,v=!1,h=!1,f=-1;for(let x=0;x<p.length;x++){const T=p[x];if(h){h=!1;continue}if(T==="\\"){h=!0;continue}if(T==='"'&&!h){v=!v;continue}if(!v&&(T==="{"&&u++,T==="}"&&(u--,u===0))){f=x+1;break}}if(f===-1)throw new Error("Invalid data.js format: malformed JSON");p=p.substring(0,f);const w=JSON.parse(p);return window.STUDY_DATA=w,n==null||n("Data loaded successfully"),w}catch(r){i=r,console.warn(`Data load attempt ${o} failed:`,r),o<t&&await ii(s)}throw new Error(`Failed to load study data after ${t} attempts: ${i==null?void 0:i.message}`)}function ii(e){return new Promise(t=>setTimeout(t,e))}const ht={network:{title:"Failed to Load Study Data",suggestion:"Check your internet connection and try again."},parse:{title:"Invalid Data Format",suggestion:"The study data file appears to be corrupted."},storage:{title:"Storage Error",suggestion:"Unable to access local storage. Clear browser data and try again."},unknown:{title:"Unexpected Error",suggestion:"Something went wrong. Try refreshing the page."}};function ai(e,t){const s=ht[e.type]||ht.unknown;return`
    <div class="error-recovery-container">
      <div class="error-card">
        <div class="error-icon">⚠️</div>

        <h1 class="error-title">${s.title}</h1>

        <p class="error-message">${s.suggestion}</p>

        ${e.details?`<pre class="error-details">${mt(e.details)}</pre>`:""}

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
            <p><strong>Message:</strong> ${mt(e.message)}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
          </div>
        </details>
      </div>
    </div>
  `}function mt(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function oi(e){const t=document.getElementById("error-retry"),s=document.getElementById("error-clear-cache"),n=document.getElementById("error-home");t==null||t.addEventListener("click",()=>{e()}),s==null||s.addEventListener("click",()=>{localStorage.clear(),sessionStorage.clear(),"caches"in window&&caches.keys().then(i=>{i.forEach(a=>caches.delete(a))}),window.location.reload()}),n==null||n.addEventListener("click",()=>{window.location.hash="home",e()})}function ri(){if(!navigator.onLine){const e=document.createElement("div");e.className="offline-indicator",e.innerHTML="⚠️ You are offline. Some features may be unavailable.";const t=document.getElementById("topbar");t&&t.appendChild(e)}}function ci(){window.addEventListener("online",()=>{const e=document.querySelector(".offline-indicator");e&&e.remove()}),window.addEventListener("offline",()=>{ri()})}const li="nypd_theme",di="nypd_font_scale",ts="nypd_diagnostic_completed_at";function ui(){var s;const e=document.querySelector(".settings-dialog");e&&e.remove();const t=document.createElement("dialog");t.className="settings-dialog",t.innerHTML=`
    <div class="settings-content">
      <div class="settings-header">
        <h2>Settings</h2>
        <button class="settings-close" aria-label="Close">&times;</button>
      </div>

      <div class="settings-section">
        <h3>Backup & Restore</h3>
        <p class="settings-description">
          Export your progress as a backup file, or import a previously exported file.
        </p>

        <div class="settings-actions">
          <button class="settings-btn settings-btn-primary" id="settings-export">
            ⬇ Export Progress
          </button>
          <button class="settings-btn" id="settings-import">
            ⬆ Import Progress
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>Data</h3>
        <p class="settings-description">
          Clear all locally stored progress data. This cannot be undone.
        </p>

        <button class="settings-btn settings-btn-danger" id="settings-clear">
          🗑 Clear All Data
        </button>
      </div>
    </div>
  `,(s=t.querySelector(".settings-close"))==null||s.addEventListener("click",()=>{t.close(),t.remove()}),t.addEventListener("click",n=>{n.target===t&&(t.close(),t.remove())}),document.body.appendChild(t),t.showModal()}function pi(){const e=document.getElementById("settings-export"),t=document.getElementById("settings-import"),s=document.getElementById("settings-clear");e==null||e.addEventListener("click",()=>{hi()}),t==null||t.addEventListener("click",()=>{mi()}),s==null||s.addEventListener("click",()=>{confirm("Are you sure you want to clear all progress data? This cannot be undone.")&&(localStorage.clear(),sessionStorage.clear(),window.location.reload())})}function hi(){const e=Ce(),t=De(),s=zs(),n=_s(),i=ve(),a=J(),o=localStorage.getItem(ts),r={version:"1.0",exportedAt:new Date().toISOString(),nypd_progress:e,nypd_flashcards:t,nypd_bookmarks:s,nypd_highlights:n,nypd_theme:i,nypd_font_scale:a};o&&(r.nypd_diagnostic_completed_at=o);const l=JSON.stringify(r,null,2),c=new Blob([l],{type:"application/json"}),d=URL.createObjectURL(c),p=document.createElement("a"),u=new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);p.href=d,p.download=`sergeant-progress-${u}.json`,document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(d)}function mi(){const e=document.createElement("input");e.type="file",e.accept=".json,application/json",e.addEventListener("change",t=>{var i;const s=(i=t.target.files)==null?void 0:i[0];if(!s)return;const n=new FileReader;n.onload=a=>{var o;try{const r=JSON.parse((o=a.target)==null?void 0:o.result),l=fi(r);if(!l.valid){alert(`Invalid import file: ${l.error}`);return}const c=gi(r);vi(r,c)}catch{alert("Failed to parse JSON file. Please ensure it is a valid export file.")}},n.onerror=()=>{alert("Failed to read file.")},n.readAsText(s)}),e.click()}function fi(e){if(!e.version)return{valid:!1,error:"Missing version field"};if(!e.exportedAt)return{valid:!1,error:"Missing exportedAt field"};if(!e.nypd_progress&&!e.nypd_flashcards&&!e.nypd_bookmarks&&!e.nypd_highlights)return{valid:!1,error:"No progress, flashcard, bookmarks, or highlights data found"};if(e.nypd_theme&&e.nypd_theme!=="light"&&e.nypd_theme!=="dark")return{valid:!1,error:"Invalid theme value"};if(e.nypd_font_scale){const t=Number(e.nypd_font_scale);if(isNaN(t)||t<.8||t>1.4)return{valid:!1,error:"Font scale must be between 0.8 and 1.4"}}return{valid:!0}}function gi(e){var a,o;const t=Ce(),s=De(),n=e.nypd_progress,i=e.nypd_flashcards;return{current:{chaptersWithProgress:((a=t.chapters)==null?void 0:a.length)||0,streak:t.streak||0,flashcardsReviewed:Object.keys(s.cards||{}).length,theme:ve()},imported:{chaptersWithProgress:((o=n==null?void 0:n.chapters)==null?void 0:o.length)||0,streak:(n==null?void 0:n.streak)||0,flashcardsReviewed:Object.keys((i==null?void 0:i.cards)||{}).length,theme:e.nypd_theme||ve()}}}function vi(e,t){var n,i,a;const s=document.createElement("dialog");s.className="settings-dialog import-confirm-dialog",s.innerHTML=`
    <div class="settings-content">
      <div class="settings-header">
        <h2>Confirm Import</h2>
        <button class="settings-close" aria-label="Close">&times;</button>
      </div>

      <p class="settings-description">
        This will replace all current progress with the imported data. Continue?
      </p>

      <div class="import-preview">
        <table>
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Current</th>
              <th>Imported</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chapters with progress</td>
              <td>${t.current.chaptersWithProgress}</td>
              <td>${t.imported.chaptersWithProgress}</td>
            </tr>
            <tr>
              <td>Study streak</td>
              <td>${t.current.streak} days</td>
              <td>${t.imported.streak} days</td>
            </tr>
            <tr>
              <td>Flashcards reviewed</td>
              <td>${t.current.flashcardsReviewed}</td>
              <td>${t.imported.flashcardsReviewed}</td>
            </tr>
            <tr>
              <td>Theme</td>
              <td>${t.current.theme}</td>
              <td>${t.imported.theme}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-actions">
        <button class="settings-btn" id="import-cancel">Cancel</button>
        <button class="settings-btn settings-btn-primary" id="import-confirm">Import Data</button>
      </div>
    </div>
  `,(n=s.querySelector(".settings-close"))==null||n.addEventListener("click",()=>{s.close(),s.remove()}),(i=s.querySelector("#import-cancel"))==null||i.addEventListener("click",()=>{s.close(),s.remove()}),(a=s.querySelector("#import-confirm"))==null||a.addEventListener("click",()=>{yi(e),s.close(),s.remove()}),document.body.appendChild(s),s.showModal()}function yi(e){e.nypd_progress&&yt(e.nypd_progress),e.nypd_flashcards&&St(e.nypd_flashcards),e.nypd_theme&&(localStorage.setItem(li,e.nypd_theme),e.nypd_theme==="dark"?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")),e.nypd_font_scale&&(localStorage.setItem(di,String(e.nypd_font_scale)),document.documentElement.style.setProperty("--font-scale",String(e.nypd_font_scale))),e.nypd_diagnostic_completed_at&&localStorage.setItem(ts,e.nypd_diagnostic_completed_at),e.nypd_bookmarks&&Ds(e.nypd_bookmarks),e.nypd_highlights&&Rs(e.nypd_highlights),alert("Progress imported successfully!"),window.location.reload()}const bi={home:be,"chapter/:id":me,quiz:Yt,exam:Ut,flashcards:Ke,cheatsheet:fn,sergeant:Je,weak:In,search:An,diagnostic:Rn,schedule:oe,bookmarks:Zt,highlights:es},E={currentRoute:"home",currentChapter:null,data:null};async function xe(){const e=document.getElementById("content");e&&(e.innerHTML=`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text" id="loading-status">Loading study data...</p>
      </div>
    `);try{E.data=await ni({maxRetries:3,retryDelayMs:1e3,onProgress:s=>{const n=document.getElementById("loading-status");n&&(n.textContent=s)}}),ns(),is(),os(E.data.chapters),hs(),$i(),ci(),ss(bi,(s,n)=>{E.currentRoute=s,E.currentChapter=(n==null?void 0:n.id)||null}),Ei();const t=window.location.hash.slice(1)||"home";Q(t)}catch(t){const n=wi(t);ki(n)}}function wi(e){const t=e.message.toLowerCase();return t.includes("fetch")||t.includes("network")||t.includes("http")?{type:"network",message:e.message}:t.includes("parse")||t.includes("json")||t.includes("invalid")?{type:"parse",message:e.message}:t.includes("storage")||t.includes("quota")?{type:"storage",message:e.message}:{type:"unknown",message:e.message}}function ki(e){const t=document.getElementById("content");t&&(t.innerHTML=ai(e),oi(()=>xe()))}function $i(){const e=document.getElementById("settings-toggle");e&&e.addEventListener("click",()=>{ui(),setTimeout(()=>pi(),50)})}function Ei(){document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault(),window.location.hash="search";return}if(e.target.tagName!=="INPUT"&&/^[1-4]$/.test(e.key)){const t=new CustomEvent("quiz-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}if(e.target.tagName!=="INPUT"&&(e.key==="n"||e.key==="p")){const t=new CustomEvent("nav-keypress",{detail:{key:e.key}});document.dispatchEvent(t)}if(e.target.tagName!=="INPUT"&&window.location.hash==="#flashcards"){if(e.key==="ArrowLeft"){const t=document.getElementById("prev-card");t==null||t.click()}else if(e.key==="ArrowRight"){const t=document.getElementById("next-card");t==null||t.click()}}if(e.key==="Escape"){const t=document.getElementById("sidebar");t!=null&&t.classList.contains("open")&&t.classList.remove("open")}})}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(t=>{console.error("SW registration failed:",t)})});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",xe):xe();
