(function(){"use strict";class _{constructor(e,n){this.hoveredEl=null,this.originalOutline="",this.onPick=e,this.onCancel=n,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(e){this.clearHighlight(),!e.closest("#punchbug-root")&&(this.hoveredEl=e,this.originalOutline=e.style.outline,e.style.outline="2px solid #3b82f6",e.style.outlineOffset="2px")}clearHighlight(){this.hoveredEl&&(this.hoveredEl.style.outline=this.originalOutline,this.hoveredEl.style.outlineOffset="",this.hoveredEl=null)}handleMouseOver(e){const n=e.target;n&&!n.closest("#punchbug-root")&&this.highlight(n)}handleMouseOut(e){const n=e.target;this.hoveredEl===n&&this.clearHighlight()}handleClick(e){e.preventDefault(),e.stopPropagation();const n=e.target;n&&!n.closest("#punchbug-root")&&(this.clearHighlight(),this.stop(),this.onPick(n))}handleKeyDown(e){e.key==="Escape"&&(this.stop(),this.onCancel())}}async function W(t,e){const n=await fetch(`${t}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok){const r=await n.json().catch(()=>({}));throw new Error(r.error||"Failed to submit report")}return n.json()}class N{constructor(e,n){this.shadow=e,this.overlay=this.render(n)}render(e){const n=document.createElement("div");n.className="pb-overlay";const r=document.createElement("div");r.className="pb-form-card";const i=e.columns.length>0?`<div class="pb-field">
            <label class="pb-label" for="pb-column">Add to column</label>
            <select class="pb-input" id="pb-column">
              ${e.columns.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
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
        ${i}
        <button class="pb-submit-btn" id="pb-submit">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,n.appendChild(r),this.shadow.appendChild(n);const s=this.shadow.getElementById("pb-close");s==null||s.addEventListener("click",()=>this.close()),n.addEventListener("click",c=>{c.target===n&&this.close()});const o=this.shadow.getElementById("pb-submit");return o==null||o.addEventListener("click",async()=>{var d;const c=this.shadow.getElementById("pb-title").value.trim();if(!c){this.shadow.getElementById("pb-title").focus();return}const a=this.shadow.getElementById("pb-desc").value.trim(),h=e.columns.length>0?this.shadow.getElementById("pb-column").value:void 0;o.disabled=!0,o.textContent="Submitting...";try{await W(e.apiUrl,{embedKey:e.embedKey,title:c,description:a||void 0,screenshot:e.screenshot,domSelector:e.domInfo.selector,domHtml:e.domInfo.outerHtml,pageUrl:e.pageUrl,columnId:h,reporterName:e.reporterName,browserMeta:e.browserMeta});const p=this.shadow.getElementById("pb-report-form"),x=this.shadow.getElementById("pb-success");p&&(p.style.display="none"),x&&(x.style.display="block"),(d=e.onSuccess)==null||d.call(e),setTimeout(()=>this.close(),3e3)}catch(p){o.disabled=!1,o.textContent="Submit Task",alert("Failed to submit: "+(p instanceof Error?p.message:"Unknown error"))}}),n}close(){this.overlay.remove()}}const q={BACKLOG:"#6b7280",TODO:"#3b82f6",DOING:"#f59e0b",DONE:"#10b981",CLOSED:"#6b7280"},K={LOW:"#6b7280",MEDIUM:"#3b82f6",HIGH:"#f59e0b",CRITICAL:"#ef4444"};class G{constructor(e){this.overlay=null,this.shadow=e}show(e,n,r){var a;this.close();const i=document.createElement("div");i.className="pb-overlay";const s=document.createElement("div");s.className="pb-form-card pb-task-panel";const o=q[e.status]??"#6b7280",c=K[e.priority]??"#6b7280";s.innerHTML=`
      <div class="pb-form-header">
        <span style="font-size:12px;color:#6b7280;font-weight:600">#${e.taskNumber}</span>
        <button class="pb-close-btn" id="pb-tpanel-close">&#x2715;</button>
      </div>
      <p style="font-size:15px;font-weight:600;color:#111;margin:0 0 10px">${e.title}</p>
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${o}22;color:${o}">${e.status}</span>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${c}22;color:${c}">${e.priority}</span>
      </div>
      ${e.screenshotUrl?`<img src="${e.screenshotUrl}" alt="Screenshot" style="width:100%;max-height:140px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;margin-bottom:12px" />`:""}
      ${e.guestName?`<p style="font-size:12px;color:#6b7280;margin:0 0 12px">Reported by <strong>${e.guestName}</strong></p>`:""}
      <a href="${r}/projects/${n}?task=${e.id}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;background:#3b82f6;color:white;border-radius:6px;padding:8px;font-size:13px;font-weight:600;text-decoration:none">
        View in board →
      </a>
    `,i.appendChild(s),this.shadow.appendChild(i),this.overlay=i,(a=this.shadow.getElementById("pb-tpanel-close"))==null||a.addEventListener("click",()=>this.close()),i.addEventListener("click",h=>{h.target===i&&this.close()})}close(){var e;(e=this.overlay)==null||e.remove(),this.overlay=null}}function X(t){return{selector:Y(t),outerHtml:t.outerHTML.slice(0,2e3)}}function Y(t){var r;const e=[];let n=t;for(;n&&n!==document.body&&n.nodeType===Node.ELEMENT_NODE;){let i=n.tagName.toLowerCase();if(n.id){e.unshift(`#${CSS.escape(n.id)}`);break}const s=(r=n.parentElement)==null?void 0:r.children;if(s&&s.length>1){let o=1;for(let a=0;a<s.length&&s[a]!==n;a++)s[a].tagName===n.tagName&&o++;Array.from(s).filter(a=>a.tagName===n.tagName).length>1&&(i+=`:nth-of-type(${o})`)}if(e.unshift(i),n=n.parentElement,e.length>=6)break}return e.join(" > ")||t.tagName.toLowerCase()}function J(){const t=navigator.userAgent,{browserName:e,browserVersion:n}=Q(t),{osName:r,osVersion:i}=Z(t),s=ee();return{browserName:e,browserVersion:n,osName:r,osVersion:i,deviceType:s,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:t}}function Q(t){const e=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const n of e){const r=t.match(n.pattern);if(r)return{browserName:n.name,browserVersion:r[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function Z(t){var e,n,r;return/Windows NT 10/.test(t)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(t)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(t)?{osName:"macOS",osVersion:((e=t.match(/Mac OS X ([0-9_]+)/))==null?void 0:e[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(t)?{osName:"Android",osVersion:((n=t.match(/Android ([0-9.]+)/))==null?void 0:n[1])??""}:/iPhone OS ([0-9_]+)/.test(t)?{osName:"iOS",osVersion:((r=t.match(/iPhone OS ([0-9_]+)/))==null?void 0:r[1].replace(/_/g,"."))??""}:/Linux/.test(t)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function ee(){const t=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(t)?"mobile":/iPad|Android(?!.*Mobile)/.test(t)?"tablet":"desktop"}function te(t,e){if(t.match(/^[a-z]+:\/\//i))return t;if(t.match(/^\/\//))return window.location.protocol+t;if(t.match(/^[a-z]+:/i))return t;const n=document.implementation.createHTMLDocument(),r=n.createElement("base"),i=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(i),e&&(r.href=e),i.href=t,i.href}const ne=(()=>{let t=0;const e=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${e()}${t}`)})();function f(t){const e=[];for(let n=0,r=t.length;n<r;n++)e.push(t[n]);return e}let m=null;function C(t={}){return m||(t.includeStyleProperties?(m=t.includeStyleProperties,m):(m=f(window.getComputedStyle(document.documentElement)),m))}function b(t,e){const r=(t.ownerDocument.defaultView||window).getComputedStyle(t).getPropertyValue(e);return r?parseFloat(r.replace("px","")):0}function re(t){const e=b(t,"border-left-width"),n=b(t,"border-right-width");return t.clientWidth+e+n}function ie(t){const e=b(t,"border-top-width"),n=b(t,"border-bottom-width");return t.clientHeight+e+n}function P(t,e={}){const n=e.width||re(t),r=e.height||ie(t);return{width:n,height:r}}function se(){let t,e;try{e=process}catch{}const n=e&&e.env?e.env.devicePixelRatio:null;return n&&(t=parseInt(n,10),Number.isNaN(t)&&(t=1)),t||window.devicePixelRatio||1}const u=16384;function oe(t){(t.width>u||t.height>u)&&(t.width>u&&t.height>u?t.width>t.height?(t.height*=u/t.width,t.width=u):(t.width*=u/t.height,t.height=u):t.width>u?(t.height*=u/t.width,t.width=u):(t.width*=u/t.height,t.height=u))}function w(t){return new Promise((e,n)=>{const r=new Image;r.onload=()=>{r.decode().then(()=>{requestAnimationFrame(()=>e(r))})},r.onerror=n,r.crossOrigin="anonymous",r.decoding="async",r.src=t})}async function ce(t){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(t)).then(encodeURIComponent).then(e=>`data:image/svg+xml;charset=utf-8,${e}`)}async function ae(t,e,n){const r="http://www.w3.org/2000/svg",i=document.createElementNS(r,"svg"),s=document.createElementNS(r,"foreignObject");return i.setAttribute("width",`${e}`),i.setAttribute("height",`${n}`),i.setAttribute("viewBox",`0 0 ${e} ${n}`),s.setAttribute("width","100%"),s.setAttribute("height","100%"),s.setAttribute("x","0"),s.setAttribute("y","0"),s.setAttribute("externalResourcesRequired","true"),i.appendChild(s),s.appendChild(t),ce(i)}const l=(t,e)=>{if(t instanceof e)return!0;const n=Object.getPrototypeOf(t);return n===null?!1:n.constructor.name===e.name||l(n,e)};function le(t){const e=t.getPropertyValue("content");return`${t.cssText} content: '${e.replace(/'|"/g,"")}';`}function ue(t,e){return C(e).map(n=>{const r=t.getPropertyValue(n),i=t.getPropertyPriority(n);return`${n}: ${r}${i?" !important":""};`}).join(" ")}function he(t,e,n,r){const i=`.${t}:${e}`,s=n.cssText?le(n):ue(n,r);return document.createTextNode(`${i}{${s}}`)}function L(t,e,n,r){const i=window.getComputedStyle(t,n),s=i.getPropertyValue("content");if(s===""||s==="none")return;const o=ne();try{e.className=`${e.className} ${o}`}catch{return}const c=document.createElement("style");c.appendChild(he(o,n,i,r)),e.appendChild(c)}function de(t,e,n){L(t,e,":before",n),L(t,e,":after",n)}const R="application/font-woff",$="image/jpeg",pe={woff:R,woff2:R,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:$,jpeg:$,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function fe(t){const e=/\.([^./]*?)$/g.exec(t);return e?e[1]:""}function v(t){const e=fe(t).toLowerCase();return pe[e]||""}function me(t){return t.split(/,/)[1]}function E(t){return t.search(/^(data:)/)!==-1}function ge(t,e){return`data:${e};base64,${t}`}async function T(t,e,n){const r=await fetch(t,e);if(r.status===404)throw new Error(`Resource "${r.url}" not found`);const i=await r.blob();return new Promise((s,o)=>{const c=new FileReader;c.onerror=o,c.onloadend=()=>{try{s(n({res:r,result:c.result}))}catch(a){o(a)}},c.readAsDataURL(i)})}const k={};function be(t,e,n){let r=t.replace(/\?.*/,"");return n&&(r=t),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,"")),e?`[${e}]${r}`:r}async function S(t,e,n){const r=be(t,e,n.includeQueryParams);if(k[r]!=null)return k[r];n.cacheBust&&(t+=(/\?/.test(t)?"&":"?")+new Date().getTime());let i;try{const s=await T(t,n.fetchRequestInit,({res:o,result:c})=>(e||(e=o.headers.get("Content-Type")||""),me(c)));i=ge(s,e)}catch(s){i=n.imagePlaceholder||"";let o=`Failed to fetch resource: ${t}`;s&&(o=typeof s=="string"?s:s.message),o&&console.warn(o)}return k[r]=i,i}async function we(t){const e=t.toDataURL();return e==="data:,"?t.cloneNode(!1):w(e)}async function ye(t,e){if(t.currentSrc){const s=document.createElement("canvas"),o=s.getContext("2d");s.width=t.clientWidth,s.height=t.clientHeight,o==null||o.drawImage(t,0,0,s.width,s.height);const c=s.toDataURL();return w(c)}const n=t.poster,r=v(n),i=await S(n,r,e);return w(i)}async function xe(t,e){var n;try{if(!((n=t==null?void 0:t.contentDocument)===null||n===void 0)&&n.body)return await y(t.contentDocument.body,e,!0)}catch{}return t.cloneNode(!1)}async function ve(t,e){return l(t,HTMLCanvasElement)?we(t):l(t,HTMLVideoElement)?ye(t,e):l(t,HTMLIFrameElement)?xe(t,e):t.cloneNode(I(t))}const Ee=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SLOT",I=t=>t.tagName!=null&&t.tagName.toUpperCase()==="SVG";async function ke(t,e,n){var r,i;if(I(e))return e;let s=[];return Ee(t)&&t.assignedNodes?s=f(t.assignedNodes()):l(t,HTMLIFrameElement)&&(!((r=t.contentDocument)===null||r===void 0)&&r.body)?s=f(t.contentDocument.body.childNodes):s=f(((i=t.shadowRoot)!==null&&i!==void 0?i:t).childNodes),s.length===0||l(t,HTMLVideoElement)||await s.reduce((o,c)=>o.then(()=>y(c,n)).then(a=>{a&&e.appendChild(a)}),Promise.resolve()),e}function Se(t,e,n){const r=e.style;if(!r)return;const i=window.getComputedStyle(t);i.cssText?(r.cssText=i.cssText,r.transformOrigin=i.transformOrigin):C(n).forEach(s=>{let o=i.getPropertyValue(s);s==="font-size"&&o.endsWith("px")&&(o=`${Math.floor(parseFloat(o.substring(0,o.length-2)))-.1}px`),l(t,HTMLIFrameElement)&&s==="display"&&o==="inline"&&(o="block"),s==="d"&&e.getAttribute("d")&&(o=`path(${e.getAttribute("d")})`),r.setProperty(s,o,i.getPropertyPriority(s))})}function Ce(t,e){l(t,HTMLTextAreaElement)&&(e.innerHTML=t.value),l(t,HTMLInputElement)&&e.setAttribute("value",t.value)}function Pe(t,e){if(l(t,HTMLSelectElement)){const n=e,r=Array.from(n.children).find(i=>t.value===i.getAttribute("value"));r&&r.setAttribute("selected","")}}function Le(t,e,n){return l(e,Element)&&(Se(t,e,n),de(t,e,n),Ce(t,e),Pe(t,e)),e}async function Re(t,e){const n=t.querySelectorAll?t.querySelectorAll("use"):[];if(n.length===0)return t;const r={};for(let s=0;s<n.length;s++){const c=n[s].getAttribute("xlink:href");if(c){const a=t.querySelector(c),h=document.querySelector(c);!a&&h&&!r[c]&&(r[c]=await y(h,e,!0))}}const i=Object.values(r);if(i.length){const s="http://www.w3.org/1999/xhtml",o=document.createElementNS(s,"svg");o.setAttribute("xmlns",s),o.style.position="absolute",o.style.width="0",o.style.height="0",o.style.overflow="hidden",o.style.display="none";const c=document.createElementNS(s,"defs");o.appendChild(c);for(let a=0;a<i.length;a++)c.appendChild(i[a]);t.appendChild(o)}return t}async function y(t,e,n){return!n&&e.filter&&!e.filter(t)?null:Promise.resolve(t).then(r=>ve(r,e)).then(r=>ke(t,r,e)).then(r=>Le(t,r,e)).then(r=>Re(r,e))}const M=/url\((['"]?)([^'"]+?)\1\)/g,$e=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Te=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Ie(t){const e=t.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${e})(['"]?\\))`,"g")}function Me(t){const e=[];return t.replace(M,(n,r,i)=>(e.push(i),n)),e.filter(n=>!E(n))}async function Oe(t,e,n,r,i){try{const s=n?te(e,n):e,o=v(e);let c;return i||(c=await S(s,o,r)),t.replace(Ie(e),`$1${c}$3`)}catch{}return t}function Ue(t,{preferredFontFormat:e}){return e?t.replace(Te,n=>{for(;;){const[r,,i]=$e.exec(n)||[];if(!i)return"";if(i===e)return`src: ${r};`}}):t}function O(t){return t.search(M)!==-1}async function U(t,e,n){if(!O(t))return t;const r=Ue(t,n);return Me(r).reduce((s,o)=>s.then(c=>Oe(c,o,e,n)),Promise.resolve(r))}async function g(t,e,n){var r;const i=(r=e.style)===null||r===void 0?void 0:r.getPropertyValue(t);if(i){const s=await U(i,null,n);return e.style.setProperty(t,s,e.style.getPropertyPriority(t)),!0}return!1}async function Ae(t,e){await g("background",t,e)||await g("background-image",t,e),await g("mask",t,e)||await g("-webkit-mask",t,e)||await g("mask-image",t,e)||await g("-webkit-mask-image",t,e)}async function Fe(t,e){const n=l(t,HTMLImageElement);if(!(n&&!E(t.src))&&!(l(t,SVGImageElement)&&!E(t.href.baseVal)))return;const r=n?t.src:t.href.baseVal,i=await S(r,v(r),e);await new Promise((s,o)=>{t.onload=s,t.onerror=e.onImageErrorHandler?(...a)=>{try{s(e.onImageErrorHandler(...a))}catch(h){o(h)}}:o;const c=t;c.decode&&(c.decode=s),c.loading==="lazy"&&(c.loading="eager"),n?(t.srcset="",t.src=i):t.href.baseVal=i})}async function De(t,e){const r=f(t.childNodes).map(i=>A(i,e));await Promise.all(r).then(()=>t)}async function A(t,e){l(t,Element)&&(await Ae(t,e),await Fe(t,e),await De(t,e))}function Be(t,e){const{style:n}=t;e.backgroundColor&&(n.backgroundColor=e.backgroundColor),e.width&&(n.width=`${e.width}px`),e.height&&(n.height=`${e.height}px`);const r=e.style;return r!=null&&Object.keys(r).forEach(i=>{n[i]=r[i]}),t}const F={};async function D(t){let e=F[t];if(e!=null)return e;const r=await(await fetch(t)).text();return e={url:t,cssText:r},F[t]=e,e}async function B(t,e){let n=t.cssText;const r=/url\(["']?([^"')]+)["']?\)/g,s=(n.match(/url\([^)]+\)/g)||[]).map(async o=>{let c=o.replace(r,"$1");return c.startsWith("https://")||(c=new URL(c,t.url).href),T(c,e.fetchRequestInit,({result:a})=>(n=n.replace(o,`url(${a})`),[o,a]))});return Promise.all(s).then(()=>n)}function H(t){if(t==null)return[];const e=[],n=/(\/\*[\s\S]*?\*\/)/gi;let r=t.replace(n,"");const i=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const a=i.exec(r);if(a===null)break;e.push(a[0])}r=r.replace(i,"");const s=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",c=new RegExp(o,"gi");for(;;){let a=s.exec(r);if(a===null){if(a=c.exec(r),a===null)break;s.lastIndex=c.lastIndex}else c.lastIndex=s.lastIndex;e.push(a[0])}return e}async function He(t,e){const n=[],r=[];return t.forEach(i=>{if("cssRules"in i)try{f(i.cssRules||[]).forEach((s,o)=>{if(s.type===CSSRule.IMPORT_RULE){let c=o+1;const a=s.href,h=D(a).then(d=>B(d,e)).then(d=>H(d).forEach(p=>{try{i.insertRule(p,p.startsWith("@import")?c+=1:i.cssRules.length)}catch(x){console.error("Error inserting rule from remote css",{rule:p,error:x})}})).catch(d=>{console.error("Error loading remote css",d.toString())});r.push(h)}})}catch(s){const o=t.find(c=>c.href==null)||document.styleSheets[0];i.href!=null&&r.push(D(i.href).then(c=>B(c,e)).then(c=>H(c).forEach(a=>{o.insertRule(a,o.cssRules.length)})).catch(c=>{console.error("Error loading remote stylesheet",c)})),console.error("Error inlining remote css file",s)}}),Promise.all(r).then(()=>(t.forEach(i=>{if("cssRules"in i)try{f(i.cssRules||[]).forEach(s=>{n.push(s)})}catch(s){console.error(`Error while reading CSS rules from ${i.href}`,s)}}),n))}function ze(t){return t.filter(e=>e.type===CSSRule.FONT_FACE_RULE).filter(e=>O(e.style.getPropertyValue("src")))}async function Ve(t,e){if(t.ownerDocument==null)throw new Error("Provided element is not within a Document");const n=f(t.ownerDocument.styleSheets),r=await He(n,e);return ze(r)}function z(t){return t.trim().replace(/["']/g,"")}function je(t){const e=new Set;function n(r){(r.style.fontFamily||getComputedStyle(r).fontFamily).split(",").forEach(s=>{e.add(z(s))}),Array.from(r.children).forEach(s=>{s instanceof HTMLElement&&n(s)})}return n(t),e}async function _e(t,e){const n=await Ve(t,e),r=je(t);return(await Promise.all(n.filter(s=>r.has(z(s.style.fontFamily))).map(s=>{const o=s.parentStyleSheet?s.parentStyleSheet.href:null;return U(s.cssText,o,e)}))).join(`
`)}async function We(t,e){const n=e.fontEmbedCSS!=null?e.fontEmbedCSS:e.skipFonts?null:await _e(t,e);if(n){const r=document.createElement("style"),i=document.createTextNode(n);r.appendChild(i),t.firstChild?t.insertBefore(r,t.firstChild):t.appendChild(r)}}async function Ne(t,e={}){const{width:n,height:r}=P(t,e),i=await y(t,e,!0);return await We(i,e),await A(i,e),Be(i,e),await ae(i,n,r)}async function qe(t,e={}){const{width:n,height:r}=P(t,e),i=await Ne(t,e),s=await w(i),o=document.createElement("canvas"),c=o.getContext("2d"),a=e.pixelRatio||se(),h=e.canvasWidth||n,d=e.canvasHeight||r;return o.width=h*a,o.height=d*a,e.skipAutoScale||oe(o),o.style.width=`${h}`,o.style.height=`${d}`,e.backgroundColor&&(c.fillStyle=e.backgroundColor,c.fillRect(0,0,o.width,o.height)),c.drawImage(s,0,0,o.width,o.height),o}async function Ke(t,e={}){return(await qe(t,e)).toDataURL()}async function Ge(t){return t.scrollIntoView({block:"center",inline:"center"}),await new Promise(e=>setTimeout(e,200)),Ke(t,{cacheBust:!0,skipFonts:!1,filter:e=>{var n;return!((n=e.hasAttribute)!=null&&n.call(e,"data-punchbug-ignore"))&&e.id!=="punchbug-root"}})}const Xe=`
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
`;class Ye{constructor(e){this.picker=null,this.isPicking=!1,this.columns=[],this.projectId="",this.pinCleanups=[],this.config=e,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),this.shadow=this.hostEl.attachShadow({mode:"open"});const n=document.createElement("style");n.textContent=Xe,this.shadow.appendChild(n),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.setAttribute("title","Report a task"),this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report Task</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.taskPanel=new G(this.shadow),this.fetchColumns(),this.fetchPageTasks()}async fetchColumns(){try{const e=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);e.ok&&(this.columns=await e.json())}catch{}}async fetchPageTasks(){try{const e=encodeURIComponent(window.location.href),n=await fetch(`${this.config.apiUrl}/api/embed/tasks?key=${encodeURIComponent(this.config.embedKey)}&pageUrl=${e}`);if(!n.ok)return;const r=await n.json();this.projectId=r.projectId,this.createPins(r.tasks)}catch{}}createPins(e){this.pinCleanups.forEach(n=>n()),this.pinCleanups=[];for(const n of e)try{const r=document.querySelector(n.domSelector);if(!r)continue;this.createPin(r,n)}catch{}}createPin(e,n){const r=document.createElement("button");r.setAttribute("data-punchbug-ignore","true"),r.textContent=String(n.taskNumber),r.style.cssText="position:absolute;z-index:2147483644;background:#3b82f6;color:#fff;border:2px solid #fff;border-radius:50%;width:22px;height:22px;font-size:10px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 2px 6px rgba(0,0,0,0.35);font-family:sans-serif;line-height:1;transition:transform 0.15s,background 0.15s;",r.onmouseenter=()=>{r.style.transform="scale(1.2)",r.style.background="#2563eb"},r.onmouseleave=()=>{r.style.transform="",r.style.background="#3b82f6"},document.body.appendChild(r);const i=()=>{const s=e.getBoundingClientRect();r.style.top=`${s.top+window.scrollY-11}px`,r.style.left=`${s.right+window.scrollX-11}px`};i(),window.addEventListener("scroll",i,{passive:!0}),window.addEventListener("resize",i,{passive:!0}),r.addEventListener("click",s=>{s.stopPropagation(),this.taskPanel.show(n,this.projectId,this.config.apiUrl)}),this.pinCleanups.push(()=>{window.removeEventListener("scroll",i),window.removeEventListener("resize",i),r.remove()})}refreshPins(){this.fetchPageTasks()}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click any element — press Esc to cancel",this.picker=new _(e=>this.onElementPicked(e),()=>this.stopPicking()),this.picker.start()}stopPicking(){var e;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task",(e=this.picker)==null||e.stop(),this.picker=null}async onElementPicked(e){this.stopPicking();const n=X(e),r=J(),i=window.location.href;let s="";try{s=await Ge(e)}catch(o){console.warn("PunchBug: screenshot failed",o)}new N(this.shadow,{domInfo:n,screenshot:s,browserMeta:r,pageUrl:i,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,reporterName:this.config.reporterName,onSuccess:()=>this.refreshPins()})}}async function Je(t,e){try{const r=`${new URL(t).origin}/api/embed/auth-check?key=${encodeURIComponent(e)}`,i=await fetch(r,{credentials:"include"});if(!i.ok)return{allowed:!1};const s=await i.json();return{allowed:s.allowed===!0,userName:s.userName||void 0}}catch{return{allowed:!1}}}async function V(){const t=document.querySelectorAll("script[data-key]");let e=null;if(document.currentScript&&document.currentScript.dataset.key?e=document.currentScript:t.length>0&&(e=t[t.length-1]),!e){console.warn("PunchBug: No script tag with data-key found.");return}const n=e.dataset.key,r=e.dataset.position||"right",i=e.dataset.apiUrl||Qe();if(!n){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:s,userName:o}=await Je(i,n);s&&new Ye({embedKey:n,apiUrl:i,position:r,reporterName:o})}function Qe(){const t=document.querySelectorAll("script[src*='punchbug']");if(t.length>0){const e=t[0].src;try{return new URL(e).origin}catch{}}return"https://punchteam.com"}function j(){const t=new URLSearchParams(window.location.search).get("pb_element");if(t)try{let e=function(){const i=n.getBoundingClientRect();r.style.top=i.top+"px",r.style.left=i.left+"px",r.style.width=i.width+"px",r.style.height=i.height+"px"};const n=document.querySelector(t);if(!n)return;n.scrollIntoView({block:"center",behavior:"smooth"});const r=document.createElement("div");r.setAttribute("data-punchbug-ignore","true"),r.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(r),e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e,{passive:!0}),setTimeout(()=>{r.style.opacity="0",setTimeout(()=>{r.remove(),window.removeEventListener("scroll",e),window.removeEventListener("resize",e)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{j(),V()}):(j(),V())})();
