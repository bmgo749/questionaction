// Global deployment configuration - No secrets required
module.exports = {
  database: {
    url: 'postgresql://queit_user:strong_password_123@db-postgresql-sgp1-47891-do-user-16486936-0.c.db.ondigitalocean.com:25060/queit_db?sslmode=require',
    ssl: true,
    global: true
  },
  session: {
    secret: 'super_secret_session_key_for_production_use_only_2025'
  },
  oauth: {
    google: {
      clientId: '693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com',
      clientSecret: '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'
    },
    discord: {
      clientId: '1344311791177564202',
      clientSecret: 'RuT-QizmyKCAJ_eaUyPEJActwst8Ws32'
    }
  },
  email: {
    user: 'bmgobmgo749@gmail.com',
    password: 'uxujqtkuhldurifo'
  },
  vercel: {
    token: 'Eh21Bq1332cmFI2pKOqLVueG',
    orgId: 'team_m9qh00IACWJhdRUEimwit93n',
    projectId: 'prj_sPnN4A76B6NnWF8DaUmahsQimNX7'
  }
};