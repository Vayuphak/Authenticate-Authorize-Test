const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Datastore = require('nedb-promises');
const userdb = Datastore.create({ filename: 'User.db', autoload: true });
const userRefreshTokens = Datastore.create({ filename: 'userRefreshTokens.db', autoload: true });
const invalidTokens = Datastore.create({ filename: 'invalidTokens.db', autoload: true });
require('dotenv').config();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

exports.register = async(req,res)=>{
    try{
        const {username,email,password,role} = req.body;
        if(!username || !email|| !password){
           return res.status(422).json({message: "Please fill all the required information"})
        }
    
        const emailexist = await userdb.findOne({ email });
    
        if(emailexist){
            return res.status(409).json({message: "Email already exists"})
        }
    
        const hashpwd = await bcrypt.hash(password,12)
        const newUserData = await userdb.insert({
            username,email,password:hashpwd,role:role ?? "user"
        })
        return res.status(201).json({ message: "User registered successfully" });
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

exports.login = async (req,res)=>{
    try{
        const {email,password} = req.body;
        if( !email|| !password){
           return res.status(422).json({message: "Please fill all the required information"})
        }
       
        const emailexist = await userdb.findOne({ email });
    
        if(!emailexist){
            return res.status(401).json({message: "Email or password is wrong. Please try again"})
        }

        const passwordMatch = await bcrypt.compare(password,emailexist.password)
        if(!passwordMatch){
            return res.status(401).json({message:'Email or password is wrong. Please try again'})
        }
        const accessToken = jwt.sign({id:emailexist._id},accessTokenSecret,{subject:"AccessToken",expiresIn:"30s"})
        const refreshToken = jwt.sign({id:emailexist._id},refreshTokenSecret,{subject:"RefreshToken",expiresIn:"3m"})

        await userRefreshTokens.insert({
            refreshToken,
            userId:emailexist._id
        })
        return res.status(200).json({
            username:emailexist.username,
            email:emailexist.email,
            accessToken,
            refreshToken
            })
    }
    catch(error){
       return res.status(500).json({ message: error.message });
    }
    }
    
  exports.authen = async (req,res,next)=>{
        const accesstoken= req.headers.authorization;
        if(!accesstoken){
            return res.status(401).json({
                message:"Access Token not found"
            })
        }
        if (accesstoken.startsWith('Bearer ')) {
            accesstoken = accesstoken.slice(7, accesstoken.length); 
        }

    
       
        const invalidToken = await invalidTokens.findOne({ accessToken: accesstoken });
    
    
    
        if (invalidToken) {
            return res.status(401).json({
                message: 'Access token invalid',
                code: "AccessTokenInvalid"
            });
        }
        try{
            const decodeAccessToken = jwt.verify(accesstoken,accessTokenSecret)
            req.accessToken = {accesstoken,exp:decodeAccessToken.exp};
            req.user={id:decodeAccessToken.id};
            next();
        }
        catch(error){
            if(error instanceof jwt.TokenExpiredError){
                return res.status(401).json({message:"Access toekn expired",code:'AccessTokenExpired'})
            }
            return res.status(500).json({ message: error.message });
        }
}

exports.authorize = (roles = [])=> {
    return async function (req, res, next) {
        try {
            const user = await userdb.findOne({ _id: req.user.id });
            
            if (!user || (roles.length > 0 && !roles.includes(user.role))) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
}


exports.admin = (req,res)=>{
    return res.status(200).json({message:"This is admin page"});

}

exports.refreshToken  = async (req,res)=>{
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh Token not found" });
        }

      
        const decodedRefreshToken = jwt.verify(refreshToken, refreshTokenSecret);
       

       
        const userRefreshToken = await userRefreshTokens.findOne({
            refreshToken,
            userId: decodedRefreshToken.id
        });
        
        if (!userRefreshToken) {
            return res.status(401).json({ message: "Refresh Token is expired or invalid" });
        }
        console.log(decodedRefreshToken);
    
        await userRefreshTokens.remove({ _id: userRefreshToken._id });

      
        const accessToken = jwt.sign(
            { id: decodedRefreshToken.id },
            accessTokenSecret,
            { subject: "AccessToken", expiresIn: "30s" }
        );

        const newRefreshToken = jwt.sign(
            { id: decodedRefreshToken.id },
            refreshTokenSecret,
            { subject: "RefreshToken", expiresIn: "3m" } 
        );

       
        await userRefreshTokens.insert({
            refreshToken: newRefreshToken,
            userId: decodedRefreshToken.id
        });

        return res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Refresh Token invalid or expired" });
        }
        return res.status(500).json({ message: error.message });
    }
}

exports.logout = async (req,res)=>{
    try{
        await userRefreshTokens.removeMany({userId:req.user.id});
        await invalidTokens.insert({
            accessToken:req.accessToken.accesstoken,
            userId:req.user.id,
            exp:req.accessToken.exp
        })
        return res.status(200).send();
    }
    catch(error){
        res.status(500).json({message:error.message})
    }
}

exports.userapi = async (req,res)=>{
    try{

        const userinfo = await userdb.findOne({_id:req.user.id})
        return res.status(200).json({username:userinfo.username,email:userinfo.email})
       }
       catch(error){
         return res.status(500).json({ message: error.message });
       }
}
