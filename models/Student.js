import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: String,
  grade: String,
  school: String,
  subjects: [String],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);