module.exports = {
  isAuthenticated: (req, res, next) => {
    if (!req.session.currentUser) {
      res.redirect("/login");
      return;
    }

    next();
  },

  setAuthUserVar: (req, res, next) => {
    res.locals.authUser = null;

    if (req.session.user) {
      res.locals.authUser = req.session.currentUser;
    }

    next();
  },
};
