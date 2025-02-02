const axios =require("axios");
const routes = {
    register : async (info)=>{
        try{
            const res = await axios({
                method:"POST",
                url:"http://localhost:2000/api/register",
                data:  info
            });
            return res;
        }
        catch(error){   
            return error;
        }
    },

    login: async (info) =>{
        try{
            const res = await axios({
                method:"POST",
                url:"http://localhost:2000/api/login",
                data:info
            })
            return res;
        }
        catch(error){
            return error;
        }
    },

    userapi: async (info)=>{
        try{
            const res = await axios({
                method:"GET",
                url:"http://localhost:2000/api/userapi",
               
                headers: {
                   Authorization: info
               }
            })
            return res;
        }
        catch(error){
            return error
        }
    },

    admin: async(info)=>{
        try{
            const res = await axios({
                method:"GET",
                url:"http://localhost:2000/api/admin",
                headers: {
                    Authorization: info
                }
            });
            return res;
        }
        catch(error){
            return error;
        }
   },

   refresh: async(info)=>{
        try{
            const res= await axios({
                method:"POST",
                url:"http://localhost:2000/api/refreshtoken",
                data:info
            })
            return res;
        }
        catch(error){
            console.log("The error is: ",error)
            return error;
        }
   } ,

   logout: async(info)=>{
    try{
        const res = await axios({
            method:"POST",
            url:"http://localhost:2000/api/logout",
            headers: {
                Authorization: info
            }      
        })
        return res;
    }
    catch(error){
        return error;
    }
   }
};
module.exports = routes;