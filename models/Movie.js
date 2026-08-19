const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Romance', 'Animation', 'Adventure']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  posterUrl: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  year: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    default: ''
  },
  director: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search
movieSchema.index({ title: 'text', description: 'text', genre: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
