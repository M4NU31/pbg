(function(){"use strict";class Y{constructor(e,n){this.hoveredEl=null,this.highlightOverlay=null,this.onPick=e,this.onCancel=n,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){if(this.clearHighlight(),e.closest("#punchbug-root"))return;this.hoveredEl=e;const n=e.getBoundingClientRect(),i=document.createElement("div");i.id="pb-highlight-overlay",i.setAttribute("data-punchbug-ignore","true"),i.style.cssText=["position:fixed",`top:${n.top}px`,`left:${n.left}px`,`width:${n.width}px`,`height:${n.height}px`,"pointer-events:none","z-index:2147483645","outline:2px solid hsl(348,100%,52%)","outline-offset:2px","border-radius:2px","background:hsla(348,100%,52%,0.07)","box-sizing:border-box"].join(";"),document.body.appendChild(i),this.highlightOverlay=i}clearHighlight(){var e;(e=this.highlightOverlay)==null||e.remove(),this.highlightOverlay=null,this.hoveredEl=null}handleMouseOver(e){const n=e.target;n&&!n.closest("#punchbug-root")&&n!==this.highlightOverlay&&this.highlight(n)}handleMouseOut(e){this.hoveredEl===e.target&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const n=e.target;n&&!n.closest("#punchbug-root")&&n!==this.highlightOverlay&&(this.clearHighlight(),this.stop(),this.onPick({el:n,clientX:e.clientX,clientY:e.clientY,pageX:e.clientX+window.scrollX,pageY:e.clientY+window.scrollY}))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function K(t,e){const n=await fetch(`${t}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok){const i=await n.json().catch(()=>({}));throw new Error(i.error||"Failed to submit report")}return n.json()}class J{constructor(e,n){this.screenshotFull="",this.shadow=e,this.opts=n,this.overlay=this.render(n)}setScreenshot(e,n){var a;this.screenshotFull=e;const i=this.shadow.getElementById("pb-sc-loader"),r=this.shadow.getElementById("pb-sc-wrap"),s=this.shadow.getElementById("pb-sc-img");if(!e){i==null||i.remove();return}const o=n||e;s&&(s.src=o),i&&(i.style.display="none"),r&&(r.style.display="block"),e&&((a=this.shadow.getElementById("pb-sc-expand"))==null||a.addEventListener("click",()=>{this.openLightbox(e)}))}render(e){var c;const n=document.createElement("div");n.className="pb-overlay";const i=document.createElement("div");i.className="pb-form-card";const r=e.columns.length>0?`<div class="pb-field">
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
         </div>`:"";i.innerHTML=`
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
        ${r}
        ${s}
        <button class="pb-submit-btn" id="pb-submit">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,n.appendChild(i),this.shadow.appendChild(n);const o=()=>this.close(e.onClose);(c=this.shadow.getElementById("pb-close"))==null||c.addEventListener("click",o),n.addEventListener("click",l=>{l.target===n&&o()}),this.shadow.querySelectorAll(".pb-tag-pill").forEach(l=>{l.style.opacity="0.55",l.addEventListener("click",()=>{const h=this.shadow.querySelector(`.pb-tag-cb[value="${l.dataset.tagId}"]`);h&&(h.checked=!h.checked,l.style.opacity=h.checked?"1":"0.55",l.style.fontWeight=h.checked?"600":"400")})});const a=this.shadow.getElementById("pb-submit");return a==null||a.addEventListener("click",async()=>{var f,k,S;const l=this.shadow.getElementById("pb-title").value.trim();if(!l){this.shadow.getElementById("pb-title").focus();return}const h=this.shadow.getElementById("pb-desc").value.trim(),p=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0,m=e.tags.length>0?Array.from(this.shadow.querySelectorAll(".pb-tag-cb:checked")).map(b=>b.value):[];a.disabled=!0,a.textContent="Submitting…";try{const b=this.screenshotFull.startsWith("http");await K(e.apiUrl,{embedKey:e.embedKey,title:l,description:h||void 0,screenshot:b?void 0:this.screenshotFull,screenshotUrl:b?this.screenshotFull:void 0,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:p,tagIds:m.length>0?m:void 0,reporterName:e.reporterName,browserMeta:e.browserMeta,pinX:e.pinX,pinY:e.pinY}),this.shadow.getElementById("pb-report-form").style.display="none",this.shadow.getElementById("pb-success").style.display="block",(f=this.shadow.getElementById("pb-sc-loader"))==null||f.remove(),(k=this.shadow.getElementById("pb-sc-wrap"))==null||k.remove(),(S=e.onSuccess)==null||S.call(e),setTimeout(()=>this.close(),3e3)}catch(b){a.disabled=!1,a.textContent="Submit Task",alert("Failed to submit: "+(b instanceof Error?b.message:"Unknown error"))}}),n}openLightbox(e){const n=document.createElement("div");n.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const r=document.createElement("button");r.className="pb-lightbox-close",r.innerHTML="&#x2715;",r.addEventListener("click",()=>n.remove()),n.addEventListener("click",s=>{s.target===n&&n.remove()}),n.appendChild(r),n.appendChild(i),this.shadow.appendChild(n)}close(e){this.overlay.remove(),e==null||e()}}const Q={BACKLOG:"#6b7280",TODO:"hsl(348,100%,52%)",DOING:"#f59e0b",DONE:"#10b981",CLOSED:"#6b7280"},Z={LOW:"#6b7280",MEDIUM:"hsl(348,100%,52%)",HIGH:"#f59e0b",CRITICAL:"#ef4444"};class ee{constructor(e){this.overlay=null,this.shadow=e}show(e,n,i){var l,h;this.close();const r=document.createElement("div");r.className="pb-overlay";const s=document.createElement("div");s.className="pb-form-card pb-task-panel";const o=Q[e.status]??"#6b7280",a=Z[e.priority]??"#6b7280",c=e.screenshotUrl?`<div class="pb-screenshot-wrap">
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
      <a href="${i}/projects/${n}?task=${e.id}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;background:hsl(348,100%,52%);color:white;border-radius:6px;padding:8px;font-size:13px;font-weight:600;text-decoration:none">
        View in board →
      </a>
    `,r.appendChild(s),this.shadow.appendChild(r),this.overlay=r,(l=this.shadow.getElementById("pb-tpanel-close"))==null||l.addEventListener("click",()=>this.close()),r.addEventListener("click",p=>{p.target===r&&this.close()}),e.screenshotUrl&&((h=this.shadow.getElementById("pb-tp-expand"))==null||h.addEventListener("click",()=>{this.openLightbox(e.screenshotUrl)}))}openLightbox(e){const n=document.createElement("div");n.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const r=document.createElement("button");r.className="pb-lightbox-close",r.innerHTML="&#x2715;",r.addEventListener("click",()=>n.remove()),n.addEventListener("click",s=>{s.target===n&&n.remove()}),n.appendChild(r),n.appendChild(i),this.shadow.appendChild(n)}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function te(t){return{selector:ne(t),outerHtml:t.outerHTML.slice(0,2e3)}}function ne(t){var i;const e=[];let n=t;for(;n&&n!==document.body&&n.nodeType===Node.ELEMENT_NODE;){let r=n.tagName.toLowerCase();if(n.id){e.unshift(`#${CSS.escape(n.id)}`);break}const s=(i=n.parentElement)==null?void 0:i.children;if(s&&s.length>1){let o=1;for(let c=0;c<s.length&&s[c]!==n;c++)s[c].tagName===n.tagName&&o++;Array.from(s).filter(c=>c.tagName===n.tagName).length>1&&(r+=`:nth-of-type(${o})`)}if(e.unshift(r),n=n.parentElement,e.length>=6)break}return e.join(" > ")||t.tagName.toLowerCase()}function ie(){const t=navigator.userAgent,{browserName:e,browserVersion:n}=re(t),{osName:i,osVersion:r}=se(t),s=oe();return{browserName:e,browserVersion:n,osName:i,osVersion:r,deviceType:s,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:t}}function re(t){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const n of e){const i=t.match(n.pattern);if(i)return{browserName:n.name,browserVersion:i[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function se(t){var e,n,i;return/Windows NT 10/.test(t)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(t)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(t)?{osName:"macOS",osVersion:((e=t.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(t)?{osName:"Android",osVersion:((n=t.match(/Android ([0-9.]+)/))==null?void 0:n[1])??""}:/iPhone OS ([0-9_]+)/.test(t)?{osName:"iOS",osVersion:((i=t.match(/iPhone OS ([0-9_]+)/))==null?void 0:i[1].replace(/_/g,"."))??""}:/Linux/.test(t)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function oe(){const t=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(t)?"mobile":/iPad|Android(?!.*Mobile)/.test(t)?"tablet":"desktop"}function ae(t,e){if(t.match(/^[a-z]+:\/\//i))return t;if(t.match(/^\/\//))return window.location.protocol+t;if(t.match(/^[a-z]+:/i))return t;const n=document.implementation.createHTMLDocument(),i=n.createElement("base"),r=n.createElement("a");return n.head.appendChild(i),n.body.appendChild(r),e&&(i.href=e),r.href=t,r.href}const ce=(()=>{let t=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${e()}${t}`)})();function g(t){const e=[];for(let n=0,i=t.length;n<i;n++)e.push(t[n]);return e}let w=null;function R(t={}){return w||(t.includeStyleProperties?(w=t.includeStyleProperties,w):(w=g(window.getComputedStyle(document.documentElement)),w))}function x(t,e){const i=(t.ownerDocument.defaultView||window).getComputedStyle(t).getPropertyValue(e);return i?parseFloat(i.replace("px","")):0}function le(t){const e=x(t,"border-left-width"),n=x(t,"border-right-width");return t.clientWidth+e+n}function he(t){const e=x(t,"border-top-width"),n=x(t,"border-bottom-width");return t.clientHeight+e+n}function T(t,e={}){const n=e.width||le(t),i=e.height||he(t);return{width:n,height:i}}function de(){let t,e;try{e=process}catch{}const n=e&&e.env?e.env.devicePixelRatio:null;return n&&(t=parseInt(n,10),Number.isNaN(t)&&(t=1)),t||window.devicePixelRatio||1}const u=16384;function ue(t){(t.width>u||t.height>u)&&(t.width>u&&t.height>u?t.width>t.height?(t.height*=u/t.width,t.width=u):(t.width*=u/t.height,t.height=u):t.width>u?(t.height*=u/t.width,t.width=u):(t.width*=u/t.height,t.height=u))}function v(t){return new Promise((e,n)=>{const i=new Image;i.onload=()=>{i.decode().then(()=>{requestAnimationFrame(()=>e(i))})},i.onerror=n,i.crossOrigin="anonymous",i.decoding="async",i.src=t})}async function pe(t){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(t)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function ge(t,e,n){const i="http://www.w3.org/2000/svg",r=document.createElementNS(i,"svg"),s=document.createElementNS(i,"foreignObject");return r.setAttribute("width",`${e}`),r.setAttribute("height",`${n}`),r.setAttribute("viewBox",`0 0 ${e} ${n}`),s.setAttribute("width","100%"),s.setAttribute("height","100%"),s.setAttribute("x","0"),s.setAttribute("y","0"),s.setAttribute("externalResourcesRequired","true"),r.appendChild(s),s.appendChild(t),pe(r)}const d=(t,e)=>{if(t instanceof e)return!0;const n=Object.getPrototypeOf(t);return n===null?!1:n.constructor.name===e.name||d(n,e)};function me(t){const e=t.getPropertyValue("content");return`${t.cssText} content: '${e.replace(/'|"/g,"")}';`}function fe(t,e){return R(e).map(n=>{const i=t.getPropertyValue(n),r=t.getPropertyPriority(n);return`${n}: ${i}${r?" !important":""};`}).join(" ")}function be(t,e,n,i){const r=`.${t}:${e}`,s=n.cssText?me(n):fe(n,i);return document.createTextNode(`${r}{${s}}`)}function I(t,e,n,i){const r=window.getComputedStyle(t,n),s=r.getPropertyValue("content");if(s===""||s==="none")return;const o=ce();try{e.className=`${e.className} ${o}`}catch{return}const a=document.createElement("style");a.appendChild(be(o,n,r,i)),e.appendChild(a)}function we(t,e,n){I(t,e,":before",n),I(t,e,":after",n)}const M="application/font-woff",U="image/jpeg",ye={woff:M,woff2:M,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:U,jpeg:U,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function xe(t){const e=/\.([^./]*?)$/g.exec(t);return e?e[1]:""}function C(t){const e=xe(t).toLowerCase();return ye[e]||""}function ve(t){return t.split(/,/)[1]}function P(t){return t.search(/^(data:)/)!==-1}function Ee(t,e){return`data:${e};base64,${t}`}async function O(t,e,n){const i=await fetch(t,e);if(i.status===404)throw new Error(`Resource "${i.url}" not found`);const r=await i.blob();return new Promise((s,o)=>{const a=new FileReader;a.onerror=o,a.onloadend=()=>{try{s(n({res:i,result:a.result}))}catch(c){o(c)}},a.readAsDataURL(r)})}const L={};function ke(t,e,n){let i=t.replace(/\?.*/,"");return n&&(i=t),/ttf|otf|eot|woff2?/i.test(i)&&(i=i.replace(/.*\//,"")),e?`[${e}]${i}`:i}async function $(t,e,n){const i=ke(t,e,n.includeQueryParams);if(L[i]!=null)return L[i];n.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+new Date().getTime());let r;try{const s=await O(t,n.fetchRequestInit,({res:o,result:a})=>(e||(e=o.headers.get("Content-Type")||""),ve(a)));r=Ee(s,e)}catch(s){r=n.imagePlaceholder||"";let o=`Failed to fetch resource: ${t}`;s&&(o=typeof s=="string"?s:s.message),o&&console.warn(o)}return L[i]=r,r}async function Se(t){const e=t.toDataURL();return e==="data:,"?t.cloneNode(!1):v(e)}async function Ce(t,e){if(t.currentSrc){const s=document.createElement("canvas"),o=s.getContext("2d");s.width=t.clientWidth,s.height=t.clientHeight,o==null||o.drawImage(t,0,0,s.width,s.height);const a=s.toDataURL();return v(a)}const n=t.poster,i=C(n),r=await $(n,i,e);return v(r)}async function Pe(t,e){var n;try{if(!((n=t==null?void 0:t.contentDocument)===null||n===void 0)&&n.body)return await E(t.contentDocument.body,e,!0)}catch{}return t.cloneNode(!1)}async function Le(t,e){return d(t,HTMLCanvasElement)?Se(t):d(t,HTMLVideoElement)?Ce(t,e):d(t,HTMLIFrameElement)?Pe(t,e):t.cloneNode(H(t))}const $e=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SLOT",H=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SVG";async function Re(t,e,n){var i,r;if(H(e))return e;let s=[];return $e(t)&&t.assignedNodes?s=g(t.assignedNodes()):d(t,HTMLIFrameElement)&&(!((i=t.contentDocument)===null||i===void 0)&&i.body)?s=g(t.contentDocument.body.childNodes):s=g(((r=t.shadowRoot)!==null&&r!==void 0?r:t).childNodes),s.length===0||d(t,HTMLVideoElement)||await s.reduce((o,a)=>o.then(()=>E(a,n)).then(c=>{c&&e.appendChild(c)}),Promise.resolve()),e}function Te(t,e,n){const i=e.style;if(!i)return;const r=window.getComputedStyle(t);r.cssText?(i.cssText=r.cssText,i.transformOrigin=r.transformOrigin):R(n).forEach(s=>{let o=r.getPropertyValue(s);s==="font-size"&&o.endsWith("px")&&(o=`${Math.floor(parseFloat(o.substring(0,o.length-2)))-.1}px`),d(t,HTMLIFrameElement)&&s==="display"&&o==="inline"&&(o="block"),s==="d"&&e.getAttribute("d")&&(o=`path(${e.getAttribute("d")})`),i.setProperty(s,o,r.getPropertyPriority(s))})}function Ie(t,e){d(t,HTMLTextAreaElement)&&(e.innerHTML=t.value),d(t,HTMLInputElement)&&e.setAttribute("value",t.value)}function Me(t,e){if(d(t,HTMLSelectElement)){const n=e,i=Array.from(n.children).find(r=>t.value===r.getAttribute("value"));i&&i.setAttribute("selected","")}}function Ue(t,e,n){return d(e,Element)&&(Te(t,e,n),we(t,e,n),Ie(t,e),Me(t,e)),e}async function Oe(t,e){const n=t.querySelectorAll?t.querySelectorAll("use"):[];if(n.length===0)return t;const i={};for(let s=0;s<n.length;s++){const a=n[s].getAttribute("xlink:href");if(a){const c=t.querySelector(a),l=document.querySelector(a);!c&&l&&!i[a]&&(i[a]=await E(l,e,!0))}}const r=Object.values(i);if(r.length){const s="http://www.w3.org/1999/xhtml",o=document.createElementNS(s,"svg");o.setAttribute("xmlns",s),o.style.position="absolute",o.style.width="0",o.style.height="0",o.style.overflow="hidden",o.style.display="none";const a=document.createElementNS(s,"defs");o.appendChild(a);for(let c=0;c<r.length;c++)a.appendChild(r[c]);t.appendChild(o)}return t}async function E(t,e,n){return!n&&e.filter&&!e.filter(t)?null:Promise.resolve(t).then(i=>Le(i,e)).then(i=>Re(t,i,e)).then(i=>Ue(t,i,e)).then(i=>Oe(i,e))}const A=/url\((['"]?)([^'"]+?)\1\)/g,He=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Ae=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Be(t){const e=t.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function Fe(t){const e=[];return t.replace(A,(n,i,r)=>(e.push(r),n)),e.filter(n=>!P(n))}async function ze(t,e,n,i,r){try{const s=n?ae(e,n):e,o=C(e);let a;return r||(a=await $(s,o,i)),t.replace(Be(e),`$1${a}$3`)}catch{}return t}function De(t,{preferredFontFormat:e}){return e?t.replace(Ae,n=>{for(;;){const[i,,r]=He.exec(n)||[];if(!r)return"";if(r===e)return`src: ${i};`}}):t}function B(t){return t.search(A)!==-1}async function F(t,e,n){if(!B(t))return t;const i=De(t,n);return Fe(i).reduce((s,o)=>s.then(a=>ze(a,o,e,n)),Promise.resolve(i))}async function y(t,e,n){var i;const r=(i=e.style)===null||i===void 0?void 0:i.getPropertyValue(t);if(r){const s=await F(r,null,n);return e.style.setProperty(t,s,e.style.getPropertyPriority(t)),!0}return!1}async function We(t,e){await y("background",t,e)||await y("background-image",t,e),await y("mask",t,e)||await y("-webkit-mask",t,e)||await y("mask-image",t,e)||await y("-webkit-mask-image",t,e)}async function je(t,e){const n=d(t,HTMLImageElement);if(!(n&&!P(t.src))&&!(d(t,SVGImageElement)&&!P(t.href.baseVal)))return;const i=n?t.src:t.href.baseVal,r=await $(i,C(i),e);await new Promise((s,o)=>{t.onload=s,t.onerror=e.onImageErrorHandler?(...c)=>{try{s(e.onImageErrorHandler(...c))}catch(l){o(l)}}:o;const a=t;a.decode&&(a.decode=s),a.loading==="lazy"&&(a.loading="eager"),n?(t.srcset="",t.src=r):t.href.baseVal=r})}async function Ve(t,e){const i=g(t.childNodes).map(r=>z(r,e));await Promise.all(i).then(()=>t)}async function z(t,e){d(t,Element)&&(await We(t,e),await je(t,e),await Ve(t,e))}function _e(t,e){const{style:n}=t;e.backgroundColor&&(n.backgroundColor=e.backgroundColor),e.width&&(n.width=`${e.width}px`),e.height&&(n.height=`${e.height}px`);const i=e.style;return i!=null&&Object.keys(i).forEach(r=>{n[r]=i[r]}),t}const D={};async function W(t){let e=D[t];if(e!=null)return e;const i=await(await fetch(t)).text();return e={url:t,cssText:i},D[t]=e,e}async function j(t,e){let n=t.cssText;const i=/url\(["']?([^"')]+)["']?\)/g,s=(n.match(/url\([^)]+\)/g)||[]).map(async o=>{let a=o.replace(i,"$1");return a.startsWith("https://")||(a=new URL(a,t.url).href),O(a,e.fetchRequestInit,({result:c})=>(n=n.replace(o,`url(${c})`),[o,c]))});return Promise.all(s).then(()=>n)}function V(t){if(t==null)return[];const e=[],n=/(\/\*[\s\S]*?\*\/)/gi;let i=t.replace(n,"");const r=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const c=r.exec(i);if(c===null)break;e.push(c[0])}i=i.replace(r,"");const s=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",a=new RegExp(o,"gi");for(;;){let c=s.exec(i);if(c===null){if(c=a.exec(i),c===null)break;s.lastIndex=a.lastIndex}else a.lastIndex=s.lastIndex;e.push(c[0])}return e}async function Ne(t,e){const n=[],i=[];return t.forEach(r=>{if("cssRules"in r)try{g(r.cssRules||[]).forEach((s,o)=>{if(s.type===CSSRule.IMPORT_RULE){let a=o+1;const c=s.href,l=W(c).then(h=>j(h,e)).then(h=>V(h).forEach(p=>{try{r.insertRule(p,p.startsWith("@import")?a+=1:r.cssRules.length)}catch(m){console.error("Error inserting rule from remote css",{rule:p,error:m})}})).catch(h=>{console.error("Error loading remote css",h.toString())});i.push(l)}})}catch(s){const o=t.find(a=>a.href==null)||document.styleSheets[0];r.href!=null&&i.push(W(r.href).then(a=>j(a,e)).then(a=>V(a).forEach(c=>{o.insertRule(c,o.cssRules.length)})).catch(a=>{console.error("Error loading remote stylesheet",a)})),console.error("Error inlining remote css file",s)}}),Promise.all(i).then(()=>(t.forEach(r=>{if("cssRules"in r)try{g(r.cssRules||[]).forEach(s=>{n.push(s)})}catch(s){console.error(`Error while reading CSS rules from ${r.href}`,s)}}),n))}function qe(t){return t.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>B(e.style.getPropertyValue("src")))}async function Ge(t,e){if(t.ownerDocument==null)throw new Error("Provided element is not within a Document");const n=g(t.ownerDocument.styleSheets),i=await Ne(n,e);return qe(i)}function _(t){return t.trim().replace(/["']/g,"")}function Xe(t){const e=new Set;function n(i){(i.style.fontFamily||getComputedStyle(i).fontFamily).split(",").forEach(s=>{e.add(_(s))}),Array.from(i.children).forEach(s=>{s instanceof HTMLElement&&n(s)})}return n(t),e}async function Ye(t,e){const n=await Ge(t,e),i=Xe(t);return(await Promise.all(n.filter(s=>i.has(_(s.style.fontFamily))).map(s=>{const o=s.parentStyleSheet?s.parentStyleSheet.href:null;return F(s.cssText,o,e)}))).join(`
`)}async function Ke(t,e){const n=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await Ye(t,e);if(n){const i=document.createElement("style"),r=document.createTextNode(n);i.appendChild(r),t.firstChild?t.insertBefore(i,t.firstChild):t.appendChild(i)}}async function Je(t,e={}){const{width:n,height:i}=T(t,e),r=await E(t,e,!0);return await Ke(r,e),await z(r,e),_e(r,e),await ge(r,n,i)}async function Qe(t,e={}){const{width:n,height:i}=T(t,e),r=await Je(t,e),s=await v(r),o=document.createElement("canvas"),a=o.getContext("2d"),c=e.pixelRatio||de(),l=e.canvasWidth||n,h=e.canvasHeight||i;return o.width=l*c,o.height=h*c,e.skipAutoScale||ue(o),o.style.width=`${l}`,o.style.height=`${h}`,e.backgroundColor&&(a.fillStyle=e.backgroundColor,a.fillRect(0,0,o.width,o.height)),a.drawImage(s,0,0,o.width,o.height),o}async function Ze(t,e={}){return(await Qe(t,e)).toDataURL()}const N=220,q=160;async function et(t,e){const n=await fetch(`${t.replace(/\/$/,"")}/screenshot`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:e.url,x:e.x,y:e.y,delay:e.delay??1500,viewportWidth:e.viewportWidth??window.innerWidth,viewportHeight:e.viewportHeight??window.innerHeight,cropWidth:480,cropHeight:320})});if(!n.ok){const r=await n.json().catch(()=>({}));throw new Error(r.error??`Server error ${n.status}`)}const{url:i}=await n.json();if(!i)throw new Error("Screenshot server returned no URL");return i}async function tt(t,e){const n=window.innerWidth,i=window.innerHeight;await new Promise(s=>setTimeout(s,80));let r;try{r=await Ze(document.documentElement,{cacheBust:!0,pixelRatio:1,skipFonts:!1,filter:s=>{var o;return!((o=s.hasAttribute)!=null&&o.call(s,"data-punchbug-ignore"))&&s.id!=="punchbug-root"}})}catch{return{full:"",thumb:""}}try{const s=await nt(r),o=s.naturalHeight>i*1.2;let a,c;if(o){const k=document.documentElement.scrollWidth,S=document.documentElement.scrollHeight;a=(window.scrollX+t)*(s.naturalWidth/k),c=(window.scrollY+e)*(s.naturalHeight/S)}else a=t/n*s.naturalWidth,c=e/i*s.naturalHeight;const l=Math.max(0,Math.round(a-N)),h=Math.max(0,Math.round(c-q)),p=Math.min(s.naturalWidth-l,N*2),m=Math.min(s.naturalHeight-h,q*2),f=document.createElement("canvas");return f.width=p,f.height=m,f.getContext("2d").drawImage(s,l,h,p,m,0,0,p,m),{full:r,thumb:f.toDataURL("image/png")}}catch{return{full:r,thumb:r}}}function nt(t){return new Promise((e,n)=>{const i=new Image;i.onload=()=>e(i),i.onerror=n,i.src=t})}const it=`
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
`;class rt{constructor(e){if(this.picker=null,this.isPicking=!1,this.columns=[],this.tags=[],this.projectId="",this.pinCleanups=[],this.ghostPin=null,this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),!document.getElementById("pb-global-styles")){const i=document.createElement("style");i.id="pb-global-styles",i.textContent=`
        @keyframes pb-pin-drop {
          0%   { transform: translateY(-14px) scale(0.8); opacity: 0; }
          65%  { transform: translateY(4px)   scale(1.06); opacity: 1; }
          100% { transform: translateY(0)     scale(1);    opacity: 1; }
        }`,document.head.appendChild(i)}this.shadow=this.hostEl.attachShadow({mode:"open"});const n=document.createElement("style");n.textContent=it,this.shadow.appendChild(n),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.title="Report a task",this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                 M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new ee(this.shadow),this.fetchColumns(),this.fetchTags(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchTags(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.tags=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),n=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!n.ok)return;const i=await n.json();this.projectId=i.projectId,this.createPins(i.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(n=>n()),this.pinCleanups=[];for(const n of e)if(n.pinX!==null&&n.pinY!==null)this.createPinAtCoords(n);else if(n.domSelector)try{const i=document.querySelector(n.domSelector);i&&this.createPinOnElement(i,n)}catch{}}createPinAtCoords(e){const n=this.buildPin(e.taskNumber);n.style.position="absolute",n.style.top=`${(e.pinY??0)-11}px`,n.style.left=`${(e.pinX??0)-11}px`,document.body.appendChild(n),n.addEventListener("click",i=>{i.stopPropagation(),this.taskPanel.show(e,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>n.remove())}createPinOnElement(e,n){const i=this.buildPin(n.taskNumber);i.style.position="absolute",document.body.appendChild(i);const r=()=>{const s=e.getBoundingClientRect();i.style.top=`${s.top+window.scrollY-11}px`,i.style.left=`${s.right+window.scrollX-11}px`};r(),window.addEventListener("scroll",r,{passive:!0}),window.addEventListener("resize",r,{passive:!0}),i.addEventListener("click",s=>{s.stopPropagation(),this.taskPanel.show(n,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",r),window.removeEventListener("resize",r),i.remove()})}buildPin(e){const n=document.createElement("button");return n.setAttribute("data-punchbug-ignore","true"),n.textContent=String(e),n.style.cssText="z-index:2147483644;background:hsl(348,100%,52%);color:#fff;border:2.5px solid #fff;border-radius:50%;width:24px;height:24px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",n.onmouseenter=()=>{n.style.transform="scale(1.25)",n.style.background="hsl(348,100%,42%)"},n.onmouseleave=()=>{n.style.transform="",n.style.background="hsl(348,100%,52%)"},n}showGhostPin(e,n){this.removeGhostPin();const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.innerHTML=`
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
              fill="hsl(348,100%,52%)" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`,i.style.cssText=`position:absolute;top:${n-32}px;left:${e-14}px;z-index:2147483644;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));animation:pb-pin-drop 0.25s cubic-bezier(0.34,1.56,0.64,1);`,document.body.appendChild(i),this.ghostPin=i}removeGhostPin(){var e;(e=this.ghostPin)==null||e.remove(),this.ghostPin=null}refreshPins(){this.fetchPageTasks()}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click anywhere — Esc to cancel";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Cancel"),this.picker=new Y(n=>this.onPicked(n),()=>this.stopPicking()),this.picker.start()}stopPicking(){var n;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Report"),(n=this.picker)==null||n.stop(),this.picker=null}async onPicked({el:e,clientX:n,clientY:i,pageX:r,pageY:s}){this.stopPicking(),this.showGhostPin(r,s);const o=new J(this.shadow,{domInfo:te(e),browserMeta:ie(),pageUrl:window.location.href,pinX:r,pinY:s,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,tags:this.tags,reporterName:this.config.reporterName,onSuccess:()=>{this.removeGhostPin(),this.refreshPins()},onClose:()=>this.removeGhostPin()});this.captureScreenshot(n,i,r,s).then(({full:a,thumb:c})=>o.setScreenshot(a,c)).catch(()=>o.setScreenshot(""))}async captureScreenshot(e,n,i,r){const s=this.config.screenshotServerUrl;if(s)try{const o=await et(s,{url:window.location.href,x:i,y:r,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight});return{full:o,thumb:o}}catch(o){console.warn("PunchBug: screenshot server failed, falling back",o)}return tt(e,n)}}async function st(t,e){try{const i=`${new URL(t).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,r=await fetch(i,{credentials:"include"});if(!r.ok)return{allowed:!1};const s=await r.json();return{allowed:s.allowed===!0,userName:s.userName||void 0}}catch{return{allowed:!1}}}async function G(){const t=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:t.length>0&&(e=t[t.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const n=e.dataset.key,i=e.dataset.position||"right",r=e.dataset.apiUrl||ot(),s=e.dataset.screenshotServer||void 0;if(!n){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:o,userName:a}=await st(r,n);o&&new rt({embedKey:n,apiUrl:r,position:i,reporterName:a,screenshotServerUrl:s})}function ot(){const t=document.querySelectorAll("script[src*='punchbug']");if(t.length>0){const e=t[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function X(){const t=new URLSearchParams(window.location.search).get("pb_element");if(t)try{let e=function(){const r=n.getBoundingClientRect();i.style.top=r.top+"px",i.style.left=r.left+"px",i.style.width=r.width+"px",i.style.height=r.height+"px"};const n=document.querySelector(t);if(!n)return;n.scrollIntoView({block:"center",behavior:"smooth"});const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(i),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>{i.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{X(),G()}):(X(),G())})();
