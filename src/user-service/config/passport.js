const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models/index"); // Import models
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        let user = await db.users.findOne({ where: { googleId: profile.id } });

        if (!user) {
          // Nếu chưa tồn tại, tạo người dùng mới
          user = await db.users.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            full_name: profile.displayName,
            profile_picture: profile.photos[0].value,
            is_verified: true,
            role_id: 3,
            uuid: require("uuid").v4(), // Tạo UUID ngẫu nhiên
            username: `google_${profile.id}`, // Tạo username mặc định
            password: null, // Không cần mật khẩu cho người dùng Google
          });
        }

        // Trả về người dùng
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user (lưu trữ user ID vào session)
passport.serializeUser((user, done) => {
  done(null, user.id); // Chỉ lưu trữ user ID
});

// Deserialize user (lấy lại thông tin user từ ID trong session)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.users.findByPk(id); // Tìm user theo ID
    done(null, user); // Trả về đối tượng user
  } catch (error) {
    done(error, null);
  }
});