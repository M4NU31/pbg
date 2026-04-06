(function(){"use strict";const ye="data:image/webp;base64,UklGRuoDAABXRUJQVlA4TN4DAAAvEYFcEE8w//M//4raNmJjhdB3b48AThDC4JB4PAx0t/1yXDVnZ3cl3Y4cugyjjgzqnC11ZNiOrLsdGaZztqe7ASGd/9fpnjn+nO2I/k+AevvDm/ntT49Lke78eJpfrCCoap5foKCqby9iUH17EYPqeo1B82cYVNdrDJpPYFC9xEGnHHTKQe8GDDrloFMOeoWDnuKQWwyaAwbtOGjkoC2HFDDoFQ7acugrDBo55BqDTjloy6HjoC2HjoO2HDoO2nLoOGjDYcIhBwwaOSQOOuDQccg1Bj3EoeegDYfIIXHQlkPkkDhow+EQh56DBg5DDhMOiYM2HEYcOg65wqAthxGHGYfEQWsOQw6HOXQccoVBGw5DDoc5dAXMn/zar9+sykoFtLKD518tC9LaFZFdj1bltM6InPmumJE7It+UMnFIXhTSeSTflJFckkURWrl0ZFVE45LcL2LgkyxKGDl1tYSJU/KugM6rDwrovZKFvezWPXtae7Vraa/1Sr6yN3Drqr2RW7I0d9ivbXMTv+6Z6/zatbLW+yULa8mxL61lx+5Z0+DXGXONX7LksLA2cGyTw1NrQ8euWltz7Iy1w47JytjYs6WxiWcLYzPP3hnrPNvi8IWx3rOnHO4ZS55d5fCBsfy76AyHI9SsU5O/Vh35A+KMsfy76AMOV42l30VPqfWebXDYNtZ59s7YzLMFh6WxiWO71PjYsTPW1hy7Z23k2BfWho5tc3hvrXVsZa3x6wO1Xvv11Fzl15a1LH69t5b8OqLWe7/umZv5tW1u4tfK3JpbV9X80K0tewOvdq3sNV7dU/vBq4W9LE5dVfu9V+8KmDn1gRY4dmpRwsin+1riwKUjyyIal77VIiuPXmiRSRy6r2XOHLq2KmTszwstdejNme+02MaXs69WWm7w48hHN19ryUnsuT3jMOYw4FBjyIJhxmHMYcAhYEiCYcZhxKHBkAXDjMOIQ4MhC4YJhwGHgKEXDJFDg6EXDJFDiyEJhsihxdALhsihxtAJhgGGXGGIgqHG0AmGFkMnGAYYkmA4iCFVGA4Khb7CMBAKnWBoMUyFQq4xnBYKvVDIDYbTQqEXCrnGcEAoXBEKdysKKQiEVAuE3AiEvF8g5P0CIe8XCKkWCOu1QLhTCYN8UYz6t14Lg3RR7PqWP6sEQfqsEtNu5fmFSoz79PbJhSD2d+rtG+PzJ09ufXI+SJk7FeU3dKdywKCRQw4YNHLIAYNGDjlg0MghBwwaOeSAQSOHHDBo5JADBo0ccsCgkUMOGDRyyAGDRg45YNDIIQcMGjnkgEEjhxwwaPu///733//HOGa7cg0=";class we{constructor(e,t){this.hoveredEl=null,this.highlightOverlay=null,this.onPick=e,this.onCancel=t,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){if(this.clearHighlight(),e.closest("#punchbug-root"))return;this.hoveredEl=e;const t=e.getBoundingClientRect(),i=document.createElement("div");i.id="pb-highlight-overlay",i.setAttribute("data-punchbug-ignore","true"),i.style.cssText=["position:fixed",`top:${t.top}px`,`left:${t.left}px`,`width:${t.width}px`,`height:${t.height}px`,"pointer-events:none","z-index:2147483645","outline:2px solid hsl(348,100%,52%)","outline-offset:2px","border-radius:2px","background:hsla(348,100%,52%,0.07)","box-sizing:border-box"].join(";"),document.body.appendChild(i),this.highlightOverlay=i}clearHighlight(){var e;(e=this.highlightOverlay)==null||e.remove(),this.highlightOverlay=null,this.hoveredEl=null}handleMouseOver(e){const t=e.target;t&&!t.closest("#punchbug-root")&&t!==this.highlightOverlay&&this.highlight(t)}handleMouseOut(e){this.hoveredEl===e.target&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const t=e.target;if(t.closest("#punchbug-root")){this.clearHighlight(),this.stop(),this.onCancel();return}t&&t!==this.highlightOverlay&&(this.clearHighlight(),this.stop(),this.onPick({el:t,clientX:e.clientX,clientY:e.clientY,pageX:e.clientX+window.scrollX,pageY:e.clientY+window.scrollY}))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function ve(n,e){const t=await fetch(`${n}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const i=await t.json().catch(()=>({}));throw new Error(i.error||"Failed to submit report")}return t.json()}class Ee{constructor(e,t){this.screenshotFull="",this.shadow=e,this.opts=t,this.overlay=this.render(t)}setScreenshot(e,t){var a;this.screenshotFull=e;const i=this.shadow.getElementById("pb-sc-loader"),o=this.shadow.getElementById("pb-sc-wrap"),s=this.shadow.getElementById("pb-sc-img");if(!e){i==null||i.remove();return}const r=t||e;s&&(s.src=r),i&&(i.style.display="none"),o&&(o.style.display="block"),e&&((a=this.shadow.getElementById("pb-sc-expand"))==null||a.addEventListener("click",()=>{this.openLightbox(e)}))}render(e){var b;const t=document.createElement("div");t.className="pb-overlay";const i=document.createElement("div");i.className="pb-panel";const o=document.createElement("div");o.className="pb-panel-header",o.innerHTML=`
      <h2 class="pb-panel-title">Report a Task</h2>
      <button class="pb-close-btn" id="pb-close">&#x2715;</button>
    `;const s=document.createElement("div");s.className="pb-panel-body",e.columns.length>0&&`${e.columns.map(d=>`<option value="${d.id}">${d.name}</option>`).join("")}`;const r=e.tags.length>0?`<div class="pb-field">
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
         </div>`:"";s.innerHTML=`
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
        ${r}
        <button class="pb-submit-btn" id="pb-submit" style="margin-top:16px">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,i.appendChild(o),i.appendChild(s),t.appendChild(i),this.shadow.appendChild(t);const a=()=>this.close(e.onClose);(b=this.shadow.getElementById("pb-close"))==null||b.addEventListener("click",a),t.addEventListener("click",d=>{d.target===t&&a()}),this.shadow.querySelectorAll(".pb-tag-pill").forEach(d=>{d.style.opacity="0.55",d.addEventListener("click",()=>{const g=this.shadow.querySelector(`.pb-tag-cb[value="${d.dataset.tagId}"]`);g&&(g.checked=!g.checked,d.style.opacity=g.checked?"1":"0.55",d.style.fontWeight=g.checked?"600":"400")})});const l=this.shadow.getElementById("pb-submit");return l==null||l.addEventListener("click",async()=>{var R,M,A;const d=this.shadow.getElementById("pb-title").value.trim();if(!d){this.shadow.getElementById("pb-title").focus();return}const g=this.shadow.getElementById("pb-desc").value.trim(),E=this.shadow.getElementById("pb-priority").value,j=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0,y=e.tags.length>0?Array.from(this.shadow.querySelectorAll(".pb-tag-cb:checked")).map(w=>w.value):[];l.disabled=!0,l.textContent="Submitting…";try{const w=this.screenshotFull.startsWith("http");await ve(e.apiUrl,{embedKey:e.embedKey,title:d,description:g||void 0,priority:E,screenshot:w?void 0:this.screenshotFull,screenshotUrl:w?this.screenshotFull:void 0,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:j,tagIds:y.length>0?y:void 0,reporterName:e.reporterName,browserMeta:e.browserMeta,pinX:e.pinX,pinY:e.pinY}),this.shadow.getElementById("pb-report-form").style.display="none",this.shadow.getElementById("pb-success").style.display="block",(R=this.shadow.getElementById("pb-sc-loader"))==null||R.remove(),(M=this.shadow.getElementById("pb-sc-wrap"))==null||M.remove(),(A=e.onSuccess)==null||A.call(e),setTimeout(()=>this.close(),3e3)}catch(w){l.disabled=!1,l.textContent="Submit Task",alert("Failed to submit: "+(w instanceof Error?w.message:"Unknown error"))}}),t}openLightbox(e){const t=document.createElement("div");t.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const o=document.createElement("button");o.className="pb-lightbox-close",o.innerHTML="&#x2715;",o.addEventListener("click",()=>t.remove()),t.addEventListener("click",s=>{s.target===t&&t.remove()}),t.appendChild(o),t.appendChild(i),this.shadow.appendChild(t)}close(e){this.overlay.remove(),e==null||e()}}const ke={LOW:"#64748b",MEDIUM:"#f59e0b",HIGH:"#f97316",CRITICAL:"#ef4444"},Ce=["LOW","MEDIUM","HIGH","CRITICAL"];function W(n){const e=Date.now()-new Date(n).getTime(),t=Math.floor(e/6e4);if(t<1)return"just now";if(t<60)return`${t}m ago`;const i=Math.floor(t/60);return i<24?`${i}h ago`:`${Math.floor(i/24)}d ago`}function h(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}class Se{constructor(e){this.overlay=null,this.shadow=e}show(e,t,i,o){var b;this.close();const s=document.createElement("div");s.className="pb-overlay";const r=document.createElement("div");r.className="pb-panel";const a=document.createElement("div");a.className="pb-panel-header",a.innerHTML=`
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
    `,r.appendChild(a),r.appendChild(l),s.appendChild(r),this.shadow.appendChild(s),this.overlay=s,(b=this.shadow.getElementById("pb-tpanel-close"))==null||b.addEventListener("click",()=>this.close()),s.addEventListener("click",d=>{d.target===s&&this.close()}),Promise.all([fetch(`${i}/api/embed/task/${e.id}?key=${encodeURIComponent(o)}`).then(d=>d.ok?d.json():Promise.reject()),fetch(`${i}/api/embed/columns?key=${encodeURIComponent(o)}`).then(d=>d.ok?d.json():[]),fetch(`${i}/api/embed/members?key=${encodeURIComponent(o)}`).then(d=>d.ok?d.json():[])]).then(([d,g,E])=>{this.renderFull(l,d,g,E,t,i,o)}).catch(()=>this.renderBasic(l,e,t,i))}async patch(e,t,i,o){return fetch(`${e}/api/embed/task/${t}?key=${encodeURIComponent(i)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})}renderFull(e,t,i,o,s,r,a){var ue,me,ge,fe,xe;const l=t.creatorName||t.guestName||"Guest",b=t.projectSlug??s,d=i.map(c=>`<option value="${h(c.id)}"${c.id===t.columnId?" selected":""}>${h(c.name)}</option>`).join(""),g=Ce.map(c=>`<option value="${c}"${c===t.priority?" selected":""}>${c}</option>`).join(""),E=[`<option value=""${t.assigneeId?"":" selected"}>Unassigned</option>`,...o.map(c=>`<option value="${h(c.id)}"${c.id===t.assigneeId?" selected":""}>${h(c.name??c.id)}</option>`)].join(""),j=t.screenshotUrl?`
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
      </div>`:"",y=[];t.pageUrl&&y.push(`<span class="pb-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${h(t.pageUrl.replace(/^https?:\/\//,""))}</span>`),t.browserName&&y.push(`<span class="pb-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="flex-shrink:0"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>${h(t.browserName)} ${h(t.browserVersion??"")}</span>`),t.osName&&y.push(`<span class="pb-badge-outline">${h(t.osName)} ${h(t.osVersion??"")}</span>`),t.screenWidth&&y.push(`<span class="pb-badge-outline">${t.screenWidth}×${t.screenHeight}</span>`),t.deviceType&&y.push(`<span class="pb-badge-outline">${h(t.deviceType)}</span>`);const R=y.length?`
      <div>
        <p class="pb-section-label">Environment</p>
        <div class="pb-env-row">${y.join("")}</div>
      </div>`:"",M=t.domSelector?`
      <div>
        <p class="pb-section-label">Element</p>
        <code class="pb-code">${h(t.domSelector)}</code>
      </div>`:"",A=c=>c.length?c.map(u=>`
            <div class="pb-comment">
              <div class="pb-comment-meta">
                <span class="pb-comment-author">${h(u.authorName)}</span>
                <span class="pb-comment-date">${W(u.createdAt)}</span>
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
          <select class="pb-select" id="pb-assignee-select">${E}</select>
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
        <p style="font-size:11px;color:var(--pb-text-muted);margin:3px 0 0">${W(t.createdAt)}</p>
      </div>

      ${j}
      ${R}
      ${M}

      <!-- Comments -->
      <div>
        <p class="pb-section-label" id="pb-comments-label">Comments (${t.comments.length})</p>
        <div class="pb-comments-list" id="pb-comments-list">${A(t.comments)}</div>
        <div class="pb-comment-form">
          <textarea class="pb-comment-textarea" id="pb-comment-input" placeholder="Add a comment…" rows="3"></textarea>
          <div class="pb-comment-actions">
            <button class="pb-post-btn" id="pb-post-comment">Post comment</button>
          </div>
        </div>
      </div>

      <!-- View in board -->
      <a class="pb-view-board-btn"
         href="${r}/projects/${b}?task=${t.taskNumber}"
         target="_blank" rel="noopener noreferrer">
        View in board →
      </a>
    `;const w=this.shadow.getElementById("pb-title-display"),ce=this.shadow.getElementById("pb-title-wrap");let B=t.title;w.addEventListener("click",()=>{const c=document.createElement("input");c.type="text",c.className="pb-title-input",c.value=B,ce.replaceChildren(c),c.focus();const u=async()=>{const p=c.value.trim()||B;B=p;const m=document.createElement("h2");m.className="pb-title-display",m.id="pb-title-display",m.textContent=p,ce.replaceChildren(m),m.addEventListener("click",()=>u()),p!==t.title&&await this.patch(r,t.id,a,{title:p})};c.addEventListener("blur",u),c.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),c.blur()),p.key==="Escape"&&(c.value=B,c.blur())})});const de=this.shadow.getElementById("pb-desc-display"),pe=this.shadow.getElementById("pb-desc-wrap");let F=t.description??"";de.addEventListener("click",()=>{const c=document.createElement("textarea");c.className="pb-desc-textarea",c.value=F,c.rows=4,pe.replaceChildren(c),c.focus();const u=async()=>{const p=c.value;F=p;const m=document.createElement("div");m.className="pb-desc-display",m.id="pb-desc-display",p?(m.style.whiteSpace="pre-wrap",m.textContent=p):m.innerHTML='<span class="pb-desc-placeholder">Click to add a description…</span>',pe.replaceChildren(m),m.addEventListener("click",()=>de.click()),p!==(t.description??"")&&await this.patch(r,t.id,a,{description:p||null})};c.addEventListener("blur",u),c.addEventListener("keydown",p=>{p.key==="Escape"&&(c.value=F,c.blur()),p.key==="Enter"&&(p.metaKey||p.ctrlKey)&&c.blur()})}),(ue=this.shadow.getElementById("pb-col-select"))==null||ue.addEventListener("change",c=>{const u=c.target.value;this.patch(r,t.id,a,{columnId:u||null})}),(me=this.shadow.getElementById("pb-pri-select"))==null||me.addEventListener("change",c=>{const u=c.target.value;this.patch(r,t.id,a,{priority:u})}),(ge=this.shadow.getElementById("pb-assignee-select"))==null||ge.addEventListener("change",c=>{const u=c.target.value;this.patch(r,t.id,a,{assigneeId:u||null})}),t.screenshotUrl&&((fe=this.shadow.getElementById("pb-tp-expand"))==null||fe.addEventListener("click",c=>{c.stopPropagation(),this.openLightbox(t.screenshotUrl)}),(xe=this.shadow.getElementById("pb-tp-sc-wrap"))==null||xe.addEventListener("click",()=>{this.openLightbox(t.screenshotUrl)}));const L=this.shadow.getElementById("pb-comment-input"),k=this.shadow.getElementById("pb-post-comment"),N=this.shadow.getElementById("pb-comments-list"),he=this.shadow.getElementById("pb-comments-label");let be=t.comments.length;k==null||k.addEventListener("click",async()=>{const c=L==null?void 0:L.value.trim();if(!(!c||!L)){k.disabled=!0,k.textContent="Posting…";try{const u=await fetch(`${r}/api/embed/task/${t.id}/comments?key=${encodeURIComponent(a)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body:c,guestName:l})});if(!u.ok)throw new Error;const p=await u.json();if(L.value="",be++,he&&(he.textContent=`Comments (${be})`),N){const m=N.querySelector(".pb-no-comments");m&&m.remove();const V=document.createElement("div");V.className="pb-comment",V.innerHTML=`
            <div class="pb-comment-meta">
              <span class="pb-comment-author">${h(p.authorName)}</span>
              <span class="pb-comment-date">just now</span>
            </div>
            <p class="pb-comment-body">${h(p.body)}</p>
          `,N.appendChild(V)}}catch{}finally{k.disabled=!1,k.textContent="Post comment"}}})}renderBasic(e,t,i,o){const s=ke[t.priority]??"#64748b";e.innerHTML=`
      <h2 class="pb-title-display" style="cursor:default">${h(t.title)}</h2>
      <div class="pb-meta-grid">
        <div class="pb-meta-col">
          <p class="pb-section-label">Priority</p>
          <span class="pb-badge" style="background:${s}22;color:${s};border-color:${s}44">${t.priority}</span>
        </div>
      </div>
      ${t.guestName?`
      <div>
        <p class="pb-section-label">Reported by</p>
        <p style="font-size:13px;color:var(--pb-text);margin:0">${h(t.guestName)}</p>
      </div>`:""}
      <a class="pb-view-board-btn" href="${o}/projects/${i}?task=${t.id}" target="_blank" rel="noopener noreferrer">View in board →</a>
    `}openLightbox(e){const t=document.createElement("div");t.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const o=document.createElement("button");o.className="pb-lightbox-close",o.innerHTML="&#x2715;",o.addEventListener("click",()=>t.remove()),t.addEventListener("click",s=>{s.target===t&&t.remove()}),t.appendChild(o),t.appendChild(i),this.shadow.appendChild(t)}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function $e(n){return{selector:Le(n),outerHtml:n.outerHTML.slice(0,2e3)}}function Le(n){var i;const e=[];let t=n;for(;t&&t!==document.body&&t.nodeType===Node.ELEMENT_NODE;){let o=t.tagName.toLowerCase();if(t.id){e.unshift(`#${CSS.escape(t.id)}`);break}const s=(i=t.parentElement)==null?void 0:i.children;if(s&&s.length>1){let r=1;for(let l=0;l<s.length&&s[l]!==t;l++)s[l].tagName===t.tagName&&r++;Array.from(s).filter(l=>l.tagName===t.tagName).length>1&&(o+=`:nth-of-type(${r})`)}if(e.unshift(o),t=t.parentElement,e.length>=6)break}return e.join(" > ")||n.tagName.toLowerCase()}function Ie(){const n=navigator.userAgent,{browserName:e,browserVersion:t}=Pe(n),{osName:i,osVersion:o}=Te(n),s=Re();return{browserName:e,browserVersion:t,osName:i,osVersion:o,deviceType:s,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:n}}function Pe(n){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const t of e){const i=n.match(t.pattern);if(i)return{browserName:t.name,browserVersion:i[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function Te(n){var e,t,i;return/Windows NT 10/.test(n)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(n)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(n)?{osName:"macOS",osVersion:((e=n.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(n)?{osName:"Android",osVersion:((t=n.match(/Android ([0-9.]+)/))==null?void 0:t[1])??""}:/iPhone OS ([0-9_]+)/.test(n)?{osName:"iOS",osVersion:((i=n.match(/iPhone OS ([0-9_]+)/))==null?void 0:i[1].replace(/_/g,"."))??""}:/Linux/.test(n)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function Re(){const n=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(n)?"mobile":/iPad|Android(?!.*Mobile)/.test(n)?"tablet":"desktop"}function Me(n,e){if(n.match(/^[a-z]+:\/\//i))return n;if(n.match(/^\/\//))return window.location.protocol+n;if(n.match(/^[a-z]+:/i))return n;const t=document.implementation.createHTMLDocument(),i=t.createElement("base"),o=t.createElement("a");return t.head.appendChild(i),t.body.appendChild(o),e&&(i.href=e),o.href=n,o.href}const Ae=(()=>{let n=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(n+=1,`u${e()}${n}`)})();function v(n){const e=[];for(let t=0,i=n.length;t<i;t++)e.push(n[t]);return e}let C=null;function Y(n={}){return C||(n.includeStyleProperties?(C=n.includeStyleProperties,C):(C=v(window.getComputedStyle(document.documentElement)),C))}function I(n,e){const i=(n.ownerDocument.defaultView||window).getComputedStyle(n).getPropertyValue(e);return i?parseFloat(i.replace("px","")):0}function Be(n){const e=I(n,"border-left-width"),t=I(n,"border-right-width");return n.clientWidth+e+t}function Oe(n){const e=I(n,"border-top-width"),t=I(n,"border-bottom-width");return n.clientHeight+e+t}function G(n,e={}){const t=e.width||Be(n),i=e.height||Oe(n);return{width:t,height:i}}function De(){let n,e;try{e=process}catch{}const t=e&&e.env?e.env.devicePixelRatio:null;return t&&(n=parseInt(t,10),Number.isNaN(n)&&(n=1)),n||window.devicePixelRatio||1}const x=16384;function He(n){(n.width>x||n.height>x)&&(n.width>x&&n.height>x?n.width>n.height?(n.height*=x/n.width,n.width=x):(n.width*=x/n.height,n.height=x):n.width>x?(n.height*=x/n.width,n.width=x):(n.width*=x/n.height,n.height=x))}function P(n){return new Promise((e,t)=>{const i=new Image;i.onload=()=>{i.decode().then(()=>{requestAnimationFrame(()=>e(i))})},i.onerror=t,i.crossOrigin="anonymous",i.decoding="async",i.src=n})}async function ze(n){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(n)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function Ue(n,e,t){const i="http://www.w3.org/2000/svg",o=document.createElementNS(i,"svg"),s=document.createElementNS(i,"foreignObject");return o.setAttribute("width",`${e}`),o.setAttribute("height",`${t}`),o.setAttribute("viewBox",`0 0 ${e} ${t}`),s.setAttribute("width","100%"),s.setAttribute("height","100%"),s.setAttribute("x","0"),s.setAttribute("y","0"),s.setAttribute("externalResourcesRequired","true"),o.appendChild(s),s.appendChild(n),ze(o)}const f=(n,e)=>{if(n instanceof e)return!0;const t=Object.getPrototypeOf(n);return t===null?!1:t.constructor.name===e.name||f(t,e)};function je(n){const e=n.getPropertyValue("content");return`${n.cssText} content: '${e.replace(/'|"/g,"")}';`}function Fe(n,e){return Y(e).map(t=>{const i=n.getPropertyValue(t),o=n.getPropertyPriority(t);return`${t}: ${i}${o?" !important":""};`}).join(" ")}function Ne(n,e,t,i){const o=`.${n}:${e}`,s=t.cssText?je(t):Fe(t,i);return document.createTextNode(`${o}{${s}}`)}function X(n,e,t,i){const o=window.getComputedStyle(n,t),s=o.getPropertyValue("content");if(s===""||s==="none")return;const r=Ae();try{e.className=`${e.className} ${r}`}catch{return}const a=document.createElement("style");a.appendChild(Ne(r,t,o,i)),e.appendChild(a)}function Ve(n,e,t){X(n,e,":before",t),X(n,e,":after",t)}const q="application/font-woff",K="image/jpeg",We={woff:q,woff2:q,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:K,jpeg:K,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function Ye(n){const e=/\.([^./]*?)$/g.exec(n);return e?e[1]:""}function O(n){const e=Ye(n).toLowerCase();return We[e]||""}function Ge(n){return n.split(/,/)[1]}function D(n){return n.search(/^(data:)/)!==-1}function Xe(n,e){return`data:${e};base64,${n}`}async function _(n,e,t){const i=await fetch(n,e);if(i.status===404)throw new Error(`Resource "${i.url}" not found`);const o=await i.blob();return new Promise((s,r)=>{const a=new FileReader;a.onerror=r,a.onloadend=()=>{try{s(t({res:i,result:a.result}))}catch(l){r(l)}},a.readAsDataURL(o)})}const H={};function qe(n,e,t){let i=n.replace(/\?.*/,"");return t&&(i=n),/ttf|otf|eot|woff2?/i.test(i)&&(i=i.replace(/.*\//,"")),e?`[${e}]${i}`:i}async function z(n,e,t){const i=qe(n,e,t.includeQueryParams);if(H[i]!=null)return H[i];t.cacheBust&&(n+=(/\?/.test(n)?"&":"?")+new Date().getTime());let o;try{const s=await _(n,t.fetchRequestInit,({res:r,result:a})=>(e||(e=r.headers.get("Content-Type")||""),Ge(a)));o=Xe(s,e)}catch(s){o=t.imagePlaceholder||"";let r=`Failed to fetch resource: ${n}`;s&&(r=typeof s=="string"?s:s.message),r&&console.warn(r)}return H[i]=o,o}async function Ke(n){const e=n.toDataURL();return e==="data:,"?n.cloneNode(!1):P(e)}async function _e(n,e){if(n.currentSrc){const s=document.createElement("canvas"),r=s.getContext("2d");s.width=n.clientWidth,s.height=n.clientHeight,r==null||r.drawImage(n,0,0,s.width,s.height);const a=s.toDataURL();return P(a)}const t=n.poster,i=O(t),o=await z(t,i,e);return P(o)}async function Je(n,e){var t;try{if(!((t=n==null?void 0:n.contentDocument)===null||t===void 0)&&t.body)return await T(n.contentDocument.body,e,!0)}catch{}return n.cloneNode(!1)}async function Qe(n,e){return f(n,HTMLCanvasElement)?Ke(n):f(n,HTMLVideoElement)?_e(n,e):f(n,HTMLIFrameElement)?Je(n,e):n.cloneNode(J(n))}const Ze=n=>n.tagName!=null&&n.tagName.toUpperCase()==="SLOT",J=n=>n.tagName!=null&&n.tagName.toUpperCase()==="SVG";async function et(n,e,t){var i,o;if(J(e))return e;let s=[];return Ze(n)&&n.assignedNodes?s=v(n.assignedNodes()):f(n,HTMLIFrameElement)&&(!((i=n.contentDocument)===null||i===void 0)&&i.body)?s=v(n.contentDocument.body.childNodes):s=v(((o=n.shadowRoot)!==null&&o!==void 0?o:n).childNodes),s.length===0||f(n,HTMLVideoElement)||await s.reduce((r,a)=>r.then(()=>T(a,t)).then(l=>{l&&e.appendChild(l)}),Promise.resolve()),e}function tt(n,e,t){const i=e.style;if(!i)return;const o=window.getComputedStyle(n);o.cssText?(i.cssText=o.cssText,i.transformOrigin=o.transformOrigin):Y(t).forEach(s=>{let r=o.getPropertyValue(s);s==="font-size"&&r.endsWith("px")&&(r=`${Math.floor(parseFloat(r.substring(0,r.length-2)))-.1}px`),f(n,HTMLIFrameElement)&&s==="display"&&r==="inline"&&(r="block"),s==="d"&&e.getAttribute("d")&&(r=`path(${e.getAttribute("d")})`),i.setProperty(s,r,o.getPropertyPriority(s))})}function nt(n,e){f(n,HTMLTextAreaElement)&&(e.innerHTML=n.value),f(n,HTMLInputElement)&&e.setAttribute("value",n.value)}function it(n,e){if(f(n,HTMLSelectElement)){const t=e,i=Array.from(t.children).find(o=>n.value===o.getAttribute("value"));i&&i.setAttribute("selected","")}}function ot(n,e,t){return f(e,Element)&&(tt(n,e,t),Ve(n,e,t),nt(n,e),it(n,e)),e}async function st(n,e){const t=n.querySelectorAll?n.querySelectorAll("use"):[];if(t.length===0)return n;const i={};for(let s=0;s<t.length;s++){const a=t[s].getAttribute("xlink:href");if(a){const l=n.querySelector(a),b=document.querySelector(a);!l&&b&&!i[a]&&(i[a]=await T(b,e,!0))}}const o=Object.values(i);if(o.length){const s="http://www.w3.org/1999/xhtml",r=document.createElementNS(s,"svg");r.setAttribute("xmlns",s),r.style.position="absolute",r.style.width="0",r.style.height="0",r.style.overflow="hidden",r.style.display="none";const a=document.createElementNS(s,"defs");r.appendChild(a);for(let l=0;l<o.length;l++)a.appendChild(o[l]);n.appendChild(r)}return n}async function T(n,e,t){return!t&&e.filter&&!e.filter(n)?null:Promise.resolve(n).then(i=>Qe(i,e)).then(i=>et(n,i,e)).then(i=>ot(n,i,e)).then(i=>st(i,e))}const Q=/url\((['"]?)([^'"]+?)\1\)/g,rt=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,at=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function lt(n){const e=n.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function ct(n){const e=[];return n.replace(Q,(t,i,o)=>(e.push(o),t)),e.filter(t=>!D(t))}async function dt(n,e,t,i,o){try{const s=t?Me(e,t):e,r=O(e);let a;return o||(a=await z(s,r,i)),n.replace(lt(e),`$1${a}$3`)}catch{}return n}function pt(n,{preferredFontFormat:e}){return e?n.replace(at,t=>{for(;;){const[i,,o]=rt.exec(t)||[];if(!o)return"";if(o===e)return`src: ${i};`}}):n}function Z(n){return n.search(Q)!==-1}async function ee(n,e,t){if(!Z(n))return n;const i=pt(n,t);return ct(i).reduce((s,r)=>s.then(a=>dt(a,r,e,t)),Promise.resolve(i))}async function S(n,e,t){var i;const o=(i=e.style)===null||i===void 0?void 0:i.getPropertyValue(n);if(o){const s=await ee(o,null,t);return e.style.setProperty(n,s,e.style.getPropertyPriority(n)),!0}return!1}async function ht(n,e){await S("background",n,e)||await S("background-image",n,e),await S("mask",n,e)||await S("-webkit-mask",n,e)||await S("mask-image",n,e)||await S("-webkit-mask-image",n,e)}async function bt(n,e){const t=f(n,HTMLImageElement);if(!(t&&!D(n.src))&&!(f(n,SVGImageElement)&&!D(n.href.baseVal)))return;const i=t?n.src:n.href.baseVal,o=await z(i,O(i),e);await new Promise((s,r)=>{n.onload=s,n.onerror=e.onImageErrorHandler?(...l)=>{try{s(e.onImageErrorHandler(...l))}catch(b){r(b)}}:r;const a=n;a.decode&&(a.decode=s),a.loading==="lazy"&&(a.loading="eager"),t?(n.srcset="",n.src=o):n.href.baseVal=o})}async function ut(n,e){const i=v(n.childNodes).map(o=>te(o,e));await Promise.all(i).then(()=>n)}async function te(n,e){f(n,Element)&&(await ht(n,e),await bt(n,e),await ut(n,e))}function mt(n,e){const{style:t}=n;e.backgroundColor&&(t.backgroundColor=e.backgroundColor),e.width&&(t.width=`${e.width}px`),e.height&&(t.height=`${e.height}px`);const i=e.style;return i!=null&&Object.keys(i).forEach(o=>{t[o]=i[o]}),n}const ne={};async function ie(n){let e=ne[n];if(e!=null)return e;const i=await(await fetch(n)).text();return e={url:n,cssText:i},ne[n]=e,e}async function oe(n,e){let t=n.cssText;const i=/url\(["']?([^"')]+)["']?\)/g,s=(t.match(/url\([^)]+\)/g)||[]).map(async r=>{let a=r.replace(i,"$1");return a.startsWith("https://")||(a=new URL(a,n.url).href),_(a,e.fetchRequestInit,({result:l})=>(t=t.replace(r,`url(${l})`),[r,l]))});return Promise.all(s).then(()=>t)}function se(n){if(n==null)return[];const e=[],t=/(\/\*[\s\S]*?\*\/)/gi;let i=n.replace(t,"");const o=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const l=o.exec(i);if(l===null)break;e.push(l[0])}i=i.replace(o,"");const s=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,r="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",a=new RegExp(r,"gi");for(;;){let l=s.exec(i);if(l===null){if(l=a.exec(i),l===null)break;s.lastIndex=a.lastIndex}else a.lastIndex=s.lastIndex;e.push(l[0])}return e}async function gt(n,e){const t=[],i=[];return n.forEach(o=>{if("cssRules"in o)try{v(o.cssRules||[]).forEach((s,r)=>{if(s.type===CSSRule.IMPORT_RULE){let a=r+1;const l=s.href,b=ie(l).then(d=>oe(d,e)).then(d=>se(d).forEach(g=>{try{o.insertRule(g,g.startsWith("@import")?a+=1:o.cssRules.length)}catch(E){console.error("Error inserting rule from remote css",{rule:g,error:E})}})).catch(d=>{console.error("Error loading remote css",d.toString())});i.push(b)}})}catch(s){const r=n.find(a=>a.href==null)||document.styleSheets[0];o.href!=null&&i.push(ie(o.href).then(a=>oe(a,e)).then(a=>se(a).forEach(l=>{r.insertRule(l,r.cssRules.length)})).catch(a=>{console.error("Error loading remote stylesheet",a)})),console.error("Error inlining remote css file",s)}}),Promise.all(i).then(()=>(n.forEach(o=>{if("cssRules"in o)try{v(o.cssRules||[]).forEach(s=>{t.push(s)})}catch(s){console.error(`Error while reading CSS rules from ${o.href}`,s)}}),t))}function ft(n){return n.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>Z(e.style.getPropertyValue("src")))}async function xt(n,e){if(n.ownerDocument==null)throw new Error("Provided element is not within a Document");const t=v(n.ownerDocument.styleSheets),i=await gt(t,e);return ft(i)}function re(n){return n.trim().replace(/["']/g,"")}function yt(n){const e=new Set;function t(i){(i.style.fontFamily||getComputedStyle(i).fontFamily).split(",").forEach(s=>{e.add(re(s))}),Array.from(i.children).forEach(s=>{s instanceof HTMLElement&&t(s)})}return t(n),e}async function wt(n,e){const t=await xt(n,e),i=yt(n);return(await Promise.all(t.filter(s=>i.has(re(s.style.fontFamily))).map(s=>{const r=s.parentStyleSheet?s.parentStyleSheet.href:null;return ee(s.cssText,r,e)}))).join(`
`)}async function vt(n,e){const t=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await wt(n,e);if(t){const i=document.createElement("style"),o=document.createTextNode(t);i.appendChild(o),n.firstChild?n.insertBefore(i,n.firstChild):n.appendChild(i)}}async function Et(n,e={}){const{width:t,height:i}=G(n,e),o=await T(n,e,!0);return await vt(o,e),await te(o,e),mt(o,e),await Ue(o,t,i)}async function kt(n,e={}){const{width:t,height:i}=G(n,e),o=await Et(n,e),s=await P(o),r=document.createElement("canvas"),a=r.getContext("2d"),l=e.pixelRatio||De(),b=e.canvasWidth||t,d=e.canvasHeight||i;return r.width=b*l,r.height=d*l,e.skipAutoScale||He(r),r.style.width=`${b}`,r.style.height=`${d}`,e.backgroundColor&&(a.fillStyle=e.backgroundColor,a.fillRect(0,0,r.width,r.height)),a.drawImage(s,0,0,r.width,r.height),r}async function Ct(n,e={}){return(await kt(n,e)).toDataURL()}async function St(n,e){const t=await fetch(`${n.replace(/\/$/,"")}/screenshot/task`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:e.url,x:e.x,y:e.y,viewport:{width:e.viewportWidth??window.innerWidth,height:e.viewportHeight??window.innerHeight},delay_ms:e.delay??1500,crop_size:{width:480,height:320},format:"jpeg"})});if(!t.ok){const r=await t.json().catch(()=>({}));throw new Error(r.detail??`Server error ${t.status}`)}const i=await t.arrayBuffer(),o=new Uint8Array(i);let s="";for(let r=0;r<o.byteLength;r++)s+=String.fromCharCode(o[r]);return`data:image/jpeg;base64,${btoa(s)}`}async function $t(n){let e=n,t=n.parentElement;for(;t&&t.tagName!=="BODY";){const i=t.getBoundingClientRect();if(i.width>=200&&i.height>=60){e=t;break}t=t.parentElement}try{const i=await Ct(e,{cacheBust:!0,pixelRatio:1,skipFonts:!1,filter:o=>{var s;return!((s=o.hasAttribute)!=null&&s.call(o,"data-punchbug-ignore"))&&o.id!=="punchbug-root"}});return{full:i,thumb:i}}catch{return{full:"",thumb:""}}}const Lt=`
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

  /* Dark theme — applied by JS via localStorage preference (default: dark) */
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

  /* ── Trigger button — bottom-right corner ───────────────────────────────── */
  .pb-trigger {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: hsl(348,100%,52%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 16px;
    cursor: pointer;
    z-index: 2147483646;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    transition: background 0.2s, transform 0.15s, box-shadow 0.15s;
    writing-mode: horizontal-tb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .pb-trigger:hover {
    background: hsl(348,100%,42%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.35);
  }
  .pb-trigger.pb-active { background: hsl(348,100%,30%); transform: none; }

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
`,$=class ${constructor(e){if(this.picker=null,this.isPicking=!1,this.columns=[],this.tags=[],this.projectId="",this.pinCleanups=[],this.ghostPin=null,this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),!document.getElementById("pb-global-styles")){const i=document.createElement("style");i.id="pb-global-styles",i.textContent=`
        @keyframes pb-pin-drop {
          0%   { transform: translateY(-14px) scale(0.8); opacity: 0; }
          65%  { transform: translateY(4px)   scale(1.06); opacity: 1; }
          100% { transform: translateY(0)     scale(1);    opacity: 1; }
        }`,document.head.appendChild(i)}this.shadow=this.hostEl.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=Lt,this.shadow.appendChild(t),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.title="Report a task",this.triggerBtn.innerHTML=`
      <img src="${ye}" alt="" width="18" height="18" style="display:block;object-fit:contain;flex-shrink:0" />
      <span>Report Task</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new Se(this.shadow),this.hostEl.classList.add("pb-dark"),this.fetchColumns(),this.fetchTags(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchTags(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.tags=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),t=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!t.ok)return;const i=await t.json();this.projectId=i.projectId,this.createPins(i.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(t=>t()),this.pinCleanups=[];for(const t of e)if(t.pinX!==null&&t.pinY!==null)this.createPinAtCoords(t);else if(t.domSelector)try{const i=document.querySelector(t.domSelector);i&&this.createPinOnElement(i,t)}catch{}}createPinAtCoords(e){const t=this.buildPin(e.taskNumber);t.style.position="absolute",t.style.top=`${(e.pinY??0)-11}px`,t.style.left=`${(e.pinX??0)-11}px`,document.body.appendChild(t),t.addEventListener("click",i=>{i.stopPropagation(),this.taskPanel.show(e,this.projectId,this.config.apiUrl,this.config.embedKey)}),this.pinCleanups.push(()=>t.remove())}createPinOnElement(e,t){const i=this.buildPin(t.taskNumber);i.style.position="absolute",document.body.appendChild(i);const o=()=>{const s=e.getBoundingClientRect();i.style.top=`${s.top+window.scrollY-11}px`,i.style.left=`${s.right+window.scrollX-11}px`};o(),window.addEventListener("scroll",o,{passive:!0}),window.addEventListener("resize",o,{passive:!0}),i.addEventListener("click",s=>{s.stopPropagation(),this.taskPanel.show(t,this.projectId,this.config.apiUrl,this.config.embedKey)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",o),window.removeEventListener("resize",o),i.remove()})}buildPin(e){const t=document.createElement("button");return t.setAttribute("data-punchbug-ignore","true"),t.textContent=String(e),t.style.cssText="z-index:2147483644;background:hsl(348,100%,52%);color:#fff;border:2.5px solid #fff;border-radius:50%;width:24px;height:24px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",t.onmouseenter=()=>{t.style.transform="scale(1.25)",t.style.background="hsl(348,100%,42%)"},t.onmouseleave=()=>{t.style.transform="",t.style.background="hsl(348,100%,52%)"},t}showGhostPin(e,t){this.removeGhostPin();const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.innerHTML=`
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
              fill="hsl(348,100%,52%)" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`,i.style.cssText=`position:absolute;top:${t-32}px;left:${e-14}px;z-index:2147483644;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));animation:pb-pin-drop 0.25s cubic-bezier(0.34,1.56,0.64,1);`,document.body.appendChild(i),this.ghostPin=i}removeGhostPin(){var e;(e=this.ghostPin)==null||e.remove(),this.ghostPin=null}refreshPins(){this.fetchPageTasks()}initTheme(){const e=localStorage.getItem($.THEME_KEY),t=e?e==="dark":!0;this.applyThemeClass(t)}applyThemeClass(e){this.hostEl.classList.toggle("pb-dark",e),this.hostEl.classList.toggle("pb-light",!e);const t=this.shadow.getElementById("pb-theme-toggle");t&&(t.innerHTML=e?this.sunIcon():this.moonIcon())}toggleTheme(){const t=!this.hostEl.classList.contains("pb-dark");localStorage.setItem($.THEME_KEY,t?"dark":"light"),this.applyThemeClass(t)}sunIcon(){return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="writing-mode:horizontal-tb"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/></svg>'}moonIcon(){return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="writing-mode:horizontal-tb"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click an element to report — click button or Esc to cancel";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Cancel"),this.picker=new we(t=>this.onPicked(t),()=>this.stopPicking()),this.picker.start()}stopPicking(){var t;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Report Task"),(t=this.picker)==null||t.stop(),this.picker=null}async onPicked({el:e,pageX:t,pageY:i}){this.stopPicking(),this.showGhostPin(t,i);const o=new Ee(this.shadow,{domInfo:$e(e),browserMeta:Ie(),pageUrl:window.location.href,pinX:t,pinY:i,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,tags:this.tags,reporterName:this.config.reporterName,onSuccess:()=>{this.removeGhostPin(),this.refreshPins()},onClose:()=>this.removeGhostPin()});this.captureScreenshot(e,t,i).then(({full:s,thumb:r})=>o.setScreenshot(s,r)).catch(()=>o.setScreenshot(""))}async captureScreenshot(e,t,i){const o=this.config.screenshotServerUrl;if(o)try{const s=await St(o,{url:window.location.href,x:t,y:i,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight});return{full:s,thumb:s}}catch(s){console.warn("PunchBug: screenshot server failed, falling back",s)}return $t(e)}};$.THEME_KEY="pb-theme";let U=$;async function It(n,e){try{const i=`${new URL(n).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,o=await fetch(i,{credentials:"include"});if(!o.ok)return{allowed:!1};const s=await o.json();return{allowed:s.allowed===!0,userName:s.userName||void 0}}catch{return{allowed:!1}}}async function ae(){const n=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:n.length>0&&(e=n[n.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const t=e.dataset.key,i=e.dataset.position||"right",o=e.dataset.apiUrl||Pt(),s=e.dataset.screenshotServer||void 0;if(!t){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:r,userName:a}=await It(o,t);r&&new U({embedKey:t,apiUrl:o,position:i,reporterName:a,screenshotServerUrl:s})}function Pt(){const n=document.querySelectorAll("script[src*='punchbug']");if(n.length>0){const e=n[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function le(){const n=new URLSearchParams(window.location.search).get("pb_element");if(n)try{let e=function(){const o=t.getBoundingClientRect();i.style.top=o.top+"px",i.style.left=o.left+"px",i.style.width=o.width+"px",i.style.height=o.height+"px"};const t=document.querySelector(n);if(!t)return;t.scrollIntoView({block:"center",behavior:"smooth"});const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(i),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>{i.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{le(),ae()}):(le(),ae())})();
