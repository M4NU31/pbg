(function(){"use strict";class G{constructor(e,n){this.hoveredEl=null,this.highlightOverlay=null,this.onPick=e,this.onCancel=n,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){if(this.clearHighlight(),e.closest("#punchbug-root"))return;this.hoveredEl=e;const n=e.getBoundingClientRect(),r=document.createElement("div");r.id="pb-highlight-overlay",r.setAttribute("data-punchbug-ignore","true"),r.style.cssText=["position:fixed",`top:${n.top}px`,`left:${n.left}px`,`width:${n.width}px`,`height:${n.height}px`,"pointer-events:none","z-index:2147483645","outline:2px solid hsl(348,100%,52%)","outline-offset:2px","border-radius:2px","background:hsla(348,100%,52%,0.07)","box-sizing:border-box"].join(";"),document.body.appendChild(r),this.highlightOverlay=r}clearHighlight(){var e;(e=this.highlightOverlay)==null||e.remove(),this.highlightOverlay=null,this.hoveredEl=null}handleMouseOver(e){const n=e.target;n&&!n.closest("#punchbug-root")&&n!==this.highlightOverlay&&this.highlight(n)}handleMouseOut(e){this.hoveredEl===e.target&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const n=e.target;n&&!n.closest("#punchbug-root")&&n!==this.highlightOverlay&&(this.clearHighlight(),this.stop(),this.onPick({el:n,clientX:e.clientX,clientY:e.clientY,pageX:e.clientX+window.scrollX,pageY:e.clientY+window.scrollY}))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function K(t,e){const n=await fetch(`${t}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok){const r=await n.json().catch(()=>({}));throw new Error(r.error||"Failed to submit report")}return n.json()}class Y{constructor(e,n){this.screenshotFull="",this.shadow=e,this.opts=n,this.overlay=this.render(n)}setScreenshot(e,n){var a;this.screenshotFull=e;const r=this.shadow.getElementById("pb-sc-loader"),i=this.shadow.getElementById("pb-sc-wrap"),s=this.shadow.getElementById("pb-sc-img");if(!e){r==null||r.remove();return}const o=n||e;s&&(s.src=o),r&&(r.style.display="none"),i&&(i.style.display="block"),e&&((a=this.shadow.getElementById("pb-sc-expand"))==null||a.addEventListener("click",()=>{this.openLightbox(e)}))}render(e){var c;const n=document.createElement("div");n.className="pb-overlay";const r=document.createElement("div");r.className="pb-form-card";const i=e.columns.length>0?`<div class="pb-field">
           <label class="pb-label" for="pb-column">Add to column</label>
           <select class="pb-input" id="pb-column">
             ${e.columns.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")}
           </select>
         </div>`:"",s=e.tags.length>0?`<div class="pb-field">
           <label class="pb-label">Tags</label>
           <div class="pb-tags-grid" id="pb-tags">
             ${e.tags.map(l=>`
               <label class="pb-tag-option">
                 <input type="checkbox" class="pb-tag-cb" value="${l.id}" style="display:none" />
                 <span class="pb-tag-pill" data-tag-id="${l.id}"
                       style="background:${l.color}22;color:${l.color};border:1px solid ${l.color}55">
                   ${l.name}
                 </span>
               </label>`).join("")}
           </div>
         </div>`:"";r.innerHTML=`
      <div class="pb-form-header">
        <h2 class="pb-form-title">Report a Task</h2>
        <button class="pb-close-btn" id="pb-close">&#x2715;</button>
      </div>

      <!-- Screenshot area: loader shown first, image injected async -->
      <div id="pb-sc-loader" class="pb-sc-loader">
        <span class="pb-sc-spinner"></span>
        <span style="font-size:12px;color:#9ca3af;margin-left:8px">Capturing screenshot…</span>
      </div>
      <div id="pb-sc-wrap" class="pb-screenshot-wrap" style="display:none">
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

      <div class="pb-info-box">
        <div class="pb-info-row">
          <span>&#127760;</span>
          <span style="word-break:break-all">${e.pageUrl}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128187;</span>
          <span>${e.browserMeta.browserName} ${e.browserMeta.browserVersion}
                &bull; ${e.browserMeta.osName}
                &bull; ${e.browserMeta.screenWidth}&#xd7;${e.browserMeta.screenHeight}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128279;</span>
          <code style="font-size:11px">${e.domInfo.selector}</code>
        </div>
      </div>

      <div id="pb-report-form">
        <div class="pb-field">
          <label class="pb-label" for="pb-title">What happened? *</label>
          <input class="pb-input" id="pb-title" type="text"
                 placeholder="Button not responding, layout broken, etc." />
        </div>
        <div class="pb-field">
          <label class="pb-label" for="pb-desc">More details</label>
          <textarea class="pb-textarea" id="pb-desc"
                    placeholder="Steps to reproduce, expected vs actual behavior…"></textarea>
        </div>
        ${i}
        ${s}
        <button class="pb-submit-btn" id="pb-submit">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,n.appendChild(r),this.shadow.appendChild(n);const o=()=>this.close(e.onClose);(c=this.shadow.getElementById("pb-close"))==null||c.addEventListener("click",o),n.addEventListener("click",l=>{l.target===n&&o()}),this.shadow.querySelectorAll(".pb-tag-pill").forEach(l=>{l.style.opacity="0.55",l.addEventListener("click",()=>{const h=this.shadow.querySelector(`.pb-tag-cb[value="${l.dataset.tagId}"]`);h&&(h.checked=!h.checked,l.style.opacity=h.checked?"1":"0.55",l.style.fontWeight=h.checked?"600":"400")})});const a=this.shadow.getElementById("pb-submit");return a==null||a.addEventListener("click",async()=>{var N,_,q;const l=this.shadow.getElementById("pb-title").value.trim();if(!l){this.shadow.getElementById("pb-title").focus();return}const h=this.shadow.getElementById("pb-desc").value.trim(),g=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0,v=e.tags.length>0?Array.from(this.shadow.querySelectorAll(".pb-tag-cb:checked")).map(f=>f.value):[];a.disabled=!0,a.textContent="Submitting…";try{const f=this.screenshotFull.startsWith("http");await K(e.apiUrl,{embedKey:e.embedKey,title:l,description:h||void 0,screenshot:f?void 0:this.screenshotFull,screenshotUrl:f?this.screenshotFull:void 0,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:g,tagIds:v.length>0?v:void 0,reporterName:e.reporterName,browserMeta:e.browserMeta,pinX:e.pinX,pinY:e.pinY}),this.shadow.getElementById("pb-report-form").style.display="none",this.shadow.getElementById("pb-success").style.display="block",(N=this.shadow.getElementById("pb-sc-loader"))==null||N.remove(),(_=this.shadow.getElementById("pb-sc-wrap"))==null||_.remove(),(q=e.onSuccess)==null||q.call(e),setTimeout(()=>this.close(),3e3)}catch(f){a.disabled=!1,a.textContent="Submit Task",alert("Failed to submit: "+(f instanceof Error?f.message:"Unknown error"))}}),n}openLightbox(e){const n=document.createElement("div");n.className="pb-lightbox";const r=document.createElement("img");r.className="pb-lightbox-img",r.src=e;const i=document.createElement("button");i.className="pb-lightbox-close",i.innerHTML="&#x2715;",i.addEventListener("click",()=>n.remove()),n.addEventListener("click",s=>{s.target===n&&n.remove()}),n.appendChild(i),n.appendChild(r),this.shadow.appendChild(n)}close(e){this.overlay.remove(),e==null||e()}}const X={BACKLOG:"#6b7280",TODO:"hsl(348,100%,52%)",DOING:"#f59e0b",DONE:"#10b981",CLOSED:"#6b7280"},J={LOW:"#6b7280",MEDIUM:"hsl(348,100%,52%)",HIGH:"#f59e0b",CRITICAL:"#ef4444"};class Q{constructor(e){this.overlay=null,this.shadow=e}show(e,n,r){var l,h;this.close();const i=document.createElement("div");i.className="pb-overlay";const s=document.createElement("div");s.className="pb-form-card pb-task-panel";const o=X[e.status]??"#6b7280",a=J[e.priority]??"#6b7280",c=e.screenshotUrl?`<div class="pb-screenshot-wrap">
           <img class="pb-screenshot-preview pb-screenshot-task" src="${e.screenshotUrl}" alt="Screenshot" />
           <button class="pb-screenshot-expand" id="pb-tp-expand" title="View full screenshot">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
               <polyline points="15 3 21 3 21 9"></polyline>
               <polyline points="9 21 3 21 3 15"></polyline>
               <line x1="21" y1="3" x2="14" y2="10"></line>
               <line x1="3" y1="21" x2="10" y2="14"></line>
             </svg>
           </button>
         </div>`:"";s.innerHTML=`
      <div class="pb-form-header">
        <span style="font-size:12px;color:#6b7280;font-weight:600">#${e.taskNumber}</span>
        <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
      </div>
      <p style="font-size:15px;font-weight:600;color:#111;margin:0 0 10px">${e.title}</p>
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${o}22;color:${o}">${e.status}</span>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${a}22;color:${a}">${e.priority}</span>
      </div>
      ${c}
      ${e.guestName?`<p style="font-size:12px;color:#6b7280;margin:0 0 12px">Reported by <strong>${e.guestName}</strong></p>`:""}
      <a href="${r}/projects/${n}?task=${e.id}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;background:hsl(348,100%,52%);color:white;border-radius:6px;padding:8px;font-size:13px;font-weight:600;text-decoration:none">
        View in board →
      </a>
    `,i.appendChild(s),this.shadow.appendChild(i),this.overlay=i,(l=this.shadow.getElementById("pb-tpanel-close"))==null||l.addEventListener("click",()=>this.close()),i.addEventListener("click",g=>{g.target===i&&this.close()}),e.screenshotUrl&&((h=this.shadow.getElementById("pb-tp-expand"))==null||h.addEventListener("click",()=>{this.openLightbox(e.screenshotUrl)}))}openLightbox(e){const n=document.createElement("div");n.className="pb-lightbox";const r=document.createElement("img");r.className="pb-lightbox-img",r.src=e;const i=document.createElement("button");i.className="pb-lightbox-close",i.innerHTML="&#x2715;",i.addEventListener("click",()=>n.remove()),n.addEventListener("click",s=>{s.target===n&&n.remove()}),n.appendChild(i),n.appendChild(r),this.shadow.appendChild(n)}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function Z(t){return{selector:ee(t),outerHtml:t.outerHTML.slice(0,2e3)}}function ee(t){var r;const e=[];let n=t;for(;n&&n!==document.body&&n.nodeType===Node.ELEMENT_NODE;){let i=n.tagName.toLowerCase();if(n.id){e.unshift(`#${CSS.escape(n.id)}`);break}const s=(r=n.parentElement)==null?void 0:r.children;if(s&&s.length>1){let o=1;for(let c=0;c<s.length&&s[c]!==n;c++)s[c].tagName===n.tagName&&o++;Array.from(s).filter(c=>c.tagName===n.tagName).length>1&&(i+=`:nth-of-type(${o})`)}if(e.unshift(i),n=n.parentElement,e.length>=6)break}return e.join(" > ")||t.tagName.toLowerCase()}function te(){const t=navigator.userAgent,{browserName:e,browserVersion:n}=ne(t),{osName:r,osVersion:i}=re(t),s=ie();return{browserName:e,browserVersion:n,osName:r,osVersion:i,deviceType:s,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:t}}function ne(t){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const n of e){const r=t.match(n.pattern);if(r)return{browserName:n.name,browserVersion:r[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function re(t){var e,n,r;return/Windows NT 10/.test(t)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(t)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(t)?{osName:"macOS",osVersion:((e=t.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(t)?{osName:"Android",osVersion:((n=t.match(/Android ([0-9.]+)/))==null?void 0:n[1])??""}:/iPhone OS ([0-9_]+)/.test(t)?{osName:"iOS",osVersion:((r=t.match(/iPhone OS ([0-9_]+)/))==null?void 0:r[1].replace(/_/g,"."))??""}:/Linux/.test(t)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function ie(){const t=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(t)?"mobile":/iPad|Android(?!.*Mobile)/.test(t)?"tablet":"desktop"}function se(t,e){if(t.match(/^[a-z]+:\/\//i))return t;if(t.match(/^\/\//))return window.location.protocol+t;if(t.match(/^[a-z]+:/i))return t;const n=document.implementation.createHTMLDocument(),r=n.createElement("base"),i=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(i),e&&(r.href=e),i.href=t,i.href}const oe=(()=>{let t=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${e()}${t}`)})();function u(t){const e=[];for(let n=0,r=t.length;n<r;n++)e.push(t[n]);return e}let m=null;function P(t={}){return m||(t.includeStyleProperties?(m=t.includeStyleProperties,m):(m=u(window.getComputedStyle(document.documentElement)),m))}function w(t,e){const r=(t.ownerDocument.defaultView||window).getComputedStyle(t).getPropertyValue(e);return r?parseFloat(r.replace("px","")):0}function ae(t){const e=w(t,"border-left-width"),n=w(t,"border-right-width");return t.clientWidth+e+n}function ce(t){const e=w(t,"border-top-width"),n=w(t,"border-bottom-width");return t.clientHeight+e+n}function L(t,e={}){const n=e.width||ae(t),r=e.height||ce(t);return{width:n,height:r}}function le(){let t,e;try{e=process}catch{}const n=e&&e.env?e.env.devicePixelRatio:null;return n&&(t=parseInt(n,10),Number.isNaN(t)&&(t=1)),t||window.devicePixelRatio||1}const p=16384;function he(t){(t.width>p||t.height>p)&&(t.width>p&&t.height>p?t.width>t.height?(t.height*=p/t.width,t.width=p):(t.width*=p/t.height,t.height=p):t.width>p?(t.height*=p/t.width,t.width=p):(t.width*=p/t.height,t.height=p))}function y(t){return new Promise((e,n)=>{const r=new Image;r.onload=()=>{r.decode().then(()=>{requestAnimationFrame(()=>e(r))})},r.onerror=n,r.crossOrigin="anonymous",r.decoding="async",r.src=t})}async function de(t){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(t)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function pe(t,e,n){const r="http://www.w3.org/2000/svg",i=document.createElementNS(r,"svg"),s=document.createElementNS(r,"foreignObject");return i.setAttribute("width",`${e}`),i.setAttribute("height",`${n}`),i.setAttribute("viewBox",`0 0 ${e} ${n}`),s.setAttribute("width","100%"),s.setAttribute("height","100%"),s.setAttribute("x","0"),s.setAttribute("y","0"),s.setAttribute("externalResourcesRequired","true"),i.appendChild(s),s.appendChild(t),de(i)}const d=(t,e)=>{if(t instanceof e)return!0;const n=Object.getPrototypeOf(t);return n===null?!1:n.constructor.name===e.name||d(n,e)};function ue(t){const e=t.getPropertyValue("content");return`${t.cssText} content: '${e.replace(/'|"/g,"")}';`}function ge(t,e){return P(e).map(n=>{const r=t.getPropertyValue(n),i=t.getPropertyPriority(n);return`${n}: ${r}${i?" !important":""};`}).join(" ")}function fe(t,e,n,r){const i=`.${t}:${e}`,s=n.cssText?ue(n):ge(n,r);return document.createTextNode(`${i}{${s}}`)}function $(t,e,n,r){const i=window.getComputedStyle(t,n),s=i.getPropertyValue("content");if(s===""||s==="none")return;const o=oe();try{e.className=`${e.className} ${o}`}catch{return}const a=document.createElement("style");a.appendChild(fe(o,n,i,r)),e.appendChild(a)}function me(t,e,n){$(t,e,":before",n),$(t,e,":after",n)}const R="application/font-woff",T="image/jpeg",be={woff:R,woff2:R,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:T,jpeg:T,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function we(t){const e=/\.([^./]*?)$/g.exec(t);return e?e[1]:""}function E(t){const e=we(t).toLowerCase();return be[e]||""}function ye(t){return t.split(/,/)[1]}function k(t){return t.search(/^(data:)/)!==-1}function xe(t,e){return`data:${e};base64,${t}`}async function I(t,e,n){const r=await fetch(t,e);if(r.status===404)throw new Error(`Resource "${r.url}" not found`);const i=await r.blob();return new Promise((s,o)=>{const a=new FileReader;a.onerror=o,a.onloadend=()=>{try{s(n({res:r,result:a.result}))}catch(c){o(c)}},a.readAsDataURL(i)})}const S={};function ve(t,e,n){let r=t.replace(/\?.*/,"");return n&&(r=t),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,"")),e?`[${e}]${r}`:r}async function C(t,e,n){const r=ve(t,e,n.includeQueryParams);if(S[r]!=null)return S[r];n.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+new Date().getTime());let i;try{const s=await I(t,n.fetchRequestInit,({res:o,result:a})=>(e||(e=o.headers.get("Content-Type")||""),ye(a)));i=xe(s,e)}catch(s){i=n.imagePlaceholder||"";let o=`Failed to fetch resource: ${t}`;s&&(o=typeof s=="string"?s:s.message),o&&console.warn(o)}return S[r]=i,i}async function Ee(t){const e=t.toDataURL();return e==="data:,"?t.cloneNode(!1):y(e)}async function ke(t,e){if(t.currentSrc){const s=document.createElement("canvas"),o=s.getContext("2d");s.width=t.clientWidth,s.height=t.clientHeight,o==null||o.drawImage(t,0,0,s.width,s.height);const a=s.toDataURL();return y(a)}const n=t.poster,r=E(n),i=await C(n,r,e);return y(i)}async function Se(t,e){var n;try{if(!((n=t==null?void 0:t.contentDocument)===null||n===void 0)&&n.body)return await x(t.contentDocument.body,e,!0)}catch{}return t.cloneNode(!1)}async function Ce(t,e){return d(t,HTMLCanvasElement)?Ee(t):d(t,HTMLVideoElement)?ke(t,e):d(t,HTMLIFrameElement)?Se(t,e):t.cloneNode(M(t))}const Pe=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SLOT",M=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SVG";async function Le(t,e,n){var r,i;if(M(e))return e;let s=[];return Pe(t)&&t.assignedNodes?s=u(t.assignedNodes()):d(t,HTMLIFrameElement)&&(!((r=t.contentDocument)===null||r===void 0)&&r.body)?s=u(t.contentDocument.body.childNodes):s=u(((i=t.shadowRoot)!==null&&i!==void 0?i:t).childNodes),s.length===0||d(t,HTMLVideoElement)||await s.reduce((o,a)=>o.then(()=>x(a,n)).then(c=>{c&&e.appendChild(c)}),Promise.resolve()),e}function $e(t,e,n){const r=e.style;if(!r)return;const i=window.getComputedStyle(t);i.cssText?(r.cssText=i.cssText,r.transformOrigin=i.transformOrigin):P(n).forEach(s=>{let o=i.getPropertyValue(s);s==="font-size"&&o.endsWith("px")&&(o=`${Math.floor(parseFloat(o.substring(0,o.length-2)))-.1}px`),d(t,HTMLIFrameElement)&&s==="display"&&o==="inline"&&(o="block"),s==="d"&&e.getAttribute("d")&&(o=`path(${e.getAttribute("d")})`),r.setProperty(s,o,i.getPropertyPriority(s))})}function Re(t,e){d(t,HTMLTextAreaElement)&&(e.innerHTML=t.value),d(t,HTMLInputElement)&&e.setAttribute("value",t.value)}function Te(t,e){if(d(t,HTMLSelectElement)){const n=e,r=Array.from(n.children).find(i=>t.value===i.getAttribute("value"));r&&r.setAttribute("selected","")}}function Ie(t,e,n){return d(e,Element)&&($e(t,e,n),me(t,e,n),Re(t,e),Te(t,e)),e}async function Me(t,e){const n=t.querySelectorAll?t.querySelectorAll("use"):[];if(n.length===0)return t;const r={};for(let s=0;s<n.length;s++){const a=n[s].getAttribute("xlink:href");if(a){const c=t.querySelector(a),l=document.querySelector(a);!c&&l&&!r[a]&&(r[a]=await x(l,e,!0))}}const i=Object.values(r);if(i.length){const s="http://www.w3.org/1999/xhtml",o=document.createElementNS(s,"svg");o.setAttribute("xmlns",s),o.style.position="absolute",o.style.width="0",o.style.height="0",o.style.overflow="hidden",o.style.display="none";const a=document.createElementNS(s,"defs");o.appendChild(a);for(let c=0;c<i.length;c++)a.appendChild(i[c]);t.appendChild(o)}return t}async function x(t,e,n){return!n&&e.filter&&!e.filter(t)?null:Promise.resolve(t).then(r=>Ce(r,e)).then(r=>Le(t,r,e)).then(r=>Ie(t,r,e)).then(r=>Me(r,e))}const O=/url\((['"]?)([^'"]+?)\1\)/g,Oe=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Ue=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Be(t){const e=t.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function Ae(t){const e=[];return t.replace(O,(n,r,i)=>(e.push(i),n)),e.filter(n=>!k(n))}async function ze(t,e,n,r,i){try{const s=n?se(e,n):e,o=E(e);let a;return i||(a=await C(s,o,r)),t.replace(Be(e),`$1${a}$3`)}catch{}return t}function He(t,{preferredFontFormat:e}){return e?t.replace(Ue,n=>{for(;;){const[r,,i]=Oe.exec(n)||[];if(!i)return"";if(i===e)return`src: ${r};`}}):t}function U(t){return t.search(O)!==-1}async function B(t,e,n){if(!U(t))return t;const r=He(t,n);return Ae(r).reduce((s,o)=>s.then(a=>ze(a,o,e,n)),Promise.resolve(r))}async function b(t,e,n){var r;const i=(r=e.style)===null||r===void 0?void 0:r.getPropertyValue(t);if(i){const s=await B(i,null,n);return e.style.setProperty(t,s,e.style.getPropertyPriority(t)),!0}return!1}async function Fe(t,e){await b("background",t,e)||await b("background-image",t,e),await b("mask",t,e)||await b("-webkit-mask",t,e)||await b("mask-image",t,e)||await b("-webkit-mask-image",t,e)}async function De(t,e){const n=d(t,HTMLImageElement);if(!(n&&!k(t.src))&&!(d(t,SVGImageElement)&&!k(t.href.baseVal)))return;const r=n?t.src:t.href.baseVal,i=await C(r,E(r),e);await new Promise((s,o)=>{t.onload=s,t.onerror=e.onImageErrorHandler?(...c)=>{try{s(e.onImageErrorHandler(...c))}catch(l){o(l)}}:o;const a=t;a.decode&&(a.decode=s),a.loading==="lazy"&&(a.loading="eager"),n?(t.srcset="",t.src=i):t.href.baseVal=i})}async function je(t,e){const r=u(t.childNodes).map(i=>A(i,e));await Promise.all(r).then(()=>t)}async function A(t,e){d(t,Element)&&(await Fe(t,e),await De(t,e),await je(t,e))}function Ve(t,e){const{style:n}=t;e.backgroundColor&&(n.backgroundColor=e.backgroundColor),e.width&&(n.width=`${e.width}px`),e.height&&(n.height=`${e.height}px`);const r=e.style;return r!=null&&Object.keys(r).forEach(i=>{n[i]=r[i]}),t}const z={};async function H(t){let e=z[t];if(e!=null)return e;const r=await(await fetch(t)).text();return e={url:t,cssText:r},z[t]=e,e}async function F(t,e){let n=t.cssText;const r=/url\(["']?([^"')]+)["']?\)/g,s=(n.match(/url\([^)]+\)/g)||[]).map(async o=>{let a=o.replace(r,"$1");return a.startsWith("https://")||(a=new URL(a,t.url).href),I(a,e.fetchRequestInit,({result:c})=>(n=n.replace(o,`url(${c})`),[o,c]))});return Promise.all(s).then(()=>n)}function D(t){if(t==null)return[];const e=[],n=/(\/\*[\s\S]*?\*\/)/gi;let r=t.replace(n,"");const i=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const c=i.exec(r);if(c===null)break;e.push(c[0])}r=r.replace(i,"");const s=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",a=new RegExp(o,"gi");for(;;){let c=s.exec(r);if(c===null){if(c=a.exec(r),c===null)break;s.lastIndex=a.lastIndex}else a.lastIndex=s.lastIndex;e.push(c[0])}return e}async function We(t,e){const n=[],r=[];return t.forEach(i=>{if("cssRules"in i)try{u(i.cssRules||[]).forEach((s,o)=>{if(s.type===CSSRule.IMPORT_RULE){let a=o+1;const c=s.href,l=H(c).then(h=>F(h,e)).then(h=>D(h).forEach(g=>{try{i.insertRule(g,g.startsWith("@import")?a+=1:i.cssRules.length)}catch(v){console.error("Error inserting rule from remote css",{rule:g,error:v})}})).catch(h=>{console.error("Error loading remote css",h.toString())});r.push(l)}})}catch(s){const o=t.find(a=>a.href==null)||document.styleSheets[0];i.href!=null&&r.push(H(i.href).then(a=>F(a,e)).then(a=>D(a).forEach(c=>{o.insertRule(c,o.cssRules.length)})).catch(a=>{console.error("Error loading remote stylesheet",a)})),console.error("Error inlining remote css file",s)}}),Promise.all(r).then(()=>(t.forEach(i=>{if("cssRules"in i)try{u(i.cssRules||[]).forEach(s=>{n.push(s)})}catch(s){console.error(`Error while reading CSS rules from ${i.href}`,s)}}),n))}function Ne(t){return t.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>U(e.style.getPropertyValue("src")))}async function _e(t,e){if(t.ownerDocument==null)throw new Error("Provided element is not within a Document");const n=u(t.ownerDocument.styleSheets),r=await We(n,e);return Ne(r)}function j(t){return t.trim().replace(/["']/g,"")}function qe(t){const e=new Set;function n(r){(r.style.fontFamily||getComputedStyle(r).fontFamily).split(",").forEach(s=>{e.add(j(s))}),Array.from(r.children).forEach(s=>{s instanceof HTMLElement&&n(s)})}return n(t),e}async function Ge(t,e){const n=await _e(t,e),r=qe(t);return(await Promise.all(n.filter(s=>r.has(j(s.style.fontFamily))).map(s=>{const o=s.parentStyleSheet?s.parentStyleSheet.href:null;return B(s.cssText,o,e)}))).join(`
`)}async function Ke(t,e){const n=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await Ge(t,e);if(n){const r=document.createElement("style"),i=document.createTextNode(n);r.appendChild(i),t.firstChild?t.insertBefore(r,t.firstChild):t.appendChild(r)}}async function Ye(t,e={}){const{width:n,height:r}=L(t,e),i=await x(t,e,!0);return await Ke(i,e),await A(i,e),Ve(i,e),await pe(i,n,r)}async function Xe(t,e={}){const{width:n,height:r}=L(t,e),i=await Ye(t,e),s=await y(i),o=document.createElement("canvas"),a=o.getContext("2d"),c=e.pixelRatio||le(),l=e.canvasWidth||n,h=e.canvasHeight||r;return o.width=l*c,o.height=h*c,e.skipAutoScale||he(o),o.style.width=`${l}`,o.style.height=`${h}`,e.backgroundColor&&(a.fillStyle=e.backgroundColor,a.fillRect(0,0,o.width,o.height)),a.drawImage(s,0,0,o.width,o.height),o}async function Je(t,e={}){return(await Xe(t,e)).toDataURL()}async function Qe(t,e){const n=await fetch(`${t.replace(/\/$/,"")}/screenshot`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:e.url,x:e.x,y:e.y,delay:e.delay??1500,viewportWidth:e.viewportWidth??window.innerWidth,viewportHeight:e.viewportHeight??window.innerHeight,cropWidth:480,cropHeight:320})});if(!n.ok){const i=await n.json().catch(()=>({}));throw new Error(i.error??`Server error ${n.status}`)}const{url:r}=await n.json();if(!r)throw new Error("Screenshot server returned no URL");return r}async function Ze(t){let e=t,n=t.parentElement;for(;n&&n.tagName!=="BODY";){const r=n.getBoundingClientRect();if(r.width>=200&&r.height>=60){e=n;break}n=n.parentElement}try{const r=await Je(e,{cacheBust:!0,pixelRatio:1,skipFonts:!1,filter:i=>{var s;return!((s=i.hasAttribute)!=null&&s.call(i,"data-punchbug-ignore"))&&i.id!=="punchbug-root"}});return{full:r,thumb:r}}catch{return{full:"",thumb:""}}}const et=`
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

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
    box-shadow: -2px 0 12px rgba(0,0,0,0.15);
    transition: background 0.2s;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .pb-trigger:hover {
    background: hsl(348,100%,42%);
  }

  .pb-trigger.pb-active {
    background: hsl(348,100%,30%);
  }

  .pb-trigger svg {
    width: 18px;
    height: 18px;
    writing-mode: horizontal-tb;
  }

  /* Overlay form */
  .pb-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pb-form-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    width: 480px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    padding: 24px;
  }

  .pb-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .pb-form-title {
    font-size: 18px;
    font-weight: 700;
    color: #111;
    margin: 0;
  }

  .pb-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 4px;
    border-radius: 4px;
    font-size: 20px;
    line-height: 1;
  }

  .pb-close-btn:hover {
    background: #f3f4f6;
  }

  /* Screenshot loading placeholder */
  .pb-sc-loader {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border: 1px dashed #d1d5db;
    border-radius: 8px;
    margin-bottom: 16px;
    background: #fafafa;
  }

  .pb-sc-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top-color: hsl(348,100%,52%);
    border-radius: 50%;
    animation: pb-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes pb-spin {
    to { transform: rotate(360deg); }
  }

  /* Screenshot thumbnail with expand button */
  .pb-screenshot-wrap {
    position: relative;
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    cursor: zoom-in;
  }

  .pb-screenshot-preview {
    width: 100%;
    max-height: 180px;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .pb-screenshot-task {
    max-height: 140px;
  }

  .pb-screenshot-expand {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(0,0,0,0.55);
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
  }

  .pb-screenshot-wrap:hover .pb-screenshot-expand {
    opacity: 1;
  }

  /* Lightbox for full screenshot */
  .pb-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
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
    top: 16px;
    right: 16px;
    background: rgba(255,255,255,0.15);
    color: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .pb-lightbox-close:hover {
    background: rgba(255,255,255,0.25);
  }

  .pb-field {
    margin-bottom: 14px;
  }

  .pb-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 5px;
  }

  .pb-input, .pb-textarea, select.pb-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
    color: #111;
  }

  .pb-input:focus, .pb-textarea:focus, select.pb-input:focus {
    border-color: hsl(348,100%,52%);
    box-shadow: 0 0 0 3px hsla(348,100%,52%,0.12);
  }

  .pb-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .pb-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .pb-info-box {
    background: #f3f4f6;
    border-radius: 6px;
    padding: 10px;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 14px;
  }

  .pb-info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .pb-info-row:last-child {
    margin-bottom: 0;
  }

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
    margin-top: 8px;
  }

  .pb-submit-btn:hover:not(:disabled) {
    background: hsl(348,100%,42%);
  }

  .pb-submit-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  /* Picking cursor mode */
  .pb-picking-active * {
    cursor: crosshair !important;
  }

  /* Ghost pin drop animation (runs outside shadow DOM, injected via <style> in <head>) */

  /* Tags */
  .pb-tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .pb-tag-option {
    cursor: pointer;
  }

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

  /* Success */
  .pb-success {
    text-align: center;
    padding: 20px;
  }

  .pb-success-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .pb-success-title {
    font-size: 18px;
    font-weight: 700;
    color: #111;
    margin-bottom: 8px;
  }

  .pb-success-text {
    font-size: 14px;
    color: #6b7280;
  }

  .pb-badge {
    display: inline-flex;
    align-items: center;
    background: hsl(348,100%,97%);
    color: hsl(348,100%,35%);
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
  }
`;class tt{constructor(e){if(this.picker=null,this.isPicking=!1,this.columns=[],this.tags=[],this.projectId="",this.pinCleanups=[],this.ghostPin=null,this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),!document.getElementById("pb-global-styles")){const r=document.createElement("style");r.id="pb-global-styles",r.textContent=`
        @keyframes pb-pin-drop {
          0%   { transform: translateY(-14px) scale(0.8); opacity: 0; }
          65%  { transform: translateY(4px)   scale(1.06); opacity: 1; }
          100% { transform: translateY(0)     scale(1);    opacity: 1; }
        }`,document.head.appendChild(r)}this.shadow=this.hostEl.attachShadow({mode:"open"});const n=document.createElement("style");n.textContent=et,this.shadow.appendChild(n),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.title="Report a task",this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                 M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new Q(this.shadow),this.fetchColumns(),this.fetchTags(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchTags(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.tags=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),n=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!n.ok)return;const r=await n.json();this.projectId=r.projectId,this.createPins(r.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(n=>n()),this.pinCleanups=[];for(const n of e)if(n.pinX!==null&&n.pinY!==null)this.createPinAtCoords(n);else if(n.domSelector)try{const r=document.querySelector(n.domSelector);r&&this.createPinOnElement(r,n)}catch{}}createPinAtCoords(e){const n=this.buildPin(e.taskNumber);n.style.position="absolute",n.style.top=`${(e.pinY??0)-11}px`,n.style.left=`${(e.pinX??0)-11}px`,document.body.appendChild(n),n.addEventListener("click",r=>{r.stopPropagation(),this.taskPanel.show(e,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>n.remove())}createPinOnElement(e,n){const r=this.buildPin(n.taskNumber);r.style.position="absolute",document.body.appendChild(r);const i=()=>{const s=e.getBoundingClientRect();r.style.top=`${s.top+window.scrollY-11}px`,r.style.left=`${s.right+window.scrollX-11}px`};i(),window.addEventListener("scroll",i,{passive:!0}),window.addEventListener("resize",i,{passive:!0}),r.addEventListener("click",s=>{s.stopPropagation(),this.taskPanel.show(n,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",i),window.removeEventListener("resize",i),r.remove()})}buildPin(e){const n=document.createElement("button");return n.setAttribute("data-punchbug-ignore","true"),n.textContent=String(e),n.style.cssText="z-index:2147483644;background:hsl(348,100%,52%);color:#fff;border:2.5px solid #fff;border-radius:50%;width:24px;height:24px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",n.onmouseenter=()=>{n.style.transform="scale(1.25)",n.style.background="hsl(348,100%,42%)"},n.onmouseleave=()=>{n.style.transform="",n.style.background="hsl(348,100%,52%)"},n}showGhostPin(e,n){this.removeGhostPin();const r=document.createElement("div");r.setAttribute("data-punchbug-ignore","true"),r.innerHTML=`
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
              fill="hsl(348,100%,52%)" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`,r.style.cssText=`position:absolute;top:${n-32}px;left:${e-14}px;z-index:2147483644;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));animation:pb-pin-drop 0.25s cubic-bezier(0.34,1.56,0.64,1);`,document.body.appendChild(r),this.ghostPin=r}removeGhostPin(){var e;(e=this.ghostPin)==null||e.remove(),this.ghostPin=null}refreshPins(){this.fetchPageTasks()}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click anywhere — Esc to cancel";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Cancel"),this.picker=new G(n=>this.onPicked(n),()=>this.stopPicking()),this.picker.start()}stopPicking(){var n;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Report"),(n=this.picker)==null||n.stop(),this.picker=null}async onPicked({el:e,pageX:n,pageY:r}){this.stopPicking(),this.showGhostPin(n,r);const i=new Y(this.shadow,{domInfo:Z(e),browserMeta:te(),pageUrl:window.location.href,pinX:n,pinY:r,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,tags:this.tags,reporterName:this.config.reporterName,onSuccess:()=>{this.removeGhostPin(),this.refreshPins()},onClose:()=>this.removeGhostPin()});this.captureScreenshot(e,n,r).then(({full:s,thumb:o})=>i.setScreenshot(s,o)).catch(()=>i.setScreenshot(""))}async captureScreenshot(e,n,r){const i=this.config.screenshotServerUrl;if(i)try{const s=await Qe(i,{url:window.location.href,x:n,y:r,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight});return{full:s,thumb:s}}catch(s){console.warn("PunchBug: screenshot server failed, falling back",s)}return Ze(e)}}async function nt(t,e){try{const r=`${new URL(t).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,i=await fetch(r,{credentials:"include"});if(!i.ok)return{allowed:!1};const s=await i.json();return{allowed:s.allowed===!0,userName:s.userName||void 0}}catch{return{allowed:!1}}}async function V(){const t=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:t.length>0&&(e=t[t.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const n=e.dataset.key,r=e.dataset.position||"right",i=e.dataset.apiUrl||rt(),s=e.dataset.screenshotServer||void 0;if(!n){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:o,userName:a}=await nt(i,n);o&&new tt({embedKey:n,apiUrl:i,position:r,reporterName:a,screenshotServerUrl:s})}function rt(){const t=document.querySelectorAll("script[src*='punchbug']");if(t.length>0){const e=t[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function W(){const t=new URLSearchParams(window.location.search).get("pb_element");if(t)try{let e=function(){const i=n.getBoundingClientRect();r.style.top=i.top+"px",r.style.left=i.left+"px",r.style.width=i.width+"px",r.style.height=i.height+"px"};const n=document.querySelector(t);if(!n)return;n.scrollIntoView({block:"center",behavior:"smooth"});const r=document.createElement("div");r.setAttribute("data-punchbug-ignore","true"),r.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(r),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{r.style.opacity="0",setTimeout(()=>{r.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{W(),V()}):(W(),V())})();
