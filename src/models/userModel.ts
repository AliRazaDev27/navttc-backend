import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    // == Fields from Signup Form ==
    
    /**
     * The user's email address.
     * This is the primary identifier for login.
     */
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensures no two users can have the same email
        lowercase: true, // Stores the email in lowercase for consistency
        trim: true, // Removes whitespace from both ends
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'] // Basic email regex
    },

    /**
     * The user's hashed password.
     * NEVER store the plaintext password.
     */
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false // Prevents this field from being returned in queries by default
    },

    // == Derived from 'fullName' Input ==
    
    /**
     * The user's first name.
     * Derived from the 'fullName' input in your application logic.
     */
    firstName: {
        type: String,
        required: true,
        trim: true
    },

    /**
     * The user's last name.
     * Derived from the 'fullName' input in your application logic.
     */
    lastName: {
        type: String,
        required: true,
        trim: true
    },

    // == Default/System-Managed Fields ==

    /**
     * The user's role in the system.
     * Defaults to 'user' on creation.
     */
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'], // Define possible roles
        default: 'user'
    },

    /**
     * Tracks if the user has verified their email address.
     * Defaults to false; set to true after a verification process.
     */
    emailVerified: {
        type: Boolean,
        default: false
    },

    /**
     * Tracks if the user's account is active.
     * Useful for "deactivating" or "banning" users without deleting data.
     */
    isActive: {
        type: Boolean,
        default: true
    },

    // == Optional Password Reset Fields ==

    passwordResetToken: String,
    passwordResetExpires: Date

}, {
    /**
     * Automatically adds 'createdAt' and 'updatedAt' fields.
     * This is a perfect example of default fields.
     */
    timestamps: true
});

// --- Mongoose Middleware (Hook) ---

/**
 * A 'pre-save' hook to automatically hash the password
 * *before* it gets saved to the database.
 */
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next();
    }

    // Hash the password with a cost factor of 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});


export default mongoose.model('User', userSchema);