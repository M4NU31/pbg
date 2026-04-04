(function(){"use strict";class N{constructor(e,n){this.hoveredEl=null,this.originalOutline="",this.onPick=e,this.onCancel=n,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){this.clearHighlight(),!e.closest("#punchbug-root")&&(this.hoveredEl=e,this.originalOutline=e.style.outline,e.style.outline="2px solid #3b82f6",e.style.outlineOffset="2px")}clearHighlight(){this.hoveredEl&&(this.hoveredEl.style.outline=this.originalOutline,this.hoveredEl.style.outlineOffset="",this.hoveredEl=null)}handleMouseOver(e){const n=e.target;n&&!n.closest("#punchbug-root")&&this.highlight(n)}handleMouseOut(e){const n=e.target;this.hoveredEl===n&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const n=e.target;n&&!n.closest("#punchbug-root")&&(this.clearHighlight(),this.stop(),this.onPick(n))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function q(t,e){const n=await fetch(`${t}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok){const r=await n.json().catch(()=>({}));throw new Error(r.error||"Failed to submit report")}return n.json()}class K{constructor(e,n){this.shadow=e,this.overlay=this.render(n)}render(e){const n=document.createElement("div");n.className="pb-overlay";const r=document.createElement("div");r.className="pb-form-card";const s=e.columns.length>0?`<div class="pb-field">
            <label class="pb-label" for="pb-column">Add to column</label>
            <select class="pb-input" id="pb-column">
              ${e.columns.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
           </div>`:"",i=e.tags.length>0?`<div class="pb-field">
            <label class="pb-label">Tags</label>
            <div class="pb-tags-grid" id="pb-tags">
              ${e.tags.map(c=>`
                <label class="pb-tag-option" style="--tag-color:${c.color}">
                  <input type="checkbox" class="pb-tag-cb" value="${c.id}" style="display:none" />
                  <span class="pb-tag-pill" data-tag-id="${c.id}" style="background:${c.color}22;color:${c.color};border:1px solid ${c.color}55">
                    ${c.name}
                  </span>
                </label>`).join("")}
            </div>
           </div>`:"";r.innerHTML=`
      <div class="pb-form-header">
        <h2 class="pb-form-title">Report a Task</h2>
        <button class="pb-close-btn" id="pb-close">&#x2715;</button>
      </div>

      ${e.screenshot?`<img class="pb-screenshot-preview" src="${e.screenshot}" alt="Element screenshot" />`:""}

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
        ${i}
        <button class="pb-submit-btn" id="pb-submit">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,n.appendChild(r),this.shadow.appendChild(n);const o=this.shadow.getElementById("pb-close");o==null||o.addEventListener("click",()=>this.close()),n.addEventListener("click",c=>{c.target===n&&this.close()}),e.tags.length>0&&this.shadow.querySelectorAll(".pb-tag-pill").forEach(l=>{l.style.cursor="pointer",l.addEventListener("click",()=>{const h=l.dataset.tagId,p=this.shadow.querySelector(`.pb-tag-cb[value="${h}"]`);p&&(p.checked=!p.checked,l.style.opacity=p.checked?"1":"0.5",l.style.fontWeight=p.checked?"600":"400")}),l.style.opacity="0.55"});const a=this.shadow.getElementById("pb-submit");return a==null||a.addEventListener("click",async()=>{var v;const c=this.shadow.getElementById("pb-title").value.trim();if(!c){this.shadow.getElementById("pb-title").focus();return}const l=this.shadow.getElementById("pb-desc").value.trim(),h=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0,p=e.tags.length>0?Array.from(this.shadow.querySelectorAll(".pb-tag-cb:checked")).map(g=>g.value):[];a.disabled=!0,a.textContent="Submitting...";try{await q(e.apiUrl,{embedKey:e.embedKey,title:c,description:l||void 0,screenshot:e.screenshot,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:h,tagIds:p.length>0?p:void 0,reporterName:e.reporterName,browserMeta:e.browserMeta});const g=this.shadow.getElementById("pb-report-form"),W=this.shadow.getElementById("pb-success");g&&(g.style.display="none"),W&&(W.style.display="block"),(v=e.onSuccess)==null||v.call(e),setTimeout(()=>this.close(),3e3)}catch(g){a.disabled=!1,a.textContent="Submit Task",alert("Failed to submit: "+(g instanceof Error?g.message:"Unknown error"))}}),n}close(){this.overlay.remove()}}const G={BACKLOG:"#6b7280",TODO:"#3b82f6",DOING:"#f59e0b",DONE:"#10b981",CLOSED:"#6b7280"},X={LOW:"#6b7280",MEDIUM:"#3b82f6",HIGH:"#f59e0b",CRITICAL:"#ef4444"};class Y{constructor(e){this.overlay=null,this.shadow=e}show(e,n,r){var c;this.close();const s=document.createElement("div");s.className="pb-overlay";const i=document.createElement("div");i.className="pb-form-card pb-task-panel";const o=G[e.status]??"#6b7280",a=X[e.priority]??"#6b7280";i.innerHTML=`
      <div class="pb-form-header">
        <span style="font-size:12px;color:#6b7280;font-weight:600">#${e.taskNumber}</span>
        <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
      </div>
      <p style="font-size:15px;font-weight:600;color:#111;margin:0 0 10px">${e.title}</p>
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${o}22;color:${o}">${e.status}</span>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${a}22;color:${a}">${e.priority}</span>
      </div>
      ${e.screenshotUrl?`<img src="${e.screenshotUrl}" alt="Screenshot" style="width:100%;max-height:140px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;margin-bottom:12px" />`:""}
      ${e.guestName?`<p style="font-size:12px;color:#6b7280;margin:0 0 12px">Reported by <strong>${e.guestName}</strong></p>`:""}
      <a href="${r}/projects/${n}?task=${e.id}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;background:#3b82f6;color:white;border-radius:6px;padding:8px;font-size:13px;font-weight:600;text-decoration:none">
        View in board →
      </a>
    `,s.appendChild(i),this.shadow.appendChild(s),this.overlay=s,(c=this.shadow.getElementById("pb-tpanel-close"))==null||c.addEventListener("click",()=>this.close()),s.addEventListener("click",l=>{l.target===s&&this.close()})}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function J(t){return{selector:Q(t),outerHtml:t.outerHTML.slice(0,2e3)}}function Q(t){var r;const e=[];let n=t;for(;n&&n!==document.body&&n.nodeType===Node.ELEMENT_NODE;){let s=n.tagName.toLowerCase();if(n.id){e.unshift(`#${CSS.escape(n.id)}`);break}const i=(r=n.parentElement)==null?void 0:r.children;if(i&&i.length>1){let o=1;for(let c=0;c<i.length&&i[c]!==n;c++)i[c].tagName===n.tagName&&o++;Array.from(i).filter(c=>c.tagName===n.tagName).length>1&&(s+=`:nth-of-type(${o})`)}if(e.unshift(s),n=n.parentElement,e.length>=6)break}return e.join(" > ")||t.tagName.toLowerCase()}function Z(){const t=navigator.userAgent,{browserName:e,browserVersion:n}=ee(t),{osName:r,osVersion:s}=te(t),i=ne();return{browserName:e,browserVersion:n,osName:r,osVersion:s,deviceType:i,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:t}}function ee(t){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const n of e){const r=t.match(n.pattern);if(r)return{browserName:n.name,browserVersion:r[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function te(t){var e,n,r;return/Windows NT 10/.test(t)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(t)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(t)?{osName:"macOS",osVersion:((e=t.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(t)?{osName:"Android",osVersion:((n=t.match(/Android ([0-9.]+)/))==null?void 0:n[1])??""}:/iPhone OS ([0-9_]+)/.test(t)?{osName:"iOS",osVersion:((r=t.match(/iPhone OS ([0-9_]+)/))==null?void 0:r[1].replace(/_/g,"."))??""}:/Linux/.test(t)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function ne(){const t=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(t)?"mobile":/iPad|Android(?!.*Mobile)/.test(t)?"tablet":"desktop"}function re(t,e){if(t.match(/^[a-z]+:\/\//i))return t;if(t.match(/^\/\//))return window.location.protocol+t;if(t.match(/^[a-z]+:/i))return t;const n=document.implementation.createHTMLDocument(),r=n.createElement("base"),s=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(s),e&&(r.href=e),s.href=t,s.href}const se=(()=>{let t=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${e()}${t}`)})();function f(t){const e=[];for(let n=0,r=t.length;n<r;n++)e.push(t[n]);return e}let m=null;function P(t={}){return m||(t.includeStyleProperties?(m=t.includeStyleProperties,m):(m=f(window.getComputedStyle(document.documentElement)),m))}function w(t,e){const r=(t.ownerDocument.defaultView||window).getComputedStyle(t).getPropertyValue(e);return r?parseFloat(r.replace("px","")):0}function ie(t){const e=w(t,"border-left-width"),n=w(t,"border-right-width");return t.clientWidth+e+n}function oe(t){const e=w(t,"border-top-width"),n=w(t,"border-bottom-width");return t.clientHeight+e+n}function $(t,e={}){const n=e.width||ie(t),r=e.height||oe(t);return{width:n,height:r}}function ae(){let t,e;try{e=process}catch{}const n=e&&e.env?e.env.devicePixelRatio:null;return n&&(t=parseInt(n,10),Number.isNaN(t)&&(t=1)),t||window.devicePixelRatio||1}const d=16384;function ce(t){(t.width>d||t.height>d)&&(t.width>d&&t.height>d?t.width>t.height?(t.height*=d/t.width,t.width=d):(t.width*=d/t.height,t.height=d):t.width>d?(t.height*=d/t.width,t.width=d):(t.width*=d/t.height,t.height=d))}function y(t){return new Promise((e,n)=>{const r=new Image;r.onload=()=>{r.decode().then(()=>{requestAnimationFrame(()=>e(r))})},r.onerror=n,r.crossOrigin="anonymous",r.decoding="async",r.src=t})}async function le(t){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(t)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function ue(t,e,n){const r="http://www.w3.org/2000/svg",s=document.createElementNS(r,"svg"),i=document.createElementNS(r,"foreignObject");return s.setAttribute("width",`${e}`),s.setAttribute("height",`${n}`),s.setAttribute("viewBox",`0 0 ${e} ${n}`),i.setAttribute("width","100%"),i.setAttribute("height","100%"),i.setAttribute("x","0"),i.setAttribute("y","0"),i.setAttribute("externalResourcesRequired","true"),s.appendChild(i),i.appendChild(t),le(s)}const u=(t,e)=>{if(t instanceof e)return!0;const n=Object.getPrototypeOf(t);return n===null?!1:n.constructor.name===e.name||u(n,e)};function de(t){const e=t.getPropertyValue("content");return`${t.cssText} content: '${e.replace(/'|"/g,"")}';`}function he(t,e){return P(e).map(n=>{const r=t.getPropertyValue(n),s=t.getPropertyPriority(n);return`${n}: ${r}${s?" !important":""};`}).join(" ")}function pe(t,e,n,r){const s=`.${t}:${e}`,i=n.cssText?de(n):he(n,r);return document.createTextNode(`${s}{${i}}`)}function L(t,e,n,r){const s=window.getComputedStyle(t,n),i=s.getPropertyValue("content");if(i===""||i==="none")return;const o=se();try{e.className=`${e.className} ${o}`}catch{return}const a=document.createElement("style");a.appendChild(pe(o,n,s,r)),e.appendChild(a)}function fe(t,e,n){L(t,e,":before",n),L(t,e,":after",n)}const R="application/font-woff",T="image/jpeg",ge={woff:R,woff2:R,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:T,jpeg:T,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function me(t){const e=/\.([^./]*?)$/g.exec(t);return e?e[1]:""}function E(t){const e=me(t).toLowerCase();return ge[e]||""}function be(t){return t.split(/,/)[1]}function k(t){return t.search(/^(data:)/)!==-1}function we(t,e){return`data:${e};base64,${t}`}async function I(t,e,n){const r=await fetch(t,e);if(r.status===404)throw new Error(`Resource "${r.url}" not found`);const s=await r.blob();return new Promise((i,o)=>{const a=new FileReader;a.onerror=o,a.onloadend=()=>{try{i(n({res:r,result:a.result}))}catch(c){o(c)}},a.readAsDataURL(s)})}const S={};function ye(t,e,n){let r=t.replace(/\?.*/,"");return n&&(r=t),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,"")),e?`[${e}]${r}`:r}async function C(t,e,n){const r=ye(t,e,n.includeQueryParams);if(S[r]!=null)return S[r];n.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+new Date().getTime());let s;try{const i=await I(t,n.fetchRequestInit,({res:o,result:a})=>(e||(e=o.headers.get("Content-Type")||""),be(a)));s=we(i,e)}catch(i){s=n.imagePlaceholder||"";let o=`Failed to fetch resource: ${t}`;i&&(o=typeof i=="string"?i:i.message),o&&console.warn(o)}return S[r]=s,s}async function xe(t){const e=t.toDataURL();return e==="data:,"?t.cloneNode(!1):y(e)}async function ve(t,e){if(t.currentSrc){const i=document.createElement("canvas"),o=i.getContext("2d");i.width=t.clientWidth,i.height=t.clientHeight,o==null||o.drawImage(t,0,0,i.width,i.height);const a=i.toDataURL();return y(a)}const n=t.poster,r=E(n),s=await C(n,r,e);return y(s)}async function Ee(t,e){var n;try{if(!((n=t==null?void 0:t.contentDocument)===null||n===void 0)&&n.body)return await x(t.contentDocument.body,e,!0)}catch{}return t.cloneNode(!1)}async function ke(t,e){return u(t,HTMLCanvasElement)?xe(t):u(t,HTMLVideoElement)?ve(t,e):u(t,HTMLIFrameElement)?Ee(t,e):t.cloneNode(M(t))}const Se=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SLOT",M=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SVG";async function Ce(t,e,n){var r,s;if(M(e))return e;let i=[];return Se(t)&&t.assignedNodes?i=f(t.assignedNodes()):u(t,HTMLIFrameElement)&&(!((r=t.contentDocument)===null||r===void 0)&&r.body)?i=f(t.contentDocument.body.childNodes):i=f(((s=t.shadowRoot)!==null&&s!==void 0?s:t).childNodes),i.length===0||u(t,HTMLVideoElement)||await i.reduce((o,a)=>o.then(()=>x(a,n)).then(c=>{c&&e.appendChild(c)}),Promise.resolve()),e}function Pe(t,e,n){const r=e.style;if(!r)return;const s=window.getComputedStyle(t);s.cssText?(r.cssText=s.cssText,r.transformOrigin=s.transformOrigin):P(n).forEach(i=>{let o=s.getPropertyValue(i);i==="font-size"&&o.endsWith("px")&&(o=`${Math.floor(parseFloat(o.substring(0,o.length-2)))-.1}px`),u(t,HTMLIFrameElement)&&i==="display"&&o==="inline"&&(o="block"),i==="d"&&e.getAttribute("d")&&(o=`path(${e.getAttribute("d")})`),r.setProperty(i,o,s.getPropertyPriority(i))})}function $e(t,e){u(t,HTMLTextAreaElement)&&(e.innerHTML=t.value),u(t,HTMLInputElement)&&e.setAttribute("value",t.value)}function Le(t,e){if(u(t,HTMLSelectElement)){const n=e,r=Array.from(n.children).find(s=>t.value===s.getAttribute("value"));r&&r.setAttribute("selected","")}}function Re(t,e,n){return u(e,Element)&&(Pe(t,e,n),fe(t,e,n),$e(t,e),Le(t,e)),e}async function Te(t,e){const n=t.querySelectorAll?t.querySelectorAll("use"):[];if(n.length===0)return t;const r={};for(let i=0;i<n.length;i++){const a=n[i].getAttribute("xlink:href");if(a){const c=t.querySelector(a),l=document.querySelector(a);!c&&l&&!r[a]&&(r[a]=await x(l,e,!0))}}const s=Object.values(r);if(s.length){const i="http://www.w3.org/1999/xhtml",o=document.createElementNS(i,"svg");o.setAttribute("xmlns",i),o.style.position="absolute",o.style.width="0",o.style.height="0",o.style.overflow="hidden",o.style.display="none";const a=document.createElementNS(i,"defs");o.appendChild(a);for(let c=0;c<s.length;c++)a.appendChild(s[c]);t.appendChild(o)}return t}async function x(t,e,n){return!n&&e.filter&&!e.filter(t)?null:Promise.resolve(t).then(r=>ke(r,e)).then(r=>Ce(t,r,e)).then(r=>Re(t,r,e)).then(r=>Te(r,e))}const O=/url\((['"]?)([^'"]+?)\1\)/g,Ie=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Me=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Oe(t){const e=t.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function Ue(t){const e=[];return t.replace(O,(n,r,s)=>(e.push(s),n)),e.filter(n=>!k(n))}async function Ae(t,e,n,r,s){try{const i=n?re(e,n):e,o=E(e);let a;return s||(a=await C(i,o,r)),t.replace(Oe(e),`$1${a}$3`)}catch{}return t}function Fe(t,{preferredFontFormat:e}){return e?t.replace(Me,n=>{for(;;){const[r,,s]=Ie.exec(n)||[];if(!s)return"";if(s===e)return`src: ${r};`}}):t}function U(t){return t.search(O)!==-1}async function A(t,e,n){if(!U(t))return t;const r=Fe(t,n);return Ue(r).reduce((i,o)=>i.then(a=>Ae(a,o,e,n)),Promise.resolve(r))}async function b(t,e,n){var r;const s=(r=e.style)===null||r===void 0?void 0:r.getPropertyValue(t);if(s){const i=await A(s,null,n);return e.style.setProperty(t,i,e.style.getPropertyPriority(t)),!0}return!1}async function De(t,e){await b("background",t,e)||await b("background-image",t,e),await b("mask",t,e)||await b("-webkit-mask",t,e)||await b("mask-image",t,e)||await b("-webkit-mask-image",t,e)}async function Be(t,e){const n=u(t,HTMLImageElement);if(!(n&&!k(t.src))&&!(u(t,SVGImageElement)&&!k(t.href.baseVal)))return;const r=n?t.src:t.href.baseVal,s=await C(r,E(r),e);await new Promise((i,o)=>{t.onload=i,t.onerror=e.onImageErrorHandler?(...c)=>{try{i(e.onImageErrorHandler(...c))}catch(l){o(l)}}:o;const a=t;a.decode&&(a.decode=i),a.loading==="lazy"&&(a.loading="eager"),n?(t.srcset="",t.src=s):t.href.baseVal=s})}async function ze(t,e){const r=f(t.childNodes).map(s=>F(s,e));await Promise.all(r).then(()=>t)}async function F(t,e){u(t,Element)&&(await De(t,e),await Be(t,e),await ze(t,e))}function He(t,e){const{style:n}=t;e.backgroundColor&&(n.backgroundColor=e.backgroundColor),e.width&&(n.width=`${e.width}px`),e.height&&(n.height=`${e.height}px`);const r=e.style;return r!=null&&Object.keys(r).forEach(s=>{n[s]=r[s]}),t}const D={};async function B(t){let e=D[t];if(e!=null)return e;const r=await(await fetch(t)).text();return e={url:t,cssText:r},D[t]=e,e}async function z(t,e){let n=t.cssText;const r=/url\(["']?([^"')]+)["']?\)/g,i=(n.match(/url\([^)]+\)/g)||[]).map(async o=>{let a=o.replace(r,"$1");return a.startsWith("https://")||(a=new URL(a,t.url).href),I(a,e.fetchRequestInit,({result:c})=>(n=n.replace(o,`url(${c})`),[o,c]))});return Promise.all(i).then(()=>n)}function H(t){if(t==null)return[];const e=[],n=/(\/\*[\s\S]*?\*\/)/gi;let r=t.replace(n,"");const s=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const c=s.exec(r);if(c===null)break;e.push(c[0])}r=r.replace(s,"");const i=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",a=new RegExp(o,"gi");for(;;){let c=i.exec(r);if(c===null){if(c=a.exec(r),c===null)break;i.lastIndex=a.lastIndex}else a.lastIndex=i.lastIndex;e.push(c[0])}return e}async function Ve(t,e){const n=[],r=[];return t.forEach(s=>{if("cssRules"in s)try{f(s.cssRules||[]).forEach((i,o)=>{if(i.type===CSSRule.IMPORT_RULE){let a=o+1;const c=i.href,l=B(c).then(h=>z(h,e)).then(h=>H(h).forEach(p=>{try{s.insertRule(p,p.startsWith("@import")?a+=1:s.cssRules.length)}catch(v){console.error("Error inserting rule from remote css",{rule:p,error:v})}})).catch(h=>{console.error("Error loading remote css",h.toString())});r.push(l)}})}catch(i){const o=t.find(a=>a.href==null)||document.styleSheets[0];s.href!=null&&r.push(B(s.href).then(a=>z(a,e)).then(a=>H(a).forEach(c=>{o.insertRule(c,o.cssRules.length)})).catch(a=>{console.error("Error loading remote stylesheet",a)})),console.error("Error inlining remote css file",i)}}),Promise.all(r).then(()=>(t.forEach(s=>{if("cssRules"in s)try{f(s.cssRules||[]).forEach(i=>{n.push(i)})}catch(i){console.error(`Error while reading CSS rules from ${s.href}`,i)}}),n))}function je(t){return t.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>U(e.style.getPropertyValue("src")))}async function _e(t,e){if(t.ownerDocument==null)throw new Error("Provided element is not within a Document");const n=f(t.ownerDocument.styleSheets),r=await Ve(n,e);return je(r)}function V(t){return t.trim().replace(/["']/g,"")}function We(t){const e=new Set;function n(r){(r.style.fontFamily||getComputedStyle(r).fontFamily).split(",").forEach(i=>{e.add(V(i))}),Array.from(r.children).forEach(i=>{i instanceof HTMLElement&&n(i)})}return n(t),e}async function Ne(t,e){const n=await _e(t,e),r=We(t);return(await Promise.all(n.filter(i=>r.has(V(i.style.fontFamily))).map(i=>{const o=i.parentStyleSheet?i.parentStyleSheet.href:null;return A(i.cssText,o,e)}))).join(`
`)}async function qe(t,e){const n=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await Ne(t,e);if(n){const r=document.createElement("style"),s=document.createTextNode(n);r.appendChild(s),t.firstChild?t.insertBefore(r,t.firstChild):t.appendChild(r)}}async function Ke(t,e={}){const{width:n,height:r}=$(t,e),s=await x(t,e,!0);return await qe(s,e),await F(s,e),He(s,e),await ue(s,n,r)}async function Ge(t,e={}){const{width:n,height:r}=$(t,e),s=await Ke(t,e),i=await y(s),o=document.createElement("canvas"),a=o.getContext("2d"),c=e.pixelRatio||ae(),l=e.canvasWidth||n,h=e.canvasHeight||r;return o.width=l*c,o.height=h*c,e.skipAutoScale||ce(o),o.style.width=`${l}`,o.style.height=`${h}`,e.backgroundColor&&(a.fillStyle=e.backgroundColor,a.fillRect(0,0,o.width,o.height)),a.drawImage(i,0,0,o.width,o.height),o}async function Xe(t,e={}){return(await Ge(t,e)).toDataURL()}async function Ye(t){return t.scrollIntoView({block:"center",inline:"center"}),await new Promise(e=>setTimeout(e,200)),Xe(t,{cacheBust:!0,skipFonts:!1,filter:e=>{var n;return!((n=e.hasAttribute)!=null&&n.call(e,"data-punchbug-ignore"))&&e.id!=="punchbug-root"}})}const Je=`
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
    background: #3b82f6;
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
    background: #2563eb;
  }

  .pb-trigger.pb-active {
    background: #dc2626;
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

  .pb-screenshot-preview {
    width: 100%;
    max-height: 180px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-bottom: 16px;
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
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
    background: #3b82f6;
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
    background: #2563eb;
  }

  .pb-submit-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  /* Picking cursor mode */
  .pb-picking-active * {
    cursor: crosshair !important;
  }

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
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
  }
`;class Qe{constructor(e){this.picker=null,this.isPicking=!1,this.columns=[],this.tags=[],this.projectId="",this.pinCleanups=[],this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),this.shadow=this.hostEl.attachShadow({mode:"open"});const n=document.createElement("style");n.textContent=Je,this.shadow.appendChild(n),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.setAttribute("title","Report a task"),this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report Task</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new Y(this.shadow),this.fetchColumns(),this.fetchTags(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchTags(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/tags?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.tags=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),n=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!n.ok)return;const r=await n.json();this.projectId=r.projectId,this.createPins(r.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(n=>n()),this.pinCleanups=[];for(const n of e)try{const r=document.querySelector(n.domSelector);if(!r)continue;this.createPin(r,n)}catch{}}createPin(e,n){const r=document.createElement("button");r.setAttribute("data-punchbug-ignore","true"),r.textContent=String(n.taskNumber),r.style.cssText="position:absolute;z-index:2147483644;background:#3b82f6;color:#fff;border:2px solid #fff;border-radius:50%;width:22px;height:22px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 6px rgba(0,0,0,0.35);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",r.onmouseenter=()=>{r.style.transform="scale(1.2)",r.style.background="#2563eb"},r.onmouseleave=()=>{r.style.transform="",r.style.background="#3b82f6"},document.body.appendChild(r);const s=()=>{const i=e.getBoundingClientRect();r.style.top=`${i.top+window.scrollY-11}px`,r.style.left=`${i.right+window.scrollX-11}px`};s(),window.addEventListener("scroll",s,{passive:!0}),window.addEventListener("resize",s,{passive:!0}),r.addEventListener("click",i=>{i.stopPropagation(),this.taskPanel.show(n,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",s),window.removeEventListener("resize",s),r.remove()})}refreshPins(){this.fetchPageTasks()}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click any element — press Esc to cancel",this.picker=new N(e=>this.onElementPicked(e),()=>this.stopPicking()),this.picker.start()}stopPicking(){var e;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task",(e=this.picker)==null||e.stop(),this.picker=null}async onElementPicked(e){this.stopPicking();const n=J(e),r=Z(),s=window.location.href;let i="";try{i=await Ye(e)}catch(o){console.warn("PunchBug: screenshot failed",o)}new K(this.shadow,{domInfo:n,screenshot:i,browserMeta:r,pageUrl:s,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,tags:this.tags,reporterName:this.config.reporterName,onSuccess:()=>this.refreshPins()})}}async function Ze(t,e){try{const r=`${new URL(t).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,s=await fetch(r,{credentials:"include"});if(!s.ok)return{allowed:!1};const i=await s.json();return{allowed:i.allowed===!0,userName:i.userName||void 0}}catch{return{allowed:!1}}}async function j(){const t=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:t.length>0&&(e=t[t.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const n=e.dataset.key,r=e.dataset.position||"right",s=e.dataset.apiUrl||et();if(!n){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:i,userName:o}=await Ze(s,n);i&&new Qe({embedKey:n,apiUrl:s,position:r,reporterName:o})}function et(){const t=document.querySelectorAll("script[src*='punchbug']");if(t.length>0){const e=t[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function _(){const t=new URLSearchParams(window.location.search).get("pb_element");if(t)try{let e=function(){const s=n.getBoundingClientRect();r.style.top=s.top+"px",r.style.left=s.left+"px",r.style.width=s.width+"px",r.style.height=s.height+"px"};const n=document.querySelector(t);if(!n)return;n.scrollIntoView({block:"center",behavior:"smooth"});const r=document.createElement("div");r.setAttribute("data-punchbug-ignore","true"),r.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(r),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{r.style.opacity="0",setTimeout(()=>{r.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{_(),j()}):(_(),j())})();
