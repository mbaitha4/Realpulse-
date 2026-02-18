import clientPromise from "../lib/mongodb.js";

export default async function handler(req,res){

const API_KEY = process.env.GNEWS_API_KEY;
const client = await clientPromise;
const db = client.db("realpulse");

const categories=["general","nation","business","technology","sports","miscellaneous"];
const langs=["en","hi"];

for(const lang of langs){
for(const category of categories){

const response=await fetch(
`https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${API_KEY}`
);

const data=await response.json();

if(data.articles){
for(const article of data.articles){
await db.collection("articles").updateOne(
{ url: article.url },
{ $set: { ...article, category, lang } },
{ upsert:true }
);
}
}
}
}

res.status(200).json({message:"Fetched"});
}
