const mongoose = require('mongoose')
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    userCode: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
            },
            message: props => `${props.value} is not a strong password!`
        }
    },
    email: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, 'אימייל לא תקין']
    },
    img: {
        type: String
    },
    userStatus: {
        type: Boolean,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "manager"],
        default: "user"
    }
}
)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema)
module.exports=User