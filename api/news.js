export default async function handler(req,res){

const {page=1,category="general"}=req.query;
const API_KEY=process.env.GNEWS_API_KEY;

try{

const response=await fetch(
`https://gnews.io/api/v4/top-headlines?category=${category}&country=in&max=10&page=${page}&apikey=${API_KEY}`
);

const data=await response.json();

res.status(200).json(data);

}catch(err){
res.status(500).json({error:"Failed"});
}

}
