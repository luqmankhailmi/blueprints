const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        const avatarUrl = profile.photos[0]?.value;

        // Check if user exists
        let result = await pool.query(
          'SELECT * FROM users WHERE google_id = $1 OR email = $2',
          [googleId, email]
        );

        let user;

        if (result.rows.length === 0) {
          // Create new user
          result = await pool.query(
            'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [googleId, email, name, avatarUrl]
          );
          user = result.rows[0];
        } else {
          // Update existing user with Google ID if not set
          user = result.rows[0];
          if (!user.google_id) {
            await pool.query(
              'UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3',
              [googleId, avatarUrl, user.id]
            );
            user.google_id = googleId;
            user.avatar_url = avatarUrl;
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
