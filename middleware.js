module.exports.isloggedIn = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        req.session.originalUrl = req.originalUrl;
        
        req.flash("error", "You must be signed in!");
        return res.redirect('/login');
    }
    next();
}

module.exports.saveOriginalUrl= (req,res,next)=>{
    if(req.session.originalUrl){
        res.locals.originalUrl = req.session.originalUrl;
    }
    next();
}