(function(){"use strict";class fe{constructor(e,t){this.hoveredEl=null,this.highlightOverlay=null,this.onPick=e,this.onCancel=t,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){if(this.clearHighlight(),e.closest("#punchbug-root"))return;this.hoveredEl=e;const t=e.getBoundingClientRect(),i=document.createElement("div");i.id="pb-highlight-overlay",i.setAttribute("data-punchbug-ignore","true"),i.style.cssText=["position:fixed",`top:${t.top}px`,`left:${t.left}px`,`width:${t.width}px`,`height:${t.height}px`,"pointer-events:none","z-index:2147483645","outline:2px solid hsl(348,100%,52%)","outline-offset:2px","border-radius:2px","background:hsla(348,100%,52%,0.07)","box-sizing:border-box"].join(";"),document.body.appendChild(i),this.highlightOverlay=i}clearHighlight(){var e;(e=this.highlightOverlay)==null||e.remove(),this.highlightOverlay=null,this.hoveredEl=null}handleMouseOver(e){const t=e.target;t&&!t.closest("#punchbug-root")&&t!==this.highlightOverlay&&this.highlight(t)}handleMouseOut(e){this.hoveredEl===e.target&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const t=e.target;t&&!t.closest("#punchbug-root")&&t!==this.highlightOverlay&&(this.clearHighlight(),this.stop(),this.onPick({el:t,clientX:e.clientX,clientY:e.clientY,pageX:e.clientX+window.scrollX,pageY:e.clientY+window.scrollY}))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function xe(n,e){const t=await fetch(`${n}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const i=await t.json().catch(()=>({}));throw new Error(i.error||"Failed to submit report")}return t.json()}class ye{constructor(e,t){this.screenshotFull="",this.shadow=e,this.opts=t,this.overlay=this.render(t)}setScreenshot(e,t){var a;this.screenshotFull=e;const i=this.shadow.getElementById("pb-sc-loader"),s=this.shadow.getElementById("pb-sc-wrap"),r=this.shadow.getElementById("pb-sc-img");if(!e){i==null||i.remove();return}const o=t||e;r&&(r.src=o),i&&(i.style.display="none"),s&&(s.style.display="block"),e&&((a=this.shadow.getElementById("pb-sc-expand"))==null||a.addEventListener("click",()=>{this.openLightbox(e)}))}render(e){var b;const t=document.createElement("div");t.className="pb-overlay";const i=document.createElement("div");i.className="pb-panel";const s=document.createElement("div");s.className="pb-panel-header",s.innerHTML=`
      <h2 class="pb-panel-title">Report a Task</h2>
      <button class="pb-close-btn" id="pb-close">&#x2715;</button>
    `;const r=document.createElement("div");r.className="pb-panel-body",e.columns.length>0&&`${e.columns.map(d=>`<option value="${d.id}">${d.name}</option>`).join("")}`;const o=e.tags.length>0?`<div class="pb-field">
           <label class="pb-label">Tags</label>
           <div class="pb-tags-grid" id="pb-tags">
             ${e.tags.map(d=>`
               <label class="pb-tag-option">
                 <input type="checkbox" class="pb-tag-cb" value="${d.id}" style="display:none" />
                 <span class="pb-tag-pill" data-tag-id="${d.id}"
                       style="background:${d.color}22;color:${d.color};border:1px solid ${d.color}55">
                   ${d.name}
                 </span>
               </label>`).join("")}
           </div>
         </div>`:"";r.innerHTML=`
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
              ${e.columns.map(d=>`<option value="${d.id}">${d.name}</option>`).join("")}
            </select>
          </div>`:"<div></div>"}
        </div>
        ${o}
        <button class="pb-submit-btn" id="pb-submit" style="margin-top:16px">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,i.appendChild(s),i.appendChild(r),t.appendChild(i),this.shadow.appendChild(t);const a=()=>this.close(e.onClose);(b=this.shadow.getElementById("pb-close"))==null||b.addEventListener("click",a),t.addEventListener("click",d=>{d.target===t&&a()}),this.shadow.querySelectorAll(".pb-tag-pill").forEach(d=>{d.style.opacity="0.55",d.addEventListener("click",()=>{const g=this.shadow.querySelector(`.pb-tag-cb[value="${d.dataset.tagId}"]`);g&&(g.checked=!g.checked,d.style.opacity=g.checked?"1":"0.55",d.style.fontWeight=g.checked?"600":"400")})});const l=this.shadow.getElementById("pb-submit");return l==null||l.addEventListener("click",async()=>{var T,R,M;const d=this.shadow.getElementById("pb-title").value.trim();if(!d){this.shadow.getElementById("pb-title").focus();return}const g=this.shadow.getElementById("pb-desc").value.trim(),k=this.shadow.getElementById("pb-priority").value,H=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0,y=e.tags.length>0?Array.from(this.shadow.querySelectorAll(".pb-tag-cb:checked")).map(v=>v.value):[];l.disabled=!0,l.textContent="Submitting…";try{const v=this.screenshotFull.startsWith("http");await xe(e.apiUrl,{embedKey:e.embedKey,title:d,description:g||void 0,priority:k,screenshot:v?void 0:this.screenshotFull,screenshotUrl:v?this.screenshotFull:void 0,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:H,tagIds:y.length>0?y:void 0,reporterName:e.reporterName,browserMeta:e.browserMeta,pinX:e.pinX,pinY:e.pinY}),this.shadow.getElementById("pb-report-form").style.display="none",this.shadow.getElementById("pb-success").style.display="block",(T=this.shadow.getElementById("pb-sc-loader"))==null||T.remove(),(R=this.shadow.getElementById("pb-sc-wrap"))==null||R.remove(),(M=e.onSuccess)==null||M.call(e),setTimeout(()=>this.close(),3e3)}catch(v){l.disabled=!1,l.textContent="Submit Task",alert("Failed to submit: "+(v instanceof Error?v.message:"Unknown error"))}}),t}openLightbox(e){const t=document.createElement("div");t.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const s=document.createElement("button");s.className="pb-lightbox-close",s.innerHTML="&#x2715;",s.addEventListener("click",()=>t.remove()),t.addEventListener("click",r=>{r.target===t&&t.remove()}),t.appendChild(s),t.appendChild(i),this.shadow.appendChild(t)}close(e){this.overlay.remove(),e==null||e()}}const ve={LOW:"#64748b",MEDIUM:"#f59e0b",HIGH:"#f97316",CRITICAL:"#ef4444"},we=["LOW","MEDIUM","HIGH","CRITICAL"];function D(n){const e=Date.now()-new Date(n).getTime(),t=Math.floor(e/6e4);if(t<1)return"just now";if(t<60)return`${t}m ago`;const i=Math.floor(t/60);return i<24?`${i}h ago`:`${Math.floor(i/24)}d ago`}function h(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}class ke{constructor(e){this.overlay=null,this.shadow=e}show(e,t,i,s){var b;this.close();const r=document.createElement("div");r.className="pb-overlay";const o=document.createElement("div");o.className="pb-panel";const a=document.createElement("div");a.className="pb-panel-header",a.innerHTML=`
      <span style="font-size:12px;font-family:monospace;color:var(--pb-text-muted)">#${e.taskNumber}</span>
      <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
    `;const l=document.createElement("div");l.className="pb-panel-body",l.innerHTML=`
      <div class="pb-skeleton" style="height:24px;width:65%"></div>
      <div class="pb-meta-grid">
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
        <div class="pb-skeleton" style="height:56px;border-radius:6px"></div>
      </div>
      <div class="pb-skeleton" style="height:40px;border-radius:6px"></div>
      <div class="pb-skeleton" style="height:180px;border-radius:6px"></div>
    `,o.appendChild(a),o.appendChild(l),r.appendChild(o),this.shadow.appendChild(r),this.overlay=r,(b=this.shadow.getElementById("pb-tpanel-close"))==null||b.addEventListener("click",()=>this.close()),r.addEventListener("click",d=>{d.target===r&&this.close()}),Promise.all([fetch(`${i}/api/embed/task/${e.id}?key=${encodeURIComponent(s)}`).then(d=>d.ok?d.json():Promise.reject()),fetch(`${i}/api/embed/columns?key=${encodeURIComponent(s)}`).then(d=>d.ok?d.json():[]),fetch(`${i}/api/embed/members?key=${encodeURIComponent(s)}`).then(d=>d.ok?d.json():[])]).then(([d,g,k])=>{this.renderFull(l,d,g,k,t,i,s)}).catch(()=>this.renderBasic(l,e,t,i))}async patch(e,t,i,s){return fetch(`${e}/api/embed/task/${t}?key=${encodeURIComponent(i)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})}renderFull(e,t,i,s,r,o,a){var he,be,ue,me,ge;const l=t.creatorName||t.guestName||"Guest",b=t.projectSlug??r,d=i.map(c=>`<option value="${h(c.id)}"${c.id===t.columnId?" selected":""}>${h(c.name)}</option>`).join(""),g=we.map(c=>`<option value="${c}"${c===t.priority?" selected":""}>${c}</option>`).join(""),k=[`<option value=""${t.assigneeId?"":" selected"}>Unassigned</option>`,...s.map(c=>`<option value="${h(c.id)}"${c.id===t.assigneeId?" selected":""}>${h(c.name??c.id)}</option>`)].join(""),H=t.screenshotUrl?`
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
      </div>`:"",y=[];t.pageUrl&&y.push(`<span class="pb-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${h(t.pageUrl.replace(/^https?:\/\//,""))}</span>`),t.browserName&&y.push(`<span class="pb-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>${h(t.browserName)} ${h(t.browserVersion??"")}</span>`),t.osName&&y.push(`<span class="pb-badge-outline">${h(t.osName)} ${h(t.osVersion??"")}</span>`),t.screenWidth&&y.push(`<span class="pb-badge-outline">${t.screenWidth}×${t.screenHeight}</span>`),t.deviceType&&y.push(`<span class="pb-badge-outline">${h(t.deviceType)}</span>`);const T=y.length?`
      <div>
        <p class="pb-section-label">Environment</p>
        <div class="pb-env-row">${y.join("")}</div>
      </div>`:"",R=t.domSelector?`
      <div>
        <p class="pb-section-label">Element</p>
        <code class="pb-code">${h(t.domSelector)}</code>
      </div>`:"",M=c=>c.length?c.map(u=>`
            <div class="pb-comment">
              <div class="pb-comment-meta">
                <span class="pb-comment-author">${h(u.authorName)}</span>
                <span class="pb-comment-date">${D(u.createdAt)}</span>
              </div>
              <p class="pb-comment-body">${h(u.body)}</p>
            </div>`).join(""):'<p class="pb-no-comments">No comments yet.</p>';e.innerHTML=`
      <!-- Title (click-to-edit) -->
      <div id="pb-title-wrap">
        <h2 class="pb-title-display" id="pb-title-display">${h(t.title)}</h2>
      </div>

      <!-- Column / Priority / Assignees -->
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <label class="pb-section-label" style="margin-bottom:4px">Column</label>
          <select class="pb-select" id="pb-col-select">${d}</select>
        </div>
        <div class="pb-meta-col">
          <label class="pb-section-label" style="margin-bottom:4px">Priority</label>
          <select class="pb-select" id="pb-pri-select">${g}</select>
        </div>
        <div class="pb-meta-col">
          <label class="pb-section-label" style="margin-bottom:4px">Assignees</label>
          <select class="pb-select" id="pb-assignee-select">${k}</select>
        </div>
      </div>

      <!-- Description (click-to-edit) -->
      <div>
        <p class="pb-section-label">Description</p>
        <div id="pb-desc-wrap">
          <div class="pb-desc-display" id="pb-desc-display">
            ${t.description?h(t.description):'<span class="pb-desc-placeholder">Click to add a description…</span>'}
          </div>
        </div>
      </div>

      <!-- Reported by -->
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;font-weight:500;color:var(--pb-text);margin:0">${h(l)}</p>
        <p style="font-size:11px;color:var(--pb-text-muted);margin:3px 0 0">${D(t.createdAt)}</p>
      </div>

      ${H}
      ${T}
      ${R}

      <!-- Comments -->
      <div>
        <p class="pb-section-label" id="pb-comments-label">Comments (${t.comments.length})</p>
        <div class="pb-comments-list" id="pb-comments-list">${M(t.comments)}</div>
        <div class="pb-comment-form">
          <textarea class="pb-comment-textarea" id="pb-comment-input" placeholder="Add a comment…" rows="3"></textarea>
          <div class="pb-comment-actions">
            <button class="pb-post-btn" id="pb-post-comment">Post comment</button>
          </div>
        </div>
      </div>

      <!-- View in board -->
      <a class="pb-view-board-btn"
         href="${o}/projects/${b}?task=${t.taskNumber}"
         target="_blank" rel="noopener noreferrer">
        View in board →
      </a>
    `;const v=this.shadow.getElementById("pb-title-display"),ae=this.shadow.getElementById("pb-title-wrap");let B=t.title;v.addEventListener("click",()=>{const c=document.createElement("input");c.type="text",c.className="pb-title-input",c.value=B,ae.replaceChildren(c),c.focus();const u=async()=>{const p=c.value.trim()||B;B=p;const m=document.createElement("h2");m.className="pb-title-display",m.id="pb-title-display",m.textContent=p,ae.replaceChildren(m),m.addEventListener("click",()=>u()),p!==t.title&&await this.patch(o,t.id,a,{title:p})};c.addEventListener("blur",u),c.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),c.blur()),p.key==="Escape"&&(c.value=B,c.blur())})});const le=this.shadow.getElementById("pb-desc-display"),ce=this.shadow.getElementById("pb-desc-wrap");let j=t.description??"";le.addEventListener("click",()=>{const c=document.createElement("textarea");c.className="pb-desc-textarea",c.value=j,c.rows=4,ce.replaceChildren(c),c.focus();const u=async()=>{const p=c.value;j=p;const m=document.createElement("div");m.className="pb-desc-display",m.id="pb-desc-display",p?(m.style.whiteSpace="pre-wrap",m.textContent=p):m.innerHTML='<span class="pb-desc-placeholder">Click to add a description…</span>',ce.replaceChildren(m),m.addEventListener("click",()=>le.click()),p!==(t.description??"")&&await this.patch(o,t.id,a,{description:p||null})};c.addEventListener("blur",u),c.addEventListener("keydown",p=>{p.key==="Escape"&&(c.value=j,c.blur()),p.key==="Enter"&&(p.metaKey||p.ctrlKey)&&c.blur()})}),(he=this.shadow.getElementById("pb-col-select"))==null||he.addEventListener("change",c=>{const u=c.target.value;this.patch(o,t.id,a,{columnId:u||null})}),(be=this.shadow.getElementById("pb-pri-select"))==null||be.addEventListener("change",c=>{const u=c.target.value;this.patch(o,t.id,a,{priority:u})}),(ue=this.shadow.getElementById("pb-assignee-select"))==null||ue.addEventListener("change",c=>{const u=c.target.value;this.patch(o,t.id,a,{assigneeId:u||null})}),t.screenshotUrl&&((me=this.shadow.getElementById("pb-tp-expand"))==null||me.addEventListener("click",c=>{c.stopPropagation(),this.openLightbox(t.screenshotUrl)}),(ge=this.shadow.getElementById("pb-tp-sc-wrap"))==null||ge.addEventListener("click",()=>{this.openLightbox(t.screenshotUrl)}));const $=this.shadow.getElementById("pb-comment-input"),E=this.shadow.getElementById("pb-post-comment"),F=this.shadow.getElementById("pb-comments-list"),de=this.shadow.getElementById("pb-comments-label");let pe=t.comments.length;E==null||E.addEventListener("click",async()=>{const c=$==null?void 0:$.value.trim();if(!(!c||!$)){E.disabled=!0,E.textContent="Posting…";try{const u=await fetch(`${o}/api/embed/task/${t.id}/comments?key=${encodeURIComponent(a)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body:c,guestName:l})});if(!u.ok)throw new Error;const p=await u.json();if($.value="",pe++,de&&(de.textContent=`Comments (${pe})`),F){const m=F.querySelector(".pb-no-comments");m&&m.remove();const N=document.createElement("div");N.className="pb-comment",N.innerHTML=`
            <div class="pb-comment-meta">
              <span class="pb-comment-author">${h(p.authorName)}</span>
              <span class="pb-comment-date">just now</span>
            </div>
            <p class="pb-comment-body">${h(p.body)}</p>
          `,F.appendChild(N)}}catch{}finally{E.disabled=!1,E.textContent="Post comment"}}})}renderBasic(e,t,i,s){const r=ve[t.priority]??"#64748b";e.innerHTML=`
      <h2 class="pb-title-display" style="cursor:default">${h(t.title)}</h2>
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <p class="pb-section-label">Priority</p>
          <span class="pb-badge" style="background:${r}22;color:${r};border-color:${r}44">${t.priority}</span>
        </div>
      </div>
      ${t.guestName?`
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;color:var(--pb-text);margin:0">${h(t.guestName)}</p>
      </div>`:""}
      <a class="pb-view-board-btn" href="${s}/projects/${i}?task=${t.id}" target="_blank" rel="noopener noreferrer">View in board →</a>
    `}openLightbox(e){const t=document.createElement("div");t.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const s=document.createElement("button");s.className="pb-lightbox-close",s.innerHTML="&#x2715;",s.addEventListener("click",()=>t.remove()),t.addEventListener("click",r=>{r.target===t&&t.remove()}),t.appendChild(s),t.appendChild(i),this.shadow.appendChild(t)}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function Ee(n){return{selector:Ce(n),outerHtml:n.outerHTML.slice(0,2e3)}}function Ce(n){var i;const e=[];let t=n;for(;t&&t!==document.body&&t.nodeType===Node.ELEMENT_NODE;){let s=t.tagName.toLowerCase();if(t.id){e.unshift(`#${CSS.escape(t.id)}`);break}const r=(i=t.parentElement)==null?void 0:i.children;if(r&&r.length>1){let o=1;for(let l=0;l<r.length&&r[l]!==t;l++)r[l].tagName===t.tagName&&o++;Array.from(r).filter(l=>l.tagName===t.tagName).length>1&&(s+=`:nth-of-type(${o})`)}if(e.unshift(s),t=t.parentElement,e.length>=6)break}return e.join(" > ")||n.tagName.toLowerCase()}function Se(){const n=navigator.userAgent,{browserName:e,browserVersion:t}=$e(n),{osName:i,osVersion:s}=Le(n),r=Pe();return{browserName:e,browserVersion:t,osName:i,osVersion:s,deviceType:r,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:n}}function $e(n){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const t of e){const i=n.match(t.pattern);if(i)return{browserName:t.name,browserVersion:i[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function Le(n){var e,t,i;return/Windows NT 10/.test(n)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(n)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(n)?{osName:"macOS",osVersion:((e=n.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(n)?{osName:"Android",osVersion:((t=n.match(/Android ([0-9.]+)/))==null?void 0:t[1])??""}:/iPhone OS ([0-9_]+)/.test(n)?{osName:"iOS",osVersion:((i=n.match(/iPhone OS ([0-9_]+)/))==null?void 0:i[1].replace(/_/g,"."))??""}:/Linux/.test(n)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function Pe(){const n=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(n)?"mobile":/iPad|Android(?!.*Mobile)/.test(n)?"tablet":"desktop"}function Ie(n,e){if(n.match(/^[a-z]+:\/\//i))return n;if(n.match(/^\/\//))return window.location.protocol+n;if(n.match(/^[a-z]+:/i))return n;const t=document.implementation.createHTMLDocument(),i=t.createElement("base"),s=t.createElement("a");return t.head.appendChild(i),t.body.appendChild(s),e&&(i.href=e),s.href=n,s.href}const Te=(()=>{let n=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(n+=1,`u${e()}${n}`)})();function w(n){const e=[];for(let t=0,i=n.length;t<i;t++)e.push(n[t]);return e}let C=null;function V(n={}){return C||(n.includeStyleProperties?(C=n.includeStyleProperties,C):(C=w(window.getComputedStyle(document.documentElement)),C))}function L(n,e){const i=(n.ownerDocument.defaultView||window).getComputedStyle(n).getPropertyValue(e);return i?parseFloat(i.replace("px","")):0}function Re(n){const e=L(n,"border-left-width"),t=L(n,"border-right-width");return n.clientWidth+e+t}function Me(n){const e=L(n,"border-top-width"),t=L(n,"border-bottom-width");return n.clientHeight+e+t}function W(n,e={}){const t=e.width||Re(n),i=e.height||Me(n);return{width:t,height:i}}function Be(){let n,e;try{e=process}catch{}const t=e&&e.env?e.env.devicePixelRatio:null;return t&&(n=parseInt(t,10),Number.isNaN(n)&&(n=1)),n||window.devicePixelRatio||1}const x=16384;function ze(n){(n.width>x||n.height>x)&&(n.width>x&&n.height>x?n.width>n.height?(n.height*=x/n.width,n.width=x):(n.width*=x/n.height,n.height=x):n.width>x?(n.height*=x/n.width,n.width=x):(n.width*=x/n.height,n.height=x))}function P(n){return new Promise((e,t)=>{const i=new Image;i.onload=()=>{i.decode().then(()=>{requestAnimationFrame(()=>e(i))})},i.onerror=t,i.crossOrigin="anonymous",i.decoding="async",i.src=n})}async function Oe(n){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(n)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function Ae(n,e,t){const i="http://www.w3.org/2000/svg",s=document.createElementNS(i,"svg"),r=document.createElementNS(i,"foreignObject");return s.setAttribute("width",`${e}`),s.setAttribute("height",`${t}`),s.setAttribute("viewBox",`0 0 ${e} ${t}`),r.setAttribute("width","100%"),r.setAttribute("height","100%"),r.setAttribute("x","0"),r.setAttribute("y","0"),r.setAttribute("externalResourcesRequired","true"),s.appendChild(r),r.appendChild(n),Oe(s)}const f=(n,e)=>{if(n instanceof e)return!0;const t=Object.getPrototypeOf(n);return t===null?!1:t.constructor.name===e.name||f(t,e)};function Ue(n){const e=n.getPropertyValue("content");return`${n.cssText} content: '${e.replace(/'|"/g,"")}';`}function He(n,e){return V(e).map(t=>{const i=n.getPropertyValue(t),s=n.getPropertyPriority(t);return`${t}: ${i}${s?" !important":""};`}).join(" ")}function je(n,e,t,i){const s=`.${n}:${e}`,r=t.cssText?Ue(t):He(t,i);return document.createTextNode(`${s}{${r}}`)}function _(n,e,t,i){const s=window.getComputedStyle(n,t),r=s.getPropertyValue("content");if(r===""||r==="none")return;const o=Te();try{e.className=`${e.className} ${o}`}catch{return}const a=document.createElement("style");a.appendChild(je(o,t,s,i)),e.appendChild(a)}function Fe(n,e,t){_(n,e,":before",t),_(n,e,":after",t)}const q="application/font-woff",G="image/jpeg",Ne={woff:q,woff2:q,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:G,jpeg:G,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function De(n){const e=/\.([^./]*?)$/g.exec(n);return e?e[1]:""}function z(n){const e=De(n).toLowerCase();return Ne[e]||""}function Ve(n){return n.split(/,/)[1]}function O(n){return n.search(/^(data:)/)!==-1}function We(n,e){return`data:${e};base64,${n}`}async function X(n,e,t){const i=await fetch(n,e);if(i.status===404)throw new Error(`Resource "${i.url}" not found`);const s=await i.blob();return new Promise((r,o)=>{const a=new FileReader;a.onerror=o,a.onloadend=()=>{try{r(t({res:i,result:a.result}))}catch(l){o(l)}},a.readAsDataURL(s)})}const A={};function _e(n,e,t){let i=n.replace(/\?.*/,"");return t&&(i=n),/ttf|otf|eot|woff2?/i.test(i)&&(i=i.replace(/.*\//,"")),e?`[${e}]${i}`:i}async function U(n,e,t){const i=_e(n,e,t.includeQueryParams);if(A[i]!=null)return A[i];t.cacheBust&&(n+=(/\?/.test(n)?"&":"?")+new Date().getTime());let s;try{const r=await X(n,t.fetchRequestInit,({res:o,result:a})=>(e||(e=o.headers.get("Content-Type")||""),Ve(a)));s=We(r,e)}catch(r){s=t.imagePlaceholder||"";let o=`Failed to fetch resource: ${n}`;r&&(o=typeof r=="string"?r:r.message),o&&console.warn(o)}return A[i]=s,s}async function qe(n){const e=n.toDataURL();return e==="data:,"?n.cloneNode(!1):P(e)}async function Ge(n,e){if(n.currentSrc){const r=document.createElement("canvas"),o=r.getContext("2d");r.width=n.clientWidth,r.height=n.clientHeight,o==null||o.drawImage(n,0,0,r.width,r.height);const a=r.toDataURL();return P(a)}const t=n.poster,i=z(t),s=await U(t,i,e);return P(s)}async function Xe(n,e){var t;try{if(!((t=n==null?void 0:n.contentDocument)===null||t===void 0)&&t.body)return await I(n.contentDocument.body,e,!0)}catch{}return n.cloneNode(!1)}async function Ye(n,e){return f(n,HTMLCanvasElement)?qe(n):f(n,HTMLVideoElement)?Ge(n,e):f(n,HTMLIFrameElement)?Xe(n,e):n.cloneNode(Y(n))}const Ke=n=>n.tagName!=null&&n.tagName.toUpperCase()==="SLOT",Y=n=>n.tagName!=null&&n.tagName.toUpperCase()==="SVG";async function Je(n,e,t){var i,s;if(Y(e))return e;let r=[];return Ke(n)&&n.assignedNodes?r=w(n.assignedNodes()):f(n,HTMLIFrameElement)&&(!((i=n.contentDocument)===null||i===void 0)&&i.body)?r=w(n.contentDocument.body.childNodes):r=w(((s=n.shadowRoot)!==null&&s!==void 0?s:n).childNodes),r.length===0||f(n,HTMLVideoElement)||await r.reduce((o,a)=>o.then(()=>I(a,t)).then(l=>{l&&e.appendChild(l)}),Promise.resolve()),e}function Qe(n,e,t){const i=e.style;if(!i)return;const s=window.getComputedStyle(n);s.cssText?(i.cssText=s.cssText,i.transformOrigin=s.transformOrigin):V(t).forEach(r=>{let o=s.getPropertyValue(r);r==="font-size"&&o.endsWith("px")&&(o=`${Math.floor(parseFloat(o.substring(0,o.length-2)))-.1}px`),f(n,HTMLIFrameElement)&&r==="display"&&o==="inline"&&(o="block"),r==="d"&&e.getAttribute("d")&&(o=`path(${e.getAttribute("d")})`),i.setProperty(r,o,s.getPropertyPriority(r))})}function Ze(n,e){f(n,HTMLTextAreaElement)&&(e.innerHTML=n.value),f(n,HTMLInputElement)&&e.setAttribute("value",n.value)}function et(n,e){if(f(n,HTMLSelectElement)){const t=e,i=Array.from(t.children).find(s=>n.value===s.getAttribute("value"));i&&i.setAttribute("selected","")}}function tt(n,e,t){return f(e,Element)&&(Qe(n,e,t),Fe(n,e,t),Ze(n,e),et(n,e)),e}async function nt(n,e){const t=n.querySelectorAll?n.querySelectorAll("use"):[];if(t.length===0)return n;const i={};for(let r=0;r<t.length;r++){const a=t[r].getAttribute("xlink:href");if(a){const l=n.querySelector(a),b=document.querySelector(a);!l&&b&&!i[a]&&(i[a]=await I(b,e,!0))}}const s=Object.values(i);if(s.length){const r="http://www.w3.org/1999/xhtml",o=document.createElementNS(r,"svg");o.setAttribute("xmlns",r),o.style.position="absolute",o.style.width="0",o.style.height="0",o.style.overflow="hidden",o.style.display="none";const a=document.createElementNS(r,"defs");o.appendChild(a);for(let l=0;l<s.length;l++)a.appendChild(s[l]);n.appendChild(o)}return n}async function I(n,e,t){return!t&&e.filter&&!e.filter(n)?null:Promise.resolve(n).then(i=>Ye(i,e)).then(i=>Je(n,i,e)).then(i=>tt(n,i,e)).then(i=>nt(i,e))}const K=/url\((['"]?)([^'"]+?)\1\)/g,it=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,st=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function rt(n){const e=n.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function ot(n){const e=[];return n.replace(K,(t,i,s)=>(e.push(s),t)),e.filter(t=>!O(t))}async function at(n,e,t,i,s){try{const r=t?Ie(e,t):e,o=z(e);let a;return s||(a=await U(r,o,i)),n.replace(rt(e),`$1${a}$3`)}catch{}return n}function lt(n,{preferredFontFormat:e}){return e?n.replace(st,t=>{for(;;){const[i,,s]=it.exec(t)||[];if(!s)return"";if(s===e)return`src: ${i};`}}):n}function J(n){return n.search(K)!==-1}async function Q(n,e,t){if(!J(n))return n;const i=lt(n,t);return ot(i).reduce((r,o)=>r.then(a=>at(a,o,e,t)),Promise.resolve(i))}async function S(n,e,t){var i;const s=(i=e.style)===null||i===void 0?void 0:i.getPropertyValue(n);if(s){const r=await Q(s,null,t);return e.style.setProperty(n,r,e.style.getPropertyPriority(n)),!0}return!1}async function ct(n,e){await S("background",n,e)||await S("background-image",n,e),await S("mask",n,e)||await S("-webkit-mask",n,e)||await S("mask-image",n,e)||await S("-webkit-mask-image",n,e)}async function dt(n,e){const t=f(n,HTMLImageElement);if(!(t&&!O(n.src))&&!(f(n,SVGImageElement)&&!O(n.href.baseVal)))return;const i=t?n.src:n.href.baseVal,s=await U(i,z(i),e);await new Promise((r,o)=>{n.onload=r,n.onerror=e.onImageErrorHandler?(...l)=>{try{r(e.onImageErrorHandler(...l))}catch(b){o(b)}}:o;const a=n;a.decode&&(a.decode=r),a.loading==="lazy"&&(a.loading="eager"),t?(n.srcset="",n.src=s):n.href.baseVal=s})}async function pt(n,e){const i=w(n.childNodes).map(s=>Z(s,e));await Promise.all(i).then(()=>n)}async function Z(n,e){f(n,Element)&&(await ct(n,e),await dt(n,e),await pt(n,e))}function ht(n,e){const{style:t}=n;e.backgroundColor&&(t.backgroundColor=e.backgroundColor),e.width&&(t.width=`${e.width}px`),e.height&&(t.height=`${e.height}px`);const i=e.style;return i!=null&&Object.keys(i).forEach(s=>{t[s]=i[s]}),n}const ee={};async function te(n){let e=ee[n];if(e!=null)return e;const i=await(await fetch(n)).text();return e={url:n,cssText:i},ee[n]=e,e}async function ne(n,e){let t=n.cssText;const i=/url\(["']?([^"')]+)["']?\)/g,r=(t.match(/url\([^)]+\)/g)||[]).map(async o=>{let a=o.replace(i,"$1");return a.startsWith("https://")||(a=new URL(a,n.url).href),X(a,e.fetchRequestInit,({result:l})=>(t=t.replace(o,`url(${l})`),[o,l]))});return Promise.all(r).then(()=>t)}function ie(n){if(n==null)return[];const e=[],t=/(\/\*[\s\S]*?\*\/)/gi;let i=n.replace(t,"");const s=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const l=s.exec(i);if(l===null)break;e.push(l[0])}i=i.replace(s,"");const r=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",a=new RegExp(o,"gi");for(;;){let l=r.exec(i);if(l===null){if(l=a.exec(i),l===null)break;r.lastIndex=a.lastIndex}else a.lastIndex=r.lastIndex;e.push(l[0])}return e}async function bt(n,e){const t=[],i=[];return n.forEach(s=>{if("cssRules"in s)try{w(s.cssRules||[]).forEach((r,o)=>{if(r.type===CSSRule.IMPORT_RULE){let a=o+1;const l=r.href,b=te(l).then(d=>ne(d,e)).then(d=>ie(d).forEach(g=>{try{s.insertRule(g,g.startsWith("@import")?a+=1:s.cssRules.length)}catch(k){console.error("Error inserting rule from remote css",{rule:g,error:k})}})).catch(d=>{console.error("Error loading remote css",d.toString())});i.push(b)}})}catch(r){const o=n.find(a=>a.href==null)||document.styleSheets[0];s.href!=null&&i.push(te(s.href).then(a=>ne(a,e)).then(a=>ie(a).forEach(l=>{o.insertRule(l,o.cssRules.length)})).catch(a=>{console.error("Error loading remote stylesheet",a)})),console.error("Error inlining remote css file",r)}}),Promise.all(i).then(()=>(n.forEach(s=>{if("cssRules"in s)try{w(s.cssRules||[]).forEach(r=>{t.push(r)})}catch(r){console.error(`Error while reading CSS rules from ${s.href}`,r)}}),t))}function ut(n){return n.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>J(e.style.getPropertyValue("src")))}async function mt(n,e){if(n.ownerDocument==null)throw new Error("Provided element is not within a Document");const t=w(n.ownerDocument.styleSheets),i=await bt(t,e);return ut(i)}function se(n){return n.trim().replace(/["']/g,"")}function gt(n){const e=new Set;function t(i){(i.style.fontFamily||getComputedStyle(i).fontFamily).split(",").forEach(r=>{e.add(se(r))}),Array.from(i.children).forEach(r=>{r instanceof HTMLElement&&t(r)})}return t(n),e}async function ft(n,e){const t=await mt(n,e),i=gt(n);return(await Promise.all(t.filter(r=>i.has(se(r.style.fontFamily))).map(r=>{const o=r.parentStyleSheet?r.parentStyleSheet.href:null;return Q(r.cssText,o,e)}))).join(`
`)}async function xt(n,e){const t=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await ft(n,e);if(t){const i=document.createElement("style"),s=document.createTextNode(t);i.appendChild(s),n.firstChild?n.insertBefore(i,n.firstChild):n.appendChild(i)}}async function yt(n,e={}){const{width:t,height:i}=W(n,e),s=await I(n,e,!0);return await xt(s,e),await Z(s,e),ht(s,e),await Ae(s,t,i)}async function vt(n,e={}){const{width:t,height:i}=W(n,e),s=await yt(n,e),r=await P(s),o=document.createElement("canvas"),a=o.getContext("2d"),l=e.pixelRatio||Be(),b=e.canvasWidth||t,d=e.canvasHeight||i;return o.width=b*l,o.height=d*l,e.skipAutoScale||ze(o),o.style.width=`${b}`,o.style.height=`${d}`,e.backgroundColor&&(a.fillStyle=e.backgroundColor,a.fillRect(0,0,o.width,o.height)),a.drawImage(r,0,0,o.width,o.height),o}async function wt(n,e={}){return(await vt(n,e)).toDataURL()}async function kt(n,e){const t=await fetch(`${n.replace(/\/$/,"")}/screenshot/task`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:e.url,x:e.x,y:e.y,viewport:{width:e.viewportWidth??window.innerWidth,height:e.viewportHeight??window.innerHeight},delay_ms:e.delay??1500,crop_size:{width:480,height:320},format:"jpeg"})});if(!t.ok){const o=await t.json().catch(()=>({}));throw new Error(o.detail??`Server error ${t.status}`)}const i=await t.arrayBuffer(),s=new Uint8Array(i);let r="";for(let o=0;o<s.byteLength;o++)r+=String.fromCharCode(s[o]);return`data:image/jpeg;base64,${btoa(r)}`}async function Et(n){let e=n,t=n.parentElement;for(;t&&t.tagName!=="BODY";){const i=t.getBoundingClientRect();if(i.width>=200&&i.height>=60){e=t;break}t=t.parentElement}try{const i=await wt(e,{cacheBust:!0,pixelRatio:1,skipFonts:!1,filter:s=>{var r;return!((r=s.hasAttribute)!=null&&r.call(s,"data-punchbug-ignore"))&&s.id!=="punchbug-root"}});return{full:i,thumb:i}}catch{return{full:"",thumb:""}}}const Ct=`
  /* ── Theme tokens ── light by default, dark via prefers-color-scheme ─────── */
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    --pb-bg:           hsl(0 0% 100%);
    --pb-surface:      hsl(0 0% 98%);
    --pb-muted:        hsl(210 40% 94%);
    --pb-border:       hsl(214.3 31.8% 88%);
    --pb-text:         hsl(222.2 84% 4.9%);
    --pb-text-muted:   hsl(215.4 16.3% 46.9%);
    --pb-text-subtle:  hsl(215.4 16.3% 60%);
    --pb-code-bg:      hsl(210 40% 94%);
    --pb-comment-bg:   hsl(0 0% 98%);
    --pb-input-bg:     hsl(0 0% 100%);
    --pb-overlay-bg:   rgba(0,0,0,0.45);
    --pb-skeleton-a:   hsl(214.3 31.8% 88%);
    --pb-skeleton-b:   hsl(210 40% 94%);
    --pb-badge-bg:     hsl(210 40% 94%);
    --pb-badge-border: hsl(214.3 31.8% 88%);
  }

  /* OS-level dark mode (fallback when JS hasn't run yet) */
  @media (prefers-color-scheme: dark) {
    :host {
      --pb-bg:           hsl(0 0% 7%);
      --pb-surface:      hsl(0 0% 12%);
      --pb-muted:        hsl(0 0% 18%);
      --pb-border:       hsl(0 0% 20%);
      --pb-text:         hsl(0 0% 95%);
      --pb-text-muted:   hsl(0 0% 55%);
      --pb-text-subtle:  hsl(0 0% 40%);
      --pb-code-bg:      hsl(0 0% 18%);
      --pb-comment-bg:   hsl(0 0% 12%);
      --pb-input-bg:     hsl(0 0% 20%);
      --pb-overlay-bg:   rgba(0,0,0,0.6);
      --pb-skeleton-a:   hsl(0 0% 18%);
      --pb-skeleton-b:   hsl(0 0% 25%);
      --pb-badge-bg:     hsl(0 0% 18%);
      --pb-badge-border: hsl(0 0% 20%);
    }
  }

  /* Site-level dark mode — set by JS when site's own dark class is detected */
  :host(.pb-dark) {
    --pb-bg:           hsl(0 0% 7%);
    --pb-surface:      hsl(0 0% 12%);
    --pb-muted:        hsl(0 0% 18%);
    --pb-border:       hsl(0 0% 20%);
    --pb-text:         hsl(0 0% 95%);
    --pb-text-muted:   hsl(0 0% 55%);
    --pb-text-subtle:  hsl(0 0% 40%);
    --pb-code-bg:      hsl(0 0% 18%);
    --pb-comment-bg:   hsl(0 0% 12%);
    --pb-input-bg:     hsl(0 0% 20%);
    --pb-overlay-bg:   rgba(0,0,0,0.6);
    --pb-skeleton-a:   hsl(0 0% 18%);
    --pb-skeleton-b:   hsl(0 0% 25%);
    --pb-badge-bg:     hsl(0 0% 18%);
    --pb-badge-border: hsl(0 0% 20%);
  }

  /* Explicit light override — used when site forces light mode */
  :host(.pb-light) {
    --pb-bg:           hsl(0 0% 100%);
    --pb-surface:      hsl(0 0% 98%);
    --pb-muted:        hsl(210 40% 94%);
    --pb-border:       hsl(214.3 31.8% 88%);
    --pb-text:         hsl(222.2 84% 4.9%);
    --pb-text-muted:   hsl(215.4 16.3% 46.9%);
    --pb-text-subtle:  hsl(215.4 16.3% 60%);
    --pb-code-bg:      hsl(210 40% 94%);
    --pb-comment-bg:   hsl(0 0% 98%);
    --pb-input-bg:     hsl(0 0% 100%);
    --pb-overlay-bg:   rgba(0,0,0,0.45);
    --pb-skeleton-a:   hsl(214.3 31.8% 88%);
    --pb-skeleton-b:   hsl(210 40% 94%);
    --pb-badge-bg:     hsl(210 40% 94%);
    --pb-badge-border: hsl(214.3 31.8% 88%);
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

  /* ── Editable select (Column / Priority / Assignees) ────────────────────── */
  .pb-select {
    width: 100%;
    height: 32px;
    padding: 0 28px 0 8px;
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    background: var(--pb-input-bg);
    color: var(--pb-text);
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color 0.15s;
  }
  .pb-select:focus {
    border-color: hsl(348,100%,52%);
    box-shadow: 0 0 0 3px hsla(348,100%,52%,0.15);
  }
  .pb-select option { background: var(--pb-input-bg); color: var(--pb-text); }

  /* ── Inline-editable title ──────────────────────────────────────────────── */
  .pb-title-display {
    font-size: 17px;
    font-weight: 600;
    color: var(--pb-text);
    margin: 0;
    line-height: 1.4;
    cursor: text;
    padding: 4px 8px;
    margin-left: -8px;
    border-radius: 4px;
    transition: background 0.15s;
  }
  .pb-title-display:hover { background: var(--pb-muted); }
  .pb-title-input {
    font-size: 17px;
    font-weight: 600;
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    font-family: inherit;
    background: var(--pb-input-bg);
    color: var(--pb-text);
    outline: none;
    line-height: 1.4;
  }
  .pb-title-input:focus {
    border-color: hsl(348,100%,52%);
    box-shadow: 0 0 0 3px hsla(348,100%,52%,0.15);
  }

  /* ── Inline-editable description ─────────────────────────────────────────── */
  .pb-desc-display {
    font-size: 13px;
    color: var(--pb-text);
    line-height: 1.6;
    white-space: pre-wrap;
    cursor: text;
    padding: 6px 8px;
    margin-left: -8px;
    border-radius: 4px;
    min-height: 2.5rem;
    transition: background 0.15s;
  }
  .pb-desc-display:hover { background: var(--pb-muted); }
  .pb-desc-placeholder { color: var(--pb-text-muted); font-style: italic; }
  .pb-desc-textarea {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--pb-border);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    background: var(--pb-input-bg);
    color: var(--pb-text);
    outline: none;
    resize: vertical;
    min-height: 80px;
    line-height: 1.6;
    box-sizing: border-box;
  }
  .pb-desc-textarea:focus {
    border-color: hsl(348,100%,52%);
    box-shadow: 0 0 0 3px hsla(348,100%,52%,0.15);
  }

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
`;class St{constructor(e){if(this.picker=null,this.isPicking=!1,this.columns=[],this.tags=[],this.projectId="",this.pinCleanups=[],this.ghostPin=null,this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),!document.getElementById("pb-global-styles")){const i=document.createElement("style");i.id="pb-global-styles",i.textContent=`
        @keyframes pb-pin-drop {
          0%   { transform: translateY(-14px) scale(0.8); opacity: 0; }
          65%  { transform: translateY(4px)   scale(1.06); opacity: 1; }
          100% { transform: translateY(0)     scale(1);    opacity: 1; }
        }`,document.head.appendChild(i)}this.shadow=this.hostEl.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=Ct,this.shadow.appendChild(t),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.title="Report a task",this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                 M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new ke(this.shadow),this.watchTheme(),this.fetchColumns(),this.fetchTags(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchTags(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.tags=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),t=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!t.ok)return;const i=await t.json();this.projectId=i.projectId,this.createPins(i.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(t=>t()),this.pinCleanups=[];for(const t of e)if(t.pinX!==null&&t.pinY!==null)this.createPinAtCoords(t);else if(t.domSelector)try{const i=document.querySelector(t.domSelector);i&&this.createPinOnElement(i,t)}catch{}}createPinAtCoords(e){const t=this.buildPin(e.taskNumber);t.style.position="absolute",t.style.top=`${(e.pinY??0)-11}px`,t.style.left=`${(e.pinX??0)-11}px`,document.body.appendChild(t),t.addEventListener("click",i=>{i.stopPropagation(),this.taskPanel.show(e,this.projectId,this.config.apiUrl,this.config.embedKey)}),this.pinCleanups.push(()=>t.remove())}createPinOnElement(e,t){const i=this.buildPin(t.taskNumber);i.style.position="absolute",document.body.appendChild(i);const s=()=>{const r=e.getBoundingClientRect();i.style.top=`${r.top+window.scrollY-11}px`,i.style.left=`${r.right+window.scrollX-11}px`};s(),window.addEventListener("scroll",s,{passive:!0}),window.addEventListener("resize",s,{passive:!0}),i.addEventListener("click",r=>{r.stopPropagation(),this.taskPanel.show(t,this.projectId,this.config.apiUrl,this.config.embedKey)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",s),window.removeEventListener("resize",s),i.remove()})}buildPin(e){const t=document.createElement("button");return t.setAttribute("data-punchbug-ignore","true"),t.textContent=String(e),t.style.cssText="z-index:2147483644;background:hsl(348,100%,52%);color:#fff;border:2.5px solid #fff;border-radius:50%;width:24px;height:24px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",t.onmouseenter=()=>{t.style.transform="scale(1.25)",t.style.background="hsl(348,100%,42%)"},t.onmouseleave=()=>{t.style.transform="",t.style.background="hsl(348,100%,52%)"},t}showGhostPin(e,t){this.removeGhostPin();const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.innerHTML=`
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
              fill="hsl(348,100%,52%)" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`,i.style.cssText=`position:absolute;top:${t-32}px;left:${e-14}px;z-index:2147483644;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));animation:pb-pin-drop 0.25s cubic-bezier(0.34,1.56,0.64,1);`,document.body.appendChild(i),this.ghostPin=i}removeGhostPin(){var e;(e=this.ghostPin)==null||e.remove(),this.ghostPin=null}refreshPins(){this.fetchPageTasks()}applyTheme(){const e=document.documentElement,t=document.body,i=e.classList.contains("dark")||e.getAttribute("data-theme")==="dark"||e.getAttribute("data-color-scheme")==="dark"||(t==null?void 0:t.classList.contains("dark"))||(t==null?void 0:t.classList.contains("dark-mode"))||(t==null?void 0:t.getAttribute("data-theme"))==="dark"||window.matchMedia("(prefers-color-scheme: dark)").matches;this.hostEl.classList.toggle("pb-dark",i),this.hostEl.classList.toggle("pb-light",!i)}watchTheme(){this.applyTheme(),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>this.applyTheme());const e=new MutationObserver(()=>this.applyTheme());e.observe(document.documentElement,{attributes:!0,attributeFilter:["class","data-theme","data-color-scheme"]}),document.body&&e.observe(document.body,{attributes:!0,attributeFilter:["class","data-theme"]})}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click anywhere — Esc to cancel";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Cancel"),this.picker=new fe(t=>this.onPicked(t),()=>this.stopPicking()),this.picker.start()}stopPicking(){var t;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Report"),(t=this.picker)==null||t.stop(),this.picker=null}async onPicked({el:e,pageX:t,pageY:i}){this.stopPicking(),this.showGhostPin(t,i);const s=new ye(this.shadow,{domInfo:Ee(e),browserMeta:Se(),pageUrl:window.location.href,pinX:t,pinY:i,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,tags:this.tags,reporterName:this.config.reporterName,onSuccess:()=>{this.removeGhostPin(),this.refreshPins()},onClose:()=>this.removeGhostPin()});this.captureScreenshot(e,t,i).then(({full:r,thumb:o})=>s.setScreenshot(r,o)).catch(()=>s.setScreenshot(""))}async captureScreenshot(e,t,i){const s=this.config.screenshotServerUrl;if(s)try{const r=await kt(s,{url:window.location.href,x:t,y:i,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight});return{full:r,thumb:r}}catch(r){console.warn("PunchBug: screenshot server failed, falling back",r)}return Et(e)}}async function $t(n,e){try{const i=`${new URL(n).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,s=await fetch(i,{credentials:"include"});if(!s.ok)return{allowed:!1};const r=await s.json();return{allowed:r.allowed===!0,userName:r.userName||void 0}}catch{return{allowed:!1}}}async function re(){const n=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:n.length>0&&(e=n[n.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const t=e.dataset.key,i=e.dataset.position||"right",s=e.dataset.apiUrl||Lt(),r=e.dataset.screenshotServer||void 0;if(!t){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:o,userName:a}=await $t(s,t);o&&new St({embedKey:t,apiUrl:s,position:i,reporterName:a,screenshotServerUrl:r})}function Lt(){const n=document.querySelectorAll("script[src*='punchbug']");if(n.length>0){const e=n[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function oe(){const n=new URLSearchParams(window.location.search).get("pb_element");if(n)try{let e=function(){const s=t.getBoundingClientRect();i.style.top=s.top+"px",i.style.left=s.left+"px",i.style.width=s.width+"px",i.style.height=s.height+"px"};const t=document.querySelector(n);if(!t)return;t.scrollIntoView({block:"center",behavior:"smooth"});const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(i),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>{i.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{oe(),re()}):(oe(),re())})();
