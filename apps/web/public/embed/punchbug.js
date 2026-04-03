(function(){"use strict";class _{constructor(t,n){this.hoveredEl=null,this.originalOutline="",this.onPick=t,this.onCancel=n,this.handleMouseOver=this.handleMouseOver.bind(this),this.handleMouseOut=this.handleMouseOut.bind(this),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}start(){document.body.classList.add("pb-picking-active"),document.addEventListener("mouseover",this.handleMouseOver,!0),document.addEventListener("mouseout",this.handleMouseOut,!0),document.addEventListener("click",this.handleClick,!0),document.addEventListener("keydown",this.handleKeyDown,!0)}stop(){document.body.classList.remove("pb-picking-active"),document.removeEventListener("mouseover",this.handleMouseOver,!0),document.removeEventListener("mouseout",this.handleMouseOut,!0),document.removeEventListener("click",this.handleClick,!0),document.removeEventListener("keydown",this.handleKeyDown,!0),this.clearHighlight()}highlight(t){this.clearHighlight(),!t.closest("#punchbug-root")&&(this.hoveredEl=t,this.originalOutline=t.style.outline,t.style.outline="2px solid #3b82f6",t.style.outlineOffset="2px")}clearHighlight(){this.hoveredEl&&(this.hoveredEl.style.outline=this.originalOutline,this.hoveredEl.style.outlineOffset="",this.hoveredEl=null)}handleMouseOver(t){const n=t.target;n&&!n.closest("#punchbug-root")&&this.highlight(n)}handleMouseOut(t){const n=t.target;this.hoveredEl===n&&this.clearHighlight()}handleClick(t){t.preventDefault(),t.stopPropagation();const n=t.target;n&&!n.closest("#punchbug-root")&&(this.clearHighlight(),this.stop(),this.onPick(n))}handleKeyDown(t){t.key==="Escape"&&(this.stop(),this.onCancel())}}async function W(e,t){const n=await fetch(`${e}/api/embed/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!n.ok){const r=await n.json().catch(()=>({}));throw new Error(r.error||"Failed to submit report")}return n.json()}class j{constructor(t,n){this.shadow=t,this.overlay=this.render(n)}render(t){const n=document.createElement("div");n.className="pb-overlay";const r=document.createElement("div");r.className="pb-form-card";const s=t.columns.length>0?`<div class="pb-field">
            <label class="pb-label" for="pb-column">Add to column</label>
            <select class="pb-input" id="pb-column">
              ${t.columns.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}
            </select>
           </div>`:"";r.innerHTML=`
      <div class="pb-form-header">
        <h2 class="pb-form-title">Report a Task</h2>
        <button class="pb-close-btn" id="pb-close">&#x2715;</button>
      </div>

      ${t.screenshot?`<img class="pb-screenshot-preview" src="${t.screenshot}" alt="Element screenshot" />`:""}

      <div class="pb-info-box">
        <div class="pb-info-row">
          <span>&#127760;</span>
          <span style="word-break:break-all">${t.pageUrl}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128187;</span>
          <span>${t.browserMeta.browserName} ${t.browserMeta.browserVersion} &bull; ${t.browserMeta.osName} &bull; ${t.browserMeta.screenWidth}&#xd7;${t.browserMeta.screenHeight}</span>
        </div>
        <div class="pb-info-row">
          <span>&#128279;</span>
          <code style="font-size:11px">${t.domInfo.selector}</code>
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
        <button class="pb-submit-btn" id="pb-submit">Submit Task</button>
      </div>

      <div id="pb-success" style="display:none" class="pb-success">
        <div class="pb-success-icon">&#127881;</div>
        <div class="pb-success-title">Task reported!</div>
        <p class="pb-success-text">Thanks — the team will look into it.</p>
      </div>
    `,n.appendChild(r),this.shadow.appendChild(n);const i=this.shadow.getElementById("pb-close");i==null||i.addEventListener("click",()=>this.close()),n.addEventListener("click",c=>{c.target===n&&this.close()});const o=this.shadow.getElementById("pb-submit");return o==null||o.addEventListener("click",async()=>{const c=this.shadow.getElementById("pb-title").value.trim();if(!c){this.shadow.getElementById("pb-title").focus();return}const a=this.shadow.getElementById("pb-desc").value.trim(),d=t.columns.length>0?this.shadow.getElementById("pb-column").value:void 0;o.disabled=!0,o.textContent="Submitting...";try{await W(t.apiUrl,{embedKey:t.embedKey,title:c,description:a||void 0,screenshot:t.screenshot,domSelector:t.domInfo.selector,domHtml:t.domInfo.outerHtml,pageUrl:t.pageUrl,columnId:d,reporterName:t.reporterName,browserMeta:t.browserMeta});const u=this.shadow.getElementById("pb-report-form"),g=this.shadow.getElementById("pb-success");u&&(u.style.display="none"),g&&(g.style.display="block"),setTimeout(()=>this.close(),3e3)}catch(u){o.disabled=!1,o.textContent="Submit Task",alert("Failed to submit: "+(u instanceof Error?u.message:"Unknown error"))}}),n}close(){this.overlay.remove()}}function q(e){return{selector:K(e),outerHtml:e.outerHTML.slice(0,2e3)}}function K(e){var r;const t=[];let n=e;for(;n&&n!==document.body&&n.nodeType===Node.ELEMENT_NODE;){let s=n.tagName.toLowerCase();if(n.id){t.unshift(`#${CSS.escape(n.id)}`);break}const i=(r=n.parentElement)==null?void 0:r.children;if(i&&i.length>1){let o=1;for(let a=0;a<i.length&&i[a]!==n;a++)i[a].tagName===n.tagName&&o++;Array.from(i).filter(a=>a.tagName===n.tagName).length>1&&(s+=`:nth-of-type(${o})`)}if(t.unshift(s),n=n.parentElement,t.length>=6)break}return t.join(" > ")||e.tagName.toLowerCase()}function N(){const e=navigator.userAgent,{browserName:t,browserVersion:n}=G(e),{osName:r,osVersion:s}=X(e),i=J();return{browserName:t,browserVersion:n,osName:r,osVersion:s,deviceType:i,screenWidth:screen.width,screenHeight:screen.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:e}}function G(e){const t=[{name:"Chrome",pattern:/Chrome\/([0-9.]+)/},{name:"Firefox",pattern:/Firefox\/([0-9.]+)/},{name:"Safari",pattern:/Version\/([0-9.]+).*Safari/},{name:"Edge",pattern:/Edg\/([0-9.]+)/},{name:"Opera",pattern:/OPR\/([0-9.]+)/}];for(const n of t){const r=e.match(n.pattern);if(r)return{browserName:n.name,browserVersion:r[1].split(".")[0]}}return{browserName:"Unknown",browserVersion:""}}function X(e){var t,n,r;return/Windows NT 10/.test(e)?{osName:"Windows",osVersion:"10/11"}:/Windows NT/.test(e)?{osName:"Windows",osVersion:"Other"}:/Mac OS X ([0-9_]+)/.test(e)?{osName:"macOS",osVersion:((t=e.match(/Mac OS X ([0-9_]+)/))==null?void 0:t[1].replace(/_/g,"."))??""}:/Android ([0-9.]+)/.test(e)?{osName:"Android",osVersion:((n=e.match(/Android ([0-9.]+)/))==null?void 0:n[1])??""}:/iPhone OS ([0-9_]+)/.test(e)?{osName:"iOS",osVersion:((r=e.match(/iPhone OS ([0-9_]+)/))==null?void 0:r[1].replace(/_/g,"."))??""}:/Linux/.test(e)?{osName:"Linux",osVersion:""}:{osName:"Unknown",osVersion:""}}function J(){const e=navigator.userAgent;return/Mobi|Android.*Mobile|iPhone|iPod/.test(e)?"mobile":/iPad|Android(?!.*Mobile)/.test(e)?"tablet":"desktop"}function Y(e,t){if(e.match(/^[a-z]+:\/\//i))return e;if(e.match(/^\/\//))return window.location.protocol+e;if(e.match(/^[a-z]+:/i))return e;const n=document.implementation.createHTMLDocument(),r=n.createElement("base"),s=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(s),t&&(r.href=t),s.href=e,s.href}const Q=(()=>{let e=0;const t=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(e+=1,`u${t()}${e}`)})();function f(e){const t=[];for(let n=0,r=e.length;n<r;n++)t.push(e[n]);return t}let p=null;function k(e={}){return p||(e.includeStyleProperties?(p=e.includeStyleProperties,p):(p=f(window.getComputedStyle(document.documentElement)),p))}function b(e,t){const r=(e.ownerDocument.defaultView||window).getComputedStyle(e).getPropertyValue(t);return r?parseFloat(r.replace("px","")):0}function Z(e){const t=b(e,"border-left-width"),n=b(e,"border-right-width");return e.clientWidth+t+n}function ee(e){const t=b(e,"border-top-width"),n=b(e,"border-bottom-width");return e.clientHeight+t+n}function C(e,t={}){const n=t.width||Z(e),r=t.height||ee(e);return{width:n,height:r}}function te(){let e,t;try{t=process}catch{}const n=t&&t.env?t.env.devicePixelRatio:null;return n&&(e=parseInt(n,10),Number.isNaN(e)&&(e=1)),e||window.devicePixelRatio||1}const h=16384;function ne(e){(e.width>h||e.height>h)&&(e.width>h&&e.height>h?e.width>e.height?(e.height*=h/e.width,e.width=h):(e.width*=h/e.height,e.height=h):e.width>h?(e.height*=h/e.width,e.width=h):(e.width*=h/e.height,e.height=h))}function w(e){return new Promise((t,n)=>{const r=new Image;r.onload=()=>{r.decode().then(()=>{requestAnimationFrame(()=>t(r))})},r.onerror=n,r.crossOrigin="anonymous",r.decoding="async",r.src=e})}async function re(e){return Promise.resolve().then(()=>new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then(t=>`data:image/svg+xml;charset=utf-8,${t}`)}async function ie(e,t,n){const r="http://www.w3.org/2000/svg",s=document.createElementNS(r,"svg"),i=document.createElementNS(r,"foreignObject");return s.setAttribute("width",`${t}`),s.setAttribute("height",`${n}`),s.setAttribute("viewBox",`0 0 ${t} ${n}`),i.setAttribute("width","100%"),i.setAttribute("height","100%"),i.setAttribute("x","0"),i.setAttribute("y","0"),i.setAttribute("externalResourcesRequired","true"),s.appendChild(i),i.appendChild(e),re(s)}const l=(e,t)=>{if(e instanceof t)return!0;const n=Object.getPrototypeOf(e);return n===null?!1:n.constructor.name===t.name||l(n,t)};function se(e){const t=e.getPropertyValue("content");return`${e.cssText} content: '${t.replace(/'|"/g,"")}';`}function oe(e,t){return k(t).map(n=>{const r=e.getPropertyValue(n),s=e.getPropertyPriority(n);return`${n}: ${r}${s?" !important":""};`}).join(" ")}function ce(e,t,n,r){const s=`.${e}:${t}`,i=n.cssText?se(n):oe(n,r);return document.createTextNode(`${s}{${i}}`)}function P(e,t,n,r){const s=window.getComputedStyle(e,n),i=s.getPropertyValue("content");if(i===""||i==="none")return;const o=Q();try{t.className=`${t.className} ${o}`}catch{return}const c=document.createElement("style");c.appendChild(ce(o,n,s,r)),t.appendChild(c)}function ae(e,t,n){P(e,t,":before",n),P(e,t,":after",n)}const R="application/font-woff",L="image/jpeg",le={woff:R,woff2:R,ttf:"application/font-truetype",eot:"application/vnd.ms-fontobject",png:"image/png",jpg:L,jpeg:L,gif:"image/gif",tiff:"image/tiff",svg:"image/svg+xml",webp:"image/webp"};function ue(e){const t=/\.([^./]*?)$/g.exec(e);return t?t[1]:""}function x(e){const t=ue(e).toLowerCase();return le[t]||""}function he(e){return e.split(/,/)[1]}function v(e){return e.search(/^(data:)/)!==-1}function de(e,t){return`data:${t};base64,${e}`}async function T(e,t,n){const r=await fetch(e,t);if(r.status===404)throw new Error(`Resource "${r.url}" not found`);const s=await r.blob();return new Promise((i,o)=>{const c=new FileReader;c.onerror=o,c.onloadend=()=>{try{i(n({res:r,result:c.result}))}catch(a){o(a)}},c.readAsDataURL(s)})}const E={};function fe(e,t,n){let r=e.replace(/\?.*/,"");return n&&(r=e),/ttf|otf|eot|woff2?/i.test(r)&&(r=r.replace(/.*\//,"")),t?`[${t}]${r}`:r}async function S(e,t,n){const r=fe(e,t,n.includeQueryParams);if(E[r]!=null)return E[r];n.cacheBust&&(e+=(/\?/.test(e)?"&":"?")+new Date().getTime());let s;try{const i=await T(e,n.fetchRequestInit,({res:o,result:c})=>(t||(t=o.headers.get("Content-Type")||""),he(c)));s=de(i,t)}catch(i){s=n.imagePlaceholder||"";let o=`Failed to fetch resource: ${e}`;i&&(o=typeof i=="string"?i:i.message),o&&console.warn(o)}return E[r]=s,s}async function pe(e){const t=e.toDataURL();return t==="data:,"?e.cloneNode(!1):w(t)}async function me(e,t){if(e.currentSrc){const i=document.createElement("canvas"),o=i.getContext("2d");i.width=e.clientWidth,i.height=e.clientHeight,o==null||o.drawImage(e,0,0,i.width,i.height);const c=i.toDataURL();return w(c)}const n=e.poster,r=x(n),s=await S(n,r,t);return w(s)}async function ge(e,t){var n;try{if(!((n=e==null?void 0:e.contentDocument)===null||n===void 0)&&n.body)return await y(e.contentDocument.body,t,!0)}catch{}return e.cloneNode(!1)}async function be(e,t){return l(e,HTMLCanvasElement)?pe(e):l(e,HTMLVideoElement)?me(e,t):l(e,HTMLIFrameElement)?ge(e,t):e.cloneNode($(e))}const we=e=>e.tagName!=null&&e.tagName.toUpperCase()==="SLOT",$=e=>e.tagName!=null&&e.tagName.toUpperCase()==="SVG";async function ye(e,t,n){var r,s;if($(t))return t;let i=[];return we(e)&&e.assignedNodes?i=f(e.assignedNodes()):l(e,HTMLIFrameElement)&&(!((r=e.contentDocument)===null||r===void 0)&&r.body)?i=f(e.contentDocument.body.childNodes):i=f(((s=e.shadowRoot)!==null&&s!==void 0?s:e).childNodes),i.length===0||l(e,HTMLVideoElement)||await i.reduce((o,c)=>o.then(()=>y(c,n)).then(a=>{a&&t.appendChild(a)}),Promise.resolve()),t}function xe(e,t,n){const r=t.style;if(!r)return;const s=window.getComputedStyle(e);s.cssText?(r.cssText=s.cssText,r.transformOrigin=s.transformOrigin):k(n).forEach(i=>{let o=s.getPropertyValue(i);i==="font-size"&&o.endsWith("px")&&(o=`${Math.floor(parseFloat(o.substring(0,o.length-2)))-.1}px`),l(e,HTMLIFrameElement)&&i==="display"&&o==="inline"&&(o="block"),i==="d"&&t.getAttribute("d")&&(o=`path(${t.getAttribute("d")})`),r.setProperty(i,o,s.getPropertyPriority(i))})}function ve(e,t){l(e,HTMLTextAreaElement)&&(t.innerHTML=e.value),l(e,HTMLInputElement)&&t.setAttribute("value",e.value)}function Ee(e,t){if(l(e,HTMLSelectElement)){const n=t,r=Array.from(n.children).find(s=>e.value===s.getAttribute("value"));r&&r.setAttribute("selected","")}}function Se(e,t,n){return l(t,Element)&&(xe(e,t,n),ae(e,t,n),ve(e,t),Ee(e,t)),t}async function ke(e,t){const n=e.querySelectorAll?e.querySelectorAll("use"):[];if(n.length===0)return e;const r={};for(let i=0;i<n.length;i++){const c=n[i].getAttribute("xlink:href");if(c){const a=e.querySelector(c),d=document.querySelector(c);!a&&d&&!r[c]&&(r[c]=await y(d,t,!0))}}const s=Object.values(r);if(s.length){const i="http://www.w3.org/1999/xhtml",o=document.createElementNS(i,"svg");o.setAttribute("xmlns",i),o.style.position="absolute",o.style.width="0",o.style.height="0",o.style.overflow="hidden",o.style.display="none";const c=document.createElementNS(i,"defs");o.appendChild(c);for(let a=0;a<s.length;a++)c.appendChild(s[a]);e.appendChild(o)}return e}async function y(e,t,n){return!n&&t.filter&&!t.filter(e)?null:Promise.resolve(e).then(r=>be(r,t)).then(r=>ye(e,r,t)).then(r=>Se(e,r,t)).then(r=>ke(r,t))}const M=/url\((['"]?)([^'"]+?)\1\)/g,Ce=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,Pe=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function Re(e){const t=e.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`,"g")}function Le(e){const t=[];return e.replace(M,(n,r,s)=>(t.push(s),n)),t.filter(n=>!v(n))}async function Te(e,t,n,r,s){try{const i=n?Y(t,n):t,o=x(t);let c;return s||(c=await S(i,o,r)),e.replace(Re(t),`$1${c}$3`)}catch{}return e}function $e(e,{preferredFontFormat:t}){return t?e.replace(Pe,n=>{for(;;){const[r,,s]=Ce.exec(n)||[];if(!s)return"";if(s===t)return`src: ${r};`}}):e}function I(e){return e.search(M)!==-1}async function O(e,t,n){if(!I(e))return e;const r=$e(e,n);return Le(r).reduce((i,o)=>i.then(c=>Te(c,o,t,n)),Promise.resolve(r))}async function m(e,t,n){var r;const s=(r=t.style)===null||r===void 0?void 0:r.getPropertyValue(e);if(s){const i=await O(s,null,n);return t.style.setProperty(e,i,t.style.getPropertyPriority(e)),!0}return!1}async function Me(e,t){await m("background",e,t)||await m("background-image",e,t),await m("mask",e,t)||await m("-webkit-mask",e,t)||await m("mask-image",e,t)||await m("-webkit-mask-image",e,t)}async function Ie(e,t){const n=l(e,HTMLImageElement);if(!(n&&!v(e.src))&&!(l(e,SVGImageElement)&&!v(e.href.baseVal)))return;const r=n?e.src:e.href.baseVal,s=await S(r,x(r),t);await new Promise((i,o)=>{e.onload=i,e.onerror=t.onImageErrorHandler?(...a)=>{try{i(t.onImageErrorHandler(...a))}catch(d){o(d)}}:o;const c=e;c.decode&&(c.decode=i),c.loading==="lazy"&&(c.loading="eager"),n?(e.srcset="",e.src=s):e.href.baseVal=s})}async function Oe(e,t){const r=f(e.childNodes).map(s=>A(s,t));await Promise.all(r).then(()=>e)}async function A(e,t){l(e,Element)&&(await Me(e,t),await Ie(e,t),await Oe(e,t))}function Ae(e,t){const{style:n}=e;t.backgroundColor&&(n.backgroundColor=t.backgroundColor),t.width&&(n.width=`${t.width}px`),t.height&&(n.height=`${t.height}px`);const r=t.style;return r!=null&&Object.keys(r).forEach(s=>{n[s]=r[s]}),e}const U={};async function F(e){let t=U[e];if(t!=null)return t;const r=await(await fetch(e)).text();return t={url:e,cssText:r},U[e]=t,t}async function B(e,t){let n=e.cssText;const r=/url\(["']?([^"')]+)["']?\)/g,i=(n.match(/url\([^)]+\)/g)||[]).map(async o=>{let c=o.replace(r,"$1");return c.startsWith("https://")||(c=new URL(c,e.url).href),T(c,t.fetchRequestInit,({result:a})=>(n=n.replace(o,`url(${a})`),[o,a]))});return Promise.all(i).then(()=>n)}function D(e){if(e==null)return[];const t=[],n=/(\/\*[\s\S]*?\*\/)/gi;let r=e.replace(n,"");const s=new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})","gi");for(;;){const a=s.exec(r);if(a===null)break;t.push(a[0])}r=r.replace(s,"");const i=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,o="((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",c=new RegExp(o,"gi");for(;;){let a=i.exec(r);if(a===null){if(a=c.exec(r),a===null)break;i.lastIndex=c.lastIndex}else c.lastIndex=i.lastIndex;t.push(a[0])}return t}async function Ue(e,t){const n=[],r=[];return e.forEach(s=>{if("cssRules"in s)try{f(s.cssRules||[]).forEach((i,o)=>{if(i.type===CSSRule.IMPORT_RULE){let c=o+1;const a=i.href,d=F(a).then(u=>B(u,t)).then(u=>D(u).forEach(g=>{try{s.insertRule(g,g.startsWith("@import")?c+=1:s.cssRules.length)}catch(Xe){console.error("Error inserting rule from remote css",{rule:g,error:Xe})}})).catch(u=>{console.error("Error loading remote css",u.toString())});r.push(d)}})}catch(i){const o=e.find(c=>c.href==null)||document.styleSheets[0];s.href!=null&&r.push(F(s.href).then(c=>B(c,t)).then(c=>D(c).forEach(a=>{o.insertRule(a,o.cssRules.length)})).catch(c=>{console.error("Error loading remote stylesheet",c)})),console.error("Error inlining remote css file",i)}}),Promise.all(r).then(()=>(e.forEach(s=>{if("cssRules"in s)try{f(s.cssRules||[]).forEach(i=>{n.push(i)})}catch(i){console.error(`Error while reading CSS rules from ${s.href}`,i)}}),n))}function Fe(e){return e.filter(t=>t.type===CSSRule.FONT_FACE_RULE).filter(t=>I(t.style.getPropertyValue("src")))}async function Be(e,t){if(e.ownerDocument==null)throw new Error("Provided element is not within a Document");const n=f(e.ownerDocument.styleSheets),r=await Ue(n,t);return Fe(r)}function H(e){return e.trim().replace(/["']/g,"")}function De(e){const t=new Set;function n(r){(r.style.fontFamily||getComputedStyle(r).fontFamily).split(",").forEach(i=>{t.add(H(i))}),Array.from(r.children).forEach(i=>{i instanceof HTMLElement&&n(i)})}return n(e),t}async function He(e,t){const n=await Be(e,t),r=De(e);return(await Promise.all(n.filter(i=>r.has(H(i.style.fontFamily))).map(i=>{const o=i.parentStyleSheet?i.parentStyleSheet.href:null;return O(i.cssText,o,t)}))).join(`
`)}async function Ve(e,t){const n=t.fontEmbedCSS!=null?t.fontEmbedCSS:t.skipFonts?null:await He(e,t);if(n){const r=document.createElement("style"),s=document.createTextNode(n);r.appendChild(s),e.firstChild?e.insertBefore(r,e.firstChild):e.appendChild(r)}}async function ze(e,t={}){const{width:n,height:r}=C(e,t),s=await y(e,t,!0);return await Ve(s,t),await A(s,t),Ae(s,t),await ie(s,n,r)}async function _e(e,t={}){const{width:n,height:r}=C(e,t),s=await ze(e,t),i=await w(s),o=document.createElement("canvas"),c=o.getContext("2d"),a=t.pixelRatio||te(),d=t.canvasWidth||n,u=t.canvasHeight||r;return o.width=d*a,o.height=u*a,t.skipAutoScale||ne(o),o.style.width=`${d}`,o.style.height=`${u}`,t.backgroundColor&&(c.fillStyle=t.backgroundColor,c.fillRect(0,0,o.width,o.height)),c.drawImage(i,0,0,o.width,o.height),o}async function We(e,t={}){return(await _e(e,t)).toDataURL()}async function je(e){return e.scrollIntoView({block:"center",inline:"center"}),await new Promise(t=>setTimeout(t,200)),We(e,{cacheBust:!0,skipFonts:!1,filter:t=>{var n;return!((n=t.hasAttribute)!=null&&n.call(t,"data-punchbug-ignore"))&&t.id!=="punchbug-root"}})}const qe=`
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
`;class Ke{constructor(t){this.picker=null,this.isPicking=!1,this.columns=[],this.config=t,this.hostEl=document.createElement("div"),this.hostEl.id="punchbug-root",this.hostEl.setAttribute("data-punchbug-ignore","true"),document.body.appendChild(this.hostEl),this.shadow=this.hostEl.attachShadow({mode:"open"});const n=document.createElement("style");n.textContent=qe,this.shadow.appendChild(n),this.triggerBtn=document.createElement("button"),this.triggerBtn.className="pb-trigger",this.triggerBtn.setAttribute("data-punchbug-ignore","true"),this.triggerBtn.setAttribute("title","Report a task"),this.triggerBtn.innerHTML=`
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
      </svg>
      <span>Report Task</span>
    `,this.shadow.appendChild(this.triggerBtn),this.triggerBtn.addEventListener("click",()=>this.toggle()),this.fetchColumns()}async fetchColumns(){try{const t=await fetch(`${this.config.apiUrl}/api/embed/columns?key=${encodeURIComponent(this.config.embedKey)}`);t.ok&&(this.columns=await t.json())}catch{}}toggle(){this.isPicking?this.stopPicking():this.startPicking()}startPicking(){this.isPicking=!0,this.triggerBtn.classList.add("pb-active"),this.triggerBtn.title="Click any element — press Esc to cancel",this.picker=new _(t=>this.onElementPicked(t),()=>this.stopPicking()),this.picker.start()}stopPicking(){var t;this.isPicking=!1,this.triggerBtn.classList.remove("pb-active"),this.triggerBtn.title="Report a task",(t=this.picker)==null||t.stop(),this.picker=null}async onElementPicked(t){this.stopPicking();const n=q(t),r=N(),s=window.location.href;let i="";try{i=await je(t)}catch(o){console.warn("PunchBug: screenshot failed",o)}new j(this.shadow,{domInfo:n,screenshot:i,browserMeta:r,pageUrl:s,embedKey:this.config.embedKey,apiUrl:this.config.apiUrl,columns:this.columns,reporterName:this.config.reporterName})}}async function Ne(e,t){try{const r=`${new URL(e).origin}/api/embed/auth-check?key=${encodeURIComponent(t)}`,s=await fetch(r,{credentials:"include"});if(!s.ok)return{allowed:!1};const i=await s.json();return{allowed:i.allowed===!0,userName:i.userName||void 0}}catch{return{allowed:!1}}}async function V(){const e=document.querySelectorAll("script[data-key]");let t=null;if(document.currentScript&&document.currentScript.dataset.key?t=document.currentScript:e.length>0&&(t=e[e.length-1]),!t){console.warn("PunchBug: No script tag with data-key found.");return}const n=t.dataset.key,r=t.dataset.position||"right",s=t.dataset.apiUrl||Ge();if(!n){console.warn("PunchBug: data-key attribute is required.");return}const{allowed:i,userName:o}=await Ne(s,n);i&&new Ke({embedKey:n,apiUrl:s,position:r,reporterName:o})}function Ge(){const e=document.querySelectorAll("script[src*='punchbug']");if(e.length>0){const t=e[0].src;try{return new URL(t).origin}catch{}}return"https://punchteam.com"}function z(){const e=new URLSearchParams(window.location.search).get("pb_element");if(e)try{let t=function(){const s=n.getBoundingClientRect();r.style.top=s.top+"px",r.style.left=s.left+"px",r.style.width=s.width+"px",r.style.height=s.height+"px"};const n=document.querySelector(e);if(!n)return;n.scrollIntoView({block:"center",behavior:"smooth"});const r=document.createElement("div");r.setAttribute("data-punchbug-ignore","true"),r.style.cssText="position:fixed;pointer-events:none;z-index:2147483645;box-shadow:0 0 0 3px #3b82f6,0 0 0 8px rgba(59,130,246,0.2);border-radius:3px;transition:opacity 0.4s ease",document.body.appendChild(r),t(),window.addEventListener("scroll",t,{passive:!0}),window.addEventListener("resize",t,{passive:!0}),setTimeout(()=>{r.style.opacity="0",setTimeout(()=>{r.remove(),window.removeEventListener("scroll",t),window.removeEventListener("resize",t)},400)},4e3)}catch{}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{z(),V()}):(z(),V())})();
