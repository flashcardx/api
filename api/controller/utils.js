function requireLogin (req, res, next) {
  if (!req.user) {
    res.json({success:false, msg:"you are not logged in"});
  } else {
    next();
  }
};

module.exports = {
    requireLogin: requireLogin
};
