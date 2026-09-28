const express=require('express');
const pool=require('../config/db');
const {auth,role}=require('../middleware/auth');
const router=express.Router();

router.get('/dashboard',auth,role('owner'),async(req,res)=>{
  try{
    const [stores]=await pool.query('SELECT id,name,address FROM stores WHERE owner_id=?',[req.user.id]);
    const result=[];
    for(const store of stores){
      const [[avg]]=await pool.query('SELECT ROUND(COALESCE(AVG(rating),0),2) average FROM ratings WHERE store_id=?',[store.id]);
      const [users]=await pool.query(`SELECT u.name,u.email,u.address,r.rating FROM ratings r JOIN users u ON u.id=r.user_id WHERE r.store_id=? ORDER BY u.name`,[store.id]);
      result.push({...store,average_rating:avg.average,users});
    }
    res.json(result);
  }catch(err){res.status(500).json({message:err.message});}
});
module.exports=router;
