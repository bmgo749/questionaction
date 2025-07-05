import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { storage } from './storage';
import { CONFIG } from './config';
import type { UpsertUser } from '@shared/schema';

// Initialize passport with hardcoded OAuth strategies from config - NO SECRETS NEEDED

if (CONFIG.GOOGLE_CLIENT_ID && CONFIG.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: CONFIG.GOOGLE_CLIENT_ID,
        clientSecret: CONFIG.GOOGLE_CLIENT_SECRET,
        callbackURL: CONFIG.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userData: UpsertUser = {
            id: `google_${profile.id}`,
            email: profile.emails?.[0]?.value || null,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
            provider: 'google',
          };

          const user = await storage.upsertUser(userData);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

if (CONFIG.DISCORD_CLIENT_ID && CONFIG.DISCORD_CLIENT_SECRET) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: CONFIG.DISCORD_CLIENT_ID,
        clientSecret: CONFIG.DISCORD_CLIENT_SECRET,
        callbackURL: CONFIG.DISCORD_CALLBACK_URL,
        scope: ['identify', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userData: UpsertUser = {
            id: `discord_${profile.id}`,
            email: profile.email || null,
            firstName: profile.username || null,
            lastName: profile.discriminator || null,
            profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
            provider: 'discord',
          };

          const user = await storage.upsertUser(userData);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as any);
});

export { passport };