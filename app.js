/* Budget Tracker: app code (React via UMD + htm + Framer Motion). Cloud sync is provided by js/firebase.js */

const {useState,useEffect,useRef}=React;
const M=window.Motion;
const _c={};
const motion=M?M.motion:new Proxy({},{get:(_,tag)=>_c[tag]||(_c[tag]=React.forwardRef((p,r)=>{const{initial,animate,exit,transition,layout,layoutId,whileHover,whileTap,variants,...o}=p;const s={...o.style};['width','opacity'].forEach(k=>{if(animate&&animate[k]!==undefined)s[k]=animate[k]});return React.createElement(tag,{...o,style:s,ref:r})}))});
const AnimatePresence=M?M.AnimatePresence:({children})=>children;
const html=htm.bind(React.createElement);
const spr={type:'spring',stiffness:340,damping:30,mass:.9};
const soft={type:'spring',stiffness:180,damping:24};
const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const today=()=>iso(new Date());
const off=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const fmt=n=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const q=n=>Math.round(n*100)/100;
const tr2=x=>(Math.trunc(x*100+1e-9)/100).toFixed(2);
const dec=(x,neg)=>(neg?/^-?\d+(\.\d{1,2})?$/:/^\d+(\.\d{1,2})?$/).test(String(x).trim());
const fd=s=>new Date(s+'T00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric'});
const uid=()=>Math.random().toString(36).slice(2,9);
const CATS={expense:['Food','Transport','Bills','Rent','Shopping','Health','Fun'],income:['Salary','Freelance','Gift','Other'],transfer:['Transfer']};
const SRC=()=>({payable:['SPayLater','Tuition'],receivable:['Allowance','Income']});
const dcat=d=>d.cat||(d.kind==='payable'?'General Debt':'General Advance');
const SW=[['Crimson','225 29 72'],['Violet','139 92 246'],['Azure','59 130 246'],['Emerald','16 185 129'],['Amber','245 158 11'],['Pink','236 72 153']];
const hex2=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(' ');
const rgb2hex=s=>'#'+s.split(' ').map(n=>(+n).toString(16).padStart(2,'0')).join('');
const P={home:['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M9 22V12h6v10'],wallet:['M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1','M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4'],swap:['M16 3l4 4-4 4','M20 7H4','M8 21l-4-4 4-4','M4 17h16'],target:['M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0','M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0','M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0'],plus:['M5 12h14','M12 5v14'],x:['M18 6 6 18','m6 6 12 12'],trash:['M3 6h18','M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6','M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],pen:['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'],up:['M22 7 13.5 15.5 8.5 10.5 2 17','M16 7h6v6'],down:['M22 17 13.5 8.5 8.5 13.5 2 7','M16 17h6v-6'],clock:['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0','M12 6v6l4 2'],set:['M4 21v-7','M4 10V3','M12 21v-9','M12 8V3','M20 21v-5','M20 12V3','M1 14h6','M9 8h6','M17 16h6'],check:['M20 6 9 17l-5-5'],chev:['m6 9 6 6 6-6'],pie:['M21.21 15.89A10 10 0 1 1 8 2.83','M22 12A10 10 0 0 0 12 2v10z'],warn:['M12 9v4','M12 17h.01','M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z']};
const Ic=({n,s=20,c=''})=>html`<svg width=${s} height=${s} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class=${c}>${P[n].map((d,i)=>html`<path key=${i} d=${d}/>`)}</svg>`;

const seed=()=>({
 wallets:[{id:'w1',name:'Cash on Hand',type:'Cash',balance:3200},{id:'w2',name:'BDO Bank',type:'Bank',balance:41000},{id:'w3',name:'GCash',type:'E-Wallet',balance:5300},{id:'w4',name:'Maya',type:'E-Wallet',balance:1800}],
 tx:[
  {id:uid(),type:'income',amount:35000,category:'Salary',date:off(-12),note:'Monthly pay',wallet:'w2'},
  {id:uid(),type:'expense',amount:9500,category:'Rent',date:off(-10),note:'Apartment',wallet:'w2'},
  {id:uid(),type:'expense',amount:2450,category:'Food',date:off(-6),note:'Groceries',wallet:'w1'},
  {id:uid(),type:'transfer',amount:3000,category:'Transfer',date:off(-4),note:'Top up GCash',wallet:'w2',to:'w3'},
  {id:uid(),type:'expense',amount:850,category:'Transport',date:off(-3),note:'Grab rides',wallet:'w3'},
  {id:uid(),type:'expense',amount:1200,category:'Fun',date:off(-2),note:'Movie night',wallet:'w4'},
  {id:uid(),type:'expense',amount:640,category:'Food',date:off(-1),note:'Lunch with team',wallet:'w1'},
  {id:uid(),type:'expense',amount:1699,category:'Bills',date:off(3),note:'Internet bill',wallet:'w2'},
  {id:uid(),type:'income',amount:8000,category:'Freelance',date:off(5),note:'Logo project',wallet:'w3'}],
 sources:SRC(),alloc:{},allocLog:[],
 debts:[
  {id:uid(),kind:'payable',cat:'SPayLater',party:'Phone installment',totalAmount:4200.50,amountPaid:0,payments:[],due:off(8),wallet:'w3',note:'Installment 3 of 6'},
  {id:uid(),kind:'payable',cat:'SPayLater',party:'Shoes',totalAmount:1850.75,amountPaid:0,payments:[],due:off(-2),wallet:'w3',note:''},
  {id:uid(),kind:'payable',cat:'Tuition',party:'2nd semester balance',totalAmount:40000,amountPaid:10000,payments:[{id:uid(),amount:10000,wallet:'w2',date:off(-5),ts:1}],due:off(20),wallet:'w2',note:'Paid in installments'},
  {id:uid(),kind:'payable',cat:'Tuition',party:'Miscellaneous fees',totalAmount:1250.75,amountPaid:0,payments:[],due:off(6),wallet:'w2',note:''},
  {id:uid(),kind:'receivable',cat:'Allowance',party:'Monthly allowance',totalAmount:5000,amountPaid:0,payments:[],due:off(9),wallet:'w2',note:''},
  {id:uid(),kind:'receivable',cat:'Income',party:'Part-time pay',totalAmount:4000,amountPaid:0,payments:[],due:off(7),wallet:'w3',note:''},
  {id:uid(),kind:'receivable',cat:'Income',party:'Freelance balance',totalAmount:1500.25,amountPaid:0,payments:[],due:off(12),wallet:'w1',note:''}],
 goals:[{id:uid(),name:'Emergency Fund',target:60000,saved:22000},{id:uid(),name:'New Laptop',target:45000,saved:12500},{id:uid(),name:'Baguio Trip',target:15000,saved:9000}]
});
const remOf=d=>q(d.totalAmount-(d.amountPaid||0));
const wp=(d,pays)=>({...d,payments:pays,amountPaid:q(pays.reduce((a,p)=>a+p.amount,0))});
const normD=d=>{if(d.totalAmount!=null&&d.payments)return d;const total=d.totalAmount!=null?d.totalAmount:d.amount;const pays=d.payments||(d.paid?[{id:uid(),amount:total,wallet:d.wallet,date:d.paidAt||d.due,ts:0}]:[]);const{amount,paid,paidAt,...r}=d;return wp({...r,totalAmount:total},pays)};
const KEY='ember.v2';
const fixS=s=>{s=JSON.parse(JSON.stringify(s));const src=s.sources||SRC();src.payable=[...(src.payable||[])];src.receivable=[...(src.receivable||[])];const debts=(s.debts||[]).map(normD);debts.forEach(d=>{const c=dcat(d);if(!src[d.kind].includes(c))src[d.kind].push(c)});return{...s,debts,sources:src,alloc:s.alloc||{},allocLog:s.allocLog||[]}};
const lt=()=>{try{return +localStorage.getItem(KEY+'.t')||(localStorage.getItem(KEY)?1:0)}catch(e){return 0}};
const load=()=>{try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.wallets)return fixS(s)}catch(e){}return{name:'Alex',accent:SW[0][1],...seed()}};

const ymd=(y,m,d)=>y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
const dimo=(y,m)=>new Date(y,m+1,0).getDate();
const addD=(s,n)=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()+n);return iso(d)};
const mkRule=v=>({rep:v.rep,every:Math.max(1,parseInt(v.every)||1),wdays:v.wdays||[],mdays:String(v.mdays||'').split(/[,\s]+/).filter(Boolean),until:v.until||'',count:parseInt(v.count)||0});
const ruleErr=(v,start)=>{if(v.rep==='none')return '';
 if(!/^\d+$/.test(String(v.every).trim())||+v.every<1)return 'Repeat interval must be a whole number of 1 or more.';
 if(!v.until&&!v.count)return 'Set an end date or a number of entries for the repeat.';
 if(v.until&&start&&v.until<start)return 'The end date must be on or after the first date.';
 if(v.count&&(!/^\d+$/.test(String(v.count).trim())||+v.count<1))return 'Number of entries must be a whole number of 1 or more.';
 if(v.rep==='monthly')for(const t of String(v.mdays||'').split(/[,\s]+/).filter(Boolean))if(!(t.toLowerCase()==='last'||(/^\d+$/.test(t)&&+t>=1&&+t<=31)))return 'Days of the month must be 1 to 31, or “last”.';
 return ''};
const genDates=(start,r,lim=120)=>{const cap=Math.min(lim,r.count||lim),until=r.until||'9999-12-31',out=[];
 const push=d=>{if(d>=start&&d<=until&&out.length<cap&&!out.includes(d))out.push(d)};const D0=new Date(start+'T00:00');
 if(r.rep==='daily'){for(let c=start,i=0;c<=until&&out.length<cap&&i<1000;c=addD(c,r.every),i++)push(c)}
 else if(r.rep==='weekly'){const wd=(r.wdays.length?[...r.wdays]:[D0.getDay()]).sort((a,b)=>a-b);let wk=addD(start,-D0.getDay());for(let i=0;i<1000&&wk<=until&&out.length<cap;i++,wk=addD(wk,7*r.every))wd.forEach(w=>push(addD(wk,w)))}
 else if(r.rep==='monthly'){const toks=r.mdays.length?r.mdays:[String(D0.getDate())];let y=D0.getFullYear(),m=D0.getMonth();for(let i=0;i<600&&ymd(y,m,1)<=until&&out.length<cap;i++){const len=dimo(y,m);toks.map(t=>t.toLowerCase()==='last'?len:Math.min(+t,len)).sort((a,b)=>a-b).forEach(d=>push(ymd(y,m,d)));m+=r.every;y+=Math.floor(m/12);m%=12}}
 else if(r.rep==='yearly'){let y=D0.getFullYear();const mo=D0.getMonth();for(let i=0;i<200&&ymd(y,mo,1)<=until&&out.length<cap;i++,y+=r.every)push(ymd(y,mo,Math.min(D0.getDate(),dimo(y,mo))))}
 else out.push(start);
 return out.sort()};
const UNIT={daily:'day(s)',weekly:'week(s)',monthly:'month(s)',yearly:'year(s)'};
const REP0={rep:'none',every:'1',wdays:[],mdays:'',until:'',count:''};
const repFields=(v,pre)=>[{k:'rep',t:'select',l:'Repeat',o:[['none','Does not repeat'],['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['yearly','Yearly']]},
 {k:'every',t:'number',l:'Repeat every how many '+(UNIT[v.rep]||'')+'?',p:'1',hide:v.rep==='none'},
 {k:'wdays',t:'chips',l:'On weekdays (leave empty to use the first date’s weekday)',o:[[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[0,'Sun']],hide:v.rep!=='weekly'},
 {k:'mdays',t:'text',l:'On day(s) of the month, e.g. 15 or 15, 30 or last',p:'Empty = same day as the first date',hide:v.rep!=='monthly'},
 {k:'until',t:'date',l:'Repeat until',hide:v.rep==='none',h:pre.length?'Creates '+pre.length+(pre.length===1?' entry: ':' entries: ')+fd(pre[0])+(pre.length>1?' to '+fd(pre[pre.length-1]):''):''},
 {k:'count',t:'number',l:'Or stop after this many entries',p:'Optional',hide:v.rep==='none'}];
const effAl=(S,d)=>q(Math.min((S.alloc||{})['d:'+d.id]||0,remOf(d)));
const moveAlloc=(s,items,sign,kind)=>{const alloc={...(s.alloc||{})};let goals=s.goals;
 items.forEach(it=>{if(it.t==='d'){const k='d:'+it.id;alloc[k]=q(Math.max(0,(alloc[k]||0)+sign*it.amt))}else goals=goals.map(g=>g.id===it.id?{...g,saved:q(Math.max(0,g.saved+sign*it.amt))}:g)});
 return{...s,alloc,goals,allocLog:kind?[{id:uid(),ts:Date.now(),kind,items,undone:false},...(s.allocLog||[])].slice(0,40):s.allocLog}};
function makePlan(S,o,t0){
 const dd=due=>Math.round((new Date(due+'T00:00')-new Date(t0+'T00:00'))/864e5);
 const all=S.debts.filter(d=>d.kind==='payable'&&remOf(d)>0).map(d=>{const remC=Math.round(remOf(d)*100),haveC=Math.round(effAl(S,d)*100);return{d,remC,haveC,needC:remC-haveC,days:dd(d.due),skipped:!!o.skip[d.id],allocC:0}});
 const urgent=all.filter(p=>p.days<=o.hz).sort((a,b)=>a.days-b.days||a.remC-b.remC);
 const rest=all.filter(p=>p.days>o.hz).sort((a,b)=>o.strat==='small'?a.remC-b.remC:o.strat==='large'?b.remC-a.remC:a.days-b.days);
 const avail=Math.max(0,o.baseC-o.resC);
 const fill=(list,cap)=>{let pool=cap;list.forEach(p=>{if(p.skipped)return;const a=Math.min(p.needC,pool);p.allocC=a;pool-=a});return pool};
 const afterU=fill(urgent,avail);
 const savPart=Math.floor(afterU*o.pct/100);
 const unusedP=fill(rest,afterU-savPart);
 let pool=savPart+unusedP;
 const goals=S.goals.map(g=>({g,shortC:Math.max(0,Math.round(g.target*100)-Math.round(g.saved*100)),allocC:0})).filter(x=>x.shortC>0).sort((a,b)=>a.shortC-b.shortC);
 goals.forEach(x=>{const a=Math.min(x.shortC,pool);x.allocC=a;pool-=a});
 const needC=urgent.filter(p=>!p.skipped).reduce((a,p)=>a+p.needC,0),gotC=urgent.reduce((a,p)=>a+p.allocC,0);
 const inflowC=S.debts.filter(d=>d.kind==='receivable'&&remOf(d)>0&&dd(d.due)<=o.hz).reduce((a,d)=>a+Math.round(remOf(d)*100),0);
 return{urgent,rest,goals,availC:avail,freeC:pool,payC:[...urgent,...rest].reduce((a,p)=>a+p.allocC,0),savC:goals.reduce((a,x)=>a+x.allocC,0),shortC:needC-gotC,inflowC};
}
function calc(S){
 const t=today(),n=new Date(),em=iso(new Date(n.getFullYear(),n.getMonth()+1,0)),mo=t.slice(0,7);
 const bal={};S.wallets.forEach(w=>bal[w.id]=+w.balance);
 let pend=0,spent=0;const cat={};
 S.tx.forEach(x=>{
  if(x.date>t){if(x.date<=em)pend+=x.type==='income'?x.amount:x.type==='expense'?-x.amount:0;return}
  if(x.type==='income'&&x.wallet in bal)bal[x.wallet]+=x.amount;
  else if(x.type==='expense'){if(x.wallet in bal)bal[x.wallet]-=x.amount;if(x.date.startsWith(mo)){spent+=x.amount;cat[x.category]=(cat[x.category]||0)+x.amount}}
  else if(x.type==='transfer'){if(x.wallet in bal)bal[x.wallet]-=x.amount;if(x.to in bal)bal[x.to]+=x.amount}
 });
 let pay=0,rec=0,dPay=0,dRec=0;
 S.debts.forEach(d=>{
  (d.payments||[]).forEach(p=>{if(p.wallet in bal)bal[p.wallet]+=d.kind==='receivable'?p.amount:-p.amount});
  const r=q(d.totalAmount-(d.amountPaid||0));if(r<=0)return;
  if(d.kind==='payable'){pay+=r;if(d.due<=em)dPay+=r}else{rec+=r;if(d.due<=em)dRec+=r}
 });
 const liquid=Object.values(bal).reduce((a,b)=>a+b,0);
 const dim=new Date(n.getFullYear(),n.getMonth()+1,0).getDate(),left=dim-n.getDate();
 const fc=Math.trunc(q(spent)/n.getDate()*left*100+1e-6)/100;
 let allocD=0;S.debts.forEach(d=>{if(d.kind==='payable'){const r=q(d.totalAmount-(d.amountPaid||0));if(r>0)allocD+=Math.min((S.alloc||{})['d:'+d.id]||0,r)}});const sv=q(S.goals.reduce((a,g)=>a+g.saved,0));
 Object.keys(bal).forEach(k=>bal[k]=q(bal[k]));Object.keys(cat).forEach(k=>cat[k]=q(cat[k]));
 return{bal,liquid:q(liquid),pay:q(pay),rec:q(rec),spent:q(spent),cat,pend:q(pend),dPay:q(dPay),dRec:q(dRec),fc,left,projected:q(liquid+pend+dRec-dPay-fc),net:q(liquid+rec-pay),allocD:q(allocD),allocated:q(allocD+sv),spendable:q(liquid-allocD-sv),
  saved:q(S.goals.reduce((a,g)=>a+g.saved,0)),target:q(S.goals.reduce((a,g)=>a+g.target,0))};
}

function Num({v}){const[d,setD]=useState(v);const r=useRef(v);
 useEffect(()=>{const a=r.current,t0=performance.now();let f;const st=t=>{const k=Math.min(1,(t-t0)/800),e=1-Math.pow(1-k,3);r.current=k>=1?v:a+(v-a)*e;setD(r.current);if(k<1)f=requestAnimationFrame(st)};f=requestAnimationFrame(st);return()=>cancelAnimationFrame(f)},[v]);
 return fmt(d)}

const Bar=({pct,h='h-2.5',gray})=>html`<div class=${'w-full rounded-full bg-white/10 overflow-hidden '+h}><${motion.div} class=${'h-full rounded-full '+(gray?'bg-zinc-300/80':'ac-grad ac-glow')} initial=${{width:'0%'}} animate=${{width:Math.max(0,Math.min(100,pct||0))+'%'}} transition=${soft}/></div>`;

function Form({title,fields,init,onSubmit,onDelete,onClose,cta='Save'}){
 const[v,setV]=useState(init);const[err,setErr]=useState('');
 const set=(k,x)=>setV(p=>({...p,[k]:x}));
 const fl=(typeof fields==='function'?fields(v):fields).filter(f=>!f.hide);
 const inp='w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-white/30 transition';
 const go=()=>{const r=onSubmit(v);if(r)setErr(r);else onClose()};
 return html`<${motion.div} class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" initial=${{opacity:0}} animate=${{opacity:1}} exit=${{opacity:0}}>
  <div class="absolute inset-0 bg-black/70 backdrop-blur-md" onClick=${onClose}></div>
  <${motion.div} class="glass relative w-full sm:max-w-md p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] max-h-[92dvh] overflow-y-auto !bg-zinc-950/80 !rounded-b-none sm:!rounded-3xl" initial=${{y:80,opacity:0,scale:.96}} animate=${{y:0,opacity:1,scale:1}} exit=${{y:60,opacity:0,scale:.97}} transition=${spr}>
   <div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold">${title}</h3><${motion.button} whileTap=${{scale:.85}} class="p-1.5 rounded-full bg-white/10" onClick=${onClose}><${Ic} n="x" s=${16}/><//></div>
   <div class="space-y-3">${fl.map(f=>f.t==='tabs'
    ?html`<div key=${f.k} class="grid gap-1 p-1 rounded-2xl bg-white/5" style=${{gridTemplateColumns:'repeat('+f.o.length+',minmax(0,1fr))'}}>${f.o.map(([a,b])=>html`<button key=${a} class=${'relative rounded-xl py-2 text-xs sm:text-sm '+(v[f.k]===a?'':'text-zinc-400')} onClick=${()=>set(f.k,a)}>${v[f.k]===a&&html`<${motion.span} layoutId="qa-tab" class="absolute inset-0 rounded-xl ac-bg ac-glow" transition=${spr}/>`}<span class="relative">${b}</span></button>`)}</div>`
    :f.t==='chips'?html`<div key=${f.k}><span class="text-xs text-zinc-400">${f.l}</span><div class="flex flex-wrap gap-1.5 mt-1">${f.o.map(([a,b])=>{const on=(v[f.k]||[]).includes(a);return html`<button type="button" key=${a} class=${'px-3 py-1.5 rounded-xl text-sm border '+(on?'ac-soft ac-bd text-white':'border-white/10 text-zinc-400')} onClick=${()=>set(f.k,on?v[f.k].filter(y=>y!==a):[...(v[f.k]||[]),a])}>${b}</button>`})}</div></div>`
    :html`<label key=${f.k} class="block"><span class="text-xs text-zinc-400">${f.l}</span>
     ${f.t==='select'?html`<select class=${inp} value=${v[f.k]} onChange=${e=>set(f.k,e.target.value)}>${f.o.map(([a,b])=>html`<option key=${a} value=${a}>${b}</option>`)}</select>`
     :html`<input class=${inp} type=${f.t} inputMode=${f.t==='number'?'decimal':undefined} step=${f.t==='number'?'any':undefined} value=${v[f.k]} placeholder=${f.p||''} onChange=${e=>set(f.k,e.target.value)}/>`}
     ${f.h&&html`<span class="text-xs ac-t flex items-center gap-1 mt-1"><${Ic} n="clock" s=${12}/>${f.h}</span>`}</label>`)}</div>
   ${err&&html`<p class="text-rose-400 text-sm mt-3">${err}</p>`}
   <div class="flex gap-2 mt-5">${onDelete&&html`<${motion.button} whileTap=${{scale:.92}} class="px-4 rounded-xl border border-rose-500/40 text-rose-400" onClick=${()=>{onDelete(v);onClose()}}><${Ic} n="trash" s=${18}/><//>`}
   <${motion.button} whileHover=${{scale:1.02}} whileTap=${{scale:.97}} class="flex-1 rounded-xl py-3 font-semibold ac-grad ac-glow" onClick=${go}>${cta}<//></div>
  <//><//>`;
}

function ResetFlow({onClose,onWipe}){
 const[step,setStep]=useState(1);const[txt,setTxt]=useState('');const ok=txt==='RESET';
 return html`<${motion.div} class="fixed inset-0 z-50 flex items-center justify-center p-4" initial=${{opacity:0}} animate=${{opacity:1}} exit=${{opacity:0}}>
  <div class="absolute inset-0 bg-black/80 backdrop-blur-md" onClick=${onClose}></div>
  <${motion.div} layout class="glass relative w-full max-w-sm p-6 !bg-zinc-950/85 text-center" initial=${{scale:.9,y:30,opacity:0}} animate=${{scale:1,y:0,opacity:1}} exit=${{scale:.94,opacity:0}} transition=${spr}>
   <div class="mx-auto w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mb-3"><${Ic} n="warn" s=${24}/></div>
   <${AnimatePresence} mode="wait" initial=${false}>
   ${step===1?html`<${motion.div} key="s1" initial=${{opacity:0,x:30}} animate=${{opacity:1,x:0}} exit=${{opacity:0,x:-30}} transition=${spr}><h3 class="text-lg font-semibold">Confirm data reset</h3><p class="text-sm text-zinc-400 mt-2">This action permanently deletes all wallets, transactions, payables, receivables, savings goals and history records.</p>
     <div class="flex gap-2 mt-5"><button class="flex-1 py-3 rounded-xl bg-white/10" onClick=${onClose}>Cancel</button><button class="flex-1 py-3 rounded-xl bg-rose-600/80" onClick=${()=>setStep(2)}>Continue</button></div><//>`
    :html`<${motion.div} key="s2" initial=${{opacity:0,x:30}} animate=${{opacity:1,x:0}} exit=${{opacity:0}} transition=${spr}><h3 class="text-lg font-semibold">Authorization required</h3><p class="text-sm text-zinc-400 mt-2">Type <b class="text-white">RESET</b> to enable the final action. This operation cannot be undone.</p>
     <input autoFocus class="w-full mt-4 text-center tracking-widest rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-rose-500/60" value=${txt} onChange=${e=>setTxt(e.target.value)} placeholder="RESET"/>
     <div class="flex gap-2 mt-5"><button class="flex-1 py-3 rounded-xl bg-white/10" onClick=${onClose}>Cancel</button>
     <${motion.button} disabled=${!ok} animate=${{opacity:ok?1:.35,scale:ok?1:.97}} whileTap=${ok?{scale:.95}:{}} transition=${spr} class=${'flex-1 py-3 rounded-xl font-semibold bg-rose-600 '+(ok?'shadow-[0_0_28px_rgba(244,63,94,.7)]':'cursor-not-allowed')} onClick=${()=>{onWipe();onClose()}}>Clear all data<//></div><//>`}
   <//><//><//>`;
}

const Entry=({x,i=0,onEdit,onUndo})=>{const inc=x.type==='income';return html`<${motion.div} layout key=${x.id} initial=${{opacity:0,y:14}} animate=${{opacity:1,y:0}} exit=${{opacity:0,x:40}} transition=${{...spr,delay:Math.min(i,8)*.03}} class="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
  <div class=${'w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center '+(inc?'bg-emerald-500/10 text-emerald-400':x.type==='transfer'?'bg-white/10 text-zinc-300':'bg-rose-500/15 text-rose-400')}><${Ic} n=${inc?'up':x.type==='transfer'?'swap':'down'} s=${18}/></div>
  <div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">${x.title}</div><div class="text-xs text-zinc-500 truncate">${x.sub} · ${fd(x.date)}</div></div>
  <div class=${'text-sm font-semibold '+(inc?'text-emerald-400':'')}>${inc?'+':x.type==='expense'?'−':''}${fmt(x.amount)}</div>
  ${onEdit&&html`<button class="p-1.5 rounded-full bg-white/10 text-zinc-400 shrink-0" aria-label="Edit transaction" onClick=${onEdit}><${Ic} n="pen" s=${14}/></button>`}${onUndo&&html`<button class="text-xs px-3 py-1.5 rounded-full ac-soft ac-bd shrink-0" onClick=${onUndo}>Undo</button>`}<//>`};
const Empty=({t})=>html`<${motion.p} layout initial=${{opacity:0}} animate=${{opacity:1}} class="text-sm text-zinc-500 py-6 text-center">${t}<//>`;
const Stat=({l,v,i,sub,d})=>html`<${motion.div} layout whileHover=${{y:-4,scale:1.015}} initial=${{opacity:0,y:20}} animate=${{opacity:1,y:0}} transition=${{...spr,delay:d*.06}} class="glass p-4 sm:p-5"><div class="flex items-center justify-between text-zinc-400 text-xs sm:text-sm"><span>${l}</span><span class="ac-t"><${Ic} n=${i} s=${18}/></span></div><div class="mt-2 text-xl sm:text-2xl 2xl:text-3xl font-semibold tracking-tight"><${Num} v=${v}/></div><div class="text-[11px] text-zinc-500 mt-1">${sub}</div><//>`;
const Card=({c='',children,d=0})=>html`<${motion.div} layout initial=${{opacity:0,y:20}} animate=${{opacity:1,y:0}} transition=${{...spr,delay:d*.06}} class=${'glass p-5 '+c}>${children}<//>`;


function App(){
 const[S,setS]=useState(load);const[view,setView]=useState('home');const[modal,setModal]=useState(null);const[reset,setReset]=useState(false);const[hist,setHist]=useState({payable:false,receivable:false});const[bx,setBx]=useState({});const tg=(key,v)=>setBx(b=>({...b,[key]:b[key]===v?undefined:v}));const[pl,setPl]=useState({amount:'',reserve:'',hz:'14',strat:'due',save:'20',skip:{}});
 useEffect(()=>{let raf=0,last=window.scrollY,t;const root=document.documentElement;
  const on=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const y=window.scrollY,max=Math.max(1,root.scrollHeight-innerHeight);root.style.setProperty('--sh',String(y/max*100));root.style.setProperty('--v',String(Math.min(1,Math.abs(y-last)/40)));last=y;root.classList.add('scrolling');clearTimeout(t);t=setTimeout(()=>{root.classList.remove('scrolling');root.style.setProperty('--v','0')},180)})};
  on();addEventListener('scroll',on,{passive:true});return()=>removeEventListener('scroll',on)},[]);
 const[sync,setSync]=useState('connecting');
 const R=useRef({ref:null,skip:false,mounted:false,ready:false,t:lt(),sent:0,timer:null,chain:Promise.resolve(),S:null}).current;
 const push=()=>{R.chain=R.chain.then(()=>{const t=R.t;return R.ref.set({t,state:JSON.parse(JSON.stringify(R.S))}).then(()=>{R.sent=Math.max(R.sent,t);setSync('synced')})}).catch(()=>setSync('error'))};
 useEffect(()=>{R.S=S;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  if(!R.mounted){R.mounted=true;return}
  if(R.skip){R.skip=false;return}
  R.t=Date.now();try{localStorage.setItem(KEY+'.t',String(R.t))}catch(e){}
  if(!R.ref||!R.ready)return;
  clearTimeout(R.timer);setSync('saving');R.timer=setTimeout(push,700)},[S]);
 const[user,setUser]=useState(null);const[acct,setAcct]=useState({email:'',pw:'',msg:''});
 const FBon=!!(window.FB&&window.FB.enabled);
 useEffect(()=>{let dead=false,off=()=>{};
  Promise.race([window.fbReady,new Promise(r=>setTimeout(r,8000))]).then(()=>{if(dead)return;if(window.FB&&FB.enabled)off=FB.onAuth(u=>setUser(u?{uid:u.uid,email:u.email}:null));else setSync('local')});
  return()=>{dead=true;off()}},[]);
 useEffect(()=>{R.ref=null;R.ready=false;let un=()=>{};
  if(!user){if(FBon)setSync('local');return}
  setSync('connecting');R.ref=FB.doc('users/'+user.uid+'/budget/main');
  const adopt=d=>{R.skip=true;R.t=d.t;R.sent=d.t;try{localStorage.setItem(KEY+'.t',String(d.t))}catch(e){}setS(fixS(d.state));setSync('synced')};
  un=R.ref.onSnapshot(snap=>{
   if(!snap.exists){R.ready=true;R.t=Math.max(R.t,Date.now());push();return}
   const d=snap.data();if(!d||!d.state)return;
   if(!R.ready){R.ready=true;if(d.t>=R.t)adopt(d);else{push()}return}
   if(d.t>R.sent&&d.t>R.t)adopt(d);else setSync('synced')},()=>setSync('error'));
  return()=>{un()}},[user&&user.uid]);
 const doAuth=async mode=>{try{setAcct(a=>({...a,msg:'Working…'}));if(mode==='google')await FB.google();else if(mode==='up')await FB.signUp(acct.email.trim(),acct.pw);else await FB.signIn(acct.email.trim(),acct.pw);setAcct({email:'',pw:'',msg:''})}catch(e){setAcct(a=>({...a,msg:String(e&&e.message||'Sign-in failed').replace('Firebase: ','')}))}};
 const exportData=()=>{const bl=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download='budget-tracker-backup-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);setAcct(x=>({...x,msg:'Backup exported.'}))};
 const importData=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!d.wallets)throw 0;setS(fixS(d));setAcct(x=>({...x,msg:'Backup imported.'}))}catch(x){setAcct(y=>({...y,msg:'That file is not a valid backup.'}))}};r.readAsText(f);e.target.value=''};
 const C=calc(S);const W=Object.fromEntries(S.wallets.map(w=>[w.id,w]));
 const wopts=S.wallets.map(w=>[w.id,w.name]);const t0=today();
 const upd=(k,fn)=>setS(s=>({...s,[k]:fn(s[k])}));
 const need=a=>!dec(a)||!(+a>0)?'Enter an amount greater than zero with at most two decimal places.':'';
 const hr=new Date().getHours(),greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';

 const quick=x=>{const edit=!!x;setModal({title:edit?'Edit transaction':'Quick Add',cta:edit?'Save changes':'Add entry',
  init:{type:x?x.type:'expense',amount:x?String(x.amount):'',category:x?x.category:'Food',wallet:x?x.wallet:S.wallets[0]?.id,to:x?(x.to||S.wallets[1]?.id):S.wallets[1]?.id,date:x?x.date:t0,note:x?x.note||'':'',party:'',scope:'one',...REP0},
  fields:v=>{const k=v.type,debt=k==='payable'||k==='receivable';const pre=!edit&&v.rep!=='none'&&!ruleErr(v,v.date)?genDates(v.date,mkRule(v)):[];
   return[{k:'type',t:'tabs',o:edit?[['expense','Expense'],['income','Income'],['transfer','Transfer']]:[['expense','Expense'],['income','Income'],['transfer','Transfer'],['payable','Payable'],['receivable','Receivable']]},
   {k:'scope',t:'select',l:'Apply changes to',o:[['one','This entry only'],['future','This and all later entries in the series']],hide:!(edit&&x.series)},
   {k:'amount',t:'number',l:debt?'Total amount (PHP)':'Amount (PHP)',p:'0.00'},
   {k:'party',t:'text',l:'Counterparty / description',p:k==='payable'?'e.g. SPayLater phone':'e.g. Monthly allowance',hide:!debt},
   {k:'category',t:'select',l:debt?'Source / category':'Category',o:(debt?S.sources[k]:CATS[k]).map(c=>[c,c]),hide:k==='transfer'},
   {k:'wallet',t:'select',l:debt?'Default settlement wallet':k==='income'?'Receive into':k==='transfer'?'From wallet':'Pay from',o:wopts},
   {k:'to',t:'select',l:'To wallet',o:wopts,hide:k!=='transfer'},
   {k:'date',t:'date',l:debt?'Due date (first due date if repeating)':edit?'Date':'Date (first date if repeating)',h:!debt&&v.date>t0?'Post-dated entry: recorded as Pending and included in the projection only':''},
   ...(edit?[]:repFields(v,pre)),
   {k:'note',t:'text',l:'Notes',p:'Optional'}]},
  submit:v=>{const e=need(v.amount);if(e)return e;const k=v.type,debt=k==='payable'||k==='receivable',date=v.date||t0;
   if(!v.wallet)return 'Create a wallet before recording entries.';
   if(k==='transfer'&&v.wallet===v.to)return 'Select two different wallets.';
   if(!edit&&k==='expense'&&date<=t0&&Math.round(+v.amount*100)>Math.round(Math.max(0,C.spendable)*100))return 'This exceeds your spendable balance of '+fmt(Math.max(0,C.spendable))+' ('+fmt(C.allocated)+' is allocated). Release funds in the Allocate tab if you need them.';
   if(debt){if(!S.sources[k].length)return 'Create a source first (Pending › Add New Source).';if(!v.party.trim())return 'Enter a counterparty or description.';if(!v.date)return 'A due date is required.'}
   if(edit){const nt={type:k,amount:+v.amount,category:CATS[k].includes(v.category)?v.category:CATS[k][0],date,note:v.note,wallet:v.wallet,to:v.to};
    if(v.scope==='future'&&x.series)upd('tx',a=>a.map(t=>t.id===x.id?{...t,...nt}:(t.series===x.series&&t.date>x.date?{...t,type:nt.type,amount:nt.amount,category:nt.category,note:nt.note,wallet:nt.wallet,to:nt.to}:t)));
    else upd('tx',a=>a.map(t=>t.id===x.id?{...t,...nt}:t));return}
   const re=ruleErr(v,date);if(re)return re;
   const dates=v.rep==='none'?[date]:genDates(date,mkRule(v),121);
   if(!dates.length)return 'No dates match this repeat pattern.';if(dates.length>120)return 'Too many entries (maximum 120). Shorten the repeat range.';
   const n=dates.length,sid=n>1?uid():null,sx=i=>sid?{series:sid,sIdx:i+1,sN:n}:{};
   if(debt){const c=S.sources[k].includes(v.category)?v.category:S.sources[k][0];upd('debts',a=>[...a,...dates.map((dt,i)=>({id:uid(),kind:k,cat:c,party:v.party.trim(),totalAmount:+v.amount,amountPaid:0,payments:[],due:dt,wallet:v.wallet,note:v.note||'',...sx(i)}))]);setView('pending')}
   else{const c=CATS[k].includes(v.category)?v.category:CATS[k][0];upd('tx',a=>[...dates.map((dt,i)=>({id:uid(),type:k,amount:+v.amount,category:c,date:dt,note:v.note,wallet:v.wallet,to:v.to,...sx(i)})),...a])}},
  del:x&&(v=>{if(v&&v.scope==='future'&&x.series)upd('tx',a=>a.filter(t=>!(t.series===x.series&&t.date>=x.date)));else upd('tx',a=>a.filter(t=>t.id!==x.id))})})};
 const wForm=w=>setModal({title:w?'Edit wallet':'New wallet',init:w||{name:'',type:'Bank',balance:''},
  fields:[{k:'name',t:'text',l:'Name',p:'e.g. BPI Savings'},{k:'type',t:'select',l:'Type',o:[['Bank','Bank'],['E-Wallet','E-Wallet'],['Cash','Cash']]},{k:'balance',t:'number',l:'Opening balance'}],
  submit:v=>{if(!v.name.trim())return 'Enter a wallet name.';if(v.balance!==''&&!dec(v.balance,true))return 'Balance must have at most two decimal places.';const o={...v,balance:+v.balance||0};w?upd('wallets',a=>a.map(x=>x.id===w.id?o:x)):upd('wallets',a=>[...a,{...o,id:uid()}])},
  del:w&&(()=>upd('wallets',a=>a.filter(x=>x.id!==w.id)))});
 const dForm=(d,kind,cat)=>{const k=d?d.kind:kind,pd=d?(d.amountPaid||0):0;setModal({title:d?'Edit record':k==='payable'?'New accounts payable':'New accounts receivable',cta:d?'Save changes':'Add record',
  init:d?{...d,cat:dcat(d),note:d.note||'',amount:String(d.totalAmount),scope:'one'}:{kind:k,cat:cat||S.sources[k][0]||'',party:'',amount:'',due:off(7),wallet:S.wallets[0]?.id,note:'',scope:'one',...REP0},
  fields:v=>{const pre=!d&&v.rep!=='none'&&!ruleErr(v,v.due)?genDates(v.due,mkRule(v)):[];return[
   {k:'scope',t:'select',l:'Apply changes to',o:[['one','This record only'],['future','This and all upcoming unpaid records in the series']],hide:!(d&&d.series)},
   {k:'cat',t:'select',l:'Source / category',o:S.sources[k].map(c=>[c,c])},{k:'party',t:'text',l:'Counterparty / description'},
   {k:'amount',t:'number',l:'Total amount',p:'0.00',h:pd>0?(k==='payable'?'Already paid: ':'Already received: ')+fmt(pd)+'. Records with payments cannot be deleted; undo the payments first.':''},
   {k:'due',t:'date',l:d?'Due date':'Due date (first due date if repeating)'},{k:'wallet',t:'select',l:'Default settlement wallet',o:wopts},{k:'note',t:'text',l:'Notes',p:'Optional'},
   ...(d?[]:repFields(v,pre))]},
  submit:v=>{const e=need(v.amount);if(e)return e;if(+v.amount<pd)return 'Total cannot be less than the amount already settled ('+fmt(pd)+').';if(!S.sources[k].length)return 'Create a source first.';if(!v.party.trim())return 'Enter a counterparty name.';if(!v.due)return 'A due date is required.';if(!v.wallet)return 'Create a wallet before recording entries.';
   const re=d?'':ruleErr(v,v.due);if(re)return re;
   const c=S.sources[k].includes(v.cat)?v.cat:S.sources[k][0];const{amount,rep,every,wdays,mdays,until,count,scope,...r}=v;const o={...r,cat:c,totalAmount:+amount};
   if(d){if(scope==='future'&&d.series)upd('debts',a=>a.map(x=>x.id===d.id?{...x,...o,id:d.id,payments:x.payments,amountPaid:x.amountPaid}:(x.series===d.series&&x.due>d.due&&!(x.amountPaid>0)?{...x,cat:c,party:o.party,totalAmount:o.totalAmount,wallet:o.wallet,note:o.note}:x)));
    else upd('debts',a=>a.map(x=>x.id===d.id?{...x,...o,id:d.id,payments:x.payments,amountPaid:x.amountPaid}:x));return}
   const dates=v.rep==='none'?[v.due]:genDates(v.due,mkRule(v),121);
   if(!dates.length)return 'No dates match this repeat pattern.';if(dates.length>120)return 'Too many entries (maximum 120). Shorten the repeat range.';
   const n=dates.length,sid=n>1?uid():null;
   upd('debts',a=>[...a,...dates.map((dt,i)=>({...o,due:dt,id:uid(),payments:[],amountPaid:0,...(sid?{series:sid,sIdx:i+1,sN:n}:{})}))])},
  del:d&&!pd&&(v=>{if(v&&v.scope==='future'&&d.series)upd('debts',a=>a.filter(x=>!(x.series===d.series&&x.due>=d.due&&!(x.amountPaid>0))));else upd('debts',a=>a.filter(x=>x.id!==d.id))})})};
 const sForm=k=>setModal({title:k==='payable'?'New payable source':'New receivable source',cta:'Create source',init:{name:''},fields:[{k:'name',t:'text',l:'Source name',p:'e.g. GCash Loan'}],
  submit:v=>{const n=v.name.trim();if(!n)return 'Enter a source name.';if(S.sources[k].some(x=>x.toLowerCase()===n.toLowerCase()))return 'This source already exists.';setS(s=>({...s,sources:{...s.sources,[k]:[...s.sources[k],n]}}))}});
 const delSrc=(k,c)=>setS(s=>({...s,sources:{...s.sources,[k]:s.sources[k].filter(x=>x!==c)}}));
 const undo=(did,pid)=>setS(s=>{const debts=s.debts.map(x=>x.id===did?wp(x,x.payments.filter(p=>p.id!==pid)):x);const d=debts.find(x=>x.id===did),c=dcat(d);const sr=s.sources[d.kind].includes(c)?s.sources:{...s.sources,[d.kind]:[...s.sources[d.kind],c]};return{...s,debts,sources:sr}});
 const payForm=d=>{const pay=d.kind==='payable',rem=remOf(d);const cashW=S.wallets.find(w=>/^cash/i.test(w.name.trim()))||S.wallets.find(w=>w.type==='Cash');const dw=!pay&&cashW?cashW.id:(W[d.wallet]?d.wallet:S.wallets[0]?.id);setModal({title:pay?'Record payment':'Record receipt',cta:pay?'Confirm payment':'Confirm receipt',init:{amount:String(rem),wallet:dw,auto:'no'},
  fields:v=>[{k:'amount',t:'number',l:pay?'How much are you paying right now?':'How much are you receiving right now?',p:'0.00',h:'Remaining balance: '+fmt(rem)+(effAl(S,d)>0?' · Reserved: '+fmt(effAl(S,d)):'')+(dec(v.amount)&&+v.amount>0&&+v.amount<rem?' · After this: '+fmt(q(rem-+v.amount)):'')},{k:'wallet',t:'select',l:pay?'Pay from wallet':'Receive into wallet',o:wopts},{k:'auto',t:'select',l:'Automatically allocate the received amount?',o:[['no','No, keep it spendable'],['yes','Yes, run the smart plan on it']],hide:pay,h:v.auto==='yes'?'Uses your Allocate tab settings: urgent payables first, then savings goals. Undo it from Allocation history.':''}],
  submit:v=>{const e=need(v.amount);if(e)return e;const a=+v.amount;if(a>rem)return 'Amount exceeds the remaining balance of '+fmt(rem)+'.';if(!v.wallet)return 'Create a wallet before recording entries.';const cap=q(effAl(S,d)+Math.max(0,C.spendable));if(pay&&Math.round(a*100)>Math.round(cap*100))return 'This payment exceeds the funds reserved for this item plus your spendable balance ('+fmt(cap)+'). Release other allocated funds first.';
   setS(s=>{const key='d:'+d.id,nal={...(s.alloc||{})};if(nal[key])nal[key]=q(Math.max(0,nal[key]-a));const n={...s,alloc:nal,debts:s.debts.map(x=>x.id===d.id?wp(x,[...x.payments,{id:uid(),amount:a,wallet:v.wallet,date:today(),ts:Date.now()}]):x)};if(pay||v.auto!=='yes')return n;const bC=Math.min(Math.round(a*100),Math.round(Math.max(0,calc(n).spendable)*100));const P2=makePlan(n,{baseC:bC,resC:0,hz:+pl.hz||0,strat:pl.strat,pct:/^\d{1,3}$/.test(String(pl.save).trim())&&+pl.save<=100?+pl.save:20,skip:{}},t0);const its=[...P2.urgent,...P2.rest].filter(p=>p.allocC>0).map(p=>({t:'d',id:p.d.id,amt:p.allocC/100,name:p.d.party})).concat(P2.goals.filter(x=>x.allocC>0).map(x=>({t:'g',id:x.g.id,amt:x.allocC/100,name:x.g.name})));return its.length?moveAlloc(n,its,1,'apply'):n})}})};
 const gForm=g=>setModal({title:g?'Edit goal':'New savings goal',init:g||{name:'',target:'',saved:''},
  fields:[{k:'name',t:'text',l:'Goal name'},{k:'target',t:'number',l:'Target amount'},{k:'saved',t:'number',l:'Allocated so far'}],
  submit:v=>{const e=need(v.target);if(e)return e;if(!v.name.trim())return 'Enter a goal name.';if(v.saved!==''&&!dec(v.saved))return 'Allocated amount must have at most two decimal places.';const o={...v,target:+v.target,saved:+v.saved||0};g?upd('goals',a=>a.map(x=>x.id===g.id?o:x)):upd('goals',a=>[...a,{...o,id:uid()}])},
  del:g&&(()=>upd('goals',a=>a.filter(x=>x.id!==g.id)))});

 const entries=[...S.tx.filter(x=>x.date<=t0).map(x=>({id:x.id,type:x.type,title:x.note||x.category,sub:x.category+' · '+(W[x.wallet]?.name||'Removed')+(x.type==='transfer'?' → '+(W[x.to]?.name||'?'):''),amount:x.amount,date:x.date,tag:'tx'})),
  ...S.debts.flatMap(d=>(d.payments||[]).map(p=>({id:p.id,did:d.id,type:d.kind==='payable'?'expense':'income',title:(d.kind==='payable'?'Paid · ':'Received · ')+d.party,sub:dcat(d)+' · '+(W[p.wallet]?.name||'Removed'),amount:p.amount,date:p.date,tag:'debt'})))].sort((a,b)=>b.date.localeCompare(a.date));

 const Home=()=>{const cats=Object.entries(C.cat).sort((a,b)=>b[1]-a[1]);const mx=Math.max(C.liquid,C.projected,1);
  return html`<div class="space-y-4 lg:space-y-5">
  <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
   <${Stat} d=${0} l="Net Worth" v=${C.net} i="up" sub="Cash + receivables − payables"/>
   <${Stat} d=${1} l="Liquid Cash" v=${C.liquid} i="wallet" sub=${fmt(C.spendable)+' spendable'}/>
   <${Stat} d=${2} l="Total Payables" v=${C.pay} i="swap" sub=${fmt(C.rec)+' receivable'}/>
   <${Stat} d=${3} l="Monthly Expenses" v=${C.spent} i="down" sub=${C.left+' days left'}/></div>
  <${Card} d=${3}><div class="flex items-center justify-between gap-2"><h3 class="font-semibold">Allocated funds</h3><${motion.button} whileTap=${{scale:.94}} class="text-xs px-3 py-1.5 rounded-full ac-soft ac-bd" onClick=${()=>setView('plan')}>Manage<//></div>
   <div class="grid grid-cols-3 gap-2 mt-3 text-xs"><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Liquid cash</div><div class="text-sm font-semibold mt-1">${fmt(C.liquid)}</div></div><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Allocated</div><div class="text-sm font-semibold mt-1 ac-t">${fmt(C.allocated)}</div></div><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Spendable</div><div class=${'text-sm font-semibold mt-1 '+(C.spendable<0?'text-rose-300':'')}>${fmt(C.spendable)}</div></div></div>
   <div class="mt-3"><${Bar} pct=${C.allocated/Math.max(C.liquid,1)*100} h="h-3"/></div>
   <p class="text-xs text-zinc-500 mt-2">${fmt(C.allocD)} reserved for payables · ${fmt(C.saved)} in savings goals. Allocated money is locked from spending. Release it in Allocate for emergencies.${C.spendable<0?' Allocations currently exceed your cash.':''}</p><//>
  <div class="grid grid-cols-1 xl:grid-cols-5 gap-4 lg:gap-5">
   <${Card} d=${4} c="xl:col-span-3"><h3 class="font-semibold mb-4">End-of-month projection</h3>
    <div class="space-y-4"><div><div class="flex justify-between text-sm mb-1.5"><span class="text-zinc-400">Current balance</span><span><${Num} v=${C.liquid}/></span></div><${Bar} pct=${C.liquid/mx*100} gray=${true} h="h-3"/></div>
    <div><div class="flex justify-between text-sm mb-1.5"><span class="text-zinc-400">Projected balance</span><span class=${'font-semibold '+(C.projected<0?'text-rose-400':'')}><${Num} v=${C.projected}/></span></div><${Bar} pct=${C.projected/mx*100} h="h-3"/></div></div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 text-xs">${[['Pending net',C.pend],['Receivables due',C.dRec],['Payables due',-C.dPay],['Forecast expenses',-C.fc]].map(([a,b])=>html`<div key=${a} class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">${a}</div><div class=${'mt-1 text-sm font-medium '+(b<0?'text-rose-300':'text-emerald-300')}>${(b>0?'+':b<0?'−':'')+fmt(Math.abs(b))}</div></div>`)}</div><//>
   <${Card} d=${5} c="xl:col-span-2"><h3 class="font-semibold mb-4">Spending by category</h3><div class="space-y-3">${cats.length?cats.map(([k,v])=>html`<div key=${k}><div class="flex justify-between text-xs mb-1"><span class="text-zinc-400">${k}</span><span>${fmt(v)}</span></div><${Bar} pct=${v/cats[0][1]*100}/></div>`):html`<${Empty} t="No expenses recorded this month."/>`}</div><//></div>
  <div class="grid grid-cols-1 xl:grid-cols-5 gap-4 lg:gap-5">
   <${Card} d=${6} c="xl:col-span-2"><div class="flex justify-between items-center mb-4"><h3 class="font-semibold">Savings goals</h3><span class="text-xs text-zinc-400">${tr2(C.saved/Math.max(C.target,1)*100)}% overall</span></div>
    <div class="space-y-4">${S.goals.length?S.goals.map(g=>html`<div key=${g.id}><div class="flex justify-between text-sm mb-1.5"><span>${g.name}</span><span class="text-zinc-400">${fmt(g.saved)} / ${fmt(g.target)}</span></div><${Bar} pct=${g.saved/g.target*100}/></div>`):html`<${Empty} t="No savings goals defined."/>`}</div><//>
   <${Card} d=${7} c="xl:col-span-3"><h3 class="font-semibold mb-1">Recent activity</h3><${AnimatePresence} initial=${false}>${entries.slice(0,7).map((x,i)=>html`<${Entry} key=${x.id} x=${x} i=${i} onEdit=${x.tag==='tx'?()=>quick(S.tx.find(t=>t.id===x.id)):null} onUndo=${x.tag==='debt'?()=>undo(x.did,x.id):null}/>`)}<//>${!entries.length&&html`<${Empty} t="No transactions recorded. Use Quick Add to create an entry."/>`}<//></div></div>`};

 const Wallets=()=>html`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"><${AnimatePresence}>${S.wallets.map((w,i)=>html`<${motion.div} layout key=${w.id} whileHover=${{y:-4,scale:1.015}} initial=${{opacity:0,y:24,scale:.95}} animate=${{opacity:1,y:0,scale:1}} exit=${{opacity:0,scale:.85}} transition=${{...spr,delay:i*.05}} class="glass p-5 relative overflow-hidden">
  <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full ac-soft blur-2xl"></div>
  <div class="flex justify-between items-start relative"><div><div class="text-xs ac-t">${w.type}</div><div class="font-semibold text-lg">${w.name}</div></div><${motion.button} whileTap=${{scale:.85}} class="p-2 rounded-full bg-white/10" onClick=${()=>wForm(w)}><${Ic} n="pen" s=${15}/><//></div>
  <div class="text-3xl font-semibold mt-6 relative"><${Num} v=${C.bal[w.id]}/></div><div class="text-xs text-zinc-500 mt-1">${tr2(C.bal[w.id]/Math.max(C.liquid,1)*100)}% of liquid cash</div><//>`)}<//>
  <${motion.button} layout whileHover=${{scale:1.02}} whileTap=${{scale:.97}} class="glass min-h-[170px] flex flex-col items-center justify-center gap-2 text-zinc-400 !border-dashed" onClick=${()=>wForm()}><${Ic} n="plus" s=${28}/>Add wallet<//></div>`;

 const Pend=()=>{const sched=S.tx.filter(x=>x.date>t0).sort((a,b)=>a.date.localeCompare(b.date));
  const sum=l=>q(l.reduce((a,d)=>a+remOf(d),0));
  const active=(k,c)=>S.debts.filter(d=>d.kind===k&&remOf(d)>0&&(c==null||dcat(d)===c)).sort((a,b)=>a.due.localeCompare(b.due));
  const Item=d=>{const od=d.due<t0,paid=d.amountPaid||0,rem=remOf(d),pay=d.kind==='payable';return html`<${motion.div} layout key=${d.id} initial=${{opacity:0,y:16}} animate=${{opacity:1,y:0}} exit=${{opacity:0,x:90,scale:.92,height:0,marginBottom:0}} transition=${spr} class="rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-2 overflow-hidden">
   <div class="flex items-center gap-2 p-3"><div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">${d.party}</div><div class=${'text-xs truncate '+(od?'text-rose-400':'text-zinc-500')}>${od?'Overdue · ':'Due '}${fd(d.due)}${d.series?' · ↻ '+d.sIdx+'/'+d.sN:''}${effAl(S,d)>0?' · Reserved '+fmt(effAl(S,d)):''}${d.note?' · '+d.note:''}</div></div>
    <button class="p-1.5 rounded-full bg-white/10 text-zinc-400 shrink-0" aria-label="Edit record" onClick=${()=>dForm(d)}><${Ic} n="pen" s=${14}/></button>
    <div class="text-right whitespace-nowrap"><div class="text-sm font-semibold">${fmt(rem)}</div>${paid>0&&html`<div class="text-[10px] text-zinc-500">of ${fmt(d.totalAmount)}</div>`}</div>
    <${motion.button} whileHover=${{scale:1.06}} whileTap=${{scale:.92}} class="text-xs px-3 py-1.5 rounded-full ac-bg shrink-0" onClick=${()=>payForm(d)}>${pay?'Pay':'Receive'}<//></div>
   ${paid>0&&html`<div class="px-3 pb-3"><${Bar} pct=${paid/d.totalAmount*100} h="h-1.5"/><div class="flex justify-between text-[10px] text-zinc-500 mt-1"><span>${pay?'Paid ':'Received '}${fmt(paid)}</span><span>Remaining ${fmt(rem)}</span></div></div>`}<//>`};
  const MoreBtn=(key,n)=>html`<${motion.button} layout key=${'m'+key} whileTap=${{scale:.97}} class="w-full mt-1 py-2 rounded-xl bg-white/5 text-xs text-zinc-300 flex items-center justify-center gap-1.5" onClick=${()=>tg(key,'e')}><${Ic} n="chev" s=${14} c=${'transition-transform duration-300 '+(bx[key]==='e'?'rotate-180':'')}/>${bx[key]==='e'?'Show less':'Show all '+n}<//>`;
  const Hpanel=k=>{const rows=S.debts.filter(d=>d.kind===k).flatMap(d=>(d.payments||[]).map(p=>({d,p}))).sort((a,b)=>(b.p.ts||0)-(a.p.ts||0)||b.p.date.localeCompare(a.p.date));
   return html`<${motion.div} key="hist" initial=${{height:0,opacity:0}} animate=${{height:'auto',opacity:1}} exit=${{height:0,opacity:0}} transition=${spr} class="overflow-hidden"><div class="glass p-4"><div class="flex justify-between text-xs uppercase tracking-wider text-zinc-500 mb-2"><span>${k==='payable'?'Payment history':'Receipt history'}</span><span class="normal-case tracking-normal text-zinc-300">${fmt(q(rows.reduce((a,r)=>a+r.p.amount,0)))}</span></div>
    <${AnimatePresence} initial=${false}>${(bx['h'+k]==='e'?rows:rows.slice(0,5)).map(({d,p})=>{const rem=remOf(d);return html`<${motion.div} layout key=${p.id} initial=${{opacity:0}} animate=${{opacity:1}} exit=${{opacity:0,x:-60,height:0}} transition=${spr} class="flex items-center gap-2 py-2.5 border-b border-white/5 last:border-0"><div class="min-w-0 flex-1"><div class="text-sm truncate">${d.party}</div><div class="text-xs text-zinc-500 truncate">${dcat(d)} · ${k==='payable'?'Paid ':'Received '}${fd(p.date)} · ${W[p.wallet]?.name||'Removed'}</div><div class=${'text-[11px] '+(rem===0?'ac-t':'text-zinc-500')}>${rem===0?'Fully settled':'Remaining '+fmt(rem)+' of '+fmt(d.totalAmount)}</div></div><div class="text-sm font-semibold whitespace-nowrap">${fmt(p.amount)}</div>
     <${motion.button} whileHover=${{scale:1.06}} whileTap=${{scale:.92}} class="text-xs px-3 py-1.5 rounded-full ac-soft ac-bd" onClick=${()=>undo(d.id,p.id)}>Undo<//><//>`})}<//>
    ${!rows.length&&html`<${Empty} t="No cleared records."/>`}${rows.length>5&&MoreBtn('h'+k,rows.length)}</div><//>`};
  const Box=(k,c)=>{const g=active(k,c),key='b'+k+c,col=bx[key]==='c',vis=bx[key]==='e'?g:g.slice(0,5);
   return html`<${motion.div} layout key=${'b-'+c} initial=${{opacity:0,y:20,scale:.97}} animate=${{opacity:1,y:0,scale:1}} exit=${{opacity:0,scale:.92}} transition=${spr} class="glass p-4">
    <div class=${'flex items-center justify-between gap-2 '+(col?'':'mb-3')}>
     <button class="min-w-0 flex-1 flex items-center gap-2 text-left" aria-expanded=${!col} aria-label=${(col?'Expand ':'Collapse ')+c} onClick=${()=>tg(key,'c')}><${Ic} n="chev" s=${16} c=${'shrink-0 text-zinc-400 transition-transform duration-300 '+(col?'-rotate-90':'')}/><div class="min-w-0"><div class="font-semibold truncate">${c}</div><div class="text-xs text-zinc-500">${g.length} active · remaining balance</div></div></button>
     <div class="flex items-center gap-2"><div class="text-lg font-semibold whitespace-nowrap">${fmt(sum(g))}</div><${motion.button} whileTap=${{scale:.9}} class="text-xs px-3 py-1.5 rounded-full ac-bg" onClick=${()=>dForm(null,k,c)}>+ Add<//>
     ${!g.length&&!S.debts.some(d=>d.kind===k&&dcat(d)===c)&&html`<button class="p-1.5 rounded-full bg-white/10 text-zinc-400" aria-label="Remove source" onClick=${()=>delSrc(k,c)}><${Ic} n="trash" s=${14}/></button>`}</div></div>
    <${AnimatePresence} initial=${false}>${!col&&html`<${motion.div} key="body" initial=${{height:0,opacity:0}} animate=${{height:'auto',opacity:1}} exit=${{height:0,opacity:0}} transition=${spr} class="overflow-hidden"><${AnimatePresence} initial=${false}>${vis.map(Item)}<//>${!g.length&&html`<${Empty} t="No active items in this source."/>`}${g.length>5&&MoreBtn(key,g.length)}<//>`}<//><//>`};
  const Col=k=>{const pay=k==='payable',L=active(k),over=L.filter(d=>d.due<t0).length;
   return html`<div class="space-y-4"><${Card}>
    <div class="flex items-start justify-between gap-3"><div><h3 class="font-semibold text-lg">${pay?'Accounts Payable':'Accounts Receivable'}</h3><p class="text-xs text-zinc-500 mt-0.5">${pay?'Partial payments are supported. Only the amount you enter is deducted from the selected wallet.':'Partial receipts are supported. Only the amount you enter is added to the selected wallet.'}</p></div>
     <div class="flex flex-col items-end gap-1.5 shrink-0"><${motion.button} whileTap=${{scale:.94}} class=${'text-xs px-3 py-1.5 rounded-full border '+(hist[k]?'ac-soft ac-bd':'border-white/15 text-zinc-300')} onClick=${()=>setHist(h=>({...h,[k]:!h[k]}))}>${hist[k]?'Hide History':'View History'}<//>
     <${motion.button} whileTap=${{scale:.94}} class="text-xs px-3 py-1.5 rounded-full border border-white/15 text-zinc-300" onClick=${()=>setBx(b=>{const n={...b},all=S.sources[k].every(c=>b['b'+k+c]==='c');S.sources[k].forEach(c=>{n['b'+k+c]=all?undefined:'c'});return n})}>${S.sources[k].every(c=>bx['b'+k+c]==='c')?'Expand all':'Collapse all'}<//></div></div>
    <div class="grid grid-cols-2 gap-2 mt-4 text-xs"><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Total outstanding</div><div class="text-sm font-semibold mt-1">${fmt(sum(L))}</div></div><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Overdue records</div><div class=${'text-sm font-semibold mt-1 '+(over?'text-rose-300':'')}>${over}</div></div></div><//>
    <${AnimatePresence} initial=${false}>${hist[k]&&Hpanel(k)}<//>
    <${AnimatePresence} initial=${false}>${S.sources[k].map(c=>Box(k,c))}<//>
    <${motion.button} layout whileHover=${{scale:1.01}} whileTap=${{scale:.98}} class="w-full glass py-4 flex items-center justify-center gap-2 text-sm text-zinc-400 !border-dashed" onClick=${()=>sForm(k)}><${Ic} n="plus" s=${16}/>Add New Source<//></div>`};
  const Sched=()=>html`<${Card}><h3 class="font-semibold mb-1">Scheduled Transactions</h3><p class="text-xs text-zinc-500 mb-2">Post-dated entries are recorded automatically on their effective date.</p><${AnimatePresence} initial=${false}>${sched.map((x,i)=>html`<${motion.div} layout key=${x.id} exit=${{opacity:0,x:40}} class="flex items-center gap-1"><div class="flex-1"><${Entry} x=${{id:x.id,type:x.type,title:x.note||x.category,sub:x.category+' · '+(W[x.wallet]?.name||'Removed')+(x.series?' · ↻ '+x.sIdx+'/'+x.sN:''),amount:x.amount,date:x.date}} i=${i} onEdit=${()=>quick(x)}/></div><button class="p-2 text-zinc-500 hover:text-rose-400" aria-label="Delete scheduled transaction" onClick=${()=>upd('tx',a=>a.filter(y=>y.id!==x.id))}><${Ic} n="trash" s=${16}/></button><//>`)}<//>${!sched.length&&html`<${Empty} t="No scheduled transactions."/>`}<//>`;
  return html`<div class="space-y-5"><div class="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">${Col('payable')}${Col('receivable')}</div>${Sched()}</div>`};

 const Goals=()=>html`<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"><${AnimatePresence}>${S.goals.map((g,i)=>html`<${motion.div} layout key=${g.id} whileHover=${{y:-4}} initial=${{opacity:0,y:24}} animate=${{opacity:1,y:0}} exit=${{opacity:0,scale:.85}} transition=${{...spr,delay:i*.05}} class="glass p-5">
  <div class="flex justify-between"><div class="font-semibold">${g.name}</div><${motion.button} whileTap=${{scale:.85}} class="p-2 rounded-full bg-white/10" onClick=${()=>gForm(g)}><${Ic} n="pen" s=${15}/><//></div>
  <div class="text-3xl font-semibold mt-4">${tr2(g.saved/g.target*100)}%</div><div class="my-3"><${Bar} pct=${g.saved/g.target*100} h="h-3"/></div>
  <div class="flex justify-between text-sm text-zinc-400"><span>${fmt(g.saved)}</span><span>${fmt(g.target)}</span></div>
  <div class="flex gap-2 mt-4">${[500,1000,5000].map(a=>html`<${motion.button} key=${a} whileTap=${{scale:.92}} disabled=${a>C.spendable} class="flex-1 text-xs py-2 rounded-xl ac-soft ac-bd disabled:opacity-40" onClick=${()=>upd('goals',l=>l.map(x=>x.id===g.id?{...x,saved:q(Math.min(x.target,x.saved+a))}:x))}>+${fmt(a)}<//>`)}</div><//>`)}<//>
  <${motion.button} layout whileHover=${{scale:1.02}} whileTap=${{scale:.97}} class="glass min-h-[190px] flex flex-col items-center justify-center gap-2 text-zinc-400 !border-dashed" onClick=${()=>gForm()}><${Ic} n="plus" s=${28}/>New goal<//></div>`;

 const Settings=()=>html`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
  <${Card} d=${0}><h3 class="font-semibold mb-3">Profile</h3><label class="text-xs text-zinc-400">Display name</label>
   <input class="w-full mt-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30" value=${S.name} maxLength=${24} onChange=${e=>setS(s=>({...s,name:e.target.value}))}/>
   <p class="text-xs text-zinc-500 mt-2">Shown in the dashboard greeting.</p><//>
  <${Card} d=${1}><h3 class="font-semibold mb-3">Accent color</h3><div class="flex flex-wrap gap-3">${SW.map(([n,c])=>html`<${motion.button} key=${n} title=${n} whileHover=${{scale:1.15}} whileTap=${{scale:.9}} onClick=${()=>setS(s=>({...s,accent:c}))} class="relative w-10 h-10 rounded-full" style=${{background:`rgb(${c})`,boxShadow:`0 0 18px rgb(${c}/.55)`}}>${S.accent===c&&html`<${motion.span} layoutId="swatch-ring" class="absolute -inset-1.5 rounded-full border-2 border-white/80" transition=${spr}/>`}<//>`)}</div>
   <label class="flex items-center gap-3 mt-4 text-sm text-zinc-400">Custom<input type="color" class="w-12 h-9 rounded-lg bg-transparent border border-white/10" value=${rgb2hex(S.accent)} onInput=${e=>setS(s=>({...s,accent:hex2(e.target.value)}))}/></label><//>
  <${Card} d=${2} c="lg:col-span-2"><h3 class="font-semibold">Account & sync</h3>
   ${!FBon?html`<p class="text-sm text-zinc-400 mt-1">Cloud sync is not configured. Add your Firebase keys to firebase-config.js to turn it on. Your data is saved on this device in the meantime.</p>`
   :user?html`<p class="text-sm text-zinc-400 mt-1">Signed in as <b class="text-white">${user.email}</b>. Your data syncs privately across your devices.</p><${motion.button} whileTap=${{scale:.96}} class="mt-4 px-4 py-2.5 rounded-xl bg-white/10 text-sm" onClick=${()=>FB.signOut()}>Sign out<//>`
   :html`<p class="text-sm text-zinc-400 mt-1">Sign in to sync across your phone and computer.</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"><input class="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30" type="email" autocomplete="email" placeholder="Email" value=${acct.email} onChange=${e=>setAcct(a=>({...a,email:e.target.value}))}/><input class="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30" type="password" autocomplete="current-password" placeholder="Password (6+ characters)" value=${acct.pw} onChange=${e=>setAcct(a=>({...a,pw:e.target.value}))}/></div>
    <div class="flex flex-wrap gap-2 mt-3"><${motion.button} whileTap=${{scale:.96}} class="px-4 py-2.5 rounded-xl ac-bg text-sm font-semibold" onClick=${()=>doAuth('in')}>Sign in<//><${motion.button} whileTap=${{scale:.96}} class="px-4 py-2.5 rounded-xl bg-white/10 text-sm" onClick=${()=>doAuth('up')}>Create account<//><${motion.button} whileTap=${{scale:.96}} class="px-4 py-2.5 rounded-xl bg-white/10 text-sm" onClick=${()=>doAuth('google')}>Google<//></div>`}
   ${acct.msg&&html`<p class="text-sm ac-t mt-3">${acct.msg}</p>`}<//>
  <${Card} d=${3} c="lg:col-span-2"><h3 class="font-semibold">Data Management</h3><p class="text-sm text-zinc-400 mt-1">Export a backup, restore one, or permanently clear all wallets, transactions, payables, receivables, savings goals and history. Display name and appearance settings are retained.</p>
   <div class="flex flex-wrap gap-2 mt-4"><${motion.button} whileTap=${{scale:.96}} class="px-4 py-2.5 rounded-xl bg-white/10 text-sm" onClick=${exportData}>Export backup<//><label class="px-4 py-2.5 rounded-xl bg-white/10 text-sm cursor-pointer">Import backup<input type="file" accept="application/json,.json" class="hidden" onChange=${importData}/></label>
   <${motion.button} whileHover=${{scale:1.03}} whileTap=${{scale:.96}} class="px-4 py-2.5 rounded-xl bg-rose-600/80 text-sm font-semibold" onClick=${()=>setReset(true)}>Clear application data<//></div><//></div>`;

 const Plan=()=>{
  const amtOk=pl.amount===''||dec(pl.amount),resOk=pl.reserve===''||dec(pl.reserve),savOk=/^\d{1,3}$/.test(String(pl.save).trim())&&+pl.save<=100;
  const spC=Math.round(Math.max(0,C.spendable)*100),auto=pl.amount==='';
  const baseC=auto?spC:(amtOk?Math.round(+pl.amount*100):0),resC=resOk&&pl.reserve!==''?Math.round(+pl.reserve*100):0,hz=+pl.hz;
  const PL=makePlan(S,{baseC,resC,hz,strat:pl.strat,pct:savOk?+pl.save:0,skip:pl.skip},t0);
  const M=c=>fmt(c/100),set=k=>e=>setPl(x=>({...x,[k]:e.target.value}));
  const inp='w-full mt-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30';
  const bad=!amtOk?'Amount must have at most two decimal places.':!resOk?'Reserve must have at most two decimal places.':!savOk?'Savings share must be a whole number from 0 to 100.':(!auto&&baseC>spC?'This exceeds your unallocated cash ('+M(spC)+').':'');
  const ins=[];const od=PL.urgent.filter(p=>p.days<0&&!p.skipped);
  if(od.length)ins.push(od.length+' overdue payable'+(od.length>1?'s':'')+' ('+M(od.reduce((a,p)=>a+p.needC,0))+' still to reserve) will be funded first.');
  const nxt=[...PL.urgent,...PL.rest].filter(p=>p.days>=0&&!p.skipped&&p.needC>0).sort((a,b)=>a.days-b.days)[0];
  if(nxt)ins.push('Next due: '+nxt.d.party+' '+(nxt.days===0?'today':'in '+nxt.days+' day'+(nxt.days===1?'':'s'))+'.');
  if(PL.shortC>0)ins.push('You are '+M(PL.shortC)+' short on urgent payables. Skip lower-priority items or wait for pending inflows.');
  if(PL.inflowC>0)ins.push(M(PL.inflowC)+' in receivables is due within your window. Allocate again once it arrives.');
  if(PL.freeC>0)ins.push(M(PL.freeC)+' stays unallocated and remains spendable.');
  if(!ins.length)ins.push('Nothing needs allocating right now.');
  const items=[...PL.urgent,...PL.rest].filter(p=>p.allocC>0).map(p=>({t:'d',id:p.d.id,amt:p.allocC/100,name:p.d.party})).concat(PL.goals.filter(x=>x.allocC>0).map(x=>({t:'g',id:x.g.id,amt:x.allocC/100,name:x.g.name})));
  const can=!bad&&items.length>0;
  const apply=()=>{if(!can)return;setS(s=>moveAlloc(s,items,1,'apply'));setPl(x=>({...x,amount:'',skip:{}}))};
  const undoB=b=>setS(s=>{const n=moveAlloc(s,b.items,b.kind==='apply'?-1:1,null);return{...n,allocLog:s.allocLog.map(x=>x.id===b.id?{...x,undone:true}:x)}});
  const release=e=>setModal({title:'Release allocated funds',cta:'Release to spendable',init:{amount:String(e.amt)},fields:[{k:'amount',t:'number',l:'Amount to release',p:'0.00',h:e.name+' · currently allocated '+fmt(e.amt)}],
   submit:v=>{const er=need(v.amount);if(er)return er;if(Math.round(+v.amount*100)>Math.round(e.amt*100))return 'Cannot release more than '+fmt(e.amt)+'.';setS(s=>moveAlloc(s,[{t:e.t,id:e.id,amt:+v.amount,name:e.name}],-1,'release'))}});
  const row=(p,i)=>{const od=p.days<0,tag=od?'Overdue '+(-p.days)+'d':p.days===0?'Due today':'Due in '+p.days+'d';
   return html`<${motion.div} layout key=${p.d.id} initial=${{opacity:0,y:12}} animate=${{opacity:1,y:0}} exit=${{opacity:0}} transition=${spr} class=${'rounded-2xl border border-white/[0.06] p-3 mb-2 '+(p.skipped?'opacity-50 bg-white/[0.02]':'bg-white/[0.04]')}>
    <div class="flex items-center gap-2"><div class="w-6 h-6 shrink-0 rounded-full ac-soft ac-t text-[11px] flex items-center justify-center">${i+1}</div>
     <div class="min-w-0 flex-1"><div class="text-sm font-medium truncate">${p.d.party}</div><div class="text-xs text-zinc-500 truncate"><span class=${od?'text-rose-400':''}>${tag}</span> · ${dcat(p.d)} · Balance ${M(p.remC)}${p.haveC>0?' · Reserved '+M(p.haveC):''}</div></div>
     <div class="text-right whitespace-nowrap"><div class="text-sm font-semibold ac-t">${p.skipped?'—':'+'+M(p.allocC)}</div><div class="text-[10px] text-zinc-500">${p.skipped?'Skipped':p.needC===0?'Fully reserved':p.allocC===0?'Not funded':p.allocC>=p.needC?'Fully funded':'Still needs '+M(p.needC-p.allocC)}</div></div>
     <button class="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 shrink-0" onClick=${()=>setPl(x=>({...x,skip:{...x.skip,[p.d.id]:!x.skip[p.d.id]}}))}>${p.skipped?'Include':'Skip'}</button></div><//>`};
  const ents=[...S.debts.filter(d=>d.kind==='payable'&&remOf(d)>0&&effAl(S,d)>0).map(d=>({t:'d',id:d.id,name:d.party,sub:'Payable · '+dcat(d)+' · due '+fd(d.due),amt:effAl(S,d)})),...S.goals.filter(g=>g.saved>0).map(g=>({t:'g',id:g.id,name:g.name,sub:'Savings goal',amt:g.saved}))];
  const log=(S.allocLog||[]).slice(0,8),last=log[0]&&!log[0].undone?log[0]:null;
  const lsum=b=>b.items.reduce((a,i)=>a+Math.round(i.amt*100),0);
  return html`<div class="space-y-4">
   <${AnimatePresence} initial=${false}>${last&&html`<${motion.div} key=${last.id} layout initial=${{opacity:0,y:-10}} animate=${{opacity:1,y:0}} exit=${{opacity:0,height:0}} transition=${spr}><div class="glass p-3 flex items-center justify-between gap-3"><div class="text-sm min-w-0">${last.kind==='apply'?'Allocated ':'Released '}<b>${M(lsum(last))}</b> <span class="text-zinc-500">across ${last.items.length} item${last.items.length>1?'s':''}</span></div><${motion.button} whileTap=${{scale:.94}} class="text-xs px-3 py-1.5 rounded-full ac-soft ac-bd shrink-0" onClick=${()=>undoB(last)}>Undo<//></div><//>`}<//>
   <${Card}><h3 class="font-semibold">Funds overview</h3>
    <div class="grid grid-cols-3 gap-2 mt-3 text-xs"><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Liquid cash</div><div class="text-sm sm:text-base font-semibold mt-1">${fmt(C.liquid)}</div></div><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Allocated</div><div class="text-sm sm:text-base font-semibold mt-1 ac-t">${fmt(C.allocated)}</div></div><div class="rounded-2xl bg-white/5 p-3"><div class="text-zinc-500">Spendable</div><div class=${'text-sm sm:text-base font-semibold mt-1 '+(C.spendable<0?'text-rose-300':'')}>${fmt(C.spendable)}</div></div></div>
    <div class="mt-3"><${Bar} pct=${C.allocated/Math.max(C.liquid,1)*100} h="h-3"/></div><//>
   <${Card}><div class="flex items-start justify-between gap-2"><div><h3 class="font-semibold">Smart plan</h3><p class="text-xs text-zinc-500 mt-0.5">Built automatically from your unallocated cash, due dates and goals. Review it, then apply.</p></div><span class="text-[11px] px-2.5 py-1 rounded-full ac-soft ac-t shrink-0">${auto?'Auto · '+M(spC):'Custom amount'}</span></div>
    <ul class="mt-3 space-y-1.5">${ins.map((t,i)=>html`<li key=${i} class="text-sm text-zinc-300 flex gap-2"><span class="ac-t">•</span><span>${t}</span></li>`)}</ul>
    <details class="mt-4"><summary class="text-xs text-zinc-400 cursor-pointer">Adjust plan settings</summary>
     <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      <label class="block"><span class="text-xs text-zinc-400">Amount to allocate (blank = all unallocated cash)</span><input class=${inp} type="number" step="any" inputMode="decimal" placeholder=${'Auto: '+M(spC)} value=${pl.amount} onChange=${set('amount')}/></label>
      <label class="block"><span class="text-xs text-zinc-400">Keep as spendable reserve</span><input class=${inp} type="number" step="any" inputMode="decimal" placeholder="0.00" value=${pl.reserve} onChange=${set('reserve')}/></label>
      <label class="block"><span class="text-xs text-zinc-400">Urgent window</span><select class=${inp} value=${pl.hz} onChange=${set('hz')}><option value="0">Overdue and due today</option><option value="7">Due within 7 days</option><option value="14">Due within 14 days</option><option value="30">Due within 30 days</option></select></label>
      <label class="block"><span class="text-xs text-zinc-400">After urgent bills, % to savings goals</span><input class=${inp} type="number" step="1" inputMode="numeric" value=${pl.save} onChange=${set('save')}/></label>
      <label class="block sm:col-span-2"><span class="text-xs text-zinc-400">Order for other payables</span><select class=${inp} value=${pl.strat} onChange=${set('strat')}><option value="due">Soonest due date first</option><option value="small">Smallest balance first</option><option value="large">Largest balance first</option></select></label></div>
     ${PL.inflowC>0&&html`<button class="mt-3 text-xs px-3 py-1.5 rounded-full bg-white/10" onClick=${()=>setPl(x=>({...x,amount:String(PL.inflowC/100)}))}>Use receivables due in window (${M(PL.inflowC)})</button>`}</details>
    ${bad&&html`<p class="text-rose-400 text-sm mt-3">${bad}</p>`}<//>
   <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">${[['To allocate',PL.availC,''],['To payables',PL.payC,'ac-t'],['To savings',PL.savC,'ac-t'],['Stays spendable',PL.freeC,'']].map(([l,c,t],i)=>html`<${Card} key=${l} d=${i}><div class="text-xs text-zinc-400">${l}</div><div class=${'mt-1 text-lg sm:text-xl font-semibold '+t}>${M(c)}</div><//>`)}</div>
   <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
    <${Card}><h3 class="font-semibold">Payables by priority</h3>
     <div class="text-xs uppercase tracking-wider text-zinc-500 mt-3 mb-2">Urgent · overdue or due within ${pl.hz==='0'?'today':pl.hz+' days'}</div>
     <${AnimatePresence} initial=${false}>${PL.urgent.map(row)}<//>${!PL.urgent.length&&html`<${Empty} t="No urgent payables."/>`}
     <div class="text-xs uppercase tracking-wider text-zinc-500 mt-4 mb-2">Other payables</div>
     <${AnimatePresence} initial=${false}>${PL.rest.map((p,i)=>row(p,PL.urgent.length+i))}<//>${!PL.rest.length&&html`<${Empty} t="No other payables."/>`}<//>
    <${Card}><h3 class="font-semibold">Savings goals</h3><p class="text-xs text-zinc-500 mt-0.5">Goals closest to completion are funded first.</p><div class="mt-3">
     <${AnimatePresence} initial=${false}>${PL.goals.map(x=>html`<${motion.div} layout key=${x.g.id} initial=${{opacity:0,y:12}} animate=${{opacity:1,y:0}} exit=${{opacity:0}} transition=${spr} class="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3 mb-2"><div class="flex items-center justify-between gap-2"><div class="min-w-0"><div class="text-sm font-medium truncate">${x.g.name}</div><div class="text-xs text-zinc-500">Needs ${M(x.shortC)} more</div></div><div class="text-right"><div class="text-sm font-semibold ac-t">+${M(x.allocC)}</div><div class="text-[10px] text-zinc-500">${x.allocC>=x.shortC?'Reaches goal':tr2((x.g.saved+x.allocC/100)/x.g.target*100)+'% after'}</div></div></div><//>`)}<//>${!PL.goals.length&&html`<${Empty} t="No open savings goals."/>`}</div><//></div>
   <${motion.button} disabled=${!can} animate=${{opacity:can?1:.4}} whileTap=${can?{scale:.97}:{}} class="w-full py-3.5 rounded-2xl font-semibold ac-grad ac-glow disabled:cursor-not-allowed" onClick=${apply}>${can?'Apply plan · allocate '+M(PL.payC+PL.savC):'Nothing to apply'}<//>
   <${Card}><h3 class="font-semibold">Allocated funds</h3><p class="text-xs text-zinc-500 mt-0.5">Locked from spending. Release any amount back to spendable cash for an emergency or anything else. Paying a reserved payable uses its reserve first.</p><div class="mt-3">
    <${AnimatePresence} initial=${false}>${ents.map(e=>html`<${motion.div} layout key=${e.t+e.id} initial=${{opacity:0}} animate=${{opacity:1}} exit=${{opacity:0,x:-40}} transition=${spr} class="flex items-center gap-2 py-2.5 border-b border-white/5 last:border-0"><div class="min-w-0 flex-1"><div class="text-sm truncate">${e.name}</div><div class="text-xs text-zinc-500 truncate">${e.sub}</div></div><div class="text-sm font-semibold whitespace-nowrap">${fmt(e.amt)}</div><${motion.button} whileTap=${{scale:.92}} class="text-xs px-3 py-1.5 rounded-full bg-white/10 shrink-0" onClick=${()=>release(e)}>Release<//><//>`)}<//>${!ents.length&&html`<${Empty} t="No funds are allocated yet."/>`}</div><//>
   <${Card}><h3 class="font-semibold">Allocation history</h3><div class="mt-2">
    <${AnimatePresence} initial=${false}>${log.map(b=>html`<${motion.div} layout key=${b.id} initial=${{opacity:0}} animate=${{opacity:b.undone?.5:1}} exit=${{opacity:0}} transition=${spr} class="flex items-center gap-2 py-2.5 border-b border-white/5 last:border-0"><div class="min-w-0 flex-1"><div class="text-sm">${b.kind==='apply'?'Allocated ':'Released '}${M(lsum(b))}</div><div class="text-xs text-zinc-500 truncate">${b.items.map(i=>i.name).join(', ')} · ${new Date(b.ts).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</div></div>${b.undone?html`<span class="text-xs text-zinc-500">Undone</span>`:html`<${motion.button} whileTap=${{scale:.92}} class="text-xs px-3 py-1.5 rounded-full ac-soft ac-bd shrink-0" onClick=${()=>undoB(b)}>Undo<//>`}<//>`)}<//>${!log.length&&html`<${Empty} t="No allocation activity yet."/>`}</div><//></div>`};
 const SY={synced:['Synced','bg-emerald-400'],saving:['Saving…','bg-amber-400'],connecting:['Connecting…','bg-zinc-500'],local:['This device only','bg-zinc-500'],error:['Sync error','bg-rose-500']}[sync];
 const nav=[['home','Home','home',Home],['wallets','Wallets','wallet',Wallets],['pending','Pending','swap',Pend],['plan','Allocate','pie',Plan],['goals','Goals','target',Goals],['settings','Settings','set',Settings]];
 const cur=nav.find(n=>n[0]===view),Page=cur[3];
 const wipe=()=>setS(s=>({name:s.name,accent:s.accent,wallets:[],tx:[],debts:[],goals:[],sources:SRC(),alloc:{},allocLog:[]}));
 const NavBtn=({k,l,i,id,mob})=>html`<button key=${k} title=${l} aria-label=${l} onClick=${()=>setView(k)} class=${'relative '+(mob?'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] ':'w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-3 text-sm ')+(view===k?'text-white':'text-zinc-500 hover:text-zinc-300')}>
  ${view===k&&html`<${motion.span} layoutId=${id} class=${'absolute inset-0 ac-soft ac-bd '+(mob?'rounded-2xl':'rounded-2xl ac-glow')} transition=${spr}/>`}
  <span class=${'relative '+(mob?'':'flex items-center gap-3')}><${Ic} n=${i} s=${mob?20:18} c=${view===k?'ac-t':''}/>${!mob&&html`<span class="hidden lg:inline">${l}</span>`}</span>${mob&&html`<span class="relative">${l}</span>`}</button>`;
 return html`<div class="relative min-h-screen overflow-x-hidden" style=${{'--a':S.accent}}>
  <div class="fixed inset-0 -z-10 bg-black overflow-hidden"><div class="absolute inset-0" style=${{transform:'translate3d(0,calc(var(--sh,0)*-2.4px),0)',willChange:'transform'}}>
   <div class="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full ac-bg opacity-30 blur-[120px]" style=${{animation:'drift 16s ease-in-out infinite'}}></div>
   <div class="absolute top-[38%] right-[8%] w-[340px] h-[340px] rounded-full bg-white opacity-[.07] blur-[110px]" style=${{animation:'drift 22s ease-in-out infinite'}}></div>
   <div class="absolute top-[70%] -left-20 w-[420px] h-[420px] rounded-full ac-bg opacity-20 blur-[130px]" style=${{animation:'drift 19s ease-in-out infinite reverse'}}></div>
   <div class="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full ac-bg opacity-25 blur-[140px]" style=${{animation:'drift 20s ease-in-out infinite reverse'}}></div></div></div>
  <aside class="hidden md:flex fixed left-4 top-4 bottom-4 w-[4.5rem] lg:w-60 glass flex-col p-2 lg:p-4 z-30">
   <div class="flex items-center justify-center lg:justify-start gap-2 px-2 py-3 text-xl font-semibold"><span class="w-3 h-3 rounded-full ac-bg ac-dot shrink-0"></span><span class="hidden lg:inline">Budget Tracker</span></div>
   <nav class="mt-4 space-y-1">${nav.map(([k,l,i])=>NavBtn({k,l,i,id:'nav-side'}))}</nav>
   <${motion.button} whileHover=${{scale:1.03}} whileTap=${{scale:.96}} class="mt-auto flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold ac-grad ac-glow" aria-label="Quick add" onClick=${()=>quick()}><${Ic} n="plus" s=${18}/><span class="hidden lg:inline">Quick Add</span><//></aside>
  <main class="md:ml-[5.5rem] lg:ml-[16rem] px-4 md:px-6 pt-4 pb-28 md:pb-10 min-w-0"><div class="mx-auto w-full max-w-[1400px]">
   <header class="flex items-center justify-between gap-3 mb-5"><div class="min-w-0"><div class="text-xs ac-t">${new Date().toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'})}</div>
    <${AnimatePresence} mode="wait" initial=${false}><${motion.h1} key=${view} initial=${{opacity:0,y:8}} animate=${{opacity:1,y:0}} exit=${{opacity:0,y:-8}} transition=${{duration:.18}} class="text-2xl sm:text-3xl font-semibold tracking-tight">${view==='home'?greet+', '+(S.name.trim()||'there'):cur[1]}<//><//></div>
    <div class="flex items-center gap-2 shrink-0"><div class="flex items-center gap-1.5 text-[11px] text-zinc-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10" title=${sync==='local'?'Sign in (Settings > Account & sync) to sync across devices':'Your data syncs privately to your account'}><span class=${'w-1.5 h-1.5 rounded-full '+SY[1]}></span>${SY[0]}</div><${motion.button} whileHover=${{scale:1.05}} whileTap=${{scale:.95}} class="hidden md:flex items-center gap-2 px-4 py-2.5 glass !rounded-full text-sm" onClick=${()=>quick()}><${Ic} n="plus" s=${16}/>Quick Add<//></div></header>
   <${AnimatePresence} mode="wait"><${motion.div} key=${view} initial=${{opacity:0,y:20,scale:.985,filter:'blur(8px)'}} animate=${{opacity:1,y:0,scale:1,filter:'blur(0px)'}} exit=${{opacity:0,y:-12,scale:.99,filter:'blur(6px)'}} transition=${spr}>${Page()}<//><//></div></main>
  <${motion.button} whileTap=${{scale:.88}} whileHover=${{scale:1.08}} class="md:hidden fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full ac-grad ac-glow flex items-center justify-center" onClick=${()=>quick()} aria-label="Quick add"><${Ic} n="plus" s=${26}/><//>
  <nav class="nav-float md:hidden fixed bottom-3 left-3 right-3 z-30 glass !rounded-3xl flex p-1.5" style=${{marginBottom:'env(safe-area-inset-bottom,0px)'}}>${nav.map(([k,l,i])=>NavBtn({k,l,i,id:'nav-mob',mob:true}))}</nav>
  <${AnimatePresence}>${modal&&html`<${Form} key=${modal.title} title=${modal.title} fields=${modal.fields} init=${modal.init} cta=${modal.cta} onSubmit=${modal.submit} onDelete=${modal.del} onClose=${()=>setModal(null)}/>`}<//>
  <${AnimatePresence}>${reset&&html`<${ResetFlow} key="reset" onClose=${()=>setReset(false)} onWipe=${wipe}/>`}<//></div>`;
}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);
