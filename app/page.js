import ClientWrapper from "./components/ClientWrapper";
async function fetchPokemon() {
 const r=await fetch("https://pokeapi.co/api/v2/pokemon?limit=151",{next:{revalidate:86400}});
 if(!r.ok) throw new Error("PokéAPI is currently unavailable.");
 const list=await r.json();
 return Promise.all(list.results.map(async p=>{const x=await fetch(p.url,{next:{revalidate:86400}});return x.json();}));
}
export default async function Page(){return <ClientWrapper data={await fetchPokemon()}/>;}
