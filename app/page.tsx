'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { score, weights } from '../src/scoring.js';
import { importEventsCsv, exportEventsCsv } from '../src/import.js';

type Player = { id: string; name: string; tag: string; colour: string; price: number; tier: string; points: number; initials: string };
type Event = {id:string;video:string;round?:string;player:string;type:string;verified:boolean;timestampSeconds?:number;note?:string};
type Tab = 'dashboard'|'team'|'market'|'lab';
type RosterState = { ids: string[]; starters: string[]; captain: string; vice: string };

// Fictional preview values; not scraped or claimed to be historical statistics.
const PLAYERS:Player[] = [
  {id:'simon',name:'Miniminter',tag:'SIMON',colour:'#98edc1',price:18.5,tier:'S',points:63,initials:'SM'},
  {id:'vik',name:'Vikkstar123',tag:'VIK',colour:'#b69dff',price:16.5,tier:'S',points:58,initials:'VK'},
  {id:'harry',name:'W2S',tag:'HARRY',colour:'#ffa67f',price:14.5,tier:'A',points:46,initials:'W2'},
  {id:'josh',name:'Zerkaa',tag:'JOSH',colour:'#94caff',price:12.5,tier:'A',points:43,initials:'ZK'},
  {id:'ethan',name:'Behzinga',tag:'ETHAN',colour:'#f0b9f6',price:11,tier:'B',points:35,initials:'BZ'},
  {id:'jj',name:'KSI',tag:'JJ',colour:'#fde58d',price:10,tier:'B',points:30,initials:'KS'},
  {id:'tobi',name:'TBJZL',tag:'TOBI',colour:'#83e4d3',price:8.5,tier:'C',points:27,initials:'TB'},
  {id:'randolph',name:'Randolph',tag:'RANDY',colour:'#ff9cbb',price:7,tier:'C',points:25,initials:'RD'},
  {id:'lazar',name:'LazarBeam',tag:'LAZAR',colour:'#a6baff',price:13,tier:'A',points:45,initials:'LZ'},
  {id:'deji',name:'Deji',tag:'DEJI',colour:'#ffad83',price:8,tier:'C',points:25,initials:'DJ'},
  {id:'ginge',name:'AngryGinge',tag:'GINGE',colour:'#ffc177',price:9,tier:'C',points:29,initials:'AG'},
  {id:'ellum',name:'Ellum',tag:'ELLUM',colour:'#c6b6ff',price:6,tier:'D',points:19,initials:'EL'},
];
const DEFAULT_ROSTER:RosterState = {ids:['simon','vik','harry','josh','ethan','jj','tobi','randolph'],starters:['simon','vik','harry','josh','ethan'],captain:'simon',vice:'vik'};
const KEY='cosmic-draft-demo-v2';
const EVENT_KEY='cosmic-draft-events-v2';
const FORMATTER = new Intl.NumberFormat('en-GB',{minimumFractionDigits:1,maximumFractionDigits:1});

function PixelShip({size=60}:{size?:number}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 56 56" shapeRendering="crispEdges"><rect x="24" y="2" width="8" height="8" fill="#e1ffcf"/><rect x="16" y="10" width="24" height="8" fill="#b4ffe5"/><rect x="12" y="18" width="32" height="8" fill="#73e8ca"/><rect x="8" y="26" width="40" height="8" fill="#6bb4ff"/><rect x="4" y="34" width="48" height="8" fill="#8468cd"/><rect x="12" y="42" width="8" height="8" fill="#f9a8b7"/><rect x="36" y="42" width="8" height="8" fill="#f9a8b7"/><rect x="24" y="18" width="8" height="8" fill="#11192e"/></svg>
}
function SpaceBadge({children,kind='mint'}:{children:React.ReactNode;kind?:'mint'|'amber'|'purple'}) {return <span className={`space-badge ${kind}`}>{children}</span>}
function Avatar({player,large=false}:{player:Player;large?:boolean}) {return <span className={`avatar ${large?'large':''}`} style={{'--avatar-colour':player.colour} as React.CSSProperties}><span>{player.initials}</span><i/></span>}
function Header({tab,setTab}:{tab:Tab;setTab:(tab:Tab)=>void}) {return <header className="topbar"><div className="brand"><span className="brand-icon"><PixelShip size={34}/></span><div className="brand-type"><strong>COSMIC<span> DRAFT</span></strong><small>SIDEMEN AMONG US FANTASY</small></div></div><div className="topbar-right"><span className="live-pill"><span className="signal"/> SEASON 01 <span className="live-muted">/ DEMO</span></span><button className="outline-btn head-btn" onClick={()=>setTab(tab==='lab'?'dashboard':'lab')}>{tab==='lab'?'← BACK TO DRAFT':'⚙ DATA LAB'}</button></div></header>}

export default function Home() {
  const [tab,setTab]=useState<Tab>('dashboard');
  const [roster,setRoster]=useState<RosterState>(DEFAULT_ROSTER);
  const [events,setEvents]=useState<Event[]>([]);
  const [ready,setReady]=useState(false);
  const [query,setQuery]=useState('');
  const [sort,setSort]=useState<'price'|'points'>('price');
  const [notice,setNotice]=useState('');
  const [form,setForm]=useState({video:'example-video-001',round:'1',player:'simon',type:'appearance',timestampSeconds:'',note:''});
  const fileRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    try {
      const saved=localStorage.getItem(KEY);
      if(saved){const parsed=JSON.parse(saved) as RosterState; if(Array.isArray(parsed.ids)&&Array.isArray(parsed.starters)&&typeof parsed.captain==='string'&&typeof parsed.vice==='string')setRoster(parsed)}
      const savedEvents=localStorage.getItem(EVENT_KEY);
      if(savedEvents&&Array.isArray(JSON.parse(savedEvents)))setEvents(JSON.parse(savedEvents));
    }catch { /* Ignore corrupt demo state */ }
    setReady(true);
  },[]);
  useEffect(()=>{if(ready)localStorage.setItem(KEY,JSON.stringify(roster))},[roster,ready]);
  useEffect(()=>{if(ready)localStorage.setItem(EVENT_KEY,JSON.stringify(events))},[events,ready]);

  const owned=PLAYERS.filter(p=>roster.ids.includes(p.id));
  const total=owned.reduce((s,p)=>s+p.price,0);
  const remaining=100-total;
  const picked=roster.starters.filter(id=>roster.ids.includes(id));
  const bench=roster.ids.filter(id=>!picked.includes(id));
  const viewPlayers=PLAYERS.filter(p=>(p.name+' '+p.tag).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='price'?b.price-a.price:b.points-a.points);
  const verifiedTotals=useMemo(()=>score(events),[events]);
  const hasRealEvents=events.some(e=>e.verified);
  const pointsFor=(p:Player)=>hasRealEvents?verifiedTotals[p.id]??0:p.points;
  const currentPoints=picked.reduce((sum,id)=>{const p=PLAYERS.find(p=>p.id===id);if(!p)return sum;return sum+pointsFor(p)*(roster.captain===id?2:1)},0);
  const notify=(s:string)=>setNotice(s);

  function togglePick(id:string) {
    const p=PLAYERS.find(p=>p.id===id);if(!p)return;
    if(roster.ids.includes(id)){
      const ids=roster.ids.filter(x=>x!==id);
      const starters=roster.starters.filter(x=>x!==id);
      const captain=starters.includes(roster.captain)?roster.captain:(starters[0]??'');
      const vice=starters.includes(roster.vice)&&roster.vice!==captain?roster.vice:(starters.find(x=>x!==captain)??'');
      setRoster({ids,starters,captain,vice});
      notify(`${p.name} removed from squad`);return;
    }
    if(roster.ids.length>=8){notify('Squad is full — sell a player first');return;}
    if(total+p.price>100.0001){notify('Not enough budget to sign this player');return;}
    const starters=roster.starters.length<5?[...roster.starters,id]:roster.starters;
    const captain=starters.includes(roster.captain)?roster.captain:(starters[0]??'');
    const vice=starters.includes(roster.vice)&&roster.vice!==captain?roster.vice:(starters.find(x=>x!==captain)??'');
    setRoster({...roster,ids:[...roster.ids,id],starters,captain,vice});
    notify(`${p.name} added to your squad`);
  }
  function toggleStarter(id:string){
    if(!roster.ids.includes(id))return;
    if(picked.includes(id)){
      if(picked.length<=1){notify('Keep at least one starter');return;}
      const starters=picked.filter(x=>x!==id);
      const captain=starters.includes(roster.captain)?roster.captain:(starters[0]??'');
      const vice=starters.includes(roster.vice)&&roster.vice!==captain?roster.vice:(starters.find(x=>x!==captain)??'');
      setRoster({...roster,starters,captain,vice});
    }else{
      if(picked.length>=5){notify('Starting five full — bench a starter first');return;}
      const starters=[...picked,id];
      const captain=starters.includes(roster.captain)?roster.captain:starters[0];
      const vice=starters.includes(roster.vice)&&roster.vice!==captain?roster.vice:(starters.find(x=>x!==captain)??'');
      setRoster({...roster,starters,captain,vice});
    }
  }
  function addEvent(){
    if(!form.video.trim()||!form.player||!form.type){notify('Video, player and event type are required');return;}
    const ts=form.timestampSeconds.trim()===''?undefined:Number(form.timestampSeconds);
    if(ts!==undefined&&(!Number.isFinite(ts)||ts<0)){notify('Timestamp must be a positive number');return;}
    const event:Event={id:`manual-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,video:form.video.trim(),round:form.round.trim()||undefined,player:form.player,type:form.type,verified:true,timestampSeconds:ts,note:form.note.trim()||undefined};
    setEvents(old=>[...old,event]);notify('Verified event added');setForm(f=>({...f,note:'',timestampSeconds:''}));
  }
  async function handleFile(file?:File){
    if(!file)return;
    try{
      const imported=importEventsCsv(await file.text()) as Event[];
      for(const event of imported)if(!Object.hasOwn(weights,event.type))throw new Error(`Unknown event type: ${event.type}`);
      setEvents(old=>{const map=new Map(old.map(e=>[e.id,e]));for(const e of imported)map.set(e.id,e);return [...map.values()]});
      notify(`Imported ${imported.length} event rows`);
    }catch(e){notify(e instanceof Error?e.message:'Invalid CSV file')}
    if(fileRef.current)fileRef.current.value='';
  }
  function downloadCsv(){
    const csv=exportEventsCsv(events);
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='cosmic-draft-events.csv';anchor.click();URL.revokeObjectURL(url);
  }

  return <div className="universe"><div className="stars stars-one"/><div className="stars stars-two"/><div className="planet planet-a"/><div className="planet planet-b"/><div className="frame"><Header tab={tab} setTab={setTab}/>
    <div className="navigation"><nav className="nav-tabs" aria-label="Sections">
      {([['dashboard','⌂','MISSION CTRL'],['team','✦','MY SQUAD'],['market','◈','PLAYER MARKET'],['lab','▤','DATA LAB']] as const).map(([id,sym,label])=><button key={id} type="button" className={`nav-tab ${tab===id?'selected':''}`} onClick={()=>setTab(id)}><span>{sym}</span> {label}</button>)}
    </nav><div className="demo-mark"><span className="pixel-diamond"/> UNVERIFIED DEMO DATA</div></div>
    <main>
      {tab==='dashboard'&&<>
        <section className="hero"><div className="hero-main"><div className="eyebrow"><span className="eyebrow-line"/> YOUR INTERGALACTIC LEAGUE IS READY</div><h1>DRAFT YOUR <em>CREW.</em><br/>RULE THE <span>GALAXY.</span></h1><p>The social-deduction fantasy league. Pick your squad. Back your impostors. Climb the cosmic rankings.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>setTab('team')}>BUILD MY SQUAD <span>↗</span></button><button className="ghost-btn" onClick={()=>setTab('market')}>EXPLORE PLAYERS <span>→</span></button></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-1"/><div className="orbit orbit-2"/><div className="moon-glow"/><div className="moon-disk"><span className="moon-crater crater-1"/><span className="moon-crater crater-2"/><span className="moon-crater crater-3"/><span className="moon-crater crater-4"/></div><div className="floating-ship"><PixelShip size={112}/></div><div className="star-ping s1">✦</div><div className="star-ping s2">✧</div><div className="star-ping s3">+</div><div className="art-tag">// NEW SEASON DETECTED</div></div></section>
        <section className="stat-grid"><div className="stat-box"><div className="stat-heading">YOUR FANTASY SCORE <span>↗</span></div><div className="stat-number neon">{currentPoints}<small> PTS</small></div><div className="stat-sub">{hasRealEvents?'VERIFIED IMPORTED EVENT TOTAL':'FICTIONAL PREVIEW POINTS'}</div></div><div className="stat-box"><div className="stat-heading">SQUAD STATUS <span>◉</span></div><div className="stat-number">{roster.ids.length}<small> / 8</small></div><div className="stat-sub">CREW MEMBERS RECRUITED</div></div><div className="stat-box"><div className="stat-heading">BUDGET REMAINING <span>◎</span></div><div className="stat-number">£{FORMATTER.format(remaining)}<small>M</small></div><div className="stat-sub">FROM £100M STARTING BUDGET</div></div><div className="stat-box"><div className="stat-heading">CAPTAIN'S BRIDGE <span>♛</span></div><div className="stat-captain">{roster.captain?PLAYERS.find(p=>p.id===roster.captain)?.name:'NONE'}</div><div className="stat-sub">2× POINTS MULTIPLIER</div></div></section>
        <div className="section-top"><div><div className="eyebrow">CREW INTEL / <span>SECTOR 07</span></div><h2>TOP OPERATIVES <small>✦</small></h2></div><button className="text-link" onClick={()=>setTab('market')}>VIEW ALL PLAYERS →</button></div>
        <div className="featured-grid">{PLAYERS.slice(0,4).map((p,i)=><div className="operative-card" key={p.id}><div className="operative-top"><SpaceBadge kind={p.tier==='S'?'purple':'mint'}>TIER {p.tier}</SpaceBadge><span className="operative-rank">0{i+1}</span></div><div className="operative-center"><Avatar player={p} large/><div className="operative-name">{p.name}</div><div className="operative-tag">@{p.tag}</div></div><div className="operative-stats"><div><small>DEMO POINTS</small><b>{pointsFor(p)}</b></div><div><small>PRICE</small><b>£{FORMATTER.format(p.price)}m</b></div></div><button className={`card-action ${roster.ids.includes(p.id)?'held':''}`} onClick={()=>togglePick(p.id)}>{roster.ids.includes(p.id)?'✓ IN YOUR CREW':'+ RECRUIT PLAYER'}</button></div>)}</div>
        <div className="bottom-note">⚠ PLAYER PRICES AND SCORES ARE FICTIONAL PLACEHOLDERS — NO HISTORICAL DATA HAS BEEN IMPORTED.</div>
      </>}
      {tab==='team'&&<>
        <div className="page-heading"><div><div className="eyebrow">COMMAND DECK / <span>YOUR CREW</span></div><h1>MY <em>SQUAD.</em></h1><p>8 operatives. 5 starters. One mission to win it all.</p></div><button className="outline-btn" onClick={()=>setTab('market')}>+ PLAYER MARKET</button></div>
        <div className="team-summary"><div><small>OPERATIVES</small><strong>{roster.ids.length}<span> / 8</span></strong></div><div><small>STARTING CREW</small><strong>{picked.length}<span> / 5</span></strong></div><div><small>BUDGET LEFT</small><strong>£{FORMATTER.format(remaining)}<span>M</span></strong></div><div><small>PREVIEW POINTS</small><strong>{currentPoints}<span> PTS</span></strong></div></div>
        <div className="team-area"><div className="pitch-panel"><div className="panel-caption">ACTIVE MISSION CREW <span>05 SLOTS</span></div><div className="pitch-orbit"/><div className="lineup-grid">{Array.from({length:5},(_,i)=>{const p=PLAYERS.find(p=>p.id===picked[i]);return <div className="lineup-slot" key={i}>{p?<><div className="slot-avatar"><Avatar player={p}/>{roster.captain===p.id&&<span className="captain-flag">C</span>}{roster.vice===p.id&&roster.captain!==p.id&&<span className="captain-flag vc">VC</span>}</div><b>{p.name}</b><small>{pointsFor(p)} PTS</small><button className="slot-remove" onClick={()=>toggleStarter(p.id)}>BENCH ↓</button></>:<button className="empty-slot" onClick={()=>setTab('market')}>+<small>ADD PLAYER</small></button>}</div>})}</div><div className="pitch-stars">✦ &nbsp; · &nbsp; + &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; + &nbsp; · &nbsp; ✦</div></div>
        <div className="roster-panel"><div className="panel-caption">SQUAD CONTROLS <span>MANAGE</span></div><div className="roster-list">{owned.map(p=><div className="roster-row" key={p.id}><Avatar player={p}/><div className="roster-identity"><strong>{p.name}</strong><small>£{FORMATTER.format(p.price)}M · {picked.includes(p.id)?'STARTER':'BENCH'}</small></div><div className="roster-actions"><button className={roster.captain===p.id?'active-pill':''} disabled={!picked.includes(p.id)} title="Captain" onClick={()=>setRoster({...roster,captain:p.id,vice:roster.vice===p.id?(picked.find(x=>x!==p.id)??''):roster.vice})}>C</button><button className={roster.vice===p.id?'active-pill secondary-pill':''} disabled={!picked.includes(p.id)} title="Vice-captain" onClick={()=>setRoster({...roster,vice:p.id,captain:roster.captain===p.id?(picked.find(x=>x!==p.id)??''):roster.captain})}>V</button><button className="small-delete" title="Remove" onClick={()=>togglePick(p.id)}>×</button></div></div>)}</div><div className="bench-section"><div className="panel-caption">SUBSTITUTES <span>{bench.length} / 3</span></div><div className="bench-list">{bench.map(id=>{const p=PLAYERS.find(p=>p.id===id)!;return <button className="bench-chip" key={p.id} onClick={()=>toggleStarter(p.id)}>+ {p.name} <span>START ↑</span></button>})}{bench.length===0&&<span className="small-muted">No bench players selected</span>}</div></div></div></div>
        <div className="bottom-note">DEMO ONLY: CAPTAIN AND VICE CAPTAIN MUST BE DIFFERENT STARTERS FOR A VALID GAMEWEEK. DEADLINES AND TRANSFERS ARE NOT IMPLEMENTED.</div>
      </>}
      {tab==='market'&&<><div className="page-heading"><div><div className="eyebrow">RECRUITMENT BAY / <span>PLAYER MARKET</span></div><h1>THE <em>MARKET.</em></h1><p>Recruit your crew without blowing your budget.</p></div><SpaceBadge kind="purple">£{FORMATTER.format(remaining)}M AVAILABLE</SpaceBadge></div><div className="market-tools"><label className="search-box">⌕ <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="SEARCH OPERATIVES..."/></label><div className="market-sort"><button className={sort==='price'?'sort-active':''} onClick={()=>setSort('price')}>PRICE ↓</button><button className={sort==='points'?'sort-active':''} onClick={()=>setSort('points')}>POINTS ↓</button></div></div><div className="market-grid">{viewPlayers.map(p=><div key={p.id} className="market-row"><Avatar player={p}/><div className="market-identity"><strong>{p.name}</strong><small>{p.tag} / TIER {p.tier}</small></div><div className="market-score"><small>DEMO PTS</small><strong>{pointsFor(p)}</strong></div><div className="market-price"><small>PRICE</small><strong>£{FORMATTER.format(p.price)}M</strong></div><button className={`market-pick ${roster.ids.includes(p.id)?'picked':''}`} onClick={()=>togglePick(p.id)}>{roster.ids.includes(p.id)?'− REMOVE':'+ RECRUIT'}</button></div>)}</div><div className="bottom-note">ALL PRICES AND SCORES SHOWN ARE FICTIONAL PREVIEW VALUES.</div></>}
      {tab==='lab'&&<><div className="page-heading"><div><div className="eyebrow">DATA SERVICES / <span>LOCAL PROTOTYPE</span></div><h1>DATA <em>LAB.</em></h1><p>Register gameplay facts manually. Verified events produce fantasy points.</p></div><SpaceBadge kind="amber">LOCAL DEMO · NO AUTH</SpaceBadge></div><div className="lab-grid"><div className="lab-panel"><div className="panel-caption">IMPORT GAMEPLAY EVENTS <span>CSV / MANUAL</span></div><p className="panel-lede">Import a CSV with stable IDs. Duplicates are updated instead of appended. Only verified rows score.</p><div className="lab-buttons"><input type="file" accept=".csv,text/csv" ref={fileRef} hidden onChange={e=>handleFile(e.target.files?.[0])}/><button className="primary-btn small-primary" onClick={()=>fileRef.current?.click()}>↑ IMPORT CSV</button><button className="outline-btn" onClick={downloadCsv}>↓ EXPORT CSV</button></div><div className="lab-label">ADD VERIFIED EVENT</div><label className="field-label">VIDEO IDENTIFIER<input value={form.video} onChange={e=>setForm(f=>({...f,video:e.target.value}))}/></label><div className="form-split"><label className="field-label">ROUND<input value={form.round} onChange={e=>setForm(f=>({...f,round:e.target.value}))}/></label><label className="field-label">TIMESTAMP (SEC)<input inputMode="numeric" value={form.timestampSeconds} onChange={e=>setForm(f=>({...f,timestampSeconds:e.target.value}))} placeholder="OPTIONAL"/></label></div><label className="field-label">PARTICIPANT<select value={form.player} onChange={e=>setForm(f=>({...f,player:e.target.value}))}>{PLAYERS.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label className="field-label">SCORING EVENT<select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{Object.entries(weights).map(([key,points])=><option key={key} value={key}>{key.replaceAll('_',' ').toUpperCase()} ({points>0?'+':''}{points})</option>)}</select></label><label className="field-label">EVIDENCE / NOTES<input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="WHAT HAPPENED?"/></label><button className="primary-btn submit-event" onClick={addEvent}>✓ ADD VERIFIED EVENT</button></div>
      <div className="lab-panel"><div className="panel-caption">EVENT LOG <span>{events.length} EVENTS</span></div><div className="lab-totals"><div><small>VERIFIED</small><b>{events.filter(e=>e.verified).length}</b></div><div><small>PENDING</small><b>{events.filter(e=>!e.verified).length}</b></div><div><small>PARTICIPANTS</small><b>{Object.keys(verifiedTotals).length}</b></div></div><div className="event-list">{[...events].reverse().slice(0,24).map(e=><div className="event-row" key={e.id}><div><strong>{e.type.replaceAll('_',' ').toUpperCase()}</strong><small>{PLAYERS.find(p=>p.id===e.player)?.name??e.player} · {e.video} / R{e.round??'?'}</small></div><div className="event-right"><span className={e.verified?'status-approved':'status-pending'}>{e.verified?'VERIFIED':'PENDING'}</span><button title="Delete local event" onClick={()=>setEvents(old=>old.filter(x=>x.id!==e.id))}>×</button></div></div>)}{events.length===0&&<div className="empty-events"><div>▤</div><strong>NO SIGNAL DETECTED</strong><p>Import a CSV or create a verified event to begin.</p></div>}</div>{events.length>0&&<button className="reset-events" onClick={()=>{if(window.confirm('Clear all local demo events?'))setEvents([])}}>CLEAR ALL LOCAL EVENTS</button>}</div></div><div className="bottom-note">THIS IS A CLIENT-SIDE TEST CONSOLE, NOT A SECURE ADMIN DASHBOARD. IT STORES NO VIDEO FILES AND CALLS NO VIDEO OR AI API.</div></>}
    </main>
    <footer><span>© COSMIC DRAFT / UNOFFICIAL FAN CONCEPT</span><span>MADE FOR THE CREW <span className="footer-spark">✦</span> <span className="footer-version">BUILD 0.2.0</span></span></footer>
  </div>{notice&&<div className="toast" role="status"><span>✦</span> {notice}</div>}</div>
}
