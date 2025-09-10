// src/services/provider.themealdb.js
const API = "https://www.themealdb.com/api/json/v1/1";
const HOUR = 60 * 60 * 1000;

/* ---- tiny cache ---- */
function cacheGet(k){try{const r=localStorage.getItem(k);if(!r)return null;const{t,v}=JSON.parse(r);return Date.now()-t>HOUR?null:v}catch{return null}}
function cacheSet(k,v){try{localStorage.setItem(k,JSON.stringify({t:Date.now(),v}))}catch{}}
async function safeJSON(url){try{const r=await fetch(url);if(!r.ok)return null;return await r.json()}catch{return null}}

function map(meal){
  const ings=[];
  for(let i=1;i<=20;i++){const n=meal[`strIngredient${i}`];const m=meal[`strMeasure${i}`]; if(n) ings.push(m?`${n} ${m}`.trim():n);}
  return {
    id:meal.idMeal,
    title:meal.strMeal,
    description:[meal.strArea,meal.strCategory].filter(Boolean).join(" • "),
    ingredients:ings,
    category:(meal.strCategory||"side").toLowerCase(),
    calories:0,protein:0,fat:0,carbs:0,
    steps:meal.strInstructions?meal.strInstructions.split(/\r?\n/).filter(Boolean):[],
    image:meal.strMealThumb,
    rating:4.6,likes:0,commentsCount:0,
    sourceUrl:meal.strSource||meal.strYoutube||"",
    createdAt:Date.now()
  };
}

/* ---------- Random 1 ---------- */
export async function randomOne(){
  const rnd=await safeJSON(`${API}/random.php`);
  const meal=rnd?.meals?.[0];
  if(meal) return map(meal);

  // запасной вариант: возьмём что-то из десертов
  const list=await safeJSON(`${API}/filter.php?c=Dessert`);
  const items=list?.meals||[];
  if(!items.length) return null;
  const pick=items[Math.floor(Math.random()*items.length)];
  const full=await safeJSON(`${API}/lookup.php?i=${pick.idMeal}`);
  const m=full?.meals?.[0];
  return m?map(m):null;
}

/* ---------- Random 5 (fresh: без кэша) ---------- */
export async function randomFive(fresh=false){
  const KEY="tmdb:random5";
  if(!fresh){
    const c=cacheGet(KEY); if(c) return c;
  }

  const rnd=await Promise.all(Array.from({length:5}).map(()=>safeJSON(`${API}/random.php`)));
  const m1=rnd.flatMap(x=>x?.meals||[]);
  if(m1.length>=3){ const out=m1.slice(0,5).map(map); if(!fresh) cacheSet(KEY,out); return out;}

  const letters=["a","b","c","d","p","s"];
  const letterData=await Promise.all(letters.map(l=>safeJSON(`${API}/search.php?f=${l}`)));
  const m2=letterData.flatMap(x=>x?.meals||[]);
  if(m2.length){ const out=m2.sort(()=>Math.random()-0.5).slice(0,5).map(map); if(!fresh) cacheSet(KEY,out); return out;}

  const cat=await safeJSON(`${API}/filter.php?c=Dessert`);
  const short=cat?.meals?.slice(0,5)||[];
  const full=await Promise.all(short.map(m=>safeJSON(`${API}/lookup.php?i=${m.idMeal}`)));
  const m3=full.flatMap(x=>x?.meals||[]);
  const out=m3.map(map);
  if(out.length && !fresh) cacheSet(KEY,out);
  return out;
}

/* ---------- Search (оставил кэш) ---------- */
export async function searchTheMealDB({q="",include=[],exclude=[]}){
  const key=`tmdb:search:${q}|${include.join(",")}|${exclude.join(",")}`;
  const cached=cacheGet(key); if(cached) return cached;

  const search=await safeJSON(`${API}/search.php?s=${encodeURIComponent(q)}`);
  let byName=search?.meals||[]; if(!byName.length&&!q) byName=[];

  let pool=byName;
  if(include.length){
    const byIng=await Promise.all(include.map(ing=>safeJSON(`${API}/filter.php?i=${encodeURIComponent(ing)}`)));
    const idSet=new Set(byIng.flatMap(s=>(s?.meals||[]).map(m=>m.idMeal)));
    pool=byName.filter(m=>idSet.has(m.idMeal));
  }

  const full=await Promise.all(pool.map(m=>safeJSON(`${API}/lookup.php?i=${m.idMeal}`)));
  const meals=full.flatMap(x=>x?.meals||[]).filter(meal=>{
    if(!exclude.length) return true;
    const bag=Array.from({length:20},(_,i)=>(meal[`strIngredient${i+1}`]||"").toLowerCase()).join(" ");
    return !exclude.some(ex=>bag.includes(ex.toLowerCase()));
  });

  const out=meals.map(map); cacheSet(key,out); return out;
}

/* ---------- Showcase (по 1 рецепту на каждую группу) ---------- */
const SHOWCASE = [
  { key:"salad",      hintQ:["salad"],             cat:null },
  { key:"meat",       hintQ:[],                    cat:["Beef","Chicken","Pork","Lamb"] },
  { key:"side",       hintQ:[],                    cat:["Side"] },
  { key:"yogurt",     hintQ:["yogurt"],            cat:null },
  { key:"dessert",    hintQ:[],                    cat:["Dessert"] },
  { key:"soup",       hintQ:["soup"],              cat:null },
  { key:"fish",       hintQ:[],                    cat:["Seafood"] },
  { key:"drink",      hintQ:["shake","milkshake"], cat:["Miscellaneous"] },
  { key:"sauce",      hintQ:["sauce"],             cat:null },
  { key:"breakfast",  hintQ:[],                    cat:["Breakfast"] },
];

async function oneFromCategory(cat){
  const list=await safeJSON(`${API}/filter.php?c=${encodeURIComponent(cat)}`);
  const items=list?.meals||[];
  if(!items.length) return null;
  const pick=items[Math.floor(Math.random()*items.length)];
  const full=await safeJSON(`${API}/lookup.php?i=${pick.idMeal}`);
  const meal=full?.meals?.[0]; return meal?map(meal):null;
}
async function oneByQuery(q){
  const s=await safeJSON(`${API}/search.php?s=${encodeURIComponent(q)}`);
  const items=s?.meals||[];
  if(!items.length) return null;
  const meal=items[Math.floor(Math.random()*items.length)];
  return map(meal);
}

export async function showcaseSamples(fresh=false){
  const KEY="tmdb:showcase:v2";
  if(!fresh){
    const c=cacheGet(KEY); if(c) return c;
  }

  const out=[];
  for(const spec of SHOWCASE){
    let got=null;
    if(spec.cat){
      for(const cName of spec.cat){ got=await oneFromCategory(cName); if(got) break; }
    }
    if(!got && spec.hintQ?.length){
      for(const q of spec.hintQ){ got=await oneByQuery(q); if(got) break; }
    }
    if(!got) got=await randomOne();
    if(got) out.push({ group: spec.key, ...got });
  }
  if(!fresh) cacheSet(KEY,out);
  return out;
}
