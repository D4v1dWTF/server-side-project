// Authentication Middleware
// Check if user is logged in

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = { isLoggedIn };

