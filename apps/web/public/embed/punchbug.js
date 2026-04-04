(function(){"use strict";class G{constructor(e,n){this.hoveredEl=null,this.highlightOverlay=null,this.onPick=e,this.onCancel=n,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){if(this.clearHighlight(),e.closest("#punchbug-root"))return;this.hoveredEl=e;const n=e.getBoundingClientRect(),i=document.createElement("div");i.id="pb-highlight-overlay",i.setAttribute("data-punchbug-ignore","true"),i.style.cssText=["position:fixed",`top:${n.top}px`,`left:${n.left}px`,`width:${n.width}px`,`height:${n.height}px`,"pointer-events:none","z-index:2147483645","outline:2px solid hsl(348,100%,52%)","outline-offset:2px","border-radius:2px","background:hsla(348,100%,52%,0.07)","box-sizing:border-box"].join(";"),document.body.appendChild(i),this.highlightOverlay=i}clearHighlight(){var e;(e=this.highlightOverlay)==null||e.remove(),this.highlightOverlay=null,this.hoveredEl=null}handleMouseOver(e){const n=e.target;n&&!n.closest("#punchbug-root")&&n!==this.highlightOverlay&&this.highlight(n)}handleMouseOut(e){this.hoveredEl===e.target&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const n=e.target;n&&!n.closest("#punchbug-root")&&n!==this.highlightOverlay&&(this.clearHighlight(),this.stop(),this.onPick({el:n,clientX:e.clientX,clientY:e.clientY,pageX:e.clientX+window.scrollX,pageY:e.clientY+window.scrollY}))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function K(t,e){const n=await fetch(`${t}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok){const i=await n.json().catch(()=>({}));throw new Error(i.error||"Failed to submit report")}return n.json()}class J{constructor(e,n){this.shadow=e,this.overlay=this.render(n)}render(e){var a,h;const n=document.createElement("div");n.className="pb-overlay";const i=document.createElement("div");i.className="pb-form-card";const s=e.columns.length>0?`<div class="pb-field">
            <label class="pb-label" for="pb-column">Add to column</label>
            <select class="pb-input" id="pb-column">
              ${e.columns.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")}
            </select>
           </div>`:"",r=e.tags.length>0?`<div class="pb-field">
            <label class="pb-label">Tags</label>
            <div class="pb-tags-grid" id="pb-tags">
              ${e.tags.map(l=>`
                <label class="pb-tag-option" style="--tag-color:${l.color}">
                  <input type="checkbox" class="pb-tag-cb" value="${l.id}" style="display:none" />
                  <span class="pb-tag-pill" data-tag-id="${l.id}" style="background:${l.color}22;color:${l.color};border:1px solid ${l.color}55">
                    ${l.name}
                  </span>
                </label>`).join("")}
            </div>
           </div>`:"",o=e.screenshotThumb?`<div class="pb-screenshot-wrap">
           <img class="pb-screenshot-preview" src="${e.screenshotThumb}" alt="Screenshot" />
           <button class="pb-screenshot-expand" id="pb-expand-btn" title="View full screenshot">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
               <polyline points="15 3 21 3 21 9"></polyline>
               <polyline points="9 21 3 21 3 15"></polyline>
               <line x1="21" y1="3" x2="14" y2="10"></line>
               <line x1="3" y1="21" x2="10" y2="14"></line>
             </svg>
           </button>
         </div>`:"";i.innerHTML=`
      <div class="pb-form-header">
        <h2 class="pb-form-title">Report a Task</h2>
        <button class="pb-close-btn" id="pb-close">&#x2715;</button>
      </div>

      ${o}

      <div class="pb-info-box">
        <div class="pb-info-row">
          <span>&#127760;</span>
          <span style="word-break:break-all">${e.pageUrl}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128187;</span>
          <span>${e.browserMeta.browserName} ${e.browserMeta.browserVersion} &bull; ${e.browserMeta.osName} &bull; ${e.browserMeta.screenWidth}&#xd7;${e.browserMeta.screenHeight}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128279;</span>
          <code style="font-size:11px">${e.domInfo.selector}</code>
        </div>
      </div>

      <div id="pb-report-form">
        <div class="pb-field">
          <label class="pb-label" for="pb-title">What happened? *</label>
          <input class="pb-input" id="pb-title" type="text" placeholder="Button not responding, layout broken, etc." />
        </div>
        <div class="pb-field">
          <label class="pb-label" for="pb-desc">More details</label>
          <textarea class="pb-textarea" id="pb-desc" placeholder="Steps to reproduce, expected vs actual behavior..."></textarea>
        </div>
        ${s}
        ${r}
        <button class="pb-submit-btn" id="pb-submit">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,n.appendChild(i),this.shadow.appendChild(n),(a=this.shadow.getElementById("pb-close"))==null||a.addEventListener("click",()=>this.close(e.onClose)),n.addEventListener("click",l=>{l.target===n&&this.close(e.onClose)}),e.screenshotFull&&((h=this.shadow.getElementById("pb-expand-btn"))==null||h.addEventListener("click",()=>{this.openLightbox(e.screenshotFull)})),e.tags.length>0&&this.shadow.querySelectorAll(".pb-tag-pill").forEach(l=>{l.style.opacity="0.55",l.addEventListener("click",()=>{const p=l.dataset.tagId,g=this.shadow.querySelector(`.pb-tag-cb[value="${p}"]`);g&&(g.checked=!g.checked,l.style.opacity=g.checked?"1":"0.55",l.style.fontWeight=g.checked?"600":"400")})});const c=this.shadow.getElementById("pb-submit");return c==null||c.addEventListener("click",async()=>{var x;const l=this.shadow.getElementById("pb-title").value.trim();if(!l){this.shadow.getElementById("pb-title").focus();return}const p=this.shadow.getElementById("pb-desc").value.trim(),g=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0,y=e.tags.length>0?Array.from(this.shadow.querySelectorAll(".pb-tag-cb:checked")).map(m=>m.value):[];c.disabled=!0,c.textContent="Submitting...";try{await K(e.apiUrl,{embedKey:e.embedKey,title:l,description:p||void 0,screenshot:e.screenshotFull,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:g,tagIds:y.length>0?y:void 0,reporterName:e.reporterName,browserMeta:e.browserMeta,pinX:e.pinX,pinY:e.pinY});const m=this.shadow.getElementById("pb-report-form"),$=this.shadow.getElementById("pb-success");m&&(m.style.display="none"),$&&($.style.display="block"),(x=e.onSuccess)==null||x.call(e),setTimeout(()=>this.close(),3e3)}catch(m){c.disabled=!1,c.textContent="Submit Task",alert("Failed to submit: "+(m instanceof Error?m.message:"Unknown error"))}}),n}openLightbox(e){const n=document.createElement("div");n.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const s=document.createElement("button");s.className="pb-lightbox-close",s.innerHTML="&#x2715;",s.addEventListener("click",()=>n.remove()),n.addEventListener("click",r=>{r.target===n&&n.remove()}),n.appendChild(s),n.appendChild(i),this.shadow.appendChild(n)}close(e){this.overlay.remove(),e==null||e()}}const Q={BACKLOG:"#6b7280",TODO:"hsl(348,100%,52%)",DOING:"#f59e0b",DONE:"#10b981",CLOSED:"#6b7280"},Z={LOW:"#6b7280",MEDIUM:"hsl(348,100%,52%)",HIGH:"#f59e0b",CRITICAL:"#ef4444"};class ee{constructor(e){this.overlay=null,this.shadow=e}show(e,n,i){var h,l;this.close();const s=document.createElement("div");s.className="pb-overlay";const r=document.createElement("div");r.className="pb-form-card pb-task-panel";const o=Q[e.status]??"#6b7280",c=Z[e.priority]??"#6b7280",a=e.screenshotUrl?`<div class="pb-screenshot-wrap">
           <img class="pb-screenshot-preview pb-screenshot-task" src="${e.screenshotUrl}" alt="Screenshot" />
           <button class="pb-screenshot-expand" id="pb-tp-expand" title="View full screenshot">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
               <polyline points="15 3 21 3 21 9"></polyline>
               <polyline points="9 21 3 21 3 15"></polyline>
               <line x1="21" y1="3" x2="14" y2="10"></line>
               <line x1="3" y1="21" x2="10" y2="14"></line>
             </svg>
           </button>
         </div>`:"";r.innerHTML=`
      <div class="pb-form-header">
        <span style="font-size:12px;color:#6b7280;font-weight:600">#${e.taskNumber}</span>
        <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
      </div>
      <p style="font-size:15px;font-weight:600;color:#111;margin:0 0 10px">${e.title}</p>
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${o}22;color:${o}">${e.status}</span>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${c}22;color:${c}">${e.priority}</span>
      </div>
      ${a}
      ${e.guestName?`<p style="font-size:12px;color:#6b7280;margin:0 0 12px">Reported by <strong>${e.guestName}</strong></p>`:""}
      <a href="${i}/projects/${n}?task=${e.id}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;background:hsl(348,100%,52%);color:white;border-radius:6px;padding:8px;font-size:13px;font-weight:600;text-decoration:none">
        View in board →
      </a>
    `,s.appendChild(r),this.shadow.appendChild(s),this.overlay=s,(h=this.shadow.getElementById("pb-tpanel-close"))==null||h.addEventListener("click",()=>this.close()),s.addEventListener("click",p=>{p.target===s&&this.close()}),e.screenshotUrl&&((l=this.shadow.getElementById("pb-tp-expand"))==null||l.addEventListener("click",()=>{this.openLightbox(e.screenshotUrl)}))}openLightbox(e){const n=document.createElement("div");n.className="pb-lightbox";const i=document.createElement("img");i.className="pb-lightbox-img",i.src=e;const s=document.createElement("button");s.className="pb-lightbox-close",s.innerHTML="&#x2715;",s.addEventListener("click",()=>n.remove()),n.addEventListener("click",r=>{r.target===n&&n.remove()}),n.appendChild(s),n.appendChild(i),this.shadow.appendChild(n)}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function te(t){return{selector:ne(t),outerHtml:t.outerHTML.slice(0,2e3)}}function ne(t){var i;const e=[];let n=t;for(;n&&n!==document.body&&n.nodeType===Node.ELEMENT_NODE;){let s=n.tagName.toLowerCase();if(n.id){e.unshift(`#${CSS.escape(n.id)}`);break}const r=(i=n.parentElement)==null?void 0:i.children;if(r&&r.length>1){let o=1;for(let a=0;a<r.length&&r[a]!==n;a++)r[a].tagName===n.tagName&&o++;Array.from(r).filter(a=>a.tagName===n.tagName).length>1&&(s+=`:nth-of-type(${o})`)}if(e.unshift(s),n=n.parentElement,e.length>=6)break}return e.join(" > ")||t.tagName.toLowerCase()}function ie(){const t=navigator.userAgent,{browserName:e,browserVersion:n}=se(t),{osName:i,osVersion:s}=re(t),r=oe();return{browserName:e,browserVersion:n,osName:i,osVersion:s,deviceType:r,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:t}}function se(t){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const n of e){const i=t.match(n.pattern);if(i)return{browserName:n.name,browserVersion:i[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function re(t){var e,n,i;return/Windows NT 10/.test(t)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(t)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(t)?{osName:"macOS",osVersion:((e=t.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(t)?{osName:"Android",osVersion:((n=t.match(/Android ([0-9.]+)/))==null?void 0:n[1])??""}:/iPhone OS ([0-9_]+)/.test(t)?{osName:"iOS",osVersion:((i=t.match(/iPhone OS ([0-9_]+)/))==null?void 0:i[1].replace(/_/g,"."))??""}:/Linux/.test(t)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function oe(){const t=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(t)?"mobile":/iPad|Android(?!.*Mobile)/.test(t)?"tablet":"desktop"}function ce(t,e){if(t.match(/^[a-z]+:\/\//i))return t;if(t.match(/^\/\//))return window.location.protocol+t;if(t.match(/^[a-z]+:/i))return t;const n=document.implementation.createHTMLDocument(),i=n.createElement("base"),s=n.createElement("a");return n.head.appendChild(i),n.body.appendChild(s),e&&(i.href=e),s.href=t,s.href}const ae=(()=>{let t=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${e()}${t}`)})();function f(t){const e=[];for(let n=0,i=t.length;n<i;n++)e.push(t[n]);return e}let b=null;function R(t={}){return b||(t.includeStyleProperties?(b=t.includeStyleProperties,b):(b=f(window.getComputedStyle(document.documentElement)),b))}function v(t,e){const i=(t.ownerDocument.defaultView||window).getComputedStyle(t).getPropertyValue(e);return i?parseFloat(i.replace("px","")):0}function le(t){const e=v(t,"border-left-width"),n=v(t,"border-right-width");return t.clientWidth+e+n}function he(t){const e=v(t,"border-top-width"),n=v(t,"border-bottom-width");return t.clientHeight+e+n}function T(t,e={}){const n=e.width||le(t),i=e.height||he(t);return{width:n,height:i}}function de(){let t,e;try{e=process}catch{}const n=e&&e.env?e.env.devicePixelRatio:null;return n&&(t=parseInt(n,10),Number.isNaN(t)&&(t=1)),t||window.devicePixelRatio||1}const u=16384;function ue(t){(t.width>u||t.height>u)&&(t.width>u&&t.height>u?t.width>t.height?(t.height*=u/t.width,t.width=u):(t.width*=u/t.height,t.height=u):t.width>u?(t.height*=u/t.width,t.width=u):(t.width*=u/t.height,t.height=u))}function E(t){return new Promise((e,n)=>{const i=new Image;i.onload=()=>{i.decode().then(()=>{requestAnimationFrame(()=>e(i))})},i.onerror=n,i.crossOrigin="anonymous",i.decoding="async",i.src=t})}async function pe(t){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(t)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function ge(t,e,n){const i="http://www.w3.org/2000/svg",s=document.createElementNS(i,"svg"),r=document.createElementNS(i,"foreignObject");return s.setAttribute("width",`${e}`),s.setAttribute("height",`${n}`),s.setAttribute("viewBox",`0 0 ${e} ${n}`),r.setAttribute("width","100%"),r.setAttribute("height","100%"),r.setAttribute("x","0"),r.setAttribute("y","0"),r.setAttribute("externalResourcesRequired","true"),s.appendChild(r),r.appendChild(t),pe(s)}const d=(t,e)=>{if(t instanceof e)return!0;const n=Object.getPrototypeOf(t);return n===null?!1:n.constructor.name===e.name||d(n,e)};function me(t){const e=t.getPropertyValue("content");return`${t.cssText} content: '${e.replace(/'|"/g,"")}';`}function fe(t,e){return R(e).map(n=>{const i=t.getPropertyValue(n),s=t.getPropertyPriority(n);return`${n}: ${i}${s?" !important":""};`}).join(" ")}function be(t,e,n,i){const s=`.${t}:${e}`,r=n.cssText?me(n):fe(n,i);return document.createTextNode(`${s}{${r}}`)}function I(t,e,n,i){const s=window.getComputedStyle(t,n),r=s.getPropertyValue("content");if(r===""||r==="none")return;const o=ae();try{e.className=`${e.className} ${o}`}catch{return}const c=document.createElement("style");c.appendChild(be(o,n,s,i)),e.appendChild(c)}function we(t,e,n){I(t,e,":before",n),I(t,e,":after",n)}const M="application/font-woff",O="image/jpeg",ye={woff:M,woff2:M,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:O,jpeg:O,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function xe(t){const e=/\.([^./]*?)$/g.exec(t);return e?e[1]:""}function S(t){const e=xe(t).toLowerCase();return ye[e]||""}function ve(t){return t.split(/,/)[1]}function C(t){return t.search(/^(data:)/)!==-1}function Ee(t,e){return`data:${e};base64,${t}`}async function U(t,e,n){const i=await fetch(t,e);if(i.status===404)throw new Error(`Resource "${i.url}" not found`);const s=await i.blob();return new Promise((r,o)=>{const c=new FileReader;c.onerror=o,c.onloadend=()=>{try{r(n({res:i,result:c.result}))}catch(a){o(a)}},c.readAsDataURL(s)})}const P={};function ke(t,e,n){let i=t.replace(/\?.*/,"");return n&&(i=t),/ttf|otf|eot|woff2?/i.test(i)&&(i=i.replace(/.*\//,"")),e?`[${e}]${i}`:i}async function L(t,e,n){const i=ke(t,e,n.includeQueryParams);if(P[i]!=null)return P[i];n.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+new Date().getTime());let s;try{const r=await U(t,n.fetchRequestInit,({res:o,result:c})=>(e||(e=o.headers.get("Content-Type")||""),ve(c)));s=Ee(r,e)}catch(r){s=n.imagePlaceholder||"";let o=`Failed to fetch resource: ${t}`;r&&(o=typeof r=="string"?r:r.message),o&&console.warn(o)}return P[i]=s,s}async function Se(t){const e=t.toDataURL();return e==="data:,"?t.cloneNode(!1):E(e)}async function Ce(t,e){if(t.currentSrc){const r=document.createElement("canvas"),o=r.getContext("2d");r.width=t.clientWidth,r.height=t.clientHeight,o==null||o.drawImage(t,0,0,r.width,r.height);const c=r.toDataURL();return E(c)}const n=t.poster,i=S(n),s=await L(n,i,e);return E(s)}async function Pe(t,e){var n;try{if(!((n=t==null?void 0:t.contentDocument)===null||n===void 0)&&n.body)return await k(t.contentDocument.body,e,!0)}catch{}return t.cloneNode(!1)}async function Le(t,e){return d(t,HTMLCanvasElement)?Se(t):d(t,HTMLVideoElement)?Ce(t,e):d(t,HTMLIFrameElement)?Pe(t,e):t.cloneNode(A(t))}const $e=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SLOT",A=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SVG";async function Re(t,e,n){var i,s;if(A(e))return e;let r=[];return $e(t)&&t.assignedNodes?r=f(t.assignedNodes()):d(t,HTMLIFrameElement)&&(!((i=t.contentDocument)===null||i===void 0)&&i.body)?r=f(t.contentDocument.body.childNodes):r=f(((s=t.shadowRoot)!==null&&s!==void 0?s:t).childNodes),r.length===0||d(t,HTMLVideoElement)||await r.reduce((o,c)=>o.then(()=>k(c,n)).then(a=>{a&&e.appendChild(a)}),Promise.resolve()),e}function Te(t,e,n){const i=e.style;if(!i)return;const s=window.getComputedStyle(t);s.cssText?(i.cssText=s.cssText,i.transformOrigin=s.transformOrigin):R(n).forEach(r=>{let o=s.getPropertyValue(r);r==="font-size"&&o.endsWith("px")&&(o=`${Math.floor(parseFloat(o.substring(0,o.length-2)))-.1}px`),d(t,HTMLIFrameElement)&&r==="display"&&o==="inline"&&(o="block"),r==="d"&&e.getAttribute("d")&&(o=`path(${e.getAttribute("d")})`),i.setProperty(r,o,s.getPropertyPriority(r))})}function Ie(t,e){d(t,HTMLTextAreaElement)&&(e.innerHTML=t.value),d(t,HTMLInputElement)&&e.setAttribute("value",t.value)}function Me(t,e){if(d(t,HTMLSelectElement)){const n=e,i=Array.from(n.children).find(s=>t.value===s.getAttribute("value"));i&&i.setAttribute("selected","")}}function Oe(t,e,n){return d(e,Element)&&(Te(t,e,n),we(t,e,n),Ie(t,e),Me(t,e)),e}async function Ue(t,e){const n=t.querySelectorAll?t.querySelectorAll("use"):[];if(n.length===0)return t;const i={};for(let r=0;r<n.length;r++){const c=n[r].getAttribute("xlink:href");if(c){const a=t.querySelector(c),h=document.querySelector(c);!a&&h&&!i[c]&&(i[c]=await k(h,e,!0))}}const s=Object.values(i);if(s.length){const r="http://www.w3.org/1999/xhtml",o=document.createElementNS(r,"svg");o.setAttribute("xmlns",r),o.style.position="absolute",o.style.width="0",o.style.height="0",o.style.overflow="hidden",o.style.display="none";const c=document.createElementNS(r,"defs");o.appendChild(c);for(let a=0;a<s.length;a++)c.appendChild(s[a]);t.appendChild(o)}return t}async function k(t,e,n){return!n&&e.filter&&!e.filter(t)?null:Promise.resolve(t).then(i=>Le(i,e)).then(i=>Re(t,i,e)).then(i=>Oe(t,i,e)).then(i=>Ue(i,e))}const H=/url\((['"]?)([^'"]+?)\1\)/g,Ae=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,He=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Be(t){const e=t.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function Fe(t){const e=[];return t.replace(H,(n,i,s)=>(e.push(s),n)),e.filter(n=>!C(n))}async function ze(t,e,n,i,s){try{const r=n?ce(e,n):e,o=S(e);let c;return s||(c=await L(r,o,i)),t.replace(Be(e),`$1${c}$3`)}catch{}return t}function De(t,{preferredFontFormat:e}){return e?t.replace(He,n=>{for(;;){const[i,,s]=Ae.exec(n)||[];if(!s)return"";if(s===e)return`src: ${i};`}}):t}function B(t){return t.search(H)!==-1}async function F(t,e,n){if(!B(t))return t;const i=De(t,n);return Fe(i).reduce((r,o)=>r.then(c=>ze(c,o,e,n)),Promise.resolve(i))}async function w(t,e,n){var i;const s=(i=e.style)===null||i===void 0?void 0:i.getPropertyValue(t);if(s){const r=await F(s,null,n);return e.style.setProperty(t,r,e.style.getPropertyPriority(t)),!0}return!1}async function Ve(t,e){await w("background",t,e)||await w("background-image",t,e),await w("mask",t,e)||await w("-webkit-mask",t,e)||await w("mask-image",t,e)||await w("-webkit-mask-image",t,e)}async function je(t,e){const n=d(t,HTMLImageElement);if(!(n&&!C(t.src))&&!(d(t,SVGImageElement)&&!C(t.href.baseVal)))return;const i=n?t.src:t.href.baseVal,s=await L(i,S(i),e);await new Promise((r,o)=>{t.onload=r,t.onerror=e.onImageErrorHandler?(...a)=>{try{r(e.onImageErrorHandler(...a))}catch(h){o(h)}}:o;const c=t;c.decode&&(c.decode=r),c.loading==="lazy"&&(c.loading="eager"),n?(t.srcset="",t.src=s):t.href.baseVal=s})}async function We(t,e){const i=f(t.childNodes).map(s=>z(s,e));await Promise.all(i).then(()=>t)}async function z(t,e){d(t,Element)&&(await Ve(t,e),await je(t,e),await We(t,e))}function _e(t,e){const{style:n}=t;e.backgroundColor&&(n.backgroundColor=e.backgroundColor),e.width&&(n.width=`${e.width}px`),e.height&&(n.height=`${e.height}px`);const i=e.style;return i!=null&&Object.keys(i).forEach(s=>{n[s]=i[s]}),t}const D={};async function V(t){let e=D[t];if(e!=null)return e;const i=await(await fetch(t)).text();return e={url:t,cssText:i},D[t]=e,e}async function j(t,e){let n=t.cssText;const i=/url\(["']?([^"')]+)["']?\)/g,r=(n.match(/url\([^)]+\)/g)||[]).map(async o=>{let c=o.replace(i,"$1");return c.startsWith("https://")||(c=new URL(c,t.url).href),U(c,e.fetchRequestInit,({result:a})=>(n=n.replace(o,`url(${a})`),[o,a]))});return Promise.all(r).then(()=>n)}function W(t){if(t==null)return[];const e=[],n=/(\/\*[\s\S]*?\*\/)/gi;let i=t.replace(n,"");const s=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const a=s.exec(i);if(a===null)break;e.push(a[0])}i=i.replace(s,"");const r=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",c=new RegExp(o,"gi");for(;;){let a=r.exec(i);if(a===null){if(a=c.exec(i),a===null)break;r.lastIndex=c.lastIndex}else c.lastIndex=r.lastIndex;e.push(a[0])}return e}async function Ne(t,e){const n=[],i=[];return t.forEach(s=>{if("cssRules"in s)try{f(s.cssRules||[]).forEach((r,o)=>{if(r.type===CSSRule.IMPORT_RULE){let c=o+1;const a=r.href,h=V(a).then(l=>j(l,e)).then(l=>W(l).forEach(p=>{try{s.insertRule(p,p.startsWith("@import")?c+=1:s.cssRules.length)}catch(g){console.error("Error inserting rule from remote css",{rule:p,error:g})}})).catch(l=>{console.error("Error loading remote css",l.toString())});i.push(h)}})}catch(r){const o=t.find(c=>c.href==null)||document.styleSheets[0];s.href!=null&&i.push(V(s.href).then(c=>j(c,e)).then(c=>W(c).forEach(a=>{o.insertRule(a,o.cssRules.length)})).catch(c=>{console.error("Error loading remote stylesheet",c)})),console.error("Error inlining remote css file",r)}}),Promise.all(i).then(()=>(t.forEach(s=>{if("cssRules"in s)try{f(s.cssRules||[]).forEach(r=>{n.push(r)})}catch(r){console.error(`Error while reading CSS rules from ${s.href}`,r)}}),n))}function qe(t){return t.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>B(e.style.getPropertyValue("src")))}async function Xe(t,e){if(t.ownerDocument==null)throw new Error("Provided element is not within a Document");const n=f(t.ownerDocument.styleSheets),i=await Ne(n,e);return qe(i)}function _(t){return t.trim().replace(/["']/g,"")}function Ye(t){const e=new Set;function n(i){(i.style.fontFamily||getComputedStyle(i).fontFamily).split(",").forEach(r=>{e.add(_(r))}),Array.from(i.children).forEach(r=>{r instanceof HTMLElement&&n(r)})}return n(t),e}async function Ge(t,e){const n=await Xe(t,e),i=Ye(t);return(await Promise.all(n.filter(r=>i.has(_(r.style.fontFamily))).map(r=>{const o=r.parentStyleSheet?r.parentStyleSheet.href:null;return F(r.cssText,o,e)}))).join(`
`)}async function Ke(t,e){const n=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await Ge(t,e);if(n){const i=document.createElement("style"),s=document.createTextNode(n);i.appendChild(s),t.firstChild?t.insertBefore(i,t.firstChild):t.appendChild(i)}}async function Je(t,e={}){const{width:n,height:i}=T(t,e),s=await k(t,e,!0);return await Ke(s,e),await z(s,e),_e(s,e),await ge(s,n,i)}async function Qe(t,e={}){const{width:n,height:i}=T(t,e),s=await Je(t,e),r=await E(s),o=document.createElement("canvas"),c=o.getContext("2d"),a=e.pixelRatio||de(),h=e.canvasWidth||n,l=e.canvasHeight||i;return o.width=h*a,o.height=l*a,e.skipAutoScale||ue(o),o.style.width=`${h}`,o.style.height=`${l}`,e.backgroundColor&&(c.fillStyle=e.backgroundColor,c.fillRect(0,0,o.width,o.height)),c.drawImage(r,0,0,o.width,o.height),o}async function Ze(t,e={}){return(await Qe(t,e)).toDataURL()}const N=220,q=160;async function et(t,e){const n=window.innerWidth,i=window.innerHeight;await new Promise(r=>setTimeout(r,80));let s;try{s=await Ze(document.documentElement,{cacheBust:!0,pixelRatio:1,skipFonts:!1,filter:r=>{var o;return!((o=r.hasAttribute)!=null&&o.call(r,"data-punchbug-ignore"))&&r.id!=="punchbug-root"}})}catch{return{full:"",thumb:""}}try{const r=await tt(s),o=document.documentElement.scrollWidth,c=document.documentElement.scrollHeight,a=r.naturalHeight>i*1.2;let h,l;if(a){const ot=r.naturalWidth/o,ct=r.naturalHeight/c;h=(window.scrollX+t)*ot,l=(window.scrollY+e)*ct}else h=t/n*r.naturalWidth,l=e/i*r.naturalHeight;const p=Math.max(0,Math.round(h-N)),g=Math.max(0,Math.round(l-q)),y=Math.min(r.naturalWidth-p,N*2),x=Math.min(r.naturalHeight-g,q*2),m=document.createElement("canvas");return m.width=y,m.height=x,m.getContext("2d").drawImage(r,p,g,y,x,0,0,y,x),{full:s,thumb:m.toDataURL("image/png")}}catch{return{full:s,thumb:s}}}function tt(t){return new Promise((e,n)=>{const i=new Image;i.onload=()=>e(i),i.onerror=n,i.src=t})}const nt=`
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
`;class it{constructor(e){if(this.picker=null,this.isPicking=!1,this.columns=[],this.tags=[],this.projectId="",this.pinCleanups=[],this.ghostPin=null,this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),!document.getElementById("pb-global-styles")){const i=document.createElement("style");i.id="pb-global-styles",i.textContent=`@keyframes pb-pin-drop {
        0%   { transform: translateY(-12px) scale(0.8); opacity: 0; }
        60%  { transform: translateY(4px)   scale(1.05); opacity: 1; }
        100% { transform: translateY(0)     scale(1);    opacity: 1; }
      }`,document.head.appendChild(i)}this.shadow=this.hostEl.attachShadow({mode:"open"});const n=document.createElement("style");n.textContent=nt,this.shadow.appendChild(n),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.title="Report a task",this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                 M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new ee(this.shadow),this.fetchColumns(),this.fetchTags(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchTags(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.tags=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),n=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!n.ok)return;const i=await n.json();this.projectId=i.projectId,this.createPins(i.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(n=>n()),this.pinCleanups=[];for(const n of e)if(n.pinX!==null&&n.pinY!==null)this.createPinAtCoords(n);else if(n.domSelector)try{const i=document.querySelector(n.domSelector);i&&this.createPinOnElement(i,n)}catch{}}createPinAtCoords(e){const n=this.buildPin(e.taskNumber);n.style.position="absolute",n.style.top=`${(e.pinY??0)-11}px`,n.style.left=`${(e.pinX??0)-11}px`,document.body.appendChild(n),n.addEventListener("click",i=>{i.stopPropagation(),this.taskPanel.show(e,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>n.remove())}createPinOnElement(e,n){const i=this.buildPin(n.taskNumber);i.style.position="absolute",document.body.appendChild(i);const s=()=>{const r=e.getBoundingClientRect();i.style.top=`${r.top+window.scrollY-11}px`,i.style.left=`${r.right+window.scrollX-11}px`};s(),window.addEventListener("scroll",s,{passive:!0}),window.addEventListener("resize",s,{passive:!0}),i.addEventListener("click",r=>{r.stopPropagation(),this.taskPanel.show(n,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",s),window.removeEventListener("resize",s),i.remove()})}buildPin(e){const n=document.createElement("button");return n.setAttribute("data-punchbug-ignore","true"),n.textContent=String(e),n.style.cssText="z-index:2147483644;background:hsl(348,100%,52%);color:#fff;border:2.5px solid #fff;border-radius:50%;width:24px;height:24px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",n.onmouseenter=()=>{n.style.transform="scale(1.25)",n.style.background="hsl(348,100%,42%)"},n.onmouseleave=()=>{n.style.transform="",n.style.background="hsl(348,100%,52%)"},n}showGhostPin(e,n){this.removeGhostPin();const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.innerHTML=`
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
              fill="hsl(348,100%,52%)" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
      </svg>`,i.style.cssText=`position:absolute;top:${n-32}px;left:${e-14}px;z-index:2147483644;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));animation:pb-pin-drop 0.25s cubic-bezier(0.34,1.56,0.64,1);`,document.body.appendChild(i),this.ghostPin=i}removeGhostPin(){var e;(e=this.ghostPin)==null||e.remove(),this.ghostPin=null}refreshPins(){this.fetchPageTasks()}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click anywhere — Esc to cancel";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Cancel"),this.picker=new G(n=>this.onPicked(n),()=>this.stopPicking()),this.picker.start()}stopPicking(){var n;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task";const e=this.triggerBtn.querySelector("span");e&&(e.textContent="Report"),(n=this.picker)==null||n.stop(),this.picker=null}async onPicked({el:e,clientX:n,clientY:i,pageX:s,pageY:r}){this.stopPicking(),this.showGhostPin(s,r);const o=te(e),c=ie(),{full:a,thumb:h}=await et(n,i);new J(this.shadow,{domInfo:o,screenshotFull:a,screenshotThumb:h,browserMeta:c,pageUrl:window.location.href,pinX:s,pinY:r,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,tags:this.tags,reporterName:this.config.reporterName,onSuccess:()=>{this.removeGhostPin(),this.refreshPins()},onClose:()=>this.removeGhostPin()})}}async function st(t,e){try{const i=`${new URL(t).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,s=await fetch(i,{credentials:"include"});if(!s.ok)return{allowed:!1};const r=await s.json();return{allowed:r.allowed===!0,userName:r.userName||void 0}}catch{return{allowed:!1}}}async function X(){const t=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:t.length>0&&(e=t[t.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const n=e.dataset.key,i=e.dataset.position||"right",s=e.dataset.apiUrl||rt();if(!n){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:r,userName:o}=await st(s,n);r&&new it({embedKey:n,apiUrl:s,position:i,reporterName:o})}function rt(){const t=document.querySelectorAll("script[src*='punchbug']");if(t.length>0){const e=t[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function Y(){const t=new URLSearchParams(window.location.search).get("pb_element");if(t)try{let e=function(){const s=n.getBoundingClientRect();i.style.top=s.top+"px",i.style.left=s.left+"px",i.style.width=s.width+"px",i.style.height=s.height+"px"};const n=document.querySelector(t);if(!n)return;n.scrollIntoView({block:"center",behavior:"smooth"});const i=document.createElement("div");i.setAttribute("data-punchbug-ignore","true"),i.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(i),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{i.style.opacity="0",setTimeout(()=>{i.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Y(),X()}):(Y(),X())})();
