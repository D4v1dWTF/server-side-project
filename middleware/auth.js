// Authentication Middleware
// Simple session-based authentication as taught in Lecture 7

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = { isLoggedIn };

