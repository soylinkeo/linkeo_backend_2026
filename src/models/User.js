// src/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ["user"] },
    refreshWhitelist: { type: [String], default: [] },
    status: { 
  type: String, 
  enum: ["pending", "active", "blocked"], 
  default: "pending" 
},

    // relación 1–a–1 con Profile
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", unique: true, sparse: true },
  },
  { timestamps: true }
);

// (opcional) al eliminar un user, eliminar su profile
UserSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter()).select("profile").lean();
  if (doc?.profile) {
    await mongoose.model("Profile").findByIdAndDelete(doc.profile).catch(() => {});
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);