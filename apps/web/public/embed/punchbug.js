(function(){"use strict";class oe{constructor(e,t){this.hoveredEl=null,this.highlightOverlay=null,this.onPick=e,this.onCancel=t,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){if(this.clearHighlight(),e.closest("#punchbug-root"))return;this.hoveredEl=e;const t=e.getBoundingClientRect(),i=document.createElement("div");i.id="pb-highlight-overlay",i.setAttribute("data-punchbug-ignore","true"),i.style.cssText=["position:fixed",`top:${t.top}px`,`left:${t.left}px`,`width:${t.width}px`,`height:${t.height}px`,"pointer-events:none","z-index:2147483645","outline:2px solid hsl(348,100%,52%)","outline-offset:2px","border-radius:2px","background:hsla(348,100%,52%,0.07)","box-sizing:border-box"].join(";"),document.body.appendChild(i),this.highlightOverlay=i}clearHighlight(){var e;(e=this.highlightOverlay)==null||e.remove(),this.highlightOverlay=null,this.hoveredEl=null}handleMouseOver(e){const t=e.target;t&&!t.closest("#punchbug-root")&&t!==this.highlightOverlay&&this.highlight(t)}handleMouseOut(e){this.hoveredEl===e.target&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const t=e.target;t&&!t.closest("#punchbug-root")&&t!==this.highlightOverlay&&(this.clearHighlight(),this.stop(),this.onPick({el:t,clientX:e.clientX,clientY:e.clientY,pageX:e.clientX+window.scrollX,pageY:e.clientY+window.scrollY}))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function se(n,e){const t=await fetch(`${n}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const i=await t.json().catch(()=>({}));throw new Error(i.error||"Failed to submit report")}return t.json()}class ae{constructor(e,t){this.screenshotFull="",this.shadow=e,this.opts=t,this.overlay=this.render(t)}setScreenshot(e,t){var a;this.screenshotFull=e;const i=this.shadow.getElementById("pb-sc-loader"),r=this.shadow.getElementById("pb-sc-wrap"),o=this.shadow.getElementById("pb-sc-img");if(!e){i==null||i.remove();return}const s=t||e;o&&(o.src=s),i&&(i.style.display="none"),r&&(r.style.display="block"),e&&((a=this.shadow.getElementById("pb-sc-expand"))==null||a.addEventListener("click",()=>{this.openLightbox(e)}))}render(e){var d;const t=document.createElement("div");t.className="pb-overlay";const i=document.createElement("div");i.className="pb-panel";const r=document.createElement("div");r.className="pb-panel-header",r.innerHTML=`
      <h2 class="pb-panel-title">Report a Task</h2>
      <button class="pb-close-btn" id="pb-close">&#x2715;</button>
    `;const o=document.createElement("div");o.className="pb-panel-body",e.columns.length>0&&`${e.columns.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}`;const s=e.tags.length>0?`<div class="pb-field">
           <label class="pb-label">Tags</label>
           <div class="pb-tags-grid" id="pb-tags">
             ${e.tags.map(c=>`
               <label class="pb-tag-option">
                 <input type="checkbox" class="pb-tag-cb" value="${c.id}" style="display:none" />
                 <span class="pb-tag-pill" data-tag-id="${c.id}"
                       style="background:${c.color}22;color:${c.color};border:1px solid ${c.color}55">
                   ${c.name}
                 </span>
               </label>`).join("")}
           </div>
         </div>`:"";o.innerHTML=`
      <!-- Screenshot loader -->
      <div id="pb-sc-loader" class="pb-sc-loader">
        <span class="pb-sc-spinner"></span>
        <span>Capturing screenshot…</span>
      </div>
      <div id="pb-sc-wrap" style="display:none">
        <div class="pb-screenshot-wrap">
          <img id="pb-sc-img" class="pb-screenshot-preview" alt="Screenshot" />
          <button class="pb-screenshot-expand" id="pb-sc-expand" title="View full screenshot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Environment info -->
      <div class="pb-info-box">
        <div class="pb-info-row">
          <span class="pb-info-icon">&#127760;</span>
          <span class="pb-info-val" style="word-break:break-all">${e.pageUrl}</span>
        </div>
        <div class="pb-info-row">
          <span class="pb-info-icon">&#128187;</span>
          <span class="pb-info-val">${e.browserMeta.browserName} ${e.browserMeta.browserVersion} &bull; ${e.browserMeta.osName} &bull; ${e.browserMeta.screenWidth}&#xd7;${e.browserMeta.screenHeight}</span>
        </div>
        <div class="pb-info-row">
          <span class="pb-info-icon">&#128279;</span>
          <code style="font-size:11px;color:#94a3b8">${e.domInfo.selector}</code>
        </div>
      </div>

      <!-- Form fields -->
      <div id="pb-report-form">
        <div class="pb-field">
          <label class="pb-label" for="pb-title">What happened? <span style="color:hsl(348,100%,52%)">*</span></label>
          <input class="pb-input" id="pb-title" type="text" placeholder="Button not responding, layout broken…" />
        </div>
        <div class="pb-field">
          <label class="pb-label" for="pb-desc">More details</label>
          <textarea class="pb-textarea" id="pb-desc" placeholder="Steps to reproduce, expected vs actual…"></textarea>
        </div>
        <div class="pb-form-row">
          <div class="pb-field" style="margin-bottom:0">
            <label class="pb-label" for="pb-priority">Priority</label>
            <select class="pb-input" id="pb-priority">
              <option value="LOW">Low</option>
              <option value="MEDIUM" selected>Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          ${e.columns.length>0?`<div class="pb-field" style="margin-bottom:0">
            <label class="pb-label" for="pb-column">Column</label>
            <select class="pb-input" id="pb-column">
              ${e.columns.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
          </div>`:"<div></div>"}
        </div>
        ${s}
        <button class="pb-submit-btn" id="pb-submit" style="margin-top:16px">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,i.appendChild(r),i.appendChild(o),t.appendChild(i),this.shadow.appendChild(t);const a=()=>this.close(e.onClose);(d=this.shadow.getElementById("pb-close"))==null||d.addEventListener("click",a),t.addEventListener("click",c=>{c.target===t&&a()}),this.shadow.querySelectorAll(".pb-tag-pill").forEach(c=>{c.style.opacity="0.55",c.addEventListener("click",()=>{const u=this.shadow.querySelector(`.pb-tag-cb[value="${c.dataset.tagId}"]`);u&&(u.checked=!u.checked,c.style.opacity=u.checked?"1":"0.55",c.style.fontWeight=u.checked?"600":"400")})});const l=this.shadow.getElementById("pb-submit");return l==null||l.addEventListener("click",async()=>{var m,k,C;const c=this.shadow.getElementById("pb-title").value.trim();if(!c){this.shadow.getElementById("pb-title").focus();return}const u=this.shadow.getElementById("pb-desc").value.trim(),S=this.shadow.getElementById("pb-priority").value,B=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0,x=e.tags.length>0?Array.from(this.shadow.querySelectorAll(".pb-tag-cb:checked")).map(g=>g.value):[];l.disabled=!0,l.textContent="Submitting…";try{const g=this.screenshotFull.startsWith("http");await se(e.apiUrl,{embedKey:e.embedKey,title:c,description:u||void 0,priority:S,screenshot:g?void 0:this.screenshotFull,screenshotUrl:g?this.screenshotFull:void 0,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:B,tagIds:x.length>0?x:void 0,reporterName:e.reporterName,browserMeta:e.browserMeta,pinX:e.pinX,pinY:e.pinY}),this.shadow.getElementById("pb-report-form").style.display="none",this.shadow.getElementById("pb-success").style.display="block",(m=this.shadow.getElementById("pb-sc-loader"))==null||m.remove(),(k=this.shadow.getElementById("pb-sc-wrap"))==null||k.remove(),(C=e.onSuccess)==null||C.call(e),setTimeout(()=>this.close(),3e3)}catch(g){l.disabled=!1,l.textContent="Submit Task",alert("Failed to submit: "+(g instanceof Error?g.message:"Unknown error"))}}),t}openLightbox(e){const t=document.createElement("div");t.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const r=document.createElement("button");r.className="pb-lightbox-close",r.innerHTML="&#x2715;",r.addEventListener("click",()=>t.remove()),t.addEventListener("click",o=>{o.target===t&&t.remove()}),t.appendChild(r),t.appendChild(i),this.shadow.appendChild(t)}close(e){this.overlay.remove(),e==null||e()}}const z={LOW:"#64748b",MEDIUM:"#f59e0b",HIGH:"#f97316",CRITICAL:"#ef4444"};function A(n){const e=Date.now()-new Date(n).getTime(),t=Math.floor(e/6e4);if(t<1)return"just now";if(t<60)return`${t}m ago`;const i=Math.floor(t/60);return i<24?`${i}h ago`:`${Math.floor(i/24)}d ago`}function p(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}class le{constructor(e){this.overlay=null,this.shadow=e}show(e,t,i,r){var d;this.close();const o=document.createElement("div");o.className="pb-overlay";const s=document.createElement("div");s.className="pb-panel";const a=document.createElement("div");a.className="pb-panel-header",a.innerHTML=`
      <span style="font-size:12px;font-family:monospace;color:var(--pb-text-muted)">#${e.taskNumber}</span>
      <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
    `;const l=document.createElement("div");l.className="pb-panel-body",l.innerHTML=`
      <div class="pb-skeleton" style="height:24px;width:65%"></div>
      <div class="pb-meta-grid">
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
      </div>
      <div>
        <div class="pb-skeleton" style="height:12px;width:80px;margin-bottom:8px"></div>
        <div class="pb-skeleton" style="height:16px;width:100%"></div>
      </div>
      <div class="pb-skeleton" style="height:180px;border-radius:6px"></div>
    `,s.appendChild(a),s.appendChild(l),o.appendChild(s),this.shadow.appendChild(o),this.overlay=o,(d=this.shadow.getElementById("pb-tpanel-close"))==null||d.addEventListener("click",()=>this.close()),o.addEventListener("click",c=>{c.target===o&&this.close()}),fetch(`${i}/api/embed/task/${e.id}?key=${encodeURIComponent(r)}`).then(c=>c.ok?c.json():Promise.reject(c.status)).then(c=>this.renderFull(l,c,t,i,r)).catch(()=>this.renderBasic(l,e,t,i))}renderFull(e,t,i,r,o){var te,ne;const s=z[t.priority]??"#64748b",a=t.creatorName||t.guestName||"Guest",l=t.projectSlug??i,d=t.screenshotUrl?`
      <div>
        <div class="pb-section-header">
          <p class="pb-section-label" style="margin:0">Screenshot</p>
          <button class="pb-expand-text-btn" id="pb-tp-expand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
              <polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            Expand
          </button>
        </div>
        <div class="pb-screenshot-wrap" id="pb-tp-sc-wrap" style="margin-top:8px">
          <img class="pb-screenshot-preview" src="${t.screenshotUrl}" alt="Screenshot" />
        </div>
      </div>`:"",c=[];t.pageUrl&&c.push(`<a href="${t.pageUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
        <span class="pb-badge-outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          ${p(t.pageUrl.replace(/^https?:\/\//,""))}
        </span>
      </a>`),t.browserName&&c.push(`<span class="pb-badge-outline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        ${p(t.browserName)} ${p(t.browserVersion??"")}
      </span>`),t.osName&&c.push(`<span class="pb-badge-outline">${p(t.osName)} ${p(t.osVersion??"")}</span>`),t.screenWidth&&c.push(`<span class="pb-badge-outline">${t.screenWidth}×${t.screenHeight}</span>`),t.deviceType&&c.push(`<span class="pb-badge-outline">${p(t.deviceType)}</span>`);const u=c.length?`
      <div>
        <p class="pb-section-label">Environment</p>
        <div class="pb-env-row">${c.join("")}</div>
      </div>`:"",S=t.domSelector?`
      <div>
        <p class="pb-section-label">Element</p>
        <code class="pb-code">${p(t.domSelector)}</code>
      </div>`:"",B=y=>y.length?y.map(E=>`
            <div class="pb-comment">
              <div class="pb-comment-meta">
                <span class="pb-comment-author">${p(E.authorName)}</span>
                <span class="pb-comment-date">${A(E.createdAt)}</span>
              </div>
              <p class="pb-comment-body">${p(E.body)}</p>
            </div>`).join(""):'<p class="pb-no-comments">No comments yet.</p>';e.innerHTML=`
      <!-- Title -->
      <h2 style="font-size:17px;font-weight:600;color:var(--pb-text);margin:0;line-height:1.4">${p(t.title)}</h2>

      <!-- Column | Priority | Assignees — 3-col grid matching dashboard -->
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <p class="pb-section-label">Column</p>
          <span class="pb-meta-value">${t.columnName?p(t.columnName):"—"}</span>
        </div>
        <div class="pb-meta-col">
          <p class="pb-section-label">Priority</p>
          <span class="pb-badge" style="background:${s}22;color:${s};border-color:${s}44">${t.priority}</span>
        </div>
        <div class="pb-meta-col">
          <p class="pb-section-label">Assignees</p>
          <span class="pb-meta-value">${t.assigneeName?p(t.assigneeName):"Unassigned"}</span>
        </div>
      </div>

      <!-- Description -->
      ${t.description?`
      <div>
        <p class="pb-section-label">Description</p>
        <p style="font-size:13px;color:var(--pb-text);line-height:1.6;margin:0;white-space:pre-wrap">${p(t.description)}</p>
      </div>`:""}

      <!-- Reported by -->
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;font-weight:500;color:var(--pb-text);margin:0">${p(a)}</p>
        <p style="font-size:11px;color:var(--pb-text-muted);margin:3px 0 0">${A(t.createdAt)}</p>
      </div>

      <!-- Screenshot -->
      ${d}

      <!-- Environment -->
      ${u}

      <!-- Element -->
      ${S}

      <!-- Comments -->
      <div>
        <p class="pb-section-label" id="pb-comments-label">Comments (${t.comments.length})</p>
        <div class="pb-comments-list" id="pb-comments-list">${B(t.comments)}</div>

        <!-- Comment form -->
        <div class="pb-comment-form" id="pb-comment-form">
          <textarea
            class="pb-comment-textarea"
            id="pb-comment-input"
            placeholder="Add a comment…"
            rows="3"
          ></textarea>
          <div class="pb-comment-actions">
            <button class="pb-post-btn" id="pb-post-comment">Post comment</button>
          </div>
        </div>
      </div>

      <!-- View in board -->
      <a class="pb-view-board-btn"
         href="${r}/projects/${l}?task=${t.taskNumber}"
         target="_blank" rel="noopener noreferrer">
        View in board →
      </a>
    `,t.screenshotUrl&&((te=this.shadow.getElementById("pb-tp-expand"))==null||te.addEventListener("click",y=>{y.stopPropagation(),this.openLightbox(t.screenshotUrl)}),(ne=this.shadow.getElementById("pb-tp-sc-wrap"))==null||ne.addEventListener("click",()=>{this.openLightbox(t.screenshotUrl)}));const x=this.shadow.getElementById("pb-comment-input"),m=this.shadow.getElementById("pb-post-comment"),k=this.shadow.getElementById("pb-comments-list"),C=this.shadow.getElementById("pb-comments-label");let g=t.comments.length;m==null||m.addEventListener("click",async()=>{const y=x==null?void 0:x.value.trim();if(!(!y||!x)){m.disabled=!0,m.textContent="Posting…";try{const E=await fetch(`${r}/api/embed/task/${t.id}/comments?key=${encodeURIComponent(o)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body:y,guestName:a})});if(!E.ok)throw new Error;const ie=await E.json();if(x.value="",g++,C&&(C.textContent=`Comments (${g})`),k){const re=k.querySelector(".pb-no-comments");re&&re.remove();const U=document.createElement("div");U.className="pb-comment",U.innerHTML=`
            <div class="pb-comment-meta">
              <span class="pb-comment-author">${p(ie.authorName)}</span>
              <span class="pb-comment-date">just now</span>
            </div>
            <p class="pb-comment-body">${p(ie.body)}</p>
          `,k.appendChild(U)}}catch{}finally{m.disabled=!1,m.textContent="Post comment"}}})}renderBasic(e,t,i,r){const o=z[t.priority]??"#64748b";e.innerHTML=`
      <h2 style="font-size:17px;font-weight:600;color:var(--pb-text);margin:0">${p(t.title)}</h2>
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <p class="pb-section-label">Priority</p>
          <span class="pb-badge" style="background:${o}22;color:${o};border-color:${o}44">${t.priority}</span>
        </div>
      </div>
      ${t.guestName?`
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;color:var(--pb-text);margin:0">${p(t.guestName)}</p>
      </div>`:""}
      <a class="pb-view-board-btn"
         href="${r}/projects/${i}?task=${t.id}"
         target="_blank" rel="noopener noreferrer">
        View in board →
      </a>
    `}openLightbox(e){const t=document.createElement("div");t.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const r=document.createElement("button");r.className="pb-lightbox-close",r.innerHTML="&#x2715;",r.addEventListener("click",()=>t.remove()),t.addEventListener("click",o=>{o.target===t&&t.remove()}),t.appendChild(r),t.appendChild(i),this.shadow.appendChild(t)}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function ce(n){return{selector:pe(n),outerHtml:n.outerHTML.slice(0,2e3)}}function pe(n){var i;const e=[];let t=n;for(;t&&t!==document.body&&t.nodeType===Node.ELEMENT_NODE;){let r=t.tagName.toLowerCase();if(t.id){e.unshift(`#${CSS.escape(t.id)}`);break}const o=(i=t.parentElement)==null?void 0:i.children;if(o&&o.length>1){let s=1;for(let l=0;l<o.length&&o[l]!==t;l++)o[l].tagName===t.tagName&&s++;Array.from(o).filter(l=>l.tagName===t.tagName).length>1&&(r+=`:nth-of-type(${s})`)}if(e.unshift(r),t=t.parentElement,e.length>=6)break}return e.join(" > ")||n.tagName.toLowerCase()}function de(){const n=navigator.userAgent,{browserName:e,browserVersion:t}=he(n),{osName:i,osVersion:r}=be(n),o=ue();return{browserName:e,browserVersion:t,osName:i,osVersion:r,deviceType:o,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:n}}function he(n){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const t of e){const i=n.match(t.pattern);if(i)return{browserName:t.name,browserVersion:i[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function be(n){var e,t,i;return/Windows NT 10/.test(n)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(n)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(n)?{osName:"macOS",osVersion:((e=n.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(n)?{osName:"Android",osVersion:((t=n.match(/Android ([0-9.]+)/))==null?void 0:t[1])??""}:/iPhone OS ([0-9_]+)/.test(n)?{osName:"iOS",osVersion:((i=n.match(/iPhone OS ([0-9_]+)/))==null?void 0:i[1].replace(/_/g,"."))??""}:/Linux/.test(n)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function ue(){const n=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(n)?"mobile":/iPad|Android(?!.*Mobile)/.test(n)?"tablet":"desktop"}function me(n,e){if(n.match(/^[a-z]+:\/\//i))return n;if(n.match(/^\/\//))return window.location.protocol+n;if(n.match(/^[a-z]+:/i))return n;const t=document.implementation.createHTMLDocument(),i=t.createElement("base"),r=t.createElement("a");return t.head.appendChild(i),t.body.appendChild(r),e&&(i.href=e),r.href=n,r.href}const ge=(()=>{let n=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(n+=1,`u${e()}${n}`)})();function f(n){const e=[];for(let t=0,i=n.length;t<i;t++)e.push(n[t]);return e}let w=null;function O(n={}){return w||(n.includeStyleProperties?(w=n.includeStyleProperties,w):(w=f(window.getComputedStyle(document.documentElement)),w))}function $(n,e){const i=(n.ownerDocument.defaultView||window).getComputedStyle(n).getPropertyValue(e);return i?parseFloat(i.replace("px","")):0}function fe(n){const e=$(n,"border-left-width"),t=$(n,"border-right-width");return n.clientWidth+e+t}function xe(n){const e=$(n,"border-top-width"),t=$(n,"border-bottom-width");return n.clientHeight+e+t}function H(n,e={}){const t=e.width||fe(n),i=e.height||xe(n);return{width:t,height:i}}function ye(){let n,e;try{e=process}catch{}const t=e&&e.env?e.env.devicePixelRatio:null;return t&&(n=parseInt(t,10),Number.isNaN(n)&&(n=1)),n||window.devicePixelRatio||1}const b=16384;function we(n){(n.width>b||n.height>b)&&(n.width>b&&n.height>b?n.width>n.height?(n.height*=b/n.width,n.width=b):(n.width*=b/n.height,n.height=b):n.width>b?(n.height*=b/n.width,n.width=b):(n.width*=b/n.height,n.height=b))}function P(n){return new Promise((e,t)=>{const i=new Image;i.onload=()=>{i.decode().then(()=>{requestAnimationFrame(()=>e(i))})},i.onerror=t,i.crossOrigin="anonymous",i.decoding="async",i.src=n})}async function ve(n){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(n)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function ke(n,e,t){const i="http://www.w3.org/2000/svg",r=document.createElementNS(i,"svg"),o=document.createElementNS(i,"foreignObject");return r.setAttribute("width",`${e}`),r.setAttribute("height",`${t}`),r.setAttribute("viewBox",`0 0 ${e} ${t}`),o.setAttribute("width","100%"),o.setAttribute("height","100%"),o.setAttribute("x","0"),o.setAttribute("y","0"),o.setAttribute("externalResourcesRequired","true"),r.appendChild(o),o.appendChild(n),ve(r)}const h=(n,e)=>{if(n instanceof e)return!0;const t=Object.getPrototypeOf(n);return t===null?!1:t.constructor.name===e.name||h(t,e)};function Ee(n){const e=n.getPropertyValue("content");return`${n.cssText} content: '${e.replace(/'|"/g,"")}';`}function Se(n,e){return O(e).map(t=>{const i=n.getPropertyValue(t),r=n.getPropertyPriority(t);return`${t}: ${i}${r?" !important":""};`}).join(" ")}function Ce(n,e,t,i){const r=`.${n}:${e}`,o=t.cssText?Ee(t):Se(t,i);return document.createTextNode(`${r}{${o}}`)}function F(n,e,t,i){const r=window.getComputedStyle(n,t),o=r.getPropertyValue("content");if(o===""||o==="none")return;const s=ge();try{e.className=`${e.className} ${s}`}catch{return}const a=document.createElement("style");a.appendChild(Ce(s,t,r,i)),e.appendChild(a)}function $e(n,e,t){F(n,e,":before",t),F(n,e,":after",t)}const j="application/font-woff",N="image/jpeg",Pe={woff:j,woff2:j,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:N,jpeg:N,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function Le(n){const e=/\.([^./]*?)$/g.exec(n);return e?e[1]:""}function T(n){const e=Le(n).toLowerCase();return Pe[e]||""}function Te(n){return n.split(/,/)[1]}function R(n){return n.search(/^(data:)/)!==-1}function Re(n,e){return`data:${e};base64,${n}`}async function D(n,e,t){const i=await fetch(n,e);if(i.status===404)throw new Error(`Resource "${i.url}" not found`);const r=await i.blob();return new Promise((o,s)=>{const a=new FileReader;a.onerror=s,a.onloadend=()=>{try{o(t({res:i,result:a.result}))}catch(l){s(l)}},a.readAsDataURL(r)})}const I={};function Ie(n,e,t){let i=n.replace(/\?.*/,"");return t&&(i=n),/ttf|otf|eot|woff2?/i.test(i)&&(i=i.replace(/.*\//,"")),e?`[${e}]${i}`:i}async function M(n,e,t){const i=Ie(n,e,t.includeQueryParams);if(I[i]!=null)return I[i];t.cacheBust&&(n+=(/\?/.test(n)?"&":"?")+new Date().getTime());let r;try{const o=await D(n,t.fetchRequestInit,({res:s,result:a})=>(e||(e=s.headers.get("Content-Type")||""),Te(a)));r=Re(o,e)}catch(o){r=t.imagePlaceholder||"";let s=`Failed to fetch resource: ${n}`;o&&(s=typeof o=="string"?o:o.message),s&&console.warn(s)}return I[i]=r,r}async function Me(n){const e=n.toDataURL();return e==="data:,"?n.cloneNode(!1):P(e)}async function Be(n,e){if(n.currentSrc){const o=document.createElement("canvas"),s=o.getContext("2d");o.width=n.clientWidth,o.height=n.clientHeight,s==null||s.drawImage(n,0,0,o.width,o.height);const a=o.toDataURL();return P(a)}const t=n.poster,i=T(t),r=await M(t,i,e);return P(r)}async function Ue(n,e){var t;try{if(!((t=n==null?void 0:n.contentDocument)===null||t===void 0)&&t.body)return await L(n.contentDocument.body,e,!0)}catch{}return n.cloneNode(!1)}async function ze(n,e){return h(n,HTMLCanvasElement)?Me(n):h(n,HTMLVideoElement)?Be(n,e):h(n,HTMLIFrameElement)?Ue(n,e):n.cloneNode(V(n))}const Ae=n=>n.tagName!=null&&n.tagName.toUpperCase()==="SLOT",V=n=>n.tagName!=null&&n.tagName.toUpperCase()==="SVG";async function Oe(n,e,t){var i,r;if(V(e))return e;let o=[];return Ae(n)&&n.assignedNodes?o=f(n.assignedNodes()):h(n,HTMLIFrameElement)&&(!((i=n.contentDocument)===null||i===void 0)&&i.body)?o=f(n.contentDocument.body.childNodes):o=f(((r=n.shadowRoot)!==null&&r!==void 0?r:n).childNodes),o.length===0||h(n,HTMLVideoElement)||await o.reduce((s,a)=>s.then(()=>L(a,t)).then(l=>{l&&e.appendChild(l)}),Promise.resolve()),e}function He(n,e,t){const i=e.style;if(!i)return;const r=window.getComputedStyle(n);r.cssText?(i.cssText=r.cssText,i.transformOrigin=r.transformOrigin):O(t).forEach(o=>{let s=r.getPropertyValue(o);o==="font-size"&&s.endsWith("px")&&(s=`${Math.floor(parseFloat(s.substring(0,s.length-2)))-.1}px`),h(n,HTMLIFrameElement)&&o==="display"&&s==="inline"&&(s="block"),o==="d"&&e.getAttribute("d")&&(s=`path(${e.getAttribute("d")})`),i.setProperty(o,s,r.getPropertyPriority(o))})}function Fe(n,e){h(n,HTMLTextAreaElement)&&(e.innerHTML=n.value),h(n,HTMLInputElement)&&e.setAttribute("value",n.value)}function je(n,e){if(h(n,HTMLSelectElement)){const t=e,i=Array.from(t.children).find(r=>n.value===r.getAttribute("value"));i&&i.setAttribute("selected","")}}function Ne(n,e,t){return h(e,Element)&&(He(n,e,t),$e(n,e,t),Fe(n,e),je(n,e)),e}async function De(n,e){const t=n.querySelectorAll?n.querySelectorAll("use"):[];if(t.length===0)return n;const i={};for(let o=0;o<t.length;o++){const a=t[o].getAttribute("xlink:href");if(a){const l=n.querySelector(a),d=document.querySelector(a);!l&&d&&!i[a]&&(i[a]=await L(d,e,!0))}}const r=Object.values(i);if(r.length){const o="http://www.w3.org/1999/xhtml",s=document.createElementNS(o,"svg");s.setAttribute("xmlns",o),s.style.position="absolute",s.style.width="0",s.style.height="0",s.style.overflow="hidden",s.style.display="none";const a=document.createElementNS(o,"defs");s.appendChild(a);for(let l=0;l<r.length;l++)a.appendChild(r[l]);n.appendChild(s)}return n}async function L(n,e,t){return!t&&e.filter&&!e.filter(n)?null:Promise.resolve(n).then(i=>ze(i,e)).then(i=>Oe(n,i,e)).then(i=>Ne(n,i,e)).then(i=>De(i,e))}const W=/url\((['"]?)([^'"]+?)\1\)/g,Ve=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,We=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function _e(n){const e=n.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function qe(n){const e=[];return n.replace(W,(t,i,r)=>(e.push(r),t)),e.filter(t=>!R(t))}async function Ge(n,e,t,i,r){try{const o=t?me(e,t):e,s=T(e);let a;return r||(a=await M(o,s,i)),n.replace(_e(e),`$1${a}$3`)}catch{}return n}function Xe(n,{preferredFontFormat:e}){return e?n.replace(We,t=>{for(;;){const[i,,r]=Ve.exec(t)||[];if(!r)return"";if(r===e)return`src: ${i};`}}):n}function _(n){return n.search(W)!==-1}async function q(n,e,t){if(!_(n))return n;const i=Xe(n,t);return qe(i).reduce((o,s)=>o.then(a=>Ge(a,s,e,t)),Promise.resolve(i))}async function v(n,e,t){var i;const r=(i=e.style)===null||i===void 0?void 0:i.getPropertyValue(n);if(r){const o=await q(r,null,t);return e.style.setProperty(n,o,e.style.getPropertyPriority(n)),!0}return!1}async function Ke(n,e){await v("background",n,e)||await v("background-image",n,e),await v("mask",n,e)||await v("-webkit-mask",n,e)||await v("mask-image",n,e)||await v("-webkit-mask-image",n,e)}async function Ye(n,e){const t=h(n,HTMLImageElement);if(!(t&&!R(n.src))&&!(h(n,SVGImageElement)&&!R(n.href.baseVal)))return;const i=t?n.src:n.href.baseVal,r=await M(i,T(i),e);await new Promise((o,s)=>{n.onload=o,n.onerror=e.onImageErrorHandler?(...l)=>{try{o(e.onImageErrorHandler(...l))}catch(d){s(d)}}:s;const a=n;a.decode&&(a.decode=o),a.loading==="lazy"&&(a.loading="eager"),t?(n.srcset="",n.src=r):n.href.baseVal=r})}async function Je(n,e){const i=f(n.childNodes).map(r=>G(r,e));await Promise.all(i).then(()=>n)}async function G(n,e){h(n,Element)&&(await Ke(n,e),await Ye(n,e),await Je(n,e))}function Qe(n,e){const{style:t}=n;e.backgroundColor&&(t.backgroundColor=e.backgroundColor),e.width&&(t.width=`${e.width}px`),e.height&&(t.height=`${e.height}px`);const i=e.style;return i!=null&&Object.keys(i).forEach(r=>{t[r]=i[r]}),n}const X={};async function K(n){let e=X[n];if(e!=null)return e;const i=await(await fetch(n)).text();return e={url:n,cssText:i},X[n]=e,e}async function Y(n,e){let t=n.cssText;const i=/url\(["']?([^"')]+)["']?\)/g,o=(t.match(/url\([^)]+\)/g)||[]).map(async s=>{let a=s.replace(i,"$1");return a.startsWith("https://")||(a=new URL(a,n.url).href),D(a,e.fetchRequestInit,({result:l})=>(t=t.replace(s,`url(${l})`),[s,l]))});return Promise.all(o).then(()=>t)}function J(n){if(n==null)return[];const e=[],t=/(\/\*[\s\S]*?\*\/)/gi;let i=n.replace(t,"");const r=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const l=r.exec(i);if(l===null)break;e.push(l[0])}i=i.replace(r,"");const o=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,s="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",a=new RegExp(s,"gi");for(;;){let l=o.exec(i);if(l===null){if(l=a.exec(i),l===null)break;o.lastIndex=a.lastIndex}else a.lastIndex=o.lastIndex;e.push(l[0])}return e}async function Ze(n,e){const t=[],i=[];return n.forEach(r=>{if("cssRules"in r)try{f(r.cssRules||[]).forEach((o,s)=>{if(o.type===CSSRule.IMPORT_RULE){let a=s+1;const l=o.href,d=K(l).then(c=>Y(c,e)).then(c=>J(c).forEach(u=>{try{r.insertRule(u,u.startsWith("@import")?a+=1:r.cssRules.length)}catch(S){console.error("Error inserting rule from remote css",{rule:u,error:S})}})).catch(c=>{console.error("Error loading remote css",c.toString())});i.push(d)}})}catch(o){const s=n.find(a=>a.href==null)||document.styleSheets[0];r.href!=null&&i.push(K(r.href).then(a=>Y(a,e)).then(a=>J(a).forEach(l=>{s.insertRule(l,s.cssRules.length)})).catch(a=>{console.error("Error loading remote stylesheet",a)})),console.error("Error inlining remote css file",o)}}),Promise.all(i).then(()=>(n.forEach(r=>{if("cssRules"in r)try{f(r.cssRules||[]).forEach(o=>{t.push(o)})}catch(o){console.error(`Error while reading CSS rules from ${r.href}`,o)}}),t))}function et(n){return n.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>_(e.style.getPropertyValue("src")))}async function tt(n,e){if(n.ownerDocument==null)throw new Error("Provided element is not within a Document");const t=f(n.ownerDocument.styleSheets),i=await Ze(t,e);return et(i)}function Q(n){return n.trim().replace(/["']/g,"")}function nt(n){const e=new Set;function t(i){(i.style.fontFamily||getComputedStyle(i).fontFamily).split(",").forEach(o=>{e.add(Q(o))}),Array.from(i.children).forEach(o=>{o instanceof HTMLElement&&t(o)})}return t(n),e}async function it(n,e){const t=await tt(n,e),i=nt(n);return(await Promise.all(t.filter(o=>i.has(Q(o.style.fontFamily))).map(o=>{const s=o.parentStyleSheet?o.parentStyleSheet.href:null;return q(o.cssText,s,e)}))).join(`
`)}async function rt(n,e){const t=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await it(n,e);if(t){const i=document.createElement("style"),r=document.createTextNode(t);i.appendChild(r),n.firstChild?n.insertBefore(i,n.firstChild):n.appendChild(i)}}async function ot(n,e={}){const{width:t,height:i}=H(n,e),r=await L(n,e,!0);return await rt(r,e),await G(r,e),Qe(r,e),await ke(r,t,i)}async function st(n,e={}){const{width:t,height:i}=H(n,e),r=await ot(n,e),o=await P(r),s=document.createElement("canvas"),a=s.getContext("2d"),l=e.pixelRatio||ye(),d=e.canvasWidth||t,c=e.canvasHeight||i;return s.width=d*l,s.height=c*l,e.skipAutoScale||we(s),s.style.width=`${d}`,s.style.height=`${c}`,e.backgroundColor&&(a.fillStyle=e.backgroundColor,a.fillRect(0,0,s.width,s.height)),a.drawImage(o,0,0,s.width,s.height),s}async function at(n,e={}){return(await st(n,e)).toDataURL()}async function lt(n,e){const t=await fetch(`${n.replace(/\/$/,"")}/screenshot/task`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:e.url,x:e.x,y:e.y,viewport:{width:e.viewportWidth??window.innerWidth,height:e.viewportHeight??window.innerHeight},delay_ms:e.delay??1500,crop_size:{width:480,height:320},format:"jpeg"})});if(!t.ok){const s=await t.json().catch(()=>({}));throw new Error(s.detail??`Server error ${t.status}`)}const i=await t.arrayBuffer(),r=new Uint8Array(i);let o="";for(let s=0;s<r.byteLength;s++)o+=String.fromCharCode(r[s]);return`data:image/jpeg;base64,${btoa(o)}`}async function ct(n){let e=n,t=n.parentElement;for(;t&&t.tagName!=="BODY";){const i=t.getBoundingClientRect();if(i.width>=200&&i.height>=60){e=t;break}t=t.parentElement}try{const i=await at(e,{cacheBust:!0,pixelRatio:1,skipFonts:!1,filter:r=>{var o;return!((o=r.hasAttribute)!=null&&o.call(r,"data-punchbug-ignore"))&&r.id!=="punchbug-root"}});return{full:i,thumb:i}}catch{return{full:"",thumb:""}}}const pt=`
  /* ── Theme tokens ── light by default, dark via prefers-color-scheme ─────── */
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    --pb-bg:           #ffffff;
    --pb-surface:      #f8fafc;
    --pb-muted:        #f1f5f9;
    --pb-border:       #e2e8f0;
    --pb-text:         #0f172a;
    --pb-text-muted:   #64748b;
    --pb-text-subtle:  #94a3b8;
    --pb-code-bg:      #f1f5f9;
    --pb-comment-bg:   #f8fafc;
    --pb-input-bg:     #ffffff;
    --pb-overlay-bg:   rgba(0,0,0,0.45);
    --pb-skeleton-a:   #e2e8f0;
    --pb-skeleton-b:   #f1f5f9;
    --pb-badge-bg:     #f1f5f9;
    --pb-badge-border: #e2e8f0;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --pb-bg:           #0f172a;
      --pb-surface:      #0f172a;
      --pb-muted:        #1e293b;
      --pb-border:       #1e293b;
      --pb-text:         #f1f5f9;
      --pb-text-muted:   #64748b;
      --pb-text-subtle:  #94a3b8;
      --pb-code-bg:      #1e293b;
      --pb-comment-bg:   #1e293b;
      --pb-input-bg:     #1e293b;
      --pb-overlay-bg:   rgba(0,0,0,0.6);
      --pb-skeleton-a:   #1e293b;
      --pb-skeleton-b:   #334155;
      --pb-badge-bg:     #1e293b;
      --pb-badge-border: #334155;
    }
  }

  * { box-sizing: border-box; }

  /* ── Trigger button ─────────────────────────────────────────────────────── */
  .pb-trigger {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: hsl(348,100%,52%);
    color: white;
    border: none;
    border-radius: 8px 0 0 8px;
    padding: 12px 10px;
    cursor: pointer;
    z-index: 2147483646;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: -2px 0 12px rgba(0,0,0,0.2);
    transition: background 0.2s;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  .pb-trigger:hover  { background: hsl(348,100%,42%); }
  .pb-trigger.pb-active { background: hsl(348,100%,30%); }
  .pb-trigger svg { width: 18px; height: 18px; writing-mode: horizontal-tb; }

  /* ── Overlay backdrop ───────────────────────────────────────────────────── */
  .pb-overlay {
    position: fixed;
    inset: 0;
    background: var(--pb-overlay-bg);
    z-index: 2147483647;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
  }

  /* ── Slide-in panel ─────────────────────────────────────────────────────── */
  .pb-panel {
    background: var(--pb-bg);
    width: 520px;
    max-width: 100vw;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--pb-border);
    animation: pb-slide-in 0.22s cubic-bezier(0.4,0,0.2,1);
    color: var(--pb-text);
  }

  @keyframes pb-slide-in {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }

  .pb-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--pb-border);
    position: sticky;
    top: 0;
    background: var(--pb-bg);
    z-index: 1;
    flex-shrink: 0;
  }

  .pb-panel-body {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
  }

  /* ── Close button ───────────────────────────────────────────────────────── */
  .pb-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--pb-text-muted);
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 18px;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
  }
  .pb-close-btn:hover { color: var(--pb-text); background: var(--pb-muted); }

  /* ── Section label ──────────────────────────────────────────────────────── */
  .pb-section-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--pb-text-muted);
    margin-bottom: 6px;
  }

  /* ── Fields (report form) ───────────────────────────────────────────────── */
  .pb-field { margin-bottom: 14px; }

  .pb-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--pb-text-subtle);
    margin-bottom: 5px;
  }

  .pb-input, .pb-textarea, select.pb-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    background: var(--pb-input-bg);
    color: var(--pb-text);
    transition: border-color 0.15s;
  }
  .pb-input::placeholder, .pb-textarea::placeholder { color: var(--pb-text-muted); }
  .pb-input:focus, .pb-textarea:focus, select.pb-input:focus {
    border-color: hsl(348,100%,52%);
    box-shadow: 0 0 0 3px hsla(348,100%,52%,0.15);
  }
  select.pb-input option { background: var(--pb-input-bg); color: var(--pb-text); }
  .pb-textarea { resize: vertical; min-height: 80px; }
  .pb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* ── Badges ─────────────────────────────────────────────────────────────── */
  .pb-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid transparent;
  }
  .pb-badge-outline {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid var(--pb-badge-border);
    background: var(--pb-badge-bg);
    color: var(--pb-text-muted);
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pb-badge-outline a { color: inherit; text-decoration: none; }

  /* ── Meta grid (Column / Priority / Assignees row) ─────────────────────── */
  .pb-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }
  .pb-meta-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .pb-meta-value {
    font-size: 13px;
    color: var(--pb-text);
    font-weight: 400;
  }

  /* ── Section header row (label + action button side by side) ────────────── */
  .pb-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pb-expand-text-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--pb-text-muted);
    font-size: 11px;
    font-family: inherit;
    font-weight: 500;
    padding: 2px 4px;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
  }
  .pb-expand-text-btn:hover { color: var(--pb-text); background: var(--pb-muted); }

  /* ── Environment badges ─────────────────────────────────────────────────── */
  .pb-env-row { display: flex; flex-wrap: wrap; gap: 6px; }

  /* ── Screenshot ─────────────────────────────────────────────────────────── */
  .pb-sc-loader {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px dashed var(--pb-border);
    border-radius: 8px;
    background: var(--pb-muted);
    color: var(--pb-text-muted);
    font-size: 12px;
  }
  .pb-sc-spinner {
    width: 16px; height: 16px;
    border: 2px solid var(--pb-border);
    border-top-color: hsl(348,100%,52%);
    border-radius: 50%;
    animation: pb-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes pb-spin { to { transform: rotate(360deg); } }

  .pb-screenshot-wrap {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--pb-border);
    cursor: zoom-in;
    background: var(--pb-muted);
  }
  .pb-screenshot-preview {
    width: 100%;
    max-height: 192px;
    object-fit: cover;
    object-position: top;
    display: block;
  }
  .pb-screenshot-expand {
    position: absolute;
    top: 6px; right: 6px;
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s;
    font-size: 11px;
    font-weight: 500;
    font-family: inherit;
    gap: 3px;
  }
  .pb-screenshot-wrap:hover .pb-screenshot-expand { opacity: 1; }

  /* ── Element / code block ───────────────────────────────────────────────── */
  .pb-code {
    font-size: 12px;
    background: var(--pb-code-bg);
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    padding: 6px 10px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    color: var(--pb-text);
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Comments ───────────────────────────────────────────────────────────── */
  .pb-comments-list { display: flex; flex-direction: column; gap: 16px; }
  .pb-comment { display: flex; flex-direction: column; gap: 3px; }
  .pb-comment-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pb-comment-author {
    font-size: 13px;
    font-weight: 600;
    color: var(--pb-text);
  }
  .pb-comment-date {
    font-size: 11px;
    color: var(--pb-text-muted);
  }
  .pb-comment-body {
    font-size: 13px;
    color: var(--pb-text);
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .pb-no-comments {
    font-size: 13px;
    color: var(--pb-text-muted);
    text-align: center;
    padding: 8px 0;
  }

  /* ── Comment form ───────────────────────────────────────────────────────── */
  .pb-comment-form { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
  .pb-comment-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    background: var(--pb-input-bg);
    color: var(--pb-text);
    resize: vertical;
    min-height: 72px;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .pb-comment-textarea::placeholder { color: var(--pb-text-muted); }
  .pb-comment-textarea:focus {
    border-color: hsl(348,100%,52%);
    box-shadow: 0 0 0 3px hsla(348,100%,52%,0.15);
  }
  .pb-comment-actions { display: flex; gap: 8px; }
  .pb-post-btn {
    padding: 6px 14px;
    background: hsl(348,100%,52%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .pb-post-btn:hover:not(:disabled) { background: hsl(348,100%,42%); }
  .pb-post-btn:disabled { opacity: 0.6; cursor: default; }

  /* ── Lightbox ───────────────────────────────────────────────────────────── */
  .pb-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.88);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
  }
  .pb-lightbox-img {
    max-width: calc(100vw - 48px);
    max-height: calc(100vh - 48px);
    border-radius: 8px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    cursor: default;
  }
  .pb-lightbox-close {
    position: absolute;
    top: 16px; right: 16px;
    background: rgba(255,255,255,0.15);
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px; height: 36px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .pb-lightbox-close:hover { background: rgba(255,255,255,0.25); }

  /* ── Submit / primary button ────────────────────────────────────────────── */
  .pb-submit-btn {
    width: 100%;
    padding: 10px;
    background: hsl(348,100%,52%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
  }
  .pb-submit-btn:hover:not(:disabled) { background: hsl(348,100%,42%); }
  .pb-submit-btn:disabled { opacity: 0.6; cursor: default; }

  /* ── View in board button ───────────────────────────────────────────────── */
  .pb-view-board-btn {
    display: block;
    text-align: center;
    background: hsl(348,100%,52%);
    color: white;
    border-radius: 6px;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
    border: none;
    cursor: pointer;
    font-family: inherit;
    width: 100%;
  }
  .pb-view-board-btn:hover { background: hsl(348,100%,42%); }

  /* ── Tags ───────────────────────────────────────────────────────────────── */
  .pb-tags-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .pb-tag-option { cursor: pointer; }
  .pb-tag-pill {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 400;
    cursor: pointer;
    transition: opacity 0.15s, font-weight 0.1s;
    user-select: none;
  }

  /* ── Success state ──────────────────────────────────────────────────────── */
  .pb-success {
    text-align: center;
    padding: 40px 20px;
  }
  .pb-success-icon { font-size: 48px; margin-bottom: 12px; }
  .pb-success-title { font-size: 18px; font-weight: 700; color: var(--pb-text); margin-bottom: 8px; }
  .pb-success-text { font-size: 14px; color: var(--pb-text-muted); }

  /* ── Loading skeleton ───────────────────────────────────────────────────── */
  .pb-skeleton {
    background: linear-gradient(90deg, var(--pb-skeleton-a) 25%, var(--pb-skeleton-b) 50%, var(--pb-skeleton-a) 75%);
    background-size: 200% 100%;
    animation: pb-shimmer 1.4s infinite;
    border-radius: 6px;
  }
  @keyframes pb-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  /* ── Info box (kept for report form env display) ────────────────────────── */
  .pb-info-box {
    background: var(--pb-muted);
    border: 1px solid var(--pb-border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 12px;
    color: var(--pb-text-subtle);
  }
  .pb-info-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 3px 0;
  }
  .pb-info-row:not(:last-child) { border-bottom: 1px solid var(--pb-border); }
  .pb-info-icon { flex-shrink: 0; margin-top: 1px; }
  .pb-info-val { color: var(--pb-text); word-break: break-all; }
`;class dt{constructor(e){if(this.picker=null,this.isPicking=!1,this.columns=[],this.tags=[],this.projectId="",this.pinCleanups=[],this.ghostPin=null,this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),!document.getElementById("pb-global-styles")){const i=document.createElement("style");i.id="pb-global-styles",i.textContent=`
        @keyframes pb-pin-drop {
          0%   { transform: translateY(-14px) scale(0.8); opacity: 0; }
          65%  { transform: translateY(4px)   scale(1.06); opacity: 1; }
          100% { transform: translateY(0)     scale(1);    opacity: 1; }
        }`,document.head.appendChild(i)}this.shadow=this.hostEl.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=pt,this.shadow.appendChild(t),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.title="Report a task",this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                 M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new le(this.shadow),this.fetchColumns(),this.fetchTags(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchTags(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.tags=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),t=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!t.ok)return;const i=await t.json();this.projectId=i.projectId,this.createPins(i.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(t=>t()),this.pinCleanups=[];for(const t of e)if(t.pinX!==null&&t.pinY!==null)this.createPinAtCoords(t);else if(t.domSelector)try{const i=document.querySelector(t.domSelector);i&&this.createPinOnElement(i,t)}catch{}}createPinAtCoords(e){const t=this.buildPin(e.taskNumber);t.style.position="absolute",t.style.top=`${(e.pinY??0)-11}px`,t.style.left=`${(e.pinX??0)-11}px`,document.body.appendChild(t),t.addEventListener("click",i=>{i.stopPropagation(),this.taskPanel.show(e,this.projectId,this.config.apiUrl,this.config.embedKey)}),this.pinCleanups.push(()=>t.remove())}createPinOnElement(e,t){const i=this.buildPin(t.taskNumber);i.style.position="absolute",document.body.appendChild(i);const r=()=>{const o=e.getBoundingClientRect();i.style.top=`${o.top+window.scrollY-11}px`,i.style.left=`${o.right+window.scrollX-11}px`};r(),window.addEventListener("scroll",r,{passive:!0}),window.addEventListener("resize",r,{passive:!0}),i.addEventListener("click",o=>{o.stopPropagation(),this.taskPanel.show(t,this.projectId,this.config.apiUrl,this.config.embedKey)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",r),window.removeEventListener("resize",r),i.remove()})}buildPin(e){const t=document.createElement("button");return t.setAttribute("data-punchbug-ignore","true"),t.textContent=String(e),t.style.cssText="z-index:2147483644;background:hsl(348,100%,52%);color:#fff;border:2.5px solid #fff;border-radius:50%;width:24px;height:24px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",t.onmouseenter=()=>{t.style.transform="scale(1.25)",t.style.background="hsl(348,100%,42%)"},t.onmouseleave=()=>{t.style.transform="",t.style.background="hsl(348,100%,52%)"},t}showGhostPin(e,t){this.removeGhostPin();const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.innerHTML=`
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
              fill="hsl(348,100%,52%)" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`,i.style.cssText=`position:absolute;top:${t-32}px;left:${e-14}px;z-index:2147483644;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));animation:pb-pin-drop 0.25s cubic-bezier(0.34,1.56,0.64,1);`,document.body.appendChild(i),this.ghostPin=i}removeGhostPin(){var e;(e=this.ghostPin)==null||e.remove(),this.ghostPin=null}refreshPins(){this.fetchPageTasks()}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click anywhere — Esc to cancel";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Cancel"),this.picker=new oe(t=>this.onPicked(t),()=>this.stopPicking()),this.picker.start()}stopPicking(){var t;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Report"),(t=this.picker)==null||t.stop(),this.picker=null}async onPicked({el:e,pageX:t,pageY:i}){this.stopPicking(),this.showGhostPin(t,i);const r=new ae(this.shadow,{domInfo:ce(e),browserMeta:de(),pageUrl:window.location.href,pinX:t,pinY:i,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,tags:this.tags,reporterName:this.config.reporterName,onSuccess:()=>{this.removeGhostPin(),this.refreshPins()},onClose:()=>this.removeGhostPin()});this.captureScreenshot(e,t,i).then(({full:o,thumb:s})=>r.setScreenshot(o,s)).catch(()=>r.setScreenshot(""))}async captureScreenshot(e,t,i){const r=this.config.screenshotServerUrl;if(r)try{const o=await lt(r,{url:window.location.href,x:t,y:i,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight});return{full:o,thumb:o}}catch(o){console.warn("PunchBug: screenshot server failed, falling back",o)}return ct(e)}}async function ht(n,e){try{const i=`${new URL(n).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,r=await fetch(i,{credentials:"include"});if(!r.ok)return{allowed:!1};const o=await r.json();return{allowed:o.allowed===!0,userName:o.userName||void 0}}catch{return{allowed:!1}}}async function Z(){const n=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:n.length>0&&(e=n[n.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const t=e.dataset.key,i=e.dataset.position||"right",r=e.dataset.apiUrl||bt(),o=e.dataset.screenshotServer||void 0;if(!t){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:s,userName:a}=await ht(r,t);s&&new dt({embedKey:t,apiUrl:r,position:i,reporterName:a,screenshotServerUrl:o})}function bt(){const n=document.querySelectorAll("script[src*='punchbug']");if(n.length>0){const e=n[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function ee(){const n=new URLSearchParams(window.location.search).get("pb_element");if(n)try{let e=function(){const r=t.getBoundingClientRect();i.style.top=r.top+"px",i.style.left=r.left+"px",i.style.width=r.width+"px",i.style.height=r.height+"px"};const t=document.querySelector(n);if(!t)return;t.scrollIntoView({block:"center",behavior:"smooth"});const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(i),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>{i.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{ee(),Z()}):(ee(),Z())})();
